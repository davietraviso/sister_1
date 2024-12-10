// src/context/ChatContext.js
import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const ChatContext = createContext();

const socket = io('http://localhost:3000'); // Connect to the backend server

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for chat history
    socket.on('chat_history', (history) => {
        setMessages(history); // Set the chat history in state
    });

    // Listen for new messages
    socket.on('receive_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
        socket.off('chat_history');
        socket.off('receive_message');
    };
  }, []);


  const sendMessage = (message) => {
    // Emit the message to the backend server
    socket.emit('send_message', message);
  };

  return (
    <ChatContext.Provider value={{ user, setUser, messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
