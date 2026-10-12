#!/usr/bin/env python3
"""Rút quãng nghỉ giữa câu trong giọng đọc đã tạo (audio/scene-<id>.mp3 + audio/subtitles.json).

Giọng TTS nghỉ đều ~0,6 giây sau mỗi dấu chấm; phản biện ngày 05/10/2026 đo được quãng nghỉ chiếm 25%
thời lượng video. Script cắt phần im lặng thừa ở giữa mỗi quãng nghỉ dài hơn --toi-da, giữ lại
--giu giây, riêng quãng ngay sau dấu "…" (ngừng trước punchline) giữ --giu-punchline giây. Mốc từng
từ được dời theo, nên chạy xong chỉ cần dựng lại timeline (build_timeline.py).

  python3 .claude/skills/long-tieng/scripts/rut_nghi.py <dự án> [--toi-da 0.3] [--giu 0.22]
          [--giu-punchline 0.45] [--only 2,4] [--thu]

Cảnh đã rút thì bỏ qua (tts_edge.py tạo lại cảnh sẽ xoá dấu này). --thu chỉ in, không ghi.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def gaps_to_cut(words: list[dict], max_gap: float, keep: float, keep_punch: float) -> list[tuple[float, float]]:
    cuts = []
    for prev, nxt in zip(words, words[1:]):
        gap = nxt["start"] - prev["end"]
        hold = keep_punch if prev["text"].rstrip().endswith(("…", "...")) else keep
        if gap > max_gap and gap > hold:
            mid_keep = hold / 2
            cuts.append((prev["end"] + mid_keep, nxt["start"] - mid_keep))
    return cuts


def shift(t: float, cuts: list[tuple[float, float]]) -> float:
    removed = 0.0
    for a, b in cuts:
        if t >= b:
            removed += b - a
        elif t > a:
            removed += t - a
    return round(t - removed, 3)


def trim_audio(src: Path, cuts: list[tuple[float, float]], duration: float) -> None:
    keep, pos = [], 0.0
    for a, b in cuts:
        keep.append((pos, a))
        pos = b
    keep.append((pos, duration + 1.0))
    parts = "".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(keep))
    concat = "".join(f"[s{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[out]"
    tmp = Path(tempfile.mkstemp(suffix=".mp3", dir=src.parent)[1])
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-filter_complex", parts + concat,
                        "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", str(tmp)], capture_output=True, text=True)
    if r.returncode:
        tmp.unlink(missing_ok=True)
        sys.exit(f"ffmpeg lỗi với {src.name}: {r.stderr.strip()}")
    tmp.replace(src)


def probe(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--toi-da", type=float, default=0.3, help="quãng nghỉ dài hơn mức này thì rút (giây)")
    ap.add_argument("--giu", type=float, default=0.22, help="độ dài giữ lại sau khi rút (giây)")
    ap.add_argument("--giu-punchline", type=float, default=0.45, help="giữ sau dấu … (giây)")
    ap.add_argument("--only", default="", help="id cảnh, ví dụ 2,4")
    ap.add_argument("--thu", action="store_true", help="chỉ in kết quả dự kiến")
    a = ap.parse_args()
    project = Path(a.project).resolve()
    subs_path = project / "audio/subtitles.json"
    subs = json.loads(subs_path.read_text(encoding="utf-8"))
    only = {int(x) for x in a.only.split(",") if x.strip()}
    total_before = total_after = 0.0
    for sc in subs["scenes"]:
        if only and sc["id"] not in only:
            continue
        if sc.get("rut_nghi"):
            print(f"- cảnh {sc['id']}: đã rút trước đó, bỏ qua")
            continue
        words = sc.get("words") or []
        cuts = gaps_to_cut(words, a.toi_da, a.giu, a.giu_punchline)
        removed = sum(b - x for x, b in cuts)
        total_before += sc["duration"]
        total_after += sc["duration"] - removed
        print(f"- cảnh {sc['id']}: {len(cuts)} quãng, bớt {removed:.2f}s ({sc['duration']:.2f} → {sc['duration'] - removed:.2f}s)")
        if a.thu or not cuts:
            continue
        audio = project / sc["audio"]
        trim_audio(audio, cuts, sc["duration"])
        for w in words:
            w["start"], w["end"] = shift(w["start"], cuts), shift(w["end"], cuts)
        sc["duration"] = round(probe(audio), 3)
        sc["rut_nghi"] = {"toi_da": a.toi_da, "giu": a.giu, "giu_punchline": a.giu_punchline,
                          "bot_giay": round(removed, 3)}
    print(f"Tổng: {total_before:.2f}s → {total_after:.2f}s" + (" (chạy thử, chưa ghi)" if a.thu else ""))
    if not a.thu:
        subs_path.write_text(json.dumps(subs, ensure_ascii=False, indent=1), encoding="utf-8")
        print("Xong. Chạy lại build_timeline.py.")


if __name__ == "__main__":
    main()
