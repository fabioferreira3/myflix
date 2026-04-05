#!/bin/bash
# Quick GPU test script for AMD ROCm

echo "=========================================="
echo "GPU and Whisper API Test (AMD ROCm)"
echo "=========================================="
echo ""

echo "[1/5] Checking AMD GPU..."
if command -v rocminfo &> /dev/null; then
    rocminfo 2>/dev/null | grep -E "Name:|Marketing Name:" | head -4
elif [ -d /sys/class/drm ]; then
    for card in /sys/class/drm/card*/device/vendor; do
        [ -f "$card" ] && cat "$card"
    done
    lspci | grep -i 'vga\|3d\|display'
else
    echo "No GPU info available"
fi

echo ""
echo "[2/5] Checking ROCm..."
if command -v rocm-smi &> /dev/null; then
    rocm-smi --showid --showtemp --showuse 2>/dev/null || echo "rocm-smi available but no GPU access"
else
    echo "rocm-smi not found — install python-pytorch-rocm to get ROCm"
fi

echo ""
echo "[3/5] Testing PyTorch GPU access..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$SCRIPT_DIR/venv/bin/python" ]; then
    CT2_CUDA_ALLOCATOR=cub_caching "$SCRIPT_DIR/venv/bin/python" -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'ROCm/CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    print(f'Memory: {torch.cuda.get_device_properties(0).total_mem / 1024**3:.1f} GB')
"
else
    echo "venv not found — run install.sh first"
fi

echo ""
echo "[4/5] Checking if service is running..."
if systemctl is-active --quiet whisper-api; then
    echo "✓ whisper-api service is running"
else
    echo "✗ whisper-api service is not running"
    echo "   Start with: sudo systemctl start whisper-api"
fi

echo ""
echo "[5/5] Testing API endpoints..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Health:"
    curl -s http://localhost:5000/health | python -m json.tool
    echo ""
    echo "✓ GPU info:"
    curl -s http://localhost:5000/gpu-info | python -m json.tool
else
    echo "✗ API is not responding on port 5000"
fi

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
