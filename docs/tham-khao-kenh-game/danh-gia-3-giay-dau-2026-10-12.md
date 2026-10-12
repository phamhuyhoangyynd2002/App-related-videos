# Đánh giá 3 giây đầu của 7 video đã giao (12/10/2026)

## Tín hiệu từ nền tảng

Người làm video báo ngày 12/10/2026: một video đã đăng có khoảng **400 lượt xem** nhưng tổng thời gian xem chỉ **0,3–0,4 giờ**. Chưa rõ là video nào, trên nền tảng nào, và chưa có biểu đồ giữ chân.

- Thời gian xem trung bình mỗi lượt: 0,3–0,4 giờ = 1.080–1.440 giây, chia 400, ra **2,7–3,6 giây**.
- Video của kênh dài 46–167 giây, nên mỗi lượt chỉ xem được **khoảng 2–8%** độ dài video.

Nghĩa là phần lớn người được nền tảng gợi ý đã lướt đi trong 1–3 giây đầu. Vấn đề nằm ở khung đầu và hook, chưa phải ở thân bài hay độ dài: chưa ai ở lại đủ lâu để thấy thân bài. 400 lượt là nhóm thử nghiệm nền tảng phát cho tài khoản mới. Lướt đi nhanh như vậy thì video không được đẩy tiếp.

## Đo trên chính các video

Cắt khung ở 0 / 0,5 / 1 / 1,5 / 2 / 3 giây từ `out/video.mp4` của từng dự án (ảnh: `danh-gia-3-giay-dau-2026-10-12/`).

| Video | Nền tối trơn ở giây 0 | Hình đổi từ 0 đến 2s (không tính phụ đề) | Dài |
|---|---|---|---|
| 09-28 thể loại tốn ví (tier-board) | 89% | 1,9% | 131s |
| 10-01 game offline không nạp (tier-board) | 83% | 0,3% | 163s |
| 10-03 Android có, iPhone không (tier-board) | 58% | 19,4% | 167s |
| 10-05 iPhone có, Android không (tier-board) | 63% | 16,8% | 144s |
| 10-05 top 3 game Việt (top-list) | 53% | 3,3% | 80s |
| 10-09 game offline ván ngắn (top-list) | 58% | 5,9% | 46s |
| 10-12 game Việt lên top tập 2 (top-list) | 67% | 4,4% | 75s |

Cách đo:
- **Nền tối trơn**: tỉ lệ ô 24px có độ sáng < 45 và gần như không có chi tiết.
- **Hình đổi**: tỉ lệ điểm ảnh đổi rõ (chênh > 40) giữa giây 0 và giây 2, bỏ dải phụ đề (60–70% chiều cao).

Đây là phép đo thô, dùng để so các video với nhau, không phải chuẩn tuyệt đối.

## Những gì thấy được

1. **3 giây đầu gần như đứng yên.** 5/7 video đổi dưới 6% khung trong 2 giây đầu. Chỉ phụ đề chạy, còn băng chữ hook và hình giữ nguyên tới hết cảnh intro (5,7–9,1 giây). Kênh có luật "đổi hình mỗi 1,5–2 giây", nhưng chỗ cần nhất lại không làm.
2. **Hình game nhỏ, nền tối chiếm phần lớn khung.**
   - 53–89% khung ở giây 0 là nền tối trơn.
   - Hai video tier-board đầu (09-28, 10-01) gần như **không có hình game** ở giây 0, chỉ có bảng tier rỗng và băng chữ.
   - Trong feed toàn video tràn khung, khung của mình trông như một slide.
3. **Hook nói khái niệm, không chỉ vào một thứ cụ thể.** "VÍ MỎNG CHƠI HỆ NÀO?", "FREE NHẤT: KHÔNG CÓ IPHONE", "ANDROID CÓ · IPHONE KHÔNG" nói về thể loại hay nền tảng. Không có một game quen mặt, một khoảnh khắc, một biểu cảm để mắt bám vào.
4. **Ba lớp hook cùng nói một câu.** Chữ hook, lời đọc và phụ đề lặp cùng một ý ("Một ván thôi… hết pin" ở cả ba lớp). Luật kênh yêu cầu "chữ trên màn hình không lặp nguyên văn lời đọc", nhưng chưa có kiểm tra tự động cho hook.
5. **Lời hứa và giải thích chiếm giây 2–6.** "Sáu game, xếp từ thấp tới ba S…", "Ba game Việt đang leo top, xem cái nào hợp bạn" rơi đúng lúc người xem đang quyết định lướt.
6. **Không có hình chuyển động.** Game điện thoại chỉ có ảnh cửa hàng (ảnh tĩnh). Kênh mẫu (Nghé) chạy gameplay thật gần như suốt (`docs/phan-tich-video-mau-2026-09.md`: "Gameplay chạy gần như liên tục" so với "Chủ yếu thẻ chữ, ảnh tĩnh"). Khác biệt này đã ghi từ 09/2026 nhưng quy trình chưa có cách bù cho giây đầu.
7. Giọng TTS và hai video tier-board 160 giây cũng có thể góp phần, nhưng chưa đo được: với 3 giây trung bình, chưa ai nghe đủ giọng hay xem đủ độ dài để hai yếu tố này quyết định.

## Đề xuất cho quy trình (chờ người làm video duyệt)

**A. Cổng "3 giây đầu"** trước DỪNG 2 (bản phác) và trước DỪNG 3 (bản render). Cắt 6 khung 0 → 3s, trình thành một dải ảnh, kiểm:
- hình game chiếm ≥ 50% khung ở giây 0;
- ít nhất 2 lần đổi hình trong 3 giây đầu;
- chữ hook không trùng lời đọc;
- có một vật cụ thể để mắt bám (game quen, khoảnh khắc, biểu cảm của Vừa);
- lời hứa, giải thích không rơi vào 0–3s.

**B. Viết hook theo "một khoảnh khắc cụ thể"**:
- giây 0–1,5 là một khoảnh khắc của game hạng 1 (hình to + một câu ≤ 8 từ);
- chữ hook nói cái được mất, lời đọc nói cú lật;
- danh sách, tiêu chí đẩy ra sau giây 3, hoặc bỏ.

**C. Sửa intro của template**:
- giây 0 hình game tràn ≥ 60% khung;
- đổi hình 0,7–1 giây/lần trong 3 giây đầu (dùng `cat-nhay`, `chia-o` của kiểu hình ngay ở hook);
- Vừa phản ứng ở 1–1,5s;
- băng chữ hook gọn lại để không che hình.

**D. Gameplay tự quay cho 2–3 giây đầu** (`/cat-gameplay`): đòn bẩy lớn nhất để có chuyển động thật mà không vi phạm bản quyền. Cần người làm video quay vài giây game hạng 1.

**E. Thử độ dài** khi giữ chân giây đầu đã ổn: bản gọn 30–45 giây so với bản đầy đủ.

## Cần thêm số liệu

Mỗi video, mỗi nền tảng:
- lượt xem;
- thời gian xem trung bình;
- tỉ lệ xem hết;
- ảnh chụp biểu đồ giữ chân;
- trên YouTube Shorts: "Đã xem / Đã vuốt đi".

Ghi vào `projects/<dự án>/so-lieu.md`. Bài học chỉ chốt khi có từ 3 video cùng xu hướng.
