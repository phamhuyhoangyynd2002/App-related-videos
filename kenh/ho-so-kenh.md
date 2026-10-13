# Hồ sơ kênh

> Điền bằng `/thiet-lap-kenh`. Mọi skill đọc file này trước khi hỏi người dùng, để không hỏi lại những gì đã biết.
> Các dòng `TODO` là chưa có thông tin. Căn cứ thị trường: [docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md](../docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md). Luật dùng chung: `.claude/rules/phong-cach-thuong-hieu.md`.
> Repo tạo ngày 12/10/2026, chuyển bộ công cụ từ kênh game Game Vừa Ví (`../Gaming-related-videos`). Không dùng lại tên, logo, linh vật, chữ ký âm thanh, câu ký tên của kênh game.

## Kênh
- Tên kênh: Anh Lười đây! (chốt 12/10/2026)
- Lời hứa thương hiệu: Anh Lười thử hết, bạn chỉ việc cài cái đáng cài. (suy ra từ tên kênh, cần xác nhận)
- Chủ đề cụ thể: giới thiệu, xếp hạng, đánh giá ứng dụng điện thoại (không phải game). Ngách hẹp: **"N ứng dụng ít người biết"** (khoảng trống rõ nhất, báo cáo thị trường mục 6) + series tháng "Top ứng dụng hay tháng N". Gợi ý từ báo cáo thị trường: "ứng dụng miễn phí thay ứng dụng trả phí", "N ứng dụng ít người biết", "Top ứng dụng hay của tháng", công cụ AI dùng được bằng tiếng Việt
- Khán giả chính: người dùng điện thoại 18–34 tuổi ở Việt Nam, dùng cả iPhone lẫn Android, muốn điện thoại làm hộ việc vặt mà không tốn tiền (suy ra, cần xác nhận). Không nhắm trẻ dưới 13 tuổi
- Quy mô hiện tại: mới (chưa có kênh, làm từ đầu)
- Mục tiêu chính: tăng người theo dõi
- Nền tảng: TikTok, YouTube Shorts, Facebook Reels (chính); Instagram Reels (đăng thêm)
- Kiến trúc kênh: một thương hiệu, mỗi nền tảng một tài khoản; chỉ mở kênh con khi có số liệu (điều kiện trong `.claude/rules/phong-cach-thuong-hieu.md`)
- Kênh có kiếm tiền (mục đích thương mại): không
- Trước khi bật kiếm tiền (YPP, tài trợ, affiliate): đổi dòng trên thành "có" và chuyển giọng đọc sang Azure
- Loại tài khoản TikTok: cá nhân

## Giọng và cách nói
- Giọng đọc: vi-VN-NamMinhNeural, tốc độ +40%
- Ghi chú giọng (13/10/2026, người làm video chốt): giọng nam vì kênh là "Anh Lười" (giọng nữ HoaiMy nghe không hợp). Tốc độ lấy trung bình bản +10% (3,3 âm tiết/giây, chậm) và +60% (4,8, quá nhanh): NamMinh +40% kèm rút nghỉ 0,17 giây (mặc định của rut_nghi.py) đo được 4,06 âm tiết/giây trên cả video (+50% ra 4,3). NamMinh gốc đọc chậm hơn HoaiMy nên cần % cao hơn
- Phát âm tên ứng dụng: lấy từ kenh/phat-am.json (chấm bằng thu_phat_am.py), không tự nghĩ phiên âm
- Ghi chú giọng đọc: ghi đúng dạng `Giọng đọc: vi-VN-<Tên>Neural, tốc độ +N%` để `kiem_tra_thuong_hieu.py` đọc được. Mẫu nghe thử từ kênh game ở `docs/mau-giong/`
- Dịch vụ giọng đọc: edge khi kênh chưa kiếm tiền; azure trước khi bật kiếm tiền (cần AZURE_SPEECH_KEY, AZURE_SPEECH_REGION). Dịch vụ trả phí (Vbee, FPT.AI, ElevenLabs) phải dùng gói có quyền thương mại và lưu bằng chứng vào `kenh/bang-chung/`
- Xưng hô: "mình" – "bạn" ("các bạn" khi nói với cả nhóm)
- Từ tục nhẹ: không dùng (kể cả "vãi"); "tao/mày" không dùng
- Giọng văn: người bạn rành công nghệ, hơi lười nên luôn tìm ứng dụng làm hộ, thử hết rồi mới khuyên, có chính kiến, nói cả điểm trừ. Chi tiết ở [cam-nang-phong-cach.md](cam-nang-phong-cach.md)
- Độ lầy mặc định: mức 3 (lầy) cho top-list, tier-list, video một ứng dụng; mức 2 cho tin tức; mức 1 cho tin bảo mật, lừa đảo, pháp lý (thang ở cẩm nang, mục 2). Đã chốt 12/10/2026
- Nhân vật: **Lười**, chữ L mắt lim dim trong logo, là "Anh Lười" trong lời đọc; 9 biểu cảm ở `templates/_shared/sticker/` (thiếu `duyet`), xem [nhan-vat.md](nhan-vat.md)
- Câu kêu gọi cố định (câu ký tên cuối mọi video): "Theo dõi Anh Lười, để điện thoại làm hộ bạn." (đề xuất, cần xác nhận). Phải có chữ "Theo dõi" để màn kết tự bật đúng lúc (template tìm từ "theo" cuối cùng)
- Từ, cụm từ không dùng: "siêu phẩm", "đỉnh của chóp", "cực phẩm", "không thể bỏ lỡ", "hay nhất mọi thời đại", "100% miễn phí", "kiếm tiền dễ dàng", "app thần thánh"
- Nhãn con dấu: "CÀI NGAY", "DÙNG THỬ", "CHỜ GIẢM GIÁ", "BỎ QUA"
- Nhãn AI: TikTok bật nhãn "Nội dung do AI tạo" cho video dùng giọng TTS; mọi nền tảng ghi dòng "Giọng đọc: AI" trong caption hoặc mô tả; bật nhãn AI trên mọi nền tảng khi video có hình hoặc giọng mô phỏng người thật (kể cả kết quả của ứng dụng AI), hoặc cảnh AI tái hiện sự kiện có thật (Nghị định 142/2026)

## Hình ảnh và âm thanh nhận diện
- Hệ thiết kế: `templates/_shared/frame.md` (màu, font hiện là bản kế thừa từ kênh game, làm lại khi có logo)
- Logo: `templates/_shared/logo.png` (chữ L không có hàng biểu tượng, viền trắng mảnh, dùng cho logo-bug 84px và màn kết); bản đầy đủ có hàng biểu tượng `logo-day-du.png` (ảnh bìa, ảnh đại diện); ảnh gốc `logo-nguon/logo-goc.png`. Công thức chuỗi kênh như logo Vừa. Tên kênh và lời hứa trên video đặt ở `BRAND_NAME`, `BRAND_TAG` trong `templates/_shared/appreel.js`
- Màu thương hiệu: xanh đêm `#132238`, bạc hà `#6FE3C1` (màu tên kênh), vàng đèn ngủ `#FFD84D`, cam san hô `#FF7A59` (`templates/_shared/frame.md`, 12/10/2026)
- Thiết bị quen thuộc: linh vật Lười; running gag "Anh Lười duyệt" (ứng dụng phải làm hộ được việc trong ít chạm hơn cách thủ công; đếm số chạm trên màn hình); con dấu phán quyết đúng một lần mỗi video
- Chữ ký âm thanh: `sfx/chu-ky.wav`, bản nháp 12/10/2026 (hai tiếng chạm màn hình + ba nốt đi lên, 0,95 giây, tạo bằng `python3 sfx/nguon/tao_sfx.py chu-ky`), khác chữ ký kênh game. TODO: người làm video nghe thử, chốt hoặc đổi
- Thang điểm riêng: TODO (gợi ý: "Điểm miễn phí" 1–5 = dùng được bao nhiêu mà không trả tiền, chấm theo tiêu chí ghi ở `kenh/series.md`)

## Nhịp sản xuất
- Số video mỗi ngày: 1 (đề xuất, cần xác nhận); tối đa 2 video mỗi ngày trên mỗi kênh trong giai đoạn 1
- Tỉ lệ nội dung (claude-youtube, kênh ưu tiên video ngắn): 50–60% series cố định, 25–30% bắt trend, 10–20% mẹo nhanh
- Chế độ mặc định của `/tao-video`: cong-tac
- Thiết bị quay màn hình: cả iPhone và Android. TODO: ghi đời máy để nói rõ trong video khi tính năng phụ thuộc máy
