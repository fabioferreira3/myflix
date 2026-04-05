import os
import logging
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import whisper
import torch

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

JW_DIR = "/mnt/brutus/jw"
AUDIO_DIR = "/home/fabio/projects/myflix/audio"

cuda_available = torch.cuda.is_available()
device = "cuda" if cuda_available else "cpu"

logger.info("=" * 80)
logger.info("Whisper API Service Starting")
logger.info(f"Video directory: {JW_DIR}")
logger.info(f"Output directory: {AUDIO_DIR}")
logger.info(f"CUDA/ROCm available: {cuda_available}")
if cuda_available:
    logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
    logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
logger.info(f"Device: {device}")
logger.info("=" * 80)

os.makedirs(AUDIO_DIR, exist_ok=True)

model_cache = {}

def get_model(model_name: str):
    if model_name not in model_cache:
        logger.info(f"Loading Whisper model: {model_name}")
        model_cache[model_name] = whisper.load_model(model_name, device=device)
        logger.info(f"Model {model_name} loaded successfully on {device}")
    return model_cache[model_name]

class TranscribeRequest(BaseModel):
    file_path: str
    model: str = "turbo"
    language: str = "Portuguese"

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "whisper-api",
        "device": device,
        "cuda_available": cuda_available
    }

@app.get("/gpu-info")
async def gpu_info():
    if not cuda_available:
        return {"cuda_available": False, "message": "No GPU available"}

    return {
        "cuda_available": True,
        "device_count": torch.cuda.device_count(),
        "device_name": torch.cuda.get_device_name(0),
        "total_memory_gb": torch.cuda.get_device_properties(0).total_memory / 1024**3,
        "current_device": torch.cuda.current_device()
    }

@app.post("/transcribe")
async def transcribe_audio(request: TranscribeRequest):
    logger.info("=" * 80)
    logger.info("NEW TRANSCRIPTION REQUEST")
    logger.info(f"Requested file path: {request.file_path}")
    logger.info(f"Model: {request.model}")
    logger.info(f"Language: {request.language}")
    logger.info("=" * 80)

    relative_path = request.file_path.lstrip('/')
    input_path = os.path.join(JW_DIR, relative_path)

    logger.info(f"Full input path: {input_path}")

    if not os.path.exists(input_path):
        logger.error(f"File not found: {input_path}")
        raise HTTPException(status_code=404, detail=f"File not found: {input_path}")

    real_input_path = os.path.realpath(input_path)
    real_jw_dir = os.path.realpath(JW_DIR)
    if not real_input_path.startswith(real_jw_dir):
        logger.error("Security violation: path outside allowed directory")
        raise HTTPException(status_code=403, detail="Access denied: file path outside allowed directory")

    try:
        file_size = os.path.getsize(input_path)
        logger.info(f"File size: {file_size / (1024**2):.2f} MB")
    except Exception as e:
        logger.error(f"Cannot access file: {e}")
        raise HTTPException(status_code=500, detail=f"Cannot access file: {e}")

    try:
        logger.info(f"Getting Whisper model: {request.model}")
        model = get_model(request.model)

        logger.info("Starting transcription...")
        result = model.transcribe(
            input_path,
            language=request.language,
            fp16=(device == "cuda"),
            verbose=False,
        )

        logger.info(f"Language: {result['language']}")

        transcription_segments = []
        full_text = []

        for segment in result["segments"]:
            transcription_segments.append({
                "id": segment["id"],
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            })
            full_text.append(segment["text"].strip())
            logger.info(f"[{segment['start']:.2f}s -> {segment['end']:.2f}s] {segment['text'].strip()}")

        output_data = {
            "text": " ".join(full_text),
            "segments": transcription_segments,
            "language": result["language"]
        }

        base_filename = os.path.splitext(os.path.basename(input_path))[0]
        output_path = os.path.join(AUDIO_DIR, f"{base_filename}.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        logger.info(f"Transcription saved to: {output_path}")
        logger.info("Transcription completed successfully")
        logger.info("=" * 80)

        return {"transcription": json.dumps(output_data, ensure_ascii=False)}

    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
