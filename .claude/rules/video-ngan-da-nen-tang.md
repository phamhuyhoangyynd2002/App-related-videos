# Video ngắn dọc cho TikTok, YouTube Shorts, Facebook Reels

Định dạng chính của kênh là **video ngắn dọc 9:16**. Một video được làm một lần, đăng lên các nền tảng ghi trong `kenh/ho-so-kenh.md`: TikTok, YouTube Shorts, Facebook Reels (chính) và Instagram Reels (đăng thêm). Facebook được ưu tiên hơn Instagram vì ở Việt Nam Facebook có 79,0 triệu người dùng, Instagram chỉ 11,7 triệu (DataReportal, số liệu 10/2025). Khung ngang 16:9 chỉ làm khi người dùng yêu cầu rõ.

## Thông số chung

| Mục | Giá trị |
|---|---|
| Khung hình | 1080×1920, 9:16, 30 fps, H.264 + AAC |
| Độ dài | **Bản nhanh 13–25 giây** (một ý), **bản gọn 45–60 giây** (3 mục), **bản đầy đủ 2–3 phút** (danh sách, tier-list; mặc định kế thừa từ kênh game, `docs/tham-khao-kenh-game/phan-tich-video-mau-2026-09.md`; cần kiểm lại bằng số liệu của kênh ứng dụng). Tránh kéo một ý thành 30–40 giây. **Trần cứng 5 phút** |
| Độ dài "bản dài" | 3–5 phút, chỉ khi người dùng yêu cầu. Quá 3 phút thì YouTube không xếp vào Shorts (thành video thường khung dọc) và Instagram Reels không nhận; ghi rõ ở bước SEO. Kiểm tra lại giới hạn hiện hành của từng nền tảng |
| Số mục trong top-list | 3 mục cho 45–60 giây, 5–7 mục cho 2–3 phút (mỗi mục 20–25 giây), tối đa 10 mục cho 5 phút |
| Âm lượng | Khoảng −14 LUFS, true peak ≤ −1 dBTP |
| Đầu ra | `out/video.mp4` (có nhạc) và `out/video-no-music.mp4` (chỉ giọng đọc, để người dùng tự thêm nhạc thịnh hành trong ứng dụng) |

## Vùng an toàn (gộp các nền tảng, khung 1080×1920)

Giao diện của các ứng dụng che mất một phần màn hình: tab phía trên; nút thích, bình luận, chia sẻ bên phải; tên kênh, caption, tên nhạc phía dưới. Chữ quan trọng, phụ đề và thứ hạng phải nằm trong vùng:

- Trên: chừa **250px**
- Dưới: chừa **450px**
- Phải: chừa **150px**
- Trái: chừa **60px**

Đây là số liệu tham khảo. Khi tạo template, chụp khung hình có lớp phủ vùng an toàn để tự kiểm tra.

## Nền tảng chấm video bằng gì

Theo Shorts playbook của claude-youtube (số liệu tổng hợp 2024–2025, dùng làm định hướng, không phải luật):

| Thứ tự | Tín hiệu | Ngưỡng tham khảo |
|---|---|---|
| 1 | Tỉ lệ xem hết | ≥ 70% thì được đẩy mạnh |
| 2 | Xem lặp lại | Thời lượng xem trung bình > 100% là dấu hiệu tốt |
| 3 | Bình luận, chia sẻ | Nặng ký hơn lượt thích |
| 4 | Tỉ lệ không lướt qua ngay | ≥ 75% tốt; < 60% là hook hỏng |

Hệ quả cho kịch bản: 1–3 giây đầu quyết định tất cả; cái kết nối được về đầu để xem lặp; câu hỏi cuối để kéo bình luận. Tỉ lệ nhấp ảnh bìa gần như không quan trọng với video ngắn vì video tự phát trong feed: **khung hình đầu chính là ảnh bìa**.

Khác: video ngắn mất dần lực đẩy sau khoảng 4 tuần, và có thể bật lên muộn tới ngày thứ 4 sau khi đăng. Vì vậy làm đều quan trọng hơn làm một video thật công phu.

## Series quan trọng hơn video lẻ

Kênh ưu tiên video ngắn nên có khoảng 50–60% video thuộc series cố định (cùng cấu trúc, đánh số tập), 25–30% bắt trend, 10–20% mẹo nhanh. Người xem nhận ra series sẽ xem liên tiếp nhiều video, và nền tảng thưởng cho điều đó. Series được định nghĩa trong `kenh/series.md`.

## Giữ chân người xem

- **Giây 0 đã có nội dung**: khung đầu tiên có sẵn chữ hook và hình ứng dụng (tốt nhất là kết quả bất ngờ nhất khi dùng thử). Không mở bằng logo, màn hình đen, fade-in chậm, hay câu chào.
- **Hook trong 1–2 giây đầu**, gồm cả 3 lớp: lời đọc, chữ lớn trên màn hình, hình ảnh gây tò mò. Nhiều người lướt khi đang tắt tiếng, nên chữ phải tự đứng được.
- **Mở vòng tò mò** ngay đầu và chỉ đóng ở cuối, ví dụ: "ứng dụng cuối cùng thay được ba ứng dụng trả phí".
- **Đổi hình mỗi 1,5–2 giây** (chốt 29/09/2026, nhanh hơn trước): đổi screenshot, zoom, thẻ thông tin bật lên, khung đập nhẹ ở từ khoá. Không để một khung hình đứng yên quá 2,5 giây.
- **Đọc nhanh, nghỉ ngắn**: giọng khoảng 4,5–5 từ/giây như các video mẫu; nghỉ giữa các cảnh 0,05 giây (`build_timeline.py --gap 0.05 --tail 0.3`).
- **Nhịp đọc nhanh**: câu ngắn, không có câu đệm. Cắt mọi câu không mang thông tin mới.
- **Kết thúc có thể lặp vòng**: câu cuối nối được về câu đầu, hoặc kết bằng câu hỏi để kéo bình luận. Không để 2–3 giây im lặng ở cuối.
- **Lời kêu gọi ngắn và trung tính**, dùng được trên mọi nền tảng: "Theo dõi để xem phần tiếp theo", không nói "bấm chuông", "đăng ký kênh YouTube", "follow TikTok".

## Nội dung hợp nền tảng

- Có **quan điểm rõ ràng**: xếp hạng dám chọn và giải thích ngắn gọn. Quan điểm gây tranh luận nhẹ sẽ kéo bình luận, nhưng không được sai sự thật hay công kích người khác.
- Ưu tiên nội dung **làm được thành series** ("Ứng dụng ít người biết – phần 3"), giúp người xem quay lại.
- Không nhắc tên nền tảng khác trong video, không để watermark hay logo TikTok, YouTube, Facebook, Instagram trong file. Nền tảng có thể giảm hiển thị video mang watermark của đối thủ.
- Nền tảng hạ hiển thị hoặc tắt kiếm tiền với video làm hàng loạt theo khuôn và video đăng trùng giữa nhiều kênh: làm theo mục "Nội dung gốc" và "Hệ thống kênh" trong `.claude/rules/phong-cach-thuong-hieu.md`.
- Tránh nội dung người lớn của ứng dụng 17+ (hẹn hò, mạng xã hội ẩn danh), vì dễ bị giới hạn hiển thị.
- Không giật tít sai nội dung. Tiêu đề, caption và chữ ảnh bìa phải khớp với video.
- Giọng đọc là TTS, một giọng cho toàn hệ thống (xem hồ sơ kênh; Azure khi kênh kiếm tiền). Không mạo danh giọng người thật. Nhãn AI theo chính sách trong hồ sơ kênh; căn cứ ở `.claude/rules/chinh-xac-va-ban-quyen.md` mục 9.

## Khác biệt giữa các nền tảng (xử lý ở bước SEO, không ở video)

| | TikTok | YouTube Shorts | Facebook Reels | Instagram Reels (đăng thêm) |
|---|---|---|---|---|
| Khán giả Việt Nam (DataReportal, 10/2025) | 76,1 triệu người từ 18 tuổi | 62,1 triệu | 79,0 triệu, lớn nhất; giữ được nhóm 25–34 | 11,7 triệu, 56,7% là nữ |
| Chữ đăng kèm | Caption ngắn, từ khoá ở đầu (TikTok được tìm kiếm như công cụ tìm kiếm) | Tiêu đề ngắn, có từ khoá | Caption 1–2 câu, dòng đầu có từ khoá, kết bằng câu hỏi | Caption 1–2 câu + câu hỏi |
| Hashtag | 3–5 | 2–3, có `#Shorts` | 3–5 | 3–5 |
| Ảnh bìa | Chọn khung hình + chữ bìa | Chọn khung hình trong ứng dụng | Chọn khung hình, chữ bìa đặt giữa khung | Ảnh bìa hiện trên lưới 3:4 nên chữ nằm giữa |
| Nhạc | Tài khoản cá nhân: có thể dùng `video-no-music.mp4` + nhạc thịnh hành. Tài khoản doanh nghiệp hoặc video có tài trợ: chỉ Commercial Music Library | Dùng `video.mp4` với nhạc không bản quyền của kênh. Theo claude-youtube, gắn bài hát từ thư viện nhạc có bản quyền của Shorts sẽ chia bớt doanh thu của video; nên kiểm tra chính sách hiện hành | Dùng `video.mp4` (nhạc có giấy phép của kênh) | Tương tự TikTok |
| Tiêu đề | – | 20–40 ký tự (khoảng 40 ký tự đầu mới hiện), từ khoá ở đầu | – | – |
| Lưu ý riêng | Người xem có thể kéo thanh để xem ít nội dung AI hơn (từ 11/2025) | Từ 01/02/2027, cần 10 triệu lượt xem Shorts hợp lệ trong 90 ngày mới được chia doanh thu Shorts | Meta coi video đăng lại, chỉ thêm viền, phụ đề hay đổi tốc độ là không nguyên bản (13/03/2026) | Như Facebook Reels |
