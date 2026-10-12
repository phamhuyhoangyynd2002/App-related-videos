---
name: seo-dang-bai
description: Viết caption, tiêu đề, hashtag, chữ ảnh bìa và bình luận ghim riêng cho TikTok, YouTube Shorts, Facebook Reels (và Instagram Reels nếu đăng) từ script.json, ghi out/seo.md. Dùng ở bước 7 của /tao-video hoặc khi cần viết lại caption, tiêu đề, hashtag. Không tự đăng bài.
argument-hint: "<thư mục dự án>"
---

# Nội dung đăng bài cho TikTok, Shorts, Facebook Reels, Instagram Reels

Đầu vào: `$ARGUMENTS`. Có thể giao cho agent `seo-mang-xa-hoi`. Chỉ viết nội dung, **không đăng** lên bất kỳ nền tảng nào.

Đọc `brief.md` (góc nhìn), `script.json` (hook, `hook_type`, tên ứng dụng, nguồn), `timeline.json` (mốc thời gian để chọn khung ảnh bìa), và liệt kê `out/frames/` nếu có.

## Nguyên tắc chung

- Từ khoá chính (việc người xem cần làm như "quét tài liệu", "xoá phông", rồi tên ứng dụng, "ứng dụng miễn phí"…) nằm ở **đầu** caption và tiêu đề, vì mọi nền tảng đều được người xem dùng để tìm kiếm.
- Viết cho các nền tảng ghi trong `kenh/ho-so-kenh.md`: TikTok, YouTube Shorts, Facebook Reels là bắt buộc; Instagram Reels viết thêm nếu hồ sơ kênh có.
- Cuối caption, mô tả của **mọi** nền tảng có dòng minh bạch "Giọng đọc: AI" (chính sách nhãn AI trong hồ sơ kênh).
- Caption không lặp nguyên văn câu hook trong video; nó bổ sung hoặc đặt câu hỏi.
- Hứa đúng nội dung video, không giật tít sai sự thật.
- Tên ứng dụng viết đúng như trên App Store / Google Play; ghi nền tảng nếu chỉ có trên iOS hoặc Android.
- Không nhắc tên nền tảng khác trong caption của một nền tảng.
- Tránh lặp caption, tiêu đề của các video trước (xem `projects/*/out/seo.md`).

## Yêu cầu cho từng nền tảng

**TikTok**
- Caption 1–2 câu, câu đầu chứa từ khoá, kết bằng câu hỏi kéo bình luận.
- 3–5 hashtag: 1–2 rộng (`#apphay`, `#ungdunghay`, `#meohay`), 2–3 cụ thể (tên ứng dụng, việc, `#iphone` / `#android`).
- Chữ ảnh bìa: tối đa 4 từ, và thời điểm (giây) của khung hình nên chọn làm ảnh bìa.

**Facebook Reels** (nền tảng lớn nhất ở Việt Nam, giữ được khán giả phụ 25–34 tuổi)
- Caption 1–2 câu, dòng đầu có từ khoá và nói rõ lợi ích thực tế (tiết kiệm tiền, đỡ quảng cáo, xong việc nhanh hơn), kết bằng câu hỏi.
- 3–5 hashtag.
- Chữ ảnh bìa đặt giữa khung.
- File: `video.mp4` (nhạc có giấy phép của kênh).

**Instagram Reels** (đăng thêm, chỉ khi hồ sơ kênh có)
- Caption 1–2 câu + câu hỏi. Dòng đầu phải hấp dẫn vì phần sau bị ẩn.
- 3–5 hashtag.
- Ảnh bìa: lưới trang cá nhân cắt ảnh bìa theo tỉ lệ 3:4 ở giữa, nên chữ bìa phải nằm ở vùng giữa khung.

**YouTube Shorts**
- Tiêu đề 20–40 ký tự, 4–6 từ (khoảng 40 ký tự đầu mới hiện), từ khoá ở đầu. 3 phương án theo 3 kiểu (con số / góc nhìn riêng / câu hỏi), đánh dấu phương án đề xuất. Video thuộc series thì giữ mẫu tên series và số tập.
- Mô tả: 125 ký tự đầu mang toàn bộ ý chính (phần hiện trong bản xem trước), rồi 1–2 câu tóm tắt, danh sách ứng dụng kèm link App Store / Google Play (link thường, không phải link giới thiệu, trừ khi đã công bố affiliate), mục "Nguồn" (toàn bộ `sources`), mục **"Ghi công"** (bắt buộc, xem dưới), 2–3 hashtag gồm `#Shorts`.
- Nếu kênh có video liên quan, gợi ý gắn "video liên quan" trong YouTube Studio.

**Ảnh bìa trong feed**: video ngắn tự phát nên khung hình đầu chính là ảnh bìa; chữ bìa chỉ hiện ở trang kênh và kết quả tìm kiếm. Vì vậy ưu tiên chọn khung có chữ hook (thường là giây 0–1).

**Bình luận ghim** (dùng chung): một câu hỏi bắt người xem chọn hoặc bổ sung, gắn với góc nhìn của video.

**Ghi công** (bắt buộc trong mô tả YouTube, và rút gọn trong caption TikTok, Facebook, Instagram nếu đủ chỗ), lấy từ `assets/manifest.json`, `music/GIAY-PHEP.md`, `sfx/GIAY-PHEP.md`:
- "Giao diện, hình ảnh ứng dụng: © <tên các nhà phát triển trong `rights_holder`>. Dùng để bình luận, đánh giá."
- Nhạc, sfx có yêu cầu ghi công: chép **nguyên văn** câu ghi công trong sổ giấy phép.

**Tài trợ** (khi `script.json` có `sponsorship`): câu công bố ở **dòng đầu** caption mọi nền tảng (ví dụ "Có tài trợ từ …", "Được tặng gói Pro để đánh giá", "Có mã giới thiệu"), và nhắc bật "Paid promotion" (YouTube), "Branded content" (TikTok), "Paid partnership" (Facebook, Instagram).

**Không được**: link tới bản bẻ khoá, APK/IPA ngoài cửa hàng, ứng dụng thuộc danh sách "không giới thiệu" (rules mục 7); link hoặc mã giới thiệu chưa công bố là affiliate; câu "kênh chính thức", "đối tác của…" khi không có thật.

**Nhạc**: ghi rõ nên đăng `video.mp4` hay `video-no-music.mp4` trên từng nền tảng. Bản không nhạc + nhạc thịnh hành trong app chỉ dành cho **tài khoản TikTok/Instagram cá nhân** và video **không có tài trợ**; tài khoản doanh nghiệp chỉ được chọn nhạc từ Commercial Music Library (xem loại tài khoản trong `kenh/ho-so-kenh.md`). Không bịa tên bài hát cụ thể.

**Nhãn AI và đối tượng** (chính sách trong hồ sơ kênh, căn cứ ở `chinh-xac-va-ban-quyen.md` mục 9): TikTok bật "Nội dung do AI tạo" (video dùng giọng TTS). Mọi nền tảng có dòng "Giọng đọc: AI". Video có hình hoặc giọng mô phỏng người thật, hoặc cảnh AI tái hiện sự kiện có thật: bật nhãn AI trên **mọi** nền tảng (bắt buộc theo Nghị định 142/2026). YouTube không bắt buộc nhãn "nội dung thay đổi hoặc tổng hợp" với giọng TTS không mạo danh người thật. YouTube chọn "Không dành cho trẻ em".

## Định dạng `out/seo.md`

```markdown
# Đăng bài: <tên dự án>

## TikTok
- Caption: ...
- Hashtag: ...
- Chữ ảnh bìa: ... · Khung ảnh bìa: giây ...
- File: video-no-music.mp4 + nhạc thịnh hành (gợi ý: ...) | video.mp4

## Facebook Reels
- Caption: ...
- Hashtag: ...
- Chữ ảnh bìa: ... (đặt ở giữa khung)
- File: video.mp4

## Instagram Reels (nếu đăng)
- Caption: ...
- Hashtag: ...
- Chữ ảnh bìa: ... (đặt ở giữa khung)
- File: ...

## YouTube Shorts
- Tiêu đề: 1. ... (đề xuất) · 2. ... · 3. ...
- Mô tả:
  ...
- File: video.mp4

## Bình luận ghim
## Ghi công
## Lưu ý khi đăng
- TikTok: bật nhãn "Nội dung do AI tạo"; nhạc theo loại tài khoản.
- Mọi nền tảng: caption có dòng "Giọng đọc: AI".
- YouTube: "Không dành cho trẻ em"; bật "Paid promotion" nếu có tài trợ.
- Facebook: bật "Paid partnership" nếu có tài trợ.
```

Có thể dùng WebSearch để xem các video cùng chủ đề đang đặt caption, hashtag thế nào, nhưng không sao chép nguyên văn.
