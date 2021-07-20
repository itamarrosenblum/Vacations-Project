import React from 'react';
import './Auth.css';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import SignUp from './signup/SignUp';
import LogIn from './login/LogIn';

const Auth = ({setToken}) => {
    return (
        <Router>
            <div className='auth-container'>
                <Switch>
                    <Route exact path='/'>
                        <LogIn setToken={setToken} />
                    </Route>
                    <Route path='/signup'>
                        <SignUp />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default Auth;