#!/usr/bin/env python3
"""Gắn một clip quay màn hình ứng dụng vào assets/manifest.json của dự án.

Cách dùng:
  python3 gan_clip.py <thư mục dự án> --app "<tên ứng dụng | key manifest>" --file <clip.mp4>
                      [--nguon tu-quay|giay-phep] [--ghi-chu "..."]

- Chép clip vào assets/<key>/clip.mp4 (key lấy từ manifest: ios-<id> hoặc gp-<package>; ứng dụng chưa có trong
  manifest, ví dụ công cụ web, thì tạo mục mới "tu-quay-<slug>" và gắn vào mọi cảnh có app.name trùng tên).
- Ghi apps.<key>.clip, clip_origin, clip_duration, clip_note.
- --nguon giay-phep (clip nhà phát triển gửi) bắt buộc đã có assets/<key>/dieu-khoan.txt.
- Clip mới chưa được duyệt: chạy duyet_hinh.py tao rồi trình bảng ảnh ở DỪNG 2b.
Không sửa script.json; muốn dùng clip thì thêm shot {"show": "clip", "from": <giây>} vào cảnh.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path


def slug(text: str) -> str:
    s = unicodedata.normalize("NFKD", text.replace("đ", "d").replace("Đ", "D")).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


def probe(path: Path) -> tuple[float, int, int]:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:format=duration", "-of", "json", str(path)],
                         capture_output=True, text=True, check=True)
    info = json.loads(out.stdout)
    st = (info.get("streams") or [{}])[0]
    return float(info["format"]["duration"]), int(st.get("width", 0)), int(st.get("height", 0))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--app", required=True, help="tên ứng dụng trong script.json hoặc key trong manifest")
    ap.add_argument("--file", required=True, help="clip đã cắt (mp4)")
    ap.add_argument("--nguon", choices=["tu-quay", "giay-phep"], default="tu-quay")
    ap.add_argument("--ghi-chu", default="")
    a = ap.parse_args()

    project = Path(a.project).resolve()
    src = Path(a.file).resolve()
    if not src.exists():
        sys.exit(f"Không thấy file {src}")
    mpath = project / "assets/manifest.json"
    manifest = (json.loads(mpath.read_text(encoding="utf-8")) if mpath.exists()
                else {"apps": {}, "scenes": {}, "warnings": []})
    apps = manifest.setdefault("apps", {})
    scenes_map = manifest.setdefault("scenes", {})

    key = a.app if a.app in apps else next(
        (k for k, g in apps.items() if (g.get("name") or "").casefold() == a.app.casefold()), None)
    if key is None:
        key = f"tu-quay-{slug(a.app)}"
        apps[key] = {"name": a.app, "origin": "tu-quay", "source": "quay màn hình của người làm video",
                     "rights_holder": [], "basis": "tu-quay", "icon": None, "header": None, "screenshots": []}
        script = json.loads((project / "script.json").read_text(encoding="utf-8"))
        for sc in script.get("scenes", []):
            if ((sc.get("app") or {}).get("name") or "").casefold() == a.app.casefold():
                scenes_map[str(sc["id"])] = key
        print(f"Tạo mục mới {key} (ứng dụng chưa có trong manifest); nhớ điền rights_holder (nhà phát triển)")

    if a.nguon == "giay-phep" and not (project / "assets" / key / "dieu-khoan.txt").exists():
        sys.exit(f"Clip của nhà phát triển cần thư cho phép ở assets/{key}/dieu-khoan.txt trước khi gắn")

    dest_dir = project / "assets" / key
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / "clip.mp4"
    shutil.copy(src, dest)
    dur, w, h = probe(dest)
    g = apps[key]
    g.update({"clip": f"assets/{key}/clip.mp4", "clip_origin": a.nguon, "clip_duration": round(dur, 2),
              "clip_note": a.ghi_chu or None})
    if not g.get("header") and not g.get("screenshots"):
        # chưa có ảnh nào: lấy một khung giữa clip làm header để bảng duyệt và template có ảnh tĩnh
        frame = dest_dir / "clip-khung.jpg"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{dur / 2:.2f}", "-i", str(dest), "-frames:v", "1",
                        str(frame)], check=False)
        if frame.exists():
            g["header"] = f"assets/{key}/clip-khung.jpg"
            g["screenshots"] = [g["header"]]
    if manifest.get("duyet"):
        manifest["duyet"]["trang_thai"] = "cho-duyet"
    mpath.parent.mkdir(parents=True, exist_ok=True)
    mpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Đã gắn {g['clip']} ({dur:.1f}s, {w}×{h}, nguồn {a.nguon}) cho {g.get('name', key)}")
    if h and w and h < w:
        print("CẢNH BÁO: clip khung ngang; quay màn hình điện thoại nên để khung dọc")
    print("Tiếp theo: duyet_hinh.py tao <dự án> rồi trình bảng ảnh (DỪNG 2b)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
