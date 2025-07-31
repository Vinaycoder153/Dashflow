import { Moon, Sun, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

interface TopBarProps {
  isConnected: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ isConnected, isSidebarOpen, onToggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between" data-testid="top-bar">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
          data-testid="button-toggle-sidebar"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} data-testid="status-indicator" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300" data-testid="text-connection-status">
            {isConnected ? 'Assistant Online' : 'Connecting...'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          title="Toggle Theme"
          data-testid="button-toggle-theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          title="Settings"
          data-testid="button-settings"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-slate-400" />
        </Button>
        
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400" data-testid="text-status-live">Live</span>
        </div>
      </div>
    </header>
  );
}
