#!/usr/bin/env python3
"""Xuất lời đọc của script.json ra file chữ để dán vào dịch vụ giọng đọc ngoài (Vbee, FPT.AI...).

Cách dùng:
  python3 xuat_loi_doc.py <thư mục dự án> [--dich-vu vbee] [--max-chars 3000] [--only 2,5] [--giu-ten-goc]

Ghi ra audio/<dịch vụ>/:
- doc-phan-<N>.txt: chữ thuần để dán nguyên vào ô nhập của dịch vụ. Mỗi cảnh một đoạn, cách nhau một dòng trống.
  Chia phần ở ranh giới cảnh khi vượt --max-chars (bản miễn phí của Vbee: 3.000 ký tự mỗi lần chuyển).
- HUONG-DAN.md: các bước làm, số ký tự từng phần, tên file cần đặt khi tải về.
Tên ứng dụng được thay bằng phiên âm trong trường "pronunciation" (bỏ bằng --giu-ten-goc). Phụ đề vẫn dùng lời gốc,
vì nhap_audio_ngoai.py ghép mốc thời gian vào lời trong script.json chứ không vào file này.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tts_edge import build_groups  # noqa: E402


def apply_pronunciation(narration: str, app_name: str | None, pronunciation: str | None) -> str:
    """Hai dạng "pronunciation": "Tên: phiên-âm; Tên khác: phiên-âm" hoặc chỉ phiên âm của tên ứng dụng (dạng cũ)."""
    if not pronunciation:
        return narration
    if ":" not in pronunciation:
        return build_groups(narration, app_name, pronunciation)[0].replace("-", " ")
    pairs = []
    for part in pronunciation.split(";"):
        term, _, spoken = part.partition(":")
        if term.strip() and spoken.strip():
            pairs.append((term.strip(), spoken.strip().replace("-", " ")))
    text = narration
    for term, spoken in sorted(pairs, key=lambda p: -len(p[0])):  # tên dài trước để "Magic Tiles" không bị "Tiles" chen
        text = re.sub(rf"(?<!\w){re.escape(term)}(?!\w)", spoken, text, flags=re.I)
    return text


def split_parts(blocks: list[tuple[int, str]], max_chars: int) -> list[list[tuple[int, str]]]:
    parts: list[list[tuple[int, str]]] = [[]]
    for sid, text in blocks:
        current = parts[-1]
        size = sum(len(t) for _, t in current) + 2 * len(current)
        if current and size + 2 + len(text) > max_chars:
            parts.append([])
        parts[-1].append((sid, text))
    return parts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--dich-vu", default="vbee", help="tên thư mục con trong audio/, mặc định vbee")
    ap.add_argument("--max-chars", type=int, default=3000, help="giới hạn ký tự mỗi lần chuyển của dịch vụ")
    ap.add_argument("--only", help="chỉ xuất các cảnh này, ví dụ 2,5 (để thu lại vài cảnh)")
    ap.add_argument("--giu-ten-goc", action="store_true", help="không thay tên ứng dụng bằng phiên âm")
    args = ap.parse_args()

    project = Path(args.project)
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    only = {int(x) for x in args.only.split(",")} if args.only else None
    blocks = []
    for sc in script["scenes"]:
        if only and sc["id"] not in only:
            continue
        app = sc.get("app") or {}
        text = sc["narration"] if args.giu_ten_goc else apply_pronunciation(
            sc["narration"], app.get("name"), sc.get("pronunciation"))
        blocks.append((sc["id"], " ".join(text.split())))
    if not blocks:
        print("LỖI: không có cảnh nào để xuất")
        return 1
    too_long = [sid for sid, t in blocks if len(t) > args.max_chars]
    if too_long:
        print(f"LỖI: cảnh {too_long} dài hơn {args.max_chars} ký tự, phải rút lời đọc trước")
        return 1

    out_dir = project / "audio" / args.dich_vu
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("doc-phan-*.txt"):
        old.unlink()  # file xuất cũ do chính script này tạo, không phải file người dùng
    parts = split_parts(blocks, args.max_chars)
    rows = []
    for n, part in enumerate(parts, 1):
        body = "\n\n".join(t for _, t in part) + "\n"
        (out_dir / f"doc-phan-{n}.txt").write_text(body, encoding="utf-8")
        ids = ", ".join(str(sid) for sid, _ in part)
        rows.append(f"| {n} | `doc-phan-{n}.txt` | {ids} | {len(body.strip())} | `phan-{n}.mp3` (hoặc `.wav`) |")
        print(f"- phần {n}: cảnh {ids}, {len(body.strip())} ký tự → {out_dir / f'doc-phan-{n}.txt'}")

    only_flag = f" --only {args.only}" if args.only else ""
    guide = f"""# Lời đọc cho {args.dich_vu}

Dự án: `{project.name}`. Số phần: {len(parts)}. Giới hạn mỗi phần: {args.max_chars} ký tự.

| Phần | File để dán | Cảnh | Ký tự | Tên file khi tải về |
|---|---|---|---|---|
{chr(10).join(rows)}

## Các bước

1. Mở từng file `doc-phan-<N>.txt`, chép **toàn bộ** chữ dán vào ô nhập của {args.dich_vu}. Không sửa chữ ở đây: muốn đổi lời thì sửa `script.json` rồi xuất lại.
2. Giữ **cùng một giọng, cùng tốc độ** cho mọi phần. Tốc độ gợi ý: nhanh hơn mặc định một chút (khoảng 1,1–1,2), kênh cần khoảng 4,5–5 từ/giây.
3. Nghe lướt: tên ứng dụng đọc sai thì báo Claude để sửa phiên âm (trường `pronunciation`), rồi xuất lại.
4. Tải về dạng WAV (nếu có) hoặc MP3, đặt tên như cột cuối, bỏ vào thư mục này (`audio/{args.dich_vu}/`). Tải ngay: Vbee chỉ giữ file âm thanh 3 ngày.
5. Báo Claude. Claude chạy:
   `python3 .claude/skills/long-tieng/scripts/nhap_audio_ngoai.py projects/{project.name} --dich-vu {args.dich_vu}{only_flag}`

Bản miễn phí chỉ dùng làm nháp, test: video làm bằng bản miễn phí không bật kiếm tiền (xem `kenh/ho-so-kenh.md`).
"""
    (out_dir / "HUONG-DAN.md").write_text(guide, encoding="utf-8")
    print(f"Xong: {len(parts)} phần, hướng dẫn ở {out_dir / 'HUONG-DAN.md'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
