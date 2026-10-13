---
name: long-tieng
description: Tạo giọng đọc tiếng Việt (Azure AI Speech; Edge TTS chỉ để làm nháp; hoặc nhập giọng từ dịch vụ ngoài như Vbee do người dùng tải về) cho từng cảnh, lấy mốc thời gian từng từ làm phụ đề, rồi dựng timeline.json theo độ dài audio thật. Dùng ở bước 3–4 của /tao-video, hoặc khi đổi giọng, đổi tốc độ, sửa lời một cảnh, đổi nhạc nền.
argument-hint: "<thư mục dự án> [--voice ...] [--rate ...] [--only 2,5] [--music ...]"
---

# Giọng đọc và timeline

Đầu vào: `$ARGUMENTS`.

## Bước 3 – Giọng đọc

```bash
python3 .claude/skills/long-tieng/scripts/tts_edge.py <thư mục dự án> [--voice vi-VN-NamMinhNeural] [--rate +5%] [--only 2,5]
```

- **Dịch vụ**: kênh có kiếm tiền phải dùng `--provider azure` (Azure AI Speech, dịch vụ chính thức; gói F0 miễn phí 500.000 ký tự/tháng; cần `pip install azure-cognitiveservices-speech` và `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` trong môi trường). Có khoá thì script tự chọn Azure. Edge TTS là dịch vụ không chính thức, Microsoft khuyến cáo dùng thương mại có thể vi phạm điều khoản, nên chỉ dùng để làm nháp; `kiem_tra_ban_quyen.py` sẽ chặn video dùng Edge nếu hồ sơ kênh ghi có kiếm tiền.
- Giọng có sẵn (cả hai dịch vụ): `vi-VN-NamMinhNeural` (nam, mặc định của kênh từ 13/10/2026), `vi-VN-HoaiMyNeural` (nữ). Không nhân bản giọng người thật.
- Chỉ sửa lời vài cảnh thì dùng `--only`. Đổi giọng hoặc tốc độ thì tạo lại tất cả.
- Kết quả `timing` của mỗi cảnh trong `audio/subtitles.json`:
  - `tts`: mốc từng từ khớp với lời gốc. Tốt.
  - `tts-raw`: số từ TTS trả về khác lời gốc (thường do số, ký hiệu). Sửa lời đọc thành chữ rồi tạo lại cảnh đó.
  - `approx`: TTS không trả mốc từ, thời gian đang chia đều. Dùng phương án dự phòng bên dưới.

**Dự phòng khi mốc từ bị `approx`** (nhận dạng lời theo từng từ, không bao giờ dùng phụ đề theo câu vì mất mốc nghỉ giữa các từ):
- Đã cài HyperFrames: `npx hyperframes transcribe audio/scene-<id>.mp3 --model small` (model đa ngôn ngữ, **không** dùng `small.en`), kết quả đã đúng dạng `{text, start, end}`.
- Hoặc faster-whisper: model `small`, `language="vi"`, `word_timestamps=True`.

Ghi đè `words` của cảnh đó và đặt `timing: "whisper"`. Lưu kết quả, không nhận dạng lại nếu file audio không đổi.

**Nếu dịch vụ lỗi**: báo người dùng. Phương án khác: ElevenLabs (kiểm tra gói cho phép thương mại), thu giọng thật. Không tự đăng ký dịch vụ trả phí.

### Giọng từ dịch vụ ngoài (Vbee, FPT.AI...)

Dùng khi hồ sơ kênh chọn giọng của dịch vụ không có API trong dự án. Người dùng thao tác trên web của dịch vụ, Claude lo phần còn lại.

1. **Xuất lời đọc**:
   ```bash
   python3 .claude/skills/long-tieng/scripts/xuat_loi_doc.py <thư mục dự án> [--dich-vu vbee] [--max-chars 3000] [--only 2,5]
   ```
   Ghi `audio/vbee/doc-phan-<N>.txt` (chữ thuần, dán nguyên vào Vbee; tên ứng dụng đã thay bằng `pronunciation`) và `audio/vbee/HUONG-DAN.md`. Tự chia phần ở ranh giới cảnh khi quá `--max-chars` (bản miễn phí Vbee: 3.000 ký tự mỗi lần). Báo người dùng: số phần, số ký tự, tên file cần đặt khi tải về (`phan-1.mp3`...), giữ cùng giọng và tốc độ cho mọi phần. Đây là việc duy nhất cần người dùng làm; dừng chờ họ báo đã tải xong.
2. **Nhập âm thanh** khi người dùng báo đã bỏ file vào `audio/vbee/`:
   ```bash
   python3 .claude/skills/long-tieng/scripts/nhap_audio_ngoai.py <thư mục dự án> --dich-vu vbee --giong "<tên giọng>" [--rut-nghi 0.3] [--toc-do 1.1] [--only 2,5]
   ```
   Nhận dạng lời bằng faster-whisper (`pip install faster-whisper`; lần đầu tải model `small` khoảng 500MB), so với lời gốc trong `script.json`, dời mốc từ về đúng mép khoảng lặng, cắt ranh giới cảnh vào khoảng lặng, ghi `audio/scene-<id>.mp3` và `audio/subtitles.json` (`provider: vbee`, `timing: whisper`, `match` = tỉ lệ từ nghe khớp). Audio cũ được chuyển vào `audio/v-<dịch vụ cũ>-<thời điểm>/`.
   - `match` dưới 70%: nghe lại cảnh đó; thường do đọc sai tên, đọc thiếu câu, hoặc file không đúng cảnh.
   - Tốc độ trung bình dưới 4,5 từ/giây: ưu tiên nhờ người dùng tăng tốc độ trên dịch vụ; tạm thời dùng `--rut-nghi 0.3` (rút chỗ nghỉ dài giữa câu) rồi `--toc-do` tối đa 1,15.
   - Sửa lời vài cảnh: xuất và nhập cùng `--only`.
   - Test bằng file giả (ghép giọng Edge có sẵn mốc từ), ngày 01/10/2026: mốc từ lệch trung vị 0,02 giây, 90% số từ lệch dưới 0,1 giây.
3. **Bản quyền**: bản miễn phí của Vbee chỉ cho dùng cá nhân, học tập; gói trả phí mới có quyền thương mại. `kiem_tra_ban_quyen.py` cảnh báo (kênh chưa kiếm tiền) hoặc chặn (kênh kiếm tiền) khi `kenh/bang-chung/` chưa có file bằng chứng gói trả phí có tên dịch vụ trong tên file.

**Phát âm tên ứng dụng (quy tắc cứng, từ 13/10/2026)**: không tự nghĩ phiên âm. Trước bước giọng đọc, mọi tên ứng dụng trong lời đọc phải có trong từ điển kênh `kenh/phat-am.json`; `tts_edge.py` tự dùng từ điển này (phụ đề vẫn hiện tên gốc). Tên chưa có thì chấm bằng:
```bash
python3 .claude/skills/long-tieng/scripts/thu_phat_am.py "<Tên>" "<ứng viên 1>" "<ứng viên 2>" ... --ghi
```
Script cho giọng của kênh đọc từng ứng viên (và tên gốc), nhận dạng lại bằng Whisper **tiếng Anh**, chọn cách được nghe ra gần tên gốc nhất. Ứng viên tốt thường tách âm bằng gạch nối để giữ phụ âm cuối tiếng Anh: "pắc-poi-n" (PackPoint, 0,80; "pắc poin" chỉ 0,47), "pô-lờ-x-tép" (Polarsteps, 0,95), "oan-đờ-lóg" (Wanderlog). Đưa 4–6 ứng viên khác kiểu (tách gạch, đổi thanh, thêm phụ âm cuối). Bằng điểm thì giữ tên gốc. Điểm dưới 0,6 thì nghe lại bằng tai; người làm video chốt bằng tai thì đặt `"khoa": true` trong từ điển. Vì sao: phiên âm tự nghĩ ("pắc poin", "xét tồ ắp") bị chê đọc tên không chuẩn.
Trường `pronunciation` của cảnh chỉ để ghi đè từ điển cho riêng video đó (ví dụ `"pronunciation": "nâu sần"` cho Notion), rồi tạo lại với `--only`. Nhiều tên trong một cảnh: `"Tên A: phiên âm; Tên B: phiên âm"`, tên viết đúng như trong `narration`.

**Nghe lại (bắt buộc, quy tắc cứng, sau mỗi lần tạo hoặc nhập giọng, trước `rut_nghi.py`)**:
```bash
python3 .claude/skills/long-tieng/scripts/nghe_lai.py <thư mục dự án> [--only 3,5]
```
Nhận dạng lời từng cảnh, so với `narration`, ghi `audio/nghe-lai.json`, thoát mã 1 khi có LỖI: đọc lặp một cụm từ, nghe được dưới 80% số từ (âm thanh cụt), hoặc trên 125% (đọc thừa). Có LỖI thì tạo lại cảnh đó, không đi tiếp. CẢNH BÁO (khớp dưới 60%) thì tự nghe cảnh đó.
Vì sao: ngày 06/10/2026, `pronunciation` ghi dạng nhiều tên làm TTS đọc "Hungry Shark Evolution, Hungry Shark Evolution, Megalodon, Megalodon"; hai video đã đăng trước đó cũng bị đọc lặp tên ("Luanti, Luanti", "Genshin, Genshin"). Agent kiểm định, phản biện không nghe được âm thanh nên không bắt được. Cùng ngày, Edge TTS trả âm thanh cụt (12 giây thay vì 21 giây) mà vẫn báo xong. Cảnh có `timing` là `tts-raw` cũng là dấu hiệu phải nghe lại.

### Rút quãng nghỉ (chạy sau khi tạo giọng, trước timeline)

```bash
python3 .claude/skills/long-tieng/scripts/rut_nghi.py <thư mục dự án> [--toi-da 0.2] [--giu 0.17] [--giu-punchline 0.4] [--dau 0.05] [--duoi 0.15] [--only 2,4] [--thu]
```

Giọng TTS nghỉ đều khoảng 0,6 giây sau mỗi dấu chấm. Video 05/10/2026 có quãng nghỉ chiếm 25% thời lượng, tốc độ thực chỉ 3,3 âm tiết/giây (mục tiêu 4,5–5). Script cắt phần im lặng thừa ở giữa mỗi quãng dài hơn `--toi-da`, giữ `--giu` giây; quãng ngay sau dấu "…" giữ `--giu-punchline` giây (đó là chỗ ngừng trước câu đùa). Từ 13/10/2026: TTS đọc liền qua "…" thì script **chèn** im lặng cho đủ `--giu-punchline`; im lặng đầu, cuối mỗi file cắt còn `--dau`, `--duoi` (trước đây gần 1 giây mỗi lần chuyển cảnh). Mặc định đi cùng giọng NamMinh +40% của hồ sơ kênh: cả video khoảng 4,1 âm tiết/giây (người làm video chê 3,3 chậm, 4,8 quá nhanh). Mốc từng từ được dời theo. Cảnh đã rút sẽ bị bỏ qua khi chạy lại; tạo lại giọng một cảnh (`tts_edge.py --only`) thì rút lại cảnh đó. Mặc định chạy cho mọi video dọc; `--thu` để xem trước số giây bớt được.

## Bước 4 – Timeline

```bash
python3 .claude/skills/long-tieng/scripts/build_timeline.py <thư mục dự án> [--music music/abc.mp3 | --music none] [--music-volume 0.25]
```

- Độ dài mỗi cảnh = độ dài audio thật + 0,15 giây nghỉ; cảnh đầu chỉ có 0,1 giây trước lời (hook vào ngay); cảnh cuối giữ thêm 0,6 giây (đủ ngắn để video lặp vòng mượt).
- `timeline.json` chứa mốc tuyệt đối của cảnh, giọng đọc, từng từ, tài nguyên của mỗi cảnh, và:
  - `scenes[].shots`: nhịp đổi hình. Shot có `cue` rơi đúng lúc từ khoá được đọc; cảnh không khai báo `shots` tự chia mỗi ~2,5 giây. Cảnh báo nếu hình đứng yên quá 3,5 giây.
  - `captions[]`: cụm phụ đề 2–4 âm tiết, ngắt ở dấu câu, không tách đôi từ ghép. Cài `pip install pyvi` để tách từ tiếng Việt chính xác ("vũ khí", "côn trùng" không bị tách); không có `pyvi` thì script ngắt trước các hư từ, đôi khi vẫn tách sai.
  - `sfx[]`: hiệu ứng âm thanh từ `sfx/<tên>.*`, đặt theo `cue`. Cảnh báo khi quá dày.
  - `scenes[].verdict`: con dấu phán quyết (`label`, `at` theo `cue` của `verdict`; không có `cue` thì đặt 1,2 giây trước khi hết cảnh). Nếu có `sfx/chu-ky.*`, script tự thêm chữ ký âm thanh cùng lúc (tắt bằng `--brand-sfx none`).
- Nhạc nền mặc định là file đầu tiên trong `music/`. Timeline chỉ ghi nhạc nào, âm lượng bao nhiêu; việc trộn nhạc làm sau khi render (`mix_audio.py`), nhạc tự nhỏ đi khi có lời đọc.
- Mục tiêu độ dài lấy từ `target_seconds` của `script.json`, mặc định 120–180 giây với top-list, tier-list và 20–45 giây với news.
- Nếu tổng độ dài vượt mục tiêu: rút gọn lời đọc các cảnh dài nhất trong `script.json` (cần người dùng đồng ý nếu đã qua DỪNG 2 và thay đổi nội dung), hoặc tăng `--rate` thêm 5%.

Yêu cầu: `ffprobe` (đi kèm FFmpeg).
