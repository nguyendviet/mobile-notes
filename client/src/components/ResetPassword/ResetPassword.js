import React, { Component } from "react";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";
import {
    Form,
    FormGroup,
    Label,
    Input,
    FormText
} from "reactstrap";
import LoaderBtn from "../LoaderBtn";
import "./ResetPassword.css";

export default class ResetPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
        code: "",
        email: "",
        password: "",
        codeSent: false,
        confirmed: false,
        confirmPassword: "",
        isConfirming: false,
        isSendingCode: false
        };
    }

    validateCodeForm() {
        return this.state.email.length > 0;
    }

    validateResetForm() {
        return (
        this.state.code.length > 0 &&
        this.state.password.length > 0 &&
        this.state.password === this.state.confirmPassword
        );
    }

    handleChange = event => {
        this.setState({
        [event.target.id]: event.target.value
        });
    };

    handleSendCodeClick = async event => {
        event.preventDefault();

        this.setState({ isSendingCode: true });

        try {
        await Auth.forgotPassword(this.state.email);
        this.setState({ codeSent: true });
        } catch (e) {
        alert(e.message);
        this.setState({ isSendingCode: false });
        }
    };

    handleConfirmClick = async event => {
        event.preventDefault();

        this.setState({ isConfirming: true });

        try {
        await Auth.forgotPasswordSubmit(
            this.state.email,
            this.state.code,
            this.state.password
        );
        this.setState({ confirmed: true });
        } catch (e) {
        alert(e.message);
        this.setState({ isConfirming: false });
        }
    };

    renderRequestCodeForm() {
        return (
            <Form onSubmit={this.handleSendCodeClick}>
                <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                        autoFocus
                        type="email" name="email" id="email" 
                        value={this.state.email}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <LoaderBtn
                    block
                    type="submit"
                    bsSize="large"
                    loadingText="Sending…"
                    text="Send Confirmation"
                    isLoading={this.state.isSendingCode}
                    disabled={!this.validateCodeForm()}
                />
            </Form>
        );
    }

    renderConfirmationForm() {
        return (
            <Form onSubmit={this.handleConfirmClick}>
                <FormGroup>
                    <Label for="code">Confirmation Code</Label>
                    <Input
                        autoFocus
                        type="tel" name="confirmationCode" id="code"
                        value={this.state.code}
                        onChange={this.handleChange}
                    />
                    <FormText color="muted">
                        Please check your email ({this.state.email}) for the confirmation code.
                    </FormText>
                </FormGroup>
                <hr />
                <FormGroup>
                    <Label for="password">New Password</Label>
                    <Input 
                        type="password" name="password" id="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="confirmPassword">Confirm Password</Label>
                    <Input 
                        type="password" name="confirmPassword" id="confirmPassword"
                        value={this.state.confirmPassword}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <LoaderBtn
                    block
                    type="submit"
                    bssize="large"
                    text="Confirm"
                    loadingText="Confirm…"
                    isLoading={this.state.isConfirming}
                    disabled={!this.validateResetForm()}
                />
            </Form>
        );
    }

    renderSuccessMessage() {
        return (
            <div className="success">
                <i className="far fa-check-circle"></i>
                <p>Your password has been reset.</p>
                <p>
                <Link to="/login">
                    Click here to login with your new credentials.
                </Link>
                </p>
            </div>
        );
    }

    render() {
        return (
            <div className="ResetPassword">
                {!this.state.codeSent
                ? this.renderRequestCodeForm()
                : !this.state.confirmed
                    ? this.renderConfirmationForm()
                    : this.renderSuccessMessage()}
            </div>
        );
    }
}
