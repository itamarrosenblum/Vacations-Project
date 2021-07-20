import React, {useState} from 'react';
import {useHistory} from "react-router-dom";
import './SignUp.css';

const SignUp = () => {
    const [errMsg, setErrMsg] = useState('');
    const history = useHistory();

    const isValid = (e) => { // New account validator
        e.preventDefault();

        if (e.target.firstName.value.length > 0 
            && e.target.lastName.value.length > 0 
            && e.target.username.value.length > 0 
            && e.target.password.value.length >= 6) {
                createAcc(
                    e.target.firstName.value, 
                    e.target.lastName.value, 
                    e.target.username.value, 
                    e.target.password.value
                );
        } else {
            setErrMsg('Something went wrong');
        }
    }

    const createAcc = async (firstName, lastName, username, password) => { // Create new account
        try {
            const obj = {
                firstName: firstName,
                lastName: lastName,
                username: username,
                password: password
            }

            const data = await fetch('http://localhost:3001/account', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            });
            const res = await data.json();

            if (res.status === '200') {
                history.push('/');
            } else {
                setErrMsg('Username already exists');
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='signup-container'>
            <div className='signup-form'>
                <form onSubmit={isValid} autoComplete='off'> 
                    <div className='signup-header'>
                        <h1>travilgo</h1>
                        <h2>Sign Up</h2>
                    </div>

                    <div className='first-name-box'>
                        <input 
                            type='text' 
                            name='firstName' 
                            id='firstName'
                            placeholder='First Name'
                            required
                        />
                    </div>

                    <div className='last-name-box'>
                        <input 
                            type='text' 
                            name='lastName' 
                            id='lastName'
                            placeholder='Last Name'
                            required
                        />
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
                        <button className='btn-signup' type='submit'>Sign Up</button>
                    </div>

                    <div className='saperator-box'>
                        <p className='horizontal-line'>or</p>
                    </div>

                    {errMsg ? 
                    <div className='error-message-box'>
                        <p>{errMsg}</p>
                    </div> : null }
                </form>

                <div className='routing-box'>
                    <button className='btn-login' onClick={() => history.push('/')}>
                        Have an account? Log In
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignUp;