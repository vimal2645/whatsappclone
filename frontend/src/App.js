import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgText, setMsgText] = useState('');

  // ✅ Will use Render URL in production, localhost in dev
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Load conversations and auto-select first chat
  useEffect(() => {
    axios
      .get(`${API_URL}/conversations`)
      .then(res => {
        setConvos(res.data);
        if (res.data.length > 0) {
          setSelected(res.data[0]); // auto-select first chat
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

      // Update UI instantly
      setConvos(prev =>
        prev.map(c =>
          c.wa_id === selected.wa_id
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        )
      );

      // Update selected chat in view
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
      <div className={`sidebar ${selected ? 'hide-mobile' : ''}`}>
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
            {/* Chat Messages */}
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
                      })}{' '}
                      - {m.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
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

