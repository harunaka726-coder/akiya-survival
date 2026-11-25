"""Recolor house lines to white on black for app icons."""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(r"C:\Users\harun\OneDrive\2026\Akiya")
SOURCES = [
    ROOT / "public" / "icon-512.png",
    ROOT / "src" / "app" / "icon.png",
    ROOT / "public" / "apple-touch-icon.png",
    ROOT / "public" / "icon.png",
]


def recolor(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3]
    luminance = rgb.mean(axis=2)

    # Keep near-black as black; mid/dark gray lines -> white; keep bright text white
    # Text is already bright; gray house lines are mid-low luminance but > black
    is_black = luminance < 18
    is_line_or_text = (~is_black) & (alpha > 10)

    out = arr.copy()
    out[is_black, 0:3] = 0
    out[is_line_or_text, 0:3] = 255
    out[is_black, 3] = 255
    out[is_line_or_text, 3] = 255

    Image.fromarray(out, "RGBA").convert("RGB").save(path, "PNG", optimize=True)
    print("recolored", path)


def main() -> None:
    for p in SOURCES:
        if p.exists():
            recolor(p)


if __name__ == "__main__":
    main()
