'use client';

import { useState, useCallback } from 'react';
import { Upload, Music, FileAudio, Headphones, Mic, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const router = useRouter();

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
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && isAudioFile(files[0])) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    // Store file in sessionStorage and navigate to app with the file
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
    sessionStorage.setItem('uploadedFile', JSON.stringify(fileData));
    sessionStorage.setItem('uploadedFileBlob', URL.createObjectURL(file));
    
    // Navigate to app page
    router.push('/app?uploaded=true');
  };

  const isAudioFile = (file: File) => {
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/flac', 'audio/aac', 'audio/ogg'];
    return audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/i);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Main Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight whitespace-nowrap">
            AI Vocal Remover & Karaoke
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            High-quality stem splitting based on the world's #1 AI-powered technology
          </p>

          {/* Upload Area - Centered */}
          <div className="max-w-2xl mx-auto mb-8">
            <div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragOver 
                  ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                }
                cursor-pointer
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`
                    rounded-full p-6 transition-all duration-300
                    ${isDragOver 
                      ? 'bg-blue-100 text-blue-600 scale-110' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                    }
                  `}>
                    {isDragOver ? (
                      <FileAudio className="w-10 h-10" />
                    ) : (
                      <Upload className="w-10 h-10" />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {isDragOver ? 'Drop your audio file here' : 'Choose audio file to upload'}
                  </h3>
                  <p className="text-gray-600">
                    {isDragOver 
                      ? 'Release to start processing' 
                      : 'or drag and drop it here'
                    }
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>MP3</span>
                  </div>
                  <span>•</span>
                  <span>WAV</span>
                  <span>•</span>
                  <span>FLAC</span>
                  <span>•</span>
                  <span>AAC</span>
                  <span>•</span>
                  <span>OGG</span>
                </div>

                <p className="text-xs text-gray-400">
                  Maximum file size: 50MB
                </p>
              </div>

              {!isDragOver && (
                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Select audio file</span>
                </button>
              )}
            </div>
          </div>

          {/* Terms of Service Note */}
          <p className="text-xs text-gray-500 mb-12">
            By uploading a file, you agree to our Terms of Service
          </p>

          {/* Feature Icons - Centered below upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Studio Quality</div>
                <div className="text-sm text-gray-600">Professional results</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Clean Separation</div>
                <div className="text-sm text-gray-600">AI-powered isolation</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Fast Processing</div>
                <div className="text-sm text-gray-600">Results in seconds</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}