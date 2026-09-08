"""Create a seek-friendly RGB/alpha MP4 from the supplied green-screen video.

The left half is premultiplied foreground RGB; the right half is an alpha matte.
Packing both into H.264 avoids browser-specific transparent-video codecs.
The original upload is read only and is never changed.
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image


def read_frame(stream, length):
    buffer = bytearray()
    while len(buffer) < length:
        part = stream.read(length - len(buffer))
        if not part:
            break
        buffer.extend(part)
    return bytes(buffer)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    args = parser.parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    width, height, fps = 848, 738, 24
    decoder = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-i', args.input,
        '-vf', f'crop=1056:920:784:160,scale={width}:{height}:flags=lanczos,fps={fps}',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
    ], stdout=subprocess.PIPE)
    encoder = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
        '-video_size', f'{width * 2}x{height}', '-framerate', str(fps), '-i', 'pipe:0',
        '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
        '-g', '1', '-keyint_min', '1', '-sc_threshold', '0', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(output / 'aria-motion.mp4'),
    ], stdin=subprocess.PIPE)
    frame_index = 0
    length = width * height * 3
    poster_frames = {30: 'aria-poster.png'}
    while True:
        raw = read_frame(decoder.stdout, length)
        if not raw:
            break
        if len(raw) != length:
            raise RuntimeError('Incomplete decoded video frame')
        rgb = np.frombuffer(raw, dtype=np.uint8).reshape(height, width, 3).astype(np.float32) / 255.0
        dominance = rgb[:, :, 1] - np.maximum(rgb[:, :, 0], rgb[:, :, 2])
        key = np.clip((dominance - 0.055) / 0.155, 0, 1)
        key = key * key * (3 - 2 * key)
        alpha = 1 - key
        # Remove residual green spill at partially transparent edges.
        edge = np.clip((dominance - 0.018) / 0.10, 0, 1)
        neutral_green = np.minimum(rgb[:, :, 1], np.maximum(rgb[:, :, 0], rgb[:, :, 2]))
        rgb[:, :, 1] = rgb[:, :, 1] * (1 - edge) + neutral_green * edge
        matte = np.repeat(alpha[:, :, None], 3, axis=2)
        premultiplied = rgb * alpha[:, :, None]
        packed = np.concatenate((premultiplied, matte), axis=1)
        encoder.stdin.write(np.round(np.clip(packed, 0, 1) * 255).astype(np.uint8).tobytes())
        if frame_index in poster_frames:
            rgba = np.concatenate((rgb, alpha[:, :, None]), axis=2)
            Image.fromarray(np.round(np.clip(rgba, 0, 1) * 255).astype(np.uint8)).save(output / poster_frames[frame_index], optimize=True)
        frame_index += 1
    encoder.stdin.close()
    if decoder.wait() != 0 or encoder.wait() != 0:
        raise RuntimeError('Video conversion failed')
    metadata = {
        'width': width, 'height': height, 'fps': fps, 'frames': frame_index,
        'duration': frame_index / fps, 'posterTime': 30 / fps,
        'encoding': 'premultiplied-rgb-left-alpha-right',
        'sourceCrop': {'x': 784, 'y': 160, 'width': 1056, 'height': 920},
    }
    (output / 'aria-motion.json').write_text(json.dumps(metadata, indent=2) + '\n')
    print(json.dumps({**metadata, 'bytes': (output / 'aria-motion.mp4').stat().st_size}))


if __name__ == '__main__':
    main()
