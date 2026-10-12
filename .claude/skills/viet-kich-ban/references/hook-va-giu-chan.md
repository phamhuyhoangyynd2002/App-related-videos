# Công thức hook và giữ chân cho video ứng dụng ngắn

> Kế thừa từ kênh game; ví dụ đã đổi sang ứng dụng. Kiểu mới `ket-qua-truoc` hợp riêng với ứng dụng (thêm 12/10/2026).

Ghi kiểu hook đã dùng vào trường `hook_type` của `script.json` để các video sau tránh lặp kiểu.

## Kiểu hook (`hook_type`)

| `hook_type` | Mẫu | Ví dụ |
|---|---|---|
| `ket-qua-truoc` | Giây 0 là **kết quả** thấy được của ứng dụng, lời đọc nói nó làm trong bao lâu | "Chụp một trang vở. Ba giây sau, nó thành file chữ." |
| `phan-truc-giac` | Nói ngược điều người xem nghĩ | "Ứng dụng chỉnh ảnh tốt nhất tháng này lại miễn phí." |
| `loi-hua` | Hứa một lợi ích cụ thể | "Ba ứng dụng này làm được việc của Photoshop, ngay trên điện thoại." |
| `con-so` | Con số gây chú ý | "Ứng dụng này xin hai mươi ba quyền truy cập." |
| `cau-hoi` | Câu hỏi đánh vào nỗi đau hoặc sự tò mò | "Bộ nhớ lại đầy? Ba ứng dụng này dọn giúp, không quảng cáo." |
| `canh-bao` | Cảnh báo, "đừng" | "Đừng trả tiền gói Pro trước khi xem video này." |
| `tranh-cai` | Tuyên bố có quan điểm mạnh | "Ứng dụng AI đang lên top này được khen quá đà." |
| `bat-dau-giua-hanh-dong` | Mở ngay bằng khoảnh khắc ấn tượng trong clip dùng thử, lời đọc nói về nó | "Mình vừa xoá người lạ khỏi ảnh. Bằng một ngón tay." |
| `so-sanh` | Đặt cạnh một ứng dụng nổi tiếng | "Nếu bạn đang trả tiền cho CamScanner, xem cái này trước." |
| `khoan-luot` | Ra lệnh chống lướt + lời hứa nói quá | "Khoan xoá ứng dụng. Có một cái miễn phí làm được việc của ba cái trả phí." |
| `noi-dau-noi-qua` | Nỗi đau quen thuộc, tương phản số | "Xem ba mươi giây quảng cáo để dùng năm giây." |
| `phan-ung` | Thán từ + bình luận tập trước (đã che tên), nối series | "Ơ kìa. Tập trước anh em bảo mình bỏ sót một ứng dụng." |
| `do-vui` | Câu đố cho khán giả | "Đố anh em biết: ứng dụng nào trên máy bạn đang hao pin nhất?" |
| `tu-trao` | Người kể, bộ nhớ, cục pin làm nạn nhân ngay câu đầu | "Bộ nhớ mình vừa xin nghỉ việc. Vì năm ứng dụng này." |

Kiểu hook lầy ở trên tính như mọi kiểu khác: không trùng kiểu với 3 video gần nhất. Cơ chế: `ket-qua-truoc`, `khoan-luot`, `do-vui` là khoảng trống thông tin; `noi-dau-noi-qua`, `tu-trao` là nỗi đau quen thuộc; `phan-ung` là bằng chứng xã hội.

Chữ trên màn hình ở cảnh hook không lặp nguyên lời đọc, mà là phiên bản 3–6 từ đập vào mắt. Ví dụ: lời đọc "Ba ứng dụng này làm được việc của Photoshop", chữ "PHOTOSHOP MIỄN PHÍ?".

## Mở và đóng vòng tò mò

- Mở: "…và ứng dụng cuối thay được ba ứng dụng trả phí."
- Mở: "Cái cuối cùng đang được tặng gói Pro miễn phí một năm."
- Đóng ở cảnh cuối: nhắc lại chính điều đã hứa. Nếu không đóng được thì không mở.

## Kết thúc lặp vòng

Câu cuối đọc nối liền được vào câu đầu. Ví dụ:
- Cuối: "Và đó là lý do…" → Đầu: "…ứng dụng chỉnh ảnh tốt nhất tháng này lại miễn phí."
- Cuối: "Còn bạn, bạn làm gì khi…" → Đầu: "…bộ nhớ lại đầy?"

Chỉ dùng khi tự nhiên. Nếu gượng ép thì kết bằng câu hỏi kéo bình luận.

## Câu hỏi kéo bình luận

- Hỏi để người xem **chọn**: "CapCut hay VN, bạn dựng video bằng cái nào?"
- Hỏi để người xem **bổ sung**: "Mình bỏ sót ứng dụng nào?"
- **Khích** có chút trêu: "Ai thấy xếp sai thì vào cãi, mình đọc hết, nhưng không sửa đâu." / "Muốn phần bốn thì bình luận 'phần bốn'." Kèm chữ trên màn hình để người đang tắt tiếng cũng thấy.
- Tránh câu hỏi có/không, như "Bạn có thích video này không?"

## Tín hiệu một kịch bản đang yếu

- Cảnh hook dài hơn 3 giây.
- Hai cảnh liền nhau có cấu trúc câu giống hệt nhau ("Ứng dụng này có… Ứng dụng này có…").
- Chi tiết về ứng dụng có thể áp cho bất kỳ ứng dụng nào ("giao diện đẹp", "dễ sử dụng", "nhiều tính năng hữu ích"), hoặc chỉ đọc lại mô tả trên cửa hàng.
- Cảnh cuối chỉ có lời kêu gọi theo dõi, không có nội dung.

## Chọn hook theo cơ chế tâm lý (từ claude-youtube)

Khi viết 3 phương án hook, mỗi phương án dùng **một cơ chế khác nhau**, để người duyệt thực sự có lựa chọn:

| Cơ chế | Hoạt động thế nào | Kiểu hook tương ứng | Rủi ro người xem lướt qua |
|---|---|---|---|
| Mâu thuẫn nhận thức | Nói điều trái với niềm tin của người xem, buộc họ ở lại để hiểu | `phan-truc-giac`, `tranh-cai` | Thấp nếu có bằng chứng ngay sau; cao nếu nghe như câu view |
| Khoảng trống thông tin | Cho biết vừa đủ để người xem nhận ra mình còn thiếu một điều | `cau-hoi`, `con-so` | Thấp, hợp nhất với video ngắn |
| Nỗi đau quen thuộc | Gọi tên vấn đề người xem đang gặp (bộ nhớ đầy, quảng cáo, gói trả phí đắt) | `loi-hua`, `cau-hoi` | Thấp với đúng khán giả, cao với người ngoài |
| Vào giữa hành động | Mở ngay bằng khoảnh khắc ấn tượng, không dẫn dắt | `bat-dau-giua-hanh-dong` | Thấp nếu hình đủ mạnh; phụ thuộc clip dùng thử |
| Uy tín / bằng chứng xã hội | Mở bằng con số chứng thực (điểm App Store, lượt tải Google Play) | `con-so`, `so-sanh` | Trung bình, dễ khô |

Kênh ứng dụng nên ưu tiên **khoảng trống thông tin** (đặc biệt `ket-qua-truoc`) và **vào giữa hành động**, dùng **mâu thuẫn nhận thức** khi có số liệu chống lưng.

## Đọc số liệu để sửa hook (xem thêm `/phan-tich-hieu-qua`)

- Tỉ lệ người xem **không lướt qua** (YouTube: "Viewed vs Swiped Away") dưới 60%: hook hỏng, đổi kiểu hook ở video sau.
- Tỉ lệ xem hết trên 70%: nền tảng đẩy mạnh; ghi kiểu hook và cấu trúc đó vào `kenh/bai-hoc.md`.
- Thời lượng xem trung bình trên 100%: video đang được xem lặp lại, hãy giữ kiểu kết thúc đó.
