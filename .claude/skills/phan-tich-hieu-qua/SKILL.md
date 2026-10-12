---
name: phan-tich-hieu-qua
description: Phân tích số liệu các video đã đăng trên TikTok, YouTube Shorts, Facebook/Instagram Reels (lượt xem, tỉ lệ lướt qua, tỉ lệ xem hết, thời lượng xem trung bình, bình luận, chia sẻ) rồi rút bài học ghi vào kenh/bai-hoc.md để video sau tốt hơn. Dùng khi người dùng dán số liệu, ảnh chụp thống kê, hỏi "video nào hiệu quả", "vì sao video này ít view", hoặc muốn cải thiện kênh.
argument-hint: "[số liệu dán vào, đường dẫn ảnh chụp, hoặc tên dự án]"
---

# Phân tích hiệu quả video

Chuyển thể từ sub-skill `analyze` và Shorts playbook của claude-youtube. Đây là vòng phản hồi khép kín: số liệu thật → bài học → kịch bản sau.

## Đầu vào

Người dùng dán số liệu hoặc ảnh chụp màn hình từ TikTok Studio, YouTube Studio, Facebook (Bảng điều khiển chuyên nghiệp hoặc Meta Business Suite), Instagram Insights. Mở ảnh bằng Read và chép số. Ghép mỗi video với dự án trong `projects/` (theo tiêu đề hoặc ngày) để lấy `hook_type`, template, độ dài, series, số cảnh từ `script.json`/`timeline.json`.

Lưu số liệu thô vào `projects/<dự án>/so-lieu.md` (thêm một mục theo ngày), để lần phân tích sau không phải hỏi lại.

## Cách đọc số liệu (ngưỡng tham khảo từ claude-youtube, không phải luật)

| Tín hiệu | Ý nghĩa | Ngưỡng |
|---|---|---|
| Tỉ lệ không lướt qua (YouTube "Viewed vs Swiped Away") | Hook và khung đầu | ≥ 75% tốt; < 60% hook hỏng |
| Tỉ lệ xem hết | Nhịp và độ dài | ≥ 70% được đẩy mạnh |
| Thời lượng xem trung bình > 100% | Người xem xem lặp lại | Giữ cách kết thúc đó |
| Bình luận, chia sẻ | Giá trị tranh luận/hữu ích | Quan trọng hơn lượt thích |
| Biểu đồ giữ chân tụt mạnh ở giây X | Cảnh tại giây X có vấn đề | Tra `timeline.json` xem cảnh nào |

Không suy từ lượt xem đơn lẻ: YouTube đếm mọi lượt phát từ 3/2025 và Shorts có thể bật lên đến ngày thứ 4. Chỉ kết luận khi video đã đăng ít nhất 3 ngày.

## Phân tích

1. Bảng tổng hợp: mỗi video một dòng (nền tảng, ngày, lượt xem, tỉ lệ không lướt, tỉ lệ xem hết, bình luận, `hook_type`, template, độ dài, series).
2. So sánh theo nhóm: kiểu hook, độ dài (13–25s, 45–60s, 2–3 phút, 3–5 phút), template, series, có nhạc hay không.
3. Với video kém nhất và tốt nhất: mở `timeline.json` tại thời điểm người xem rời đi, nói cụ thể cảnh nào, câu nào, hình nào.
4. **Chỉ gọi là bài học khi có từ 3 video trở lên cùng xu hướng.** Ít hơn thì ghi vào "Giả thuyết cần thử".

## Xét series và thử nghiệm

- Khi một series có đủ 10 tập đã đăng ít nhất 3 ngày: đề xuất giữ, sửa hay dừng series, cập nhật trạng thái trong `kenh/series.md`. Nếu 10 tập liên tiếp đạt tỉ lệ không lướt qua từ 70% trở lên, báo đủ điều kiện mở kênh con (`.claude/rules/phong-cach-thuong-hieu.md`).
- Đối chiếu mục "Giả thuyết cần thử" trong `kenh/bai-hoc.md`: giả thuyết nào đã đủ 3 video mỗi phía thì kết luận, chuyển lên "Đang hiệu quả" hoặc "Không hiệu quả".
- So theo nền tảng (TikTok, Shorts, Facebook, Instagram) để biết nền tảng nào đáng ưu tiên hơn cho kênh.

## Kết quả

- Cập nhật `kenh/bai-hoc.md`: mỗi dòng gồm quan sát + số liệu + số video + ngày. Sửa hoặc xoá bài học cũ nếu số liệu mới bác bỏ.
- Báo người dùng: 3 điều nên tiếp tục, 3 điều nên đổi, 1 thử nghiệm cho tuần tới (ví dụ: "3 video tới dùng hook `cau-hoi` để so với `loi-hua`").
- Gợi ý bước tiếp theo: `/goi-y-chu-de` để lên chủ đề dựa trên bài học mới.
