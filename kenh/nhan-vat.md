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

**Lười** (chữ L của "Anh Lười đây!", chốt 12/10/2026): chính là "Anh Lười" trong lời đọc. Lười tới mức thử hết ứng dụng để khỏi làm tay, mắt luôn lim dim, chỉ mở to khi gặp ứng dụng xịn thật. Câu cửa miệng ở `kenh/cam-nang-phong-cach.md` mục 7.

## 3. Tạo hình gốc

Lấy từ logo (`templates/_shared/logo-nguon/logo-goc.png`; prompt ở `logo-nguon/prompt-bieu-cam.md`):

| Phần | Tạo hình |
|---|---|
| Thân | Chữ L khối 3D, mặt `#6FE3C1`, cạnh `#3FB89A`, viền xanh đêm `#0B1524` dày |
| Mắt | Hai mắt tròn kem `#F4F1E6`, mí nặng nửa khép (mặc định) |
| Miệng | Thanh vuốt home: viên thuốc ngang màu kem, viền tối |
| Tay | Tay đen mảnh, găng trắng kiểu hoạt hình |
| Chân | Chân đen ngắn, giày đen bóng (chuẩn; hai bản đầu `lim-dim`, `ngu-gat` đang giày kem) |
| Đạo cụ | Bệ điện thoại nằm ngửa (có thanh home) ở các tư thế nằm, ngồi |
| Không đưa lên | Tóc, mũ, quần áo, logo Apple/Google, chữ V, D-pad của Vừa |

## 4. Bộ biểu cảm

Mỗi hình là PNG nền trong suốt, 1024×1024, nhân vật ở giữa, toàn thân. **Tên file cố định** (template và kịch bản gọi theo tên này), lưu ở `templates/_shared/sticker/`:

| File | Dùng khi | Biểu cảm | Sfx đi kèm |
|---|---|---|---|
| `linh-vat-lim-dim.png` | Mặc định, giới thiệu ứng dụng | Ngả lưng trên bệ, vẫy tay lười | `pop` |
| `linh-vat-ngu-gat.png` | Ứng dụng nhạt, `BỎ QUA`, chờ tải lâu | Mắt nhắm, "z z" | `im-lang` |
| `linh-vat-tinh-ngu.png` | Ứng dụng xịn bất ngờ, mở đầu, "Ủa?" | Mắt mở to, hai tay giơ, vạch chuyển động | `xuoc-dia` |
| `linh-vat-duyet.png` | "Anh Lười duyệt", `CÀI NGAY`, hạng S | Ngón cái, cười nhếch | chữ ký âm thanh (cùng con dấu) |
| `linh-vat-che.png` | Chê nhẹ, hạng D | Liếc ngang, tay đẩy ra | `buzz-sai` |
| `linh-vat-soc-gia.png` | Gói trả phí đắt, hết bộ nhớ | Ôm má, giọt mồ hôi | `de-kem` |
| `linh-vat-nghi.png` | Cân nhắc, câu hỏi cuối video | Chống cằm, dấu "?" | `pop` |
| `linh-vat-cuoi.png` | Gag, khen | Cười ôm bụng | `boing` |
| `linh-vat-buc.png` | Quảng cáo dày, xin quyền vô lý | Khoanh tay, dấu gân | `bonk` |
| `linh-vat-luoi-cham.png` | "Ba chạm, hết việc", mẹo nhanh | Nằm, một ngón chạm màn hình | `pop` |

Template `tier-board` tự chọn biểu cảm theo hạng: SSS, S → `duyet`; A → `cuoi`; B → `nghi`; C → `buc`; D → `ngu-gat`; cảnh mở đầu → `tinh-ngu`.

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
