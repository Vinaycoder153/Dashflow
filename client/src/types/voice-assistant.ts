export interface Message {
  id: string;
  sessionId: string | null;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date | null;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserSettings {
  id: string;
  userId: string | null;
  voiceSpeed: string;
  voicePitch: string;
  autoScroll: boolean;
  theme: string;
  updatedAt: Date | null;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'error' | 'status';
  message?: Message;
  error?: string;
  status?: string;
}

export interface ToolUsage {
  name: string;
  status: 'pending' | 'complete' | 'error';
  result?: any;
}
