# Unmixer Setup Guide

Complete setup guide for the professional vocal separation application.

## 🎯 What is Unmixer?

Unmixer is a production-ready vocal separation application that extracts vocals and instrumentals from audio files with professional quality results. It's perfect for:

- **DJs** - Create clean acapellas and instrumentals for mixing
- **Music Producers** - Isolate stems for remixing and sampling  
- **Karaoke Enthusiasts** - Generate high-quality backing tracks
- **Content Creators** - Extract clean vocals for covers and mashups

## ⚡ Quick Start

### Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org)
2. **FFmpeg** - Required for audio processing
3. **Python 3.7+** - For Spleeter integration (optional but recommended)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd unmixer
   yarn install
   ```

2. **Install FFmpeg**
   ```bash
   # macOS (using Homebrew)
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # Windows (using Chocolatey)
   choco install ffmpeg
   ```

3. **Install Spleeter (Optional but Recommended)**
   ```bash
   # Install Spleeter for best quality separation
   pip install spleeter
   
   # Pre-download models for faster processing
   spleeter separate -p spleeter:2stems audio.mp3
   ```

### Running the Application

1. **Start Both Frontend and Backend**
   ```bash
   # Option 1: Start both services together
   yarn dev:full
   
   # Option 2: Start separately (recommended for development)
   # Terminal 1 - Frontend (Next.js)
   yarn dev
   
   # Terminal 2 - Backend (API Server)
   yarn dev:server
   ```

2. **Access the Application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3003

## 🏗️ Architecture

### Frontend (Next.js + React)
- **Modern UI**: Apple-inspired design with glassmorphism effects
- **Real-time Updates**: WebSocket integration for processing progress
- **Waveform Visualization**: Interactive audio waveforms
- **Multiple Formats**: Download in MP3, WAV, or FLAC
- **Responsive Design**: Works on desktop, tablet, and mobile

### Backend (Node.js + Express)
- **AI Models**: Spleeter integration with fallback processing  
- **File Handling**: Secure upload with validation
- **Format Conversion**: FFmpeg-based audio processing
- **Progress Tracking**: Real-time WebSocket updates
- **Multiple Outputs**: Generate MP3, WAV, and FLAC formats

### Processing Pipeline
1. **File Upload** → Validate audio format and size
2. **AI Separation** → Process with Spleeter or fallback algorithms
3. **Format Conversion** → Generate multiple output formats
4. **Waveform Analysis** → Create visualization data
5. **Download Ready** → Secure file serving

## 🎵 Supported Formats

### Input Formats
- MP3, WAV, FLAC, AAC, OGG, M4A
- Maximum file size: 100MB
- Duration: Up to 10 minutes recommended

### Output Formats
- **MP3**: Compressed, small file size (192kbps)
- **WAV**: Uncompressed, best quality
- **FLAC**: Lossless compression, balanced quality/size

## ⚙️ Advanced Configuration

### Audio Processing Settings

1. **Quality Levels**
   - **Standard**: Fast processing, good quality
   - **High**: Best balance of speed and quality (recommended)
   - **Ultra**: Maximum quality, slower processing

2. **Separation Models**
   - **Vocal Isolation**: Best for separating vocals
   - **Karaoke Mode**: Optimized for karaoke tracks
   - **Instrument Focus**: Preserves instrumental clarity

### Environment Variables

Create a `.env.local` file for configuration:

```bash
# Server Configuration
PORT=3003
UPLOAD_LIMIT=100MB

# Processing Settings
DEFAULT_QUALITY=high
MAX_CONCURRENT_JOBS=3
CLEANUP_INTERVAL=3600000

# Spleeter Configuration
SPLEETER_MODELS_PATH=/path/to/spleeter/models
ENABLE_GPU_ACCELERATION=false
```

## 🔧 Production Deployment

### Docker Setup (Recommended)

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   # Install system dependencies
   RUN apk add --no-cache ffmpeg python3 py3-pip
   
   # Install Spleeter
   RUN pip3 install spleeter tensorflow
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000 3003
   
   CMD ["npm", "run", "start"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     unmixer:
       build: .
       ports:
         - "3000:3000"
         - "3003:3003"
       volumes:
         - ./uploads:/app/server/uploads
         - ./outputs:/app/server/outputs
       environment:
         - NODE_ENV=production
   ```

### Cloud Deployment Options

1. **Vercel** (Frontend only)
   ```bash
   vercel --prod
   ```

2. **Railway** (Full-stack)
   ```bash
   railway login
   railway deploy
   ```

3. **AWS/Google Cloud**
   - Use Docker container deployment
   - Configure load balancing for high traffic
   - Set up file storage (S3/Cloud Storage)

## 📊 Performance Optimization

### Processing Speed
- **CPU**: Multi-core processor recommended (4+ cores)
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: NVIDIA GPU for Spleeter acceleration (optional)
- **Storage**: SSD for faster I/O operations

### Scaling Tips
1. **Horizontal Scaling**: Run multiple backend instances
2. **Queue System**: Implement Redis-based job queue
3. **CDN**: Use CDN for static assets and downloads
4. **Caching**: Cache processed results for common files

## 🐛 Troubleshooting

### Common Issues

1. **"Spleeter not found" Error**
   ```bash
   # Solution: Install Spleeter
   pip install spleeter
   
   # Verify installation
   spleeter --version
   ```

2. **"FFmpeg not found" Error**
   ```bash
   # Solution: Install FFmpeg
   brew install ffmpeg  # macOS
   sudo apt install ffmpeg  # Ubuntu
   ```

3. **Port Already in Use**
   ```bash
   # Solution: Kill process or change port
   lsof -ti:3003 | xargs kill -9
   
   # Or change PORT in server/index.js
   ```

4. **Upload Fails**
   - Check file format (must be audio)
   - Verify file size (under 100MB)
   - Ensure server is running

5. **Processing Stuck**
   - Check server logs for errors
   - Restart backend server
   - Clear uploads/outputs directories

### Performance Issues

1. **Slow Processing**
   - Enable GPU acceleration if available
   - Reduce quality setting temporarily
   - Check available system resources

2. **Memory Issues**
   - Reduce concurrent processing jobs
   - Increase system RAM
   - Process shorter audio files

## 📝 Development

### Project Structure
```
unmixer/
├── src/                    # Frontend React components
│   ├── app/               # Next.js app directory
│   └── components/        # Reusable UI components
├── server/                # Backend Node.js server
│   ├── index.js          # Main server file
│   ├── uploads/          # Temporary file storage
│   └── outputs/          # Processed results
├── public/               # Static assets
└── docs/                # Documentation
```

### API Endpoints
- `POST /api/upload` - Upload audio file for processing
- `GET /api/status/:id` - Check processing status
- `GET /api/download/:id/:type` - Download separated audio
- `GET /api/waveform/:id/:type` - Get waveform data
- `GET /api/health` - Server health check

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - Feel free to use for commercial and personal projects.

## 🎉 You're Ready!

Your Unmixer installation is complete! Upload an audio file and experience professional-grade vocal separation.

For support, create an issue on GitHub or check the troubleshooting section above.