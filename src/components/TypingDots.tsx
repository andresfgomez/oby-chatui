import React from 'react'

export default function TypingDots() {
  return (
    <div className="typing" aria-label="Assistant typing" role="status">
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
    </div>
  )
}