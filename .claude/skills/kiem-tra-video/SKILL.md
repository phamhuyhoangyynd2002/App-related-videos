---
name: kiem-tra-video
description: Kiểm tra video ngắn đã render trước khi đăng TikTok, YouTube Shorts, Facebook/Instagram Reels (thông số, âm lượng, khung đầu tiên, nhịp đổi hình, khung đen, khoảng lặng, phụ đề, chữ tiếng Việt, đúng ứng dụng, thông tin cá nhân trong clip, vùng an toàn, nhận diện thương hiệu) và ghi out/qa-report.md. Dùng ở bước 6 của /tao-video hoặc trước khi đăng bất kỳ video nào.
argument-hint: "<thư mục dự án>"
---

# Kiểm tra video trước khi đăng

Đầu vào: `$ARGUMENTS`. Giao agent `kiem-dinh-video` (kỹ thuật) và agent `phan-bien-video` (nội dung, "chê thẳng") **chạy song song**.

Nguyên tắc từ video-use: tự kiểm tra trước khi đưa người dùng xem, vì cái gì mình không dám đăng thì không trình. Sửa → render lại → kiểm lại **tối đa 3 vòng**; quá 3 vòng thì báo lỗi còn lại thay vì lặp mãi. Bạn không nghe được: báo số đo, đừng nói "âm thanh nghe ổn".

## Kiểm tra kỹ thuật (FFmpeg)

```bash
V=<dự án>/out/video.mp4
ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,r_frame_rate:format=duration,size -of json "$V"
ffmpeg -hide_banner -i "$V" -af ebur128=framelog=quiet -f null - 2>&1 | tail -12      # độ lớn âm thanh
ffmpeg -hide_banner -i "$V" -vf blackdetect=d=0.3:pix_th=0.10 -an -f null - 2>&1 | grep black_start
ffmpeg -hide_banner -i "$V" -af silencedetect=n=-40dB:d=1.2 -vn -f null - 2>&1 | grep silence_start
```

| Mục | Đạt khi |
|---|---|
| Kích thước | Đúng `timeline.width`×`timeline.height` |
| FPS | Đúng `timeline.fps` |
| Độ dài | Lệch ≤ 0,5 giây so với `timeline.duration`; video dọc ≤ 180 giây (trừ khi `target_seconds` khai báo bản dài), tuyệt đối ≤ 300 giây |
| Hai bản | Có cả `video.mp4` và `video-no-music.mp4`, cùng độ dài |
| Codec | Video h264, audio aac |
| Độ lớn âm thanh | Integrated khoảng −14 LUFS (±1), true peak ≤ −1 dBTP (đọc `out/audio-report.json`) |
| Cảnh cuối | Lệch không quá 6 LU so với thân video (lời kêu gọi không được nhỏ hẳn đi) |
| Khung đen | Không có đoạn đen > 0,3 giây (trừ chuyển cảnh có chủ ý) |
| Khoảng lặng | Không có đoạn im > 1,2 giây giữa các cảnh |

## Kiểm tra hình ảnh

1. Trích **khung đầu tiên** và 1 khung ở giữa mỗi cảnh (theo `timeline.scenes[].start/end`):
   `ffmpeg -y -loglevel error -ss 0 -i "$V" -frames:v 1 <dự án>/out/frames/t0.jpg`
   `ffmpeg -y -loglevel error -ss <giây> -i "$V" -frames:v 1 <dự án>/out/frames/scene-<id>.jpg`
2. Khung `t0.jpg` là thứ người xem thấy khi lướt tới: phải có chữ hook lớn, đọc được, và hình ứng dụng (tốt nhất là kết quả trong clip dùng thử). Màn hình đen, chỉ có logo, hoặc chữ nhỏ là lỗi **Chặn**.
   Nếu đã cài HyperFrames: `npx hyperframes snapshot --at <giữa mỗi nhịp hình>` trên thư mục `render/` tạo sẵn bảng ảnh tổng hợp `snapshots/contact-sheet.jpg`, xem một lần thay cho mở từng ảnh.
3. Ranh giới cảnh: trích khung ở `start - 0.1` và `start + 0.1` của mỗi cảnh để tìm nháy trắng, giật hình, chữ cảnh trước còn sót.
4. Nhịp đổi hình: `ffmpeg -hide_banner -i "$V" -vf "select='gt(scene,0.25)',showinfo" -an -f null - 2>&1 | grep -o 'pts_time:[0-9.]*'` liệt kê các lần đổi cảnh. Khoảng trống nào > 3,5 giây là **Nên sửa**.
5. Mở từng ảnh bằng Read và kiểm tra:
   - Ảnh/clip đúng ứng dụng của cảnh (so với `script.json`).
   - Clip quay màn hình không lộ tên tài khoản, số điện thoại, email, số dư, thông báo, tin nhắn, danh bạ, vị trí (lộ là lỗi **Chặn**).
   - Chữ tiếng Việt đủ dấu, không bị cắt, không tràn khung. Font đúng là font của `frame.md` (font lỗi tải sẽ âm thầm rơi về font mặc định trông "gần giống Arial").
   - Chữ quan trọng và phụ đề nằm trong vùng an toàn (video dọc: chừa 250px trên, 450px dưới, 150px phải, 60px trái), không bị nút thích/bình luận hay caption của ứng dụng che.
   - Không có watermark, logo của TikTok, YouTube, Facebook, Instagram hay kênh khác.
   - Thứ hạng, thẻ thông tin khớp `script.json`.
   - Có logo kênh đúng vị trí `logo-bug` trong `frame.md`; cảnh cuối có câu hỏi hoặc lời kêu gọi trung tính (không nhắc tên nền tảng).
6. Kiểm tra phụ đề: đọc `timeline.json`, cảnh nào có `timing` khác `tts`/`whisper` thì trích thêm 2–3 khung trong cảnh đó để so phụ đề với lời đọc.

## Kiểm tra nội dung và bản quyền

Chạy trước, mọi mục CHẶN là lỗi **Chặn**:

```bash
python3 .claude/skills/kiem-tra-video/scripts/kiem_tra_ban_quyen.py <dự án>
```

Script kiểm tra nguồn clip (chỉ tự quay hoặc nhà phát triển cho phép; giọng bình luận phủ ≥ 70%), nguồn và chủ sở hữu hình ảnh, press kit, sổ giấy phép nhạc, sfx, font, dịch vụ giọng đọc, công bố tài trợ, từ khoá rủi ro, độ trùng lời đọc với video trước; rồi sinh hồ sơ `ban-quyen.md` cho dự án. Mục **Cần người xem** trong hồ sơ là việc máy không tự kiểm được: agent kiểm định phải tự xem khung hình và đánh dấu từng mục, phần nào chỉ người dùng làm được (bật nhãn khi đăng) thì đưa lên DỪNG 3.

Giọng đọc: agent không nghe được âm thanh, nên phải "nghe" bằng nhận dạng lời. LỖI là lỗi **Chặn** (đọc lặp tên, âm thanh cụt, đọc thừa):

```bash
python3 .claude/skills/long-tieng/scripts/nghe_lai.py <dự án>
```

Ngoài ra, xem bằng mắt trên các khung đã trích:
- Không có bản đồ "đường lưỡi bò" hay bản đồ sai chủ quyền Việt Nam (xem kỹ mọi khung có bản đồ, nhất là ứng dụng bản đồ, du lịch, thời tiết).
- Không có hình rò rỉ, fan art, ảnh có watermark của báo hoặc kênh khác.

- Không có tiếng gốc của clip (âm thanh ứng dụng, nhạc trong ứng dụng).
- Không có nội dung người lớn của ứng dụng 17+.
- Kết quả ứng dụng AI có người thật: có nhãn AI theo hồ sơ kênh và người đó đã đồng ý.
- 2–3 giây cuối không bị im lặng hay đứng hình (để video lặp vòng mượt).
- Mọi số liệu trên màn hình có trong `fact-check.md` với kết quả ĐÚNG hoặc đã được người dùng chấp nhận.

## Kiểm tra nhận diện thương hiệu

```bash
python3 .claude/skills/kiem-tra-video/scripts/kiem_tra_thuong_hieu.py <dự án>
```

Script đối chiếu với `kenh/ho-so-kenh.md` và `.claude/rules/phong-cach-thuong-hieu.md`: giọng đọc đúng giọng duy nhất của hệ thống (sai giọng là CHẶN), đúng một con dấu phán quyết với nhãn hợp lệ, chữ ký âm thanh đúng một lần và khớp con dấu, không dùng từ trong danh sách "không dùng", `out/seo.md` đủ các nền tảng chính và có dòng "Giọng đọc: AI". Mục CẢNH BÁO đưa vào **Nên sửa**.

Xem bằng mắt thêm: trích khung tại `timeline.scenes[].verdict.at + 0.3`, con dấu đúng hình dạng, màu, vị trí theo `verdict-stamp` trong `frame.md` và không bị phụ đề che. Không có meme âm thanh hay hình phim ngoài quy tắc.

## Báo cáo `out/qa-report.md`

```markdown
# Kiểm định: <tiêu đề>
Ngày: YYYY-MM-DD · File: out/video.mp4 · <độ dài>s · <kích thước>

## Kết luận: SẴN SÀNG ĐĂNG | CẦN SỬA

## Chặn (phải sửa trước khi đăng)
## Nên sửa
## Ghi chú
## Bảng thông số
```

Mức **Chặn**: sai kích thước, mất tiếng, sai ứng dụng, sai số liệu, tính năng sai, lộ thông tin cá nhân, chữ bị cắt dấu, khung đầu tiên không có hook, chữ quan trọng nằm ngoài vùng an toàn, khung đen dài, mọi mục CHẶN của `kiem_tra_ban_quyen.py` và `kiem_tra_thuong_hieu.py` (giọng đọc khác giọng của hệ thống), bản đồ sai chủ quyền, hình rò rỉ.
