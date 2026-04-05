#!/bin/bash
# Installation script for Whisper API on Arch Linux (AMD GPU / ROCm)
# Run as: sudo ./install.sh

set -e

echo "=========================================="
echo "Whisper API Installation Script (AMD GPU)"
echo "=========================================="

if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo for system package installation"
    exit 1
fi

ACTUAL_USER=${SUDO_USER:-$USER}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "[1/6] Installing system dependencies..."
echo "  This installs python-pytorch-rocm (~375 MB) which includes ROCm + PyTorch."
pacman -S --needed --noconfirm python python-pip ffmpeg python-pytorch-rocm

echo ""
echo "[2/6] Creating Python virtual environment..."
rm -rf venv
sudo -u "$ACTUAL_USER" python -m venv --system-site-packages venv

echo ""
echo "[3/6] Installing Python packages..."
sudo -u "$ACTUAL_USER" venv/bin/pip install --upgrade pip
sudo -u "$ACTUAL_USER" venv/bin/pip install -r requirements.txt

echo ""
echo "[4/6] Testing GPU access..."
sudo -u "$ACTUAL_USER" CT2_CUDA_ALLOCATOR=cub_caching venv/bin/python << 'EOF'
import torch
print(f"ROCm/CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    mem_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"GPU Memory: {mem_gb:.2f} GB")
else:
    print("WARNING: GPU not available — will fall back to CPU mode.")
    print("Make sure your user is in the 'render' and 'video' groups.")
EOF

echo ""
echo "[5/6] Creating output directory..."
mkdir -p "$SCRIPT_DIR/../audio"
chown "$ACTUAL_USER:$ACTUAL_USER" "$SCRIPT_DIR/../audio"

echo ""
echo "[6/6] Installing systemd service..."
cat > /etc/systemd/system/whisper-api.service << SERVICEEOF
[Unit]
Description=Whisper API Service
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$SCRIPT_DIR
Environment=CT2_CUDA_ALLOCATOR=cub_caching
Environment=HSA_OVERRIDE_GFX_VERSION=10.3.0
ExecStart=$SCRIPT_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 5000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "IMPORTANT: Make sure your user is in the render/video groups:"
echo "  sudo usermod -aG render,video $ACTUAL_USER"
echo "  (Log out and back in for group changes to take effect)"
echo ""
echo "To start the service:"
echo "  sudo systemctl start whisper-api"
echo ""
echo "To enable on boot:"
echo "  sudo systemctl enable whisper-api"
echo ""
echo "To check status:"
echo "  sudo systemctl status whisper-api"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u whisper-api -f"
echo ""
echo "Test the service:"
echo "  curl http://localhost:5000/health"
echo "  curl http://localhost:5000/gpu-info"
echo ""
