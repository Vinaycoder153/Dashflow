import { Volume2, User, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Message } from '@/types/voice-assistant';

interface MessageBubbleProps {
  message: Message;
  onSpeak: (text: string) => void;
}

export function MessageBubble({ message, onSpeak }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Just now';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end message-bubble-user' : 'message-bubble-assistant'}`} data-testid={`message-${message.id}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white h-4 w-4" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? 'max-w-md' : ''}`}>
        <Card className={`p-4 shadow-sm ${
          isUser 
            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-md border-0' 
            : 'bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md'
        }`}>
          <p className={`${isUser ? 'text-white' : 'text-gray-900 dark:text-slate-100'}`} data-testid={`text-message-content-${message.id}`}>
            {message.content}
          </p>
        </Card>
        
        <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-slate-400 ${isUser ? 'justify-end' : ''}`}>
          {isUser && <Check className="h-3 w-3 text-blue-500" data-testid={`icon-message-sent-${message.id}`} />}
          <span data-testid={`text-message-timestamp-${message.id}`}>{timestamp}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeak(message.content)}
              className="p-0 h-auto hover:text-blue-500 transition-colors"
              data-testid={`button-speak-message-${message.id}`}
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-gray-600 dark:text-slate-300 h-4 w-4" />
        </div>
      )}
    </div>
  );
}
