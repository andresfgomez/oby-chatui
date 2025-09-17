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
  const composerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const setVar = () => {
      // Use scrollHeight (clamped to max) so the button matches visible height
      const h = Math.min(ta.scrollHeight, 180);
      document.documentElement.style.setProperty('--ta-h', `${Math.max(h, 64)}px`);
    };
    setVar();

    const ro = new ResizeObserver(setVar);
    ro.observe(ta);

    // Also update when typing (height can change before ResizeObserver fires)
    const onInput = () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
      setVar();
    };
    ta.addEventListener('input', onInput);

    return () => {
      ro.disconnect();
      ta.removeEventListener('input', onInput);
    };
  }, []);

  messages.push({ id: '1', role: 'assistant', content: 'Hello! How can I assist you today?', createdAt: Date.now() })
  messages.push({ id: '2', role: 'user', content: 'I need your help with .....', createdAt: Date.now() })
  messages.push({ id: '3', role: 'assistant', content: 'Sure, we can try......', createdAt: Date.now() })
  messages.push({ id: '4', role: 'user', content: 'Thank you for your assistance!', createdAt: Date.now() })

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

  // Auto-size textarea as user types
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // grow/shrink to content up to max-height
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
    }
  }

  // Keep --composer-h in sync with actual composer height
  React.useEffect(() => {
    const el = composerRef.current
    if (!el) return
    const setVar = () => {
      const h = el.getBoundingClientRect().height
      document.documentElement.style.setProperty('--composer-h', `${Math.ceil(h)}px`)
    }
    setVar()
    const ro = new ResizeObserver(setVar)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    const handler = () => {
      setMessages([]);
      setInput('');      
    };
    window.addEventListener('newchat', handler);
    return () => window.removeEventListener('newchat', handler);
  }, []);

  return (
    <div className="chat">
      <div className="messages" ref={listRef}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
      </div>
      <div className="composer" ref={composerRef}>
        <textarea
          ref={textareaRef}
          placeholder={status === 'open' ? "Ask anything…" : `Connecting… (${status})`}
          value={input}
          onChange={onInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <button onClick={sendMessage} disabled={status !== 'open'} aria-label="Send message">
          <span style={{ fontWeight: 700 }}>Send</span>
          <svg width="18" height="18" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>          
        </button>
      </div>
    </div>
  )
}