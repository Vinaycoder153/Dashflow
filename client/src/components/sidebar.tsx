import { CloudSun, Mail, Search, Database, Mic } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { UserSettings } from '@/types/voice-assistant';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: Partial<UserSettings>) => void;
  sessionStats: {
    messages: number;
    uptime: string;
  };
}

export function Sidebar({ isOpen, onClose, settings, onSettingsChange, sessionStats }: SidebarProps) {
  return (
    <aside 
      className={`fixed lg:relative z-30 w-80 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      data-testid="sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100" data-testid="text-app-title">
                AI Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400" data-testid="text-app-subtitle">
                Developer Dashboard
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            data-testid="button-close-sidebar"
          >
            ×
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3" data-testid="text-stats-title">
          Session Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50 dark:bg-blue-900/20 p-3 border-0">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400" data-testid="text-message-count">
              {sessionStats.messages}
            </div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Messages</div>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 p-3 border-0">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400" data-testid="text-uptime">
              {sessionStats.uptime}
            </div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70">Uptime</div>
          </Card>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4" data-testid="text-voice-settings-title">
          Voice Settings
        </h3>
        
        {/* Voice Speed */}
        <div className="mb-4">
          <Label className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 mb-2">
            <span>Speech Speed</span>
            <span className="font-medium" data-testid="text-speed-value">
              {settings.voiceSpeed}x
            </span>
          </Label>
          <Slider
            value={[parseFloat(settings.voiceSpeed)]}
            onValueChange={(value) => onSettingsChange({ voiceSpeed: value[0].toString() })}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
            data-testid="slider-voice-speed"
          />
        </div>

        {/* Voice Pitch */}
        <div className="mb-4">
          <Label className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 mb-2">
            <span>Voice Pitch</span>
            <span className="font-medium" data-testid="text-pitch-value">
              {settings.voicePitch}x
            </span>
          </Label>
          <Slider
            value={[parseFloat(settings.voicePitch)]}
            onValueChange={(value) => onSettingsChange({ voicePitch: value[0].toString() })}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
            data-testid="slider-voice-pitch"
          />
        </div>

        {/* Auto Scroll Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-scroll" className="text-sm text-gray-600 dark:text-slate-400">
            Auto-scroll
          </Label>
          <Switch
            id="auto-scroll"
            checked={settings.autoScroll}
            onCheckedChange={(checked) => onSettingsChange({ autoScroll: checked })}
            data-testid="switch-auto-scroll"
          />
        </div>
      </div>

      {/* Tools & Integrations */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4" data-testid="text-tools-title">
          Available Tools
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800" data-testid="tool-weather">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CloudSun className="text-blue-600 dark:text-blue-400 h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Weather</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Real-time weather data</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800" data-testid="tool-email">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Mail className="text-green-600 dark:text-green-400 h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Email</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Send & manage emails</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800" data-testid="tool-search">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Search className="text-purple-600 dark:text-purple-400 h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Web Search</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Search the web</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-800" data-testid="tool-database">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Database className="text-orange-600 dark:text-orange-400 h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">Database</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Query & manage data</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
