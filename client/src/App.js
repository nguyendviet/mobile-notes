import React, { Component, Fragment } from 'react';
import { withRouter } from "react-router-dom";
import {
    Navbar,
    Nav,
    NavLink
} from 'reactstrap';
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import Routes from "./components/Routes";
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
        }
        catch(e) {
            if (e !== 'No current user') {
                alert(e);
            }
        }
        this.setState({ isAuthenticating: false });
    }
        
    userHasAuthenticated = authenticated => {
        this.setState({ isAuthenticated: authenticated });
    }

    handleLogout = async event => {
        await Auth.signOut();
        this.userHasAuthenticated(false);
        this.props.history.push("/login");
    }
      
    render() {
        const childProps = {
            isAuthenticated: this.state.isAuthenticated,
            userHasAuthenticated: this.userHasAuthenticated
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
