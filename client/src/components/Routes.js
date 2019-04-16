import React from "react";
import {BrowserRouter as Route, Switch} from 'react-router-dom';
import {Home, Login, NewNote, NotFound, ResetPassword, Signup} from './pages';
import AppliedRoute from './AppliedRoute';

export default ({childProps}) =>
    <Switch>
        <AppliedRoute path="/" exact component={Home} props={childProps}/>
        <AppliedRoute path="/login" exact component={Login} props={childProps}/>
        <AppliedRoute path="/signup" exact component={Signup} props={childProps}/>
        <AppliedRoute path="/login/reset" exact component={ResetPassword} props={childProps}/>
        <AppliedRoute path="/notes/new" exact component={NewNote} props={childProps} />
        <Route component={NotFound} />
    </Switch>
