FROM python:3.10-slim

# Install system dependencies including git and ffmpeg (required by Whisper)
RUN apt-get update && apt-get install -y git ffmpeg && apt-get clean

WORKDIR /app

# Copy and install Python dependencies.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install OpenAI Whisper from GitHub to make the CLI command available.
RUN pip install git+https://github.com/openai/whisper.git

# Copy the application code.
COPY . .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
