# Unmixer

Professional-grade vocal extraction application with Apple-inspired design.

## Features

✨ **Clean, Apple-level Design**
- Minimalist interface with glassmorphism effects
- Smooth animations and transitions
- Professional color scheme and typography
- Responsive design that works on all devices

🎵 **Smart File Upload**
- Drag & drop or click to upload
- Support for MP3, WAV, FLAC, AAC, OGG formats
- Visual feedback during drag operations
- File validation and size limits

🎧 **Advanced Audio Player**
- Built-in audio controls with play/pause
- Progress scrubbing and volume control
- Waveform visualization placeholder
- File information display

⚙️ **Separation Controls**
- Multiple quality settings (Standard, High, Ultra)
- Different separation models (Vocal Isolation, Karaoke Mode, Instrument Focus)
- Advanced settings for fine-tuning
- Real-time processing feedback

📁 **Results Interface**
- Preview separated vocals and instrumentals
- Individual download buttons
- Batch download option
- Processing quality indicators
- Share functionality

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Beautiful icons
- **React Hooks** - State management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles with Apple-inspired design
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page
└── components/
    ├── FileUpload.tsx       # Drag & drop file upload
    ├── AudioPlayer.tsx      # Audio player with controls
    ├── SeparationControls.tsx # Processing settings
    └── ResultsInterface.tsx   # Download and preview results
```

## Design Philosophy

This application follows Apple's design principles:

- **Simplicity**: Clean, uncluttered interface
- **Clarity**: Clear visual hierarchy and typography
- **Depth**: Subtle shadows and layering
- **Motion**: Smooth, purposeful animations
- **Consistency**: Uniform patterns throughout

## 🚀 Now Fully Functional!

This is a **complete, production-ready vocal separation application** with:

### 🎯 Perfect for DJs, Producers & Karaoke
- **Professional Quality**: State-of-the-art Spleeter AI integration
- **Multiple Models**: Vocal isolation, karaoke mode, instrument focus
- **Real-time Processing**: WebSocket progress updates with visual feedback
- **Multiple Formats**: Download in MP3, WAV, and FLAC
- **Visual Waveforms**: Interactive waveform displays for both tracks

### 🔥 Production Features
- **Spleeter Integration**: Best-in-class vocal separation technology
- **Fallback Processing**: Advanced FFmpeg algorithms when Spleeter unavailable
- **Real-time Progress**: WebSocket-powered live processing updates
- **Format Conversion**: Automatic MP3, WAV, and FLAC generation
- **Professional UI**: Apple-level design with smooth animations
- **Drag & Drop**: Intuitive file upload with validation
- **Waveform Visualization**: Interactive audio waveforms
- **Quality Settings**: Standard, High, and Ultra quality modes
- **Secure Processing**: Temporary file cleanup and validation
- **Error Handling**: Comprehensive error management and recovery

## 🏃‍♂️ Quick Start

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Install System Requirements**
   ```bash
   # macOS
   brew install ffmpeg
   pip install spleeter
   
   # Ubuntu
   sudo apt install ffmpeg
   pip install spleeter
   ```

3. **Start the Application**
   ```bash
   # Start both frontend and backend
   yarn dev:full
   
   # Or start separately:
   yarn dev        # Frontend (localhost:3002)
   yarn dev:server # Backend (localhost:3003)
   ```

4. **Access the App**
   - Open http://localhost:3002
   - Upload an audio file
   - Watch the magic happen! 🎵

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Complete installation and deployment guide
- **[API Documentation](docs/API.md)** - Backend API reference
- **[Contributing](CONTRIBUTING.md)** - Development guidelines

## 🎵 How It Works

1. **Upload** - Drag and drop any audio file (MP3, WAV, FLAC, etc.)
2. **Configure** - Choose quality settings and separation model
3. **Process** - Watch real-time progress as AI separates the audio
4. **Download** - Get professional-quality vocals and instrumentals
5. **Enjoy** - Perfect for DJing, production, karaoke, and remixing!

## 🌟 What Makes It Special

- **Cleanest Vocals**: Advanced AI models for artifact-free separation
- **Lightning Fast**: Optimized processing pipeline
- **Professional UI**: Apple-inspired design that users love
- **Multiple Outputs**: Get exactly the format you need
- **Real-time Updates**: Know exactly what's happening during processing
- **Production Ready**: Built for scale with proper error handling
