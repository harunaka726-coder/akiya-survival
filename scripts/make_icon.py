"""Build app icons from generated asset / source."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"C:\Users\harun\OneDrive\2026\Akiya")
GEN = Path(r"C:\Users\harun\.cursor\projects\c-Users-harun-OneDrive-2026-Akiya\assets\akiya-app-icon.jpg")
SRC = ROOT / "public" / "31715.png"
OUT_PUBLIC = ROOT / "public" / "icon-512.png"
OUT_APP = ROOT / "src" / "app" / "icon.png"
OUT_APPLE = ROOT / "public" / "apple-touch-icon.png"


def load_base() -> Image.Image:
    if GEN.exists():
        img = Image.open(GEN).convert("RGBA")
    else:
        img = Image.open(SRC).convert("RGBA")
    # ensure square black canvas
    size = max(img.size)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    ox = (size - img.size[0]) // 2
    oy = (size - img.size[1]) // 2
    canvas.alpha_composite(img, (ox, oy))
    return canvas


def main() -> None:
    base = load_base()
    for out, dim in ((OUT_PUBLIC, 512), (OUT_APP, 512), (OUT_APPLE, 180)):
        resized = base.resize((dim, dim), Image.Resampling.LANCZOS)
        # flatten on black for PNG without alpha issues in some browsers
        flat = Image.new("RGB", (dim, dim), (0, 0, 0))
        flat.paste(resized, mask=resized.split()[-1] if resized.mode == "RGBA" else None)
        out.parent.mkdir(parents=True, exist_ok=True)
        flat.save(out, "PNG", optimize=True)
        print("wrote", out, flat.size)


if __name__ == "__main__":
    main()
