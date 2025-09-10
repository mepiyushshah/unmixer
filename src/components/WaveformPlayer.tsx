'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import ClientOnly from './ClientOnly';

interface WaveformPlayerProps {
  audioUrl: string;
  waveformData?: number[];
  title: string;
  color: string;
  onPlay?: () => void;
  onPause?: () => void;
  isPlaying?: boolean;
}

export default function WaveformPlayer({
  audioUrl,
  waveformData,
  title,
  color,
  onPlay,
  onPause,
  isPlaying = false
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: `${color}40`,
      progressColor: color,
      cursorColor: color,
      barWidth: 2,
      barRadius: 3,
      barGap: 1,
      height: window.innerWidth < 768 ? 64 : 80, // Responsive height
      normalize: true,
      backend: 'MediaElement',
      mediaControls: false,
      plugins: [
        RegionsPlugin.create({
          regions: [],
          dragSelection: {
            slop: 5
          }
        })
      ]
    });

    wavesurferRef.current = wavesurfer;

    // Set up event listeners
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      // Removed autoplay - tracks should only play when user clicks Play
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('seek', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('finish', () => {
      if (onPause) onPause();
    });

    wavesurfer.on('pause', () => {
      if (onPause) onPause();
    });

    wavesurfer.on('play', () => {
      if (onPlay) onPlay();
    });

    // Load audio
    if (audioUrl && !audioUrl.includes('/demo-')) {
      wavesurfer.load(audioUrl);
    } else {
      // For demo mode, create a silent audio buffer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const duration = 180; // 3 minutes for demo
      const length = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate demo waveform data
      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        if (waveformData && waveformData.length > 0) {
          const index = Math.floor((i / length) * waveformData.length);
          data[i] = waveformData[index] * 0.1; // Very quiet demo audio
        } else {
          data[i] = Math.sin(time * 440) * 0.01; // Very quiet sine wave
        }
      }
      
      wavesurfer.loadDecodedData(buffer);
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, waveformData, color, onPlay, onPause]);

  // Sync external play/pause state
  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (isPlaying && wavesurfer.isPlaying() === false) {
      wavesurfer.play();
    } else if (!isPlaying && wavesurfer.isPlaying() === true) {
      wavesurfer.pause();
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (wavesurfer.isPlaying()) {
      wavesurfer.pause();
    } else {
      wavesurfer.play();
    }
  };

  const stopAudio = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    wavesurfer.stop();
    setCurrentTime(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const wavesurfer = wavesurferRef.current;
    if (wavesurfer) {
      wavesurfer.setVolume(newVolume);
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (isMuted) {
      wavesurfer.setVolume(volume);
      setIsMuted(false);
    } else {
      wavesurfer.setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <ClientOnly fallback={<div className="h-32 bg-slate-100 rounded-lg animate-pulse" />}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800">{title}</h4>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration || 180)}</span>
          </div>
        </div>

        {/* Waveform Container */}
        <div className="relative bg-slate-100 rounded-lg overflow-hidden mb-3 md:mb-4 hover:bg-slate-200 transition-colors">
          <div
            ref={containerRef}
            className="w-full h-16 md:h-20 cursor-pointer"
            style={{ minHeight: '64px' }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-slate-600"></div>
            </div>
          )}
          <div className="absolute bottom-1 right-2 text-xs text-slate-500 pointer-events-none">
            Click to seek
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={togglePlayPause}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs md:text-sm"
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 md:w-4 md:h-4" />
              ) : (
                <Play className="w-3 h-3 md:w-4 md:h-4" />
              )}
              <span className="font-medium">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
            
            <button
              onClick={stopAudio}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs md:text-sm"
              disabled={isLoading}
            >
              <Square className="w-3 h-3 md:w-4 md:h-4" />
              <span className="font-medium">Stop</span>
            </button>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={toggleMute}
              className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />
              ) : (
                <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 md:w-20 h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
        </div>

        <div className="text-sm text-slate-500 mt-2">
          {audioUrl.includes('/demo-') ? 'Demo mode - Generated waveform for testing' : 'Professional waveform visualization with seeking'}
        </div>
      </ClientOnly>
    </div>
  );
}
