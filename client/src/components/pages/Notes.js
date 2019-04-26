import React, { Component } from "react";
import { API, Auth, Storage } from "aws-amplify";

export default class Notes extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            note: null,
            content: "",
            attachmentURL: null
        };
    }

    async componentDidMount() {
        try {
            let attachmentURL;
            const note = await this.getNote();
            const { content, attachment } = note.Item;
            console.log(note);
            console.log(content);
            console.log(attachment);

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

    render() {
        return <div className="Notes"></div>;
    }
}
