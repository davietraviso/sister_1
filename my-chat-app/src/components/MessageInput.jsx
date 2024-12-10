// src/components/MessageInput.js
import React, { useContext, useState } from 'react';
import { ChatContext } from '../context/ChatContext';

const MessageInput = () => {
  const { user, sendMessage } = useContext(ChatContext); // Using `sendMessage` from context
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message via context
      sendMessage({ user, text: message }); 
      setMessage(''); // Clear input field after sending
    } else {
      alert('Message cannot be empty');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)} // Update local state as user types
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;
