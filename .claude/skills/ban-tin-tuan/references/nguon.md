# Nguồn của bản tin ứng dụng

Soạn ngày 12/10/2026, chưa chạy thử từng nguồn: đường dẫn nào lỗi thì ghi vào "Nguồn lỗi" của lần chạy và sửa file này. Ưu tiên chuyên mục, thẻ, RSS hơn trang chủ. Đọc bằng WebFetch; trang chặn thì dùng WebSearch giới hạn tên miền (`allowed_domains`) với từ khoá "ứng dụng", "app", tên ứng dụng.

## Nhóm 1: Báo Việt Nam

| Nguồn | Chuyên mục | Ghi chú |
|---|---|---|
| VnExpress Số hoá | https://vnexpress.net/so-hoa/ung-dung | Tin ứng dụng, bảo mật, lừa đảo qua ứng dụng |
| GenK | https://genk.vn/apps-games.chn (mục ứng dụng) | Hay viết "ứng dụng hay", tin ứng dụng quốc tế |
| Tinh tế | https://tinhte.vn | Người dùng chia sẻ ứng dụng, bình luận sâu; ý kiến diễn đàn chỉ để tham khảo |
| Sforum | https://cellphones.com.vn/sforum | Thủ thuật, ứng dụng mới, cập nhật iOS/Android |
| Dân trí Công nghệ | https://dantri.com.vn/cong-nghe.htm | Ứng dụng dịch vụ công, ngân hàng, cảnh báo |

## Nhóm 2: Báo quốc tế

| Nguồn | Đường dẫn | Ghi chú |
|---|---|---|
| The Verge | https://www.theverge.com/apps | |
| TechCrunch | https://techcrunch.com/category/apps/ | Ứng dụng mới, số liệu từ Appfigures, Sensor Tower |
| 9to5Mac | https://9to5mac.com | iOS, App Store |
| 9to5Google | https://9to5google.com | Android, Google Play |
| MacRumors | https://www.macrumors.com | Cập nhật iOS, tính năng mới |
| Android Authority | https://www.androidauthority.com/apps/ | |

## Nhóm 3: Cửa hàng và đo lường

| Nguồn | Đường dẫn | Ghi chú |
|---|---|---|
| App Store VN (script) | `du-lieu/bang-xep-hang.md`, `appstore.json` | Thứ hạng tại thời điểm chạy, không phải lượt tải |
| Google Play | https://play.google.com/store/apps/top (khu vực theo mạng) | Không có API chính thức; ghi khu vực và thời điểm. Google Play khác khu vực VN thì ghi rõ |
| Sensor Tower blog | https://sensortower.com/blog | Báo cáo lượt tải, doanh thu công khai |
| Appfigures | https://appfigures.com/resources | Ứng dụng tăng trưởng nhanh, có số liệu |
| Product Hunt | https://www.producthunt.com/topics/iphone ; /topics/android | Ứng dụng mới ra, phần lớn chưa có ở VN: kiểm tra trên App Store VN trước khi đề xuất |

## Nhóm 4: Bảo mật và pháp lý Việt Nam

| Nguồn | Đường dẫn | Ghi chú |
|---|---|---|
| Cục An toàn thông tin | https://khonggianmang.vn | Cảnh báo ứng dụng giả mạo, lừa đảo |
| Báo Công an nhân dân | https://cand.com.vn | Cảnh báo thủ đoạn lừa qua ứng dụng |
| Ngân hàng Nhà nước | https://www.sbv.gov.vn | Quy định thanh toán, sinh trắc học, danh sách tổ chức được phép |
| VnExpress Pháp luật | https://vnexpress.net/phap-luat | Vụ việc liên quan ứng dụng |

## Nhóm 5: Mạng xã hội và tìm kiếm

| Nguồn | Cách đọc | Ghi chú |
|---|---|---|
| Google Trends VN | `du-lieu/trends.json` (script) | Lọc tay từ khoá liên quan ứng dụng; script chỉ lọc thô |
| YouTube | `YOUTUBE_API_KEY` trong `.env` thì gọi API thịnh hành VN, không có thì WebSearch | Ghi tiêu đề tóm tắt, kênh, lượt xem, ngày đăng |
| Reddit | r/apps, r/iphone, r/androidapps | Chỉ tham khảo, không làm nguồn duy nhất |
