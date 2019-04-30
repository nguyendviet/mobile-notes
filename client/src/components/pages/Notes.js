import React, { Component } from "react";
import { API, Auth, Storage } from "aws-amplify";
import {Form, FormGroup, Input, Label} from "reactstrap";
import moment from "moment";
import { s3Upload } from "../../lib/awsLib";
import LoaderBtn from '../LoaderBtn';
import config from '../../lib/aws-variables';
import './Notes.css';

export default class Notes extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            isLoading: null,
            isDeleting: null,
            note: null,
            content: "",
            attachmentURL: null
        };          
    }

    async componentDidMount() {
        try {
            let attachmentURL;
            const data = await this.getNote();
            const note = data.Item;
            const { content, attachment } = note;

            if (attachment) {
                attachmentURL = await Storage.vault.get(attachment);
            }

            this.setState({
                note,
                content,
                attachmentURL
            });
        } 
        catch (e) {
            console.log(e);
        }
    }

    async getNote() {
        const auth = await Auth.currentAuthenticatedUser();
        const userid = auth.username;
        const token = auth.signInUserSession.idToken.jwtToken;
        const noteid = this.props.match.params.id;

        return API.get("notes", `/notes/${noteid}/`, {
            headers: {
                "Authorization": token
            },
            queryStringParameters: {userid: userid},
            pathParameters: {noteid: noteid}
        });
    }

    validateForm() {
        return this.state.content.length > 0;
    }
    
    formatFilename(str) {
        return str.replace(/^\w+-/, "");
    }
    
    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    
    handleFileChange = event => {
        this.file = event.target.files[0];
    }
    
    async saveNote(note) {
        const auth = await Auth.currentAuthenticatedUser();
        const userid = auth.username;
        const token = auth.signInUserSession.idToken.jwtToken;
        const noteid = this.props.match.params.id;

        return API.put("notes", `/notes/{noteid}`, {
            headers: {
                "Authorization": token
            },
            body: {
                userid: userid,
                noteid: noteid,
                content: note.content,
                attachment: note.attachment,
                createdAt: this.state.note.createdAt,
                editedAt: moment().utc().format()
            }
        });
    }
    
    handleSubmit = async event => {
        let attachment;
        
        event.preventDefault();
        
        if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
            alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
            return;
        }
        
        this.setState({ isLoading: true });
        
        try {
            if (this.file) {
                attachment = await s3Upload(this.file);
            }
        
            await this.saveNote({
                content: this.state.content,
                attachment: attachment || this.state.note.attachment
            });
            this.props.history.push("/");
        } 
        catch (e) {
            alert(e);
            this.setState({ isLoading: false });
        }
    }
    
    async deleteNote() {
        const auth = await Auth.currentAuthenticatedUser();
        const userid = auth.username;
        const token = auth.signInUserSession.idToken.jwtToken;
        const noteid = this.props.match.params.id;

        return API.del("notes", `/notes/${noteid}/`, {
            headers: {
                "Authorization": token
            },
            queryStringParameters: {userid: userid},
            pathParameters: {noteid: noteid}
        });
    }
    
    handleDelete = async event => {
        event.preventDefault();
        
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );
        
        if (!confirmed) {
            return;
        }
        
        this.setState({ isDeleting: true });
        
        try {
            await this.deleteNote();
            this.props.history.push("/");
        } catch (e) {
            alert(e);
            this.setState({ isDeleting: false });
        }
    }
      
    
    render() {
        return (
            <div className="Notes">
                {this.state.note &&
                <Form onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Input
                            type="textarea" name="content" id="content"
                            onChange={this.handleChange}
                            value={this.state.content}
                        />
                    </FormGroup>
                    {this.state.note.attachment &&
                    <FormGroup>
                        <Label>Attachment</Label>
                        <div>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={this.state.attachmentURL}
                            >
                            {this.formatFilename(this.state.note.attachment)}
                        </a>
                        </div>
                    </FormGroup>}
                    <FormGroup>
                        {
                            !this.state.note.attachment && 
                            <Label for="file">Attachment</Label>
                        }
                        <Input
                            type="file" name="file" id="file" 
                            onChange={this.handleFileChange}
                        />
                    </FormGroup>
                    <LoaderBtn
                        block
                        color="primary"
                        bssize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Save"
                        loadingText="Saving…"
                    />
                    <LoaderBtn
                        block
                        color="danger"
                        bssize="large"
                        isLoading={this.state.isDeleting}
                        onClick={this.handleDelete}
                        text="Delete"
                        loadingText="Deleting…"
                    />
                </Form>}
            </div>
        );
    }      
}
