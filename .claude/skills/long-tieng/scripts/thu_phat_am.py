#!/usr/bin/env python3
"""Chọn cách viết phiên âm cho tên ứng dụng sao cho giọng TTS tiếng Việt đọc gần tên gốc nhất, rồi lưu vào
từ điển phát âm của kênh (kenh/phat-am.json). tts_edge.py tự dùng từ điển này cho mọi video sau.

Vì sao (13/10/2026): phiên âm trước đây do người viết kịch bản tự nghĩ ("pắc poin", "xét tồ ắp"), không ai kiểm,
người làm video nghe thấy đọc tên ứng dụng không chuẩn. Công cụ này chấm khách quan: cho giọng của kênh đọc từng
ứng viên (kể cả để nguyên tên gốc), nhận dạng lại bằng faster-whisper với ngôn ngữ TIẾNG ANH, so chữ nghe được với
tên gốc. Ứng viên nào được "nghe" ra gần tên gốc nhất thì thắng.

  python3 .claude/skills/long-tieng/scripts/thu_phat_am.py "Settle Up" "xét-tồ ắp" "sét tồ ắp" "xe tồ ắp"
  python3 .claude/skills/long-tieng/scripts/thu_phat_am.py "Wanderlog" "oan đơ lóc" "quan đơ lóc" --ghi
  python3 .claude/skills/long-tieng/scripts/thu_phat_am.py --xem

Luôn thử thêm chính tên gốc. Mặc định giọng, tốc độ lấy từ kenh/ho-so-kenh.md (dòng "Giọng đọc"). --ghi lưu ứng
viên thắng vào từ điển (không ghi đè mục có "khoa": true, tức người làm video đã chốt bằng tai).
Điểm chỉ là gợi ý: tên trùng từ tiếng Việt, tên viết tắt nên nghe lại bằng tai trước khi --ghi.
Cần: pip install edge-tts faster-whisper.
"""
from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import difflib
import json
import re
import sys
import tempfile
import time
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts_edge  # noqa: E402

ROOT = Path(__file__).resolve().parents[4]
DICT_PATH = ROOT / "kenh" / "phat-am.json"


def ascii_letters(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower()).replace("đ", "d")
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if not unicodedata.combining(c)))


def channel_voice() -> tuple[str, str]:
    text = (ROOT / "kenh" / "ho-so-kenh.md").read_text(encoding="utf-8")
    m = re.search(r"Giọng đọc:\s*(vi-VN-\w+Neural),\s*tốc độ\s*([+-]\d+%)", text)
    return (m.group(1), m.group(2)) if m else ("vi-VN-NamMinhNeural", "+40%")


def load_dict() -> dict:
    return json.loads(DICT_PATH.read_text(encoding="utf-8")) if DICT_PATH.exists() else {}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ten", nargs="?", help="tên ứng dụng đúng như trên cửa hàng")
    ap.add_argument("ung_vien", nargs="*", help="các cách viết phiên âm muốn thử")
    ap.add_argument("--voice")
    ap.add_argument("--rate")
    ap.add_argument("--model", default="small")
    ap.add_argument("--lan", type=int, default=2, help="số lượt tạo giọng + nhận dạng cho mỗi ứng viên (lấy trung bình)")
    ap.add_argument("--ghi", action="store_true", help="lưu ứng viên thắng vào kenh/phat-am.json")
    ap.add_argument("--xem", action="store_true", help="in từ điển hiện có")
    a = ap.parse_args()
    if a.xem:
        for k, v in load_dict().items():
            print(f"{k}: {v.get('phien_am')}  (điểm {v.get('diem')}, {'đã chốt bằng tai' if v.get('khoa') else v.get('ngay')})")
        return 0
    if not a.ten:
        ap.error("cần tên ứng dụng")
    voice, rate = channel_voice()
    voice, rate = a.voice or voice, a.rate or rate
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("LỖI: chưa cài faster-whisper (pip install faster-whisper)")
        return 1
    model = WhisperModel(a.model, compute_type="int8")
    target = ascii_letters(a.ten)
    cands = [a.ten] + [c for c in a.ung_vien if c != a.ten]
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, c in enumerate(cands):
            scores, heards = [], []
            for lan in range(a.lan):
                dest = Path(tmp) / f"c{i}-{lan}.mp3"
                try:
                    # đọc 3 lần: một từ đứng riêng quá ngắn, Whisper nghe thất thường
                    asyncio.run(tts_edge.synth(f"{c}. {c}. {c}.", voice, rate, dest, "edge"))
                except Exception as e:  # noqa: BLE001 – Edge hay từ chối khi gọi liên tục: bỏ lượt này
                    print(f"  bỏ qua {c!r} lượt {lan + 1}: {type(e).__name__}")
                    continue
                finally:
                    time.sleep(1.0)
                segs, _ = model.transcribe(str(dest), language="en", beam_size=5)
                heard = " ".join(s.text.strip() for s in segs).strip()
                # Whisper có lúc gộp 3 lần đọc thành 1: so với tên lặp 1–3 lần, lấy điểm cao nhất
                letters = ascii_letters(heard)
                scores.append(max(difflib.SequenceMatcher(None, letters, target * k).ratio() for k in (1, 2, 3)))
                heards.append(heard)
            if scores:
                results.append((round(sum(scores) / len(scores), 2), c, " | ".join(heards)))
    if not results:
        print("LỖI: không ứng viên nào tạo được giọng")
        return 1
    # bằng điểm thì ưu tiên tên gốc: kịch bản khỏi cần phiên âm, phụ đề và lời đọc trùng nhau
    results.sort(key=lambda r: (-r[0], r[1] != a.ten))
    print(f"{a.ten} · giọng {voice} {rate} · nghe bằng tiếng Anh:")
    for score, c, heard in results:
        print(f"  {score:.2f}  {c!r:28} → nghe thành {heard!r}")
    best = results[0]
    if a.ghi:
        d = load_dict()
        if d.get(a.ten, {}).get("khoa"):
            print(f"Không ghi: '{a.ten}' đã được chốt bằng tai ({d[a.ten]['phien_am']}).")
            return 0
        d[a.ten] = {"phien_am": best[1], "diem": best[0], "giong": f"{voice} {rate}",
                    "ngay": dt.date.today().isoformat(),
                    "ung_vien": {c: s for s, c, _ in results}}
        DICT_PATH.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"Đã ghi {a.ten} → {best[1]!r} vào {DICT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
