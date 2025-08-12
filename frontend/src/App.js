import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgText, setMsgText] = useState('');

  // 🔹 Direct backend API URL
  const API_URL = 'http://localhost:5000'; // change to Render URL after deployment

  // Load conversations and auto-select first chat
  useEffect(() => {
    axios
      .get(`${API_URL}/conversations`)
      .then(res => {
        setConvos(res.data);
        if (window.innerWidth >= 768 && res.data.length > 0) {
          // Auto-select first chat only on tablet/desktop
          setSelected(res.data[0]);
        }
      })
      .catch(err => console.error('Error fetching conversations:', err));
  }, []);

  // Send a new message
  const sendMsg = async () => {
    if (!msgText.trim() || !selected) return;

    const newMsg = {
      id: Date.now().toString(),
      wa_id: selected.wa_id,
      name: selected.name,
      text: msgText,
      timestamp: new Date(),
      fromMe: true,
      status: 'sent'
    };

    try {
      await axios.post(`${API_URL}/messages`, newMsg);

      // Update conversations list
      setConvos(prev =>
        prev.map(c =>
          c.wa_id === selected.wa_id
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        )
      );

      // Update currently selected chat
      setSelected(prev => ({
        ...prev,
        messages: [...prev.messages, newMsg]
      }));

      setMsgText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${selected && window.innerWidth < 768 ? 'hide-mobile' : ''}`}>
        {convos.map(c => (
          <div
            key={c.wa_id}
            onClick={() => setSelected(c)}
            className="chat-item"
          >
            <strong>{c.name || c.wa_id}</strong>
            <p>{c.messages[c.messages.length - 1]?.text || ''}</p>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className={`chat-area ${!selected ? 'hide-mobile' : ''}`}>
        {selected ? (
          <>
            {/* Chat Header with 'Back' button for mobile */}
            <div className="chat-header" style={{
              padding: '10px',
              background: '#075e54',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {window.innerWidth < 768 && (
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                >
                  ←
                </button>
              )}
              <h3 style={{ margin: 0 }}>{selected.name || selected.wa_id}</h3>
            </div>

            {/* Messages */}
            <div className="messages">
              {selected.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`message ${m.fromMe ? 'sent' : 'received'}`}
                >
                  <div className="bubble">
                    {m.text}
                    <div className="meta">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {m.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="input-box">
              <input
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Type a message"
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
              />
              <button onClick={sendMsg}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a chat</div>
        )}
      </div>
    </div>
  );
}

export default App;
