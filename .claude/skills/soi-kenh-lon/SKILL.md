---
name: soi-kenh-lon
description: Theo dõi các kênh giới thiệu ứng dụng điện thoại lớn trên thế giới (YouTube, TikTok; danh sách trong references/kenh.json, như Hayls World, HowToMen, Andrew Ethan Zeng, Tyler Morgan, Valstech) đang làm chủ đề gì, nhắc ứng dụng nào, dạng video và kiểu hook nào đang ăn khách, video nào vượt trội so với chính kênh đó; tra ứng dụng có ở Việt Nam không, ghi báo cáo và sổ theo dõi qua các tuần, đề xuất chủ đề Việt hoá. Dùng khi người dùng hỏi "kênh nước ngoài đang làm gì", "soi kênh lớn", "đối thủ quốc tế", "app nào kênh lớn đang giới thiệu", "học công thức kênh nước ngoài", hoặc muốn thêm, bớt kênh theo dõi.
argument-hint: "[tên kênh | them <link kênh> | bo <tên kênh>]"
---

# Soi kênh lớn

Theo dõi kênh ứng dụng nước ngoài để biết **họ đang giới thiệu ứng dụng nào, dạng nào, hook nào đang ăn**, rồi lọc ra cái làm được cho người Việt. Ba việc, theo thứ tự ưu tiên:
1. **Ứng dụng đang được nhắc**: ứng dụng nào xuất hiện trong video mới, nhất là ứng dụng được từ 2 kênh trở lên nhắc, và có trên App Store, Google Play Việt Nam không.
2. **Video vượt trội**: video có lượt xem từ 2 lần trung vị của chính kênh trở lên. Đó là chủ đề, dạng hoặc hook đang được nền tảng đẩy.
3. **Công thức**: dạng video, series, cách đặt tiêu đề, độ dài, nhịp đăng của từng kênh qua các tuần.

Chạy mỗi tuần một lần (gợi ý chủ nhật, trước `/ban-tin-tuan` thứ Hai) hoặc khi người dùng hỏi. Kết quả là tài liệu tham khảo nội bộ, không phải `research.md` của video.

## Ranh giới bắt buộc

- **Học ý, không chép**: chỉ lấy chủ đề, dạng, cấu trúc. Không tải, không cắt, không dùng lại hình, clip, nhạc, thumbnail của họ (`.claude/rules/chinh-xac-va-ban-quyen.md` mục 3). Không dịch nguyên lời đọc hay tiêu đề của họ (mục 7, đạo văn).
- Ứng dụng họ giới thiệu **không phải nguồn**: làm video thì vẫn `/nghien-cuu`, tự dùng thử, tự quay màn hình.
- Lọc theo mục 7: bỏ ứng dụng bẻ khoá, xem phim lậu, theo dõi lén, "kiếm tiền", cho vay; ứng dụng không có ở Việt Nam chỉ ghi để tham khảo.
- Video có tài trợ (mô tả có "sponsored", "#ad", "thanks to … for sponsoring", link mã giảm giá): ghi rõ là tài trợ. Ứng dụng xuất hiện chỉ vì được tài trợ không tính là tín hiệu thị trường.
- Lượt xem là số đo lúc chạy. Video mới đăng 1–2 ngày có hệ số thấp là bình thường, không kết luận "thất bại".

## Thư mục

```
ke-hoach/soi-kenh/
├── theo-doi.md          sổ cộng dồn: ứng dụng được nhắc, dạng video, kênh qua các tuần
├── da-thay.json         video đã thấy (script dùng để chỉ tra video mới)
└── 2026-10-12/
    ├── lan-chay.json    thời điểm, khoảng video, lần chạy trước, nguồn lỗi
    ├── du-lieu/         video.json (thô), video.md (bảng đọc nhanh)
    └── bao-cao.md       báo cáo
```

## Bước 0: Thêm, bớt kênh (khi người dùng yêu cầu)

Danh sách ở [references/kenh.json](references/kenh.json). YouTube cần mã kênh `UC…`: lấy bằng `uv run --python 3.12 --with yt-dlp yt-dlp --flat-playlist --playlist-end 1 -J <link kênh> | jq -r .channel_id`. TikTok dùng tên sau `@`. Bớt kênh thì đặt `"tat": true`, không xoá. Kênh mới nên là kênh chuyên ứng dụng, từ 50.000 người theo dõi, còn đăng trong 30 ngày qua; ghi `vi_sao`. Có thể thêm kênh Bilibili, kênh Việt sau, nhưng script hiện chỉ đọc YouTube và TikTok.

## Bước 1: Lấy dữ liệu

```
uv run --python 3.12 --with yt-dlp --with google-play-scraper \
  python .claude/skills/soi-kenh-lon/scripts/quet_kenh.py            # thêm --kenh "<tên>" để soi một kênh
```

(Máy có Python 3.10+ và đã `pip install yt-dlp google-play-scraper` thì chạy thẳng `python3`.) Script lấy 30 video mới nhất mỗi tab, tính trung vị, tra chi tiết tối đa 12 video chưa thấy mỗi tab (ngày đăng, mô tả, thích, bình luận), rút link App Store, Google Play trong mô tả và tra có ở Việt Nam không. Khoảng video: từ lần chạy trước, tối đa 30 ngày. Mất khoảng 5–10 phút cho 9 kênh. Một kênh lỗi thì ghi vào "Nguồn lỗi" và làm tiếp; lỗi "page needs to be reloaded" thường do yt-dlp cũ.

## Bước 2: Đọc và phân loại

Đọc `du-lieu/video.md` (cần thì `video.json`), `kenh/ho-so-kenh.md`, `kenh/series.md`, `ke-hoach/soi-kenh/theo-doi.md` và báo cáo lần trước. Với mỗi video mới trong khoảng:

- **Dạng**: danh sách "N ứng dụng" / series theo tháng / một ứng dụng / so sánh / mẹo hệ điều hành (không phải ứng dụng) / trang web, công cụ / ứng dụng AI / tin / phụ kiện, phần cứng (ngoài phạm vi, chỉ đếm).
- **Ứng dụng được nhắc**: lấy từ link cửa hàng (script đã tra), tên trong mô tả, chương (timestamp), tiêu đề. Không đoán từ thumbnail. Ứng dụng không có link thì tra App Store VN `https://itunes.apple.com/search?term=<tên>&country=vn&entity=software` khi nó được 2 kênh trở lên nhắc hoặc nằm trong video vượt trội.
- **Hook tiêu đề**: kiểu câu (số + tính từ mạnh, "bạn không biết là có", "nên xoá ngay", câu hỏi…), không chép nguyên câu.
- **Tài trợ**: có hay không.

Mô tả TikTok thường ngắn, ít tên ứng dụng: ghi "chưa rõ ứng dụng", không đoán. Muốn biết thì người dùng tự xem video.

## Bước 3: Viết `bao-cao.md`

```markdown
# Soi kênh lớn <tu> – <den> (lần trước <ngày>)

## Tóm tắt
3–5 gạch đầu dòng: điều đáng học nhất tuần này.

## Video vượt trội (hệ số ≥ 2)
| Kênh | Video (tóm tắt tiêu đề) | Lượt xem | ×trung vị | Dạng | Vì sao có thể ăn (nhận định:) |

## Ứng dụng được nhắc
| Ứng dụng | Kênh nhắc (số kênh) | Thể loại | App Store VN | Google Play VN | Giá, có tiếng Việt? | Tài trợ? | Đã ở bản tin / dự án? |
Xếp: nhắc bởi nhiều kênh trước, rồi có trong video vượt trội. Ứng dụng không có ở VN để cuối, ghi "tham khảo".

## Dạng video và hook đang chạy
Mỗi kênh 1–2 dòng: dạng, độ dài, nhịp đăng trong khoảng, kiểu tiêu đề, thay đổi so với lần trước.

## Đề xuất cho kênh (3–5)
`/tao-video <chủ đề>` · series nào trong kenh/series.md · lấy cảm hứng từ video nào · góc Việt hoá (người Việt dùng thế nào, ứng dụng thay thế có tiếng Việt, giá ở VN) · ứng dụng nào cần tự dùng thử.

## Nguồn lỗi, điểm chưa chắc
## Danh sách video đã xem (link)
```

Mọi số liệu ghi kèm ngày đo. Nhận định của mình viết rõ "nhận định:".

## Bước 4: Cập nhật `ke-hoach/soi-kenh/theo-doi.md`

```markdown
# Sổ theo dõi kênh lớn

## Ứng dụng được nhắc
| Ứng dụng | Có ở VN | Lần đầu thấy | Số lần nhắc (kênh) theo tuần: W41 | W42 | … | Đã làm video? |

## Dạng video theo tuần (số video mới / số vượt trội)
| Dạng | W41 | W42 | … |

## Kênh
| Kênh | Trung vị W41 | W42 | … | Ghi chú (đổi dạng, ngừng đăng) |
```

Chạy lại cùng tuần ISO thì ghi đè cột tuần đó. Ứng dụng 8 tuần không được nhắc thì chuyển xuống mục "Đã nguội", không xoá.

## Bước 5: Báo lại người dùng

Tối đa 10 dòng: khoảng đã soi, số video mới, 2–3 video vượt trội, 3–5 ứng dụng đáng chú ý (có ở VN không), 1–2 công thức đáng học, 3 đề xuất kèm câu lệnh `/tao-video`, nguồn lỗi, đường dẫn báo cáo.

## Liên kết với skill khác

- `/goi-y-chu-de` và `/ban-tin-tuan` đọc `bao-cao.md` mới nhất (trong 7 ngày) làm thêm một nguồn tín hiệu; không chạy lại script.
- Ứng dụng trong mục "Ứng dụng được nhắc" có ở VN, chưa có trong `projects/`: ứng viên cho series `ung-dung-it-nguoi-biet`.
