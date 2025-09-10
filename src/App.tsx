import React from 'react'
import Chat from './components/Chat'

export default function App() {
  return (
    <div className="app">
      <div className="header">
        <span className="dot"></span>
        <strong>Chat UI</strong>
        <span style={{ color: '#9ca3af', marginLeft: 8 }}>Markdown • WebSocket • Docker</span>
      </div>
      <Chat />
      <div style={{ padding: 8, textAlign: 'center', color: '#9ca3af', borderTop: '1px solid #1f2937' }}>
        Tip: Shift+Enter for newline • Supports **markdown**, `code`, tables, math: \\(\\int e^x dx = e^x + C\\)
      </div>
    </div>
  )
}