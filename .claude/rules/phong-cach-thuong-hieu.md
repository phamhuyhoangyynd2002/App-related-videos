# Phong cách thương hiệu và hệ thống kênh

Luật dùng chung cho mọi video của kênh ứng dụng. Giá trị cụ thể (tên kênh, lời hứa, giọng đọc, nhãn con dấu, từ không dùng, linh vật, chính sách nhãn AI) nằm trong `kenh/ho-so-kenh.md`, điền bằng `/thiet-lap-kenh`. Khung luật kế thừa từ kênh game (`docs/tham-khao-kenh-game/nghien-cuu-khan-gia-va-phong-cach-2026-09.md`, chốt 28/09/2026); căn cứ thị trường ứng dụng ở `docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md`.

Nguyên tắc gốc: **giữ chung bộ nhận diện, còn nội dung mỗi video phải khác nhau.** YouTube cho phép dùng cùng intro, outro, miễn phần lớn nội dung mỗi video khác nhau. Nhưng YouTube (15/07/2025, làm rõ 16/07/2026) và Meta (13/03/2026) hạ hiển thị hoặc tắt kiếm tiền với video làm hàng loạt theo khuôn, ít biến thể, hoặc thuật lại những gì đã có trên màn hình.

## Khán giả

- Mọi video phải trả lời được: video này giúp người xem làm được gì tốt hơn, nhanh hơn, rẻ hơn với chiếc điện thoại của họ? (lời hứa trong hồ sơ kênh).
- Không nhắm trẻ dưới 13 tuổi.
- Không cổ vũ nạp tiền, mua gói trả phí không cần thiết; luôn nói ứng dụng có bản miễn phí đủ dùng hay không.

## Hệ thống kênh

- Một thương hiệu, mỗi nền tảng một tài khoản: TikTok, YouTube Shorts, Facebook Reels (chính); Instagram Reels đăng thêm.
- Chỉ mở kênh con (ví dụ "<Tên> AI", "<Tên> iPhone") khi một series có 10 tập liên tiếp đạt tỉ lệ không lướt qua từ 70% trở lên.
- Mỗi video chỉ đăng **một lần trên mỗi nền tảng**. Không đăng một video giống hệt lên hai kênh trên cùng nền tảng (chính sách spam của YouTube áp dụng cho "mạng lưới kênh phối hợp"; Meta giảm phân phối bài trùng lặp). Điều này áp dụng cả với kênh game của cùng người làm: không đăng chéo video.
- Tối đa 2 video mỗi ngày trên mỗi kênh trong giai đoạn 1.

## Bộ nhận diện: cố định, linh hoạt, không được

| | Cố định (mọi video) | Linh hoạt (đổi theo nội dung) | Không được |
|---|---|---|---|
| Cách viết | Xưng hô theo hồ sơ kênh; giọng theo `kenh/cam-nang-phong-cach.md`; một phán quyết rõ ràng, nói ai nên dùng và ai không nên; mọi con số có nguồn; nói cả điểm trừ (quảng cáo, gói trả phí, quyền truy cập) | Kiểu hook (xoay vòng), góc nhìn, cách mở vòng tò mò, cách gây cười | Từ trong danh sách "không dùng" của hồ sơ kênh; câu áp được cho mọi ứng dụng; dùng lại nguyên văn câu mở, câu kết; chữ tục, "tao/mày"; đùa về người |
| Linh vật (nếu hồ sơ kênh có) | Cùng tạo hình, cùng bộ biểu cảm (`kenh/nhan-vat.md`); file `templates/_shared/sticker/linh-vat-<biểu-cảm>.png` | Biểu cảm nào, lúc nào | Vẽ lại linh vật kiểu khác; dùng sticker, ảnh meme của người khác thay linh vật; dùng lại linh vật của kênh game |
| Cách nói | Một giọng, một tốc độ; câu kêu gọi cố định | Chỗ ngắt, chỗ nhấn trong câu | Đổi giọng giữa các video; giả giọng người thật |
| Cách dựng | Giây 0 có chữ hook và hình ứng dụng; logo + tên kênh ở góc trái trên (logo-bug); màn kết chuẩn (end-card) ở câu ký tên; màu, font, cỡ chữ theo `frame.md`; con dấu phán quyết và chữ ký âm thanh; đổi hình mỗi 2–3 giây | Bố cục cảnh (dùng nhiều biến thể), màu phụ lấy từ icon ứng dụng, nhạc trong thư viện đã có giấy phép | Đoạn intro logo; một bố cục cho mọi cảnh; chỉ chiếu ảnh cửa hàng không có clip dùng thử; hai thứ mới hiện cùng lúc |

## Thiết bị quen thuộc (meme của thương hiệu)

Thương hiệu có **một** bộ thiết bị quen thuộc, dùng đều đặn và lâu dài; tài sản tự tạo (linh vật, âm thanh riêng) hiệu quả hơn tài sản mượn từ văn hoá đại chúng. Bộ này chốt bằng `/thiet-lap-kenh` và ghi ở hồ sơ kênh, gồm:

- **Linh vật** (nếu có) phản ứng ở mọi mục, sticker nảy vào 0,8–1,5 giây đúng câu punchline.
- **Running gag** của kênh (`kenh/cam-nang-phong-cach.md`).
- **Con dấu phán quyết** và **chữ ký âm thanh** (bên dưới).

**Con dấu phán quyết** xuất hiện đúng **một lần** mỗi video, vào khoảnh khắc phán quyết:
- top-list: khi công bố hạng 1;
- video một ứng dụng: ở cảnh cuối;
- tier-list: khi công bố ứng dụng hạng S;
- tin tức: chỉ khi có lời khuyên cho người dùng. Không có thì bỏ con dấu, nhưng cảnh cuối vẫn phải có một câu nhận định của kênh.

Nhãn con dấu cố định, khai báo ở dòng "Nhãn con dấu" của `kenh/ho-so-kenh.md` (validator và template đọc từ đó). Bộ mặc định khi hồ sơ chưa khai báo:
- ứng dụng miễn phí, hoặc bản miễn phí đủ dùng: `CÀI NGAY` / `DÙNG THỬ` / `BỎ QUA`;
- ứng dụng trả phí, gói trả phí: `CÀI NGAY` / `CHỜ GIẢM GIÁ` / `BỎ QUA`.
Khai báo bằng trường `verdict` của cảnh trong `script.json`. Ứng dụng tài chính chưa xác minh giấy phép tại Việt Nam, ứng dụng có dấu hiệu lừa đảo: không đóng dấu `CÀI NGAY` hay `DÙNG THỬ`.

**Chữ ký âm thanh** (`sfx/chu-ky.*`, tối đa 1 giây) chỉ phát cùng con dấu, không bao giờ ở giây đầu. `build_timeline.py` tự đặt nó đúng lúc con dấu xuất hiện. Kênh ứng dụng **phải có chữ ký riêng**, không dùng lại chữ ký của kênh game (tạo bằng `sfx/nguon/tao_sfx.py` với tham số khác, ghi vào `sfx/GIAY-PHEP.md`).

## Meme bên ngoài

Chia ba loại (chi tiết ở `kenh/cam-nang-phong-cach.md`):

1. **Khuôn meme** (cấu trúc câu, bố cục khung: kỳ vọng / thực tế, trước / sau, "5 PHÚT SAU…", tin nhắn giả, ba giai đoạn…): **dùng thường xuyên**. Cấu trúc không có bản quyền. Luôn dựng bằng đồ hoạ, font và linh vật của kênh, luôn đi kèm thông tin thật về ứng dụng.
2. **Từ lóng, câu cửa miệng**: dùng theo danh sách trong cẩm nang; từ trend có hạn dùng tối đa 2 lần mỗi video và xem lại mỗi quý.
3. **Trend nóng**: chỉ dùng khi trend còn trong 48 giờ đầu và hợp tệp khán giả, tối đa 1 trong 10 video. Theo Sprout Social (2025), 27% người dùng cho rằng trend chỉ hiệu quả trong 24–48 giờ, 33% thấy thương hiệu đu trend là đáng xấu hổ.

Với mọi loại: **không** dùng âm thanh, hình phim, ảnh meme, ảnh người thật có chủ sở hữu; thay bằng linh vật và sfx tự tạo (quy tắc âm thanh ở `chinh-xac-va-ban-quyen.md` mục 5).

## Nội dung gốc (tránh bị coi là "AI làm hàng loạt")

Quy tắc bắt buộc:
1. Mỗi video có ít nhất một nhận định có lý do (phán quyết, lý do xếp hạng, ai nên và không nên dùng). Người làm video xác nhận nhận định này ở DỪNG 2 (ở chế độ `tu-dong` thì ở DỪNG 3), rồi ghi vào `nhat-ky.md`.
2. Lời đọc nói thêm những điều hình và trang cửa hàng không nói (trải nghiệm khi dùng thử, chỗ vướng, so với ứng dụng khác), không đọc lại mô tả trên cửa hàng.
3. Mỗi ứng dụng trong video nên có **ít nhất một clip hoặc ảnh tự quay** khi dùng thử. Video chỉ có ảnh cửa hàng thì ghi lý do vào `nhat-ky.md`; tối đa 1 trong 5 video liên tiếp như vậy.
4. Phần lớn thời lượng là đồ hoạ tự làm (thứ hạng, thẻ so sánh, thang điểm) và clip tự quay.
5. Mỗi ứng dụng có ít nhất một chi tiết cụ thể, kiểm chứng được, không dùng được cho ứng dụng khác.
6. Không trùng kiểu hook với 3 video gần nhất, không dùng lại câu mở đầu của 10 video gần nhất, lời đọc không trùng quá 30% với các video gần đây.

## Kiểm tra tự động

- `validate_script.py` (trước DỪNG 2): trường `verdict` và nhãn theo hồ sơ kênh, từ không dùng, câu mở đầu dùng lại, kiểu hook lặp lại, `gags` mỗi mục (bản đầy đủ).
- `kiem_tra_thuong_hieu.py` (bước 6): giọng đọc đúng hồ sơ kênh, đúng một con dấu, chữ ký âm thanh đúng lúc, `out/seo.md` có đủ các nền tảng chính và dòng "Giọng đọc: AI".
- `kiem_tra_ban_quyen.py` (bước 6): nguồn clip, lời đọc trùng với video gần đây, từ khoá rủi ro.
- Agent `phan-bien-video` hỏi thêm: nếu che tên kênh đi, người xem còn nhận ra video này là của kênh không?
