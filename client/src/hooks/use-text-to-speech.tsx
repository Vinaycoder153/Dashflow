import { useState, useCallback, useRef } from 'react';
import { TextToSpeechService } from '@/lib/speech-api';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const serviceRef = useRef<TextToSpeechService | null>(null);

  // Initialize service
  const initializeService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new TextToSpeechService();
    }
  }, []);

  const speak = useCallback(async (text: string, options: { rate?: number; pitch?: number } = {}) => {
    initializeService();
    
    if (!serviceRef.current) return;

    setIsSpeaking(true);
    
    try {
      await serviceRef.current.speak(text, options);
    } catch (error) {
      console.error('Text-to-speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [initializeService]);

  const stop = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
    setIsSpeaking(false);
  }, []);

  const getVoices = useCallback(() => {
    initializeService();
    return serviceRef.current?.getVoices() || [];
  }, [initializeService]);

  return {
    isSpeaking,
    speak,
    stop,
    getVoices,
  };
}
