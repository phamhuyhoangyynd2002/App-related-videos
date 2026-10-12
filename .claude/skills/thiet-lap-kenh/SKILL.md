---
name: thiet-lap-kenh
description: Thiết lập hoặc cập nhật hồ sơ kênh (kenh/ho-so-kenh.md) và hệ thiết kế video (templates/_shared/frame.md) để mọi video sau dùng chung giọng, màu, font, logo, câu kêu gọi mà không phải hỏi lại. Dùng khi mới bắt đầu dự án, khi người dùng đổi nhận diện kênh (màu, logo, font, giọng đọc), hoặc khi hồ sơ kênh còn dòng TODO.
argument-hint: "[thông tin kênh, link kênh, hoặc thay đổi cụ thể]"
---

# Thiết lập kênh

Đầu vào: `$ARGUMENTS`. Làm một lần, cập nhật khi cần. Mục tiêu là để `/tao-video` không bao giờ phải hỏi lại những điều đã biết về kênh.

## 1. Hồ sơ kênh (`kenh/ho-so-kenh.md`)

Đọc file hiện có. Với các dòng `TODO`, hỏi **một lần** bằng AskUserQuestion (tối đa 4 câu, mỗi câu có phương án đề xuất). Câu hỏi quan trọng nhất (theo claude-youtube, trước mọi tư vấn đều cần 3 điều này):
1. Chủ đề cụ thể của kênh ("ứng dụng miễn phí thay ứng dụng trả phí", không chỉ "ứng dụng"). Gợi ý ngách ở `docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md` mục 6.
2. Quy mô hiện tại: mới / đang lớn / ổn định / lớn.
3. Mục tiêu chính: tăng người theo dõi / kiếm tiền / uy tín / tương tác.

Ngoài ra hỏi hai điều ảnh hưởng tới bản quyền: kênh có kiếm tiền không (nếu có: bắt buộc Azure TTS), và loại tài khoản TikTok (cá nhân hay doanh nghiệp: doanh nghiệp chỉ được dùng Commercial Music Library).

Điều gì suy ra được (từ link kênh, video mẫu người dùng đưa) thì tự điền và ghi "(suy ra, cần xác nhận)".

Kênh ứng dụng mới chuyển bộ công cụ từ kênh game (12/10/2026), nên lần thiết lập đầu còn phải chốt phần nhận diện riêng. Hỏi thêm (gộp vào cùng lần hỏi nếu còn chỗ, không thì lần hỏi thứ hai):
- Tên kênh, lời hứa thương hiệu, câu ký tên (phải có chữ "Theo dõi").
- Giọng văn và độ lầy mặc định (đề xuất: mức 3 như kênh game), xưng hô, tên cộng đồng; điền mục 1, 7 của `kenh/cam-nang-phong-cach.md`.
- Có linh vật không; nếu có thì theo `kenh/nhan-vat.md` (tạo từ logo, file `linh-vat-<biểu-cảm>.png`).
- Nhãn con dấu (mặc định `"CÀI NGAY"`, `"DÙNG THỬ"`, `"CHỜ GIẢM GIÁ"`, `"BỎ QUA"`), ghi vào dòng "Nhãn con dấu" bằng ngoặc kép; validator và template đọc từ đó. Đổi nhãn thì sửa luôn `STAMP_COLORS` trong `templates/_shared/appreel.js`.
- Thiết bị quay màn hình (iPhone, Android).

Sau khi có tên kênh và lời hứa, sửa `BRAND_NAME`, `BRAND_TAG` trong `templates/_shared/appreel.js` (logo-bug và màn kết đọc từ đó). Tạo chữ ký âm thanh mới `sfx/chu-ky.wav` bằng `sfx/nguon/tao_sfx.py` (khác chữ ký của kênh game) và ghi vào `sfx/GIAY-PHEP.md`.

## 2. Hệ thiết kế (`templates/_shared/frame.md`)

Làm theo quy trình hai lượt của anthropics/frontend-design, áp vào video:

**Lượt 1, lập kế hoạch**, bám vào chủ đề kênh chứ không dùng mặc định:
- Màu: 4–6 màu có tên và mã hex (nền, nền phụ, chữ, accent, accent phụ, viền).
- Chữ: 1–2 font, **bắt buộc có đủ dấu tiếng Việt** (Be Vietnam Pro, Montserrat, Inter, Lexend, Nunito đều ổn). Font trang trí thường thiếu dấu: chỉ dùng cho số.
- Nguyên tắc: chỗ nào "táo bạo" (thường là số thứ hạng), phần còn lại tiết chế.

**Lượt 2, tự phản biện**: so kế hoạch với các lối mặc định hay gặp của thiết kế do AI tạo (nền đen với một màu neon duy nhất, nền kem với accent đất nung, thẻ bo góc giống hệt nhau, nhãn chữ in hoa giãn chữ khắp nơi). Nếu kế hoạch rơi vào một lối mặc định mà không có lý do từ chủ đề kênh, sửa và nói đã đổi gì.

Nếu đã cài plugin HyperFrames, có thể cho người dùng xem các preset trong `hyperframes-creative/frame-presets/` (mở `frame-showcase.html`) để chọn bằng mắt, rồi phối lại bằng màu kênh.

Ghi `templates/_shared/frame.md` theo định dạng của HyperFrames: frontmatter (`colors`, `typography`, `spacing`, `motion`, `components`) là giá trị bắt buộc, phần chữ bên dưới giải thích ý đồ. Giữ các khoá mà template đang dùng (`ground`, `accent`, `hook`, `rank`, `caption`…).

## 3. Tài nguyên

- Tải file font (TTF/WOFF2) vào `templates/_shared/fonts/` kèm file giấy phép (ví dụ `OFL.txt`), ghi vào `templates/_shared/fonts/GIAY-PHEP.md`, và khai báo `@font-face` trong `templates/_shared/brand.css`. Chỉ dùng font cho phép thương mại và nhúng (SIL OFL…).
- Logo: `templates/_shared/logo.png`, nền trong suốt. Nếu người dùng chưa có, ghi TODO; template tự ẩn ảnh logo và chỉ hiện tên kênh dạng chữ.
- Logo kênh không được giống logo, tên ứng dụng, nhà phát triển, Apple, Google, hay của kênh game Game Vừa Ví.
- Nhạc nền: người dùng đặt nhạc vào `music/` và **ghi từng file vào `music/GIAY-PHEP.md`** (nguồn, giấy phép, có cho thương mại không, ghi công, bằng chứng). Hiệu ứng âm thanh (tuỳ chọn) tương tự với `sfx/GIAY-PHEP.md`; cấm âm thanh meme cắt từ phim, TV, game, hệ điều hành. File không có trong sổ sẽ bị chặn khi kiểm tra.

## 4. Kiểm tra

Nếu đã có template, chạy lại `/xuat-video` trên một dự án mẫu và mở khung t = 0 để người dùng xem nhận diện mới. Báo ngắn gọn những gì đã đổi.
