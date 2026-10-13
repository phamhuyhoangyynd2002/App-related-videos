#!/usr/bin/env python3
"""Kiểm tra script.json của một dự án AppReel.

Cách dùng: python3 validate_script.py <thư mục dự án | đường dẫn script.json>
Thoát với mã 1 nếu có LỖI; CẢNH BÁO không làm thất bại.
Ngoài schema, kiểm tra quy tắc thương hiệu (.claude/rules/phong-cach-thuong-hieu.md): con dấu phán quyết
(`verdict`), từ không dùng trong kenh/ho-so-kenh.md, câu mở đầu dùng lại của 10 video gần nhất.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

FORMATS = {"vertical", "horizontal"}
TEMPLATES = {"top-list", "news", "tier-list", "tier-board"}
SCENE_TYPES = {"intro", "item", "headline", "tier", "outro"}
TIERS = {"S", "A", "B", "C", "D"}
BOARD_TIERS = {"SSS", "S", "A", "B", "C", "D"}  # hàng của template tier-board
NEEDS_APP = {"item", "tier"}
NEEDS_SOURCES = {"item", "headline", "tier"}
FORBIDDEN_NARRATION = ["#", "&", "/", "→", "“", "”"]
WORDS_PER_SECOND = 2.75  # đo thực tế với vi-VN-HoaiMyNeural ở +0%, đã tính khoảng nghỉ giữa câu
TARGET_SECONDS = {"vertical": (13, 180), "horizontal": (180, 480)}
# Độ dài video dọc: bản nhanh 13–25s (một ý), bản gọn 45–60s, bản đầy đủ 120–180s (danh sách, mặc định); bản dài tới 300s phải khai báo target_seconds
DEFAULT_TARGET_BY_TEMPLATE = {"top-list": (120, 180), "tier-list": (120, 180), "tier-board": (120, 180), "news": (20, 45)}
SHOW_PATTERN = re.compile(r"^(header|icon|clip|text|logo|screenshot:\d+|fact:.+)$")
HARD_MAX_VERTICAL = 180  # quá 3 phút YouTube không tính là Shorts; phải khai báo target_seconds (bản dài)
ABSOLUTE_MAX_VERTICAL = 300  # trần cứng 5 phút
SCENE_SECONDS = {"vertical": (2.0, 9.0), "horizontal": (4.0, 11.0)}
# Bản đầy đủ (mục tiêu > 60s): mỗi ứng dụng là một cảnh kể chuyện 15–30s theo công thức 5 nhịp
LONG_SCENE_SECONDS = (2.0, 32.0)
LONG_MAX_SENTENCES = 9
LONG_MAX_INTRO_SECONDS = 10.0
MAX_INTRO_SECONDS = {"vertical": 7.0, "horizontal": 15.0}
MAX_ON_SCREEN = {"vertical": 28, "horizontal": 40}
MAX_WORDS_PER_SENTENCE = 15
MAX_WORDS_HOOK = 12
FILLERS = ["như các bạn đã biết", "không để các bạn chờ lâu", "chúng ta cùng tìm hiểu",
           "xin chào các bạn", "chào mừng các bạn", "quay trở lại với kênh", "đầu tiên thì"]
PLATFORM_CTA = ["đăng ký kênh", "bấm chuông", "nhấn chuông", "tiktok", "youtube", "instagram",
                "facebook", "reels", "shorts", "follow"]
# Con dấu phán quyết của thương hiệu: nhãn cố định, đúng một lần mỗi video. Nhãn đọc từ dòng "Nhãn con dấu" của
# kenh/ho-so-kenh.md (các cụm trong ngoặc kép); chưa khai báo thì dùng bộ mặc định dưới đây.
DEFAULT_VERDICT_LABELS = {"CÀI NGAY", "DÙNG THỬ", "CHỜ GIẢM GIÁ", "BỎ QUA"}
NEEDS_VERDICT = {"top-list", "tier-list", "tier-board"}  # video một ứng dụng (news) cũng cần, xét riêng bên dưới
RECENT_OPENERS = 10  # không dùng lại câu mở đầu của 10 video gần nhất
# Nhịp cười bằng hình (kenh/cam-nang-phong-cach.md, kenh/nhan-vat.md)
GAG_KINDS = {"sticker", "dong-bang", "zoom-kich-tinh", "rung", "ky-vong-thuc-te", "ten-that", "tin-nhan",
             "the-thoi-gian", "ba-giai-doan", "so-sanh", "chu-to", "binh-luan", "dau-chu", "combo", "keo-so-sanh"}
GAG_NEEDS_ASSET = {"sticker", "so-sanh"}
# Gag chữ phủ tối cả khung (chốt 12/10/2026): che hình ứng dụng và lặp phụ đề nếu dùng nhiều.
# chu-to, dong-bang tối đa 2 lần mỗi video, chỉ câu cụt 1–3 chữ, không nhắc lại lời đọc;
# tổng thời gian mọi gag phủ khung ≤ 5% thời lượng. Muốn nhấn chữ khác: `dau-chu` (đè lên ảnh, không phủ tối).
LOUD_TEXT_GAGS = {"chu-to", "dong-bang"}
MAX_LOUD_TEXT_GAGS = 2
MAX_LOUD_TEXT_WORDS = 3
COVER_GAG_SECONDS = {"chu-to": 1.2, "dong-bang": 1.0, "ky-vong-thuc-te": 2.0, "the-thoi-gian": 1.5}
MAX_COVER_RATIO = 0.05
NEEDS_GAG = {"item", "tier"}  # bản đầy đủ: mỗi mục ít nhất một gag
# Kiểu hình (templates/_shared/kieu-hinh.md, chắt lọc từ video-shotcraft). Luật: một kiểu đặc biệt chỉ làm "nhân vật
# chính" vài lần mỗi video (shotcraft P4), cú đập toàn khung tối đa 3 lần (R4), hai mục liền nhau không cùng kiểu.
KIEU_MEDIA = {"dap-zoom", "dap-zoom-rung", "cat-nhay", "chia-o"}
KIEU_FACT = {"lat-the", "dem-so"}
KIEU_MAX = {"dap-zoom": 2, "cat-nhay": 2, "chia-o": 1, "lat-the": 2, "dem-so": 3, "combo": 1, "keo-so-sanh": 1}
KIEU_GROUP = {"dap-zoom-rung": "dap-zoom"}  # biến thể tính chung giới hạn
MAX_FRAME_HITS = 3  # dap-zoom-rung, cat-nhay, gag rung: cú đập cả khung (không tính con dấu phán quyết)
MIN_DISTINCT_KIEU = 4  # bản đầy đủ: ít nhất chừng này kiểu khác nhau (references/ke-hoach-hinh.md)
KIEU_TEMPLATES = {"top-list", "tier-board"}
CHUYEN = {"day-len", "lia"}
CHUYEN_TEMPLATES = {"top-list"}
# Từ tục nhẹ được phép có giới hạn (kenh/ho-so-kenh.md): tối đa 1 lần mỗi video, không ở cảnh hook, không trên màn hình
LIMITED_SLANG = re.compile(r"\bvãi\b", re.IGNORECASE)
MAX_LIMITED_SLANG = 1


def recent_scripts(project_dir: Path, n: int) -> list[dict]:
    """script.json của n dự án gần nhất (theo tên thư mục YYYY-MM-DD-...), trừ dự án hiện tại."""
    root = project_dir.parent
    others = sorted(p for p in root.glob("*/script.json") if p.parent != project_dir)
    scripts = []
    for p in others[-n:]:
        try:
            scripts.append(json.loads(p.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            continue
    return scripts


def recent_hook_types(project_dir: Path, n: int = 3) -> list[str]:
    """hook_type của n dự án gần nhất, trừ dự án hiện tại."""
    return [s["hook_type"] for s in recent_scripts(project_dir, n) if s.get("hook_type")]


def opener(data: dict) -> str:
    """Câu đầu tiên của lời đọc, chữ thường, bỏ dấu câu."""
    scenes = data.get("scenes") or []
    narration = (scenes[0].get("narration") or "") if scenes else ""
    first = next((s for s in re.split(r"[.!?…]+", narration) if s.strip()), "")
    return re.sub(r"[^\w\s]", "", first.lower()).strip()


def banned_phrases(repo_root: Path) -> list[str]:
    """Các cụm trong ngoặc kép ở dòng 'Từ, cụm từ không dùng' của kenh/ho-so-kenh.md."""
    try:
        text = (repo_root / "kenh" / "ho-so-kenh.md").read_text(encoding="utf-8")
    except OSError:
        return []
    m = re.search(r"Từ, cụm từ không dùng:(.*)", text)
    return [p.strip().lower() for p in re.findall(r'"([^"]+)"', m.group(1))] if m else []


def verdict_labels(repo_root: Path) -> set[str]:
    """Nhãn con dấu khai báo ở dòng 'Nhãn con dấu' của kenh/ho-so-kenh.md; không có thì dùng bộ mặc định."""
    try:
        text = (repo_root / "kenh" / "ho-so-kenh.md").read_text(encoding="utf-8")
    except OSError:
        return DEFAULT_VERDICT_LABELS
    m = re.search(r"Nhãn con dấu:(.*)", text)
    found = {p.strip().upper() for p in re.findall(r'"([^"]+)"', m.group(1))} if m else set()
    return found or DEFAULT_VERDICT_LABELS


def rate_factor(rate: str) -> float:
    m = re.fullmatch(r"([+-]\d+)%", rate or "+0%")
    return 1 + int(m.group(1)) / 100 if m else 1.0


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    path = Path(sys.argv[1])
    if path.is_dir():
        path = path / "script.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"LỖI: không đọc được {path}: {e}")
        return 1

    errors: list[str] = []
    warnings: list[str] = []

    for key in ("title", "format", "template", "language", "scenes", "sources"):
        if key not in data:
            errors.append(f"thiếu trường gốc '{key}'")
    fmt = data.get("format")
    template = data.get("template")
    if fmt not in FORMATS:
        errors.append(f"format '{fmt}' không hợp lệ, phải là {sorted(FORMATS)}")
    if template not in TEMPLATES:
        errors.append(f"template '{template}' không hợp lệ, phải là {sorted(TEMPLATES)}")
    if data.get("language") != "vi":
        warnings.append("language khác 'vi'")
    if not data.get("angle"):
        warnings.append("chưa có 'angle' (góc nhìn riêng của video)")
    sponsor = data.get("sponsorship")
    if sponsor:
        first = (data.get("scenes") or [{}])[0]
        head = (first.get("on_screen_text", "") + " " + first.get("narration", "")).lower()
        if not any(w in head for w in ("tài trợ", "quảng cáo", "hợp tác", "được tặng", "tặng gói", "affiliate",
                                       "mã giới thiệu")):
            errors.append("có 'sponsorship' nhưng cảnh 1 chưa có câu công bố (tài trợ/được tặng gói/quảng cáo)")
    if not data.get("message"):
        warnings.append("chưa có 'message' (một câu: video này nói với ai điều gì)")
    variants = data.get("hook_variants") or []
    if len(variants) < 2:
        warnings.append("nên có ít nhất 2 phương án trong 'hook_variants' để người duyệt chọn")
    hook_type = data.get("hook_type")
    if not hook_type:
        warnings.append("chưa có 'hook_type' (kiểu hook, xem hook-va-giu-chan.md)")
    elif hook_type in recent_hook_types(path.parent.resolve()):
        warnings.append(f"hook_type '{hook_type}' đã dùng trong 3 video gần nhất, nên đổi kiểu hook")
    project_dir = path.parent.resolve()
    mine = opener(data)
    if mine:
        mine_words = set(mine.split())
        for other in recent_scripts(project_dir, RECENT_OPENERS):
            theirs = opener(other)
            if not theirs:
                continue
            their_words = set(theirs.split())
            similar = len(mine_words) >= 4 and len(mine_words & their_words) / len(mine_words | their_words) >= 0.7
            if theirs == mine or similar:
                warnings.append(f"câu mở đầu {'trùng' if theirs == mine else 'gần giống'} video "
                                f"'{other.get('title', '?')}', viết câu mới")
                break
    banned = banned_phrases(project_dir.parent.parent)
    labels = verdict_labels(project_dir.parent.parent)

    sources = data.get("sources") or []
    source_ids = set()
    if not sources:
        errors.append("'sources' rỗng, mọi số liệu phải có nguồn")
    for i, s in enumerate(sources):
        sid = s.get("id")
        if not sid:
            errors.append(f"sources[{i}] thiếu 'id'")
        elif sid in source_ids:
            errors.append(f"trùng id nguồn '{sid}'")
        source_ids.add(sid)
        if not str(s.get("url", "")).startswith(("http://", "https://")):
            errors.append(f"nguồn {sid or i}: url không hợp lệ")
        if not s.get("published"):
            warnings.append(f"nguồn {sid or i}: thiếu ngày đăng 'published'")

    scenes = data.get("scenes") or []
    if not scenes:
        errors.append("'scenes' rỗng")
    rate = rate_factor((data.get("voice") or {}).get("rate", "+40%" if fmt == "vertical" else "+0%"))
    total = 0.0
    ranks = []
    verdict_count = 0
    loud_text_count = 0
    cover_seconds = 0.0
    slang_count = 0
    kieu_count: dict[str, int] = {}
    frame_hits = 0
    prev_item_kieu: set[str] = set()
    any_kieu = False
    plan_scenes: list[tuple[str, set[str]]] = []  # (tag, kiểu) của các mục, để kiểm cao trào ở mục cuối
    _t = data.get("target_seconds")
    _hi = _t[1] if isinstance(_t, list) and len(_t) == 2 else DEFAULT_TARGET_BY_TEMPLATE.get(template, (0, 60))[1]
    long_form = fmt == "vertical" and _hi > 60
    for idx, sc in enumerate(scenes):
        sid = sc.get("id")
        tag = f"cảnh {sid if sid is not None else idx + 1}"
        if sid != idx + 1:
            errors.append(f"{tag}: id phải là {idx + 1} (liên tục từ 1)")
        stype = sc.get("type")
        if stype not in SCENE_TYPES:
            errors.append(f"{tag}: type '{stype}' không hợp lệ")
        for key in ("narration", "on_screen_text", "visual_hint"):
            if not sc.get(key):
                errors.append(f"{tag}: thiếu '{key}'")

        narration = sc.get("narration") or ""
        sentences = [s for s in re.split(r"[.!?…]+", narration) if s.strip()]
        max_sent = LONG_MAX_SENTENCES if long_form and sc.get("type") not in ("intro",) else 3
        if long_form and idx == 0:
            max_sent = 4
        if len(sentences) > max_sent:
            errors.append(f"{tag}: lời đọc có {len(sentences)} câu, tối đa {max_sent}")
        seconds = len(narration.split()) / (WORDS_PER_SECOND * rate)
        total += seconds
        lo_s, hi_s = LONG_SCENE_SECONDS if long_form else SCENE_SECONDS.get(fmt, (4.0, 11.0))
        if narration and not lo_s <= seconds <= hi_s:
            warnings.append(f"{tag}: lời đọc ước tính {seconds:.1f}s, nên {lo_s:g}–{hi_s:g}s")
        if idx == 0 and seconds > (LONG_MAX_INTRO_SECONDS if long_form else MAX_INTRO_SECONDS.get(fmt, 15.0)):
            warnings.append(f"{tag}: cảnh mở đầu ~{seconds:.1f}s, quá dài cho hook")
        if idx == 0 and sentences and len(sentences[0].split()) > MAX_WORDS_HOOK:
            warnings.append(f"{tag}: câu hook có {len(sentences[0].split())} từ, nên ≤ {MAX_WORDS_HOOK}")
        for sen in sentences:
            if len(sen.split()) > MAX_WORDS_PER_SENTENCE:
                warnings.append(f"{tag}: câu quá dài ({len(sen.split())} từ): '{sen.strip()[:40]}…'")
        low = narration.lower()
        for phrase in FILLERS:
            if phrase in low:
                warnings.append(f"{tag}: có cụm thừa '{phrase}'")
        if fmt == "vertical":
            for word in PLATFORM_CTA:
                if re.search(rf"\b{re.escape(word)}\b", low):
                    warnings.append(f"{tag}: nhắc '{word}', dùng lời kêu gọi trung tính (ví dụ 'theo dõi') "
                                    f"vì một video đăng trên nhiều nền tảng")
        bad = [ch for ch in FORBIDDEN_NARRATION if ch in narration]
        if bad:
            errors.append(f"{tag}: lời đọc chứa ký tự không đọc được {bad}")
        if re.search(r"\d", narration):
            warnings.append(f"{tag}: lời đọc có chữ số, nên viết thành chữ cho TTS")

        ost = sc.get("on_screen_text") or ""
        if fmt in MAX_ON_SCREEN and len(ost) > MAX_ON_SCREEN[fmt]:
            warnings.append(f"{tag}: on_screen_text dài {len(ost)} ký tự, nên ≤ {MAX_ON_SCREEN[fmt]}")
        hits = len(LIMITED_SLANG.findall(narration))
        slang_count += hits
        if hits and idx == 0:
            warnings.append(f"{tag}: 'vãi' không dùng ở cảnh hook")
        if LIMITED_SLANG.search(ost):
            warnings.append(f"{tag}: 'vãi' không dùng trong chữ trên màn hình")
        for phrase in banned:
            if phrase in low or phrase in ost.lower():
                warnings.append(f"{tag}: có '{phrase}', nằm trong danh sách từ không dùng của hồ sơ kênh")

        app = sc.get("app")
        if sc.get("game") is not None:
            errors.append(f"{tag}: trường 'game' là của kênh game; kênh ứng dụng dùng 'app'")
        if stype in NEEDS_APP and not app:
            errors.append(f"{tag}: cảnh '{stype}' phải có 'app'")
        if app:
            if not app.get("name"):
                errors.append(f"{tag}: app thiếu 'name'")
            ios_id = app.get("app_store_id")
            if ios_id is not None and not isinstance(ios_id, int):
                errors.append(f"{tag}: app_store_id phải là số nguyên hoặc null")
            pkg = app.get("play_package")
            if pkg is not None and not (isinstance(pkg, str) and re.fullmatch(r"[A-Za-z][\w]*(\.[A-Za-z_][\w]*)+", pkg)):
                errors.append(f"{tag}: play_package phải là tên gói dạng com.hang.ungdung hoặc null")
            if app.get("platform") not in (None, "ios", "android", "both", "web"):
                errors.append(f"{tag}: app.platform phải là ios, android, both, web hoặc bỏ trống")
            if not app.get("app_store_id") and not app.get("play_package") and app.get("platform") != "web":
                warnings.append(f"{tag}: '{app.get('name')}' chưa có app_store_id hay play_package; "
                                f"bước tài nguyên sẽ tìm theo tên (dễ khớp nhầm ứng dụng cùng tên)")

        if template == "top-list" and stype == "item":
            if not isinstance(sc.get("rank"), int):
                errors.append(f"{tag}: cảnh item của top-list cần 'rank' là số nguyên")
            else:
                ranks.append(sc["rank"])
        if template == "tier-board" and stype == "item" and sc.get("tier") not in BOARD_TIERS:
            errors.append(f"{tag}: template tier-board cần 'tier' là một trong {sorted(BOARD_TIERS)}")
        if stype == "tier" and sc.get("tier") not in TIERS:
            errors.append(f"{tag}: 'tier' phải là một trong {sorted(TIERS)}")

        if not sc.get("role"):
            warnings.append(f"{tag}: chưa có 'role' (vai trò của cảnh trong câu chuyện)")
        norm_narr = re.sub(r"[^\w\s]", "", narration.lower())
        fact_values = {f.get("label"): str(f.get("value", "")) for f in sc.get("facts") or []}
        scene_kieu: set[str] = set()
        for si, shot in enumerate(sc.get("shots") or []):
            if not SHOW_PATTERN.match(str(shot.get("show", ""))):
                errors.append(f"{tag}: shot 'show' không hợp lệ: {shot.get('show')!r}")
            kieu = shot.get("kieu")
            if kieu:
                show = str(shot.get("show", ""))
                is_media = show == "header" or show.startswith("screenshot:")
                if kieu not in KIEU_MEDIA | KIEU_FACT:
                    errors.append(f"{tag}: kiểu hình {kieu!r} không hợp lệ, phải là một trong {sorted(KIEU_MEDIA | KIEU_FACT)}")
                elif kieu in KIEU_MEDIA and not is_media:
                    errors.append(f"{tag}: kiểu '{kieu}' chỉ dùng cho nhịp header/screenshot:N, không cho '{show}'")
                elif kieu in KIEU_FACT and not show.startswith("fact:"):
                    errors.append(f"{tag}: kiểu '{kieu}' chỉ dùng cho nhịp fact:<nhãn>, không cho '{show}'")
                else:
                    if si == 0 and kieu in {"dap-zoom", "dap-zoom-rung"}:
                        warnings.append(f"{tag}: '{kieu}' ở nhịp đầu cảnh không có thời gian dựng toàn cảnh; đặt ở nhịp có cue")
                    if kieu == "dem-so" and not re.search(r"\d", fact_values.get(show[5:], "")):
                        errors.append(f"{tag}: 'dem-so' cần thẻ '{show[5:]}' có con số trong value")
                    if kieu == "chia-o" and shot.get("anh") and not all(
                            re.match(r"^(header|screenshot:\d+)$", str(x)) for x in shot["anh"]):
                        errors.append(f"{tag}: 'chia-o' anh phải là header hoặc screenshot:N")
                    if stype in ("intro", "outro"):
                        warnings.append(f"{tag}: kiểu hình hiện chỉ dựng cho cảnh item/tier, cảnh '{stype}' sẽ bỏ qua")
                    group = KIEU_GROUP.get(kieu, kieu)
                    kieu_count[group] = kieu_count.get(group, 0) + 1
                    scene_kieu.add(group)
                    any_kieu = True
                    if kieu in {"dap-zoom-rung", "cat-nhay"}:
                        frame_hits += 1
                    if kieu in {"dap-zoom", "dap-zoom-rung"} and not shot.get("diem"):
                        warnings.append(f"{tag}: '{kieu}' chưa có 'diem' (tâm phóng); chốt theo ảnh thật ở DỪNG 2b")
                    cue_k = str(shot.get("cue") or "")
                    pos = narration.lower().find(cue_k.lower()) if cue_k else -1
                    if kieu == "lat-the" and pos >= 0 and "?" not in narration[max(0, pos - 80):pos]:
                        warnings.append(f"{tag}: 'lat-the' ở '{cue_k}' thiếu câu mồi: đặt một câu hỏi ngay trước "
                                        f"(\"Đoán xem…? … Năm.\"), không thì thẻ lật ra mà người xem không chờ gì")
            cue = shot.get("cue")
            if cue and re.sub(r"[^\w\s]", "", cue.lower()) not in norm_narr:
                warnings.append(f"{tag}: từ khoá shot '{cue}' không có trong lời đọc")
        for effect in sc.get("sfx") or []:
            cue = effect.get("cue")
            if cue and re.sub(r"[^\w\s]", "", cue.lower()) not in norm_narr:
                warnings.append(f"{tag}: từ khoá sfx '{cue}' không có trong lời đọc")
        gags = sc.get("gags") or []
        if long_form and stype in NEEDS_GAG and not gags:
            warnings.append(f"{tag}: chưa có 'gags' (nhịp cười bằng hình), bản đầy đủ cần ít nhất 1 mỗi mục")
        sticker_dir = project_dir.parent.parent / "templates" / "_shared" / "sticker"
        for gag in gags:
            kind = gag.get("kind")
            if kind not in GAG_KINDS:
                errors.append(f"{tag}: gag kind {kind!r} không hợp lệ, phải là một trong {sorted(GAG_KINDS)}")
            cue = gag.get("cue")
            if not cue:
                warnings.append(f"{tag}: gag '{kind}' thiếu 'cue' (từ punchline trong lời đọc)")
            elif re.sub(r"[^\w\s]", "", cue.lower()) not in norm_narr:
                warnings.append(f"{tag}: từ khoá gag '{cue}' không có trong lời đọc")
            if kind in COVER_GAG_SECONDS:
                cover_seconds += COVER_GAG_SECONDS[kind]
            if kind in LOUD_TEXT_GAGS:
                loud_text_count += 1
                gtext = gag.get("text") or ""
                gtext = " ".join(gtext) if isinstance(gtext, list) else str(gtext)
                gnorm = re.sub(r"[^\w\s]", "", gtext.lower()).strip()
                if len(gnorm.split()) > MAX_LOUD_TEXT_WORDS:
                    warnings.append(f"{tag}: gag '{kind}' «{gtext}» dài {len(gnorm.split())} chữ; chữ phủ khung "
                                    f"chỉ cho câu cụt 1–{MAX_LOUD_TEXT_WORDS} chữ, câu dài hơn dùng 'dau-chu'")
                elif len(gnorm.split()) >= 2 and gnorm in norm_narr:
                    warnings.append(f"{tag}: gag '{kind}' «{gtext}» nhắc lại lời đọc (phụ đề đã hiện); "
                                    f"đổi sang gag giữ hình ứng dụng (zoom-kich-tinh, sticker, dau-chu)")
            if kind == "dau-chu":
                # template (gags.js) chỉ dựng đẹp tối đa 4 chữ; 13/10/2026 ba gag 5 chữ bị cảnh báo lúc render
                dtext = gag.get("text") or ""
                dtext = " ".join(dtext) if isinstance(dtext, list) else str(dtext)
                dwords = [w for w in re.sub(r"[^\w\s]", " ", dtext).split() if w]
                if len(dwords) > 4:
                    warnings.append(f"{tag}: gag 'dau-chu' «{dtext}» dài {len(dwords)} chữ, tối đa 4 chữ")
            if kind == "rung":
                frame_hits += 1
            if kind in KIEU_MAX:
                kieu_count[kind] = kieu_count.get(kind, 0) + 1
                scene_kieu.add(kind)
                any_kieu = True
            if kind == "keo-so-sanh":
                anh = gag.get("anh") or []
                if len(anh) < 2 or not all(re.match(r"^(header|screenshot:\d+)$", str(x)) for x in anh[:2]) \
                        or anh[0] == anh[1]:
                    errors.append(f"{tag}: gag 'keo-so-sanh' cần 'anh' gồm hai nhịp ảnh khác nhau (header, screenshot:N)")
                if not (isinstance(gag.get("text"), list) and len(gag["text"]) >= 2):
                    warnings.append(f"{tag}: gag 'keo-so-sanh' nên có 'text' gồm hai nhãn, vd. [\"KỲ VỌNG\", \"THỰC TẾ\"]")
            if kind == "combo":
                so = gag.get("so", 3)
                if not isinstance(so, int) or not 2 <= so <= 9:
                    errors.append(f"{tag}: gag 'combo' cần 'so' là số nguyên 2–9")
                else:
                    word = str(gag.get("text") or "").lower().strip()
                    said = narration.lower().count(word) if word else 0
                    if word and said < so:
                        warnings.append(f"{tag}: gag 'combo' «{gag.get('text')}» x{so} nhưng lời đọc chỉ nói '{word}' "
                                        f"{said} lần; lặp đúng {so} lần để số đòn là câu đùa, không thành số liệu")
            if kind in GAG_NEEDS_ASSET:
                asset = gag.get("asset")
                if not asset:
                    errors.append(f"{tag}: gag '{kind}' cần 'asset' (tên hình trong templates/_shared/sticker/)")
                elif not list(sticker_dir.glob(f"**/{asset}.png")):
                    warnings.append(f"{tag}: chưa có hình '{asset}.png' trong templates/_shared/sticker/")
        if stype in NEEDS_GAG and long_form and template in KIEU_TEMPLATES:
            if not sc.get("hinh_chinh"):
                warnings.append(f"{tag}: chưa có 'hinh_chinh' (khoảnh khắc hình chính của mục, lên kế hoạch trước khi "
                                f"viết lời: references/ke-hoach-hinh.md)")
            if not scene_kieu:
                warnings.append(f"{tag}: mục chưa có kiểu hình nào (shots[].kieu, gag combo/keo-so-sanh); "
                                f"'hinh_chinh' phải là một kiểu thật")
            plan_scenes.append((tag, set(scene_kieu)))
        if stype in NEEDS_GAG:
            same = scene_kieu & prev_item_kieu
            if same:
                warnings.append(f"{tag}: dùng lại kiểu {sorted(same)} của mục liền trước; xen kẽ kiểu để mỗi mục một vẻ")
            prev_item_kieu = scene_kieu
        chuyen = sc.get("chuyen")
        if chuyen:
            if chuyen not in CHUYEN:
                errors.append(f"{tag}: chuyen {chuyen!r} không hợp lệ, phải là một trong {sorted(CHUYEN)}")
            elif idx == 0:
                warnings.append(f"{tag}: cảnh đầu không có cảnh trước để chuyển, bỏ 'chuyen'")
            elif template not in CHUYEN_TEMPLATES:
                warnings.append(f"{tag}: template '{template}' tự có cách chuyển mục, 'chuyen' sẽ bị bỏ qua")
        verdict = sc.get("verdict")
        if verdict is not None:
            verdict_count += 1
            if not isinstance(verdict, dict) or verdict.get("label") not in labels:
                errors.append(f"{tag}: verdict.label phải là một trong {sorted(labels)}")
            else:
                if not verdict.get("reason"):
                    warnings.append(f"{tag}: verdict thiếu 'reason' (lý do của phán quyết)")
                vcue = verdict.get("cue")
                if vcue and re.sub(r"[^\w\s]", "", vcue.lower()) not in norm_narr:
                    warnings.append(f"{tag}: từ khoá verdict '{vcue}' không có trong lời đọc")
        facts = sc.get("facts") or []
        if len(facts) > 3:
            warnings.append(f"{tag}: có {len(facts)} thẻ thông tin, nên tối đa 3")
        for f in facts:
            ids = f.get("source_ids") or []
            if not ids:
                errors.append(f"{tag}: số liệu '{f.get('label')}' không có source_ids")
            for x in ids:
                if x not in source_ids:
                    errors.append(f"{tag}: số liệu '{f.get('label')}' trỏ tới nguồn không tồn tại '{x}'")
        scene_sources = sc.get("source_ids") or []
        if stype in NEEDS_SOURCES and not scene_sources:
            errors.append(f"{tag}: cảnh '{stype}' cần 'source_ids'")
        for x in scene_sources:
            if x not in source_ids:
                errors.append(f"{tag}: source_ids trỏ tới nguồn không tồn tại '{x}'")

    if loud_text_count > MAX_LOUD_TEXT_GAGS:
        errors.append(f"{loud_text_count} gag chữ phủ khung (chu-to, dong-bang), tối đa {MAX_LOUD_TEXT_GAGS} mỗi video: "
                      f"chúng che hình ứng dụng; đổi bớt sang zoom-kich-tinh, sticker, dau-chu")
    if total and cover_seconds / total > MAX_COVER_RATIO:
        warnings.append(f"gag phủ khung chiếm ~{cover_seconds:.1f}s ({cover_seconds / total:.0%}) thời lượng, "
                        f"nên ≤ {MAX_COVER_RATIO:.0%}")
    for k, n in sorted(kieu_count.items()):
        if n > KIEU_MAX.get(k, 99):
            warnings.append(f"kiểu '{k}' dùng {n} lần, tối đa {KIEU_MAX[k]} mỗi video: dùng nhiều thì hết bất ngờ "
                            f"và trông như làm theo khuôn")
    if frame_hits > MAX_FRAME_HITS:
        warnings.append(f"{frame_hits} cú đập cả khung (dap-zoom-rung, cat-nhay, gag rung), tối đa {MAX_FRAME_HITS} mỗi video; "
                        f"còn lại chỉ động ở lớp phần tử (thẻ, chữ)")
    if long_form and template in KIEU_TEMPLATES:
        if not any_kieu:
            warnings.append("bản đầy đủ chưa dùng kiểu hình nào (shots[].kieu, gag combo/keo-so-sanh): các mục dễ giống "
                            "nhau; lên kế hoạch hình theo references/ke-hoach-hinh.md")
        elif len(kieu_count) < MIN_DISTINCT_KIEU:
            warnings.append(f"chỉ dùng {len(kieu_count)} kiểu hình khác nhau ({', '.join(sorted(kieu_count))}), bản đầy đủ "
                            f"nên ≥ {MIN_DISTINCT_KIEU} để mỗi mục một vẻ")
        if plan_scenes and template == "top-list" and not plan_scenes[-1][1]:
            warnings.append(f"{plan_scenes[-1][0]} (hạng 1) chưa có kiểu hình: hạng 1 là cao trào hình của video")
    if slang_count > MAX_LIMITED_SLANG:
        warnings.append(f"'vãi' xuất hiện {slang_count} lần, tối đa {MAX_LIMITED_SLANG} lần mỗi video")
    sfx_total = sum(len(sc.get("sfx") or []) for sc in scenes)
    if sfx_total > max(3, 4 * len(scenes)):  # bản đầy đủ: 2–4 hiệu ứng mỗi cảnh (SKILL.md)
        warnings.append(f"{sfx_total} hiệu ứng âm thanh là nhiều; mỗi hiệu ứng phải gắn với một sự kiện nhìn thấy")
    if scenes:
        if scenes[0].get("type") != "intro":
            warnings.append("cảnh đầu nên là 'intro'")
        if scenes[-1].get("type") != "outro":
            warnings.append("cảnh cuối nên là 'outro'")
    apps = {(sc.get("app") or {}).get("name") for sc in scenes if sc.get("app")}
    if verdict_count > 1:
        warnings.append(f"có {verdict_count} verdict; con dấu phán quyết chỉ xuất hiện một lần mỗi video")
    elif verdict_count == 0:
        if template in NEEDS_VERDICT:
            warnings.append("chưa có 'verdict' (con dấu phán quyết): top-list đặt ở hạng 1, tier-list ở ứng dụng hạng S")
        elif len(apps) == 1:
            warnings.append("video một ứng dụng cần 'verdict' ở cảnh cuối (con dấu phán quyết)")
    if ranks and ranks != sorted(ranks, reverse=True):
        warnings.append(f"thứ hạng không giảm dần: {ranks}")
    if len(ranks) != len(set(ranks)):
        errors.append(f"trùng thứ hạng: {ranks}")
    if fmt in TARGET_SECONDS:
        target = data.get("target_seconds")
        if isinstance(target, list) and len(target) == 2:
            lo, hi = target
        elif fmt == "vertical":
            lo, hi = DEFAULT_TARGET_BY_TEMPLATE.get(template, TARGET_SECONDS[fmt])
        else:
            lo, hi = TARGET_SECONDS[fmt]
        if not lo <= total <= hi:
            warnings.append(f"tổng độ dài ước tính {total:.0f}s, mục tiêu {lo}–{hi}s")
        if fmt == "vertical" and total > HARD_MAX_VERTICAL and hi <= HARD_MAX_VERTICAL:
            errors.append(f"video dọc ~{total:.0f}s vượt {HARD_MAX_VERTICAL}s; rút gọn, hoặc khai báo "
                          f"target_seconds nếu cố ý làm bản dài")
        if fmt == "vertical" and total > ABSOLUTE_MAX_VERTICAL:
            errors.append(f"video dọc ~{total:.0f}s vượt trần {ABSOLUTE_MAX_VERTICAL}s (5 phút); rút gọn")

    for e in errors:
        print(f"LỖI: {e}")
    for w in warnings:
        print(f"CẢNH BÁO: {w}")
    print(f"Tóm tắt: {len(scenes)} cảnh, ~{total:.0f}s, {len(sources)} nguồn, "
          f"{len(errors)} lỗi, {len(warnings)} cảnh báo.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
