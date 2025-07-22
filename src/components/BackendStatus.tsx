import React, { useState, useEffect } from 'react';
import { AlertCircle, Database, Loader } from 'lucide-react';
import { ApiService } from '../services/api';

const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'syncing' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      const health = await ApiService.getHealth();
      
      // Check if health response indicates ready service
      if (health.success && health.data) {
        setStatus('ready');
        setMessage('Backend is ready for use');
      } else if (health.data?.status === 'degraded') {
        // Check specific service issues
        const services = health.data?.services;
        if (services?.blockchain?.status === 'disconnected') {
          setStatus('syncing');
          setMessage('Backend starting up - connecting to blockchain network...');
        } else {
          setStatus('syncing');
          setMessage('Backend is starting up - indexer waiting to start...');
        }
      } else {
        setStatus('syncing');
        setMessage('Backend is syncing...');
      }
    } catch (error: unknown) {
      console.log('Backend status error:', error);
      
      // Check if it's a 503 error (service unavailable but running)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 503) {
          setStatus('syncing');
          setMessage('Backend is starting up - indexer waiting to start...');
          return;
        }
      }
      
      // Check for database not ready error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('Database is not ready')) {
          setStatus('syncing');
          setMessage('Blockchain indexer is syncing database...');
          return;
        }
      }
      
      // Check for network connection errors (server not running)
      if (error && typeof error === 'object') {
        const errorObj = error as { code?: string; message?: string };
        if (errorObj.code === 'ERR_NETWORK' || 
            errorObj.code === 'ECONNREFUSED' ||
            errorObj.message?.includes('Network Error') ||
            errorObj.message?.includes('ECONNREFUSED')) {
          setStatus('error');
          setMessage('Backend server is not running');
          return;
        }
      }
      
      // For 503 errors or other backend issues, assume syncing
      setStatus('syncing');
      setMessage('Backend is starting up...');
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-gray-100 border-2 border-gray-300 p-3 max-w-sm shadow-lg">
        <div className="flex items-center space-x-2">
          <Loader className="w-4 h-4 text-gray-600 animate-spin" />
          <span className="font-pixel font-bold text-pixel-xs text-gray-700 uppercase tracking-wider">
            Checking Backend...
          </span>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return null; // Don't show anything when ready
  }

  const bgColor = status === 'syncing' ? 'bg-yellow-100 border-yellow-400' : 'bg-red-100 border-red-400';
  const textColor = status === 'syncing' ? 'text-yellow-800' : 'text-red-800';
  const icon = status === 'syncing' ? 
    <Database className="w-4 h-4 text-yellow-600" /> : 
    <AlertCircle className="w-4 h-4 text-red-600" />;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border-2 p-3 max-w-sm shadow-lg`}>
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <span className={`font-pixel font-bold text-pixel-xs ${textColor} uppercase tracking-wider`}>
          {status === 'syncing' ? 'Backend Syncing' : 'Backend Error'}
        </span>
      </div>
      <div className="flex items-start space-x-2">
        <div>
          <p className="font-orbitron text-pixel-xs text-gray-700 uppercase tracking-wide leading-tight">
            {message}
          </p>
          {status === 'syncing' && (
            <p className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide mt-1">
              Features will be available once syncing completes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;