'use client';

import { Upload, Cpu, Download } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload Your Audio",
      description: "Drag and drop your audio file or click to browse. We support MP3, WAV, FLAC, and more.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "AI Processing",
      description: "Our advanced AI models analyze and separate vocals from instrumentals with precision.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Download Results",
      description: "Get your separated vocal and instrumental tracks in your preferred format.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, fast, and professional. Get studio-quality vocal separation in just three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Number */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} text-white rounded-2xl mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent transform translate-x-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Demo Section */}
        <div className="mt-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-2xl p-12 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h3>
            <p className="text-lg text-gray-600">Watch how Unmixer transforms your audio files</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center h-64 border border-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500">Interactive demo coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}