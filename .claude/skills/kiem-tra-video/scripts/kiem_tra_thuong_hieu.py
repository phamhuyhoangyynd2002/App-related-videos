#!/usr/bin/env python3
"""Kiểm tra nhận diện thương hiệu của một dự án đã có timeline.json (bước 6 của /tao-video).

Cách dùng: python3 kiem_tra_thuong_hieu.py <thư mục dự án>

Đối chiếu với kenh/ho-so-kenh.md và .claude/rules/phong-cach-thuong-hieu.md:
- Giọng đọc trong audio/subtitles.json đúng giọng duy nhất của hệ thống (khác giọng là CHẶN).
- Con dấu phán quyết: đúng một `verdict`, nhãn hợp lệ.
- Chữ ký âm thanh: đúng một lần, cùng lúc con dấu (lệch ≤ 0,3 giây), không ở giây đầu.
- Lời đọc, chữ trên màn hình, caption không dùng từ trong danh sách "không dùng".
- out/seo.md có đủ các nền tảng chính trong hồ sơ kênh và dòng "Giọng đọc: AI".
In ra CHẶN / CẢNH BÁO; thoát mã 1 nếu có mục CHẶN.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

# Nhãn con dấu: đọc từ dòng "Nhãn con dấu" của kenh/ho-so-kenh.md, chưa khai báo thì dùng bộ mặc định
DEFAULT_VERDICT_LABELS = {"CÀI NGAY", "DÙNG THỬ", "CHỜ GIẢM GIÁ", "BỎ QUA"}
NEEDS_VERDICT = {"top-list", "tier-list", "tier-board"}
PLATFORMS = ["TikTok", "YouTube Shorts", "Facebook Reels", "Instagram Reels"]
SYNC_TOLERANCE = 0.3   # giây, chữ ký âm thanh phải khớp con dấu
EARLIEST_SIGNATURE = 1.0  # giây, không phát chữ ký âm thanh ở giây đầu


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def norm(text: str) -> str:
    return unicodedata.normalize("NFC", text).lower()


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    project = Path(sys.argv[1]).resolve()
    root = project.parent.parent
    profile_path = root / "kenh/ho-so-kenh.md"
    profile = profile_path.read_text(encoding="utf-8") if profile_path.exists() else ""
    script = load_json(project / "script.json") or {}
    subs = load_json(project / "audio/subtitles.json") or {}
    timeline = load_json(project / "timeline.json")
    seo_path = project / "out/seo.md"
    seo = seo_path.read_text(encoding="utf-8") if seo_path.exists() else None
    if timeline is None:
        print("LỖI: chưa có timeline.json, chạy /long-tieng trước")
        return 1

    block: list[str] = []
    warn: list[str] = []
    lm = re.search(r"Nhãn con dấu:(.*)", profile)
    VERDICT_LABELS = ({x.strip().upper() for x in re.findall(r'"([^"]+)"', lm.group(1))} if lm else set()) \
        or DEFAULT_VERDICT_LABELS

    # 1. Một giọng cho toàn hệ thống
    m = re.search(r"Giọng đọc:\s*([A-Za-z]{2}-[A-Za-z]{2}-\w+Neural)[^\n]*?tốc độ\s*([+-]\d+%)", profile)
    if not m:
        warn.append("hồ sơ kênh chưa ghi giọng đọc dạng 'Giọng đọc: <giọng>, tốc độ <±N%>'")
    else:
        voice, rate = m.group(1), m.group(2)
        if subs.get("voice") and subs["voice"] != voice:
            block.append(f"giọng đọc '{subs['voice']}' khác giọng của hệ thống '{voice}' (hồ sơ kênh)")
        if timeline.get("format") == "vertical" and subs.get("rate") and subs["rate"] != rate:
            warn.append(f"tốc độ đọc {subs['rate']} khác tốc độ của hệ thống {rate}")

    # 2. Con dấu phán quyết
    verdict_scenes = [sc for sc in script.get("scenes", []) if sc.get("verdict") is not None]
    for sc in verdict_scenes:
        label = (sc["verdict"] or {}).get("label") if isinstance(sc["verdict"], dict) else None
        if label not in VERDICT_LABELS:
            block.append(f"cảnh {sc.get('id')}: nhãn con dấu '{label}' không hợp lệ, "
                         f"chỉ dùng {sorted(VERDICT_LABELS)}")
    apps = {(sc.get("app") or {}).get("name") for sc in script.get("scenes", []) if sc.get("app")}
    if len(verdict_scenes) > 1:
        warn.append(f"có {len(verdict_scenes)} con dấu phán quyết, chỉ được một lần mỗi video")
    elif not verdict_scenes and (script.get("template") in NEEDS_VERDICT or len(apps) == 1):
        warn.append("chưa có con dấu phán quyết (verdict): top-list ở hạng 1, tier-list ở hạng S, "
                    "video một ứng dụng ở cảnh cuối")

    # 3. Chữ ký âm thanh đi cùng con dấu
    sm = re.search(r"Chữ ký âm thanh:\s*`?sfx/([\w-]+)", profile)
    signature = sm.group(1) if sm else "chu-ky"
    stamps = [sc["verdict"]["at"] for sc in timeline.get("scenes", []) if isinstance(sc.get("verdict"), dict)]
    marks = [float(fx["at"]) for fx in timeline.get("sfx") or [] if Path(fx["src"]).stem == signature]
    has_file = any((root / "sfx").glob(f"{signature}.*"))
    if stamps and not has_file:
        warn.append(f"chưa có file sfx/{signature}.* (chữ ký âm thanh), con dấu đang không có tiếng")
    elif stamps and len(marks) != 1:
        warn.append(f"chữ ký âm thanh phát {len(marks)} lần, phải đúng 1 lần cùng con dấu "
                    f"(chạy lại build_timeline.py)")
    elif stamps and marks and abs(marks[0] - stamps[0]) > SYNC_TOLERANCE:
        warn.append(f"chữ ký âm thanh ở {marks[0]:.2f}s lệch con dấu ở {stamps[0]:.2f}s")
    if marks and not stamps:
        warn.append("có chữ ký âm thanh nhưng không có con dấu phán quyết")
    for at in marks:
        if at < EARLIEST_SIGNATURE:
            warn.append(f"chữ ký âm thanh ở {at:.2f}s, không được phát ở giây đầu")

    # 4. Từ không dùng
    bm = re.search(r"Từ, cụm từ không dùng:(.*)", profile)
    banned = [p.strip().lower() for p in re.findall(r'"([^"]+)"', bm.group(1))] if bm else []
    texts = [(f"cảnh {sc.get('id')}", sc.get("narration", "") + " " + sc.get("on_screen_text", ""))
             for sc in script.get("scenes", [])]
    if seo is not None:
        texts.append(("out/seo.md", seo))
    for where, text in texts:
        low = norm(text)
        for phrase in banned:
            if norm(phrase) in low:
                warn.append(f"{where}: có '{phrase}' (từ không dùng của hồ sơ kênh)")

    # 5. Bài đăng: đủ nền tảng chính, minh bạch giọng AI
    pm = re.search(r"Nền tảng:(.*)", profile)
    primary_text = pm.group(1).split("(chính)")[0] if pm else "TikTok, YouTube Shorts"
    primary = [p for p in PLATFORMS if p in primary_text]
    if seo is None:
        warn.append("chưa có out/seo.md để kiểm tra bài đăng (chạy /seo-dang-bai)")
    else:
        headings = [h.strip().lower() for h in re.findall(r"^##\s+(.+)$", seo, re.M)]
        for p in primary:
            if not any(h.startswith(p.lower()) for h in headings):
                warn.append(f"out/seo.md thiếu mục '## {p}'")
        if not re.search(r"giọng đọc\s*:\s*ai", norm(seo)):
            warn.append("out/seo.md chưa có dòng 'Giọng đọc: AI' (chính sách minh bạch của kênh)")

    for i in block:
        print(f"CHẶN: {i}")
    for i in warn:
        print(f"CẢNH BÁO: {i}")
    print(f"Xong: {len(block)} chặn, {len(warn)} cảnh báo (nhận diện thương hiệu)")
    return 1 if block else 0


if __name__ == "__main__":
    sys.exit(main())
