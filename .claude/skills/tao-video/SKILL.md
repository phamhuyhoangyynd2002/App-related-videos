---
name: tao-video
description: Làm trọn một video ứng dụng điện thoại ngắn dọc (TikTok, YouTube Shorts, Facebook/Instagram Reels) từ chủ đề đến file MP4 (nghiên cứu, kịch bản, tài nguyên, giọng đọc, render, kiểm tra, SEO), chỉ dừng lại để người dùng xác nhận brief, duyệt kịch bản, duyệt hình ảnh/video sẽ dùng và xem video. Dùng khi người dùng muốn "làm video", "tạo video", "ra video về...", "làm tiếp series ...", "làm giống lần trước", hoặc đưa một chủ đề ứng dụng kèm ý chính, kể cả khi họ không nói rõ là video ngắn.
argument-hint: "<chủ đề | series:<tên>> [ý chính...] [--tu-dong] [--template top-list|news|tier-list] [--nhanh]"
---

# Làm video từ chủ đề

Bạn là người điều phối. Tự chạy các bước, giao việc nặng cho agent chuyên trách, chỉ dừng ở các điểm dừng trong `.claude/rules/quy-trinh-san-xuat.md`. Mỗi bước có một **cổng kiểm tra**: chỉ đi tiếp khi cổng đạt (cách làm của HyperFrames).

Đầu vào: `$ARGUMENTS`

## Chế độ làm việc

| Chế độ | Khi nào | Khác biệt |
|---|---|---|
| `cong-tac` (mặc định) | Video mới, chủ đề lạ | Dừng đủ 4 điểm (1, 2, 2b, 3) |
| `tu-dong` (`--tu-dong`, hoặc series đã ổn định) | Người dùng muốn chạy thẳng | Bỏ DỪNG 1. DỪNG 2 chỉ đăng tóm tắt rồi chạy tiếp, **trừ khi** `fact-check.md` có mục SAI hoặc KHÔNG RÕ thì vẫn dừng. DỪNG 2b chỉ dừng khi tài nguyên có cảnh báo, không thì tự duyệt và ghi nhật ký. DỪNG 3 luôn giữ |

Vì sao luôn giữ DỪNG 3 và dừng khi số liệu chưa chắc: một video sai sự thật hay lỗi hình đã đăng thì không rút lại được hết.

## Bước 0 – Nhận yêu cầu, tạo dự án

1. Đọc `kenh/ho-so-kenh.md`, `kenh/series.md`, `kenh/bai-hoc.md`. Những gì đã có ở đây thì **không hỏi lại**.
2. Nếu đầu vào là `series:<tên>` hoặc "làm tiếp series …": lấy toàn bộ thiết lập của series (template, độ dài, góc nhìn, hook xoay vòng, cấu trúc), đánh số tập tiếp theo.
3. Nếu đầu vào là đường dẫn tới dự án có sẵn: chuyển sang **Tiếp tục dự án dở**.
4. Tạo `projects/<YYYY-MM-DD>-<slug>/` (slug không dấu, chữ thường, nối bằng `-`, tối đa 50 ký tự).
5. **DỪNG 1** (chỉ chế độ `cong-tac`, chỉ khi thiếu): góc nhìn riêng, độ dài (bản nhanh 13–25s, bản gọn 45–60s hay đầy đủ 2–3 phút), ứng dụng bắt buộc có/loại, nền tảng (iOS, Android, cả hai), có tự quay màn hình được không. Một lần AskUserQuestion, tối đa 3 câu, phương án đề xuất đứng đầu.
6. Ghi `brief.md` và mở `nhat-ky.md`:

```markdown
# <Chủ đề>
- Thông điệp (nháp): Video này nói với <khán giả> rằng <...>
- Góc nhìn riêng: ...
- Ý chính người dùng muốn có: ...
- Series: <tên> tập <N> | không
- Chế độ: cong-tac | tu-dong
- Template: top-list | news | tier-list | tier-board · Độ dài: 13–25s | 45–60s | 2–3 phút | 3–5 phút · Số mục: 3 | 5–7 | tối đa 10
- Độ lầy: 1 | 2 | 3 | 4 (thang ở `kenh/cam-nang-phong-cach.md`; mặc định theo `kenh/ho-so-kenh.md`)
- Ứng dụng bắt buộc có: ... / Ứng dụng loại: ...
- Nền tảng: iOS | Android | cả hai · Tự quay màn hình: có (máy gì) | chưa
- Khoảng thời gian thông tin: ...
- Mặc định đã áp dụng: ...
```

**Cổng 0:** `brief.md` có thông điệp nháp, góc nhìn và độ dài.

## Bước 1 – Nghiên cứu, kịch bản, kiểm chứng

1. Giao agent `nghien-cuu-ung-dung` → `research.md`.
2. Giao agent `bien-kich-video` → `script.json` (có `message`, `role`, `hook_variants`, `shots`).
3. `python3 .claude/skills/viet-kich-ban/scripts/validate_script.py <dự án>`. Có LỖI thì sửa đến khi hết.
4. **Chạy song song** (mỗi agent ghi file riêng nên không giẫm lên nhau):
   - agent `kiem-chung-thong-tin` → `fact-check.md`
   - agent `thu-thap-tai-nguyen` → `assets/` (không phụ thuộc lời đọc nên chạy trước được)
5. Số liệu SAI thì sửa trong `script.json`, kiểm lại phần đó.

**Cổng 1:** validate không LỖI; `fact-check.md` không còn mục SAI chưa sửa.

**DỪNG 2 – trình kịch bản như một đề xuất** (cách của HyperFrames: sửa ở đây mất 30 giây, sửa sau khi render mất nhiều phút):

> **Video này nói với** [khán giả] **rằng** [thông điệp].

| Cảnh | Nhịp (loại · giây) | Lời đọc | Trên màn hình | Khoảnh khắc hình (`hinh_chinh`) | Vì sao (vai trò) |
|---|---|---|---|---|---|

- **Đường năng lượng hình** (bản đầy đủ): một dòng, vd. "#3 lật thẻ → #2 combo → #1 chia ô + con dấu". Cột "Khoảnh khắc hình" phải đọc thấy mỗi mục một vẻ, hạng 1 mạnh nhất (`.claude/skills/viet-kich-ban/references/ke-hoach-hinh.md`).

- **Phán quyết**: nhãn con dấu, lý do, ai nên dùng (từ `verdict`). Người làm video duyệt tức là xác nhận phán quyết; ghi vào `nhat-ky.md`.
- **Hook đang chọn** + 2 phương án thay thế (từ `hook_variants`), mỗi cái một dòng kèm lý do.
- **Độ lầy**: mức đang dùng, 3 câu đùa mạnh nhất, câu hạng D (nếu là tier), và các gag hình chính. Ở kênh game, người làm video từng chê kịch bản nghiêm túc, nên cho họ thấy phần này rõ.
- **Cần quay màn hình**: danh sách thao tác cần tự quay cho từng ứng dụng (từ `research.md`), để người làm video quay trong lúc chờ duyệt.
- **Số liệu**: giá trị · nguồn (tên + link) · kết quả kiểm chứng.
- **Cần bạn quyết định**: số liệu KHÔNG RÕ, nguồn mâu thuẫn, ứng dụng khớp tên gần đúng, tính năng chưa kiểm chứng, ứng dụng tài chính chưa xác minh giấy phép.
- Độ dài ước tính · template · series.

AskUserQuestion: "Duyệt" (đề xuất) / "Đổi sang hook 2" / "Đổi sang hook 3" / "Sửa theo góp ý". Khi sửa: sao lưu `script.v<N>.json`, sửa, validate lại, chỉ trình bày phần đổi.

Sau khi duyệt, nếu số cảnh hay ứng dụng của cảnh đã đổi so với lúc lấy tài nguyên (gộp, tách, thêm, bớt cảnh), chạy lại `store_assets.py` (tài nguyên đã tải không tải lại) để `manifest.scenes` khớp kịch bản mới. Ở kênh game, lần 05/10/2026 quên bước này làm hạng 1 và hạng 2 hiện nhầm ảnh của nhau; `duyet_hinh.py` giờ báo LỖI khi không khớp.

**DỪNG 2b – duyệt hình ảnh, video** (thêm 05/10/2026; vì sao: loại ảnh xấu ở đây mất vài giây, sau khi render thì phải dựng lại):

1. `python3 .claude/skills/lay-tai-nguyen/scripts/duyet_hinh.py tao <dự án>` → `assets/bang-anh.jpg` (số vàng trên mỗi ảnh, clip; dưới mỗi ảnh ghi loại ảnh và cảnh dùng nó), `assets/duyet-hinh.md`.
2. Tự xem bảng ảnh trước (Read): ảnh nào có chữ quảng bá che giao diện, ảnh trùng nhau, clip còn lộ thông tin cá nhân, ảnh không khớp lời đọc ở cảnh dùng nó. Ghi nhận xét thành gợi ý loại, không tự loại.
   **Chốt kiểu hình theo ảnh thật** (`viet-kich-ban/references/ke-hoach-hinh.md` bước 4):
   - `dap-zoom*`, `cat-nhay`: đặt `diem` trúng chi tiết lời đang nói.
   - `chia-o`: `anh` là các ảnh khác nhau thật.
   - `keo-so-sanh`: nhãn đúng nội dung hai ảnh (12/10/2026: ảnh Nối Thú đều là màn 1 nên không được ghi "VỀ MÀN 1").

   Ảnh không đáp ứng thì đổi kiểu cùng nhịp. Sao lưu `script.v<N>.json`, ghi lý do vào `nhat-ky.md`, trình cùng bảng ảnh.
3. Trình người dùng: đường dẫn bảng ảnh (bấm mở được), bảng ngắn mỗi ứng dụng (số ảnh, có clip chưa, số đang dùng, cảnh báo), gợi ý loại kèm lý do, và `assets/goi-y-tu-quay.md` (cảnh nên tự quay để thay ảnh cửa hàng).
4. AskUserQuestion một lần: "Duyệt hết" (đề xuất nếu không có cảnh báo) / "Loại theo gợi ý" / "Loại số khác (ghi số và lý do)" / "Tôi sẽ tự quay màn hình" (dừng chờ file, rồi `/cat-quay-man-hinh`, chạy lại `tao` và duyệt lại clip).
5. Ghi: `duyet_hinh.py ghi <dự án> --duyet-het` hoặc `--loai 3,7 --ly-do "3: …; 7: …"`. Script sửa `shots` trỏ tới ảnh bị loại và sao lưu `script.v<N>.json`. Ghi quyết định vào `nhat-ky.md`.

**Cổng 2b:** `duyet_hinh.py kiem <dự án>` thoát mã 0 (đã duyệt, không có tài nguyên mới hay đổi sau lần duyệt).

## Bước 2 → 7 – Tự chạy liền mạch sau khi duyệt

| Bước | Cách làm | Cổng |
|---|---|---|
| 2 Tài nguyên | Đã chạy ở bước 1 và duyệt ở DỪNG 2b; chạy lại chỉ cho ứng dụng mới đổi, rồi duyệt lại | `duyet_hinh.py kiem` mã 0 |
| 3 Giọng đọc | Skill `/long-tieng` (giọng Vbee: xuất lời đọc, chờ người dùng tải file, rồi nhập) | Mọi cảnh `timing` = `tts` hoặc `whisper`; `nghe_lai.py` mã 0 (không đọc lặp tên, không âm thanh cụt; thêm 06/10/2026) |
| 4 Timeline | Skill `/long-tieng` | Không có nhịp hình nào đứng yên > 3,5s |
| 5 Render + trộn âm | Agent `bien-tap-video` (skill `/xuat-video`) | `duyet_hinh.py kiem` mã 0 (agent không tự thêm, đổi ảnh khi chưa duyệt lại); `hyperframes check` 0 lỗi; có 2 bản MP4; `audio-report.json` ≈ −14 LUFS |
| 6 Tự kiểm tra | Agent `kiem-dinh-video` (kỹ thuật + `kiem_tra_ban_quyen.py` + `kiem_tra_thuong_hieu.py`) **song song** với agent `phan-bien-video` (nội dung, "chê thẳng") | Không lỗi Chặn; `ban-quyen.md` 0 mục CHẶN |
| 7 Đăng bài | Agent `seo-mang-xa-hoi`, chạy song song với bước 5–6 | `out/seo.md` đủ các nền tảng chính trong hồ sơ kênh (TikTok, YouTube Shorts, Facebook Reels) |

- Nếu `src/cli.ts` đã có và chạy được, ưu tiên `npx tsx src/cli.ts <bước> <dự án>` cho các bước 1–5.
- **Vòng tự sửa trước khi trình** (video-use): có lỗi Chặn hoặc 5 việc sửa đầu tiên của `phan-bien-video` mà sửa được, thì sửa → render lại → kiểm lại. Tối đa 3 vòng; quá 3 vòng thì trình kèm danh sách lỗi còn lại, không lặp mãi.
- Sau mỗi bước, thêm một dòng vào `nhat-ky.md`: làm gì, quyết định gì, vì sao.

**DỪNG 3** – Gửi người dùng:
- `out/video.mp4`, `out/video-no-music.mp4` (độ dài, dung lượng), ảnh `out/frames/t0.jpg` và bảng ảnh tổng hợp các cảnh.
- Tóm tắt kiểm định + 3 nhận xét đáng giá nhất của agent phản biện (kể cả phần chưa sửa).
- Từ `seo.md`: caption TikTok, caption Facebook Reels, tiêu đề Shorts, chữ ảnh bìa (caption Instagram nếu đăng).
- Ở chế độ `tu-dong`: nhắc phán quyết của video để người làm video xác nhận, ghi vào `nhat-ky.md`.
- **Bản quyền và tuân thủ**: kết luận của `ban-quyen.md`, các cảnh báo còn lại, và các việc chỉ người dùng làm được khi đăng: nhãn AI theo hồ sơ kênh (TikTok bật "Nội dung do AI tạo"; dòng "Giọng đọc: AI" đã có trong caption), chọn "Không dành cho trẻ em" trên YouTube, bật công bố tài trợ nếu có, dùng đúng thư viện nhạc theo loại tài khoản TikTok.
- Nhắc: người dùng tự đăng. Nếu `ban-quyen.md` còn mục CHẶN thì **không** giao video, nói rõ lỗi.
- **Đề nghị một lần**: lưu video này thành series (hoặc cập nhật series) trong `kenh/series.md`, để lần sau chỉ cần "làm tiếp series <tên>". Ở chế độ `tu-dong`, chỉ ghi câu lệnh gợi ý, không hỏi.
- Nhắc: sau 3 ngày, dán số liệu vào `/phan-tich-hieu-qua` để kênh học từ video này.

## Tiếp tục dự án dở

Đọc `nhat-ky.md` và tóm tắt phiên trước trong **một câu** trước khi làm tiếp. Xác định bước tiếp theo theo file đã có và thời gian sửa:
- Có `brief.md`, chưa có `script.json` → Bước 1.
- `script.json` mới hơn `audio/subtitles.json`, hoặc chưa có audio → đã duyệt chưa? Chưa rõ thì trình DỪNG 2.
- Có `assets/manifest.json` mà `duyet_hinh.py kiem` báo chưa duyệt → DỪNG 2b.
- `timeline.json` cũ hơn `audio/subtitles.json` → Bước 4.
- `timeline.json` mới hơn `out/video.mp4` → Bước 5.
- Có video, chưa có `qa-report.md` → Bước 6.

Nếu phát hiện người dùng đã tự sửa một file (thời gian sửa mới hơn dòng cuối trong `nhat-ky.md`), coi đó là chủ ý: làm tiếp dựa trên bản của họ, không ghi đè.

## Sửa nhanh sau khi xem video

| Người dùng yêu cầu | Chạy lại từ |
|---|---|
| Đổi hook sang phương án khác | Đổi cảnh 1 theo `hook_variants` → bước 3 cho cảnh 1 → 4 → 5 |
| Sửa lời một cảnh | Sửa `script.json` → bước 3 chỉ cho cảnh đó (`--only`) → 4 → 5 |
| Hình đổi chưa đúng lúc | Sửa `shots`/`cue` trong `script.json` → 4 → 5 |
| Đổi giọng, tốc độ đọc | Bước 3 → 4 → 5 |
| Đổi ảnh/clip một ứng dụng | Bước 2 cho ứng dụng đó (hoặc `/cat-quay-man-hinh`) → DỪNG 2b (duyệt lại) → 4 → 5 |
| Loại ảnh sau khi xem video | `duyet_hinh.py ghi --loai <số>` → 4 → 5 |
| Đổi nhạc hoặc âm lượng nhạc | Bước 4 (`--music`) → chỉ chạy lại `mix_audio.py`, không render lại |
| Làm bản dài trên 1 phút | Đặt `target_seconds`, thêm cảnh → DỪNG 2 lại |
