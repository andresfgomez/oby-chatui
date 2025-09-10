import React from 'react'
import type { ChatMessage } from '../types'
import Markdown from './Markdown'

export default function MessageBubble({ msg }: { msg: ChatMessage }) {

  const content1 = `
  # Hello World
  
  This is a simple markdown content.
  
  - Item 1
  - Item 2
  - Item 3
  
  Here is a math equation:
  
  $$
  E = mc^2
  $$
  `

  return (
    <div className={`message-row ${msg.role}`}>
      <div className="meta">
        {msg.role === 'user' ? 'You' : 'Assistant'} • {new Date(msg.createdAt).toLocaleTimeString()}
        {msg.streaming ? ' • typing…' : ''}
      </div>
      <div className={`bubble ${msg.role}`}>
        <Markdown content={content1} />
      </div>
    </div>
  )
}