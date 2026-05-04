'use client';
import { useState } from 'react';

export default function FloatingWidgets() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Halo! Selamat datang di Mandala 525. Ada yang bisa saya bantu terkait paket Umroh?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Simulate Bot response
    setTimeout(() => {
      let reply = 'Mohon maaf, saat ini customer service kami sedang offline. Silakan hubungi via WhatsApp untuk respon cepat.';
      
      const lower = userText.toLowerCase();
      if (lower.includes('harga') || lower.includes('paket')) {
        reply = 'Harga paket Umroh kami mulai dari Rp 25.000.000. Untuk detail lengkap, Anda bisa melihat di halaman Katalog kami.';
      } else if (lower.includes('jadwal') || lower.includes('kapan')) {
        reply = 'Jadwal keberangkatan tersedia setiap bulan. Hubungi tim kami via WA untuk informasi seat yang masih kosong.';
      } else if (lower.includes('halo') || lower.includes('assalam')) {
        reply = 'Waalaikumsalam! Ada yang bisa kami bantu?';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  return (
    <div className="floating-widgets" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '16px',
      zIndex: 9999
    }}>

      {/* Chatbot Window */}
      {isChatOpen && (
        <div style={{
          width: '320px',
          height: '400px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-default)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>CS Mandala 525</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>Online</div>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.sender === 'user' ? 'var(--gold-400)' : '#fff',
                color: m.sender === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: '12px',
                borderBottomRightRadius: m.sender === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: m.sender === 'bot' ? '4px' : '12px',
                maxWidth: '85%',
                fontSize: '13px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                border: m.sender === 'bot' ? '1px solid var(--border-default)' : 'none'
              }}>
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={sendChat} style={{
            padding: '12px',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: '#fff',
            display: 'flex',
            gap: '8px'
          }}>
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ketik pesan..." 
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border-default)',
                borderRadius: '20px',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              background: 'var(--gold-500)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              ➤
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/6281234567890?text=Halo%20Mandala%20525,%20saya%20ingin%20bertanya%20tentang%20paket%20Umroh" 
          target="_blank"
          rel="noopener noreferrer"
          title="Hubungi via WhatsApp"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#25D366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" style={{ width: 32, height: 32 }} />
        </a>

        {/* Chatbot Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          title="Tanya Chatbot"
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--gold-500)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
            cursor: 'pointer',
            border: 'none',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
