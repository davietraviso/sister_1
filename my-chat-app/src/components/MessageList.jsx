// src/components/MessageList.js
import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const MessageList = () => {
  const { messages } = useContext(ChatContext);

  return (
    <div>
      <h3>Messages:</h3>
      {messages.map((message, index) => (
        <div key={index}>
          <strong>{message.user}</strong>: {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
