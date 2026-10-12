# Linh vật của kênh: hồ sơ và bộ biểu cảm

> Khung chuyển từ `kenh/nhan-vat-vua.md` của kênh game (30/09/2026). **Chưa có linh vật**: chốt bằng `/thiet-lap-kenh` (có dùng linh vật không, tên, tạo hình từ logo). Không dùng lại nhân vật Vừa của kênh game.
> Khi chưa có file hình, template tự ẩn chỗ của linh vật (gag `sticker` không hiện gì), video vẫn render được.
> Dùng cùng [cam-nang-phong-cach.md](cam-nang-phong-cach.md) (khi nào cho linh vật xuất hiện) và `templates/_shared/frame.md` (thành phần `sticker`).

## 1. Có cần linh vật không?

Bài học từ kênh game (căn cứ ở `docs/tham-khao-kenh-game/phan-tich-kenh-mau-2026-09-30.md`):
1. Kênh mẫu gây cười phần lớn bằng hình (sticker, ảnh meme), nhưng đó là hình của người khác, kênh không được dùng. Cần một bộ hình **của mình** làm đúng việc đó.
2. Kênh không lộ mặt cần một gương mặt có cá tính; linh vật là "mình" trong lời đọc.
3. Nhân vật dùng lại lâu dài mới thành dấu hiệu nhận biết của kênh.

Không cần: hoạt hình nhép miệng, nhiều góc quay, nhân vật phụ. Đạo cụ (điện thoại, cục pin, bộ nhớ) chỉ là thứ linh vật cầm.

## 2. Linh vật là ai

TODO: tên, tính cách (khớp mục 1 của cẩm nang), câu cửa miệng.

## 3. Tạo hình gốc

TODO: lấy từ logo của kênh (`templates/_shared/logo.png`, chưa có). Ghi bảng: thân, mắt, miệng, tay, chân, viền sticker, màu (mã hex), những thứ **không** đưa lên nhân vật. Phong cách gợi ý: vector phẳng, khối rõ, viền trắng dày, nhìn ở cỡ 200px vẫn đọc ra.

## 4. Bộ biểu cảm

Mỗi hình là PNG nền trong suốt, 1024×1024, nhân vật ở giữa, toàn thân. **Tên file cố định** (template và kịch bản gọi theo tên này), lưu ở `templates/_shared/sticker/`:

| File | Dùng khi | Gợi ý biểu cảm, đạo cụ | Sfx đi kèm |
|---|---|---|---|
| `linh-vat-cuoi.png` | Khen, ứng dụng hay, mở đầu tích cực | Cười rộng, hai tay giơ lên, sao nhỏ quanh đầu | `boing` |
| `linh-vat-soc.png` | Bất ngờ, chi tiết vô lý, "Ủa?" | Mắt mở to, miệng chữ O, hai tay ôm má | `xuoc-dia` |
| `linh-vat-cay.png` | Quảng cáo dồn dập, bị lừa trả phí | Nghiến răng, khói bốc lên | `bonk` |
| `linh-vat-khoc.png` | Giá gói cao, mất dữ liệu, hết bộ nhớ | Nước mắt hai dòng, ôm điện thoại báo đầy bộ nhớ | `de-kem` |
| `linh-vat-ngau.png` | Phán quyết `CÀI NGAY`, hạng S | Kính râm, ngón cái | chữ ký âm thanh (tự thêm cùng con dấu) |
| `linh-vat-ngu-gat.png` | Ứng dụng nhạt, `BỎ QUA`, chờ tải lâu | Mắt nhắm, chữ "Zzz" | `im-lang` |
| `linh-vat-do-mo-hoi.png` | Ứng dụng nặng, hao pin, xin nhiều quyền | Mồ hôi, ôm điện thoại nóng, pin đỏ | `buzz-sai` |
| `linh-vat-nghi.png` | Đặt câu hỏi, cân nhắc hạng, câu hỏi cuối video | Chống cằm, dấu "?" | `pop` |
| `linh-vat-che.png` | Câu hạng D (cẩm nang mục 5), chê nhẹ | Mắt lờ đờ, khoanh tay | `buzz-sai` |
| `linh-vat-co-bap.png`, `linh-vat-gay-yeu.png` | Gag `so-sanh` (mạnh / yếu) | Gồng cơ / gầy gò | |

Template `tier-board` tự chọn biểu cảm theo hạng: SSS, S → `ngau`; A → `cuoi`; B → `nghi`; C → `do-mo-hoi`; D → `ngu-gat`.

## 5. Cách tạo bằng AI

1. **Chọn dịch vụ có điều khoản cho dùng thương mại** ảnh tạo ra, và cho tải ảnh tham chiếu. Chụp lại trang điều khoản, lưu vào `kenh/bang-chung/`.
2. **Tạo ảnh gốc trước** (`linh-vat-goc.png`, dáng đứng thẳng, mặt bình thường), **đính kèm logo làm ảnh tham chiếu**. Làm lại đến khi đạt bảng kiểm mục 6.
3. **Mỗi biểu cảm**: đính kèm ảnh gốc (và logo), dùng lời nhắc gốc + phần biểu cảm. Tạo 3–4 phương án, chọn cái giống ảnh gốc nhất.
4. **Tách nền**: tạo trên nền trắng trơn rồi tách bằng `npx hyperframes remove-background` hoặc `templates/_shared/sticker/xoa_nen.py`.
5. **Ghi sổ**: mỗi file một dòng trong `templates/_shared/sticker/GIAY-PHEP.md` (dịch vụ, ngày tạo, lời nhắc, đường dẫn bằng chứng điều khoản).

Lời nhắc gốc (tiếng Anh) viết sau khi có logo, theo khuôn của kênh game: mô tả chính xác từng bộ phận và mã màu, "flat vector sticker, bold simple shapes, no soft shadows, thick white sticker outline, plain white background, full body, centered, square 1024x1024", và danh sách "Do NOT add" (chữ, số, logo hãng, logo Apple, Android, thừa ngón tay, thừa mắt).

Nhãn AI: linh vật hoạt hình không mô phỏng người thật nên không thuộc hai trường hợp bắt buộc gắn nhãn của Nghị định 142/2026. Vẫn theo chính sách nhãn AI trong `kenh/ho-so-kenh.md`.

## 6. Bảng kiểm trước khi nhận một hình

- [ ] Đặt cạnh ảnh gốc: cùng màu, cùng tỉ lệ, mắt cùng cỡ.
- [ ] Thu nhỏ còn 200px vẫn nhận ra nhân vật và biểu cảm.
- [ ] Không có chữ, số, logo hãng; không thừa ngón tay, không thừa mắt.
- [ ] Nền trong suốt sạch, viền trắng liền, không lem mép.
- [ ] Biểu cảm đọc được trong nửa giây khi tắt tiếng.

## 7. Cách linh vật xuất hiện trong video (kế thừa)

| Quy tắc | Giá trị |
|---|---|
| Thời lượng mỗi lần | 0,8–1,5 giây |
| Mật độ | Ít nhất 1 lần mỗi mục; không quá 1 lần mỗi 5 giây |
| Kích thước, vị trí | Cao 420–560px trên khung 1080×1920, trong vùng an toàn, **không che tên ứng dụng, thứ hạng, con dấu, nút đang được chỉ vào** |
| Vào, ra | Nảy vào: scale 0 → 1,15 → 1 trong 0,25 giây, nghiêng ±6°; ra: thu về 0 trong 0,15 giây |
| Cùng lúc | Chỉ một hình linh vật, không chồng lên thẻ thông tin đang bật |
| Con dấu | Cảnh có con dấu chỉ dùng `linh-vat-ngau` (CÀI NGAY), `linh-vat-nghi` (DÙNG THỬ, CHỜ GIẢM GIÁ) hoặc `linh-vat-ngu-gat` (BỎ QUA), bật lên **sau** con dấu 0,4 giây |

Trong `script.json`: `{ "cue": "quảng cáo", "kind": "sticker", "asset": "linh-vat-cay" }`.
