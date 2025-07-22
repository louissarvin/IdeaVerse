import React from 'react';
import { AlertCircle, Monitor } from 'lucide-react';
import { DevModeService } from '../services/dev-mode';

const DevModeIndicator: React.FC = () => {
  if (!DevModeService.isEnabled()) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-100 border-2 border-blue-400 p-3 max-w-sm shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Monitor className="w-4 h-4 text-blue-600" />
        <span className="font-pixel font-bold text-pixel-xs text-blue-800 uppercase tracking-wider">
          Local Mode
        </span>
      </div>
      <div className="flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide leading-tight">
            Running in local simulation mode for testing.
          </p>
          <p className="font-orbitron text-pixel-xs text-blue-600 uppercase tracking-wide mt-1">
            Features work locally but won't persist to blockchain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevModeIndicator;