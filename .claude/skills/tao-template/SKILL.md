---
name: tao-template
description: Tạo mới hoặc chỉnh sửa template video HyperFrames (top-list, news, tier-list) theo hợp đồng dữ liệu AppReel, thiết kế cho video dọc TikTok/Reels/Shorts (vùng an toàn, hook ở khung đầu, đổi hình nhanh, phụ đề từng từ, font tiếng Việt), khung ngang là phụ. Dùng khi chưa có template, muốn đổi phong cách, thêm hiệu ứng, chuyển cảnh, hoặc sửa lỗi hiển thị.
argument-hint: "<top-list|news|tier-list> [yêu cầu phong cách]"
---

# Tạo / sửa template HyperFrames

Đầu vào: `$ARGUMENTS`.

## Chuẩn bị

1. Nếu đã cài plugin `hyperframes`, đọc `/hyperframes-core` (hợp đồng kỹ thuật), `/hyperframes-animation` (bản thiết kế chuyển động có sẵn) và `/hyperframes-registry` (khối, hiệu ứng, chuyển cảnh dựng sẵn). Chưa cài thì đề xuất cài (xem CLAUDE.md) và làm theo `.claude/rules/template-hyperframes.md`.
2. Đọc `templates/_shared/frame.md` (hệ thiết kế: màu, font, cỡ chữ, vùng an toàn, easing). Còn là bản tạm thì đề nghị chạy `/thiet-lap-kenh` trước.
3. Nếu người dùng có video mẫu yêu thích, trích vài khung và xem trước để bám phong cách.
4. Kiểm tra máy: `npx hyperframes doctor --json` (cần Node 22+, FFmpeg, Chrome).

## Cấu trúc thư mục

```
templates/
├── _shared/
│   ├── frame.md         # hệ thiết kế (định dạng HyperFrames)
│   ├── brand.css        # @font-face + biến CSS sinh từ frame.md
│   ├── fonts/           # file font có đủ dấu tiếng Việt
│   ├── logo.png
│   ├── safe-zone.png    # lớp phủ vùng an toàn, chỉ bật khi chụp thử
│   ├── appreel.js      # hàm dùng chung: đọc dữ liệu, dựng shots, phụ đề, kiểm tra font
│   ├── gags.js          # gag hình (nhịp cười)
│   └── kieu-hinh.js     # kiểu hình có tên: đập zoom, cắt nhảy, chia ô, lật thẻ, đếm số, chuyển mục (kieu-hinh.md)
├── top-list/            # khởi tạo bằng: npx hyperframes init templates/top-list --non-interactive --example=blank
│   ├── index.html
│   └── compositions/    # mỗi loại cảnh một sub-composition: intro.html, item.html, outro.html
├── news/
└── tier-list/
```

Tách mỗi loại cảnh thành một sub-composition (cách Remotion tách mỗi cảnh thành component riêng) để xem trước và sửa từng loại cảnh độc lập trong Studio.

## Quy trình hai lượt: phác tĩnh trước, chuyển động sau

Học từ vòng duyệt của HyperFrames: sửa bố cục trên bản phác mất 30 giây, sửa sau khi đã làm chuyển động mất nhiều phút.

1. **Phác tĩnh**: dựng mỗi loại cảnh ở khoảnh khắc quan trọng nhất (intro ở t = 0, item lúc thẻ thông tin đã hiện, outro), đủ màu, font, chữ thật, **chưa có chuyển động**. Chụp bằng `npx hyperframes snapshot --at <mốc>` có bật `safe-zone.png`, đưa người dùng xem bảng ảnh và hỏi một câu: bố cục ổn chưa, sửa cảnh nào?
2. **Thêm chuyển động** trên bố cục đã duyệt, không vẽ lại bố cục.

## Khung `index.html`

- Thẻ `<script id="appreel-data" type="application/json"></script>` để trống (`prepare_render.py` điền).
- Root `data-composition-id`, `data-width`, `data-height` lấy từ `timeline`.
- `appreel.js` đọc dữ liệu, kiểm tra font (`document.fonts.check`), rồi sinh:
  - mỗi cảnh một host sub-composition với `data-start = scene.start`, `data-duration = scene.duration`;
  - trong cảnh, mỗi phần tử của `scene.shots` là một lớp hình (`header`, `screenshot:N`, `clip` (quay màn hình) từ giây `from`, `icon`, `fact:<nhãn>`, `text`), hiện xong đúng `shot.at`, có chuyển động nhẹ tới `shot.end`;
  - `<audio id="vo-<id>">` cho giọng đọc theo `scene.voice`;
  - phụ đề từ `timeline.captions[]`, đổi màu từ đang đọc theo `words[].start/end`.
- Kiểu hình (`_shared/kieu-hinh.js`, nạp sau `gags.js`): template mới đặt mọi ảnh của khung vào `AppReel.kieu.cam(khung)`, cộng `kieu.lead(shot)` vào mốc vào của ảnh và thẻ, gọi `kieu.shot(...)` cho nhịp ảnh và `kieu.fact(...)` sau tween vào của thẻ (mẫu: `top-list/scenes/item.js`). Template tự chuyển mục thì truyền `chuyen: false` vào `run()`. Trước khi tự viết một chuyển động có tên, xem `kieu-hinh.md` đã có chưa.
- Cảnh 1 hiện chữ hook và hình ngay ở t = 0.
- Không có tài nguyên thì dùng nền động + chữ, không để khung trống.

**Lưu ý:** xác nhận HyperFrames nhận các clip sinh bằng JavaScript lúc tải trang (`npx hyperframes timeline --json` phải liệt kê đủ clip). Nếu không, chuyển việc sinh HTML vào `prepare_render.py` (sinh sẵn thẻ `class="clip"` tĩnh), giữ template chỉ còn bố cục và chuyển động.

## Thành phần theo template (README mục 5)

| Template | Thành phần chính |
|---|---|
| `top-list` | Số thứ hạng rất lớn vào đúng lúc đọc thứ hạng, icon, screenshot, clip quay màn hình, thẻ thông tin bật lần lượt |
| `news` | Tiêu đề chạy, ảnh chính, chữ nổi bật, nguồn tin ở góc (lấy `sources` theo `source_ids`) |
| `tier-list` | Bảng S/A/B/C/D, icon ứng dụng bay vào đúng hàng đúng lúc lời đọc nhắc tên (dùng `cue`) |

Mọi template: logo kênh nhỏ trong vùng an toàn (`logo-bug`), con dấu phán quyết (`verdict-stamp`) khi `timeline.scenes[].verdict` có, thang "Điểm máy yếu" (`score-card`) khi cảnh có thẻ đó, đều theo `frame.md` và giống nhau ở mọi template; cảnh cuối có câu hỏi hoặc lời kêu gọi theo dõi, không watermark nền tảng nào. Trước khi tự viết một hiệu ứng có tên (glitch, flash trắng, rung khi đổi hạng), tìm trong kho: `npx hyperframes catalog --query "<mô tả tiếng Anh>"`.

## Kiểm tra

1. Dùng dự án mẫu `projects/_mau-<template>/` (tạo từ ví dụ trong `viet-kich-ban/references/schema.md` nếu chưa có dự án thật), chạy đủ `/long-tieng` để có `timeline.json` thật.
2. `prepare_render.py` → `npx hyperframes check` (0 lỗi) → `npx hyperframes snapshot --at <t=0, giữa mỗi shot, cuối>`.
3. Mở bảng ảnh: khung t = 0 có hook, dấu tiếng Việt không bị cắt, font đúng, chữ trong vùng an toàn, phụ đề khớp.
4. `npx hyperframes preview --background` và đưa người dùng đường dẫn Studio nếu cần xem chuyển động.
