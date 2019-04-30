import React, { Component } from "react";
import { API, Auth, Storage } from "aws-amplify";
import { ListGroup, ListGroupItem } from "reactstrap";
import { LinkContainer } from "react-router-bootstrap";

export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: []
        };
    }

    async componentDidMount() {
        const auth = await Auth.currentAuthenticatedUser();
        const userid = auth.username;
        const token = auth.signInUserSession.idToken.jwtToken;

        try {
            API.get("notes", "/notes", {
                headers: {
                    "Authorization": token
                },
                queryStringParameters: {userid: userid}
            })
            .then((res) => {
                const notes = res.Items;
                this.setState({notes});
            });
        } 
        catch (e) {
            console.log(e);
        }
    }

    renderNotesList(notes) {
        // TODO: Fix concat()
        return [{}].concat(notes).map((note, i) =>
            i !== 0
            ? <LinkContainer
                key={note.noteid}
                to={`/notes/${note.noteid}`}
            >
                <ListGroupItem>
                    <h4>{note.content.trim().split("\n")[0]}</h4>
                    <div>{"Created: " + new Date(note.createdAt).toLocaleString()}</div>
                </ListGroupItem>
            </LinkContainer>
            : <LinkContainer
                key="new"
                to="/notes/new"
            >
                <ListGroupItem>
                <h4>
                    <b>{"\uFF0B"}</b> Create a new note
                </h4>
                </ListGroupItem>
            </LinkContainer>
        );
    }

    render() {
        return (
            <div>
                {
                    this.state.notes.length > 0
                    ? this.renderNotesList(this.state.notes)
                    : null
                }
            </div>
        )
    }
}
