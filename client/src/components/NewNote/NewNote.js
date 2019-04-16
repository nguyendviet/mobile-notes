import React, { Component } from "react";
import { Form, FormGroup, Label, Input } from "reactstrap";
import LoaderBtn from "../LoaderBtn";
import config from "../../lib/aws-variables";
import "./NewNote.css";

export default class NewNote extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            isLoading: null,
            content: ""
        };
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