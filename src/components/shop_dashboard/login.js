import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

function Login(props) {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUserNameInput = e => {
    setUsername(e.target.value);
  };

  const handlePasswordInput = e => {
    setPassword(e.target.value);
  };

  const onSubmit = e => {
    e.preventDefault();

    const credentials = {
      user: userName,
      pass: password
    }

    axios.get("http://localhost:5000/login/", { params: credentials })
      .then(res => {
        console.log(res.data);
        if (res.data) {
          axios.post('http://localhost:5000/jwt/generateAccessToken', { user: userName })
           .then(res => {
             console.log(res);
             localStorage.setItem('access', JSON.stringify(res.data['accessToken']))
             localStorage.setItem('refresh', JSON.stringify(res.data['refreshToken']))
             props.setLoggedIn(true);
           })
        }
      });
  }

    return (
      <>
        <h1>Login</h1>
        <form onSubmit={onSubmit}>
          <label>Username</label>
          <input type="text" value={userName} onChange={handleUserNameInput}/>
          <label>Password</label>
          <input type="text" value={password} onChange={handlePasswordInput}/>
          <input type="submit" value="Log In"/>
        </form>
      </>
    );
}

export default Login;