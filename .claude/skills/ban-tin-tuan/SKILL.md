---
name: ban-tin-tuan
description: Tổng hợp bản tin thị trường ứng dụng điện thoại (không phải game) tại Việt Nam, hai lần mỗi tuần (thứ Hai bản đầy đủ, thứ Năm bản cập nhật), từ báo công nghệ Việt Nam (VnExpress Số hoá, GenK, Tinh tế, Sforum), báo quốc tế (The Verge, TechCrunch, 9to5Mac, 9to5Google, Android Authority), bảng xếp hạng App Store Việt Nam, Google Play, cảnh báo ứng dụng lừa đảo, Google Trends VN và YouTube; lọc ứng dụng đang lên, ứng dụng mới lọt top, ứng dụng AI, tin cần làm ngay trong 48 giờ, đề xuất chủ đề video. Dùng khi người dùng muốn "bản tin tuần", "cập nhật giữa tuần", "tuần này ứng dụng nào hot", "app gì đang lên top", "xu hướng ứng dụng".
argument-hint: "[cap-nhat]"
---

# Bản tin ứng dụng điện thoại

Chuyển từ bản tin game điện thoại của kênh game (cùng cấu trúc thư mục, hai chế độ, sổ theo dõi). Công cụ theo dõi thị trường ứng dụng **tại Việt Nam** cho kênh. Ba việc, theo thứ tự ưu tiên khi phải cắt bớt:
1. **Bắt trend nhanh**: ứng dụng vừa nổ (lên top đột ngột, lan trên mạng, tin bảo mật), nên làm video trong 48 giờ.
2. **Lấy chủ đề làm video**: ứng dụng mới lọt top, ứng dụng tăng hạng mạnh, ứng dụng AI, ứng dụng ít người biết đáng giới thiệu.
3. **Hiểu thị trường**: thể loại nào đang lên, ứng dụng nào rơi khỏi top, qua các tuần.

Phạm vi: **ứng dụng không phải game** (iOS, Android, và công cụ web dùng trên điện thoại). Tin quốc tế chỉ vào bản tin khi ứng dụng có ở Việt Nam, sắp về, hoặc đủ lớn để thay đổi cách người Việt dùng điện thoại (ví dụ cập nhật lớn của iOS, Android, ChatGPT, Gemini).

Bản tin là tài liệu tham khảo nội bộ, không phải `research.md` của video. Làm video từ một chủ đề trong bản tin thì vẫn chạy `/nghien-cuu` và kiểm chứng như bình thường.

## Mỗi lần chạy

- **Một thư mục cho một lần chạy**: `ke-hoach/ban-tin/<YYYY-MM-DD>/`. Mọi file lần đó tạo ra nằm trong đó, trừ sổ cộng dồn `ke-hoach/ban-tin/theo-doi.md`. Chạy lại cùng ngày thì ghi đè thư mục đó.
- **Chỉ đọc cái mới**: khoảng tin từ lần chạy gần nhất đến hiện tại, **tối đa 7 ngày** (script tính sẵn, ghi vào `lan-chay.json`). Tin đăng trước mốc `tu` thì bỏ, trừ khi đang được bàn lại trong khoảng tin (ghi ngày gốc).
- Không nhắc lại tin đã có ở lần trước; chủ đề cũ chỉ xuất hiện lại khi có diễn biến mới.

```
ke-hoach/ban-tin/
├── theo-doi.md                 sổ cộng dồn qua mọi lần chạy
└── 2026-10-12/                 một lần chạy
    ├── lan-chay.json           thời điểm, chế độ, tuần ISO, khoảng tin, lần chạy trước
    ├── ban-tin.md              bản tin (đầy đủ hoặc cập nhật)
    ├── du-lieu/                appstore.json, trends.json, bang-xep-hang.md (script)
    └── nhom-1.md … nhom-5.md   tin thô của từng agent
```

## Hai chế độ

| | Bản đầy đủ (mặc định, thứ Hai) | Bản cập nhật (`cap-nhat`, thứ Năm) |
|---|---|---|
| Nguồn | Cả 5 nhóm | Nhóm 1 (báo VN), nhóm 5 (mạng xã hội), bảng App Store |
| Agent | 5 agent `quet-xu-huong-ung-dung` song song | 2 agent song song |
| Độ dài | Đọc 10–15 phút | Đọc 3 phút |
| Sổ theo dõi | Thêm cột tuần mới | Chỉ thêm ghi chú |

Người dùng gõ `cap-nhat` mà tuần ISO đó chưa có bản đầy đủ: báo lại, đề nghị làm bản đầy đủ thay.

## Bước 1: Chuẩn bị

1. Đọc `kenh/ho-so-kenh.md`, `kenh/series.md`, `kenh/bai-hoc.md` để chấm độ hợp kênh.
2. Mở lần chạy (không cần key):
   ```
   python3 .claude/skills/ban-tin-tuan/scripts/bang_xep_hang.py --che-do day-du   # hoặc cap-nhat
   ```
   Script lấy 3 bảng App Store VN (miễn phí, có phí, doanh thu; 200 dòng mỗi bảng, đã bỏ game), tra thông tin từng ứng dụng, Google Trends VN, rồi ghi `du-lieu/bang-xep-hang.md`: biến động MỚI, ▲▼ so với lần chạy trước, thể loại, **ứng dụng AI trong top** (lọc theo tên), **ứng dụng phát hành trong 90 ngày đã lọt bảng**, tìm kiếm thịnh hành liên quan ứng dụng. Lỗi mạng thì ghi vào "Nguồn lỗi" và làm tiếp. Không xoá thư mục lần chạy cũ.
3. Đọc `ban-tin.md` của lần chạy trước và `ke-hoach/ban-tin/theo-doi.md` (chưa có thì tạo theo mẫu ở cuối file).

## Bước 2: Giao agent quét nguồn

Đường dẫn và cách đọc từng nguồn ở [references/nguon.md](references/nguon.md). Giao song song trong **một** lượt, mỗi agent một nhóm, ghi `ke-hoach/ban-tin/<ngày>/nhom-<n>.md`. Prompt mỗi agent ghi đủ: thư mục lần chạy, khoảng tin `tu` – `den` (lấy từ `lan-chay.json`), chế độ, số nhóm, file đầu ra, đường dẫn bản tin lần trước.

| Nhóm | Nguồn | Trọng tâm |
|---|---|---|
| 1. Báo Việt Nam | VnExpress Số hoá, GenK, Tinh tế, Sforum, Dân trí Công nghệ | Ứng dụng mới, cập nhật lớn có ở VN; ứng dụng Việt; tính năng mới của Zalo, ngân hàng, ví điện tử, dịch vụ công (VNeID); tranh cãi người dùng |
| 2. Báo quốc tế | The Verge, TechCrunch, 9to5Mac, 9to5Google, MacRumors, Android Authority | Ứng dụng, tính năng mới sắp hoặc đã có ở VN; cập nhật iOS, Android ảnh hưởng tới ứng dụng; ứng dụng AI mới |
| 3. Cửa hàng và đo lường | Google Play (bảng xếp hạng, lựa chọn của biên tập), App Store (bài biên tập "Hôm nay"), Sensor Tower, Appfigures, Product Hunt | Bổ sung cho bảng App Store của script; số liệu lượt tải có nguồn |
| 4. Bảo mật và pháp lý | Cục An toàn thông tin, Bộ Công an, Ngân hàng Nhà nước, báo VN mục pháp luật | Ứng dụng giả mạo, lừa đảo, bị gỡ, bị cảnh báo; quy định mới (định danh, thanh toán, dữ liệu cá nhân) |
| 5. Mạng xã hội và tìm kiếm | Google Trends VN, YouTube, Reddit (tham khảo) | Ứng dụng, tính năng được tìm và xem nhiều tại VN; thứ đang nổ trên mạng nhưng báo chưa viết |

Bản cập nhật: chỉ giao nhóm 1 và nhóm 5.

## Bước 3: Gộp, phân loại, chấm điểm (Claude tự làm)

0. **Lọc thời gian**: bỏ tin trước `tu` hoặc đã có ở lần trước mà không có diễn biến mới.
1. **Gom cụm**: các tin cùng một ứng dụng hoặc cùng một hiện tượng thành một chủ đề (một ứng dụng, một làn sóng như "ứng dụng AI chỉnh ảnh lên top", một sự kiện như cập nhật iOS, đợt ứng dụng lừa đảo).
2. **Phân loại** mỗi chủ đề vào đúng một nhóm:
   - **Chính**: ứng dụng có trên cửa hàng ở Việt Nam, hợp pháp, không thuộc danh sách "không giới thiệu" của rules mục 7.
   - **Cảnh báo**: ứng dụng giả mạo, lừa đảo, bị gỡ, lộ dữ liệu. Làm video được theo góc **cảnh báo người dùng** (độ lầy mức 1), không giới thiệu cách dùng.
   - **Tham khảo**: game (thuộc kênh game), ứng dụng chưa có ở VN, tin doanh nghiệp không ảnh hưởng người dùng.
   - **Loại hẳn**: bản bẻ khoá, APK/IPA mod, phim lậu, theo dõi lén, cho vay không phép, "kiếm tiền online", cờ bạc, nội dung vi phạm chủ quyền, nhắm trẻ dưới 13 tuổi. Chỉ ghi một dòng tên trong "Đã loại".
3. **Chấm điểm** chủ đề nhóm Chính (mỗi tiêu chí 1–5, tổng /25):

| Tiêu chí | 1 điểm | 5 điểm |
|---|---|---|
| Độ phủ | 1 nguồn | ≥ 3 nhóm nguồn nhắc tới |
| Liên quan Việt Nam | Chỉ có tin quốc tế | Báo VN viết, có trong top App Store VN hoặc Google Trends VN |
| Đà tăng | Giảm so với lần chạy trước | MỚI hoặc tăng mạnh |
| Hợp kênh | Không giúp người xem làm được gì | Dùng được bằng tiếng Việt, bản miễn phí đủ dùng, giải một việc ai cũng gặp, hợp lời hứa trong hồ sơ kênh |
| Làm video được | Không tự dùng thử được (cần tài khoản đặc biệt, chỉ có ở nước khác) | Cài được ngay, có kết quả thấy được để quay trong 3 giây |

Điều chỉnh thêm theo `kenh/bai-hoc.md`.

4. **Tin LÀM NGAY**: chủ đề thoả cả ba: xuất hiện trong 72 giờ gần nhất (và trong khoảng tin); có tín hiệu lan nhanh (Google Trends VN, YouTube nhiều lượt xem, ≥ 2 báo VN trong 1 ngày, MỚI vào top 20 hoặc nhảy ≥ 20 hạng App Store); làm được video bản nhanh 13–25 giây trong 48 giờ (tự cài, tự quay được). Tối đa 3 tin, mỗi tin ghi hạn chót.
5. **Phân tích thị trường** (chỉ bản đầy đủ), mỗi nhận định phải trỏ về số liệu:
   - Thể loại: đếm thể loại trong top App Store (dòng "Thể loại" của `bang-xep-hang.md`), so với lần chạy trước và khoảng 4 tuần trước nếu có; nêu 2–3 thể loại lên, xuống rõ nhất.
   - Ứng dụng AI: số ứng dụng AI trong top miễn phí và thay đổi so với lần trước.
   - Ứng dụng mới lọt top: tên, bảng, hạng, ngày phát hành.
   - Lượt tải, doanh thu: chỉ số liệu công khai có nguồn. Không có thì ghi "tuần này không có số liệu công khai mới", không suy từ thứ hạng.

Không tự suy doanh thu, lượt tải từ thứ hạng, không ghi số không có nguồn. Nhận định là ý mình thì viết rõ "nhận định:".

## Bước 4: Ghi bản tin

### Bản đầy đủ `ke-hoach/ban-tin/<ngày>/ban-tin.md`

```markdown
# Bản tin ứng dụng điện thoại tuần <ww>/<YYYY> (<tu> – <den>, từ lần chạy <lan_truoc>)

## LÀM NGAY (hạn 48 giờ)
| Tin | Vì sao nóng (tín hiệu) | Video gợi ý | Hạn chót |
(không có thì ghi "Tuần này không có tin cần làm gấp")

## Tóm tắt
5 gạch đầu dòng, mỗi dòng một điều đáng nhớ nhất của tuần.

## Top 10 chủ đề hot
| # | Chủ đề | Điểm /25 | So với lần trước (MỚI / ▲ / ▼ / =) | Tín hiệu chính | Nguồn |

### 1. <chủ đề>  (lặp cho top 10, mỗi chủ đề 4–6 dòng)
- Chuyện gì: 2–3 câu.
- Số liệu: mỗi số kèm nguồn và ngày.
- Với người dùng Việt: có tiếng Việt không, bản miễn phí được gì, quảng cáo, gói trả phí bao nhiêu.
- Có ở VN: có (App Store / Google Play) / sắp / chưa.

## Bảng xếp hạng App Store Việt Nam (không tính game)
Top 10 miễn phí, top 10 doanh thu, top 5 có phí, có cột biến động; ứng dụng AI trong top; ứng dụng mới lọt top. Một câu nhận xét mỗi bảng.

## Thị trường
### Thể loại đang lên, đang xuống
### Ứng dụng AI
### Lượt tải, doanh thu (số liệu công khai)

## Cảnh báo (lừa đảo, giả mạo, bị gỡ, bảo mật)
| Ứng dụng / hiện tượng | Chuyện gì | Ai cảnh báo | Nguồn |

## Sắp ra mắt, cập nhật lớn (2–4 tuần tới)
| Ứng dụng / hệ điều hành | Ngày | Ở VN? | Nguồn |

## Tham khảo, đã loại
Một dòng mỗi mục.

## Xu hướng
- Đang lên: …
- Đang nguội: …
- Theo dõi tiếp: …

## Đề xuất chủ đề video
5–8 dòng gọn: `/tao-video <chủ đề>` · dạng (một ứng dụng / ít người biết / xếp hạng / tier / cảnh báo) · hạn · vì sao (trỏ về chủ đề số mấy).

## Nguồn lỗi, điểm chưa chắc
## Danh sách nguồn
```

Đề xuất video ưu tiên nhét vào series trong `kenh/series.md` (`ung-dung-it-nguoi-biet`, `top-ung-dung-thang`, `co-dang-cai-khong`…). Video "xu hướng" phải dựa trên ít nhất 2 tuần trong `theo-doi.md`.

### Bản cập nhật `ke-hoach/ban-tin/<ngày>/ban-tin.md`

Tiêu đề `# Bản tin cập nhật <ngày> (<tu> – <den>)`. Chỉ gồm: LÀM NGAY; Có gì mới từ lần trước (tối đa 8 dòng, kèm nguồn); Thay đổi so với lần trước (ứng dụng vào hoặc rơi khỏi top 20 App Store, chủ đề nóng thêm, nguội đi); Cảnh báo mới; Đề xuất video bổ sung (0–3 dòng); Nguồn lỗi.

### Sổ theo dõi `ke-hoach/ban-tin/theo-doi.md`

```markdown
# Sổ theo dõi chủ đề ứng dụng điện thoại

## Chủ đề
| Chủ đề / ứng dụng | Nhóm (Chính / Cảnh báo / Tham khảo) | Lần đầu thấy | W41 | W42 | … | Ghi chú |

## Thể loại trong top App Store VN (miễn phí / doanh thu)
| Thể loại | W41 | W42 | … |

## Số ứng dụng AI trong top 100 miễn phí
| W41 | W42 | … |

## Đã nguội
(chủ đề 4 tuần liền không xuất hiện thì chuyển xuống đây, không xoá)
```

Bản đầy đủ thêm một cột tuần. Bản cập nhật chỉ ghi vào cột Ghi chú. Chạy lại cùng tuần thì ghi đè cột tuần đó. Giữ lại các file `nhom-<n>.md`.

## Bước 5: Báo lại người dùng

Tối đa 12 dòng: khoảng tin đã quét, tin LÀM NGAY (kèm hạn chót), 5 chủ đề hot (điểm, biến động), 1–2 điều đáng chú ý về thị trường, cảnh báo quan trọng, 3 chủ đề video nên làm kèm câu lệnh, nguồn lỗi, đường dẫn bản tin.
