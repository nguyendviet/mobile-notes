import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { Auth } from "aws-amplify";
import LoaderButton from '../LoaderBtn';
import "./Login.css";

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: "",
            password: ""
        };
    }

    validateForm() {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleSubmit = async event => {
        event.preventDefault();
    
        this.setState({ isLoading: true });
    
        try {
            await Auth.signIn(this.state.email, this.state.password)
            this.props.userHasAuthenticated(true);
        } catch (e) {
            alert(e.message);
            this.setState({ isLoading: false });
        }
    }
    
    render() {
        return (
            <div className="Login">
                <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <Label for="email">Email</Label>
                    <Input 
                        type="email" name="email" id="email" 
                        value={this.state.email}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="password">Password</Label>
                    <Input 
                        type="password" name="password" id="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <Link to="/login/reset">Forgot password?</Link>
                <LoaderButton
                    block
                    bssize="large"
                    disabled={!this.validateForm()}
                    type="submit"
                    isLoading={this.state.isLoading}
                    text="Login"
                    loadingText="Logging in…"
                    />
                </Form>
            </div>
        );
    }
}
