#!/usr/bin/env python3
"""Tạo giọng đọc tiếng Việt cho từng cảnh, kèm mốc thời gian từng từ.

Cách dùng:
  python3 tts_edge.py <thư mục dự án> [--provider azure|edge] [--voice vi-VN-NamMinhNeural] [--rate +40%] [--only 2,5]

Dịch vụ:
- azure (mặc định khi có AZURE_SPEECH_KEY và AZURE_SPEECH_REGION): Azure AI Speech, dịch vụ chính thức,
  được phép dùng thương mại theo gói Azure (gói F0 miễn phí 500.000 ký tự/tháng). Cần: pip install azure-cognitiveservices-speech
- edge: Edge TTS, dịch vụ không chính thức của trình duyệt Edge. Microsoft khuyến cáo dùng thương mại mà không có
  gói Azure có thể vi phạm điều khoản, nên chỉ dùng để làm nháp. Cần: pip install edge-tts
Dịch vụ đã dùng được ghi vào audio/subtitles.json ("provider") để kiem_tra_ban_quyen.py kiểm tra.
Ghi ra: audio/scene-<id>.mp3 và audio/subtitles.json (mốc thời gian tính từ đầu mỗi cảnh, đơn vị giây).
Tên ứng dụng có trong kenh/phat-am.json (thu_phat_am.py) tự đọc theo phiên âm đã chấm; "pronunciation" của cảnh ghi đè.
TTS đọc theo phiên âm nhưng phụ đề vẫn hiện tên gốc.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import sys
import os
from pathlib import Path
from xml.sax.saxutils import escape

try:
    import edge_tts
except ImportError:
    edge_tts = None

TICKS = 10_000_000  # Edge TTS trả offset theo đơn vị 100 ns


def bare(token: str) -> str:
    return re.sub(r"[^\w]", "", token.lower())


def parse_pronunciation(app_name: str | None, pronunciation: str | None) -> list[tuple[str, str]]:
    """Một chuỗi phiên âm cho tên ứng dụng, hoặc nhiều tên dạng "Tên A: phiên âm; Tên B: phiên âm".

    Lỗi 06/10/2026: kịch bản ghi dạng nhiều tên, script cũ đọc nguyên chuỗi đó thay cho tên.
    """
    if not pronunciation:
        return []
    if ":" in pronunciation:
        pairs = []
        for part in pronunciation.split(";"):
            name, sep, pron = part.rpartition(":")  # tên ứng dụng có thể chứa ":" (Notion: Notes, Docs, Tasks)
            if not sep or not name.strip() or not pron.strip():
                sys.exit(f"LỖI: pronunciation '{pronunciation}' sai dạng, cần 'Tên: phiên âm; Tên: phiên âm'")
            pairs.append((name.strip(), pron.strip()))
        # tên dài trước, để "Hungry Shark Evolution" không bị "Hungry Shark" ăn mất
        return sorted(pairs, key=lambda p: -len(p[0].split()))
    return [(app_name, pronunciation)] if app_name else []


DICT_PATH = Path(__file__).resolve().parents[4] / "kenh" / "phat-am.json"


def dictionary_pairs(narration: str, skip: set[str]) -> list[tuple[str, str]]:
    """Tên ứng dụng có trong từ điển phát âm của kênh (kenh/phat-am.json, tạo bằng thu_phat_am.py) và xuất hiện
    trong lời đọc. Từ 13/10/2026 đây là nguồn phiên âm mặc định; `pronunciation` của cảnh chỉ để ghi đè."""
    if not DICT_PATH.exists():
        return []
    d = json.loads(DICT_PATH.read_text(encoding="utf-8"))
    words = [bare(t) for t in narration.split()]
    out = []
    for name, entry in d.items():
        toks = [bare(t) for t in name.split()]
        pron = entry.get("phien_am")
        if not pron or pron == name or name in skip:
            continue
        if any(words[i:i + len(toks)] == toks for i in range(len(words))):
            out.append((name, pron))
    return out


def build_groups(narration: str, app_name: str | None, pronunciation: str | None):
    """Trả về (văn bản gửi TTS, [(từ hiển thị, số từ TTS tương ứng)]).

    Dấu câu đứng riêng (vd "nhóm? … Trả") không có mốc từ của TTS: gộp vào từ hiển thị trước nó với 0 từ TTS.
    Trước 13/10/2026 nó được tính là 1 từ, làm lệch số từ, cảnh rơi về tts-raw (phụ đề hiện phiên âm, mất dấu câu).
    """
    orig = narration.split()
    pairs = parse_pronunciation(app_name, pronunciation)
    pairs += dictionary_pairs(narration, {n for n, _ in pairs})
    pairs.sort(key=lambda p: -len(p[0].split()))  # tên dài trước
    rules = [([bare(t) for t in name.split()], pron.split()) for name, pron in pairs]
    tts_tokens, groups, i = [], [], 0
    while i < len(orig):
        if not bare(orig[i]):
            tts_tokens.append(orig[i])
            if groups:
                shown, n = groups[-1]
                groups[-1] = (shown + " " + orig[i], n)
            else:
                groups.append((orig[i], 0))
            i += 1
            continue
        for name_toks, pron_toks in rules:
            window = [bare(t) for t in orig[i:i + len(name_toks)]]
            if window == name_toks:
                shown = " ".join(orig[i:i + len(name_toks)])
                tail = re.sub(r"^.*?([^\w]*)$", r"\1", orig[i + len(name_toks) - 1])
                tts_tokens += pron_toks[:-1] + [pron_toks[-1] + tail]
                groups.append((shown, len(pron_toks)))
                i += len(name_toks)
                break
        else:
            tts_tokens.append(orig[i])
            groups.append((orig[i], 1))
            i += 1
    return " ".join(tts_tokens), groups


def audio_duration(path: Path) -> float | None:
    if not shutil.which("ffprobe"):
        return None
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return None


def synth_azure(text: str, voice: str, rate: str, dest: Path, pitch: str = "+0Hz") -> list[dict]:
    """Azure AI Speech: lấy mốc từng từ qua sự kiện word boundary."""
    import azure.cognitiveservices.speech as speechsdk
    cfg = speechsdk.SpeechConfig(subscription=os.environ["AZURE_SPEECH_KEY"],
                                 region=os.environ["AZURE_SPEECH_REGION"])
    cfg.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=cfg,
                                              audio_config=speechsdk.audio.AudioOutputConfig(filename=str(dest)))
    words: list[dict] = []

    def on_boundary(evt):
        kind = getattr(evt, "boundary_type", None)
        if kind is not None and kind != speechsdk.SpeechSynthesisBoundaryType.Word:
            return  # bỏ dấu câu, ranh giới câu
        start = evt.audio_offset / TICKS
        words.append({"text": evt.text, "start": round(start, 3),
                      "end": round(start + evt.duration.total_seconds(), 3)})

    synthesizer.synthesis_word_boundary.connect(on_boundary)
    ssml = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN">'
            f'<voice name="{voice}"><prosody rate="{rate}" pitch="{pitch}">{escape(text)}</prosody></voice></speak>')
    result = synthesizer.speak_ssml_async(ssml).get()
    del synthesizer  # giải phóng file âm thanh
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        details = getattr(result, "cancellation_details", None)
        raise RuntimeError(f"Azure TTS lỗi: {result.reason} {getattr(details, 'error_details', '')}")
    return words


async def synth_once(text: str, voice: str, rate: str, dest: Path, pitch: str = "+0Hz"):
    try:
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    except TypeError:  # edge-tts < 7 không có tham số boundary, mặc định đã là WordBoundary
        comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    words = []
    with open(dest, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS
                words.append({"text": chunk["text"], "start": round(start, 3),
                              "end": round(start + chunk["duration"] / TICKS, 3)})
    return words


async def synth(text: str, voice: str, rate: str, dest: Path, provider: str, attempts: int = 5, pitch: str = "+0Hz"):
    """Dịch vụ TTS đôi khi lỗi ngẫu nhiên (Edge hay trả NoAudioReceived), nên thử lại với thời gian chờ tăng dần."""
    for i in range(1, attempts + 1):
        try:
            if provider == "azure":
                return synth_azure(text, voice, rate, dest, pitch)
            return await synth_once(text, voice, rate, dest, pitch)
        except Exception as e:  # noqa: BLE001 – lỗi mạng/dịch vụ đều đáng thử lại
            if i == attempts or "401" in str(e) or "403" in str(e):
                raise  # sai khoá/vùng thì thử lại cũng vô ích
            print(f"  thử lại lần {i} sau lỗi {type(e).__name__}")
            await asyncio.sleep(2 * i)


def align(groups, boundaries, duration):
    """Ghép mốc thời gian của TTS với từ hiển thị gốc."""
    if boundaries and sum(n for _, n in groups) == len(boundaries):
        out, k = [], 0
        for shown, n in groups:
            if n == 0:  # dấu câu đứng đầu lời, không có mốc: bỏ qua
                continue
            seg = boundaries[k:k + n]
            out.append({"text": shown, "start": seg[0]["start"], "end": seg[-1]["end"]})
            k += n
        return out, "tts"
    if boundaries:
        return boundaries, "tts-raw"
    # Không có mốc thời gian: chia đều theo độ dài chữ (cần kiểm tra lại bằng faster-whisper)
    total = duration or 0.0
    weights = [len(s) + 1 for s, _ in groups]
    t, out = 0.0, []
    for (shown, _), w in zip(groups, weights):
        d = total * w / sum(weights)
        out.append({"text": shown, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out, "approx"


async def main_async() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--provider", choices=["azure", "edge"],
                    help="mặc định azure nếu có AZURE_SPEECH_KEY, ngược lại edge (chỉ để làm nháp)")
    ap.add_argument("--voice")
    ap.add_argument("--rate")
    ap.add_argument("--only", help="danh sách id cảnh, ví dụ 2,5")
    args = ap.parse_args()

    provider = args.provider or ("azure" if os.environ.get("AZURE_SPEECH_KEY") and os.environ.get("AZURE_SPEECH_REGION")
                                 else "edge")
    if provider == "edge":
        if edge_tts is None:
            print("LỖI: chưa cài edge-tts. Chạy: pip install edge-tts")
            return 1
        print("CẢNH BÁO: đang dùng Edge TTS (không chính thức, chỉ để làm nháp). "
              "Kênh kiếm tiền dùng --provider azure với AZURE_SPEECH_KEY, AZURE_SPEECH_REGION.")
    else:
        try:
            import azure.cognitiveservices.speech  # noqa: F401
        except ImportError:
            print("LỖI: chưa cài Azure Speech SDK. Chạy: pip install azure-cognitiveservices-speech")
            return 1
    project = Path(args.project)
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    voice_cfg = script.get("voice") or {}
    voice = args.voice or voice_cfg.get("name") or "vi-VN-NamMinhNeural"
    rate = args.rate or voice_cfg.get("rate") or ("+40%" if script.get("format") == "vertical" else "+0%")
    pitch = voice_cfg.get("pitch") or "+0Hz"  # cao độ, ví dụ "+10Hz" (script.json voice.pitch)
    only = {int(x) for x in args.only.split(",")} if args.only else None

    audio_dir = project / "audio"
    audio_dir.mkdir(exist_ok=True)
    subs_path = audio_dir / "subtitles.json"
    old = json.loads(subs_path.read_text(encoding="utf-8")) if subs_path.exists() else {}
    by_id = {s["id"]: s for s in old.get("scenes", [])}
    if old and (old.get("provider", "edge"), old.get("voice"), old.get("rate")) != (provider, voice, rate) and only:
        print("CẢNH BÁO: dịch vụ/giọng/tốc độ khác lần trước, nên tạo lại tất cả cảnh (bỏ --only)")

    for sc in script["scenes"]:
        if only and sc["id"] not in only:
            continue
        app = sc.get("app") or {}
        text, groups = build_groups(sc["narration"], app.get("name"), sc.get("pronunciation"))
        dest = audio_dir / f"scene-{sc['id']}.mp3"
        boundaries = await synth(text, voice, rate, dest, provider, pitch=pitch)
        duration = audio_duration(dest)
        words, timing = align(groups, boundaries, duration)
        by_id[sc["id"]] = {"id": sc["id"], "audio": f"audio/{dest.name}", "text": sc["narration"],
                           "duration": duration, "timing": timing, "words": words}
        print(f"- cảnh {sc['id']}: {duration or '?'}s, {len(words)} từ, timing={timing}")
        if timing != "tts":
            print(f"  CẢNH BÁO: cảnh {sc['id']} không khớp mốc từng từ ({timing}), nên kiểm tra phụ đề")

    valid_ids = {sc["id"] for sc in script["scenes"]}
    result = {"provider": provider, "voice": voice, "rate": rate, "pitch": pitch,
              "scenes": [by_id[i] for i in sorted(by_id) if i in valid_ids]}
    subs_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Xong: {len(result['scenes'])} cảnh → {subs_path}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main_async()))
