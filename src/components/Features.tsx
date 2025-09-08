'use client';

import { Music, Zap, Shield, Download, Headphones, Activity } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: "AI-Powered Separation",
      description: "State-of-the-art machine learning models trained on millions of songs for perfect vocal isolation.",
      color: "bg-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Process your audio files in seconds, not minutes. Get results faster than any other solution.",
      color: "bg-yellow-500"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Studio Quality",
      description: "Professional-grade output suitable for commercial use, mixing, and mastering projects.",
      color: "bg-purple-500"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Multiple Formats",
      description: "Download your separated tracks in MP3, WAV, or FLAC formats to suit your workflow.",
      color: "bg-green-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your audio files are processed securely and automatically deleted after processing.",
      color: "bg-red-500"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Real-time Preview",
      description: "Visualize waveforms and preview your separated tracks before downloading.",
      color: "bg-indigo-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white via-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Unmixer</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced AI technology meets professional audio engineering to deliver unmatched vocal separation quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white hover:shadow-lg p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
            >
              <div className={`${feature.color} text-white p-3 rounded-xl mb-6 w-fit group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-blue-100">Tracks Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt;30s</div>
              <div className="text-blue-100">Average Processing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}