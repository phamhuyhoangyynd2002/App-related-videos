# AppReel – Hướng dẫn cho Claude Code

Dự án tự động hoá việc làm **video ngắn dọc 9:16 giới thiệu, xếp hạng, đánh giá ứng dụng điện thoại** (không phải game) để đăng TikTok, YouTube Shorts và Facebook Reels, Instagram Reels đăng thêm (khung ngang chỉ làm khi được yêu cầu). Tên kênh, lời hứa, giọng văn: chưa chốt, chạy `/thiet-lap-kenh` trước video đầu tiên (`kenh/ho-so-kenh.md` còn dòng TODO). Căn cứ thị trường: [docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md](docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md).

Bộ công cụ chuyển ngày 12/10/2026 từ kênh game Game Vừa Ví (`../Gaming-related-videos`, tên nội bộ GameReel). Cách viết, dựng, kiểm tra giữ nguyên; nguồn tài nguyên, quy tắc bản quyền, nghiên cứu, bản tin đã viết lại cho ứng dụng. Logo dùng chung **công thức** của chuỗi kênh (chữ cái đầu thành nhân vật có mắt, biểu tượng ngách làm miệng, bệ xếp tầng, hàng 4 biểu tượng nét rỗng; chốt 12/10/2026, prompt ở `templates/_shared/logo-nguon/prompt.md`). **Không dùng lại** tên, nhân vật Vừa, màu, chữ ký âm thanh, câu ký tên của kênh game. Sửa lỗi ở phần dùng chung (giọng đọc, timeline, render, template) thì nhắc người dùng xem có cần sửa bên repo kia không.

Người làm video chỉ **nêu chủ đề + ý chính**, **xác nhận thông tin/kịch bản**, **duyệt hình ảnh/video** (và **tự quay màn hình** khi dùng thử ứng dụng), **xem video cuối**; mọi bước còn lại Claude tự làm. Thiết kế tổng thể ở [README.md](README.md).

## Cách dùng nhanh

| Muốn làm gì | Gõ |
|---|---|
| Thiết lập kênh lần đầu (tên, giọng, màu, logo, linh vật, nhãn con dấu) | `/thiet-lap-kenh` |
| Bản tin ứng dụng thứ Hai / cập nhật thứ Năm | `/ban-tin-tuan` / `/ban-tin-tuan cap-nhat` |
| Xem kênh ứng dụng lớn nước ngoài đang làm chủ đề, app gì | `/soi-kenh-lon` |
| Chưa biết làm gì, cần gợi ý chủ đề | `/goi-y-chu-de` |
| Làm trọn một video từ chủ đề | `/tao-video 4 ứng dụng quét tài liệu miễn phí cho sinh viên` |
| Làm tiếp một series | `/tao-video series:ung-dung-it-nguoi-biet` |
| Chạy thẳng, chỉ dừng khi cần | `/tao-video <chủ đề> --tu-dong` |
| Chỉ nghiên cứu chủ đề | `/nghien-cuu <chủ đề>` |
| Viết / sửa kịch bản, đổi hook | `/viet-kich-ban <thư mục dự án> [góp ý]` |
| Lấy icon, ảnh, số liệu cửa hàng | `/lay-tai-nguyen <thư mục dự án>` |
| Cắt video tự quay màn hình, gắn vào dự án | `/cat-quay-man-hinh <thư mục footage> [dự án]` |
| Tạo giọng đọc + timeline | `/long-tieng <thư mục dự án>` |
| Render MP4 | `/xuat-video <thư mục dự án>` |
| Kiểm tra video trước khi đăng | `/kiem-tra-video <thư mục dự án>` |
| Caption, tiêu đề, hashtag cho từng nền tảng | `/seo-dang-bai <thư mục dự án>` |
| Dán số liệu sau khi đăng để kênh học | `/phan-tich-hieu-qua` |
| Tạo / sửa template HyperFrames | `/tao-template <tên template>` |

## Luồng xử lý

```
kenh/ (hồ sơ, series, bài học) ──────────────── đọc trước mọi việc ─────────────────────────────┐
                                                                                                 ▼
brief.md ─► research.md ─► script.json ─► assets/ ─► audio/ ─► timeline.json ─► out/video(-no-music).mp4
   ▲ DỪNG 1                     ▲ DỪNG 2      ▲ DỪNG 2b         (shots, captions,        │
 (chỉ khi thiếu ý)        (duyệt kịch bản,   (duyệt bảng ảnh,    sfx, nhạc)              ▼
                           chọn hook)         clip tự quay)                  qa-report.md + phan-bien.md + seo.md
                                                                   ▲ DỪNG 3 (xem video, tự đăng)
                                     so-lieu.md ◄── /phan-tich-hieu-qua ──► kenh/bai-hoc.md
```

- Chỉ dừng ở 4 điểm: DỪNG 1, DỪNG 2, **DỪNG 2b** (duyệt bảng ảnh `assets/bang-anh.jpg` và clip quay màn hình, trước giọng đọc) và DỪNG 3. Chế độ `tu-dong` bỏ DỪNG 1, chỉ dừng ở DỪNG 2 khi số liệu chưa chắc, ở DỪNG 2b khi tài nguyên có cảnh báo.
- **Hình chính là clip tự quay màn hình** khi dùng thử ứng dụng; ảnh cửa hàng chỉ để giới thiệu nhanh. Không bao giờ cắt video của người khác hay video xem trước trên cửa hàng.
- **Tính năng nói trong video phải đã dùng thử hoặc có nguồn chính thức.** Không giới thiệu ứng dụng bẻ khoá, phim lậu, theo dõi lén, cho vay không phép, "kiếm tiền online" (`.claude/rules/chinh-xac-va-ban-quyen.md` mục 7).
- Mỗi bước đọc file của bước trước và ghi file mới, nên có thể chạy lại riêng một bước. Mỗi video nằm trong `projects/<YYYY-MM-DD>-<slug>/`, có `nhat-ky.md` ghi quyết định từng bước.
- Trước khi trình video, Claude tự kiểm tra và tự sửa tối đa 3 vòng.

## Bộ nhớ kênh (`kenh/`)

- [ho-so-kenh.md](kenh/ho-so-kenh.md): chủ đề, khán giả, mục tiêu, giọng đọc, câu kêu gọi, nhãn con dấu. Điều gì có ở đây thì không hỏi lại.
- [series.md](kenh/series.md): công thức video; 5 series đề xuất từ báo cáo thị trường, chưa có tập nào.
- [bai-hoc.md](kenh/bai-hoc.md): bài học từ số liệu thật; có mục bài học kế thừa từ kênh game (chưa kiểm ở kênh này).
- [cam-nang-phong-cach.md](kenh/cam-nang-phong-cach.md): cách viết vui (thang độ lầy, năm chỗ bắt buộc, 15 cách gây cười, gag hình); phần nhận diện để TODO.
- [nhan-vat.md](kenh/nhan-vat.md): linh vật (chưa có) và cách tạo bộ biểu cảm bằng AI.
- [chinh-sach-nha-phat-trien.md](kenh/chinh-sach-nha-phat-trien.md), [mau-thu-xin-phep.md](kenh/mau-thu-xin-phep.md).
- Hệ thiết kế video: [templates/_shared/frame.md](templates/_shared/frame.md) (màu đang là màu kênh game, phải đổi).

## Bộ quy tắc

Nằm trong [.claude/rules/](.claude/rules/) và được nạp tự động:

- [video-ngan-da-nen-tang.md](.claude/rules/video-ngan-da-nen-tang.md): thông số, tín hiệu nền tảng chấm video, series, vùng an toàn, giữ chân người xem.
- [phong-cach-thuong-hieu.md](.claude/rules/phong-cach-thuong-hieu.md): bộ nhận diện (cố định, linh hoạt, không được), con dấu phán quyết, linh vật, meme, nội dung gốc.
- [quy-trinh-san-xuat.md](.claude/rules/quy-trinh-san-xuat.md): điểm dừng, chế độ, hợp đồng file, nhật ký, chạy song song.
- [chinh-xac-va-ban-quyen.md](.claude/rules/chinh-xac-va-ban-quyen.md): nguồn số liệu, kiểm chứng tính năng; bản quyền hình ảnh, clip, nhạc, sfx, font, giọng đọc; ứng dụng không giới thiệu; quyền riêng tư khi quay màn hình; luật Việt Nam (quảng cáo, nhãn AI); hồ sơ `ban-quyen.md`.
- [van-phong-loi-doc.md](.claude/rules/van-phong-loi-doc.md): lời đọc tiếng Việt cho TTS và chữ trên màn hình.
- [ma-nguon.md](.claude/rules/ma-nguon.md): quy ước TypeScript và cách gọi Claude API (chỉ nạp khi sửa `src/`).
- [template-hyperframes.md](.claude/rules/template-hyperframes.md): hợp đồng dữ liệu, lỗi lint hay gặp, bố cục, chuyển động (chỉ nạp khi sửa `templates/`).

## Agent chuyên trách

Định nghĩa trong [.claude/agents/](.claude/agents/). `/tao-video` tự giao việc, chạy song song khi các việc độc lập:

| Agent | Việc |
|---|---|
| `quet-xu-huong-ung-dung` | Quét một nhóm nguồn tin ứng dụng cho bản tin tuần (`/ban-tin-tuan`) |
| `nghien-cuu-ung-dung` | Tìm ứng dụng, giá, gói trả phí, tính năng, chi tiết đắt giá, ghi `research.md` kèm nguồn |
| `bien-kich-video` | Viết `script.json`: thông điệp, 3 phương án hook, vai trò cảnh, nhịp hình |
| `kiem-chung-thong-tin` | Đối chiếu từng con số, tính năng với nguồn và clip dùng thử |
| `thu-thap-tai-nguyen` | Lấy icon, screenshot, số liệu App Store, Google Play; ghi gợi ý cảnh nên tự quay |
| `bien-tap-video` | Dựng composition HyperFrames, render, trộn âm ra 2 bản MP4 |
| `kiem-dinh-video` | Kiểm tra kỹ thuật, âm lượng, bản quyền, thông tin cá nhân lộ trong clip, số liệu trên video |
| `phan-bien-video` | "Chê thẳng" như người lướt TikTok, đưa 5 việc nên sửa trước |
| `seo-mang-xa-hoi` | Caption, tiêu đề, hashtag, chữ ảnh bìa riêng cho TikTok, Shorts, Facebook Reels (Instagram nếu đăng) |

## Dữ liệu `script.json` khác kênh game

- Mỗi cảnh dùng trường `app` (`name`, `app_store_id`, `play_package`, `platform`), không dùng `game` (validator báo LỖI).
- Video động là `"show": "clip"` (clip tự quay màn hình, gắn bằng `gan_clip.py`), không có `trailer`. `"show": "icon"` dùng icon cửa hàng.
- `assets/manifest.json` gom theo `apps.<khoá>`; clip có `clip_origin` (`tu-quay` | `giay-phep`).
- Nhãn con dấu đọc từ dòng "Nhãn con dấu" của hồ sơ kênh (mặc định `CÀI NGAY`, `DÙNG THỬ`, `CHỜ GIẢM GIÁ`, `BỎ QUA`).
- Linh vật: file `templates/_shared/sticker/linh-vat-<biểu-cảm>.png`; chưa có file thì template tự ẩn.

## Môi trường cần có

- Node.js **22+** (HyperFrames), FFmpeg, Chrome/Chromium. Kiểm tra: `npx hyperframes doctor`.
- Python 3.9+ và `pip install azure-cognitiveservices-speech pyvi google-play-scraper pillow` (giọng đọc Azure; tách từ tiếng Việt cho phụ đề; số liệu Google Play; bảng ảnh). `edge-tts` chỉ cần nếu muốn làm nháp miễn phí. `/soi-kenh-lon` cần `yt-dlp` bản mới (Python 3.10+; máy chỉ có 3.9 thì chạy qua `uv`, xem skill).
- `.env`: `ANTHROPIC_API_KEY`, `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` (bắt buộc khi kênh kiếm tiền), `YOUTUBE_API_KEY` (tuỳ chọn, cho bản tin).
- Đã có sẵn (chép từ kênh game, giấy phép cho dùng ở kênh khác): nhạc Kevin MacLeod CC BY 4.0 trong `music/` (phải ghi công), sfx tự tổng hợp trong `sfx/`, font Be Vietnam Pro (OFL), GSAP. **Chưa có**: `templates/_shared/logo.png`, linh vật. `sfx/chu-ky.wav` là bản nháp mới, cần nghe thử.

## Bộ công cụ gốc nên cài (tuỳ chọn)

- **heygen-com/hyperframes**: nên cài trước khi làm template. `claude plugin marketplace add heygen-com/hyperframes` rồi `claude plugin install hyperframes@hyperframes`.
- **anthropics/skills**: dùng `skill-creator` để chạy bộ test trong `.claude/skills/*/evals/` và tối ưu mô tả skill.
- **browser-use/video-use**: khi làm nhiều với video quay màn hình có lời bình.
- **AgriciDaniel/claude-youtube**: khi cần kiểm tra toàn kênh hoặc soi đối thủ (cần YouTube API key).
- Tự đăng bài nằm ngoài phạm vi giai đoạn đầu.
