import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((err) => console.error(err));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <div className="app-container">
      {/* Chat List */}
      {(!isMobile || !selectedChat) && (
        <div className="chat-list">
          <h2>Chats</h2>
          {conversations.length === 0 ? (
            <p>No chats found</p>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.wa_id}
                className={`chat-item ${
                  selectedChat?.wa_id === chat.wa_id ? "active" : ""
                }`}
                onClick={() => handleSelectChat(chat)}
              >
                <strong>{chat.name}</strong>
                <p>
                  {chat.messages[chat.messages.length - 1]?.text?.slice(0, 20) ||
                    "No messages yet"}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Window */}
      {selectedChat && (
        <div className="chat-window">
          {isMobile && (
            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
          )}
          <h2>{selectedChat.name}</h2>
          <div className="messages">
            {selectedChat.messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${
                  msg.fromMe ? "from-me" : "from-them"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

