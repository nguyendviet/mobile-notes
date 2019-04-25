import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import {
    Navbar,
    Nav,
    NavLink
} from 'reactstrap';
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import {Routes} from "./components/routes";
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isAuthenticated: false,
            isAuthenticating: true
        };
    }

    async componentDidMount() {
        try {
            await Auth.currentSession();
            this.userHasAuthenticated(true);
            this.props.history.push("/profile");
        }
        catch(e) {
            if (e !== 'not authenticated') {
                console.log(e);
            }
        }
    }
        
    userHasAuthenticated = authenticated => {
        this.setState({ isAuthenticated: authenticated });
    }

    handleLogout = async event => {
        await Auth.signOut();
        this.userHasAuthenticated(false);
        this.props.history.push("/login");
    }

    saveCurrentUser = (user) => {
        console.log(user);
    }
      
    render() {
        const childProps = {
            isAuthenticated: this.state.isAuthenticated,
            userHasAuthenticated: this.userHasAuthenticated,
            saveCurrentUser: this.saveCurrentUser
        };
          
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <Nav className="ml-auto" navbar>
                    {this.state.isAuthenticated
                        ?   <NavLink onClick={this.handleLogout}>
                                Logout
                            </NavLink>
                        :   <Fragment>
                            <LinkContainer to="/signup">
                                <NavLink>Signup</NavLink>
                            </LinkContainer>
                            <LinkContainer to="/login">
                                <NavLink>Login</NavLink>
                            </LinkContainer>
                            </Fragment>
                    }
                    </Nav>
                </Navbar>
                <Routes childProps={childProps} />
            </div>
        );
    }    
}

export default withRouter(App);
