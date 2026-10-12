#!/usr/bin/env python3
"""Trộn nhạc nền + hiệu ứng âm thanh vào video đã render (chỉ có giọng đọc), rồi master cho TikTok/Reels/Shorts.

Cách dùng:
  python3 mix_audio.py <thư mục dự án> [--raw out/render-raw.mp4] [--music-volume 0.25] [--fade 1.5]

Đầu vào:  out/render-raw.mp4 (HyperFrames render, chỉ có giọng đọc), timeline.json (music, sfx, scenes)
Đầu ra:   out/video-no-music.mp4  – giọng đọc + sfx, để người dùng tự thêm nhạc thịnh hành trong ứng dụng
          out/video.mp4           – giọng đọc + sfx + nhạc nền (tự nhỏ khi có lời, rút dần trước cảnh cuối)
          out/audio-report.json   – độ lớn âm thanh đo được từng đoạn

Master theo cách của video-use: trộn trước, rồi loudnorm HAI lượt (đo → áp số đo) về −14 LUFS,
true peak ≤ −1 dBTP. Hình được copy, không encode lại.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

TARGET = {"I": -14.0, "TP": -1.5, "LRA": 11.0}


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def audio_graph(timeline: dict, with_music: bool, volume: float, fade: float, base_input: int) -> tuple[str, list[str]]:
    """Trả về (filtergraph ra nhãn [mix], danh sách input bổ sung)."""
    inputs: list[str] = []
    parts: list[str] = []
    voice_labels = ["[0:a]"]
    for i, fx in enumerate(timeline.get("sfx") or []):
        idx = base_input + len(inputs) // 2
        inputs += ["-i", fx["src"]]
        ms = int(fx["at"] * 1000)
        parts.append(f"[{idx}:a]volume={fx.get('volume', 0.6)},adelay={ms}|{ms}[fx{i}]")
        voice_labels.append(f"[fx{i}]")
    if len(voice_labels) > 1:
        parts.append(f"{''.join(voice_labels)}amix=inputs={len(voice_labels)}:duration=first:normalize=0[vo]")
    else:
        parts.append("[0:a]anull[vo]")

    if not with_music:
        parts.append("[vo]anull[mix]")
        return ";".join(parts), inputs

    duration = float(timeline["duration"])
    scenes = timeline.get("scenes") or []
    # Rút nhạc xuống trước cảnh cuối (lời kêu gọi) thay vì để đuôi nhạc đè lên
    outro_start = scenes[-1]["start"] if len(scenes) > 1 else duration
    fade_start = max(0.0, min(duration - fade, outro_start))
    fade_len = max(0.3, duration - fade_start)
    idx = base_input + len(inputs) // 2
    inputs += ["-stream_loop", "-1", "-i", timeline["music"]["src"]]
    parts += [
        f"[{idx}:a]volume={volume},atrim=0:{duration},afade=t=out:st={fade_start}:d={fade_len}[m]",
        "[vo]asplit=2[v1][v2]",
        # Nhạc tự nhỏ khoảng 12–15 dB khi có giọng đọc
        "[m][v1]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[duck]",
        "[v2][duck]amix=inputs=2:duration=first:normalize=0[mix]",
    ]
    return ";".join(parts), inputs


def loudnorm_two_pass(raw: Path, graph: str, extra_inputs: list[str], out: Path, tp: float | None = None) -> dict:
    base = ["ffmpeg", "-y", "-hide_banner", "-i", str(raw), *extra_inputs]
    tp = TARGET["TP"] if tp is None else tp
    ln = f"loudnorm=I={TARGET['I']}:TP={tp}:LRA={TARGET['LRA']}"
    # Lượt 1: đo
    res = subprocess.run(base + ["-filter_complex", f"{graph};[mix]{ln}:print_format=json[a]",
                                 "-map", "[a]", "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", res.stderr)
    if res.returncode != 0 or not m:
        raise RuntimeError(f"loudnorm lượt 1 lỗi:\n{res.stderr[-1500:]}")
    meas = json.loads(m.group(0))
    # Lượt 2: áp số đo, tuyến tính
    ln2 = (f"{ln}:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}"
           f":measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}"
           f":offset={meas['target_offset']}:linear=true")
    run(base + ["-filter_complex", f"{graph};[mix]{ln2},aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", "-shortest", str(out)])
    return meas


TP_MAX = -1.0  # trần true peak của file giao (sau khi mã hoá AAC)


def normalize_checked(raw: Path, graph: str, extra: list[str], out: Path) -> dict:
    """loudnorm hai lượt; mã hoá AAC có thể vọt đỉnh 0,5–0,8 dB so với đích, nên đo lại file ra và
    hạ đích TP thêm đúng phần vượt (tối đa 2 lần) để true peak cuối ≤ TP_MAX."""
    tp = TARGET["TP"]
    for _ in range(3):
        loudnorm_two_pass(raw, graph, extra, out, tp)
        r = measure(out)
        if r["true_peak"] is None or r["true_peak"] <= TP_MAX:
            return r
        tp = round(tp - (r["true_peak"] - TP_MAX) - 0.2, 2)
        print(f"- {out.name}: true peak {r['true_peak']} dBFS > {TP_MAX}, làm lại với đích TP {tp}")
    return r


def measure(path: Path, start: float | None = None, end: float | None = None) -> dict:
    cmd = ["ffmpeg", "-hide_banner"]
    if start is not None:
        cmd += ["-ss", f"{start}", "-to", f"{end}"]
    cmd += ["-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"]
    err = subprocess.run(cmd, capture_output=True, text=True).stderr
    summary = err[err.rfind("Summary:"):] if "Summary:" in err else err
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
    tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary)
    return {"lufs": float(i.group(1)) if i else None, "true_peak": float(tp.group(1)) if tp else None}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--raw", default="out/render-raw.mp4")
    ap.add_argument("--music-volume", type=float, help="mặc định lấy từ timeline.music.volume")
    ap.add_argument("--fade", type=float, default=1.5, help="giây rút nhạc tối thiểu ở cuối")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    raw = project / args.raw
    if not raw.exists():
        print(f"LỖI: không thấy {raw}")
        return 1
    timeline = json.loads((project / "timeline.json").read_text(encoding="utf-8"))
    out = project / "out"
    out.mkdir(exist_ok=True)

    report: dict = {"target": TARGET, "files": {}}
    no_music = out / "video-no-music.mp4"
    graph, extra = audio_graph(timeline, False, 0, args.fade, 1)
    report["files"]["video-no-music.mp4"] = normalize_checked(raw, graph, extra, no_music)

    final = out / "video.mp4"
    music = timeline.get("music")
    if music:
        volume = args.music_volume if args.music_volume is not None else music.get("volume", 0.25)
        graph, extra = audio_graph(timeline, True, volume, args.fade, 1)
        normalize_checked(raw, graph, extra, final)
    else:
        print("CẢNH BÁO: timeline không có nhạc nền, video.mp4 = bản không nhạc")
        shutil.copy2(no_music, final)
    report["files"]["video.mp4"] = measure(final)
    sfx = timeline.get("sfx") or []
    report["nhac_nen"] = music.get("src") if music else None
    report["sfx_count"] = len(sfx)
    if not music or not sfx:
        thieu = [x for x, ok in (("nhạc nền", bool(music)), ("sfx", bool(sfx))) if not ok]
        report["ghi_chu"] = (f"Không có {' và '.join(thieu)} trong timeline"
                             + (": video.mp4 và video-no-music.mp4 giống nhau, chỉ có giọng đọc." if not music else "."))

    # Đo từng đoạn: đoạn có lời vs cảnh cuối, để phát hiện cảnh cuối quá nhỏ hoặc sfx to hơn lời
    scenes = timeline.get("scenes") or []
    if len(scenes) > 1:
        report["sections"] = {
            "than_video": measure(final, scenes[0]["start"], scenes[-1]["start"]),
            "canh_cuoi": measure(final, scenes[-1]["start"], timeline["duration"]),
        }
    (out / "audio-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    for name, r in report["files"].items():
        print(f"- {name}: {r['lufs']} LUFS, true peak {r['true_peak']} dBFS")
    sec = report.get("sections")
    if sec and sec["than_video"]["lufs"] is not None and sec["canh_cuoi"]["lufs"] is not None:
        diff = sec["than_video"]["lufs"] - sec["canh_cuoi"]["lufs"]
        print(f"- cảnh cuối lệch {diff:+.1f} LU so với thân video")
        if abs(diff) > 6:
            print("CẢNH BÁO: cảnh cuối lệch âm lượng quá 6 LU so với phần còn lại")
    print(f"Xong: {final} và {no_music}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
