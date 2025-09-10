import { useEffect, useRef, useState, useCallback } from 'react'
import type { IncomingEvent, OutgoingMessage } from '../types'

interface Options {
  url: string
  heartbeatMs?: number
  onEvent?: (evt: IncomingEvent) => void
}

export function useWebSocketClient({ url, heartbeatMs = 25000, onEvent }: Options) {
  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatRef = useRef<number | null>(null)
  const [status, setStatus] = useState<'connecting'|'open'|'closed'|'error'>('connecting')
  const backoffRef = useRef(1000)

  const clearHeartbeat = () => {
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }

  const startHeartbeat = () => {
    clearHeartbeat()
    heartbeatRef.current = window.setInterval(() => {
      try { wsRef.current?.send(JSON.stringify({ type: 'ping', t: Date.now() })) } catch {}
    }, heartbeatMs)
  }

  const connect = useCallback(() => {
    setStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('open')
      backoffRef.current = 1000
      startHeartbeat()
    }

    ws.onmessage = (e) => {
      try {
        const evt: IncomingEvent = JSON.parse(e.data)
        onEvent?.(evt)
      } catch {
        // ignore non-JSON frames
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onclose = () => {
      setStatus('closed')
      clearHeartbeat()
      // exponential backoff reconnect
      const delay = Math.min(backoffRef.current, 15000)
      setTimeout(connect, delay)
      backoffRef.current = Math.min(backoffRef.current * 2, 15000)
    }
  }, [url, onEvent])

  useEffect(() => {
    connect()
    return () => {
      clearHeartbeat()
      wsRef.current?.close()
    }
  }, [connect])

  const send = (msg: OutgoingMessage) => {
    const data = JSON.stringify(msg)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      // queue could be added here; for now, try once the socket opens
      const iv = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(data)
          clearInterval(iv)
        }
      }, 200)
      setTimeout(() => clearInterval(iv), 5000)
    }
  }

  return { status, send }
}