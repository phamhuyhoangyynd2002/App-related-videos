# App-related-videos (AppReel)

> Bộ công cụ làm video ngắn dọc về ứng dụng điện thoại cho TikTok, YouTube Shorts, Facebook Reels. Tạo ngày 12/10/2026 bằng cách chuyển bộ công cụ của kênh game [Gaming-related-videos](../Gaming-related-videos) (GameReel) sang chủ đề ứng dụng. Người yêu cầu: Hoàng Phạm.

## 1. Mục tiêu

Chỉ cần nhập **một chủ đề** (ví dụ "4 ứng dụng quét tài liệu miễn phí cho sinh viên"), hệ thống tự làm:

1. Tìm thông tin ứng dụng (cửa hàng, trang chính thức, báo), có ghi nguồn.
2. Viết kịch bản chia cảnh, có phán quyết và nói cả điểm trừ.
3. Lấy icon, screenshot, số liệu từ App Store Việt Nam và Google Play; gợi ý những thao tác người làm video nên **tự quay màn hình**.
4. Cắt clip tự quay, che thông tin cá nhân, gắn vào video.
5. Tạo giọng đọc tiếng Việt và phụ đề có mốc thời gian từng từ.
6. Dựng video motion graphics bằng HyperFrames, xuất MP4 9:16.
7. Tự kiểm tra kỹ thuật, bản quyền, nhận diện; viết caption cho từng nền tảng.

Người làm video duyệt kịch bản (DỪNG 2), duyệt ảnh và clip (DỪNG 2b), xem video cuối (DỪNG 3) và tự đăng. Không tự đăng bài.

## 2. Vì sao chọn chủ đề ứng dụng

Theo [docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md](docs/danh-gia-thi-truong-pc-va-ung-dung-2026-10-12.md) (số đo ngày 12/10/2026):
- Việt Nam có 2,88 tỉ lượt cài ứng dụng năm 2025, đứng thứ 11 thế giới (Adjust).
- Kênh công nghệ Việt trên TikTok có trung vị 51.250–880.550 lượt xem mỗi video, nhưng chưa tìm thấy kênh Việt **chuyên** giới thiệu ứng dụng.
- Dạng "N ứng dụng ít người biết" và series "Top ứng dụng hay của tháng" có kênh chuyên ở nước ngoài, Trung Quốc với lượt xem cao (Hayls World: Shorts trung vị 373.000; HowToMen: 145.597–304.188 lượt mỗi tập), Việt Nam chỉ thấy rải rác.

## 3. Luồng xử lý

```
Chủ đề
  │
  ▼
[1] nghiên cứu   agent nghien-cuu-ung-dung ──► research.md ─► script.json (validate_script.py) ─► fact-check.md
  │                                                                        DỪNG 2: duyệt kịch bản
  ▼
[2] tài nguyên   store_assets.py (App Store VN, Google Play) ──► assets/<khoá>/icon, shot-N, manifest.json
                 gan_clip.py (clip tự quay màn hình)             assets/goi-y-tu-quay.md
                 duyet_hinh.py tao / ghi / kiem                   DỪNG 2b: duyệt bảng ảnh, clip
  │
  ▼
[3] giọng đọc    tts_edge.py (Edge nháp / Azure) hoặc nhap_audio_ngoai.py (Vbee…) ─► audio/ + subtitles.json
  │
  ▼
[4] timeline     build_timeline.py ──► timeline.json (cảnh, nhịp hình theo từ khoá, phụ đề, sfx, con dấu)
  │
  ▼
[5] render       prepare_render.py + HyperFrames (templates/top-list | tier-board) + mix_audio.py ─► out/*.mp4
  │
  ▼
[6] kiểm tra     kiem_tra_ban_quyen.py, kiem_tra_thuong_hieu.py, nghe_lai.py, agent kiem-dinh + phan-bien
  │
  ▼
[7] đăng bài     agent seo-mang-xa-hoi ──► out/seo.md                     DỪNG 3: xem video, tự đăng
```

## 4. Đã chuyển gì từ kênh game

| Phần | Trạng thái |
|---|---|
| Giọng đọc, phụ đề, timeline, render, trộn âm (`long-tieng`, `xuat-video`) | Giữ nguyên, đổi trường `game` → `app` |
| Template HyperFrames (`top-list`, `tier-board`), gag, kiểu hình | Giữ nguyên; `trailer` → `clip`; tên kênh, logo, linh vật thành tham số, thiếu file thì tự ẩn |
| Kịch bản (`viet-kich-ban`, schema, hook, kế hoạch hình, validator) | Chuyển sang ứng dụng; thêm kiểu hook `ket-qua-truoc`; luật kiểm chứng tính năng |
| Kiểm tra (`kiem-tra-video`, hai script kiểm tra) | Bỏ luật trailer; thêm nguồn clip, quyền riêng tư, từ khoá rủi ro của ứng dụng |
| Tài nguyên (`lay-tai-nguyen`) | Bỏ Steam; App Store, Google Play là nguồn ảnh; clip tự quay là nguồn hình chính |
| Cắt video (`cat-gameplay` → `cat-quay-man-hinh`) | Viết lại cho quay màn hình; thêm `gan_clip.py` |
| Nghiên cứu, gợi ý chủ đề, bản tin tuần | Viết lại; `bang_xep_hang.py` lấy top ứng dụng App Store VN (bỏ game), ứng dụng AI, ứng dụng mới lọt top |
| Quy tắc bản quyền, thương hiệu | Viết lại cho ứng dụng; nhãn con dấu đọc từ hồ sơ kênh |
| Hồ sơ kênh, cẩm nang, linh vật, series, bài học | Khung mới; nhận diện để TODO; 5 series đề xuất; bài học kế thừa ghi riêng |
| Nhạc (CC BY 4.0), sfx tự tạo, font OFL, GSAP | Chép sang (giấy phép cho dùng ở kênh khác); chữ ký âm thanh làm mới |
| Không chép | Tên, logo, linh vật Vừa, câu ký tên của Game Vừa Ví; `steam_assets.py`; dự án, bản tin game |

Tài liệu nghiên cứu của kênh game (khán giả, kênh mẫu, video mẫu, đánh giá 3 giây đầu) để ở [docs/tham-khao-kenh-game/](docs/tham-khao-kenh-game/) vì nhiều kết luận về nền tảng và cách dựng vẫn dùng được.

## 5. Việc cần làm trước video đầu tiên

- [ ] `/thiet-lap-kenh`: tên kênh, lời hứa, giọng văn, xưng hô, câu ký tên, nhãn con dấu, màu, font
- [ ] Logo `templates/_shared/logo.png`; sửa `BRAND_NAME`, `BRAND_TAG` trong `templates/_shared/appreel.js`
- [ ] Quyết định có linh vật không; nếu có, tạo bộ biểu cảm theo `kenh/nhan-vat.md`
- [ ] Nghe thử `sfx/chu-ky.wav` (bản nháp)
- [ ] Chọn giọng đọc, ghi vào hồ sơ kênh
- [ ] Xác nhận lại rủi ro điều khoản Apple/Google khi dùng ảnh cửa hàng (`.claude/rules/chinh-xac-va-ban-quyen.md` mục 3)
- [ ] Chuẩn bị điện thoại quay màn hình (tài khoản thử, chế độ Không làm phiền)
- [ ] `pip install google-play-scraper pyvi pillow`, `npx hyperframes doctor`

## 6. Rủi ro và lưu ý

- **Tính năng sai**: người xem cài về là thấy ngay. Mọi tính năng phải dùng thử hoặc có nguồn chính thức; DỪNG 2 liệt kê tính năng chưa kiểm chứng.
- **Ứng dụng giả mạo, ăn theo tên lớn**: luôn so nhà phát triển trên cửa hàng.
- **Quyền riêng tư**: clip quay màn hình dễ lộ thông tin cá nhân; kiểm định coi đó là lỗi Chặn.
- **Ứng dụng tài chính, cho vay, "kiếm tiền"**: dễ vướng pháp luật, lừa đảo; có danh sách không giới thiệu.
- **Tài trợ, mã giới thiệu**: kênh ứng dụng hay được mời; phải công bố theo Luật Quảng cáo sửa đổi 2025.
- **Nội dung không nguyên bản**: đọc lại mô tả cửa hàng trên nền ảnh cửa hàng là đúng thứ YouTube, Meta hạ hiển thị; clip tự quay và nhận định riêng là hàng rào chính.
- **Hai repo dùng chung mã**: sửa lỗi ở phần dùng chung (giọng đọc, timeline, render, template) thì cân nhắc sửa cả bên kênh game.
