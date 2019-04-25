import React, { Component } from "react";
import { API, Auth } from "aws-amplify";
import { ListGroup, ListGroupItem } from "reactstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";

export default class Home extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            isLoading: true,
            notes: [],
        };
    }

    async componentDidMount() {
        if (!this.props.isAuthenticated) {
            return;
        }

        // const auth = await Auth.currentAuthenticatedUser();
        // const userid = auth.username;
        // const token = auth.signInUserSession.idToken.jwtToken;
        // this.setState({userid: userid, token: token});
        // // console.log(this.state);

        // try {
        //     const result = await this.notes();
        //     const notes = result.Items;
        //     this.setState({ notes });
        // } 
        // catch (e) {
        //     console.log(e);
        // }
      
        this.setState({ isLoading: false });
    }

    notes() {
        return API.get("notes", "/notes");
        // return API.get("notes", "/notes", {
        //     headers: {
        //         "Authorization": this.props.token
        //     },
        //     queryStringParameters: {userid: this.props.userid}
        // });
    }      
  
    renderNotesList(notes) {
        // TODO: Fix concat()
        return [{}].concat(notes).map((note, i) =>
            i !== 0
            ? <LinkContainer
                key={note.noteid}
                to={`/notes/${note.noteid}`}
            >
                <ListGroupItem header={note.content.trim().split("\n")[0]}>
                {"Created: " + new Date(note.createdAt).toLocaleString()}
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
  
    renderLander() {
        return (
            <div className="lander">
            <h1>Scratch</h1>
            <p>A simple note taking app</p>
            </div>
        );
    }
  
    renderNotes() {
        return (
            <div className="notes">
                <h1>Your Notes</h1>
                <ListGroup>
                    {!this.state.isLoading && this.renderNotesList(this.state.notes)}
                </ListGroup>
            </div>
        );
    }
  
    render() {
        // console.log(this.props);
        return (
            <div className="Home">
            {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
            </div>
        );
    }
}
