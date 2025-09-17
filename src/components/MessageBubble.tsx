import React from 'react'
import type { ChatMessage } from '../types'
import Markdown from './Markdown'
import Spinner from './Spinner'
import TypingDots from './TypingDots'

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className={`message-row ${msg.role}`}>
      <div className="meta">
        {msg.role === 'user' ? 'You' : 'Assistant'} • {new Date(msg.createdAt).toLocaleTimeString()}
        {msg.streaming ? ' • typing…' : ''}
      </div>
      <div className={`bubble ${msg.role}`}>
        {msg.role === 'assistant' && !msg.content
          ? <TypingDots />
          : <Markdown content={msg.content} />}
      </div>
    </div>
  )
}