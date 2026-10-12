---
name: goi-y-chu-de
description: Gợi ý 10 chủ đề video ứng dụng điện thoại ngắn tiếp theo, xếp hạng theo độ nóng, độ hợp kênh, khả năng làm nhanh, khả năng thành series và độ dễ tiếp cận, dựa trên bảng xếp hạng App Store Việt Nam, ứng dụng mới, ứng dụng AI, tin ứng dụng, mùa vụ và bài học từ số liệu kênh. Dùng khi người dùng hỏi "nên làm video gì", "gợi ý chủ đề", "lên lịch tuần này", hoặc chưa có chủ đề cho /tao-video.
argument-hint: "[số ý tưởng] [khoảng thời gian, ví dụ: tuần này]"
---

# Gợi ý chủ đề

Chuyển thể từ sub-skill `ideate` và `calendar` của claude-youtube, qua kênh game, sang kênh ứng dụng. Không cần API trả phí.

## Đầu vào

- `kenh/ho-so-kenh.md` (chủ đề kênh, khán giả, lời hứa), `kenh/series.md`, `kenh/bai-hoc.md`.
- Bản tin mới nhất `ke-hoach/ban-tin/<ngày>/ban-tin.md` và `ke-hoach/ban-tin/theo-doi.md` (skill `ban-tin-tuan`) nếu có: dùng làm tín hiệu chính, không quét lại các nguồn đó. Chưa có bản tin trong 7 ngày thì chạy `bang_xep_hang.py` để có bảng App Store mới.
- Tên các dự án trong `projects/` 30 ngày gần nhất, để không trùng chủ đề.
- `docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md` mục 6: các dạng nội dung nước ngoài có mà Việt Nam ít.
- `docs/tham-khao-kenh-game/phan-tich-kenh-mau-2026-09-30.md` mục 7: công thức đặt tên chủ đề dễ phổ cập, bảng chọn tương tác chính (rút từ kênh game, dùng được cho ứng dụng).

## Thu thập tín hiệu

1. **App Store VN** (`du-lieu/bang-xep-hang.md` của bản tin, hoặc chạy script): ứng dụng MỚI, tăng hạng mạnh, ứng dụng AI, ứng dụng mới phát hành đã lọt top.
2. **Tin mới** (WebSearch, 3–5 truy vấn): cập nhật lớn của iOS, Android, ứng dụng phổ biến (Zalo, ngân hàng, VNeID, CapCut, ChatGPT, Gemini); ứng dụng đang lan trên mạng; cảnh báo lừa đảo. Ít nhất 1 truy vấn tiếng Việt.
3. **Mùa vụ**: năm học mới (ứng dụng học tập), mùa thi, Tết (ứng dụng chỉnh ảnh, đặt vé), mùa du lịch, đợt giảm giá gói trả phí (Black Friday), sự kiện Apple, Google ra hệ điều hành mới.

## Loại khỏi danh sách

- Chủ đề thuộc danh sách "không giới thiệu" của `.claude/rules/chinh-xac-va-ban-quyen.md` mục 7: bản bẻ khoá, APK/IPA mod, phim lậu, theo dõi lén, cho vay không phép, "kiếm tiền online", cờ bạc, vượt chặn.
- Chủ đề chỉ làm được bằng hình rò rỉ, hoặc không tự cài, tự quay được (ứng dụng chỉ có ở nước khác, cần tài khoản doanh nghiệp).
- Chủ đề nhắm trẻ dưới 13 tuổi, hoặc không nói được với khán giả điều gì theo lời hứa trong hồ sơ kênh.

Ưu tiên nhét ý tưởng vào series có sẵn trong `kenh/series.md` (kể cả series "đề xuất").

Đặt tên chủ đề theo **việc người xem cần làm**, không theo tên ứng dụng: [việc] + [giới hạn: miễn phí / không quảng cáo / tiếng Việt / máy yếu] + [dạng: top, ít người biết, so tài]. Ví dụ "Quét tài liệu miễn phí, không quảng cáo: 3 ứng dụng". Tên chủ đề là câu người xem sẽ gõ tìm kiếm; trừ video một ứng dụng đang hot.

## Chấm điểm (mỗi tiêu chí 1–5, tổng /25)

| Tiêu chí | Câu hỏi |
|---|---|
| Độ nóng | Người xem có đang tìm hoặc bàn về chủ đề này không? Trend ngắn thì phải làm trong tuần |
| Hợp kênh | Đúng chủ đề, góc nhìn, khán giả trong hồ sơ kênh không? |
| Làm nhanh | Tự cài, tự quay được trong ngày, có trang cửa hàng và nguồn tin không? |
| Thành series | Có thể thành "phần 1, phần 2…" hoặc nhét vào series có sẵn không? |
| Dễ tiếp cận | Người chưa biết ứng dụng nào trong video vẫn hiểu chủ đề ngay không? Có chạm một việc thật của người xem (bộ nhớ, pin, quảng cáo, học, làm, chỉnh ảnh) không? |

Cộng hoặc trừ điểm theo `kenh/bai-hoc.md`.

## Kết quả: `ke-hoach/y-tuong-<YYYY-MM-DD>.md`

Mỗi ý tưởng gồm:

| Mục | Nội dung |
|---|---|
| Chủ đề | Câu lệnh sẵn để chạy: `/tao-video <chủ đề> [ý chính]` |
| Loại | series (tên series) / bắt trend / mẹo nhanh / cảnh báo |
| Template, độ dài | ví dụ top-list 45–60 giây, hoặc news 13–25s |
| Hook đề xuất | Một câu, ghi kiểu hook |
| Cần quay | Thao tác nào phải tự quay, trên máy nào |
| Tương tác chính | lưu / chia sẻ / bình luận, và điều gì kéo tương tác đó (video ứng dụng hay được **lưu** để dùng sau) |
| Vì sao | Tín hiệu cụ thể (ví dụ: "MỚI vào top 20 miễn phí App Store VN ngày 12/10") |
| Hạn | Làm trong tuần (trend) / bất kỳ lúc nào (lâu dài) / trước ngày X (mùa vụ) |
| Điểm | x/25 |

Nếu người dùng hỏi lịch, sắp xếp thành bảng theo ngày, giữ tỉ lệ trong hồ sơ kênh (khoảng 50–60% series, 25–30% trend, 10–20% mẹo nhanh), trend xếp trước.

Kết thúc bằng: 3 ý tưởng nên làm ngay, và câu lệnh để bắt đầu ý tưởng số 1.
