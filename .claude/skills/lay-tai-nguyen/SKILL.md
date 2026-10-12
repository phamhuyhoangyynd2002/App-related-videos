---
name: lay-tai-nguyen
description: Lấy icon, screenshot và số liệu chính thức của ứng dụng điện thoại từ App Store và Google Play (dự phòng press kit, ảnh và clip tự quay màn hình, clip nhà phát triển cho phép) cho các ứng dụng trong script.json, ghi assets/manifest.json và gợi ý cảnh nên tự quay; tạo bảng ảnh đánh số để người làm video duyệt, loại ảnh (DỪNG 2b). Dùng ở bước 2 của /tao-video, khi cần đổi, lấy lại ảnh của một ứng dụng, hoặc khi người dùng muốn xem, duyệt, loại hình ảnh, video sẽ dùng.
argument-hint: "<thư mục dự án> [--only <app_store_id|play_package|tên ứng dụng>]"
---

# Lấy tài nguyên hình ảnh

Đầu vào: `$ARGUMENTS`.

## Nguồn hình, theo thứ tự ưu tiên

1. **Clip, ảnh tự quay màn hình** khi người làm video dùng thử ứng dụng (skill `/cat-quay-man-hinh`): `origin`/`clip_origin: "tu-quay"`. Đây là hình chính của kênh: cho thấy ứng dụng thật, an toàn bản quyền nhất, và là phần nội dung gốc.
2. **Icon, screenshot trên App Store / Google Play** (`store_assets.py`): `basis: "trich-dan-binh-luan"`. Là ảnh quảng bá của nhà phát triển, dùng để giới thiệu nhanh và làm icon trên bảng xếp hạng.
3. **Press kit, media kit chính thức** của nhà phát triển: lưu điều khoản vào `assets/<khoá>/dieu-khoan.txt`, `origin: "press-kit"`. Press kit chỉ cho báo chí hoặc cấm thương mại thì không dùng.
4. **Clip, ảnh nhà phát triển gửi sau khi xin phép** (`kenh/mau-thu-xin-phep.md`): `clip_origin: "giay-phep"`, lưu thư vào `assets/<khoá>/dieu-khoan.txt` và `kenh/bang-chung/`.

**Không bao giờ** dùng: video xem trước trên cửa hàng, video YouTube của nhà phát triển, video và ảnh chụp từ kênh khác, ảnh Google Images/Pinterest, ảnh có watermark của báo hoặc kênh khác, huy hiệu "Download on the App Store"/"Get it on Google Play", ảnh giao diện do AI vẽ giả. Căn cứ: `.claude/rules/chinh-xac-va-ban-quyen.md` mục 3.

## Ảnh và số liệu cửa hàng

```bash
pip3 install --user google-play-scraper   # một lần, cho Google Play
python3 .claude/skills/lay-tai-nguyen/scripts/store_assets.py <thư mục dự án> [--only "<tên ứng dụng>"]
```

Mỗi cảnh có `app` trong `script.json` được lấy theo `app_store_id` / `play_package`, không có thì tìm theo tên (App Store Việt Nam, ưu tiên kết quả không phải game). `"platform": "android"` bỏ qua App Store; `"platform": "web"` bỏ qua cửa hàng (dùng ảnh, clip tự quay). Mỗi ứng dụng ghi vào `assets/<ios-id | gp-package>/`:
- `icon.jpg` (512×512): icon trên bảng xếp hạng tier-board.
- `shot-1.jpg`… (rộng 2000px): App Store iPhone → iPad → Google Play. `header` là screenshot ngang đầu tiên, không có thì dùng icon.
- `appstore.json`, `googleplay.json`: dữ liệu thô để agent kiểm chứng. Manifest gom ở `store`: giá, dung lượng, điểm, lượt đánh giá, độ tuổi, phiên bản, thể loại, **có tiếng Việt không** (App Store VN); lượt tải, có quảng cáo, có mua trong ứng dụng, khoảng giá gói (Google Play).
- Không tải video: App Store API không trả video, video trên Google Play là link YouTube.

| Cảnh báo | Cách xử lý |
|---|---|
| Khớp gần đúng (`fuzzy`) | Mở `appstore.json`, so `trackName`, `artistName` với `research.md`. Sai thì tìm id đúng (số sau `id` trong `apps.apple.com/vn/app/.../id<số>`), ghi `app_store_id` vào `script.json`, chạy lại với `--only`. Ứng dụng giả mạo, "ăn theo" tên lớn rất nhiều: luôn so nhà phát triển |
| Không hỗ trợ tiếng Việt | Nói rõ trong lời đọc hoặc thẻ `facts` ("Chưa có tiếng Việt") |
| Ứng dụng tài chính | Xác minh giấy phép tại Việt Nam trước khi khen (rules mục 7); ghi vào `nhat-ky.md` |
| Google Play VN không truy cập được | Số liệu Google Play là khu vực US: lượt tải, điểm dùng được; **giá** lấy từ App Store VN hoặc ghi rõ "giá Google Play (US)" |
| Toàn screenshot dọc | Bình thường với ứng dụng: template top-list dùng bố cục ảnh dọc (khung điện thoại) |
| Ảnh quảng bá | Mở từng ảnh bằng Read. Loại ảnh có huy hiệu cửa hàng, chữ quảng cáo nói quá ("#1 app"), người thật, bản đồ sai chủ quyền. Ghi ảnh đã loại vào `nhat-ky.md` |
| Không có trên cả hai cửa hàng | Công cụ web hoặc ứng dụng đã gỡ: dùng ảnh, clip tự quay; ứng dụng đã bị gỡ thì nói rõ trong video |

## Gợi ý cảnh nên tự quay

Ảnh cửa hàng không cho thấy ứng dụng chạy thật, nên **mọi dự án** ghi `assets/goi-y-tu-quay.md`: mỗi ứng dụng 2–4 cảnh nên quay, khớp `cue` trong lời đọc. Ví dụ: "cảnh 3 «xoá phông»: chọn một ảnh chân dung, bấm Xoá phông, dừng 1 giây ở kết quả; 4–5 giây". Kèm cách quay ở skill `/cat-quay-man-hinh` (khung dọc, Không làm phiền, tài khoản thử). Ưu tiên quay: kết quả gây bất ngờ (cho hook), tính năng chính, và điểm trừ (quảng cáo, màn hình đòi trả phí). Người làm video chọn ở DỪNG 2b có tự quay hay không.

## Duyệt hình ảnh, video (DỪNG 2b)

```bash
python3 .claude/skills/lay-tai-nguyen/scripts/duyet_hinh.py tao  <thư mục dự án>   # bảng ảnh đánh số
python3 .claude/skills/lay-tai-nguyen/scripts/duyet_hinh.py ghi  <thư mục dự án> --duyet-het
python3 .claude/skills/lay-tai-nguyen/scripts/duyet_hinh.py ghi  <thư mục dự án> --loai 3,7 --ly-do "3: chữ quảng bá; 7: lộ email"
python3 .claude/skills/lay-tai-nguyen/scripts/duyet_hinh.py kiem <thư mục dự án>   # cổng: mã 0 khi đã duyệt
```

- `tao`: đánh số mọi icon, screenshot, header, clip trong manifest; ghi `assets/bang-anh.jpg` (số vàng trên ảnh; dưới ảnh là loại và cảnh dùng nó; clip có nhãn VIDEO kèm độ dài) và `assets/duyet-hinh.md`. Báo LỖI và dừng nếu `manifest.scenes` không khớp ứng dụng của từng cảnh trong `script.json`.
- `ghi --loai`: gỡ ảnh bị loại khỏi manifest (giữ trong `apps.<khoá>.loai` kèm lý do), chọn lại `header`, sửa `shots` trong `script.json` trỏ tới ảnh bị loại hoặc bị dồn số (sao lưu `script.v<N>.json`).
- `kiem`: lưu mã băm từng file lúc duyệt; ảnh, clip mới hoặc bị thay sau khi duyệt, hoặc ánh xạ cảnh sai đều làm cổng thất bại.
- Thứ tự số giữ nguyên giữa `tao` và `ghi`. Lấy thêm, đổi tài nguyên, gắn clip mới thì chạy lại `tao` và duyệt lại.

## Cấu trúc manifest

```json
{
  "apps": {
    "ios-1234567890": {
      "name": "...", "store_name": "...", "match": "given|exact|fuzzy",
      "origin": "app-store|google-play|press-kit|tu-quay",
      "source": "https://apps.apple.com/vn/app/...", "rights_holder": ["Nhà phát triển"],
      "basis": "trich-dan-binh-luan|giay-phep|tu-quay",
      "icon": "assets/ios-1234567890/icon.jpg", "header": "...", "screenshots": ["..."],
      "clip": "assets/ios-1234567890/clip.mp4", "clip_origin": "tu-quay|giay-phep",
      "store": { "app_store_vn": {}, "google_play": {} }
    }
  },
  "scenes": { "2": "ios-1234567890" },
  "warnings": []
}
```

## Kiểm tra nhanh sau khi tải

- Mở 1–2 ảnh mỗi ứng dụng bằng Read: đúng ứng dụng, không watermark của báo/kênh khác, không bản đồ sai chủ quyền.
- Clip: `ffprobe -v error -show_entries format=duration -of csv=p=0 assets/<khoá>/clip.mp4`; xem lại khung đầu, giữa, cuối không lộ thông tin cá nhân.
- Đối chiếu giá, điểm, lượt tải trong manifest với `facts` trong `script.json`. Khác nhau thì ghi vào `fact-check.md` để người dùng quyết định.

Tuân thủ `.claude/rules/chinh-xac-va-ban-quyen.md` về nguồn hình ảnh.
