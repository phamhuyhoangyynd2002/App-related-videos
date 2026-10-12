---
paths:
  - "templates/**"
  - "projects/*/render/**"
---

# Quy ước template HyperFrames

Nếu đã cài plugin `hyperframes`, đọc skill `/hyperframes-core` trước khi viết HTML composition; nó là hợp đồng kỹ thuật gốc, file này chỉ tóm tắt và bổ sung phần riêng của AppReel.

## Hợp đồng dữ liệu

- Template không chứa nội dung cố định. `prepare_render.py` điền dữ liệu vào thẻ `<script id="appreel-data" type="application/json">` với `{ script, timeline }`.
- Mọi thời gian lấy từ `timeline.json`: `scenes[].start/duration`, `scenes[].shots[].at/end` (nhịp đổi hình, đã khớp theo từ khoá), `captions[]` (cụm phụ đề đã nhóm), `scenes[].voice`. Không tự tính lại từ độ dài chữ.
- Màu, font, khoảng cách lấy từ `frame.md` (hệ thiết kế theo định dạng HyperFrames). Giá trị vô hướng muốn chỉnh trong Studio thì khai báo `data-composition-variables` (mỗi biến tự thành CSS `var(--id)`).
- Thiết kế trước hết cho 1080×1920. Khung ngang là phụ, đổi bố cục bằng class `is-vertical` / `is-horizontal` trên root.
- Template **không** phát nhạc nền và sfx; `mix_audio.py` trộn sau khi render để có bản không nhạc.
- Con dấu phán quyết: cảnh nào có `timeline.scenes[].verdict` (`label`, `at`) thì hiện thành phần `verdict-stamp` của `frame.md`, vào xong đúng `at`. Chữ ký âm thanh cùng lúc đã nằm trong `timeline.sfx`, template không phát. Logo nhỏ theo `logo-bug`.

## Lỗi lint chắc chắn gặp nếu không viết đúng ngay lần đầu (từ hyperframes-core)

- Không đặt CSS `transform` ban đầu rồi tween GSAP cùng thuộc tính đó; dùng `gsap.fromTo`. Căn giữa bằng flex/`inset`, không bằng `translate(-50%,-50%)`.
- Không đặt `crossorigin` trên `<video>`/`<audio>`.
- Mỗi `<audio>` phải có `id`, nếu không bản render sẽ **câm**.
- Không lồng `<video data-start>` trong phần tử cũng có `data-start`.
- Không tween `display`, `visibility`, `autoAlpha` trên phần tử `.clip`; animate phần tử con.
- Font đặt tên phải có `@font-face` trỏ tới file cục bộ trong `templates/_shared/fonts/` (không dùng link Google Fonts).
- Root dùng `width/height: 100%`, kích thước khung lấy từ `data-width`/`data-height`.
- Mỗi composition đăng ký đúng **một** `gsap.timeline({ paused: true })` tại `window.__timelines["<id>"]`, id trùng `data-composition-id`, đăng ký **sau khi** dựng xong (kể cả trong `document.fonts.ready`).
- Cấm: `Math.random()` không seed, `Date.now()`, gọi mạng lúc render, `repeat: -1`, `<br>` trong chữ, gọi `video.play()`.
- Nền toàn khung đặt trên một lớp `.clip` riêng, không đặt trên root.
- Video luôn `muted playsinline`; âm thanh đi bằng `<audio>` riêng.

## Bố cục (Remotion + anthropics/frontend-design)

- **Thiết kế video, không phải trang web**: mỗi cảnh chỉ một thứ người xem phải thấy đầu tiên, dựng khung quanh nó. Không thêm thứ thừa.
- Cỡ chữ tối thiểu ở khung rộng 1080px: tiêu đề/hook ≥ 84px, chữ phụ quan trọng ≥ 44px, phụ đề ≥ 64px.
- Vùng an toàn video dọc (gộp TikTok, YouTube Shorts, Facebook và Instagram Reels): chừa **250px trên, 450px dưới, 150px phải, 60px trái**. Bật lớp phủ `templates/_shared/safe-zone.png` khi chụp thử, tắt khi render.
- Dồn sự táo bạo vào một chỗ (thường là số thứ hạng), phần còn lại tiết chế. Tránh các lối mặc định trông như AI làm: thẻ bo góc giống hệt nhau, nhãn chữ in hoa giãn chữ khắp nơi, gradient chỉ để trang trí.

## Chuyển động (video-use + Remotion)

- **Khung t = 0 đã có chữ hook và hình ứng dụng**, không fade từ màn hình đen, không intro logo.
- Không dùng easing `linear` (trông máy móc). Vào hình: `expo.out` / `power3.out` (tương đương `cubic-bezier(0.16, 1, 0.3, 1)`). Chuyển động liên tục: `power2.inOut`.
- **Hình phải xong đúng lúc từ khoá được đọc**: shot có `at` là lúc từ bắt đầu; bắt đầu hiệu ứng vào sớm hơn đúng bằng thời gian hiệu ứng (ví dụ vào 0,3s thì bắt đầu ở `at - 0.3`).
- **Không cho hai thứ mới hiện cùng lúc**: thẻ thông tin bật lần lượt, cách nhau ít nhất 0,3s.
- Không để hình đứng yên quá 3 giây: mỗi shot tự có chuyển động nhẹ (zoom chậm 1.0→1.08, pan) cho tới shot sau.
- Chuyển cảnh 0,2–0,4s. Trước khi tự viết một hiệu ứng có tên (glitch, flash trắng, CRT), tìm trong kho có sẵn: `npx hyperframes catalog --query "<mô tả bằng tiếng Anh>"`.
- Trước khi tự viết một chuyển động có tên (đập zoom, cắt nhảy, chia ô, lật thẻ, đếm số, chuyển mục), xem `templates/_shared/kieu-hinh.md`: dùng lại `kieu-hinh.js` thay vì viết mới. Kiểu hình tuân trần số lần mỗi video, không lặp kiểu ở hai mục liền nhau, cú đập cả khung (`dap-zoom-rung`, `cat-nhay`, gag `rung`) tối đa 3 lần mỗi video.

## Chữ và phụ đề

- Font trong `frame.md` phải có đủ dấu tiếng Việt. Font trang trí (ví dụ Press Start 2P) thường thiếu dấu: chỉ dùng cho số.
- Font lỗi tải sẽ âm thầm rơi về font mặc định. Trước khi dựng timeline, kiểm tra `document.fonts.check('900 96px "<font>"')` và `throw` nếu sai.
- Phụ đề hiển thị theo `timeline.captions[]` (cụm 2–4 âm tiết, không tách từ ghép), từ đang đọc đổi sang màu accent, đặt quanh 65% chiều cao.
- Cảnh báo `text_box_overflow` 1–4px trên chữ phụ đề của `check` thường là báo nhầm do line-height hẹp; chỉ xử lý khi nó chỉ vào phần tử khác.

## Kiểm tra

- Dùng `npx hyperframes check` làm cổng chính (đã gồm lint, runtime, layout, độ tương phản), yêu cầu 0 lỗi. Lint có lỗi thì `check` báo "0 samples", đừng hiểu nhầm là sạch.
- Muốn biết trên timeline có gì: `npx hyperframes timeline --json`, không đọc tay từng file.
- Chụp thử: `npx hyperframes snapshot --at <các mốc>` ra bảng ảnh tổng hợp.
