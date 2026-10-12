# Tinh hoa lấy từ các bộ công cụ tham khảo

AppReel không cài nguyên các bộ công cụ dưới đây làm lõi. Thay vào đó, mình đọc từng repo (bản clone ngày 28/09/2026), lấy những nguyên tắc hợp với **video ngắn dọc tiếng Việt, làm hằng ngày** (soạn cho kênh game, chuyển sang kênh ứng dụng ngày 12/10/2026), và đưa vào rules, skill, agent, script của dự án. Bảng dưới cho biết mỗi ý lấy từ đâu, nằm ở đâu, để khi repo gốc cập nhật thì biết chỗ nào cần xem lại.

Các con số về nền tảng (ngưỡng tỉ lệ xem hết, độ dài tốt nhất…) lấy từ tài liệu tổng hợp của claude-youtube, là định hướng chứ không phải luật. Hãy để `/phan-tich-hieu-qua` kiểm chứng lại bằng số liệu của chính kênh.

## heygen-com/hyperframes

| Ý tưởng | Áp dụng ở |
|---|---|
| Luồng có cổng kiểm tra từng bước, tiếp tục dự án từ file trên đĩa | `/tao-video` (Cổng 0–7, mục Tiếp tục dự án dở) |
| Hai chế độ cộng tác / tự động, luôn giữ câu hỏi cuối trước khi giao | `/tao-video`, `quy-trinh-san-xuat.md` |
| Trình kịch bản như một đề xuất: "Video này nói với [ai] rằng [gì]" + bảng cảnh có cột "vì sao" | DỪNG 2 trong `/tao-video` |
| Giá trị trước, bằng chứng sau; không đi theo thứ tự tài liệu nguồn; hình ảnh truy được về nguồn | `/viet-kich-ban` mục Câu chuyện |
| Nhịp hình khớp theo lời đọc, không dồn hết hình lên đầu rồi đứng yên | `shots` + `cue` trong schema, `build_timeline.py` |
| Quy tắc nhóm phụ đề (ngắt ở chỗ nghỉ và dấu câu, giới hạn số từ và thời lượng, vào sớm 0,08s) | `group_captions` trong `build_timeline.py` |
| Hệ thiết kế `frame.md` (frontmatter là giá trị bắt buộc, phần chữ là ý đồ) | `templates/_shared/frame.md`, `/thiet-lap-kenh` |
| Lưu công thức video đã duyệt để lặp lại | `kenh/series.md` |
| Danh sách lỗi lint hay gặp, luật tất định, `check` / `snapshot` / `timeline --json` / `render --quality` / `doctor` / `catalog --query` | `template-hyperframes.md`, `/xuat-video`, `/tao-template` |
| Phác tĩnh trước, làm chuyển động sau | `/tao-template` |
| `hyperframes transcribe` cho mốc từng từ | `/long-tieng`, `/cat-quay-man-hinh` |

## browser-use/video-use

| Ý tưởng | Áp dụng ở |
|---|---|
| Tách quy tắc bắt buộc (sai là hỏng) khỏi ví dụ tham khảo (được làm khác) | `quy-trinh-san-xuat.md`, `/viet-kich-ban` |
| Tự kiểm tra trước khi trình, tối đa 3 vòng | `/tao-video`, `/kiem-tra-video` |
| Agent phản biện "chê thẳng", có mốc thời gian, bằng chứng và 5 việc sửa trước | agent `phan-bien-video` |
| Không nghe được thì phải đo: loudness từng đoạn, cảnh cuối không nhỏ hẳn | `mix_audio.py` (`audio-report.json`) |
| Master một lần, loudnorm hai lượt, −14 LUFS, true peak ≤ −1 | `mix_audio.py` |
| Nhạc nhỏ 12–15 dB dưới lời, rút nhạc trước lời kêu gọi | `mix_audio.py` |
| Hiệu ứng âm thanh ít, gắn với sự kiện nhìn thấy | trường `sfx` trong schema, cảnh báo trong script |
| Hình xong đúng lúc từ đắt giá được đọc | `shots.cue`, `template-hyperframes.md` |
| Không easing linear, không hai thứ mới hiện cùng lúc, kiểm tra font đã tải | `template-hyperframes.md`, `frame.md` |
| Cắt ở ranh giới từ, đệm 30–200 ms, fade âm 30 ms, trích từng đoạn rồi nối `-c copy` | `/cat-quay-man-hinh` |
| Nhật ký dự án, tóm tắt phiên trước khi tiếp tục | `nhat-ky.md` |

## remotion-dev/skills

| Ý tưởng | Áp dụng ở |
|---|---|
| "Thiết kế video, không phải trang web": một điểm nhấn mỗi cảnh | `template-hyperframes.md`, `frame.md` |
| Cỡ chữ tối thiểu ở khung rộng 1080px (tiêu đề 84px, chữ phụ 44px) | `template-hyperframes.md`, `phan-bien-video` |
| Easing kiểu `cubic-bezier(0.16, 1, 0.3, 1)` | `frame.md` (`motion`) |
| Phụ đề kiểu TikTok đổi trang theo nhịp ngắn | quy tắc nhóm phụ đề dọc (≤ 1,3 giây) |
| Mỗi cảnh một thành phần riêng để xem trước độc lập | sub-composition mỗi loại cảnh trong `/tao-template` |
| Tôn trọng chỗ người dùng tự sửa, không ghi đè | `quy-trinh-san-xuat.md`, `/tao-video` |

Remotion không được chọn làm công cụ dựng chính vì README đã chọn HyperFrames (HTML), và Remotion yêu cầu giấy phép công ty khi đội lớn hơn mức miễn phí.

## AgriciDaniel/claude-youtube

| Ý tưởng | Áp dụng ở |
|---|---|
| Hỏi 3 điều trước mọi tư vấn: chủ đề kênh, quy mô, mục tiêu | `/thiet-lap-kenh`, `kenh/ho-so-kenh.md` |
| Tín hiệu của Shorts: tỉ lệ xem hết, xem lặp, bình luận, tỉ lệ không lướt qua; ngưỡng 60% | `video-ngan-da-nen-tang.md`, `/phan-tich-hieu-qua` |
| Hai điểm ngọt về độ dài, tránh kéo dài một ý | `/viet-kich-ban`, `validate_script.py`, `build_timeline.py` |
| Hook → giá trị dồn dập → kết nối vòng; đổi hình mỗi ≤ 3 giây | `/viet-kich-ban` |
| Nhiều phương án hook theo cơ chế tâm lý khác nhau | `hook_variants`, `hook-va-giu-chan.md` |
| Kênh video ngắn sống bằng series (tỉ lệ series / trend / mẹo) | `kenh/series.md`, `/goi-y-chu-de` |
| Gợi ý ý tưởng có chấm điểm, lịch đăng | `/goi-y-chu-de` |
| Phân tích số liệu, vòng tự hoàn thiện | `/phan-tich-hieu-qua`, `kenh/bai-hoc.md` |
| Tiêu đề Shorts 20–40 ký tự, 125 ký tự đầu của mô tả | `/seo-dang-bai` |
| Không bịa số liệu; không có dữ liệu thì nói không có | `phan-tich-hieu-qua`, `chinh-xac-va-ban-quyen.md` |

## anthropics/skills

| Ý tưởng | Áp dụng ở |
|---|---|
| Mô tả skill là cơ chế kích hoạt: nói rõ khi nào dùng, hơi "chủ động" | phần `description` của các skill |
| Giải thích "vì sao" thay vì chỉ ra lệnh bằng chữ in hoa | `/viet-kich-ban`, `/tao-video` |
| Skill ngắn, chi tiết đưa vào `references/` đọc khi cần | `viet-kich-ban/references/` |
| Bộ test cho skill (`evals/evals.json`), đo tỉ lệ kích hoạt | `viet-kich-ban/evals/`, `tao-video/evals/` |
| Thiết kế hai lượt: lập kế hoạch token rồi tự phản biện, tránh lối mặc định trông như AI làm | `/thiet-lap-kenh`, `frame.md` |

## Vincentwei1021/video-shotcraft

Bản clone ngày 12/10/2026 (Apache-2.0). Repo làm phim quảng cáo phần mềm bằng Remotion: 124 thẻ công thức chuyển động (tiếng Trung), mỗi thẻ có ý đồ, tham số khung hình, lỗi hay gặp, code mẫu; kèm bộ quy tắc thẩm mỹ dạng án lệ. Mình **không cài**: repo dùng Remotion (giấy phép riêng, công ty có thể phải trả phí) trong khi kênh dựng bằng HyperFrames, và phần lớn thẻ là lia máy 3D trên giao diện web. Chỉ lấy thẻ hợp ảnh cửa hàng, icon, khung dọc, rồi viết lại bằng GSAP.

| Ý tưởng | Áp dụng ở |
|---|---|
| Thẻ công thức: ý đồ, dùng khi nào, tham số, lỗi hay gặp, code mẫu | `templates/_shared/kieu-hinh.md` (thẻ tiếng Việt cho từng kiểu, ghi thẻ gốc) |
| `crash-zoom-punch` + khung ngắm `fui-hud-moves` | kiểu `dap-zoom`, `dap-zoom-rung` (`kieu-hinh.js`) |
| `beat-cut-moves`, `rhythm-interrupt-moves` (cắt nhảy vào gần) | kiểu `cat-nhay`: một ảnh cửa hàng thành ba nhịp hình |
| `panel-grid-moves` (ô truyện tranh xéo, ô cuối thành poster) | kiểu `chia-o` |
| `card-flip-reveal` | kiểu `lat-the` cho thẻ thông tin |
| odometer + `score-slam` | kiểu `dem-so` |
| `bottom-push-stack-wipe`, whip-pan trong `shot-transitions` | `chuyen: day-len`, `lia` giữa các mục top-list |
| `impact-feedback` (hit-counter), `before-after-slider-scrub` | gag `combo`, `keo-so-sanh` (`gags.js`) |
| P4: một thủ pháp chỉ làm nhân vật chính một lần mỗi phim | trần số lần mỗi kiểu, không lặp kiểu ở hai mục liền nhau (`validate_script.py`) |
| R4: cú đập cả khung tối đa 3 lần, còn lại chỉ động ở lớp phần tử | `validate_script.py` đếm `dap-zoom-rung`, `cat-nhay`, gag `rung` |
| R1/R3: hình rơi xuống phải có nhịp thở | độ dài tối thiểu mỗi kiểu (`build_timeline.py` cảnh báo), rút còn 0,5–1 giây cho hợp nhịp video ngắn |
| Q2: đích phóng phải đủ nét | độ phóng tự giảm khi ảnh đã `crop` |
| Q4: vệt sáng, chớp sáng chỉ một lần cho nhân vật chính | chỉ ba kiểu có chớp hoặc vệt sáng |

Không lấy: nhịp "chậm lại, giữ ≥ 1 giây" (trái luật đổi hình 1,5–2 giây của kênh), mở đầu logo và màn kết thương hiệu, thư viện sfx Mixkit (chưa qua sổ giấy phép), luồng chụp trang web, xuất JianYing.

## Khi nào nên cài nguyên bộ gốc

- **HyperFrames plugin**: nên cài khi bắt đầu làm template. Các skill của AppReel sẽ gọi `/hyperframes-core`, `/hyperframes-registry` khi có.
- **video-use**: cài khi làm nhiều với video quay màn hình có lời bình (cần ElevenLabs Scribe).
- **claude-youtube**: cài khi cần kiểm tra toàn kênh hoặc soi đối thủ (cần YouTube API key, tuỳ chọn DataForSEO).
- **anthropics/skills → skill-creator**: dùng để chạy bộ test trong `evals/` và tối ưu mô tả skill.
