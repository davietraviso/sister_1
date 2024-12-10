// src/App.js
import React from 'react';
import { ChatProvider } from './context/ChatContext';
import Login from './components/Login';
import Chat from './components/Chat';

const App = () => {
  return (
    <ChatProvider>
      <div>
        <h1>Distributed Chat App</h1>
        <Login />
        <Chat />
      </div>
    </ChatProvider>
  );
};

export default App;
