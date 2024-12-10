// src/components/Login.js
import React, { useContext, useState } from 'react';
import { ChatContext } from '../context/ChatContext';

const Login = () => {
  const { setUser } = useContext(ChatContext);
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      setUser(username); // Save the username globally
    } else {
      alert('Username cannot be empty');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
