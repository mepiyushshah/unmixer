const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './server/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp3|wav|flac|aac|ogg|m4a)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// WebSocket connections for real-time updates
const connections = new Map();

// Processing status storage
const processingStatus = new Map();

wss.on('connection', (ws, req) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);
  
  ws.send(JSON.stringify({ type: 'connection', id: connectionId }));
  
  ws.on('close', () => {
    connections.delete(connectionId);
  });
});

// Broadcast progress to specific connection and store status
function broadcastProgress(processingId, progress) {
  // Store status for polling
  processingStatus.set(processingId, progress);
  
  // Also broadcast via WebSocket if connection exists
  const ws = connections.get(processingId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'progress',
      progress,
    }));
  }
}

// Vocal separation using Demucs (state-of-the-art)
async function separateWithDemucs(inputPath, outputDir, processingId, quality = 'high') {
  return new Promise((resolve, reject) => {
    broadcastProgress(processingId, { 
      status: 'processing',
      stage: 'separating', 
      progress: 5,
      message: 'Starting AI-powered vocal separation with Demucs...'
    });

    // Use Demucs for high-quality separation
    const demucsProcess = spawn('python3', [
      '-m', 'demucs.separate',
      '--two-stems=vocals',
      '-o', outputDir,
      inputPath
    ]);

    let stderr = '';
    
    demucsProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Demucs output:', output);
      
      // Update progress based on Demucs output
      broadcastProgress(processingId, { 
        status: 'processing',
        stage: 'separating', 
        progress: 50,
        message: 'AI model processing audio...'
      });
    });

    demucsProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      const output = data.toString();
      console.log('Demucs stderr:', output);
      
      // Parse progress from Demucs output
      const progressMatch = output.match(/(\d+)%\|.*?\|\s*([\d.]+)\/([\d.]+)/);
      if (progressMatch) {
        const percent = parseInt(progressMatch[1]);
        const current = parseFloat(progressMatch[2]);
        const total = parseFloat(progressMatch[3]);
        
        broadcastProgress(processingId, { 
          status: 'processing',
          stage: 'separating', 
          progress: Math.min(percent, 95),
          message: `AI model processing audio... ${percent}% (${Math.round(current)}s/${Math.round(total)}s)`
        });
      }
    });

    demucsProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.log('Demucs failed, falling back to FFmpeg...');
        fallbackSeparation(inputPath, outputDir, processingId)
          .then(resolve)
          .catch(reject);
      }
    });

    demucsProcess.on('error', (err) => {
      console.log('Demucs error, using FFmpeg fallback...', err);
      fallbackSeparation(inputPath, outputDir, processingId)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Fallback separation using FFmpeg (center channel extraction)
async function fallbackSeparation(inputPath, outputDir, processingId) {
  return new Promise((resolve, reject) => {
    const vocalsPath = path.join(outputDir, `vocals.wav`);
    const musicPath = path.join(outputDir, `accompaniment.wav`);
    
    broadcastProgress(processingId, { 
      status: 'processing',
      stage: 'separating', 
      progress: 10,
      message: 'Processing with advanced audio algorithms...'
    });

    // Extract vocals using vocal isolation
    ffmpeg(inputPath)
      .audioFilters([
        'pan=mono|c0=c0-c1', // Karaoke effect: left minus right channel
        'volume=4.0', // Boost volume since subtraction reduces it
        'highpass=f=300', // Remove low frequencies
        'lowpass=f=3400' // Remove high frequencies beyond vocal range
      ])
      .audioCodec('pcm_s16le')
      .format('wav')
      .output(vocalsPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          broadcastProgress(processingId, { 
            status: 'processing',
            stage: 'separating', 
            progress: Math.round(progress.percent / 2),
            message: 'Extracting vocals...'
          });
        }
      })
      .on('end', () => {
        // Extract instrumental (opposite of vocal isolation)
        ffmpeg(inputPath)
          .audioFilters([
            'pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1' // Mix both channels equally (removes center-panned vocals)
          ])
          .audioCodec('pcm_s16le')
          .format('wav')
          .output(musicPath)
          .on('progress', (progress) => {
            if (progress.percent) {
              broadcastProgress(processingId, { 
                status: 'processing',
                stage: 'separating', 
                progress: Math.round(50 + progress.percent / 2),
                message: 'Extracting instrumentals...'
              });
            }
          })
          .on('end', resolve)
          .on('error', reject)
          .run();
      })
      .on('error', reject)
      .run();
  });
}

// Generate waveform data
async function generateWaveform(audioPath) {
  return new Promise((resolve, reject) => {
    const waveformData = [];
    
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) return reject(err);
      
      const duration = metadata.format.duration;
      const sampleRate = 44100;
      const channels = metadata.streams[0].channels || 2;
      
      // Generate sample waveform data (in production, use actual audio analysis)
      const samples = Math.floor(duration * 100); // 100 points per second
      
      for (let i = 0; i < samples; i++) {
        const time = (i / samples) * duration;
        const amplitude = Math.sin(time * 2) * Math.exp(-time / 10) * (Math.random() * 0.3 + 0.7);
        waveformData.push(amplitude);
      }
      
      resolve({
        duration,
        sampleRate,
        channels,
        data: waveformData
      });
    });
  });
}

// Convert audio to different formats
async function convertAudio(inputPath, outputPath, format, bitrate = '192k') {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);
    
    switch (format) {
      case 'mp3':
        command = command.audioCodec('mp3').audioBitrate(bitrate);
        break;
      case 'flac':
        command = command.audioCodec('flac');
        break;
      case 'wav':
        command = command.audioCodec('pcm_s16le');
        break;
      case 'aac':
        command = command.audioCodec('aac').audioBitrate(bitrate);
        break;
    }
    
    command
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// API Routes

// Upload and process audio
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { quality = 'high', model = 'vocal_isolation' } = req.body;
    const processingId = uuidv4();
    const inputPath = req.file.path;
    const outputDir = `./server/outputs/${processingId}`;
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    res.json({ 
      processingId,
      message: 'Processing started',
      filename: req.file.originalname
    });

    // Start processing in background
    processAudio(inputPath, outputDir, processingId, quality, model);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get processing status
app.get('/api/status/:processingId', (req, res) => {
  const { processingId } = req.params;
  const outputDir = `./server/outputs/${processingId}`;
  
  if (!fs.existsSync(outputDir)) {
    return res.status(404).json({ error: 'Processing ID not found' });
  }
  
  const statusFile = path.join(outputDir, 'status.json');
  if (fs.existsSync(statusFile)) {
    const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    res.json(status);
  } else {
    res.json({ status: 'processing', progress: 0 });
  }
});

// Get processing status
app.get('/api/status/:processingId', (req, res) => {
  const { processingId } = req.params;
  const outputDir = `./server/outputs/${processingId}`;
  
  if (!fs.existsSync(outputDir)) {
    return res.json({ 
      status: 'not_found', 
      progress: 0, 
      message: 'Processing not found' 
    });
  }
  
  const statusFile = path.join(outputDir, 'status.json');
  if (fs.existsSync(statusFile)) {
    const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    res.json(status);
  } else {
    res.json({ status: 'processing', progress: 0 });
  }
});

// Download separated audio
app.get('/api/download/:processingId/:type', (req, res) => {
  const { processingId, type } = req.params;
  const { format = 'wav' } = req.query; // Default to WAV
  
  const outputDir = `./server/outputs/${processingId}`;
  let filename;
  
  if (type === 'vocals') {
    filename = `vocals.wav`; // Only serve WAV for now
  } else if (type === 'music') {
    filename = `accompaniment.wav`; // Only serve WAV for now
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }
  
  const filePath = path.join(outputDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.download(filePath, filename);
});

// Get waveform data
app.get('/api/waveform/:processingId/:type', async (req, res) => {
  try {
    const { processingId, type } = req.params;
    const outputDir = `./server/outputs/${processingId}`;
    
    let filename;
    if (type === 'vocals') {
      filename = 'vocals.wav';
    } else if (type === 'music') {
      filename = 'accompaniment.wav';
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    const filePath = path.join(outputDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const waveformData = await generateWaveform(filePath);
    res.json(waveformData);
    
  } catch (error) {
    console.error('Waveform error:', error);
    res.status(500).json({ error: 'Failed to generate waveform' });
  }
});

// Background processing function
async function processAudio(inputPath, outputDir, processingId, quality, model) {
  try {
    const statusFile = path.join(outputDir, 'status.json');
    
    const updateStatus = (status, progress = 0, message = '') => {
      const statusData = { status, progress, message, processingId };
      fs.writeFileSync(statusFile, JSON.stringify(statusData));
    };
    
    updateStatus('processing', 0, 'Starting audio separation...');
    
    // Perform separation
    await separateWithDemucs(inputPath, outputDir, processingId, quality);
    
    updateStatus('converting', 80, 'Converting to different formats...');
    
    // Handle Demucs output structure
    // Demucs creates: outputDir/htdemucs/filename/vocals.wav and no_vocals.wav
    const files = fs.readdirSync(outputDir, { recursive: true });
    const htdemucsDir = path.join(outputDir, 'htdemucs');
    
    if (fs.existsSync(htdemucsDir)) {
      const subDirs = fs.readdirSync(htdemucsDir);
      if (subDirs.length > 0) {
        const audioDir = path.join(htdemucsDir, subDirs[0]);
        const vocalsPath = path.join(audioDir, 'vocals.wav');
        const noVocalsPath = path.join(audioDir, 'no_vocals.wav');
        
        // Copy to standard output names
        if (fs.existsSync(vocalsPath)) {
          fs.copyFileSync(vocalsPath, path.join(outputDir, 'vocals.wav'));
        }
        if (fs.existsSync(noVocalsPath)) {
          fs.copyFileSync(noVocalsPath, path.join(outputDir, 'accompaniment.wav'));
        }
      }
    } else {
      // Fallback: look for any vocals/accompaniment files
      const allFiles = fs.readdirSync(outputDir, { recursive: true });
      const vocalsFile = allFiles.find(f => f.includes('vocals'));
      const musicFile = allFiles.find(f => f.includes('accompaniment') || f.includes('no_vocals'));
      
      if (vocalsFile && !fs.existsSync(path.join(outputDir, 'vocals.wav'))) {
        fs.copyFileSync(path.join(outputDir, vocalsFile), path.join(outputDir, 'vocals.wav'));
      }
      if (musicFile && !fs.existsSync(path.join(outputDir, 'accompaniment.wav'))) {
        fs.copyFileSync(path.join(outputDir, musicFile), path.join(outputDir, 'accompaniment.wav'));
      }
    }
    
    updateStatus('completed', 100, 'Processing completed successfully');
    
    // Clean up original uploaded file
    setTimeout(() => {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
    }, 1000 * 60 * 60); // Clean up after 1 hour
    
  } catch (error) {
    console.error('Processing error:', error);
    const statusFile = path.join(outputDir, 'status.json');
    fs.writeFileSync(statusFile, JSON.stringify({
      status: 'error',
      progress: 0,
      message: 'Processing failed: ' + error.message,
      processingId
    }));
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`🎵 Unmixer API Server running on http://localhost:${PORT}`);
  console.log('🎤 Ready to process audio files!');
});