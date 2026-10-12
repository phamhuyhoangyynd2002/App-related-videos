---
name: nghien-cuu
description: Nghiên cứu một chủ đề ứng dụng điện thoại trên mạng (ứng dụng mới, ứng dụng đang lên top, giá và gói trả phí, điểm đánh giá, tính năng, quyền truy cập, tin bảo mật) và ghi research.md có nguồn cho từng thông tin. Dùng khi cần tìm thông tin cho video, cập nhật tin ứng dụng, hoặc bước 1 của /tao-video.
argument-hint: "<chủ đề hoặc thư mục dự án>"
---

# Nghiên cứu chủ đề

Đầu vào: `$ARGUMENTS`. Nếu là thư mục dự án thì đọc `brief.md`; nếu là chủ đề thì tạo dự án như Bước 0 của `/tao-video` (không hỏi, dùng mặc định).

Việc này nên giao cho agent `nghien-cuu-ung-dung` để giữ ngữ cảnh chính gọn. Nếu tự làm, theo các bước dưới.

## Cách tìm

1. Xác định khoảng thời gian: từ chủ đề ("tháng 10/2026", "tuần này") hoặc mặc định 30 ngày gần nhất. Chủ đề không gắn thời gian ("ứng dụng quét tài liệu") thì ghi ngày tra và lấy phiên bản hiện tại.
2. Tìm rộng trước (3–5 truy vấn tiếng Anh + 1–2 truy vấn tiếng Việt), ví dụ:
   - `best free document scanner app 2026`, `CamScanner alternative free`
   - `ứng dụng quét tài liệu miễn phí`, `app scan tài liệu không quảng cáo`
   - `site:apps.apple.com/vn <tên ứng dụng>` để lấy `app_store_id`
   - Bản tin tuần mới nhất ở `ke-hoach/ban-tin/` (bảng App Store VN) nếu chủ đề là "đang lên top", "ít người biết"
3. Lập danh sách ứng viên nhiều hơn số cần dùng (Top 4 → tìm 7–10 ứng dụng), rồi chọn theo góc nhìn trong `brief.md`. Với dạng "ít người biết": loại ứng dụng đang ở top 50 miễn phí App Store VN.
4. Với mỗi ứng dụng được chọn, đọc **trang cửa hàng** + ít nhất 1 nguồn khác (trang chính thức, ghi chú phát hành, báo). Lấy: tên chính xác, nhà phát triển, nền tảng, giá và các gói trả phí, bản miễn phí làm được gì, có quảng cáo không, có tiếng Việt không, dung lượng, điểm, ngày cập nhật, 2–3 tính năng nổi bật, quyền truy cập đáng chú ý.
5. **App Store Việt Nam** (không cần key): `https://itunes.apple.com/search?term=<tên>&country=vn&entity=software` hoặc `https://itunes.apple.com/lookup?id=<app_store_id>&country=vn`. Lấy `trackId` (= `app_store_id`), `artistName`, `formattedPrice`, `fileSizeBytes`, `averageUserRating`, `userRatingCount`, `contentAdvisoryRating`, `languageCodesISO2A` (có `VI` là có tiếng Việt), `version`, `currentVersionReleaseDate`, `trackViewUrl`. Giá gói trả phí trong ứng dụng không có trong API: đọc mục "Mua hàng trong ứng dụng" trên trang `apps.apple.com/vn/app/...`.
6. **Google Play**: `https://play.google.com/store/apps/details?id=<package>&hl=vi&gl=VN` (lượt tải, có quảng cáo, có mua trong ứng dụng, khoảng giá, mục "An toàn dữ liệu"). Từ mạng ngoài Việt Nam có thể trả 404 với `gl=VN`: thử `gl=US`, ghi rõ khu vực, không dùng giá khu vực khác làm giá Việt Nam.
7. **Tính năng**: chỉ ghi tính năng có trên trang chính thức, ghi chú phát hành, hoặc đã dùng thử. Ghi rõ tính năng trả phí, chỉ có trên một hệ điều hành, chỉ có ở một số nước. Đề xuất 2–4 thao tác nên tự quay khi dùng thử.
8. **Ứng dụng tài chính, sức khoẻ**: ghi đơn vị chủ quản và căn cứ có giấy phép tại Việt Nam. Không tìm được căn cứ thì đánh dấu cho DỪNG 2.

## Định dạng `research.md`

```markdown
# Nghiên cứu: <chủ đề>
Ngày tra cứu: YYYY-MM-DD · Khoảng thời gian: ...

## Ứng viên đã xem
| Ứng dụng | Hạng App Store VN (nếu có) | Lý do chọn / loại |
|---|---|---|

## <Tên ứng dụng 1>
- app_store_id: 1234567890 (thấy tại https://apps.apple.com/vn/app/.../id1234567890) | null · play_package: com.hang.ungdung | null · nền tảng: both | ios | android | web
- Nhà phát triển (đúng như trên cửa hàng): ...
- Việc nó giải quyết (một câu): ...
- Điểm nổi bật: ...
- Vì sao hợp góc nhìn của video: ...
- Nên tự quay: thao tác 1 (3–5 giây, kết quả thấy được), thao tác 2, điểm trừ (quảng cáo / màn hình đòi trả phí)

### Số liệu
| Mục | Giá trị | Nguồn | Ngày nguồn |
|---|---|---|---|
| Giá | Miễn phí, gói Pro 99.000đ/tháng | [S1] | 2026-10-12 (ngày tra) |
| Có quảng cáo | Có | [S2] | 2026-10-12 |
| Tiếng Việt | Có | [S1] | 2026-10-12 |

### Tính năng (đã kiểm chứng)
| Tính năng | Miễn phí / trả phí | Nền tảng | Nguồn hoặc "đã dùng thử" |
|---|---|---|---|

### Chất liệu vui
- Chỗ vô lý: ... [S2]
- Người dùng hay than: ... (người dùng nói, [S3])

## Mâu thuẫn / chưa chắc chắn
- ...

## Nguồn
- [S1] Tiêu đề – https://... (ngày đăng hoặc ngày tra)
```

## Quy tắc

- Tuân thủ `.claude/rules/chinh-xac-va-ban-quyen.md`, đặc biệt mục 2 (tính năng phải kiểm chứng) và mục 7 (ứng dụng không giới thiệu).
- Không đưa vào `research.md` thông tin không có nguồn.
- Kết thúc bằng một dòng tóm tắt: số ứng dụng đã chọn, số nguồn, số điểm chưa chắc chắn.
