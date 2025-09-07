'use client';

import { useState } from 'react';
import { Wand2, Loader2, Settings, Mic, Music2 } from 'lucide-react';

interface SeparationControlsProps {
  onProcess: (quality: string, model: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function SeparationControls({ onProcess, isProcessing, disabled }: SeparationControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quality, setQuality] = useState('high');
  const [model, setModel] = useState('vocal_isolation');
  
  const qualities = [
    { value: 'standard', label: 'Standard', description: 'Good quality, faster processing' },
    { value: 'high', label: 'High', description: 'Best quality, longer processing time' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality, slowest processing' }
  ];

  const models = [
    { value: 'vocal_isolation', label: 'Vocal Isolation', description: 'Best for separating vocals' },
    { value: 'karaoke', label: 'Karaoke Mode', description: 'Optimized for karaoke tracks' },
    { value: 'instrument_focus', label: 'Instrument Focus', description: 'Preserves instrumental clarity' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-1">
              Separation Settings
            </h3>
            <p className="text-slate-600">
              Configure how you want to extract vocals and instruments
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Advanced</span>
          </button>
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Processing Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            >
              {qualities.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              {qualities.find(q => q.value === quality)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Separation Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              {models.find(m => m.value === model)?.description}
            </p>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="border-t border-slate-200 pt-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 flex items-center">
                  <Mic className="w-4 h-4 mr-2" />
                  Vocal Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Vocal Enhancement
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      disabled={disabled}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Noise Reduction
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="30"
                      disabled={disabled}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800 flex items-center">
                  <Music2 className="w-4 h-4 mr-2" />
                  Instrumental Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Bass Preservation
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="75"
                      disabled={disabled}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Stereo Width
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="60"
                      disabled={disabled}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="text-center">
          <button
            onClick={() => onProcess(quality, model)}
            disabled={disabled}
            className={`
              inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-medium text-lg transition-all transform
              ${disabled 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Audio...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Start Separation</span>
              </>
            )}
          </button>
          
          {!disabled && (
            <p className="text-sm text-slate-500 mt-3">
              Processing typically takes 30-90 seconds depending on file length and quality settings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}