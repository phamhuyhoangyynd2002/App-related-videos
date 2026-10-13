#!/usr/bin/env python3
"""Rút quãng nghỉ giữa câu trong giọng đọc đã tạo (audio/scene-<id>.mp3 + audio/subtitles.json).

Giọng TTS nghỉ đều ~0,6 giây sau mỗi dấu chấm; phản biện ngày 05/10/2026 đo được quãng nghỉ chiếm 25%
thời lượng video. Script cắt phần im lặng thừa ở giữa mỗi quãng nghỉ dài hơn --toi-da, giữ lại
--giu giây, riêng quãng ngay sau dấu "…" (ngừng trước punchline) giữ --giu-punchline giây. Mốc từng
từ được dời theo, nên chạy xong chỉ cần dựng lại timeline (build_timeline.py).

Thêm 13/10/2026 (phản biện video đi chơi nhóm):
- TTS hay đọc liền qua dấu "…" (quãng 0 giây), nên chỗ ngừng trước punchline mất hẳn. Quãng sau "…" ngắn hơn
  --giu-punchline thì chèn thêm im lặng cho đủ.
- Mỗi file TTS có sẵn im lặng đầu và cuối, cộng lại gần 1 giây ở mỗi lần chuyển cảnh. Cắt còn --dau giây
  trước từ đầu và --duoi giây sau từ cuối.

Mặc định đổi 13/10/2026 (giọng NamMinh +40%): giữ 0,17 giây giữa câu, 0,4 giây trước punchline (khoảng 4,1 âm tiết/giây;
0,12/0,35 với +60% bị chê quá nhanh).

  python3 .claude/skills/long-tieng/scripts/rut_nghi.py <dự án> [--toi-da 0.2] [--giu 0.17]
          [--giu-punchline 0.4] [--dau 0.05] [--duoi 0.15] [--only 2,4] [--thu]

Cảnh đã rút thì bỏ qua (tts_edge.py tạo lại cảnh sẽ xoá dấu này). --thu chỉ in, không ghi.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def is_punch(word: dict) -> bool:
    return word["text"].rstrip().endswith(("…", "..."))


def plan(words: list[dict], duration: float, max_gap: float, keep: float, keep_punch: float,
         head: float, tail: float) -> list[tuple]:
    """Danh sách đoạn của file mới, theo thứ tự: ("giu", a, b) lấy từ file cũ, ("im", d) chèn im lặng."""
    if not words:
        return [("giu", 0.0, duration)]
    segs, pos = [], max(0.0, words[0]["start"] - head)
    for prev, nxt in zip(words, words[1:]):
        gap = nxt["start"] - prev["end"]
        hold = keep_punch if is_punch(prev) else keep
        if gap > max_gap and gap > hold:
            segs.append(("giu", pos, prev["end"] + hold / 2))
            pos = nxt["start"] - hold / 2
        elif is_punch(prev) and gap < keep_punch:
            mid = prev["end"] + max(gap, 0.0) / 2
            segs.append(("giu", pos, mid))
            segs.append(("im", round(keep_punch - max(gap, 0.0), 3)))
            pos = mid
    segs.append(("giu", pos, min(duration, words[-1]["end"] + tail)))
    return segs


def new_length(segs: list[tuple]) -> float:
    return sum(s[2] - s[1] if s[0] == "giu" else s[1] for s in segs)


def remap(t: float, segs: list[tuple], start: bool = False) -> float:
    """Mốc cũ → mốc mới. Mốc rơi vào đoạn bị cắt thì dời về đầu đoạn giữ kế tiếp.

    start=True (mốc bắt đầu một từ): mốc nằm đúng chỗ chèn im lặng thì tính sau khoảng im, để phụ đề của
    từ punchline không hiện sớm."""
    out = 0.0
    for i, s in enumerate(segs):
        if s[0] == "im":
            out += s[1]
            continue
        _, a, b = s
        if t < a:
            return round(out, 3)
        nxt_im = i + 1 < len(segs) and segs[i + 1][0] == "im"
        if t < b or (t == b and not (start and nxt_im)):
            return round(out + t - a, 3)
        out += b - a
    return round(out, 3)


def render_audio(src: Path, segs: list[tuple]) -> None:
    parts, labels = "", ""
    for i, s in enumerate(segs):
        if s[0] == "giu":
            parts += f"[0:a]atrim={s[1]:.3f}:{s[2]:.3f},asetpts=PTS-STARTPTS[s{i}];"
        else:  # im lặng cùng định dạng với file gốc: lấy một mẩu đầu file rồi tắt tiếng
            parts += f"[0:a]atrim=0:{s[1]:.3f},asetpts=PTS-STARTPTS,volume=0[s{i}];"
        labels += f"[s{i}]"
    concat = labels + f"concat=n={len(segs)}:v=0:a=1[out]"
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
    ap.add_argument("--toi-da", type=float, default=0.2, help="quãng nghỉ dài hơn mức này thì rút (giây)")
    ap.add_argument("--giu", type=float, default=0.17, help="độ dài giữ lại sau khi rút (giây)")
    ap.add_argument("--giu-punchline", type=float, default=0.4, help="giữ sau dấu … (giây)")
    ap.add_argument("--dau", type=float, default=0.05, help="im lặng giữ trước từ đầu tiên (giây)")
    ap.add_argument("--duoi", type=float, default=0.15, help="im lặng giữ sau từ cuối cùng (giây)")
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
        segs = plan(words, sc["duration"], a.toi_da, a.giu, a.giu_punchline, a.dau, a.duoi)
        after = new_length(segs)
        n_cut = sum(1 for x in segs if x[0] == "giu") - 1
        n_add = sum(1 for x in segs if x[0] == "im")
        total_before += sc["duration"]
        total_after += after
        print(f"- cảnh {sc['id']}: cắt {n_cut} quãng, chèn {n_add} chỗ ngừng ({sc['duration']:.2f} → {after:.2f}s)")
        if a.thu:
            continue
        audio = project / sc["audio"]
        render_audio(audio, segs)
        for w in words:
            w["start"], w["end"] = remap(w["start"], segs, start=True), remap(w["end"], segs)
        sc["rut_nghi"] = {"toi_da": a.toi_da, "giu": a.giu, "giu_punchline": a.giu_punchline,
                          "dau": a.dau, "duoi": a.duoi, "bot_giay": round(sc["duration"] - after, 3)}
        sc["duration"] = round(probe(audio), 3)
    print(f"Tổng: {total_before:.2f}s → {total_after:.2f}s" + (" (chạy thử, chưa ghi)" if a.thu else ""))
    if not a.thu:
        subs_path.write_text(json.dumps(subs, ensure_ascii=False, indent=1), encoding="utf-8")
        print("Xong. Chạy lại build_timeline.py.")


if __name__ == "__main__":
    main()
