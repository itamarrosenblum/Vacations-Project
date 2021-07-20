import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import './LogIn.css';
import './LogInQueries.css';

const Login = ({setToken}) => {
    const [errMsg, setErrMsg] = useState('');
    const history = useHistory();

    const isValid = (e) => { // Log in validator
        e.preventDefault();

        if (e.target.username.value.length > 0 && e.target.password.value.length >= 6) {
                connectAcc( e.target.username.value, e.target.password.value);
        } else {
            setErrMsg('Something went wrong');
        }
    }

    const connectAcc = async (username, password) => { // Log in request
        try {
            const obj = {username: username, password: password}

            const data = await fetch('http://localhost:3001/session', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            });
            const res = await data.json();
            
            if (res.status === '200') {
                setToken(res.token);
                localStorage.setItem('activeUser', res.token);
                history.push('/');
            } else {
                setErrMsg('Wrong username or password.');
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='login-container'>
            <div className='login-header'>
                <h1>travilgo</h1>
                <p>Visit new places around the world with Travilgo.</p>
            </div>

            <div className='login-form'>
                <form onSubmit={isValid} autoComplete='off'>
                    <div className='form-header'>
                        <h2>Log In</h2>
                    </div>

                    <div className='username-box'>
                        <input 
                            type='text' 
                            name='username' 
                            id='username'
                            placeholder='Username'
                            required
                        />
                    </div>

                    <div className='password-box'>
                        <input 
                            type='password' 
                            name='password' 
                            id='password'
                            placeholder='Password'
                            required
                            pattern='.{6,}' 
                            title='Password must contain at least 6 or more characters'
                            autoComplete='off'
                        />
                    </div>

                    <div className='button-box'>
                        <button className='btn-login' type='submit'>Log In</button>
                    </div>

                    {errMsg ? 
                    <div className='error-message-box'>
                        <p>{errMsg}</p>
                    </div> 
                    : 
                    null }

                    <div className='saperator-box'>
                        <p className='horizontal-line'>or</p>
                    </div>
                </form>

                <div className='routing-box'>
                    <button className='btn-signup' onClick={() => history.push('/signup')}>
                        Create an Account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login;