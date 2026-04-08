#!/usr/bin/env python3
"""Create demo video from screenshot frames using imageio"""

import imageio.v3 as iio
from PIL import Image
import io
import os
import glob

FRAMES_DIR = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/frames'
OUTPUT = '/Users/danielmd/Desktop/code/.claude/worktrees/musing-snyder/public/demo-video.mp4'

def load_frames():
    """Load all frame PNGs in order"""
    files = sorted(glob.glob(os.path.join(FRAMES_DIR, 'frame_*.png')))
    if not files:
        files = sorted(glob.glob(os.path.join(FRAMES_DIR, 'frame_*.jpg')))
    frames = []
    for f in files:
        img = Image.open(f).convert('RGB')
        # Ensure even dimensions for video encoding
        w, h = img.size
        w = w - (w % 2)
        h = h - (h % 2)
        img = img.resize((w, h), Image.LANCZOS)
        frames.append(img)
    return frames

def create_video(frames, fps=0.5, hold_frames=3):
    """Create MP4 from frames. Each frame shown for ~2 seconds"""
    import numpy as np

    if not frames:
        print("No frames found!")
        return

    # Normalize all frames to same size
    target_w = frames[0].size[0]
    target_h = frames[0].size[1]

    writer = iio.imopen(OUTPUT, "w", plugin="pyav")
    writer.init_video_stream("libx264", fps=2)

    for frame in frames:
        img = frame.resize((target_w, target_h), Image.LANCZOS)
        arr = np.array(img)
        # Hold each frame for ~2 seconds (4 frames at 2fps)
        for _ in range(4):
            writer.write_frame(arr)

    writer.close()
    print(f"Video generado: {OUTPUT}")
    print(f"Total frames: {len(frames)}")
    print(f"Duración aprox: {len(frames) * 2} segundos")

if __name__ == '__main__':
    frames = load_frames()
    create_video(frames)
