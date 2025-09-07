'use client';

import { useState, useCallback } from 'react';
import { Upload, Music, FileAudio } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && isAudioFile(files[0])) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && isAudioFile(files[0])) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const isAudioFile = (file: File) => {
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/flac', 'audio/aac', 'audio/ogg'];
    return audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/i);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ease-out
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/50 scale-[1.02]' 
            : isHovered
              ? 'border-slate-300 bg-white/80 shadow-lg scale-[1.01]'
              : 'border-slate-200 bg-white/50 hover:bg-white/80'
          }
          backdrop-blur-sm shadow-sm hover:shadow-lg cursor-pointer
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className={`
              rounded-full p-6 transition-all duration-300
              ${isDragOver 
                ? 'bg-blue-100 text-blue-600 scale-110' 
                : isHovered
                  ? 'bg-slate-100 text-slate-600 scale-105'
                  : 'bg-slate-50 text-slate-500'
              }
            `}>
              {isDragOver ? (
                <FileAudio className="w-12 h-12" />
              ) : (
                <Upload className="w-12 h-12" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-medium text-slate-800">
              {isDragOver ? 'Drop your audio file' : 'Upload Audio File'}
            </h3>
            <p className="text-slate-600">
              {isDragOver 
                ? 'Release to upload your audio file' 
                : 'Drag and drop your audio file here, or click to browse'
              }
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Music className="w-4 h-4" />
                <span>MP3</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>WAV</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>FLAC</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>AAC</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>OGG</span>
            </div>
            <p className="text-xs text-slate-400">
              Maximum file size: 50MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}