import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="app-container">
      {/* Chat List */}
      <div className={`chat-list ${selectedChat ? "hide-on-mobile" : ""}`}>
        <h2>Chats</h2>
        {conversations.map((chat) => (
          <div
            key={chat.wa_id}
            className="chat-item"
            onClick={() => setSelectedChat(chat)}
          >
            <strong>{chat.name || "Unknown"}</strong>
            <p>
              {chat.messages[chat.messages.length - 1]?.text || "No messages"}
            </p>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${!selectedChat ? "hide-on-mobile" : ""}`}>
        {selectedChat ? (
          <>
            <div className="chat-header">
              <button
                className="back-button"
                onClick={() => setSelectedChat(null)}
              >
                ← Back
              </button>
              <h3>{selectedChat.name}</h3>
            </div>
            <div className="messages">
              {selectedChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.from_me ? "from-me" : "from-them"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="no-chat">Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
}

export default App;
