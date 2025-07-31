import { useState, useEffect, useCallback } from 'react';
import { TopBar } from '@/components/top-bar';
import { Sidebar } from '@/components/sidebar';
import { ChatArea } from '@/components/chat-area';
import { InputArea } from '@/components/input-area';
import { VoiceVisualizer } from '@/components/voice-visualizer';
import { useWebSocket } from '@/hooks/use-websocket';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings } from '@/types/voice-assistant';

export default function VoiceAssistant() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    userId: null,
    voiceSpeed: "1.0",
    voicePitch: "1.0",
    autoScroll: true,
    theme: "light",
    updatedAt: null,
  });

  const { isConnected, messages, sendMessage, setMessages } = useWebSocket();
  const { isRecording, isSupported: isVoiceSupported, startRecording, stopRecording } = useVoiceRecognition();
  const { speak } = useTextToSpeech();
  const { toast } = useToast();

  // Create chat session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/chat-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'default-user' }),
        });
        const data = await response.json();
        setSessionId(data.session.id);
      } catch (error) {
        console.error('Failed to create session:', error);
        toast({
          title: "Session Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
      }
    };

    createSession();
  }, [toast]);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/default-user');
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  const handleSettingsChange = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await fetch('/api/settings/default-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  // Handle voice recording
  const handleStartVoiceRecording = useCallback(async () => {
    if (!isVoiceSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const transcript = await startRecording();
      if (transcript && sessionId) {
        handleSendMessage(transcript);
      }
    } catch (error) {
      console.error('Voice recording error:', error);
    }
  }, [isVoiceSupported, startRecording, sessionId, toast]);

  // Handle message sending
  const handleSendMessage = useCallback((message: string) => {
    if (!sessionId || !message.trim()) return;

    setIsTyping(true);
    sendMessage(sessionId, message.trim());
    
    // Hide typing indicator after a delay (will be updated by real response)
    setTimeout(() => setIsTyping(false), 3000);
  }, [sessionId, sendMessage]);

  // Handle text-to-speech
  const handleSpeak = useCallback((text: string) => {
    speak(text, {
      rate: parseFloat(settings.voiceSpeed),
      pitch: parseFloat(settings.voicePitch),
    });
  }, [speak, settings.voiceSpeed, settings.voicePitch]);

  // Calculate session stats
  const sessionStats = {
    messages: messages.length,
    uptime: (() => {
      const diff = new Date().getTime() - sessionStartTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      return `${minutes}m`;
    })(),
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector<HTMLTextAreaElement>('[data-testid="input-message"]')?.focus();
            break;
          case 'm':
            e.preventDefault();
            if (isRecording) {
              stopRecording();
            } else {
              handleStartVoiceRecording();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, handleStartVoiceRecording, stopRecording]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950" data-testid="voice-assistant-app">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        sessionStats={sessionStats}
      />
      
      <main className="flex-1 flex flex-col h-screen">
        <TopBar
          isConnected={isConnected}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          autoScroll={settings.autoScroll}
          onSpeak={handleSpeak}
        />
        
        <InputArea
          onSendMessage={handleSendMessage}
          onStartVoiceRecording={handleStartVoiceRecording}
          isRecording={isRecording}
          disabled={!isConnected || !sessionId}
        />
      </main>
      
      <VoiceVisualizer
        isVisible={isRecording}
        onStop={stopRecording}
      />
    </div>
  );
}
