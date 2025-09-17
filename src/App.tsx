import React from 'react'
import Chat from './components/Chat'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  return (
    <div className="app">
      <div className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot"></span>
          <strong>Chat UI</strong>
          <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
            Markdown • WebSocket • Docker
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="newchat-btn" onClick={() => window.dispatchEvent(new Event('newchat'))}>
            ＋ New Chat
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <Chat />
      <div style={{ padding: 8, textAlign: 'center', color: '#9ca3af', borderTop: '1px solid #1f2937' }}>
        Tip: Shift+Enter for newline • Supports **markdown**, `code`, tables, math: \\(\\int e^x dx = e^x + C\\)
      </div>
    </div>
  )
}