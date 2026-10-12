#!/usr/bin/env python3
"""Dựng timeline.json từ script.json, audio/subtitles.json và assets/manifest.json.

Cách dùng:
  python3 build_timeline.py <thư mục dự án> [--gap 0.05] [--lead 0.1] [--tail 0.3]
                            [--music music/abc.mp3 | --music none] [--music-volume 0.25] [--fps 30]
                            [--brand-sfx chu-ky | --brand-sfx none]

Timeline gồm:
- scenes[]: mốc tuyệt đối của cảnh, giọng đọc, từng từ, tài nguyên, và shots[] (các nhịp đổi hình).
  Nhịp có "cue" (từ khoá trong lời đọc) sẽ rơi đúng lúc từ đó được đọc; cảnh không khai báo shots
  thì tự chia hình mỗi ~2,5 giây từ tài nguyên có sẵn.
- captions[]: phụ đề đã nhóm thành cụm ngắn kiểu TikTok (ngắt theo khoảng nghỉ, dấu câu, số từ, độ dài); video dọc
  mỗi cụm vừa MỘT dòng (đo bằng font phụ đề), cụm có tên tiếng Anh dài được tách nhỏ.
- sfx[]: hiệu ứng âm thanh (file trong sfx/), đặt đúng lúc cảnh bắt đầu hoặc lúc từ khoá được đọc.
- scenes[].verdict: con dấu phán quyết của thương hiệu (nhãn, thời điểm `at` theo `cue` của verdict).
  Nếu có file sfx/chu-ky.* thì tự thêm chữ ký âm thanh vào sfx[] đúng lúc con dấu xuất hiện.
- music: nhạc nền để mix_audio.py trộn sau khi render.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

SIZES = {"vertical": (1080, 1920), "horizontal": (1920, 1080)}
# Mục tiêu độ dài mặc định theo template (video dọc); ghi đè bằng target_seconds trong script.json
DEFAULT_TARGET = {"top-list": (120, 180), "tier-list": (120, 180), "tier-board": (120, 180), "news": (20, 45)}
HORIZONTAL_TARGET = (180, 480)
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
MAX_SHOT_SECONDS = 3.5   # người xem video ngắn cần hình đổi mỗi 2–3 giây
AUTO_SHOT_SECONDS = 2.5
STAMP_HOLD = 1.2         # con dấu phán quyết cần đứng ít nhất ngần này giây trước khi hết cảnh
# Nhóm phụ đề: video dọc ngắn, đổi cụm nhanh; video ngang cho phép cụm dài hơn
CAPTION_RULES = {
    # tiếng Việt tính theo âm tiết (một từ thường 1–2 âm tiết) nên cho phép 4 âm tiết mỗi cụm
    # max_px: bề rộng tối đa một dòng phụ đề đo bằng font thật (frame.md caption: Be Vietnam Pro 800, 68px). Khối phụ
    # đề rộng 870px, viền 12px lấn 6px mỗi bên → 858px; phép đo đã tính từ khoá to 1,18 lần, chừa 18px cho sai khác
    # giữa Pillow và trình duyệt. Video dọc phụ đề 1 dòng (.claude/rules/van-phong-loi-doc.md): cụm có tên tiếng Anh
    # dài ("Nhân vật chính Barry Steakfries,") bị tách tiếp cho vừa. Không có Pillow hoặc font thì dùng max_chars.
    "vertical": {"max_words": 4, "max_dur": 1.3, "pause": 0.3, "min_dur": 0.4, "lead": 0.08, "linger": 0.3,
                 "max_px": 840, "font_px": 68, "key_scale": 1.18, "max_chars": 22},
    "horizontal": {"max_words": 6, "max_dur": 2.5, "pause": 0.5, "min_dur": 0.5, "lead": 0.08, "linger": 0.6},
}
CAPTION_FONT = "templates/_shared/fonts/BeVietnamPro-ExtraBold.ttf"


def probe(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def norm(text: str) -> str:
    """Bỏ dấu câu, chữ thường; giữ dấu tiếng Việt để khớp đúng từ."""
    text = unicodedata.normalize("NFC", text.lower())
    return re.sub(r"[^\w\s]", "", text).strip()


def find_cue(words: list[dict], cue: str, from_idx: int) -> int | None:
    """Vị trí từ đầu tiên của cụm `cue` trong words, tìm từ from_idx trở đi."""
    target = norm(cue).split()
    if not target:
        return None
    flat = [norm(w["text"]) for w in words]
    for i in range(from_idx, len(flat) - len(target) + 1):
        # một "từ" hiển thị có thể gồm nhiều âm tiết (ví dụ tên ứng dụng đã ghép từ phiên âm)
        joined = " ".join(flat[i:i + len(target)]).split()
        if joined[:len(target)] == target:
            return i
        if flat[i].split()[:len(target)] == target:
            return i
    return None


# Thời lượng mặc định (giây) của từng loại gag; gag vào đúng từ khoá `cue` (cam-nang-phong-cach.md mục 11)
GAG_SECONDS = {"sticker": 1.4, "so-sanh": 1.8, "dong-bang": 1.0, "zoom-kich-tinh": 1.5, "rung": 0.4,
               "ky-vong-thuc-te": 2.0, "ten-that": 1.9, "tin-nhan": 2.6, "the-thoi-gian": 1.5,
               "ba-giai-doan": 2.4, "chu-to": 1.2, "binh-luan": 2.2, "dau-chu": 1.4, "combo": 1.6, "keo-so-sanh": 2.4}
# Kiểu hình (templates/_shared/kieu-hinh.js): nhịp cần dài tối thiểu chừng này giây (tính từ `at`) để diễn trọn và còn
# nhịp thở sau khi hình rơi xuống; `lead` là thời gian ảnh/thẻ phải hiện trước `at` (lấy từ nhịp trước).
KIEU_MIN_SECONDS = {"dap-zoom": 1.0, "dap-zoom-rung": 1.0, "cat-nhay": 1.3, "chia-o": 1.8, "lat-the": 0.6, "dem-so": 0.6}
KIEU_LEAD = {"dap-zoom": 0.85, "dap-zoom-rung": 0.85, "lat-the": 0.75, "dem-so": 0.9}
GAG_MIN_GAP = 1.5  # không hai gag cách nhau dưới 1,5 giây (không tính gag `rung`, rất ngắn)


def build_gags(sc: dict, words: list[dict], start: float, end: float, root: Path, sfx: list[dict],
               warnings: list[str]) -> list[dict]:
    """Gag của cảnh → timeline: mốc `at` = lúc từ khoá `cue` được đọc, `end` = at + thời lượng loại gag.

    Gag có `sfx` thì thêm hiệu ứng âm thanh cùng lúc vào `sfx[]`. Gag không thấy từ khoá bị bỏ, kèm cảnh báo."""
    out: list[dict] = []
    for g in sc.get("gags") or []:
        kind = g.get("kind")
        if kind not in GAG_SECONDS:
            warnings.append(f"cảnh {sc['id']}: gag '{kind}' không có trong danh sách loại gag, bỏ qua")
            continue
        pos = find_cue(words, g.get("cue", ""), 0)
        if pos is None:
            warnings.append(f"cảnh {sc['id']}: gag '{kind}' không thấy từ khoá '{g.get('cue')}' trong lời đọc, bỏ qua")
            continue
        at = words[pos]["start"]
        dur = float(g.get("duration") or GAG_SECONDS[kind])
        entry = {"kind": kind, "at": round(at, 3), "end": round(min(end - 0.05, at + dur), 3),
                 **{k: g[k] for k in ("asset", "text", "strong", "dim", "color", "so", "anh") if k in g}}
        if entry["end"] - entry["at"] < 0.3:
            entry["end"] = round(entry["at"] + 0.3, 3)
        out.append(entry)
        if g.get("sfx"):
            src = find_audio(root / "sfx", g["sfx"])
            if src:
                sfx.append({"src": str(src.resolve()), "at": round(at, 3), "volume": g.get("volume", 0.6),
                            "scene": sc["id"], "gag": kind})
            else:
                warnings.append(f"cảnh {sc['id']}: không có file sfx/{g['sfx']}.* cho gag '{kind}'")
    out.sort(key=lambda x: x["at"])
    last = None
    for e in out:
        if last and e["kind"] != "rung" and last["kind"] != "rung" and e["at"] - last["at"] < GAG_MIN_GAP:
            warnings.append(f"cảnh {sc['id']}: hai gag '{last['kind']}' và '{e['kind']}' cách nhau "
                            f"{e['at'] - last['at']:.1f}s, nên cách ít nhất {GAG_MIN_GAP:g}s")
        last = e
    return out


def auto_shots(media: dict | None, start: float, end: float) -> list[dict]:
    """Chia cảnh thành các nhịp ~2,5 giây, xoay vòng clip quay màn hình → screenshot → ảnh đầu (header)."""
    pool = []
    if media:
        if media.get("clip"):
            pool.append({"show": "clip"})
        pool += [{"show": f"screenshot:{i}"} for i in range(1, len(media.get("screenshots") or []) + 1)]
        if media.get("header"):
            pool.append({"show": "header"})
    if not pool:
        pool = [{"show": "text"}]
    count = max(1, round((end - start) / AUTO_SHOT_SECONDS))
    step = (end - start) / count
    return [{**pool[i % len(pool)], "at": round(start + i * step, 3), "auto": True} for i in range(count)]


def is_image_show(show: str) -> bool:
    return show in ("header", "icon", "clip") or show.startswith("screenshot:")


def is_fact_show(show: str) -> bool:
    return show.startswith("fact:")


def build_shots(sc: dict, words: list[dict], media: dict | None, start: float, end: float,
                warnings: list[str]) -> list[dict]:
    declared = sc.get("shots") or []
    if not declared:
        shots = auto_shots(media, start, end)
    else:
        shots, idx = [], 0
        for i, shot in enumerate(declared):
            entry = {k: v for k, v in shot.items() if k != "cue"}
            if i == 0 or not shot.get("cue"):
                entry["at"] = round(start if i == 0 else shots[-1]["at"] + AUTO_SHOT_SECONDS, 3)
            else:
                pos = find_cue(words, shot["cue"], idx)
                if pos is None:
                    warnings.append(f"cảnh {sc['id']}: không thấy từ khoá '{shot['cue']}' trong lời đọc, "
                                    f"nhịp này đặt sau nhịp trước {AUTO_SHOT_SECONDS}s")
                    entry["at"] = round(min(end - 0.5, shots[-1]["at"] + AUTO_SHOT_SECONDS), 3)
                else:
                    idx = pos + 1
                    entry["at"] = words[pos]["start"]  # hình phải hiện xong đúng lúc từ này được đọc
                    entry["cue"] = shot["cue"]
            shots.append(entry)
    for i, shot in enumerate(shots):
        shot["end"] = shots[i + 1]["at"] if i + 1 < len(shots) else round(end, 3)
        if shot["end"] - shot["at"] > MAX_SHOT_SECONDS:
            warnings.append(f"cảnh {sc['id']}: nhịp '{shot['show']}' đứng yên {shot['end'] - shot['at']:.1f}s, "
                            f"nên đổi hình trong vòng {MAX_SHOT_SECONDS:g}s")
    for i, shot in enumerate(shots):
        kieu = shot.get("kieu")
        if not kieu:
            continue
        if kieu not in KIEU_MIN_SECONDS:
            warnings.append(f"cảnh {sc['id']}: kiểu hình '{kieu}' không có trong kieu-hinh.js, template sẽ bỏ qua")
            continue
        # kiểu ảnh diễn tới khi ảnh kế tiếp vào (thẻ chen giữa không cắt); kiểu thẻ tới nhịp kế tiếp.
        # Lấy đà so với nhịp cùng loại liền trước (ảnh với ảnh, thẻ với thẻ).
        fam = is_fact_show if kieu in ("lat-the", "dem-so") else is_image_show
        nxt = next((x for x in shots[i + 1:] if fam(x["show"])), None)
        stop = nxt["at"] if nxt else round(end, 3)
        if stop - shot["at"] < KIEU_MIN_SECONDS[kieu]:
            warnings.append(f"cảnh {sc['id']}: nhịp '{shot['show']}' kiểu '{kieu}' chỉ diễn được {stop - shot['at']:.2f}s, "
                            f"cần ≥ {KIEU_MIN_SECONDS[kieu]:g}s để trọn động tác và còn nhịp thở")
        if kieu == "chia-o":
            inside = [x["show"] for x in shots[i + 1:] if is_fact_show(x["show"]) and x["at"] < stop]
            if inside:
                warnings.append(f"cảnh {sc['id']}: thẻ {inside} bật lên trong lúc chia-o đang diễn, sẽ che các ô; "
                                f"dời thẻ ra sau nhịp ảnh kế tiếp")
        prev = next((x for x in reversed(shots[:i]) if fam(x["show"])), None)
        if prev and kieu in KIEU_LEAD and shot["at"] - prev["at"] < KIEU_LEAD[kieu]:
            warnings.append(f"cảnh {sc['id']}: nhịp kiểu '{kieu}' cách nhịp {'thẻ' if fam is is_fact_show else 'ảnh'} trước "
                            f"{shot['at'] - prev['at']:.1f}s, cần ≥ {KIEU_LEAD[kieu]:g}s để hiện trước khi giật vào hoặc lật")
    return shots


# Chữ hiển thị trên phụ đề khác chữ đọc: lời đọc viết theo cách đọc cho giọng TTS ("bảy phẩy hai mê ga"), phụ đề hiện
# ký hiệu quen mắt ("MB"). Khoá là chuỗi âm tiết đã norm(); cụm khớp được gộp thành MỘT từ phụ đề (không tách sang hai
# cụm), mốc start của âm tiết đầu, end của âm tiết cuối; scenes[].words (mốc từng từ) giữ nguyên. Khoá dài khớp trước.
CAPTION_DISPLAY = {
    "mê ga bai": "MB", "mê ga": "MB",
    "gi ga bai": "GB", "gi ga": "GB",
    "ki lô bai": "KB",
    "tê ra bai": "TB",
    "ây ai": "AI",
    "ai ô ét": "iOS",
    "vi pi en": "VPN",
    "pi đi ép": "PDF",
}


def apply_display(words: list[dict]) -> list[dict]:
    """Gộp các âm tiết theo CAPTION_DISPLAY thành một từ hiển thị cho phụ đề (giữ dấu câu cuối cụm)."""
    keys = sorted(((k.split(), v) for k, v in CAPTION_DISPLAY.items()), key=lambda kv: -len(kv[0]))
    out, i = [], 0
    while i < len(words):
        for syl, shown in keys:
            n = len(syl)
            chunk = words[i:i + n]
            if len(chunk) < n or [norm(w["text"]) for w in chunk] != syl:
                continue
            # không gộp qua dấu câu giữa chừng ("mê, ga")
            if any(re.search(r"[^\w\s]$", w["text"]) for w in chunk[:-1]):
                continue
            tail = re.search(r"[^\w\s]*$", chunk[-1]["text"]).group(0)
            out.append({"text": shown + tail, "start": chunk[0]["start"], "end": chunk[-1]["end"]})
            i += n
            break
        else:
            out.append(words[i])
            i += 1
    return out


# Hư từ thường mở đầu một cụm nghĩa: ngắt TRƯỚC chúng thì ít khi tách đôi từ ghép ("thế giới", "vũ khí")
BREAK_BEFORE = {"với", "và", "nhưng", "của", "là", "để", "cho", "khi", "trong", "những", "các", "một",
                "mà", "thì", "nên", "vì", "hay", "hoặc", "đã", "sẽ", "đang", "được", "bị", "ở", "từ", "như"}


def lexical_breaks(clause: list[dict]) -> set[int] | None:
    """Các vị trí được phép ngắt (trước từ thứ j) sao cho không tách đôi từ ghép.

    Dùng pyvi để tách từ tiếng Việt nếu có (pip install pyvi); không có thì trả None.
    """
    try:
        from pyvi import ViTokenizer
    except ImportError:
        return None
    syllables = [norm(s) for w in clause for s in w["text"].split()]
    tokens = [t for t in ViTokenizer.tokenize(" ".join(syllables)).split() if re.search(r"\w", t)]
    starts, pos = set(), 0
    for t in tokens:
        starts.add(pos)
        pos += t.count("_") + 1
    breaks, offset = set(), 0
    for j, w in enumerate(clause):
        if j and offset in starts:
            breaks.add(j)
        offset += len(w["text"].split())
    return breaks


def split_clause(clause: list[dict], max_words: int) -> list[list[dict]]:
    """Chia một vế câu thành các cụm ≤ max_words, chỉ ngắt ở ranh giới từ, ưu tiên ngắt trước hư từ."""
    n = len(clause)
    if n <= max_words:
        return [clause]
    allowed = lexical_breaks(clause)
    if allowed is None:
        allowed = set(range(1, n))
    chunks, start = [], 0
    while n - start > max_words:
        window = [j for j in range(start + 2, start + max_words + 1) if j in allowed and n - j >= 2]
        preferred = [j for j in window if norm(clause[j]["text"]) in BREAK_BEFORE]
        if preferred:
            cut = preferred[-1]
        elif window:
            cut = window[-1]
        elif start + max_words + 1 in allowed and n - (start + max_words + 1) >= 1:
            cut = start + max_words + 1  # nhận thêm 1 âm tiết để giữ nguyên từ ghép
        else:
            cut = start + max_words
        chunks.append(clause[start:cut])
        start = cut
    chunks.append(clause[start:])
    return chunks


def caption_fitter(root: Path, rules: dict, keywords: set[str]):
    """Trả về hàm width(words) (px theo font phụ đề, hoặc số ký tự) và ngưỡng; None nếu luật không giới hạn bề rộng.

    Từ khoá (script.scenes[].emphasis) hiện to key_scale lần như template (gr-word-key), nên đo to hơn tương ứng.
    """
    if "max_px" not in rules and "max_chars" not in rules:
        return None
    font = None
    if "max_px" in rules:
        try:
            from PIL import ImageFont
            font = ImageFont.truetype(str(root / CAPTION_FONT), rules["font_px"])
        except Exception:  # Pillow hoặc font không có: đếm ký tự
            font = None
    if font is not None:
        space = font.getlength(" ")

        def width(ws: list[dict]) -> float:
            total = sum(font.getlength(w["text"]) * (rules["key_scale"] if norm(w["text"]) in keywords else 1.0)
                        for w in ws)
            return total + space * max(0, len(ws) - 1)
        return width, rules["max_px"]

    def chars(ws: list[dict]) -> float:
        return len(" ".join(w["text"] for w in ws))
    return chars, rules.get("max_chars", 22)


def expand_word(w: dict) -> list[dict]:
    """Tách một "từ" nhiều âm tiết (tên ứng dụng đọc liền một mốc, vd. "Google Lens.") thành từng âm tiết,
    mốc thời gian chia theo độ dài chữ trong khoảng [start, end] của từ gốc (phụ đề hiện dần trong lúc đọc tên)."""
    toks = w["text"].split()
    if len(toks) < 2:
        return [w]
    weights = [len(re.sub(r"[^\w]", "", t)) + 1 for t in toks]
    total, acc, out = sum(weights), 0, []
    span = w["end"] - w["start"]
    for t, k in zip(toks, weights):
        s0 = w["start"] + span * acc / total
        acc += k
        out.append({"text": t, "start": round(s0, 3), "end": round(w["start"] + span * acc / total, 3)})
    return out


def fit_width(chunk: list[dict], width, limit: float) -> list[list[dict]]:
    """Chia cụm phụ đề quá rộng thành ít cụm nhất vừa một dòng (bề rộng ≤ limit).

    Chỉ ngắt ở ranh giới từ (pyvi) hoặc giữa các âm tiết của tên tiếng Anh bị tách; nhiều cách cùng số cụm thì chọn
    cách ít ngắt giữa tên nhất, rồi cụm rộng nhất hẹp nhất (cân hai dòng), rồi cách ngắt trước hư từ.
    """
    if width(chunk) <= limit:
        return [chunk]
    allowed_words = lexical_breaks(chunk)
    units, breaks, inner = [], set(), set()
    for j, w in enumerate(chunk):
        if j and (allowed_words is None or j in allowed_words):
            breaks.add(len(units))
        parts = expand_word(w)
        for k in range(1, len(parts)):
            inner.add(len(units) + k)  # ngắt giữa tên: chỉ khi không còn cách nào khác cho vừa
        units.extend(parts)
    breaks |= inner
    if not breaks:
        return [chunk]
    cand = sorted(breaks)
    best = None
    from itertools import combinations
    for r in range(1, len(cand) + 1):
        for cuts in combinations(cand, r):
            edges = [0, *cuts, len(units)]
            groups = [units[a:b] for a, b in zip(edges, edges[1:])]
            widest = max(width(g) for g in groups)
            if widest > limit and r < len(cand):
                continue
            hits = sum(1 for c in cuts if norm(units[c]["text"]) in BREAK_BEFORE)
            key = (widest > limit, sum(1 for c in cuts if c in inner), widest, -hits)
            if best is None or key < best[0]:
                best = (key, groups)
        if best and not best[0][0]:
            break
    return best[1] if best else [chunk]


def group_captions(scenes: list[dict], rules: dict, fitter=None) -> list[dict]:
    """Nhóm từ thành cụm phụ đề: ngắt ở dấu câu và chỗ nghỉ, rồi chia đều theo số từ.

    Edge TTS trả mốc liền nhau trong một câu (không có khoảng nghỉ), nên trong câu phải
    chia theo chữ chứ không theo khoảng lặng. Không cụm nào vượt ranh giới cảnh hay câu.
    """
    groups: list[dict] = []
    for sc in scenes:
        clauses: list[list[dict]] = []
        current: list[dict] = []
        for w in apply_display(sc["words"]):
            if current and (w["start"] - current[-1]["end"] >= rules["pause"]
                            or re.search(r"[.!?…,:;]$", current[-1]["text"])):
                clauses.append(current)
                current = []
            current.append(w)
        if current:
            clauses.append(current)
        for clause in clauses:
            pieces = split_clause(clause, rules["max_words"])
            if fitter:
                pieces = [p for c in pieces for p in fit_width(c, *fitter)]
            for g in pieces:
                groups.append({"scene": sc["id"], "text": " ".join(w["text"] for w in g),
                               "start": g[0]["start"] - rules["lead"], "last_end": g[-1]["end"],
                               "scene_end": sc["end"], "words": g})
    for i, g in enumerate(groups):
        prev_end = groups[i - 1]["end"] if i else 0.0
        g["start"] = round(max(g["start"], prev_end), 3)
        nxt = groups[i + 1]["start"] - 0.05 if i + 1 < len(groups) else g["scene_end"]
        g["end"] = round(min(nxt, g["last_end"] + rules["linger"], g["scene_end"]), 3)
        g["end"] = max(g["end"], round(g["start"] + rules["min_dur"], 3))
        del g["last_end"], g["scene_end"]
    return groups


def find_audio(folder: Path, name: str) -> Path | None:
    for ext in AUDIO_EXT:
        p = folder / f"{name}{ext}"
        if p.exists():
            return p
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--gap", type=float, default=0.05, help="nghỉ sau mỗi cảnh (giây), ngắn để giữ nhịp")
    ap.add_argument("--lead", type=float, default=0.1, help="nghỉ trước lời đọc đầu tiên, hook phải vào ngay")
    ap.add_argument("--tail", type=float, default=0.3, help="giữ hình cảnh cuối sau lời đọc, ngắn để lặp vòng mượt")
    ap.add_argument("--music", help="đường dẫn nhạc nền, hoặc 'none'")
    ap.add_argument("--music-volume", type=float, default=0.25, help="trước khi tự giảm khi có lời đọc")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--brand-sfx", default="chu-ky",
                    help="tên file chữ ký âm thanh trong sfx/ phát cùng con dấu phán quyết, hoặc 'none'")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    root = project.parent.parent  # projects/<dự án> → gốc repo
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    subs = json.loads((project / "audio/subtitles.json").read_text(encoding="utf-8"))
    manifest_path = project / "assets/manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    subs_by_id = {s["id"]: s for s in subs["scenes"]}

    fmt = script["format"]
    width, height = SIZES[fmt]
    errors, warnings = [], []
    if manifest.get("apps") and (manifest.get("duyet") or {}).get("trang_thai") != "da-duyet":
        warnings.append("tài nguyên chưa được duyệt ở DỪNG 2b: chạy duyet_hinh.py tao rồi ghi (skill lay-tai-nguyen)")
    scenes, sfx, cursor = [], [], 0.0
    n = len(script["scenes"])
    for idx, sc in enumerate(script["scenes"]):
        sub = subs_by_id.get(sc["id"])
        if not sub:
            errors.append(f"cảnh {sc['id']} chưa có giọng đọc, chạy lại tts_edge.py")
            continue
        dur = probe(project / sub["audio"])
        lead = args.lead if idx == 0 else 0.0
        hold = args.tail if idx == n - 1 else args.gap
        voice_start = cursor + lead
        length = lead + dur + hold
        end = cursor + length
        media = None
        key = (manifest.get("scenes") or {}).get(str(sc["id"]))
        if key:
            media = manifest["apps"].get(key)
        elif sc.get("app"):
            warnings.append(f"cảnh {sc['id']}: chưa có tài nguyên cho '{sc['app'].get('name')}'")
        words = [{"text": w["text"], "start": round(voice_start + w["start"], 3),
                  "end": round(voice_start + w["end"], 3)} for w in sub["words"]]

        for effect in sc.get("sfx") or []:
            src = find_audio(root / "sfx", effect["name"])
            if not src:
                warnings.append(f"cảnh {sc['id']}: không có file sfx/{effect['name']}.*")
                continue
            at = cursor
            if effect.get("cue"):
                pos = find_cue(words, effect["cue"], 0)
                if pos is None:
                    warnings.append(f"cảnh {sc['id']}: sfx không thấy từ khoá '{effect['cue']}'")
                else:
                    at = words[pos]["start"]
            sfx.append({"src": str(src.resolve()), "at": round(at, 3),
                        "volume": effect.get("volume", 0.6), "scene": sc["id"]})

        verdict_entry = None
        verdict = sc.get("verdict")
        if isinstance(verdict, dict) and verdict.get("label"):
            stamp_at = None
            if verdict.get("cue"):
                pos = find_cue(words, verdict["cue"], 0)
                if pos is None:
                    warnings.append(f"cảnh {sc['id']}: không thấy từ khoá verdict '{verdict['cue']}', "
                                    f"con dấu đặt {STAMP_HOLD:g}s trước khi hết cảnh")
                else:
                    stamp_at = words[pos]["start"]
            if stamp_at is None:
                stamp_at = max(cursor, end - STAMP_HOLD)
            verdict_entry = {"label": verdict["label"], "at": round(stamp_at, 3)}
            declared = {e.get("name") for e in sc.get("sfx") or []}
            if args.brand_sfx != "none" and args.brand_sfx not in declared:
                src = find_audio(root / "sfx", args.brand_sfx)
                if src:
                    sfx.append({"src": str(src.resolve()), "at": round(stamp_at, 3),
                                "volume": 0.8, "scene": sc["id"], "brand": True})
                else:
                    warnings.append(f"chưa có sfx/{args.brand_sfx}.* (chữ ký âm thanh), con dấu sẽ không có tiếng")

        gags = build_gags(sc, words, cursor, end, root, sfx, warnings)

        scenes.append({
            "id": sc["id"],
            "type": sc["type"],
            "start": round(cursor, 3),
            "end": round(end, 3),
            "duration": round(length, 3),
            "voice": {"src": sub["audio"], "start": round(voice_start, 3), "duration": round(dur, 3)},
            "words": words,
            "timing": sub.get("timing"),
            "media": media,
            "shots": build_shots(sc, words, media, cursor, end, warnings),
            **({"verdict": verdict_entry} if verdict_entry else {}),
            **({"gags": gags} if gags else {}),
        })
        cursor = end

    keywords = {norm(x) for sc in script["scenes"] for w in sc.get("emphasis") or [] for x in str(w).split()}
    keywords.discard("")
    captions = group_captions(scenes, CAPTION_RULES[fmt], caption_fitter(root, CAPTION_RULES[fmt], keywords))

    if len(sfx) > max(3, cursor / 4):
        warnings.append(f"{len(sfx)} hiệu ứng âm thanh trong {cursor:.0f}s là quá dày; "
                        f"chỉ giữ hiệu ứng gắn với sự kiện nhìn thấy (đổi hạng, lộ tên ứng dụng)")

    music = None
    if args.music != "none":
        if args.music:
            mpath = Path(args.music)
        else:
            candidates = sorted(p for p in (root / "music").glob("*") if p.suffix.lower() in AUDIO_EXT)
            mpath = candidates[0] if candidates else None
        if mpath and mpath.exists():
            music = {"src": str(mpath.resolve()), "volume": args.music_volume,
                     "duration": round(probe(mpath), 3)}
            if music["duration"] < cursor:
                print("Ghi chú: nhạc nền ngắn hơn video, mix_audio.py sẽ lặp nhạc")
        else:
            warnings.append("không có nhạc nền trong music/")

    target = script.get("target_seconds")
    if isinstance(target, list) and len(target) == 2:
        lo, hi = target
    else:
        lo, hi = DEFAULT_TARGET.get(script["template"], (20, 180)) if fmt == "vertical" else HORIZONTAL_TARGET
    if not lo <= cursor <= hi:
        warnings.append(f"tổng độ dài {cursor:.1f}s nằm ngoài mục tiêu {lo}–{hi}s")

    timeline = {"format": fmt, "template": script["template"], "width": width, "height": height,
                "fps": args.fps, "duration": round(cursor, 3), "scenes": scenes,
                "captions": captions, "sfx": sfx, "music": music}
    (project / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    for e in errors:
        print(f"LỖI: {e}")
    for w in warnings:
        print(f"CẢNH BÁO: {w}")
    shots_total = sum(len(s["shots"]) for s in scenes)
    print(f"Xong: {len(scenes)} cảnh, {shots_total} nhịp hình, {len(captions)} cụm phụ đề, "
          f"{len(sfx)} sfx, {cursor:.1f}s → {project / 'timeline.json'}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
