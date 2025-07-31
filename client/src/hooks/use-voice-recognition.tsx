import { useState, useCallback, useRef } from 'react';
import { SpeechRecognitionService } from '@/lib/speech-api';
import { useToast } from '@/hooks/use-toast';

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const serviceRef = useRef<SpeechRecognitionService | null>(null);
  const { toast } = useToast();

  // Initialize service
  const initializeService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new SpeechRecognitionService();
      setIsSupported(serviceRef.current.isAvailable());
    }
  }, []);

  const startRecording = useCallback(async (): Promise<string> => {
    initializeService();
    
    if (!serviceRef.current?.isAvailable()) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      throw new Error('Speech recognition not supported');
    }

    setIsRecording(true);
    
    try {
      const transcript = await serviceRef.current.start();
      setIsRecording(false);
      return transcript;
    } catch (error) {
      setIsRecording(false);
      toast({
        title: "Voice Recognition Error",
        description: error instanceof Error ? error.message : "Failed to recognize speech",
        variant: "destructive",
      });
      throw error;
    }
  }, [initializeService, toast]);

  const stopRecording = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Initialize on first use
  if (!serviceRef.current) {
    initializeService();
  }

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
  };
}
