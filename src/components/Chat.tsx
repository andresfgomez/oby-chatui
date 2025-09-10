import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useWebSocketClient } from '../hooks/useWebSocketClient'
import type { ChatMessage, IncomingEvent, OutgoingMessage } from '../types'
import { appendDelta } from './../utils/streaming'
import MessageBubble from './MessageBubble'

function uid() { return Math.random().toString(36).slice(2) }

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const wsUrl = useMemo(() => import.meta.env.VITE_WS_URL as string, [])
  const onEvent = useCallback((evt: IncomingEvent) => {
    if (evt.type === 'message') {
      setMessages(prev => [...prev, evt.message])
    } else if (evt.type === 'ack') {
      // could mark user message as acknowledged
    } else if (evt.type === 'token') {
      setMessages(prev => {
        const i = prev.findIndex(m => m.id === evt.id)
        if (i === -1) {
          // first token => create assistant message
          const msg: ChatMessage = { id: evt.id, role: 'assistant', content: evt.delta, createdAt: Date.now(), streaming: true }
          return [...prev, msg]
        } else {
          const updated = [...prev]
          updated[i] = { ...updated[i], content: appendDelta(updated[i].content, evt.delta), streaming: true }
          return updated
        }
      })
    } else if (evt.type === 'done') {
      const exampleMessage: ChatMessage = { id: '123', role: 'assistant', content: 'Example response', createdAt: Date.now(), streaming: false }
      setMessages(prev => [...prev, exampleMessage])
    } else if (evt.type === 'error') {
      const id = evt.id ?? uid()
      setMessages(prev => [...prev, { id, role: 'assistant', content: `**Error:** ${evt.message}`, createdAt: Date.now() }])
    }
  }, [])

  const { status, send } = useWebSocketClient({ url: wsUrl, onEvent })

  const sendMessage = () => {
    const content = input.trim()
    if (!content) return
    const userId = uid()
    setMessages(prev => [...prev, { id: userId, role: 'user', content, createdAt: Date.now() }])
    setInput('')

    // Ask backend to start producing a response stream with a new responseId
    const responseId = uid()
    const payload: OutgoingMessage = { type: 'chat', id: responseId, content }
    send(payload)
  }

  // autoscroll on new messages
  React.useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="chat">
      <div className="messages" ref={listRef}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
      </div>
      <div className="composer">
        <textarea
          placeholder={status === 'open' ? "Ask anything…" : `Connecting… (${status})`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <button onClick={sendMessage} disabled={status !== 'open'}>Send</button>
      </div>
    </div>
  )
}