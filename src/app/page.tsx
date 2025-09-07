'use client';

import FileUpload from '@/components/FileUpload';
import AudioPlayer from '@/components/AudioPlayer';
import SeparationControls from '@/components/SeparationControls';
import ProcessingProgress from '@/components/ProcessingProgress';
import ResultsInterface from '@/components/ResultsInterface';
import { useState } from 'react';

type AppState = 'upload' | 'preview' | 'processing' | 'results' | 'error';

interface ProcessingResults {
  processingId: string;
  vocals: string;
  music: string;
  vocalsWav?: string;
  musicWav?: string;
  vocalsFlac?: string;
  musicFlac?: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingId, setProcessingId] = useState<string>('');
  const [results, setResults] = useState<ProcessingResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAppState('preview');
    setResults(null);
    setError('');
  };

  const handleProcessing = async (quality: string, model: string) => {
    if (!uploadedFile) return;

    setAppState('processing');
    
    try {
      const formData = new FormData();
      formData.append('audio', uploadedFile);
      formData.append('quality', quality);
      formData.append('model', model);

      const response = await fetch('http://localhost:3003/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setProcessingId(data.processingId);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to start processing. Please try again.');
      setAppState('error');
    }
  };

  const handleProcessingComplete = (processedResults: ProcessingResults) => {
    setResults(processedResults);
    setAppState('results');
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setAppState('error');
  };

  const resetApp = () => {
    setAppState('upload');
    setUploadedFile(null);
    setProcessingId('');
    setResults(null);
    setError('');
  };

  const goBackToUpload = () => {
    setAppState('upload');
    setUploadedFile(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-light text-slate-800 mb-4 tracking-tight">
            Unmixer
          </h1>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Extract vocals and instrumentals from any audio file with 
            <span className="font-medium text-slate-800"> professional quality</span>
          </p>
          
          {/* Status Indicator */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              ['upload'].includes(appState) ? 'bg-blue-500' : 'bg-slate-300'
            }`} />
            <div className="h-px w-8 bg-slate-300" />
            <div className={`w-3 h-3 rounded-full ${
              ['preview'].includes(appState) ? 'bg-blue-500' : 'bg-slate-300'
            }`} />
            <div className="h-px w-8 bg-slate-300" />
            <div className={`w-3 h-3 rounded-full ${
              ['processing'].includes(appState) ? 'bg-blue-500' : 'bg-slate-300'
            }`} />
            <div className="h-px w-8 bg-slate-300" />
            <div className={`w-3 h-3 rounded-full ${
              ['results'].includes(appState) ? 'bg-green-500' : 'bg-slate-300'
            }`} />
          </div>
        </div>

        {/* Main Interface */}
        <div className="space-y-8">
          {appState === 'upload' && (
            <FileUpload onFileUpload={handleFileUpload} />
          )}

          {appState === 'preview' && uploadedFile && (
            <>
              <AudioPlayer file={uploadedFile} />
              <SeparationControls 
                onProcess={handleProcessing}
                isProcessing={false}
                disabled={false}
              />
              <div className="text-center">
                <button
                  onClick={goBackToUpload}
                  className="text-slate-600 hover:text-slate-800 text-sm underline"
                >
                  Upload a different file
                </button>
              </div>
            </>
          )}

          {appState === 'processing' && processingId && (
            <ProcessingProgress 
              processingId={processingId}
              onComplete={handleProcessingComplete}
              onError={handleProcessingError}
            />
          )}

          {appState === 'results' && results && (
            <ResultsInterface results={results} />
          )}

          {appState === 'error' && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Processing Failed</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={resetApp}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-slate-200">
          <div className="text-center space-y-4">
            <p className="text-slate-500 text-sm">
              Professional-grade vocal extraction powered by Spleeter AI • Perfect for DJs, Producers, and Karaoke
            </p>
            <div className="flex justify-center space-x-6 text-xs text-slate-400">
              <span>🎧 State-of-the-art AI models</span>
              <span>⚡ Fast processing</span>
              <span>🎵 Multiple formats</span>
              <span>🔒 Secure & private</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
