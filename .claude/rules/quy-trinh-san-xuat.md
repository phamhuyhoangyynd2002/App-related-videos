# Quy trình sản xuất video

## Nguyên tắc làm việc với người làm video

- Người làm video chỉ làm 4 việc: nêu chủ đề + ý chính, xác nhận thông tin/kịch bản, duyệt hình ảnh/video sẽ dùng, xem video cuối. Mọi việc khác Claude tự làm.
- Chỉ hỏi khi thiếu thông tin **không thể tự suy ra hợp lý**. Nếu có mặc định hợp lý thì dùng mặc định và ghi vào `brief.md`.
- Khi hỏi, dùng câu hỏi trắc nghiệm (AskUserQuestion), gộp tất cả câu hỏi của một điểm dừng vào **một lần hỏi**.
- Không bao giờ tự đăng video lên YouTube/TikTok hay bất kỳ nền tảng nào.
- **Đọc bộ nhớ kênh trước khi hỏi**: `kenh/ho-so-kenh.md` (kênh, giọng, khán giả), `kenh/series.md` (công thức đã duyệt), `kenh/bai-hoc.md` (bài học từ số liệu). Điều gì đã có ở đó thì không hỏi lại.
- Quy tắc trong các skill chia làm hai loại: **quy tắc bắt buộc** (sai là hỏng: số liệu, bản quyền, lỗi render) và **ví dụ đã chứng minh** (công thức hook, bố cục, màu). Loại thứ hai được phép làm khác khi nội dung cần, miễn ghi lý do vào `nhat-ky.md`.

## Giá trị mặc định

| Mục | Mặc định |
|---|---|
| Khung hình | `vertical` (1080×1920, 30 fps). `horizontal` chỉ khi người dùng yêu cầu rõ |
| Nền tảng đăng | TikTok, YouTube Shorts, Facebook Reels; Instagram Reels đăng thêm (một video dùng chung, danh sách trong `kenh/ho-so-kenh.md`) |
| Template | Suy ra từ chủ đề: "top N", "tier", "xếp hạng" bản đầy đủ → `tier-board` (bảng SSS→D xuyên suốt, mặc định từ 29/09/2026), bản gọn top 3, "N ứng dụng ít người biết" → `top-list`, "tin", "cập nhật" → `news`, một ứng dụng "có đáng cài / đáng trả tiền không" → `news` (bản nhanh, có con dấu phán quyết) |
| Độ dài | Dọc: bản đầy đủ 2–3 phút, 5–7 mục (top-list, tier-list); bản nhanh 13–25 giây (một ứng dụng, một mẹo, một tin); bản gọn 45–60 giây khi người dùng chọn. Bản dài 3–5 phút chỉ khi người dùng yêu cầu, không bao giờ quá 5 phút. Ngang: 3–8 phút |
| Chế độ | `cong-tac` (dừng đủ 4 điểm), trừ khi `kenh/ho-so-kenh.md` hoặc người dùng chọn `tu-dong` |
| Độ lầy | Theo `kenh/ho-so-kenh.md` (thang ở `kenh/cam-nang-phong-cach.md`); mức 1 cho tin có yếu tố pháp lý, bảo mật, lừa đảo, sự cố thật |
| Giọng đọc | `vi-VN-NamMinhNeural` (giọng nam, hợp "Anh Lười"), tốc độ `+40%` cho video dọc (chốt 13/10/2026, kèm rút nghỉ 0,17 giây: khoảng 4,1 âm tiết/giây), `+0%` cho video ngang. Tên ứng dụng đọc theo `kenh/phat-am.json` |
| Nhạc nền | **Hỏi người dùng ở DỪNG 2** (chốt 29/09/2026): đề xuất 2–3 bài trong `music/` hợp tâm trạng video (bảng gợi ý cuối `music/GIAY-PHEP.md`), ưu tiên bài vui nhộn, nhịp nhanh. Chế độ `tu-dong`: chọn bài đầu tiên của nhóm hợp tâm trạng. Trộn sau khi render, tự giảm âm lượng khi có lời đọc |
| Ngày của dự án | Ngày hiện tại, dạng `YYYY-MM-DD` |

## Bốn điểm dừng bắt buộc

1. **DỪNG 1 – Xác nhận brief** (chỉ khi thiếu ý, bỏ qua ở chế độ `tu-dong` và khi làm tiếp series): hỏi góc nhìn riêng, độ dài (bản nhanh hay bản đầy đủ), ứng dụng bắt buộc có hoặc loại, nền tảng (iOS, Android, cả hai).
2. **DỪNG 2 – Duyệt kịch bản như một đề xuất**: mở đầu bằng "Video này nói với [ai] rằng [điều gì]", rồi bảng cảnh (nhịp, lời đọc, chữ trên màn hình, vì sao), **phán quyết của video** (nhãn con dấu, lý do, ai nên chơi), **độ lầy** (mức, 3 câu đùa mạnh nhất, gag hình chính), 2 phương án hook thay thế, bảng số liệu kèm nguồn và kết quả kiểm chứng, và **2–3 bài nhạc nền đề xuất** để người dùng chọn (gộp chung một lần hỏi). Người làm video duyệt tức là xác nhận phán quyết; ghi vào `nhat-ky.md`. Ở chế độ `tu-dong` chỉ đăng tóm tắt rồi chạy tiếp, **trừ khi** còn số liệu SAI/KHÔNG RÕ.
2b. **DỪNG 2b – Duyệt hình ảnh, video** (thêm ngày 05/10/2026), ngay sau DỪNG 2, trước giọng đọc và render: chạy `duyet_hinh.py tao` (skill `lay-tai-nguyen`) để có `assets/bang-anh.jpg` (mỗi ảnh, clip một số) và `assets/duyet-hinh.md` (nguồn, căn cứ, ảnh nào dùng ở cảnh nào). Trình bảng ảnh, các cảnh báo tài nguyên, và `assets/goi-y-tu-quay.md` (cảnh nên tự quay) nếu có. Hỏi một lần: duyệt hết / loại một số (ghi số và lý do) / tự quay màn hình thay ảnh cửa hàng. Ghi kết quả bằng `duyet_hinh.py ghi`; script tự gỡ ảnh bị loại khỏi manifest và sửa `shots` trong `script.json` (có sao lưu). Thêm, đổi tài nguyên sau đó (lấy lại ảnh, gắn clip quay màn hình) thì phải duyệt lại; `duyet_hinh.py kiem` là cổng trước bước giọng đọc và render. Ở chế độ `tu-dong`: chỉ dừng khi có cảnh báo tài nguyên (khớp tên gần đúng, ứng dụng 17+, ứng dụng tài chính, ảnh có chữ quảng bá, clip quay màn hình mới); không có thì đăng bảng ảnh, ghi `duyet_hinh.py ghi --duyet-het` kèm ghi chú "tự duyệt (tu-dong)" trong `nhat-ky.md`, rồi chạy tiếp.
3. **DỪNG 3 – Xem video**: đưa đường dẫn `out/video.mp4` và `out/video-no-music.mp4`, tóm tắt `out/qa-report.md` và `out/seo.md` (caption riêng cho từng nền tảng). Ở chế độ `tu-dong`, người làm video xác nhận phán quyết tại đây. Nhắc các việc khi đăng: nhãn AI theo chính sách trong hồ sơ kênh, công bố tài trợ nếu có. Người dùng tự đăng.

## Hợp đồng file (thư mục `projects/<YYYY-MM-DD>-<slug>/`)

| File | Bước tạo ra | Nội dung |
|---|---|---|
| `brief.md` | 0 – nhận yêu cầu | Chủ đề, thông điệp nháp, ý chính, góc nhìn, series, chế độ, template, độ dài, độ lầy, ứng dụng bắt buộc, nền tảng, mặc định đã áp dụng |
| `nhat-ky.md` | mọi bước | Mỗi bước một dòng: đã làm gì, quyết định gì, vì sao. Khi tiếp tục dự án, đọc và tóm tắt phiên trước trong một câu |
| `research.md` | 1 – nghiên cứu | Ghi chú theo từng ứng dụng/tin, bảng số liệu có cột nguồn, tính năng đã kiểm chứng, mục "Chất liệu lầy" có nguồn, danh sách nguồn |
| `script.json` | 1 – kịch bản | Đúng schema trong skill `viet-kich-ban` |
| `fact-check.md` | 1 – kiểm chứng | Kết quả đối chiếu từng số liệu: ĐÚNG / SAI / KHÔNG RÕ |
| `assets/manifest.json` + ảnh, clip | 2 – tài nguyên | Đường dẫn file theo `appid`, nguồn, cảnh báo khớp tên; mục `duyet` (số thứ tự, trạng thái duyệt, mã băm từng file) và `loai` (ảnh bị loại, lý do) |
| `assets/bang-anh.jpg`, `assets/duyet-hinh.md` | 2b – duyệt hình | Bảng ảnh đánh số và bảng duyệt do `duyet_hinh.py` sinh |
| `assets/goi-y-tu-quay.md` | 2 – tài nguyên | Danh sách cảnh nên tự quay màn hình, khớp với lời đọc |
| `audio/scene-<id>.mp3` + `audio/subtitles.json` | 3 – giọng đọc | Mốc thời gian từng từ, tính từ đầu mỗi cảnh |
| `timeline.json` | 4 – timing | Mốc tuyệt đối của cảnh, từ, nhịp hình (`shots`), cụm phụ đề (`captions`), sfx, nhạc |
| `render/` | 5 – dựng | Composition HyperFrames đã chèn dữ liệu |
| `out/video.mp4`, `out/video-no-music.mp4` | 5 – render | Video cuối có nhạc và bản chỉ có giọng đọc |
| `out/audio-report.json` | 5 – trộn âm | Độ lớn âm thanh đo được từng file, từng đoạn |
| `ban-quyen.md` | 6 – kiểm định | Hồ sơ chứng minh bản quyền do `kiem_tra_ban_quyen.py` sinh: nguồn, chủ sở hữu, căn cứ, giấy phép nhạc/sfx/font, tài trợ. Còn mục CHẶN thì không giao video. Giữ ít nhất 12 tháng |
| `out/qa-report.md`, `out/phan-bien.md` | 6 – kiểm định | Kiểm tra kỹ thuật; phản biện nội dung kèm 5 việc nên sửa |
| `so-lieu.md` | sau khi đăng | Số liệu người dùng dán vào `/phan-tich-hieu-qua` |
| `out/seo.md` | 7 – đăng bài | Caption, tiêu đề, hashtag, chữ ảnh bìa riêng cho từng nền tảng trong hồ sơ kênh (TikTok, YouTube Shorts, Facebook Reels; Instagram Reels nếu đăng) |

## Chạy lại và phụ thuộc

- Bước sau luôn đọc lại file của bước trước, không dùng dữ liệu trong trí nhớ hội thoại.
- Khi một file thay đổi, mọi file phía sau nó bị coi là cũ và phải tạo lại. Ví dụ: sửa lời đọc trong `script.json` thì phải chạy lại giọng đọc, timing và render, nhưng **không** cần lấy lại tài nguyên.
- Đổi giọng đọc hoặc tốc độ: chỉ chạy lại từ bước 3.
- Đổi template hoặc khung hình: chỉ chạy lại bước 4 và 5.
- Loại hoặc thêm ảnh, clip ở DỪNG 2b: chạy lại từ bước 4 (timeline); không cần làm lại giọng đọc.
- Không xoá file của người dùng đã sửa tay. Trước khi ghi đè `script.json`, sao lưu thành `script.v<N>.json`.
- Nếu một file được sửa sau lần ghi cuối của Claude (xem `nhat-ky.md`), coi đó là chủ ý của người dùng: làm tiếp dựa trên bản đó, không ghi đè. Nếu thay đổi khó hiểu thì hỏi.
- Kết quả trung gian bất biến thì không tạo lại: tài nguyên đã tải, giọng đọc của cảnh không đổi lời, bản nhận dạng lời của footage.

## Chạy song song

- Việc độc lập thì giao nhiều agent cùng lúc: kiểm chứng + lấy tài nguyên; kiểm định + phản biện; SEO + render.
- Mỗi agent chỉ ghi file của mình, để các agent chạy song song không ghi đè lên nhau.
- Prompt giao cho agent phải tự đủ ý (agent không thấy hội thoại): thư mục dự án, file đầu vào, file đầu ra, tiêu chí xong.

## Báo cáo tiến độ

- Sau mỗi bước, báo một dòng: bước nào xong, file nào được tạo, có cảnh báo gì.
- Lỗi ở một ứng dụng (không tìm thấy trên cửa hàng, thiếu ảnh) không được làm dừng cả luồng: ghi cảnh báo, dùng phương án dự phòng, báo lại ở điểm dừng kế tiếp.
- Nếu một bước thất bại hẳn (ví dụ render lỗi), báo nguyên văn lỗi và cách đã thử, không báo là xong.
