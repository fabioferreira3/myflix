import os
import uuid
import subprocess
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# Use environment variable for model choice
MODEL = os.getenv("MODEL", "large")
AUDIO_DIR = "/audio"  # This directory will be shared via a volume

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save the uploaded audio file
    file_id = str(uuid.uuid4())
    input_filename = f"{file_id}_{file.filename}"
    input_path = os.path.join(AUDIO_DIR, input_filename)

    try:
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Prepare the command for Whisper. Here we ask for JSON output.
    # Adjust the command options as needed.
    command = f"whisper {input_path} --model {MODEL} --output_dir {AUDIO_DIR} --output_format json"

    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Whisper failed: {e}")

    # Expecting Whisper to write a JSON output with the same basename plus .json
    output_path = os.path.splitext(input_path)[0] + ".json"
    if not os.path.exists(output_path):
        raise HTTPException(status_code=500, detail="Whisper did not produce an output file")

    # Read the transcription result
    try:
        with open(output_path, "r") as f:
            transcription = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read output: {e}")

    # Clean up the temporary files (optional)
    os.remove(input_path)
    os.remove(output_path)

    return {"transcription": transcription}
