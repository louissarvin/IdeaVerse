import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);


  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-700 text-white';
      case 'error':
        return 'bg-red-500 border-red-700 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-700 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-700 text-white';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999] min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div 
        className={`
          ${getColorClasses()}
          border-4 shadow-2xl rounded-none
        `}
        style={{
          imageRendering: 'pixelated'
        }}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider leading-tight mb-1">
                {title}
              </h4>
              {message && (
                <p className="text-xs text-white/90 leading-tight">
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-6 h-6 border-2 border-white/30 hover:border-white/60 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;