#!/usr/bin/env python3
"""Kiểm tra bản quyền và tuân thủ của một dự án, sinh hồ sơ chứng minh <dự án>/ban-quyen.md.

Cách dùng: python3 kiem_tra_ban_quyen.py <thư mục dự án>

Kiểm tra theo .claude/rules/chinh-xac-va-ban-quyen.md:
- Clip: chỉ clip tự quay màn hình hoặc clip nhà phát triển cấp phép (có điều khoản); không dùng video xem trước của
  cửa hàng hay video của người khác. Clip có giọng bình luận phủ ≥ 70% thời gian.
- Tài nguyên hình: có nguồn, chủ sở hữu, căn cứ; press kit phải lưu điều khoản.
- Nhạc, sfx: có trong sổ giấy phép, cho phép thương mại, ghi công nếu bắt buộc.
- Font: có trong sổ giấy phép font.
- Giọng đọc: kênh kiếm tiền không dùng Edge TTS.
- Tài trợ: có câu công bố trong video và caption.
- Lời đọc, chữ, caption: từ khoá rủi ro (bẻ khoá, phim lậu, vay tiền nhanh, theo dõi lén, cá cược, "kênh chính thức"…).
- Nội dung không nguyên bản: lời đọc trùng quá 30% với video gần đây.
Thoát mã 1 nếu có mục CHẶN. Mục "Cần người xem" là việc máy không tự kiểm được.
"""
from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

VOICE_MIN_COVERAGE = 0.70
# Nguồn clip được phép: tự quay màn hình, hoặc nhà phát triển cho phép bằng văn bản (lưu điều khoản)
CLIP_ORIGINS = {"tu-quay", "giay-phep"}
OVERLAP_WARN = 0.30
FONT_EXT = {".ttf", ".otf", ".woff", ".woff2"}
DISCLOSURE_WORDS = ["tài trợ", "quảng cáo", "hợp tác", "được tặng", "tặng gói", "affiliate", "liên kết tiếp thị",
                    "mã giới thiệu", "link giới thiệu"]
RISK_PATTERNS = [
    (r"\b(crack|bẻ khoá|bẻ khóa|tải lậu|bản lậu|bản mod|apk mod|ipa mod|mở khoá premium|mở khóa premium)\b",
     "nhắc tới bẻ khoá/bản lậu: không cổ vũ dùng ứng dụng trả phí trái phép"),
    (r"(phim lậu|truyện lậu|nhạc lậu|xem phim miễn phí full)", "ứng dụng phát nội dung vi phạm bản quyền: không giới thiệu"),
    (r"\b(hack|cheat|aimlock|mod menu|auto click)\b", "công cụ gian lận: không giới thiệu, không hướng dẫn"),
    (r"(vay tiền nhanh|vay online|app vay|giải ngân trong)", "ứng dụng cho vay: chỉ nói về tổ chức có giấy phép, không kêu gọi vay"),
    (r"(kiếm tiền online|kiếm tiền tại nhà|đầu tư sinh lời|nhận thưởng mỗi ngày|làm nhiệm vụ nhận tiền)",
     "ứng dụng hứa kiếm tiền: dễ là lừa đảo hoặc đa cấp, cần nguồn chính thức"),
    (r"(theo dõi lén|đọc trộm|định vị người khác|xem tin nhắn của người khác|nghe lén)",
     "theo dõi người khác: xâm phạm quyền riêng tư, không giới thiệu"),
    (r"(vượt chặn|vượt tường lửa|lách luật|đổi vùng để)", "hướng dẫn vượt chặn: không hướng dẫn lách quy định"),
    (r"\b(cá cược|cá độ|nhà cái|casino|nổ hũ|đánh bạc)\b", "nội dung cờ bạc, cá cược"),
    (r"\b(leak|rò rỉ)\b", "tin rò rỉ: không dùng hình/video rò rỉ, lời đọc phải nói 'chưa xác nhận'"),
    (r"(tải ngay|link tải|download ngay)", "kêu gọi tải: chỉ với ứng dụng hợp pháp tại Việt Nam, không phải nội dung tài trợ chưa công bố"),
    (r"(kênh chính thức|đối tác chính thức|trang chính thức của)", "ngụ ý kênh là kênh chính thức/đối tác của nhà phát hành"),
    (r"(được .{0,20} tài trợ|hợp tác cùng|nhà tài trợ)", "nhắc tài trợ/hợp tác: phải khai báo 'sponsorship' và công bố rõ"),
    (r"(lừa đảo|ăn cắp|ăn trộm|bóc lột|scam)", "lời cáo buộc: phải có nguồn chính thức/báo uy tín và nói rõ ai cáo buộc"),
]


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def read_env(root: Path) -> dict:
    env = dict(os.environ)
    f = root / ".env"
    if f.exists():
        for line in f.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def parse_registry(path: Path) -> dict[str, dict]:
    """Đọc bảng markdown của sổ giấy phép, bỏ qua phần trong <!-- -->."""
    if not path.exists():
        return {}
    text = re.sub(r"<!--.*?-->", "", path.read_text(encoding="utf-8"), flags=re.S)
    rows = [l.strip() for l in text.splitlines() if l.strip().startswith("|")]
    if len(rows) < 2:
        return {}
    header = [c.strip().lower() for c in rows[0].strip("|").split("|")]
    out = {}
    for row in rows[2:]:
        cells = [c.strip() for c in row.strip("|").split("|")]
        if not cells or not cells[0]:
            continue
        rec = dict(zip(header, cells))
        out[cells[0]] = rec
    return out


def norm(text: str) -> str:
    return unicodedata.normalize("NFC", text.lower())


def trigrams(text: str) -> set[tuple[str, ...]]:
    words = re.sub(r"[^\w\s]", " ", norm(text)).split()
    return {tuple(words[i:i + 3]) for i in range(len(words) - 2)}


def merge(intervals: list[tuple[float, float]], gap: float = 0.05) -> list[tuple[float, float]]:
    out: list[list[float]] = []
    for a, b in sorted(intervals):
        if out and a - out[-1][1] <= gap:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return [(a, b) for a, b in out]


def overlap(a: tuple[float, float], spans: list[tuple[float, float]]) -> float:
    return sum(max(0.0, min(a[1], b) - max(a[0], s)) for s, b in spans)


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    project = Path(sys.argv[1]).resolve()
    root = project.parent.parent
    env = read_env(root)
    script = load_json(project / "script.json") or {}
    timeline = load_json(project / "timeline.json")
    manifest = load_json(project / "assets/manifest.json") or {"apps": {}, "scenes": {}}
    subs = load_json(project / "audio/subtitles.json") or {}
    seo_path = project / "out/seo.md"
    seo = seo_path.read_text(encoding="utf-8") if seo_path.exists() else None
    profile_path = root / "kenh/ho-so-kenh.md"
    profile = profile_path.read_text(encoding="utf-8") if profile_path.exists() else ""
    commercial = bool(re.search(r"Kênh có kiếm tiền[^:\n]*:\s*có", profile, re.I))

    block: list[str] = []
    warn: list[str] = []
    manual: list[str] = []
    if timeline is None:
        print("LỖI: chưa có timeline.json, chạy /long-tieng trước")
        return 1
    duration = float(timeline["duration"])

    # 1. Clip quay màn hình: nguồn hợp lệ, giọng bình luận phủ lên
    voice_spans = merge([(w["start"], w["end"]) for sc in timeline["scenes"] for w in sc["words"]], gap=0.35)
    clip_shots = []
    for sc in timeline["scenes"]:
        media = sc.get("media") or {}
        for shot in sc.get("shots") or []:
            if shot.get("show") == "clip" and media.get("clip"):
                clip_shots.append((sc["id"], float(shot["at"]), float(shot["end"])))
                origin = media.get("clip_origin")
                if origin not in CLIP_ORIGINS:
                    block.append(f"cảnh {sc['id']}: clip '{media.get('clip')}' có nguồn '{origin}', chỉ dùng clip tự quay "
                                 f"(tu-quay) hoặc clip nhà phát triển cho phép (giay-phep)")
    runs = merge([(a, b) for _, a, b in clip_shots])
    total_clip = sum(b - a for a, b in runs)
    for sid, a, b in clip_shots:
        if b - a > 0.3 and overlap((a, b), voice_spans) / (b - a) < VOICE_MIN_COVERAGE:
            warn.append(f"cảnh {sid}: đoạn clip {a:.1f}–{b:.1f}s ít giọng bình luận "
                        f"(phủ {overlap((a, b), voice_spans) / (b - a):.0%}, nên ≥ {VOICE_MIN_COVERAGE:.0%}): "
                        f"Meta coi việc chỉ chiếu lại màn hình là không nguyên bản")

    # 2. Tài nguyên hình
    used_apps: dict[str, dict] = {}
    for sc in timeline["scenes"]:
        key = (manifest.get("scenes") or {}).get(str(sc["id"]))
        if key and key in manifest.get("apps", {}):
            g = manifest["apps"][key]
            used_apps.setdefault(key, {"entry": g, "uses": []})
            used_apps[key]["uses"] += [f"{s['at']:.1f}–{s['end']:.1f}s {s['show']}" for s in sc.get("shots") or []
                                        if s.get("show") not in ("text", "logo") and not str(s.get("show")).startswith("fact:")]
    holders: set[str] = set()
    for key, info in used_apps.items():
        g = info["entry"]
        name = g.get("name", key)
        if g.get("origin") == "graphic-only" and not info["uses"]:
            continue  # cảnh chỉ dùng đồ hoạ tự làm, không có tài nguyên của bên thứ ba
        if not g.get("source"):
            block.append(f"{name}: tài nguyên không ghi nguồn")
        if "license" in g and "rights_holder" not in g:
            warn.append(f"{name}: manifest kiểu cũ (trường 'license' gây hiểu nhầm), chạy lại /lay-tai-nguyen")
        if not g.get("rights_holder"):
            warn.append(f"{name}: chưa ghi chủ sở hữu (rights_holder)")
        holders.update(g.get("rights_holder") or [])
        origin = g.get("origin", "app-store")
        if g.get("clip_origin") == "giay-phep" and not (project / "assets" / key / "dieu-khoan.txt").exists():
            block.append(f"{name}: clip của nhà phát triển nhưng chưa lưu thư cho phép vào assets/{key}/dieu-khoan.txt")
        if origin == "press-kit" and not (project / "assets" / key / "dieu-khoan.txt").exists():
            block.append(f"{name}: dùng press kit nhưng chưa lưu điều khoản vào assets/{key}/dieu-khoan.txt")
        if origin in ("app-store", "google-play"):
            manual.append(f"{name}: ảnh cửa hàng ({origin}): xem không có huy hiệu App Store/Google Play, "
                          f"chữ quảng cáo nói quá, người thật; căn cứ trích dẫn, rủi ro điều khoản Apple/Google đã chấp nhận")
        if g.get("mature") or int(g.get("required_age") or 0) >= 17:
            manual.append(f"{name}: ứng dụng xếp tuổi cao ({', '.join(g.get('mature') or []) or '17+'}); "
                          f"xem ảnh bìa, hook, clip không có nội dung người lớn, hẹn hò, cờ bạc")
        genre = ((g.get("store") or {}).get("app_store_vn") or {}).get("genre") \
            or ((g.get("store") or {}).get("google_play") or {}).get("genre")
        if genre in ("Finance", "Tài chính"):
            manual.append(f"{name}: ứng dụng tài chính: xác minh đơn vị có giấy phép tại Việt Nam (ngân hàng, ví điện tử, "
                          f"chứng khoán) trước khi khen; không kêu gọi vay, đầu tư")

    # Hướng dẫn thương hiệu của nhà phát triển (dùng tên, logo, ảnh giao diện)
    policy_path = root / "kenh/chinh-sach-nha-phat-trien.md"
    policy = norm(policy_path.read_text(encoding="utf-8")) if policy_path.exists() else ""
    for h in sorted(holders):
        if norm(h) not in policy:
            manual.append(f"chưa tra hướng dẫn thương hiệu/press kit của '{h}', ghi vào kenh/chinh-sach-nha-phat-trien.md")
    if seo is not None and holders:
        missing = [h for h in holders if norm(h) not in norm(seo)]
        if missing:
            warn.append(f"mô tả chưa ghi tên chủ sở hữu hình ảnh: {', '.join(missing)}")

    # 3. Nhạc và sfx
    def check_audio(kind: str, src: str, registry: dict[str, dict]) -> dict | None:
        fname = Path(src).name
        rec = registry.get(fname)
        if not rec:
            block.append(f"{kind} '{fname}' không có trong sổ giấy phép")
            return None
        if norm(rec.get("thương mại", "")) != "có":
            block.append(f"{kind} '{fname}': sổ giấy phép ghi không được dùng thương mại")
        credit = rec.get("ghi công bắt buộc", "").strip()
        if credit and norm(credit) not in ("không", "khong", "-") and seo is not None \
                and norm(credit.strip('"')) not in norm(seo):
            block.append(f"{kind} '{fname}' yêu cầu ghi công {credit} nhưng mô tả chưa có")
        return rec

    music_reg = parse_registry(root / "music/GIAY-PHEP.md")
    sfx_reg = parse_registry(root / "sfx/GIAY-PHEP.md")
    music = timeline.get("music")
    music_rec = check_audio("nhạc", music["src"], music_reg) if music else None
    sfx_recs = {}
    for fx in timeline.get("sfx") or []:
        name = Path(fx["src"]).name
        if name not in sfx_recs:
            sfx_recs[name] = check_audio("sfx", fx["src"], sfx_reg)

    # 4. Font
    font_dir = root / "templates/_shared/fonts"
    font_reg = parse_registry(font_dir / "GIAY-PHEP.md")
    fonts = [p.name for p in font_dir.glob("*") if p.suffix.lower() in FONT_EXT] if font_dir.exists() else []
    for f in fonts:
        if f not in font_reg:
            block.append(f"font '{f}' chưa có trong templates/_shared/fonts/GIAY-PHEP.md")
    if not fonts:
        manual.append("chưa có file font trong templates/_shared/fonts/: kiểm tra template không tải font từ nguồn chưa rõ giấy phép")

    # 5. Giọng đọc
    provider = subs.get("provider", "edge")
    if provider == "edge":
        (block if commercial else warn).append(
            "giọng đọc dùng Edge TTS (dịch vụ không chính thức); kênh kiếm tiền phải dùng Azure: "
            "tts_edge.py --provider azure")
    elif provider != "azure":
        # Dịch vụ ngoài (Vbee, FPT.AI, ElevenLabs) nhập bằng nhap_audio_ngoai.py: bản miễn phí thường chỉ cho dùng
        # cá nhân, nên kênh kiếm tiền phải có bằng chứng gói trả phí trong kenh/bang-chung/ (tên file chứa tên dịch vụ)
        proof_dir = root / "kenh/bang-chung"
        proof = [p for p in proof_dir.glob("*") if provider.lower() in p.name.lower()] if proof_dir.exists() else []
        if not proof:
            (block if commercial else warn).append(
                f"giọng đọc từ {provider}: chưa có bằng chứng gói trả phí (quyền thương mại) trong kenh/bang-chung/; "
                "bản miễn phí chỉ dùng làm nháp, video này không bật kiếm tiền")

    # 6. Tài trợ
    sponsor = script.get("sponsorship")
    if sponsor:
        first = script["scenes"][0] if script.get("scenes") else {}
        head = norm(first.get("on_screen_text", "") + " " + first.get("narration", ""))
        if not any(w in head for w in DISCLOSURE_WORDS):
            block.append("có tài trợ/quà tặng nhưng cảnh đầu chưa có câu công bố (Luật Quảng cáo sửa đổi 2025)")
        if seo is not None and not any(w in norm(seo) for w in DISCLOSURE_WORDS):
            block.append("có tài trợ/quà tặng nhưng caption/mô tả chưa công bố")
        manual.append("bật 'Paid promotion' (YouTube), 'Branded content' (TikTok), 'Paid partnership' (Facebook, Instagram)")

    # 7. Từ khoá rủi ro
    texts = [(f"cảnh {sc['id']}", sc.get("narration", "") + " " + sc.get("on_screen_text", ""))
             for sc in script.get("scenes", [])]
    if seo is not None:
        texts.append(("seo.md", seo))
    for where, text in texts:
        low = norm(text)
        for pattern, why in RISK_PATTERNS:
            m = re.search(pattern, low)
            if m and not (sponsor and pattern.startswith("(được")):
                warn.append(f"{where}: '{m.group(0)}' – {why}")

    # 8. Nội dung không nguyên bản: so với các dự án khác
    mine_text = " ".join(sc.get("narration", "") for sc in script.get("scenes", []))
    mine = trigrams(mine_text)
    others = sorted(p for p in (project.parent).glob("*/script.json") if p.parent != project and not p.parent.name.startswith("_mau"))[-10:]
    for p in others:
        other = load_json(p) or {}
        theirs = trigrams(" ".join(sc.get("narration", "") for sc in other.get("scenes", [])))
        if mine and theirs:
            ratio = len(mine & theirs) / len(mine)
            if ratio > OVERLAP_WARN:
                warn.append(f"lời đọc trùng {ratio:.0%} với {p.parent.name} (nguy cơ 'nội dung không nguyên bản' của YouTube)")

    # 9. Việc máy không tự kiểm được
    manual += [
        "xem từng khung có bản đồ: không có 'đường lưỡi bò' hay bản đồ sai chủ quyền Việt Nam",
        "không có hình/video rò rỉ, ảnh fan art, ảnh có watermark của báo hoặc kênh khác",
        "clip, ảnh tự quay: đã che số điện thoại, email, tên tài khoản, thông báo, số dư, vị trí, danh bạ, "
        "tin nhắn của mình và của người khác",
        "không khen tính năng chưa tự dùng thử; tính năng trả phí nói rõ là trả phí",
        "nhãn AI theo hồ sơ kênh: TikTok bật 'Nội dung do AI tạo' (giọng TTS); caption mọi nền tảng có dòng "
        "'Giọng đọc: AI'; bật nhãn AI trên mọi nền tảng nếu có hình/giọng mô phỏng người thật hoặc cảnh AI "
        "tái hiện sự kiện có thật (NĐ 142/2026). YouTube: chọn 'Không dành cho trẻ em'",
        "TikTok tài khoản doanh nghiệp hoặc video có tài trợ: chỉ thêm nhạc từ Commercial Music Library",
    ]

    # Hồ sơ chứng minh
    lines = [f"# Hồ sơ bản quyền: {script.get('title', project.name)}",
             f"Ngày kiểm: {date.today().isoformat()} · Thời lượng: {duration:.1f}s · "
             f"Clip quay màn hình: {total_clip:.1f}s ({(total_clip / duration if duration else 0):.0%})",
             "", f"## Kết luận: {'CHẶN, chưa được đăng' if block else 'ĐẠT phần kiểm tự động'}", ""]
    for title, items in (("Chặn", block), ("Cảnh báo", warn), ("Cần người xem", manual)):
        lines.append(f"## {title}")
        lines += [f"- [ ] {i}" if title == "Cần người xem" else f"- {i}" for i in items] or ["- không có"]
        lines.append("")
    lines += ["## Hình ảnh, video", "| Ứng dụng | Nguồn | Chủ sở hữu | Căn cứ | Clip | Dùng lúc |",
              "|---|---|---|---|---|---|"]
    for key, info in used_apps.items():
        g = info["entry"]
        lines.append(f"| {g.get('name', key)} | {g.get('source', '?')} | {', '.join(g.get('rights_holder') or []) or '?'} "
                     f"| {g.get('basis', '?')} | {g.get('clip_origin') or '-'} | {'; '.join(info['uses']) or '-'} |")
    lines += ["", "## Âm thanh", f"- Giọng đọc: {provider}, giọng {subs.get('voice', '?')}"]
    if music:
        lines.append(f"- Nhạc: {Path(music['src']).name} · {json.dumps(music_rec, ensure_ascii=False) if music_rec else 'KHÔNG CÓ TRONG SỔ'}")
    for name, rec in sfx_recs.items():
        lines.append(f"- Sfx: {name} · {json.dumps(rec, ensure_ascii=False) if rec else 'KHÔNG CÓ TRONG SỔ'}")
    lines += ["", "## Font", *(f"- {f}: {font_reg.get(f, {}).get('giấy phép', 'KHÔNG CÓ TRONG SỔ')}" for f in fonts)]
    if sponsor:
        lines += ["", "## Tài trợ", f"- {json.dumps(sponsor, ensure_ascii=False)}"]
    (project / "ban-quyen.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    for i in block:
        print(f"CHẶN: {i}")
    for i in warn:
        print(f"CẢNH BÁO: {i}")
    print(f"Cần người xem: {len(manual)} mục (xem ban-quyen.md)")
    print(f"Xong: {len(block)} chặn, {len(warn)} cảnh báo → {project / 'ban-quyen.md'}")
    return 1 if block else 0


if __name__ == "__main__":
    sys.exit(main())
