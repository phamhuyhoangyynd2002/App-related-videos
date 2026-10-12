#!/usr/bin/env python3
"""Nghe lại giọng đọc bằng nhận dạng lời, so với lời gốc trong script.json.

Cách dùng:
  python3 nghe_lai.py <thư mục dự án> [--only 3,5] [--model small]

Vì sao có (06/10/2026): agent kiểm định và phản biện không nghe được âm thanh. Một lỗi phiên âm
làm TTS đọc "Hungry Shark Evolution, Hungry Shark Evolution, Megalodon, Megalodon" lọt qua cả
kiểm định lẫn phản biện, và hai video trước đó đã đăng với tên bị đọc lặp ("Luanti, Luanti",
"Genshin, Genshin"). Cùng ngày, Edge TTS trả về âm thanh cụt (12s thay vì 21s) mà không báo lỗi.

Báo LỖI khi:
- một cụm 1–3 từ bị đọc lặp liền nhau mà lời gốc không lặp (lỗi phiên âm, TTS đọc lặp);
- số từ nghe được ít hơn 80% lời gốc (âm thanh cụt, thiếu câu);
- số từ nghe được nhiều hơn 125% lời gốc (đọc thừa).
Báo CẢNH BÁO khi tỉ lệ từ khớp dưới 60% (thường do tên tiếng Anh, số; nên tự nghe cảnh đó).
Kết quả ghi audio/nghe-lai.json; thoát mã 1 nếu có LỖI.
Cần: pip install faster-whisper (lần đầu tải model small khoảng 500MB).
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from pathlib import Path


SO = {"không": "0", "một": "1", "hai": "2", "ba": "3", "bốn": "4", "năm": "5", "sáu": "6",
      "bảy": "7", "tám": "8", "chín": "9", "mười": "10"}


def norm(text: str) -> list[str]:
    # nhận dạng lời hay ghi số bằng chữ số ("3 tuần"), lời gốc ghi bằng chữ ("ba tuần")
    text = text.lower().replace("…", " ")
    return [SO.get(w, w) for w in re.split(r"[^\w]+", text) if w]


def similar(a: list[str], b: list[str]) -> bool:
    if a == b:
        return True
    # tên tiếng Anh bị nghe thành hai cụm gần giống: "ando strel ando treo" (Andor's Trail, an-đo trây-ồ)
    # phải trùng từ đầu: tên đọc lặp luôn bắt đầu giống nhau; "chơi bad piggies. mà bad piggies" chỉ trùng đuôi
    return (len(a) >= 2 and a[0] == b[0]
            and difflib.SequenceMatcher(None, " ".join(a), " ".join(b)).ratio() >= 0.75)


def repeats(words: list[str]) -> list[str]:
    """Cụm 1–3 từ lặp liền nhau, ví dụ 'luanti luanti' hoặc 'hungry shark hungry shark'."""
    found = []
    for n in (3, 2, 1):
        for i in range(len(words) - 2 * n + 1):
            a, b = words[i:i + n], words[i + n:i + 2 * n]
            if similar(a, b) and not (n == 1 and len(a[0]) <= 2):
                found.append(" ".join(a))
    return found


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--only", default="")
    ap.add_argument("--model", default="small")
    args = ap.parse_args()

    project = Path(args.project)
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    only = {int(x) for x in args.only.split(",") if x.strip()}

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("LỖI: cần pip install faster-whisper")
    model = WhisperModel(args.model, compute_type="int8")

    report, errors = [], 0
    for sc in script["scenes"]:
        if only and sc["id"] not in only:
            continue
        audio = project / "audio" / f"scene-{sc['id']}.mp3"
        if not audio.exists():
            print(f"LỖI: cảnh {sc['id']}: không có {audio.name}")
            errors += 1
            continue
        segs, _ = model.transcribe(str(audio), language="vi")
        heard = " ".join(s.text.strip() for s in segs)
        ref, hyp = norm(sc["narration"]), norm(heard)
        ratio = len(hyp) / max(len(ref), 1)
        match = difflib.SequenceMatcher(None, ref, hyp).ratio()
        new_rep = [r for r in repeats(hyp) if r not in repeats(ref)]
        problems = []
        if new_rep:
            problems.append(f"đọc lặp: {', '.join(sorted(set(new_rep)))}")
        if ratio < 0.8:
            problems.append(f"nghe được {len(hyp)}/{len(ref)} từ, có thể âm thanh bị cụt")
        if ratio > 1.25:
            problems.append(f"nghe được {len(hyp)}/{len(ref)} từ, có thể đọc thừa")
        level = "LỖI" if problems else ("CẢNH BÁO" if match < 0.6 else "OK")
        if level == "LỖI":
            errors += 1
        note = "; ".join(problems) or (f"khớp {match:.0%}, nên tự nghe" if level == "CẢNH BÁO" else "")
        print(f"{level}: cảnh {sc['id']}: khớp {match:.0%}, {len(hyp)}/{len(ref)} từ{(' — ' + note) if note else ''}")
        report.append({"id": sc["id"], "level": level, "match": round(match, 3), "words": [len(hyp), len(ref)],
                       "problems": problems, "heard": heard})

    out = project / "audio" / "nghe-lai.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Ghi {out}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
