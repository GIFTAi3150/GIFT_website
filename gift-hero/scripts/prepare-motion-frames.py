"""Convert the existing packed matte video into bounded-size transparent poses."""
import io
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

source = Path(sys.argv[1])
output = Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)
width, height = 576, 502
frame_count = 96
sample_indices = {round(i * 240 / (frame_count - 1)): i for i in range(frame_count)}
process = subprocess.Popen([
    'ffmpeg', '-v', 'error', '-i', str(source), '-vf',
    f'scale={width * 2}:{height}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'
], stdout=subprocess.PIPE)
stride = width * 2 * height * 3
source_index = 0
written = 0
chunks = []
offsets = []
byte_offset = 0
while True:
    data = process.stdout.read(stride)
    if not data:
        break
    if len(data) != stride:
        raise RuntimeError('Incomplete decoded frame')
    if source_index in sample_indices:
        packed = np.frombuffer(data, np.uint8).reshape(height, width * 2, 3)
        matte = packed[:, width:, 0].astype(np.float32) / 255
        alpha = np.clip((matte - .012) / .976, 0, 1)
        rgb = packed[:, :width, :].astype(np.float32) / np.maximum(matte[:, :, None], .012)
        rgba = np.dstack((np.clip(rgb, 0, 255).astype(np.uint8), np.round(alpha * 255).astype(np.uint8)))
        rgba[alpha == 0] = 0
        encoded = io.BytesIO()
        Image.fromarray(rgba).save(encoded, format='WEBP', quality=82, method=4)
        chunk = encoded.getvalue()
        offsets.append([byte_offset, len(chunk)])
        chunks.append(chunk)
        byte_offset += len(chunk)
        written += 1
    source_index += 1
assert process.wait() == 0
assert written == frame_count, written
metadata = {'width': width, 'height': height, 'frameCount': written, 'duration': 10, 'restFrame': 12, 'frames': offsets}
(output / 'manifest.json').write_text(json.dumps(metadata, indent=2) + '\n')
(output / 'poses.bin').write_bytes(b''.join(chunks))
print(json.dumps({'width': width, 'height': height, 'frameCount': written, 'totalBytes': byte_offset, 'largestFrameBytes': max(len(c) for c in chunks)}))
