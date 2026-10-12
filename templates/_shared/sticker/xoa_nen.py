#!/usr/bin/env python3
"""Xoá nền trắng của sticker linh vật và vẽ lại viền sticker trắng đều.

Cách dùng: python3 xoa_nen.py [file.png ...]   (mặc định: mọi linh-vat-*.png trong thư mục này)

Ảnh gốc (nền trắng đặc, viền trắng do AI vẽ không đều) lưu ở _goc/; script luôn đọc từ _goc/
nên chạy lại được nhiều lần. Các bước:
1. Ô sáng gần trắng nối với mép ảnh là nền (ăn luôn viền trắng cũ). Vùng trắng kín bên trong
   nhân vật (găng tay, tròng mắt) không nối với mép nên được giữ.
2. Bỏ vệt rác rời (đường xám mảnh còn sót của viền cũ): thành phần không sống sót sau phép co.
3. Vẽ viền trắng dày OUTLINE px quanh hình (`kenh/nhan-vat.md`: 14–16px ở ảnh 1024px),
   mép làm mượt để không răng cưa. Mọi sticker nhờ vậy có cùng một kiểu viền.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = Path(__file__).parent
SRC = HERE / "_goc"
BRIGHT = 240   # kênh nhỏ nhất >= ngưỡng này thì coi là "trắng"
OUTLINE = 15   # độ dày viền sticker (px, ảnh 1024)
KEEP_ERODE = 3  # vệt mảnh hơn 2×giá trị này bị coi là rác


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def process(name: str) -> tuple[float, int]:
    im = Image.open(SRC / name).convert("RGB")
    a = np.asarray(im)
    white = a.min(axis=2) >= BRIGHT
    lab, _ = ndimage.label(white)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    edge = edge[edge != 0]
    fg = ~np.isin(lab, edge)

    # bỏ vệt rác: giữ thành phần có điểm sống sót sau phép co
    core = ndimage.binary_erosion(fg, structure=disk(KEEP_ERODE))
    comp, n = ndimage.label(fg)
    keep = np.unique(comp[core])
    keep = keep[keep != 0]
    dropped = n - len(keep)
    fg = np.isin(comp, keep)
    fg = ndimage.binary_fill_holes(fg) | fg

    # viền trắng đều quanh hình
    halo = ndimage.binary_dilation(fg, structure=disk(OUTLINE))
    halo = ndimage.binary_closing(halo, structure=disk(6))
    rgba = np.zeros((*fg.shape, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[fg, :3] = a[fg]
    alpha = Image.fromarray((halo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    out = Image.fromarray(rgba)
    out.putalpha(alpha)
    out.save(HERE / name, optimize=True)
    return float(np.asarray(alpha).astype(bool).mean()), dropped


def main() -> int:
    names = sys.argv[1:] or sorted(p.name for p in SRC.glob("linh-vat-*.png"))
    for n in names:
        vis, dropped = process(Path(n).name)
        print(f"{n}: hình + viền chiếm {vis:.0%} khung, bỏ {dropped} vệt rác")
    return 0


if __name__ == "__main__":
    sys.exit(main())
