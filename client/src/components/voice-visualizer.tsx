import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface VoiceVisualizerProps {
  isVisible: boolean;
  onStop: () => void;
}

export function VoiceVisualizer({ isVisible, onStop }: VoiceVisualizerProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" data-testid="voice-visualizer">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mic className="text-white h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2" data-testid="text-listening">
            Listening...
          </h3>
          <p className="text-gray-600 dark:text-slate-400 text-sm mb-4" data-testid="text-speak-instruction">
            Speak clearly into your microphone
          </p>
          
          {/* Voice Wave Animation */}
          <div className="flex items-center justify-center space-x-1 mb-4" data-testid="voice-wave-animation">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 20}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
          
          <Button
            onClick={onStop}
            variant="destructive"
            data-testid="button-stop-recording"
          >
            Stop Recording
          </Button>
        </div>
      </div>
    </div>
  );
}
