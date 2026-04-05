# Whisper API with GPU Support

This API runs **faster-whisper** with GPU acceleration for fast audio/video transcription.

## Why Run on Host Instead of Docker?

- **GPU Access**: Direct access to your 16GB GPU for 10-50x faster transcription
- **Performance**: Transcribing a 15-minute video takes ~2-5 minutes with GPU vs 90+ minutes on CPU
- **faster-whisper**: Uses optimized CTranslate2 backend (4-10x faster than original Whisper)

## Installation

### 1. Run the installation script

```bash
cd /home/fabio/projects/myflix/whisper-api
sudo ./install.sh
```

This will:
- Install system dependencies (CUDA, cuDNN, ffmpeg)
- Create a Python virtual environment
- Install faster-whisper with PyTorch GPU support
- Create a systemd service
- Test GPU access

### 2. Start the service

```bash
# Start the service
sudo systemctl start whisper-api

# Enable on boot (optional)
sudo systemctl enable whisper-api

# Check status
sudo systemctl status whisper-api
```

### 3. View logs

```bash
# Follow live logs
sudo journalctl -u whisper-api -f

# View recent logs
sudo journalctl -u whisper-api -n 100
```

## Testing

### Check health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "whisper-api",
  "device": "cuda",
  "cuda_available": true
}
```

### Check GPU info
```bash
curl http://localhost:5000/gpu-info
```

Expected response:
```json
{
  "cuda_available": true,
  "device_count": 1,
  "device_name": "NVIDIA GeForce RTX ...",
  "total_memory_gb": 16.0,
  "current_device": 0
}
```

### Test transcription
```bash
curl -X POST http://localhost:5000/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "morning-worship/29 de Julho - 2025.mp4",
    "model": "medium"
  }'
```

## Available Models

- `tiny` - Fastest, least accurate (~1GB RAM)
- `base` - Fast, decent accuracy (~1GB RAM)
- `small` - Good balance (~2GB RAM)
- `medium` - Better accuracy (~5GB RAM) **[Default]**
- `large-v1` - High accuracy (~10GB RAM)
- `large-v2` - Higher accuracy (~10GB RAM)
- `large-v3` - Highest accuracy (~10GB RAM)

With your 16GB GPU, you can comfortably run any model, including `large-v3`.

## Laravel Integration

The Laravel job has been updated to use the host API:

```php
$response = Http::timeout(3600)->post('http://host.docker.internal:5000/transcribe', [
    'file_path' => $filePath,
    'model' => 'medium',
]);
```

## Troubleshooting

### Service won't start
```bash
# Check logs
sudo journalctl -u whisper-api -n 50

# Restart service
sudo systemctl restart whisper-api
```

### GPU not detected
```bash
# Check NVIDIA driver
nvidia-smi

# Test GPU in Python
cd /home/fabio/projects/myflix/whisper-api
./venv/bin/python -c "import torch; print('CUDA:', torch.cuda.is_available())"
```

### Port already in use
```bash
# Check what's using port 5000
sudo lsof -i :5000

# Kill the old docker container if still running
docker stop whisper-api
docker rm whisper-api
```

## Performance Comparison

| Setup | Device | Time (15min video) | Speed |
|-------|--------|-------------------|-------|
| Docker | CPU only | ~90 minutes | 0.17x |
| Host | GPU (16GB) | ~2-5 minutes | 3-7x |

## Stopping/Removing

### Stop the service
```bash
sudo systemctl stop whisper-api
sudo systemctl disable whisper-api
```

### Remove the service
```bash
sudo systemctl stop whisper-api
sudo systemctl disable whisper-api
sudo rm /etc/systemd/system/whisper-api.service
sudo systemctl daemon-reload
```

### Remove virtual environment
```bash
cd /home/fabio/projects/myflix/whisper-api
rm -rf venv
```

## File Locations

- **Service file**: `/etc/systemd/system/whisper-api.service`
- **Virtual environment**: `/home/fabio/projects/myflix/whisper-api/venv/`
- **Input files**: `/mnt/brutus/jw/` (NAS mount)
- **Output files**: `/home/fabio/projects/myflix/audio/`
- **Logs**: `sudo journalctl -u whisper-api`
