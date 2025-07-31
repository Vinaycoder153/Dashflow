import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Paperclip, Plus, CloudSun, Clock, Mail, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onStartVoiceRecording: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

export function InputArea({ onSendMessage, onStartVoiceRecording, isRecording, disabled }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickActions = {
      weather: "What's the weather like today?",
      time: "What time is it?",
      email: "Help me send an email",
      search: "Search for something on the web",
    };
    
    const actionMessage = quickActions[action as keyof typeof quickActions];
    if (actionMessage) {
      setMessage(actionMessage);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4" data-testid="input-area">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          {/* Voice Button */}
          <Button
            onClick={onStartVoiceRecording}
            disabled={disabled}
            className={`flex-shrink-0 w-12 h-12 rounded-xl transition-all duration-200 hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            title="Start Voice Recording (Ctrl+M)"
            data-testid="button-voice-recording"
          >
            <Mic className="h-5 w-5 text-white" />
          </Button>
          
          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message or click the microphone to speak..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="resize-none pr-12 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              rows={1}
              data-testid="input-message"
            />
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="sm"
              className="absolute right-2 bottom-2 w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600"
              title="Send Message (Enter)"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            {/* File Upload */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
              title="Attach File"
              data-testid="button-attach-file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0"
                  title="Quick Actions"
                  data-testid="button-quick-actions"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" data-testid="dropdown-quick-actions">
                <DropdownMenuItem onClick={() => handleQuickAction('weather')} data-testid="action-weather">
                  <CloudSun className="h-4 w-4 mr-2 text-blue-500" />
                  Get Weather
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction('time')} data-testid="action-time">
                  <Clock className="h-4 w-4 mr-2 text-green-500" />
                  Current Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction('email')} data-testid="action-email">
                  <Mail className="h-4 w-4 mr-2 text-purple-500" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction('search')} data-testid="action-search">
                  <Search className="h-4 w-4 mr-2 text-orange-500" />
                  Web Search
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Info */}
        <div className="mt-2 text-xs text-gray-500 dark:text-slate-400 text-center" data-testid="keyboard-shortcuts">
          <span className="inline-flex items-center space-x-4">
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+M</kbd> Voice</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+K</kbd> Focus</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Enter</kbd> Send</span>
          </span>
        </div>
      </div>
    </div>
  );
}
