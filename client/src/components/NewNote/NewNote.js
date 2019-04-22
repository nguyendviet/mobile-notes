import React, { Component } from "react";
import { Form, FormGroup, Label, Input } from "reactstrap";
import { API, Auth } from 'aws-amplify';
import LoaderBtn from "../LoaderBtn";
import config from "../../lib/aws-variables";
import { s3Upload } from "../../lib/awsLib";
import "./NewNote.css";

export default class NewNote extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            isLoading: null,
            content: "",
            username: "",
            token: ""
        };
    }

    async componentDidMount() {
        // Get the current user token and user name from Cognito
        Auth.currentAuthenticatedUser().then((res) => {
            const username = res.username;
            const token = res.signInUserSession.idToken.jwtToken;
            this.setState({
                username: username, 
                token: token
            });
        });
    }

    validateForm() {
        return this.state.content.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleFileChange = event => {
        this.file = event.target.files[0];
    }

    handleSubmit = async event => {
        event.preventDefault();
      
        if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
            alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
            return;
        }
      
        this.setState({ isLoading: true });
      
        try {
            const attachment = this.file
                ? await s3Upload(this.file)
                : null;
        
            await this.createNote({
                attachment,
                content: this.state.content
            });
            this.props.history.push("/");
        } 
        catch (e) {
            alert(e);
            this.setState({ isLoading: false });
        }
    }  

    createNote(content) {
        return API.post("notes", "/notes/{noteid}", {
            headers: {
                "Authorization": this.state.token
            },
            body: {
                userid: this.state.username,
                noteid: "new",
                content: content
            }
        });
    }

    render() {
        return (
            <div className="NewNote">
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Input
                            type="textarea" name="content" id="content"
                            value={this.state.content}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="file">Attachment</Label>
                        <Input
                            type="file" name="file" id="file" 
                            onChange={this.handleFileChange}
                        />
                    </FormGroup>
                    <LoaderBtn
                        block
                        bsstyle="primary"
                        bssize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Create"
                        loadingText="Creating…"
                    />
                </Form>
            </div>
        );
    }
}
