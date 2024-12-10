// src/components/Chat.js
import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Chat = () => {
  const { user } = useContext(ChatContext);

  if (!user) {
    return <div>Please log in to start chatting.</div>;
  }

  return (
    <div>
      <h2>Welcome, {user}!</h2>
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default Chat;
