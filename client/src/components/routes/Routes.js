import React from "react";
import {Switch} from 'react-router-dom';
import {Home, Login, NewNote, Notes, NotFound, ResetPassword, Signup} from '../pages';
import AppliedRoute from './AppliedRoute';
import AuthenticatedRoute from "./AuthenticatedRoute";
import UnauthenticatedRoute from "./UnauthenticatedRoute";

export const Routes = ({childProps}) => 
    <Switch>
        <AppliedRoute path="/" exact component={Home} props={childProps} />
        <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
        <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
        <AuthenticatedRoute path="/notes/new" exact component={NewNote} props={childProps} />
        <AuthenticatedRoute path="/notes/:id" exact component={Notes} props={childProps} />
        <AppliedRoute path="/login/reset" exact component={ResetPassword} props={childProps}/>
        <AppliedRoute component={NotFound} />
    </Switch>
