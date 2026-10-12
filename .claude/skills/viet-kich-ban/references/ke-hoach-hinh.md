# Kế hoạch hình: viết lời cho cảnh, không gắn cảnh vào lời

Đọc file này **trước khi viết lời đọc** của bản đầy đủ (top-list, tier-board). Kiểu hình (`templates/_shared/kieu-hinh.md`) chỉ thấy rõ khi lời đọc được viết để dọn đường cho nó.

## Vì sao phải lên kế hoạch từ bước kịch bản

Ở kênh game, bản cắt thử tập 2 "game Việt lên top" (12/10/2026) gắn 8 kiểu hình vào một kịch bản đã xong. Người làm video xem và thấy "không khác gì bản cũ". Có ba lý do:

1. **Quá ít, quá ngắn.** Mỗi kiểu diễn 0,3–0,6 giây, tổng khoảng 5% thời lượng. Phần còn lại vẫn là ảnh trôi chậm như cũ.
2. **Lời đọc không dọn đường.** Thẻ lật ra đáp án nhưng không có câu hỏi trước, nên người xem không chờ gì. Máy quay đập vào một chi tiết nhưng lời không chỉ vào chi tiết đó.
3. **Không có cao trào.** Kiểu hình rải đều, hạng 1 không mạnh hơn hạng 3.

Cách làm của video-shotcraft (thẻ `sequences/promo-energy-arc`, luật P4): lập bảng "nội dung → cảnh" và đường năng lượng của cả phim **trước**, rồi mới viết và dựng. Mỗi nhịp có đúng một cảnh làm nhân vật chính, được chừa thời gian diễn và thời gian thở.

## Bốn bước, làm trước khi viết lời đọc

### 1. Vẽ đường năng lượng của cả video

| Đoạn | Năng lượng | Hình chính |
|---|---|---|
| Hook | Cao nhất ở giây 0 | Kết quả bất ngờ trong clip dùng thử + chữ hook; không dùng kiểu cần lấy đà (đập zoom, lật thẻ cần hiện trước `at`) |
| Mục đầu (hạng thấp) | Vừa | Kiểu nhẹ: lật thẻ, đếm số, đẩy lên |
| Mục giữa | Xen kẽ cao / thấp | Mục cao (đập zoom rung, combo) xen mục thấp (lật thẻ, kéo so sánh) |
| Hạng 1 / hạng S | Cao nhất của thân video | Kiểu mạnh nhất chưa dùng (chia ô, cắt nhảy, đập zoom rung) + con dấu phán quyết |
| Kết | Hạ xuống | Không thêm kiểu; câu hỏi, màn kết |

Ghi đường này thành một dòng trong `nhat-ky.md`, ví dụ: "hook ảnh hạng 1 che tên → #3 lật thẻ → #2 combo → #1 chia ô + con dấu".

### 2. Chọn một khoảnh khắc hình chính cho mỗi mục

Mỗi mục có **một** khoảnh khắc hình chính (`hinh_chinh` trong `script.json`), tối đa thêm một kiểu phụ. Chọn theo công thức kể 5 nhịp:

| Nhịp của mục | Kiểu hợp | Ghi chú |
|---|---|---|
| 1. Chuyển mục cài tò mò | `chuyen: day-len` (mặc định), `lia` khi mục sau ngược hẳn mục trước | Không tính là hình chính |
| 2. Tên + tóm ý bằng hình | `chia-o` (ba ảnh: màn hình chính, tính năng, kết quả), `cat-nhay` (một ảnh, ba lớp chi tiết) | Hợp làm hình chính cho mục hạng cao |
| 3. "Đang… thì…" | `dap-zoom-rung` đúng chữ hậu quả ("thì… **đòi trả phí**") | Mạnh nhất; tối đa 2 mỗi video |
| 3. Điều lặp đi lặp lại | gag `combo`, số đòn bằng số lần **nói ra** | "Quảng cáo. Quảng cáo. Lại quảng cáo." thì `so: 3` |
| 4. "Nhưng" (điểm trừ, con số) | `lat-the` (con số người xem muốn đoán), `dem-so` (số lớn, giá), gag `keo-so-sanh` (trước / sau khi xử lý, ảnh quảng bá / ảnh tự quay) | |
| 5. Câu chốt | Không thêm kiểu: số hạng, con dấu là nhận diện thương hiệu | |

Mục nào không tìm ra khoảnh khắc đáng dựng thì kể lại mục đó, đừng gắn kiểu cho có.

### 3. Viết câu mồi cho từng kiểu

Kiểu hình chỉ "nổ" khi lời đọc tạo chờ đợi rồi trả đúng lúc. Mỗi kiểu cần một câu mồi:

| Kiểu | Câu mồi | `cue` đặt ở |
|---|---|---|
| `lat-the` | Hỏi trước, ngừng, trả lời ngắn: "Đoán xem gói Pro bao nhiêu một tháng? … Hai trăm nghìn." | Từ trả lời ("Năm") |
| `dem-so` | Số đứng cuối câu, là punchline: "Nặng bao nhiêu? Hai mươi ba mê ga." | Chữ đầu của số |
| `dap-zoom` | Lời chỉ trỏ vào chi tiết: "Nhìn góc phải… cái nút trả phí." | Tên chi tiết |
| `dap-zoom-rung` | Câu dài dựng tình huống rồi câu cụt hậu quả: "Chỉnh xong, bấm lưu thì… Mất hết." | Chữ hậu quả |
| `cat-nhay` | Ba nhịp tăng dần trên cùng một ảnh: "Nhìn thì bình thường. Nhìn kỹ. Nhìn kỹ nữa." hoặc liệt kê ba thứ cùng một màn | Câu đầu (ba nhát tự rơi trong 1–1,3 giây sau) |
| `chia-o` | Liệt kê ba thứ có ảnh riêng: "Quét tài liệu, dịch ảnh, ghi âm thành chữ." | Thứ đầu tiên |
| `combo` | Lặp đúng một từ, số lần bằng `so` | Lần lặp cuối |
| `keo-so-sanh` | "Ảnh quảng cáo thế này… còn dùng thật thì thế này." | Vế sau |

Chừa chỗ cho hình diễn:
- Hình chính cần **1,5–2,5 giây** lời đọc quanh `cue`: câu mồi trước, câu trả lời sau, không chen thẻ hay gag khác.
- Dấu "…" trước chữ trả lời để TTS ngừng ~0,3s, đúng lúc thẻ lật hay máy quay giật vào.
- Đập zoom cách nhịp ảnh trước ≥ 0,85s, cắt nhảy ≥ 1,3s, chia ô ≥ 1,8s (không thẻ nào bật lên trong lúc chia ô).

### 4. Ghi kế hoạch vào kịch bản, chốt hình ở DỪNG 2b

- Mỗi cảnh `item` / `tier` có `hinh_chinh`: một câu nói khoảnh khắc đó là gì, rơi vào chữ nào, vì sao. Ví dụ: `"đập zoom rung vào màn hình báo lỗi đúng chữ 'Mất hết' (cao trào nhịp 3)"`. Khoảnh khắc này cũng là một `kieu` ở `shots` hoặc một gag `combo` / `keo-so-sanh`.
- Lúc viết kịch bản thường chưa có ảnh. Ghi `kieu` theo ý đồ. Kiểu cần ảnh cụ thể (`chia-o` cần `anh`, `dap-zoom` cần `diem`, `keo-so-sanh` cần cặp ảnh đúng nghĩa) thì **chốt ở DỪNG 2b** khi đã có `assets/bang-anh.jpg`:
  - đặt `diem` trúng chi tiết lời đang nói;
  - chọn `anh` khác nhau thật;
  - nhãn kéo so sánh phải đúng nội dung ảnh.
- Ảnh không đáp ứng được thì đổi sang kiểu khác cùng nhịp (ví dụ `chia-o` thành `cat-nhay`), ghi lý do vào `nhat-ky.md`, không sửa lời đọc nếu không cần.

## Tự kiểm trước DỪNG 2

- [ ] Mỗi mục có `hinh_chinh`, và nó là một `kieu` hoặc gag kiểu hình thật trong `shots` / `gags`.
- [ ] Hạng 1 / hạng S có kiểu mạnh nhất của video. Hai mục liền nhau không cùng kiểu.
- [ ] Mỗi kiểu có câu mồi trong lời đọc và `cue` đúng chữ trả lời / hậu quả.
- [ ] Bản đầy đủ dùng ít nhất 4 kiểu khác nhau. Cú đập cả khung ≤ 3.
- [ ] Đọc riêng cột "Khoảnh khắc hình" ở bảng DỪNG 2, các mục trông phải khác nhau.
