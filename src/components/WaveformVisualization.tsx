'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import ClientOnly from './ClientOnly';

interface WaveformVisualizationProps {
  audioUrl: string;
  waveformData?: number[];
  title: string;
  color: string;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

export default function WaveformVisualization({
  audioUrl,
  waveformData,
  title,
  color,
  onPlay,
  onPause,
  isPlaying = false
}: WaveformVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const toneGeneratorRef = useRef<{oscillator: OscillatorNode, audioContext: AudioContext} | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // If no waveform data, generate a default pattern
    const dataToUse = waveformData && waveformData.length > 0 
      ? waveformData 
      : Array.from({ length: 200 }, (_, i) => {
          const time = i / 200;
          return Math.sin(time * 10) * 0.5 + Math.sin(time * 25) * 0.3;
        });

    const barWidth = width / dataToUse.length;
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const progressX = width * progressRatio;

    // Draw waveform bars
    dataToUse.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = Math.max(2, Math.abs(amplitude) * height * 0.8);
      const y = (height - barHeight) / 2;

      // Determine color based on progress
      const isPlayed = x < progressX;
      ctx.fillStyle = isPlayed ? color : `${color}60`;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });

    // Draw progress line
    if (isPlaying && progressX > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      drawWaveform();
    }
  }, [waveformData, currentTime, drawWaveform]);

  // Draw waveform when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (canvasRef.current) {
        drawWaveform();
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Set demo duration for demo files
    if (audioUrl.includes('/demo-')) {
      setDuration(180); // 3 minutes demo duration
      setIsLoading(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      if (onPause) onPause();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onPause]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickRatio = x / canvas.width;
    const newTime = duration * clickRatio;

    // For demo mode or when no audio element
    if (!audio || audioUrl.includes('/demo-')) {
      setCurrentTime(newTime);
      
      // If playing, restart from new position
      if (isPlaying && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const incrementedTime = prev + 1;
            if (incrementedTime >= (duration || 180)) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              if (onPause) onPause();
              return 0;
            }
            return incrementedTime;
          });
        }, 1000);
      }
    } else {
      // Real audio seeking
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const generateDemoTone = (type: 'vocals' | 'music') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'vocals') {
        // Higher frequency for vocals demo
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        oscillator.type = 'sine';
      } else {
        // Lower frequency for music demo
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
        oscillator.type = 'sawtooth';
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      return { oscillator, gainNode, audioContext };
    } catch {
      console.log('Web Audio API not supported');
      return null;
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    
    // For demo files or when no audio element, simulate playback
    if (!audio || audioUrl.includes('/demo-')) {
      if (isPlaying) {
        // Stop demo playback
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Stop tone generator
        if (toneGeneratorRef.current) {
          try {
            toneGeneratorRef.current.oscillator.stop();
            toneGeneratorRef.current.audioContext.close();
          } catch {
            // Ignore errors when stopping
          }
          toneGeneratorRef.current = null;
        }
        
        if (onPause) onPause();
      } else {
        // Start demo playback with tone generation
        if (onPlay) onPlay();
        
        // Generate demo tone based on title
        const isVocals = title.toLowerCase().includes('vocal');
        const toneGenerator = generateDemoTone(isVocals ? 'vocals' : 'music');
        
        if (toneGenerator) {
          toneGeneratorRef.current = toneGenerator;
          toneGenerator.oscillator.start();
        }
        
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            if (newTime >= (duration || 180)) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              
              // Stop tone when demo ends
              if (toneGeneratorRef.current) {
                try {
                  toneGeneratorRef.current.oscillator.stop();
                  toneGeneratorRef.current.audioContext.close();
                } catch {
                  // Ignore errors when stopping
                }
                toneGeneratorRef.current = null;
              }
              
              if (onPause) onPause();
              return 0;
            }
            return newTime;
          });
        }, 1000);
      }
      return;
    }

    // Real audio playback
    if (isPlaying) {
      audio.pause();
      if (onPause) onPause();
    } else {
      audio.play().catch(error => {
        console.error('Audio playback failed:', error);
        // Fallback to demo mode if real audio fails
        if (onPlay) onPlay();
      });
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    
    // Stop demo playback
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop tone generator
    if (toneGeneratorRef.current) {
      try {
        toneGeneratorRef.current.oscillator.stop();
        toneGeneratorRef.current.audioContext.close();
      } catch {
        // Ignore errors when stopping
      }
      toneGeneratorRef.current = null;
    }
    
    // Stop real audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    setCurrentTime(0);
    if (onPause) onPause();
  };

  // Cleanup interval on unmount or when stopping
  useEffect(() => {
    if (!isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (toneGeneratorRef.current) {
        try {
          toneGeneratorRef.current.oscillator.stop();
          toneGeneratorRef.current.audioContext.close();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <ClientOnly fallback={<div className="h-32 bg-slate-100 rounded-lg animate-pulse" />}>
        {/* Only render audio element if audioUrl exists and is not a demo path */}
        {audioUrl && !audioUrl.includes('/demo-') && <audio ref={audioRef} src={audioUrl} />}
        
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration || 180)}</span>
          </div>
        </div>

        {/* Interactive waveform visualization */}
        <div className="relative bg-slate-100 rounded-lg overflow-hidden mb-4 hover:bg-slate-200 transition-colors">
          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="w-full h-20 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleCanvasClick}
            title="Click anywhere to seek to that position"
          />
          <div className="absolute bottom-1 right-2 text-xs text-slate-500 pointer-events-none">
            Click to seek
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
            
            <button
              onClick={stopAudio}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span className="text-sm font-medium">Stop</span>
            </button>
          </div>

          <div className="text-sm text-slate-500">
            {audioUrl.includes('/demo-') ? 'Demo mode - Generated tones for testing' : 'Click on waveform to seek'}
          </div>
        </div>
      </ClientOnly>
    </div>
  );
}