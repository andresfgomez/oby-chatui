export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;     // markdown
  createdAt: number;
  streaming?: boolean; // true while tokens are arriving
}

export interface OutgoingMessage {
  type: 'chat';
  id: string;
  content: string;
  // add conversation or auth metadata as needed
}

export type IncomingEvent =
  | { type: 'ack'; id: string }
  | { type: 'token'; id: string; delta: string }         // incremental content
  | { type: 'done'; id: string }                         // end of stream
  | { type: 'message'; message: ChatMessage }            // non-stream message
  | { type: 'error'; id?: string; message: string };