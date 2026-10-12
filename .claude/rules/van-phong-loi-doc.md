# Văn phong lời đọc và chữ trên màn hình

Áp dụng cùng `.claude/rules/video-ngan-da-nen-tang.md` (nhịp, hook, giữ chân người xem).

## Lời đọc (`narration`)

- Tiếng Việt tự nhiên, giọng một người bạn rành công nghệ kể cho bạn bè nghe; xưng hô theo `kenh/ho-so-kenh.md`.
- Giọng văn của thương hiệu chốt bằng `/thiet-lap-kenh` (chi tiết trong `kenh/ho-so-kenh.md` và `kenh/cam-nang-phong-cach.md`). Dù giọng nào cũng phải có chính kiến và nói cả điểm trừ (quảng cáo, gói trả phí, quyền truy cập, chưa có tiếng Việt). Mỗi video nói rõ ai nên dùng, ai không nên. Không dùng các từ trong danh sách "không dùng" của hồ sơ kênh (`validate_script.py` cảnh báo).
- **Nhịp cười** theo độ lầy trong `brief.md` (thang ở cẩm nang, mục 2): mức 3 mặc định có một nhịp cười (punchline hoặc gag hình) mỗi 5–6 giây. Punchline đứng thành câu riêng 1–4 chữ sau một câu dài ("…rồi một con quái lao ra. Hết."); dùng "…" trước chữ bất ngờ để TTS ngừng. Nói quá phải rõ là đùa, không đùa bằng số liệu nghe như thật mà sai.
- Lời đọc nói thêm những điều hình không nói. Không thuật lại những gì người xem đã thấy trên màn hình: Meta coi đó là nội dung không nguyên bản.
- Phán quyết gồm nhãn con dấu và lý do, nói gọn trong 1–2 câu ngắn, ví dụ: "Chờ giảm giá. Hay, nhưng chín tiếng chơi thì giá này hơi cao."
- Bản nhanh, bản gọn: mỗi cảnh 1–3 câu, cảnh hook 1,5–3 giây, cảnh khác 3–8 giây (khoảng 8–25 từ). Bản đầy đủ (2–3 phút): mỗi ứng dụng một cảnh 15–30 giây, kể theo công thức 5 nhịp trong skill `viet-kich-ban` (chuyển mục cài tò mò → tên + tóm ý → tình huống dùng thử "đang… thì…" → một câu "nhưng" → câu chốt điệp khúc). Mỗi câu một ý, tối đa 15 từ.
- **Kể tình huống, không đọc bảng số liệu**: tối đa một con số đọc thành lời mỗi ứng dụng; số khác lên thẻ `facts`. Không đọc lại mô tả trên cửa hàng. Dùng nói quá có hình ảnh, đảo vai, liệt kê ba nhịp, tương phản "nhìn thì… nhưng…" (ví dụ từ kênh game ở `docs/tham-khao-kenh-game/phan-tich-video-mau-2026-09.md`).
- Lầy, có năng lượng nhưng sạch: không "tao/mày", không chửi thề, không tên hạng tục tĩu (thay bằng running gag hạng thấp nhất, cẩm nang mục 5). Từ tục nhẹ chỉ khi hồ sơ kênh cho phép, tối đa 1 lần mỗi video, chỉ trong punchline, không ở cảnh hook.
- **Câu đầu tiên là hook**, tối đa 12 từ: gây tò mò hoặc hứa một điều cụ thể. Không mở đầu bằng "Xin chào các bạn", "Chào mừng quay lại kênh".
- Không dùng câu đệm: "như các bạn đã biết", "không để các bạn chờ lâu", "chúng ta cùng tìm hiểu".
- Viết cho tai nghe, không phải cho mắt đọc:
  - Số tiền viết thành chữ dễ đọc: "188.000đ" → "một trăm tám mươi tám nghìn đồng" hoặc "gần hai trăm nghìn".
  - Ngày tháng: "12/09/2026" → "ngày mười hai tháng chín".
  - Điểm số: "9/10" → "chín trên mười".
  - Viết tắt phải đọc được: "AI" → "ây ai", "iOS" → "ai ô ét", "VPN" → "vi pi en", "OCR" → "nhận diện chữ trong ảnh" (lần đầu). Phụ đề tự đổi lại thành ký hiệu (`CAPTION_DISPLAY` trong `build_timeline.py`).
  - Dung lượng: "1,2 GB" → "một phẩy hai gi ga"; giá gói: "99.000đ/tháng" → "chín mươi chín nghìn một tháng".
- Tên ứng dụng giữ nguyên như trên cửa hàng. Nếu tên khó đọc với giọng Việt, thêm phiên âm trong trường `pronunciation` của cảnh (không đưa vào `narration`).
- Không dùng ký tự đặc biệt trong lời đọc: `#`, `&`, `/`, `→`, emoji, ngoặc kép kiểu “ ”.
- Cảnh cuối: đóng vòng tò mò, nêu quan điểm của kênh, câu hỏi hoặc câu khích kéo bình luận (có thể trêu nhẹ: "Ai thấy xếp sai thì vào cãi, mình đọc hết."), rồi câu ký tên cố định trong hồ sơ kênh. Không nhắc tên nền tảng, không nói "đăng ký kênh", "bấm chuông", "follow".

## Chữ trên màn hình (`on_screen_text`)

- Tối đa 6 từ, hoặc 28 ký tự với video dọc, 40 ký tự với video ngang.
- Được viết HOA, dùng số và ký hiệu (`#5`, `188.000đ`, `9/10`).
- Không lặp nguyên văn lời đọc. Chữ trên màn hình là điểm nhấn, không phải phụ đề.
- Là lớp nội dung cho người đang **tắt tiếng**: chỉ đọc chữ trên màn hình qua các cảnh vẫn phải hiểu được video nói gì.
- Nhãn con dấu phán quyết là chữ cố định: `CHƠI NGAY`, `CHỜ GIẢM GIÁ`, `CHƠI THỬ`, `BỎ QUA`. Không tự đặt nhãn khác.

## Thẻ thông tin (`facts`)

- Tối đa 3 thẻ mỗi cảnh. Nhãn ngắn: "Phát hành", "Giá", "Điểm", "Nền tảng", "Thể loại".
- Giá trị dạng hiển thị: `12/09/2026`, `188.000đ`, `PC · PS5`.

## Phụ đề

- Phụ đề lấy từ mốc thời gian của giọng đọc, highlight từ đang đọc.
- Video dọc: mỗi lần hiện 1–2 từ (chốt 30/09/2026, học Nghé; không tách đôi từ ghép), 1 dòng, chữ to đậm có viền, một từ khoá mỗi câu tô vàng và to hơn, đặt khoảng 60–70% chiều cao màn hình (trên vùng caption của ứng dụng). Video ngang: tối đa 8 từ, 2 dòng. `build_timeline.py` và template đang nhóm 2–4 âm tiết; sẽ đổi ở đợt dựng gag.
