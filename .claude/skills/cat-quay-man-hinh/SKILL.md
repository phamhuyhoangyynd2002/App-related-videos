---
name: cat-quay-man-hinh
description: Cắt đoạn đắt giá từ video tự quay màn hình điện thoại (có hoặc không có lời bình) khi dùng thử một ứng dụng, che thông tin cá nhân, rồi gắn clip vào dự án để dùng trong video ngắn. Dùng khi người dùng đưa file quay màn hình, thư mục footage, muốn "lấy đoạn hay", "cắt đoạn dùng thử", "dùng video quay màn hình của mình", hoặc khi bảng ảnh cửa hàng không đủ để minh hoạ tính năng.
argument-hint: "<thư mục footage> [thư mục dự án để gắn vào]"
---

# Cắt video quay màn hình ứng dụng

Chắt lọc từ browser-use/video-use, chuyển từ skill cắt gameplay của kênh game. Với kênh ứng dụng, **quay màn hình khi tự dùng thử là nguồn hình chính**: ảnh cửa hàng là ảnh quảng bá của nhà phát triển, còn clip tự quay cho thấy ứng dụng thật chạy ra sao. Đây cũng là phần "nội dung gốc" mạnh nhất của kênh (`.claude/rules/phong-cach-thuong-hieu.md`).

**Chỉ nhận footage do người làm video tự quay**, hoặc clip nhà phát triển gửi kèm thư cho phép (`kenh/mau-thu-xin-phep.md`). Không dùng video xem trước trên App Store/Google Play, video YouTube của nhà phát triển, video của kênh khác, kể cả khi người dùng đưa file: hỏi lại nguồn gốc file trước khi cắt. Lý do ở `.claude/rules/chinh-xac-va-ban-quyen.md` mục 3.

Gợi ý cảnh cần quay cho một dự án nằm ở `projects/<dự án>/assets/goi-y-tu-quay.md` (do agent `thu-thap-tai-nguyen` ghi).

## Cách quay (gửi người làm video trước khi quay)

- Khung dọc, độ phân giải gốc của máy; tắt xoay màn hình.
- Bật **Không làm phiền** để không hiện thông báo; ẩn thanh trạng thái nếu máy cho phép (hoặc cắt bỏ khi dựng).
- Dùng **tài khoản thử**, không dùng tài khoản thật có tên, số điện thoại, email, danh bạ, tin nhắn, số dư.
- Tắt âm thanh hệ thống; nếu muốn có lời bình thì nói khi quay, bước dưới sẽ lấy mốc từng từ.
- Mỗi tính năng quay một đoạn riêng, thao tác chậm hơn bình thường một chút, dừng 1 giây ở kết quả.
- Quay cả điểm trừ (quảng cáo bật lên, màn hình đòi trả phí, lỗi), vì phán quyết cần nói cả điểm trừ.

## Quy tắc bắt buộc (sai là hỏng file, theo video-use)

1. **Không cắt giữa một từ.** Nếu footage có lời bình, mọi điểm cắt phải nằm ở ranh giới từ trong bản ghi lời.
2. **Đệm mỗi điểm cắt 30–200 ms** (mốc nhận dạng giọng lệch 50–100 ms). Video ngắn nhịp nhanh: khoảng 50 ms trước, 80 ms sau.
3. **Fade âm 30 ms ở mỗi đầu đoạn** (`afade=t=in:st=0:d=0.03,afade=t=out:st=<dài-0.03>:d=0.03`), nếu không sẽ có tiếng "bụp".
4. **Trích từng đoạn rồi nối bằng `-c copy`**, không dùng một filtergraph lớn, để khỏi encode hai lần.
5. **Lưu bản ghi lời theo file nguồn**, không nhận dạng lại nếu file không đổi.
6. **Xác nhận kế hoạch trước khi cắt**: trình bày 4–8 câu (chọn đoạn nào, vì sao, tổng độ dài), chờ người dùng đồng ý.
7. Mọi file sinh ra nằm trong `<thư mục footage>/edit/`, không ghi vào footage gốc.
8. **Che thông tin cá nhân trước khi gắn vào dự án** (mục dưới). Clip còn lộ thông tin thì không gắn.

## Quyền riêng tư (bắt buộc)

- Xem từng đoạn: tên tài khoản, ảnh đại diện, số điện thoại, email, địa chỉ, vị trí trên bản đồ, số dư, mã QR, mã OTP, danh bạ, nội dung tin nhắn, ảnh cá nhân trong thư viện, thông báo của ứng dụng khác.
- Che bằng làm mờ vùng: `ffmpeg -i in.mp4 -filter_complex "[0:v]crop=W:H:X:Y,boxblur=20[b];[0:v][b]overlay=X:Y" -c:a copy out.mp4` (thêm `enable='between(t,A,B)'` nếu chỉ lộ trong một khoảng). Trích khung bằng `ffmpeg -ss <t> -frames:v 1` và mở bằng Read để kiểm lại sau khi che.
- Ứng dụng của người khác (chat, mạng xã hội) quay vào nội dung của người thật: che toàn bộ tên, ảnh, nội dung, hoặc không dùng đoạn đó.

## Quy trình

1. **Kiểm kê**: `ffprobe` từng file (độ dài, độ phân giải, fps, khung dọc hay ngang, có âm thanh không).
2. **Tìm đoạn đáng giá**:
   - Có lời bình: nhận dạng lời theo từng từ (`npx hyperframes transcribe <file> --model small`, hoặc faster-whisper `word_timestamps=True`, `language="vi"`), gộp thành câu kèm `[bắt đầu–kết thúc]` vào `edit/takes_packed.md`, ngắt câu ở chỗ im lặng ≥ 0,5 giây.
   - Không lời bình: dò đổi màn hình `ffmpeg -i <file> -vf "select='gt(scene,0.2)',showinfo" -an -f null -`, rồi trích vài khung quanh mỗi lần đổi và mở bằng Read để xem đó là thao tác gì.
3. **Kế hoạch cắt**: ghi `edit/edl.json` gồm `source`, `start`, `end`, `beat` (HOOK / TINH-NANG / KET-QUA / DIEM-TRU), `reason`. Đoạn làm hook là **kết quả** gây bất ngờ nhất (ảnh sau khi xử lý, câu trả lời của AI), không phải màn hình mở ứng dụng.
4. **Tăng nhịp**: thao tác gõ chữ, chờ tải thì tăng tốc 1,5–3 lần (`setpts=PTS/2`), hoặc cắt bỏ phần chờ. Không để màn hình đứng yên quá 2 giây.
5. **Che thông tin cá nhân** (mục trên).
6. **Xuất**: trích từng đoạn (đệm + fade âm), nối `-c copy`, lưu `edit/clips/<ung-dung>.mp4`. Mỗi ứng dụng **một clip** (template phát một clip mỗi cảnh, chọn đoạn bằng `from`).
7. **Gắn vào dự án**:

   ```bash
   python3 .claude/skills/cat-quay-man-hinh/scripts/gan_clip.py <dự án> --app "<tên ứng dụng>" --file <thư mục footage>/edit/clips/<ung-dung>.mp4
   # clip nhà phát triển gửi: thêm --nguon giay-phep (cần assets/<khoá>/dieu-khoan.txt)
   ```

   Script chép clip vào `assets/<khoá>/clip.mp4`, ghi `clip`, `clip_origin` vào manifest và đặt lại trạng thái duyệt. Dùng clip trong `shots` bằng `{"show": "clip", "from": <giây trong clip>, "cue": "<từ khoá>"}`.
8. **Duyệt**: chạy `duyet_hinh.py tao <dự án>` (skill `lay-tai-nguyen`) và trình bảng ảnh. **Clip mới phải được người làm video duyệt ở DỪNG 2b** trước khi dựng timeline, render.
9. **Tự kiểm tra**: trích khung ±1,5 giây quanh mỗi điểm cắt, tìm giật hình và thông tin cá nhân còn sót; đo âm `ebur128` để bắt tiếng bụp. Tối đa 3 lượt sửa, sau đó báo người dùng phần còn lỗi.

Ghi quyết định cắt và lý do vào `edit/project.md`, mỗi phiên một mục, để lần sau tiếp tục mà không phải xem lại từ đầu.
