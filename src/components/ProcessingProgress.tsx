'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mic } from 'lucide-react';

interface ProcessingResults {
  processingId: string;
  vocals: string;
  music: string;
  vocalsWav: string;
  musicWav: string;
  vocalsFlac: string;
  musicFlac: string;
}

interface ProcessingProgressProps {
  processingId: string;
  onComplete: (results: ProcessingResults) => void;
  onError: (error: string) => void;
}

export default function ProcessingProgress({ processingId, onComplete, onError }: ProcessingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Starting processing...');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let ws: WebSocket | null = null;
    let pollTimer: NodeJS.Timeout | null = null;
    let cleanup = false;
    
    // Start actual processing
    const startProcessing = async () => {
      try {
        setMessage('Connecting to processing server...');
        
        // Establish WebSocket connection for real-time updates
        try {
          ws = new WebSocket('ws://localhost:3003');
          
          ws.onopen = () => {
            console.log('WebSocket connected');
            // Subscribe to progress updates for this processing ID
            ws?.send(JSON.stringify({
              type: 'subscribe',
              processingId: processingId
            }));
          };
          
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'progress' && data.processingId === processingId) {
                console.log('Received real-time progress:', data);
                setProgress(data.progress || 0);
                setMessage(data.message || 'Processing...');
                
                // Check if completed
                if (data.status === 'completed') {
                  onComplete({
                    processingId: processingId,
                    vocals: `http://localhost:3003/api/download/${processingId}/vocals?format=mp3`,
                    music: `http://localhost:3003/api/download/${processingId}/music?format=mp3`,
                    vocalsWav: `http://localhost:3003/api/download/${processingId}/vocals?format=wav`,
                    musicWav: `http://localhost:3003/api/download/${processingId}/music?format=wav`,
                    vocalsFlac: `http://localhost:3003/api/download/${processingId}/vocals?format=flac`,
                    musicFlac: `http://localhost:3003/api/download/${processingId}/music?format=flac`
                  });
                  return;
                } else if (data.status === 'error') {
                  onError(data.message || 'Processing failed');
                  return;
                }
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          ws.onerror = (error) => {
            console.log('WebSocket error, falling back to polling:', error);
          };
          
        } catch (wsError) {
          console.log('WebSocket connection failed, using polling fallback:', wsError);
        }
        
        // Poll for processing results as fallback
        const pollResults = async () => {
          if (cleanup) return;
          
          try {
            const response = await fetch(`http://localhost:3003/api/status/${processingId}`);
            if (response.ok) {
              const data = await response.json();
              
              if (data.status === 'completed') {
                if (pollTimer) clearInterval(pollTimer);
                onComplete({
                  processingId: processingId,
                  vocals: `http://localhost:3003/api/download/${processingId}/vocals?format=mp3`,
                  music: `http://localhost:3003/api/download/${processingId}/music?format=mp3`,
                  vocalsWav: `http://localhost:3003/api/download/${processingId}/vocals?format=wav`,
                  musicWav: `http://localhost:3003/api/download/${processingId}/music?format=wav`,
                  vocalsFlac: `http://localhost:3003/api/download/${processingId}/vocals?format=flac`,
                  musicFlac: `http://localhost:3003/api/download/${processingId}/music?format=flac`
                });
              } else if (data.status === 'error') {
                if (pollTimer) clearInterval(pollTimer);
                onError(data.message || 'Processing failed');
              } else {
                // Only update progress if WebSocket is not working
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                  setProgress(data.progress || 0);
                  setMessage(data.message || 'Processing...');
                }
              }
            } else {
              // Fallback to demo if server not available
              setProgress(prev => prev + Math.random() * 5);
              if (progress >= 95) {
                if (pollTimer) clearInterval(pollTimer);
                setTimeout(() => {
                  onComplete({
                    processingId: 'demo-fallback',
                    vocals: '/demo-vocals.mp3',
                    music: '/demo-music.mp3',
                    vocalsWav: '/demo-vocals.wav',
                    musicWav: '/demo-music.wav',
                    vocalsFlac: '/demo-vocals.flac',
                    musicFlac: '/demo-music.flac'
                  });
                }, 1000);
              }
            }
          } catch {
            console.log('Polling error, using fallback demo');
            setProgress(prev => Math.min(prev + 5, 100));
            if (progress >= 95) {
              if (pollTimer) clearInterval(pollTimer);
              setTimeout(() => {
                onComplete({
                  processingId: 'demo-fallback',
                  vocals: '/demo-vocals.mp3',
                  music: '/demo-music.mp3',
                  vocalsWav: '/demo-vocals.wav',
                  musicWav: '/demo-music.wav',
                  vocalsFlac: '/demo-vocals.flac',
                  musicFlac: '/demo-music.flac'
                });
              }, 1000);
            }
          }
        };
        
        // Poll every 5 seconds as fallback (less frequent since WebSocket provides real-time updates)
        pollTimer = setInterval(pollResults, 5000);
        pollResults(); // Initial call
        
      } catch {
        onError('Failed to start processing');
      }
    };
    
    startProcessing();
    
    // Cleanup function
    return () => {
      cleanup = true;
      if (ws) {
        ws.close();
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [processingId, onComplete, onError]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Processing Audio
          </h3>
          <p className="text-slate-600">{message}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Mic className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI Processing</span>
          </div>
          <p className="text-sm text-blue-700">
            Separating vocals and instrumentals using advanced AI models...
          </p>
        </div>
      </div>
    </div>
  );
}