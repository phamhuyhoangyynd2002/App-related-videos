---
name: xuat-video
description: Dựng composition HyperFrames từ template + timeline.json, render, rồi trộn nhạc ra out/video.mp4 và out/video-no-music.mp4 cho TikTok, Reels, Shorts. Dùng ở bước 5 của /tao-video, hoặc khi cần render lại sau khi sửa template, đổi khung hình, đổi nhạc.
argument-hint: "<thư mục dự án> [--template top-list|news|tier-list]"
---

# Render video

Đầu vào: `$ARGUMENTS`. Việc này nên giao cho agent `bien-tap-video`.

## Điều kiện trước

- Có `script.json`, `timeline.json` mới hơn `script.json` và `audio/subtitles.json`. Nếu không, chạy `/long-tieng` trước.
- Có `templates/<template>/index.html`. Chưa có (giai đoạn P0) thì chạy `/tao-template <template>` trước.
- Máy đạt yêu cầu: `npx hyperframes doctor --json` (payload `.ok` phải là true; cần Node 22+, FFmpeg, Chrome).

## Các bước

1. Chuẩn bị thư mục dựng (chép template, `frame.md`, tài nguyên, chèn dữ liệu):
   ```bash
   python3 .claude/skills/xuat-video/scripts/prepare_render.py <dự án>
   ```
2. Cổng kiểm tra, trong `<dự án>/render/`:
   ```bash
   npx hyperframes check
   ```
   `check` đã gồm lint, lỗi runtime, bố cục, độ tương phản; yêu cầu 0 lỗi. Sửa ở **template gốc** (`templates/<template>/`), không sửa trong `render/`, rồi chạy lại bước 1. Muốn xem trên timeline có gì: `npx hyperframes timeline --json`.
3. Chụp thử: `npx hyperframes snapshot --at 0,<giữa mỗi nhịp hình>,<cuối>` → bảng ảnh tổng hợp `snapshots/contact-sheet.jpg`. Mở bằng Read: khung t = 0 có hook và hình ứng dụng ngay, chữ tiếng Việt đủ dấu, đúng font, nằm trong vùng an toàn.
4. Render:
   ```bash
   npx hyperframes render --quality draft --output ../out/render-raw.mp4      # trong các vòng tự sửa
   npx hyperframes render --quality delivery --output ../out/render-raw.mp4   # bản cuối
   ```
   Đọc dòng thứ hai của bản tóm tắt render (`beginframe` hay `screenshot`, GPU). Kiểm tra file không rỗng: `test -s ../out/render-raw.mp4`.
5. Trộn âm thanh và master:
   ```bash
   python3 .claude/skills/xuat-video/scripts/mix_audio.py <dự án>
   ```
   Ra `out/video.mp4` (giọng + sfx + nhạc tự nhỏ khi có lời, rút dần trước cảnh cuối), `out/video-no-music.mp4` (để thêm nhạc thịnh hành trong TikTok/Reels) và `out/audio-report.json`. Chuẩn hoá hai lượt về −14 LUFS, true peak ≤ −1 dBTP. Đổi âm lượng nhạc bằng `--music-volume`.
6. Kiểm tra nhanh:
   ```bash
   ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate:format=duration -of compact <dự án>/out/video.mp4
   ```
   Độ dài lệch ≤ 0,5 giây so với `timeline.duration`, đúng kích thước, có luồng audio.

## Khi render lỗi

- Báo nguyên văn lỗi, không chồng thêm lệnh cứu vãn. Sửa chỗ rẻ nhất trong template rồi chạy lại đúng lệnh đã lỗi.
- Thử lần lượt: `check`; đường dẫn tài nguyên trong `render/`; `<audio>` thiếu `id` (render câm); font thiếu `@font-face`; giảm số clip quay màn hình (hoặc nén clip nhẹ hơn); cập nhật `npx hyperframes@latest`.
- Nếu giọng đọc bị mất trong bản render, ghép lại bằng FFmpeg: đặt `audio/scene-*.mp3` theo `timeline.scenes[].voice.start` (`adelay`), `amix`, rồi `-map` vào video thành `render-raw.mp4` và chạy lại `mix_audio.py`. Ghi lệnh đã dùng vào `nhat-ky.md`.
