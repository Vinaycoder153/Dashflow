import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { MessageBubble } from '@/components/message-bubble';
import { Card } from '@/components/ui/card';
import type { Message } from '@/types/voice-assistant';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  autoScroll: boolean;
  onSpeak: (text: string) => void;
}

export function ChatArea({ messages, isTyping, autoScroll, onSpeak }: ChatAreaProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, autoScroll]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950" data-testid="chat-area">
      
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex justify-center">
          <div className="max-w-md text-center" data-testid="welcome-message">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="text-white h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2" data-testid="text-welcome-title">
              AI Assistant Ready
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm" data-testid="text-welcome-description">
              Click the microphone to start talking, or type a message below. I can help with weather, emails, web searches, and more!
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onSpeak={onSpeak}
        />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-start space-x-3" data-testid="typing-indicator">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="text-white h-4 w-4" />
          </div>
          <Card className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md p-4 shadow-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </Card>
        </div>
      )}
      
      <div ref={chatEndRef} />
    </div>
  );
}
