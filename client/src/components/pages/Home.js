import React, { Component } from "react";
import { API, Auth } from "aws-amplify";
import { ListGroup, ListGroupItem } from "reactstrap";
import { LinkContainer } from "react-router-bootstrap";
import {Profile} from '../pages';
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
        if (!this.props.isAuthenticated) return;
        this.setState({ isLoading: false });
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
                <Profile/>
            </div>
        );
    }
  
    render() {
        return (
            <div className="Home">
            {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
            </div>
        );
    }
}
