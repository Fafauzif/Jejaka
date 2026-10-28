"""Compose source/render comparison boards with Pillow (external Python)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def _font(size):
    for candidate in ("C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"):
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def side_by_side(left, right, out, left_label, right_label, title, width=900):
    left_img = Image.open(left).convert("RGB")
    right_img = Image.open(right).convert("RGB")
    def fit(img):
        ratio = width / img.width
        return img.resize((width, round(img.height * ratio)), Image.LANCZOS)
    left_img, right_img = fit(left_img), fit(right_img)
    h = max(left_img.height, right_img.height)
    margin, header, caption = 24, 62, 44
    canvas = Image.new("RGB", (width * 2 + margin * 3, header + h + caption + margin), (244, 241, 234))
    draw = ImageDraw.Draw(canvas)
    draw.text((margin, 18), title, fill=(30, 32, 30), font=_font(26))
    canvas.paste(left_img, (margin, header))
    canvas.paste(right_img, (margin * 2 + width, header))
    draw.text((margin, header + h + 10), left_label, fill=(60, 60, 55), font=_font(18))
    draw.text((margin * 2 + width, header + h + 10), right_label, fill=(60, 60, 55), font=_font(18))
    canvas.save(out, quality=92)
    return {"written": str(out), "size": list(canvas.size)}


def blend(left, right, out, title, width=1400, alpha=0.45):
    left_img = Image.open(left).convert("RGB")
    right_img = Image.open(right).convert("RGB")
    left_img = left_img.resize((width, round(left_img.height * width / left_img.width)), Image.LANCZOS)
    right_img = right_img.resize((width, round(right_img.height * width / right_img.width)), Image.LANCZOS)
    h = max(left_img.height, right_img.height)
    left_img = left_img.crop((0, 0, width, h))
    right_img = right_img.crop((0, 0, width, h))
    comp = Image.blend(left_img, right_img, alpha)
    margin, header = 20, 56
    canvas = Image.new("RGB", (width + margin * 2, h + header + margin), (244, 241, 234))
    canvas.paste(comp, (margin, header))
    ImageDraw.Draw(canvas).text((margin, 16), title, fill=(30, 32, 30), font=_font(24))
    canvas.save(out, quality=92)
    return {"written": str(out), "size": list(canvas.size)}


if __name__ == "__main__":
    if len(sys.argv) >= 8 and sys.argv[1] == "side":
        print(side_by_side(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[7]))
    else:
        raise SystemExit("usage: make_comparison.py side LEFT RIGHT OUT LEFT_LABEL RIGHT_LABEL TITLE")
