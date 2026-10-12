#!/usr/bin/env python3
"""Nhập giọng đọc tạo ở dịch vụ ngoài (Vbee, FPT.AI...): nhận dạng mốc từng từ, cắt thành từng cảnh.

Cách dùng:
  python3 nhap_audio_ngoai.py <thư mục dự án> [--dich-vu vbee] [--giong "tên giọng"] [--file a.mp3 b.mp3]
                              [--toc-do 1.1] [--rut-nghi 0.3] [--only 2,5] [--model small]

Đầu vào: file tải về trong audio/<dịch vụ>/ (mặc định mọi .mp3/.wav/.m4a, theo thứ tự tên: phan-1, phan-2...),
đọc đúng các cảnh mà xuat_loi_doc.py đã xuất, đúng thứ tự.
Cách làm:
1. Ghép các phần, nhận dạng lời bằng faster-whisper (tiếng Việt, mốc từng từ). Kết quả lưu ở
   audio/<dịch vụ>/_nhan-dang.json, không nhận dạng lại khi file âm thanh không đổi.
2. So chuỗi từ nhận dạng với lời gốc trong script.json. Từ khớp lấy mốc thật; từ không khớp (số, tên ứng dụng đọc theo
   phiên âm) được chia theo khoảng thời gian xung quanh.
3. Cắt ranh giới cảnh vào khoảng lặng gần nhất (ffmpeg silencedetect), ra audio/scene-<id>.mp3.
   --rut-nghi X: khoảng lặng trong cảnh dài hơn X giây được rút còn X (giọng dịch vụ ngoài hay nghỉ lâu ở dấu chấm).
   --toc-do: tăng tốc bằng atempo (nên giữ ≤ 1,15 để giọng không méo; tốt nhất chỉnh tốc độ ngay trên dịch vụ).
4. Ghi audio/subtitles.json cùng định dạng tts_edge.py: provider = tên dịch vụ, timing = "whisper".
Bản audio cũ (giọng khác) được chuyển vào audio/v-<dịch vụ cũ>-<thời điểm>/, không xoá.
Cần: pip install faster-whisper, ffmpeg.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from tts_edge import audio_duration  # noqa: E402

AUDIO_EXT = {".mp3", ".wav", ".m4a"}
PAD_IN, PAD_OUT = 0.05, 0.08  # giữ lại bao nhiêu giây lặng trước từ đầu, sau từ cuối của mỗi cảnh


def norm(tok: str) -> str:
    return re.sub(r"[^\w]", "", unicodedata.normalize("NFC", tok.lower()))


def ffmpeg(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", *args], capture_output=True, text=True)


def file_key(paths: list[Path], model: str, prompt: str) -> str:
    h = hashlib.sha1((model + "\n" + prompt).encode())
    for p in paths:
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()


def transcribe(path: Path, model_name: str, prompt: str) -> list[dict]:
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(path), language="vi", word_timestamps=True, initial_prompt=prompt,
                                   condition_on_previous_text=False, beam_size=5)
    words = []
    for seg in segments:
        for w in seg.words or []:
            if w.word.strip():
                words.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    return words


def spread(times: list, tokens: list[str], i1: int, i2: int, lo: float, hi: float) -> None:
    """Chia khoảng [lo, hi] cho các từ i1..i2-1 theo độ dài chữ."""
    weights = [len(tokens[k]) + 1 for k in range(i1, i2)]
    total, t = sum(weights), lo
    for k, w in zip(range(i1, i2), weights):
        d = (hi - lo) * w / total
        times[k] = (round(t, 3), round(t + d, 3))
        t += d


def align(tokens: list[str], heard: list[dict]) -> tuple[list[tuple[float, float]], list[bool]]:
    a, b = [norm(t) for t in tokens], [norm(w["text"]) for w in heard]
    times: list = [None] * len(a)
    exact = [False] * len(a)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]["start"], heard[j1 + k]["end"])
                exact[i1 + k] = True
        elif tag == "replace":
            spread(times, tokens, i1, i2, heard[j1]["start"], heard[j2 - 1]["end"])
    i = 0
    while i < len(a):  # từ bị nhận dạng bỏ sót: chen vào khoảng giữa hai từ kề
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(a) and times[j] is None:
            j += 1
        lo = times[i - 1][1] if i > 0 else (times[j][0] if j < len(a) else 0.0)
        hi = times[j][0] if j < len(a) else lo + 0.3 * (j - i)
        spread(times, tokens, i, j, lo, max(hi, lo))
        i = j
    return times, exact


def detect_silences(path: Path, noise: str, min_len: float, total: float) -> list[tuple[float, float]]:
    err = ffmpeg("-i", str(path), "-af", f"silencedetect=noise={noise}:d={min_len}", "-f", "null", "-").stderr
    starts = [max(0.0, float(x)) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return [(s, ends[k] if k < len(ends) else total) for k, s in enumerate(starts)]


def snap_to_silences(times: list[tuple[float, float]], sils) -> list[tuple[float, float]]:
    """Whisper hay đặt mốc đầu của từ sau chỗ nghỉ lấn vào khoảng lặng (sớm 0,5–1,5 giây): dời về cuối khoảng lặng.
    Tương tự, mốc cuối của từ trước chỗ nghỉ bị kéo dài vào khoảng lặng thì cắt về đầu khoảng lặng."""
    out = []
    for s, e in times:
        for ls, le in sils:
            if ls <= s < le - 0.02:
                s = le
            if ls + 0.02 < e <= le:
                e = ls
        out.append((round(s, 3), round(max(e, s + 0.04), 3)))
    return out


def best_silence(sils, lo: float, hi: float):
    """Khoảng lặng giao với [lo, hi] nhiều nhất."""
    best, best_len = None, 0.0
    for s, e in sils:
        overlap = min(e, hi) - max(s, lo)
        if overlap > best_len:
            best, best_len = (s, e), overlap
    return best


def cut_points(scenes: list[dict], sils, total: float) -> list[tuple[float, float]]:
    cuts = []
    first = scenes[0]["first"]
    head = best_silence(sils, 0.0, first)
    start = max(0.0, head[1] - PAD_IN) if head and head[0] <= 0.05 else max(0.0, first - PAD_IN)
    for k, sc in enumerate(scenes):
        if k + 1 < len(scenes):
            nxt = scenes[k + 1]["first"]
            sil = best_silence(sils, sc["last"] - 0.25, nxt + 0.25)
            if sil:
                end, next_start = min(sil[0] + PAD_OUT, sil[1]), max(sil[1] - PAD_IN, sil[0])
            else:
                end = next_start = (sc["last"] + nxt) / 2
        else:
            sil = best_silence(sils, sc["last"] - 0.25, total)
            end, next_start = (min(sil[0] + PAD_OUT, total) if sil else total), total
        cuts.append((start, max(end, start + 0.1)))
        start = next_start
    return cuts


def keep_segments(start: float, end: float, sils, max_pause: float | None) -> list[tuple[float, float]]:
    """Các đoạn giữ lại trong [start, end] sau khi rút các khoảng lặng dài hơn max_pause."""
    if not max_pause:
        return [(start, end)]
    segs, cur = [], start
    for s, e in sils:
        s, e = max(s, start), min(e, end)
        if e - s <= max_pause or s <= start + 0.01 or e >= end - 0.01:
            continue
        cut_from, cut_to = s + max_pause / 2, e - max_pause / 2
        segs.append((cur, cut_from))
        cur = cut_to
    segs.append((cur, end))
    return segs


def remap(t: float, segs: list[tuple[float, float]], speed: float) -> float:
    """Mốc gốc (giây, trong file ghép) → mốc trong file cảnh đã rút nghỉ và đổi tốc độ."""
    out = 0.0
    for s, e in segs:
        if t <= s:
            break
        out += min(t, e) - s
        if t <= e:
            break
    return round(out / speed, 3)


def render_scene(src: Path, dest: Path, segs, speed: float) -> None:
    chains = [f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS[a{k}]" for k, (s, e) in enumerate(segs)]
    joined = "".join(f"[a{k}]" for k in range(len(segs)))
    tail = f",atempo={speed}" if abs(speed - 1.0) > 1e-3 else ""
    graph = ";".join(chains) + f";{joined}concat=n={len(segs)}:v=0:a=1{tail}[out]"
    r = ffmpeg("-i", str(src), "-filter_complex", graph, "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", str(dest))
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg lỗi khi cắt {dest.name}:\n{r.stderr[-800:]}")


def backup_old(audio_dir: Path, provider: str) -> Path | None:
    old = [p for p in audio_dir.glob("scene-*.mp3")] + [p for p in [audio_dir / "subtitles.json"] if p.exists()]
    if not old:
        return None
    dest = audio_dir / f"v-{provider}-{time.strftime('%Y%m%d-%H%M')}"
    dest.mkdir(exist_ok=True)
    for p in old:
        shutil.move(str(p), dest / p.name)
    return dest


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--dich-vu", default="vbee")
    ap.add_argument("--giong", help="tên giọng đã chọn trên dịch vụ, ghi vào subtitles.json")
    ap.add_argument("--file", nargs="+", help="các file theo đúng thứ tự; mặc định mọi file âm thanh trong audio/<dịch vụ>/")
    ap.add_argument("--toc-do", type=float, default=1.0, help="hệ số tăng tốc, ví dụ 1.1")
    ap.add_argument("--rut-nghi", type=float, help="rút khoảng lặng trong cảnh dài hơn X giây còn X, ví dụ 0.3")
    ap.add_argument("--only", help="file chỉ chứa các cảnh này (xuất bằng xuat_loi_doc.py --only)")
    ap.add_argument("--model", default="small", help="model faster-whisper: small (mặc định), medium (chính xác hơn, chậm)")
    ap.add_argument("--nguong-lang", default="-35dB", help="ngưỡng coi là lặng cho silencedetect")
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        print("LỖI: chưa có ffmpeg")
        return 1
    if not 0.5 <= args.toc_do <= 2.0:
        print("LỖI: --toc-do phải trong khoảng 0,5–2")
        return 1
    project = Path(args.project)
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    only = {int(x) for x in args.only.split(",")} if args.only else None
    scenes = [sc for sc in script["scenes"] if not only or sc["id"] in only]
    audio_dir = project / "audio"
    src_dir = audio_dir / args.dich_vu
    files = [Path(f) for f in args.file] if args.file else sorted(
        p for p in src_dir.glob("*") if p.suffix.lower() in AUDIO_EXT and not p.name.startswith("_"))
    if not files:
        print(f"LỖI: chưa có file âm thanh trong {src_dir}/ (tải về từ {args.dich_vu}, đặt tên phan-1.mp3, phan-2.mp3...)")
        return 1
    print("File đầu vào: " + ", ".join(p.name for p in files))

    # 1. Ghép và nhận dạng
    src_dir.mkdir(parents=True, exist_ok=True)
    merged = src_dir / "_ghep.wav"
    concat_list = src_dir / "_ghep.txt"
    concat_list.write_text("".join(f"file '{p.resolve()}'\n" for p in files), encoding="utf-8")
    r = ffmpeg("-f", "concat", "-safe", "0", "-i", str(concat_list), "-ac", "1", "-ar", "44100", str(merged))
    if r.returncode != 0:
        print(f"LỖI ghép file:\n{r.stderr[-800:]}")
        return 1
    total = audio_duration(merged) or 0.0

    # Gợi ý chỉ gồm tên riêng: đưa cả lời đọc vào thì whisper hay "chép" lời gợi ý thay vì nghe thật
    names = {(sc.get("app") or {}).get("name") for sc in scenes} - {None}
    prompt = "Video giới thiệu ứng dụng điện thoại, tiếng Việt. " + ", ".join(sorted(names)) + "."
    cache_path = src_dir / "_nhan-dang.json"
    key = file_key(files, args.model, prompt)
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}
    if cache.get("key") == key:
        heard = cache["words"]
        print(f"Dùng lại kết quả nhận dạng đã lưu ({len(heard)} từ)")
    else:
        print(f"Đang nhận dạng lời ({total:.0f}s âm thanh, model {args.model}; lần đầu tải model mất vài phút)...")
        heard = transcribe(merged, args.model, prompt)
        cache_path.write_text(json.dumps({"key": key, "model": args.model, "words": heard},
                                         ensure_ascii=False, indent=1), encoding="utf-8")
    if not heard:
        print("LỖI: không nhận dạng được từ nào, kiểm tra file âm thanh")
        return 1

    # 2. Ghép với lời gốc
    tokens, owner = [], []
    for idx, sc in enumerate(scenes):
        for t in sc["narration"].split():
            tokens.append(t)
            owner.append(idx)
    times, exact = align(tokens, heard)
    sils = detect_silences(merged, args.nguong_lang, 0.12, total)
    times = snap_to_silences(times, sils)
    info = []
    for idx, sc in enumerate(scenes):
        ks = [k for k, o in enumerate(owner) if o == idx]
        info.append({"sc": sc, "ks": ks, "first": times[ks[0]][0], "last": times[ks[-1]][1],
                     "match": sum(exact[k] for k in ks) / len(ks)})
    order_bad = [i["sc"]["id"] for a, i in zip(info, info[1:]) if i["first"] < a["first"]]
    if order_bad:
        print(f"LỖI: thứ tự cảnh trong file âm thanh không khớp script.json (quanh cảnh {order_bad}). "
              "File tải về phải đúng các cảnh đã xuất, đúng thứ tự; kiểm tra --only và thứ tự phần.")
        return 1

    # 3. Cắt cảnh
    cuts = cut_points(info, sils, total)
    subs_path = audio_dir / "subtitles.json"
    old = json.loads(subs_path.read_text(encoding="utf-8")) if subs_path.exists() else {}
    if only:
        if old and old.get("provider") != args.dich_vu:
            print(f"CẢNH BÁO: các cảnh khác đang dùng giọng {old.get('provider')}, video sẽ lẫn hai giọng")
        by_id = {s["id"]: s for s in old.get("scenes", [])}
    else:
        moved = backup_old(audio_dir, old.get("provider", "cu") if old else "cu")
        if moved:
            print(f"Đã chuyển audio cũ vào {moved}")
        by_id = {}

    for it, (start, end) in zip(info, cuts):
        sc = it["sc"]
        segs = keep_segments(start, end, sils, args.rut_nghi)
        dest = audio_dir / f"scene-{sc['id']}.mp3"
        render_scene(merged, dest, segs, args.toc_do)
        words = []
        for k in it["ks"]:
            s, e = times[k]
            s, e = max(s, start), min(max(e, s), end)
            words.append({"text": tokens[k], "start": remap(s, segs, args.toc_do), "end": remap(e, segs, args.toc_do)})
        duration = audio_duration(dest)
        by_id[sc["id"]] = {"id": sc["id"], "audio": f"audio/{dest.name}", "text": sc["narration"],
                           "duration": duration, "timing": "whisper", "match": round(it["match"], 2), "words": words}
        rate = len(words) / duration if duration else 0
        flag = "  CẢNH BÁO: khớp thấp, nghe lại cảnh này" if it["match"] < 0.7 else ""
        print(f"- cảnh {sc['id']}: {duration or 0:.2f}s, {len(words)} từ ({rate:.1f} từ/giây), "
              f"khớp {it['match']:.0%}{flag}")

    valid = {sc["id"] for sc in script["scenes"]}
    voice = args.giong or (old.get("voice") if only else None) or "?"
    result = {"provider": args.dich_vu, "voice": voice,
              "rate": f"x{args.toc_do:g}", "pitch": "+0Hz", "rut_nghi": args.rut_nghi,
              "source": [str(p) for p in files], "scenes": [by_id[i] for i in sorted(by_id) if i in valid]}
    subs_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    missing = sorted(valid - set(by_id))
    if missing:
        print(f"CẢNH BÁO: chưa có audio cho cảnh {missing}")
    total_words = sum(len(s["words"]) for s in result["scenes"])
    total_dur = sum(s["duration"] or 0 for s in result["scenes"])
    print(f"Xong: {len(result['scenes'])} cảnh, {total_dur:.1f}s, trung bình {total_words / max(total_dur, 0.1):.1f} từ/giây "
          f"(kênh cần khoảng 4,5–5) → {subs_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
