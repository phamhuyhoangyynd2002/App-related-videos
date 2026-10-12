---
name: viet-kich-ban
description: Viết hoặc sửa script.json (kịch bản chia cảnh) cho video ứng dụng điện thoại ngắn dọc đăng TikTok, Reels, YouTube Shorts từ brief.md và research.md, đúng schema AppReel, rồi kiểm tra bằng validate_script.py. Dùng mỗi khi cần viết kịch bản, sửa lời đọc, đổi hook, thêm/bớt cảnh, rút ngắn video, làm video nhanh hơn/cuốn hơn, kể cả khi người dùng chỉ nói "sửa cảnh 3" hay "hook chưa hay".
argument-hint: "<thư mục dự án> [góp ý sửa]"
---

# Viết kịch bản video ngắn `script.json`

Đầu vào: `$ARGUMENTS` (thư mục dự án, có thể kèm góp ý sửa).

## Quy tắc bắt buộc và phần tự do

Các mục trong **Quy tắc bắt buộc** là điều kiện đúng/sai: vi phạm sẽ làm video sai sự thật, hỏng render hoặc bị nền tảng giảm hiển thị. Mọi thứ khác trong skill này (công thức hook, cấu trúc, ví dụ) là **ví dụ đã chứng minh hiệu quả**, không phải khuôn bắt buộc. Nếu nội dung cần cách khác, hãy làm khác và ghi lý do vào `nhat-ky.md`.

**Quy tắc bắt buộc**
1. Chỉ dùng số liệu có trong `research.md`, mỗi số liệu gắn `source_ids`. Vì sao: người xem và nền tảng phạt nội dung sai rất nặng, và kênh không thể đính chính một video đã lan truyền.
2. Câu hook ≤ 12 từ, cảnh hook ≤ 3 giây. Vì sao: người xem quyết định lướt hay ở lại trong 1–3 giây đầu.
3. Không nhắc tên nền tảng trong lời đọc. Vì sao: một file đăng lên nhiều nền tảng.
4. `validate_script.py` không còn LỖI.
5. Mỗi video có ít nhất một nhận định có lý do. Top-list, tier-list và video một ứng dụng có **đúng một** `verdict` (con dấu phán quyết, nhãn theo dòng "Nhãn con dấu" của hồ sơ kênh) theo `.claude/rules/phong-cach-thuong-hieu.md`: top-list ở hạng 1, tier-list ở ứng dụng hạng S, video một ứng dụng ở cảnh cuối. Vì sao: con dấu là dấu hiệu nhận diện chung của mọi kênh, và nền tảng hạ hiển thị video làm theo khuôn không có nhận định riêng.
6. Mỗi tính năng nói trong lời đọc đã được dùng thử (có clip) hoặc có nguồn chính thức trong `research.md`; tính năng trả phí, chỉ có trên một hệ điều hành phải nói rõ. Vì sao: video ứng dụng sai một tính năng là người xem cài về thấy ngay.

## Các bước

1. Đọc `brief.md`, `research.md`, `kenh/ho-so-kenh.md`, `kenh/bai-hoc.md` (bài học từ số liệu các video trước), và `script.json` hiện tại nếu có. Nếu video thuộc series, đọc định nghĩa series trong `kenh/series.md`.
2. Đọc schema ở [references/schema.md](references/schema.md), công thức hook ở [references/hook-va-giu-chan.md](references/hook-va-giu-chan.md), **cẩm nang phong cách `kenh/cam-nang-phong-cach.md`** (độ lầy, năm chỗ bắt buộc phải lầy, 15 cách gây cười, gag hình) và bộ biểu cảm của linh vật ở `kenh/nhan-vat.md` (nếu kênh có). Độ lầy lấy từ `brief.md`, không có thì theo hồ sơ kênh.
3. **Chốt thông điệp trước khi viết**: điền `message` = "Video này nói với [khán giả] rằng [điều gì]". Không viết được câu này thì chưa hiểu video, hãy đọc lại brief.
4. **Viết 3 phương án hook** theo 3 cơ chế khác nhau (xem file hook). Chọn phương án tốt nhất làm cảnh 1, hai phương án còn lại ghi vào `hook_variants` để người duyệt đổi nhanh.
5. **Lên kế hoạch hình trước khi viết lời** (bản đầy đủ top-list, tier-board; chốt 12/10/2026): làm 4 bước trong [references/ke-hoach-hinh.md](references/ke-hoach-hinh.md):
   - vẽ đường năng lượng cả video (hạng 1 mạnh nhất);
   - chọn **một khoảnh khắc hình chính** cho mỗi mục theo nhịp kể;
   - viết câu mồi cho kiểu đó;
   - ghi `hinh_chinh` vào cảnh.

   Vì sao: bản cắt thử tập 2 gắn kiểu hình vào kịch bản đã xong, người làm video thấy "không khác gì bản cũ". Kiểu hình chỉ nổ khi lời đọc dọn đường (hỏi trước rồi lật thẻ, chỉ trỏ rồi đập zoom).
6. Viết các cảnh theo khung thời gian bên dưới, **viết lời quanh khoảnh khắc hình chính** đã chọn: câu mồi, khoảng ngừng "…", chữ trả lời là `cue`. Mỗi cảnh có `role` nói rõ việc của nó trong câu chuyện.
7. Với mỗi cảnh, viết `shots`: 2–3 lần đổi hình, lần đổi thứ hai trở đi có `cue` là từ khoá trong lời đọc, để hình rơi đúng vào từ đắt giá nhất. Khoảnh khắc hình chính là một `kieu` ở đây (hoặc gag `combo` / `keo-so-sanh`). Không chen thẻ hay gag khác trong 1,5 giây quanh nó.
8. **Vòng làm lầy** (viết xong bản đầu, đi lại một lượt chỉ để làm vui): đánh dấu punchline của từng mục, kiểm đủ năm chỗ bắt buộc phải lầy, thêm `gags` (linh vật phản ứng, đứng hình, zoom giật…) đúng từ punchline, rồi chấm theo bảng tự chấm độ lầy của cẩm nang. Mục nào khô nhất thì viết lại trước. Ghi các cách gây cười đã dùng vào `nhat-ky.md`.
9. Nếu sửa file có sẵn: sao lưu thành `script.v<N>.json` trước khi ghi.
10. Chạy `python3 .claude/skills/viet-kich-ban/scripts/validate_script.py <thư mục dự án>` và sửa đến khi hết LỖI.
11. Đi qua **Bảng tự kiểm**, sửa mục chưa đạt, rồi ghi vào `nhat-ky.md`: hook đã chọn và lý do, đường năng lượng (một dòng, vd. "#3 lật thẻ → #2 combo → #1 chia ô + con dấu").

## Câu chuyện: giá trị trước, bằng chứng sau

Học từ HyperFrames ("reverse iceberg"):
- Lời hứa (`message`) phải xuất hiện **chậm nhất ở cảnh thứ hai**. Mọi cảnh sau là bằng chứng cho lời hứa đó.
- **Không đi theo thứ tự của `research.md`.** Research là kho thông tin, không phải dàn ý. Sắp xếp lại, gộp, bỏ bớt.
- Tự kiểm: xoá hết cảnh bằng chứng, phần còn lại vẫn nói được giá trị. Xoá cảnh giá trị, nếu video vẫn "chạy được" thì nó chỉ là danh sách liệt kê, chưa phải câu chuyện.
- **Hình ảnh lấy từ chính ứng dụng**: mỗi `shot` phải trỏ tới một khoảnh khắc cụ thể của ứng dụng đó (đoạn clip có kết quả, đúng nút đang nói). Nếu hình có thể đặt vào video của ứng dụng khác mà không ai nhận ra, hãy đổi. Ưu tiên `clip` tự quay hơn ảnh cửa hàng; chưa có clip thì ghi cảnh cần quay vào `visual_hint` để bước tài nguyên đưa vào `assets/goi-y-tu-quay.md`.

## Độ dài

Một ý thì làm **13–25 giây** (tỉ lệ xem hết cao, dễ xem lặp lại). Danh sách, tier-list mặc định **2–3 phút** như các video mẫu của kênh game (`docs/tham-khao-kenh-game/phan-tich-video-mau-2026-09.md`; kênh game đang thấy video 45–60 giây được đẩy tốt hơn, xem `kenh/bai-hoc.md`): video dài giữ được người xem nhờ kể tình huống, điệp khúc chốt hạng và bảng xếp hạng đầy dần, không nhờ nhồi số liệu. Trần cứng 5 phút. Tránh kéo một ý đơn thành 30–40 giây.

| Loại | Độ dài | Ví dụ |
|---|---|---|
| Bản nhanh | 13–25 giây | 1 ứng dụng đáng chú ý, 1 mẹo, 1 tin nóng |
| Bản gọn | 45–60 giây | Top 3, tổng hợp tin tuần |
| Bản đầy đủ (mặc định cho danh sách) | 2–3 phút | Top 5–7, tier-list, mỗi mục 20–25 giây |
| Bản dài | 3–5 phút | Chỉ khi người dùng yêu cầu; khai báo `target_seconds`. Quá 3 phút không còn là Shorts trên YouTube |

## Khung thời gian

| Đoạn | Thời lượng | Việc phải làm |
|---|---|---|
| Hook (cảnh 1) | 1,5–3 giây | Lời đọc + chữ lớn + hình gây tò mò cùng lúc. Không chào, không giới thiệu kênh |
| Lời hứa / mở vòng tò mò | 2–4 giây (có thể gộp vào cảnh 1) | Người xem sẽ nhận được gì, và điều gì chờ ở cuối |
| Thân | Bản nhanh, bản gọn: 5–8 giây mỗi mục. Bản đầy đủ: 15–30 giây mỗi mục, một cảnh mỗi ứng dụng | Kể theo công thức 5 nhịp bên dưới, đổi hình mỗi 2–3 giây |
| Kết (cảnh cuối) | 3–5 giây | Đóng vòng tò mò, quan điểm, câu hỏi kéo bình luận; 1–2 giây cuối nối về khung đầu để xem lặp mượt |

## Công thức kể mỗi mục (bản đầy đủ)

Rút từ 4 video mẫu của kênh game (`docs/tham-khao-kenh-game/phan-tich-video-mau-2026-09.md`), đổi sang ứng dụng. Đây là ví dụ đã chứng minh, không phải khuôn cứng, nhưng video danh sách nên có đủ 5 nhịp:

1. **Chuyển mục có cài tò mò**, mỗi lần một kiểu: "Tiếp theo là cái tên mà chắc nhiều anh em đoán được", "Còn một con khiến mình cân nhắc khá lâu", "Bắt đầu từ một cái tên ít người nhắc".
2. **Tên ứng dụng + việc nó làm, bằng hình ảnh**: "chụp một trang vở là ra file chữ".
3. **Hai, ba khoảnh khắc dùng thử cụ thể, kể kiểu "đang… thì…"**: "Đang chép bài thì thầy lật trang, chụp một phát là xong." Đây là phần chính, thay cho việc đọc mô tả cửa hàng.
4. **Một câu "nhưng" nói điểm trừ và ai không hợp**: quảng cáo, gói trả phí, chưa có tiếng Việt, xin nhiều quyền. "Nhưng muốn xuất PDF thì xem một quảng cáo."
5. **Câu chốt điệp khúc**, cùng một khuôn cho mọi mục trong video: "Vậy nên X, mình để hạng A." Người xem chờ câu này như chờ nhịp phách. Hạng 1 hoặc hạng S thì câu chốt đi cùng con dấu `verdict`.

Cách gây cười: dùng 15 cách trong mục 4 của `kenh/cam-nang-phong-cach.md` (nói quá, đảo vai, ba nhịp lệch, kỳ vọng / thực tế, đặt tên thật, tự trào, câu cụt, "đoán xem chuyện gì xảy ra", bình luận viên…). Mỗi mục ít nhất một cách, cả video ít nhất năm cách khác nhau. Punchline đặt ngay trước câu chốt hạng (nhịp 4–5).

**Số liệu**: tối đa một con số mỗi ứng dụng, và chỉ khi con số đó gây bất ngờ. Thông tin khác (giá, dung lượng, có quảng cáo, có tiếng Việt) đưa lên thẻ `facts` trên màn hình, không đọc thành lời.

**Giọng**: theo `kenh/cam-nang-phong-cach.md` (mặc định mức 3), nhưng sạch. Xưng hô theo hồ sơ kênh. Không "tao/mày", không chửi thề, không tên hạng tục: hạng thấp nhất dùng khuôn running gag ở cẩm nang mục 5. Nhãn con dấu vẫn giữ cố định.

**Hook bản đầy đủ**: câu đầu ≤ 12 từ, rồi 1–3 câu mở vòng tò mò, tổng ≤ 10 giây. Kiểu nên thử trước: kết quả trước (`ket-qua-truoc`: giây 0 là kết quả thấy được của ứng dụng), ra lệnh chống lướt, nỗi đau quen thuộc ("xem ba mươi giây quảng cáo để dùng năm giây"), lời hứa nói quá ("một cái miễn phí làm được việc của ba cái trả phí"). Không mở bằng việc giải thích tiêu chí: kênh mẫu mất 23–34 giây ở 5/14 video vì việc này.

**Giải thích hạng** (tier-list, tier-board): tối đa 4 giây, ngay sau hook. Hạng cao nói một câu, hạng thấp nhất luôn theo khuôn running gag "Còn D là ứng dụng…" (cẩm nang mục 5), không lặp câu của 10 video gần nhất.

**Kết bản đầy đủ**: quay lại lời hứa ở hook, một câu đúc kết ngắn ("có ứng dụng để dùng, có ứng dụng chỉ để chiếm bộ nhớ"), câu hỏi mở cho bình luận, rồi câu ký tên cố định trong `kenh/ho-so-kenh.md`.

## Cấu trúc theo template

**top-list**: `intro` (hook + lời hứa, có thể hé hình hạng một nhưng che tên) → 3–5 cảnh `item`, thứ hạng giảm dần, mở mỗi cảnh bằng thứ hạng + tên trong 1 giây đầu → `outro`.

**news**: `intro` (kết quả trước, bối cảnh sau) → 2–4 cảnh `headline` ("chuyện gì, ảnh hưởng gì tới người chơi") → `outro` hỏi ý kiến.

**Video một ứng dụng** (template `news`, bản nhanh 13–25 giây, series `co-dang-cai-khong`): `intro` (hook) → 2 cảnh `headline` (một điểm cộng cụ thể, một điểm trừ cụ thể) → `outro` có `verdict`: nhãn con dấu, lý do, ai nên dùng, câu hỏi kéo bình luận. `on_screen_text` của cảnh cuối không lặp nhãn con dấu.

**tier-list**: `intro` (tiêu chí + hé một ứng dụng gây tranh cãi) → các cảnh `tier` 4–6 giây, nói hạng trước, lý do sau → `outro` ("Bạn sẽ đổi ứng dụng nào lên hạng S?").

## Kiểu hình: mỗi mục một vẻ

Bản đầy đủ có 5–7 mục cùng bố cục, dễ thành "một bố cục cho mọi cảnh", đúng thứ YouTube và Meta hạ hiển thị. Trường `kieu` của shot, `chuyen` của cảnh và hai gag `combo`, `keo-so-sanh` cho mỗi mục một khoảnh khắc hình riêng. Bộ kiểu chắt lọc từ video-shotcraft, thẻ từng kiểu ở `templates/_shared/kieu-hinh.md`.

Kiểu hình được **lên kế hoạch ở bước 5, trước khi viết lời**, không gắn thêm sau ([references/ke-hoach-hinh.md](references/ke-hoach-hinh.md): đường năng lượng, nhịp kể → kiểu, câu mồi cho từng kiểu). Bảng dưới là tra nhanh:

| Lời đọc đang nói | Kiểu nên dùng |
|---|---|
| Chỉ vào một chi tiết trên ảnh ("con boss này", "nút nạp") | `dap-zoom` (thêm `diem` nếu chi tiết không ở giữa) |
| Khoảnh khắc nặng ký ("thua", "toang", "vấp") | `dap-zoom-rung` |
| Liệt kê ba thứ trên cùng một ảnh, hoặc ứng dụng ít ảnh | `cat-nhay` |
| Giới thiệu nhanh ứng dụng bằng ba ảnh (màn hình chính, tính năng, kết quả) | `chia-o` + `anh` |
| Con số người xem muốn đoán (hạng, điểm) | `lat-the` trên nhịp `fact:` |
| Số lớn hoặc giá bất ngờ (lượt tải, dung lượng, 0đ) | `dem-so` (+ `tu`) |
| Điều lặp đi lặp lại (quảng cáo, thua liền) | gag `combo`, lời đọc lặp đúng từ đó `so` lần ("Quảng cáo. Quảng cáo. Lại quảng cáo.") |
| Trước / sau khi xử lý, ảnh quảng bá / ảnh tự quay | gag `keo-so-sanh` |
| Chuyển giữa các mục top-list | `chuyen: "day-len"` hoặc `"lia"` |

Luật (validator và `build_timeline.py` cảnh báo):
- Mỗi mục tối đa 1–2 kiểu. Hai mục liền nhau không dùng cùng kiểu. Mỗi kiểu có trần số lần mỗi video (đập zoom 2, cắt nhảy 2, chia ô 1, lật thẻ 2, đếm số 3, combo 1, kéo so sánh 1).
- `dap-zoom-rung`, `cat-nhay` và gag `rung` cộng lại tối đa 3 lần mỗi video.
- Đặt kiểu ở nhịp có `cue`, không đặt ở nhịp đầu cảnh. Chừa đủ thời gian: đập zoom cách nhịp ảnh trước ≥ 0,85s và diễn ≥ 1s; cắt nhảy ≥ 1,3s; chia ô ≥ 1,8s và không có thẻ bật lên trong lúc diễn.
- Kiểu hình không thay gag: vẫn cần ít nhất một nhịp cười mỗi mục.

## Hiệu ứng âm thanh

Mỗi `sfx` phải gắn với một sự kiện nhìn thấy, đặt `cue` đúng từ đó. Bộ âm thanh của kênh (tự tạo, `sfx/GIAY-PHEP.md`):

| Tên | Khi dùng |
|---|---|
| `whoosh` | Chuyển sang ứng dụng mới, hình lướt vào |
| `pop` | Sticker hoặc thẻ thông tin bật lên |
| `ting` | Lộ một con số bất ngờ |
| `drop` | Icon ứng dụng rơi vào hàng trên bảng xếp hạng (câu chốt điệp khúc) |
| `rise` | Khoảng 1 giây trước khi lộ hạng 1 / hạng S |
| `chu-ky` | Tự thêm cùng con dấu, không khai báo tay |
| `ting` (cảnh cuối, cue `"Theo"`) | Màn kết chuẩn của thương hiệu bật lên ở câu ký tên. Mọi video đều có |
| `bonk` | Thất bại, tự trào |
| `boing` | Linh vật nảy vào, chuyện vô lý |
| `ka-ching` | Giá, nạp, giảm giá |
| `buzz-sai` | Kỳ vọng sai, câu hạng D |
| `de-kem` | Toang, hết pin, mất dữ liệu |
| `im-lang` | Câu đùa "khô" có chủ ý |
| `xuoc-dia` | Đi cùng gag `dong-bang` |

Sfx đi cùng một gag thì khai báo trong trường `sfx` của gag, không khai báo lại trong `sfx` của cảnh.

Bản đầy đủ: 2–4 hiệu ứng mỗi cảnh (thường là `whoosh` đầu cảnh, một `pop` giữa cảnh, `drop` ở câu chốt). Không đặt hai hiệu ứng cách nhau dưới 1 giây.

## Viết cho người xem đang lướt

- Mỗi câu một ý, ≤ 15 từ. Xưng hô theo hồ sơ kênh, giọng bạn bè kể cho nhau nghe, có cảm xúc (bực quảng cáo, sướng vì miễn phí, bất ngờ), không đọc như bảng số liệu.
- Cắt các cụm thừa: "như các bạn đã biết", "không để các bạn chờ lâu", "chúng ta cùng tìm hiểu".
- Mỗi cảnh phải trả lời: vì sao người xem xem tiếp cảnh sau?
- `on_screen_text` là lớp chữ cho người đang tắt tiếng.
- `on_screen_text` của một mục (tựa mục) là **thông tin** (thứ hạng, chủ đề, con số), không phải câu đùa: tựa mục hiện từ đầu mục, nên ghi punchline vào đó là lộ câu đùa trước khi đọc (phản biện 05/10/2026: "TUỔI THƠ CÓ QUẢNG CÁO" hiện trước 11 giây). Câu đùa lên hình bằng `gags` đúng `cue`.
- Template top-list chỉ có `intro`, `item`, `outro`: mỗi ứng dụng **một** cảnh `item`, không tách thêm cảnh `headline` (render lỗi). Bản gọn top-list vì thế có cảnh ứng dụng 10–15 giây, vượt mức 9 giây của validator: ghi ngoại lệ vào `nhat-ky.md`, giữ nhịp bằng `shots` đổi hình mỗi 2–3 giây.
- Mỗi mục gọi thẻ chứng minh lời hứa của video bằng `shots` (ví dụ video "đang lên top" thì mỗi mục có `fact:Hạng …`). Thẻ phải cùng chiều với câu đang đọc: không đặt thẻ khen (điểm cao, giá rẻ) đúng lúc đọc điểm trừ.
- Phán quyết `CÀI NGAY` cho ứng dụng chỉ có trên một hệ điều hành, chưa có tiếng Việt, hoặc bản miễn phí bị giới hạn thì nói rõ trong lời đọc.

## Bảng tự kiểm trước khi trình duyệt

- [ ] Viết được `message` trong một câu, và mọi cảnh có `role` phục vụ câu đó.
- [ ] Tắt tiếng, chỉ nhìn chữ ở giây 0: có muốn xem tiếp không? Nếu dự đoán hơn 40% người xem sẽ lướt qua ngay, đổi hook.
- [ ] Hook khác kiểu hook của 3 video gần nhất, và không phải kiểu mà `kenh/bai-hoc.md` ghi là kém.
- [ ] Có 2 phương án hook dự phòng trong `hook_variants`.
- [ ] Có đúng một `verdict` đúng chỗ (hoặc, với tin tức, cảnh cuối có một câu nhận định của kênh); nhãn đúng loại ứng dụng (trả phí hay miễn phí).
- [ ] Không có từ nào trong danh sách "không dùng" của `kenh/ho-so-kenh.md`; câu mở đầu khác 10 video gần nhất.
- [ ] Lời đọc nói thêm điều hình không nói, không thuật lại những gì đã hiện trên màn hình.
- [ ] Vòng tò mò mở ở đầu và được đóng ở cuối.
- [ ] Mỗi cảnh có 2–3 shot, shot sau có `cue` đúng từ đắt giá.
- [ ] Mỗi ứng dụng có ít nhất một chi tiết cụ thể chỉ ứng dụng đó có, và lời đọc không lặp lại mô tả trên cửa hàng.
- [ ] Mỗi tính năng nói ra đã dùng thử hoặc có nguồn chính thức; tính năng trả phí nói rõ.
- [ ] Lời kêu gọi trung tính, không nhắc tên nền tảng.
- [ ] Độ dài đúng loại đã chọn (nhanh, gọn, đầy đủ, dài) và không quá 5 phút.
- [ ] Bản đầy đủ: mỗi ứng dụng có đủ 5 nhịp, có ít nhất một tình huống "đang… thì…", tối đa một con số được đọc thành lời, câu chốt điệp khúc cùng một khuôn.
- [ ] Bản đầy đủ: mỗi mục có `hinh_chinh` là một kiểu hình thật, có câu mồi trong lời đọc, `cue` đúng chữ trả lời / hậu quả; hạng 1 có kiểu mạnh nhất; ít nhất 4 kiểu khác nhau; hai mục liền nhau không cùng kiểu (tự kiểm cuối `references/ke-hoach-hinh.md`).
- [ ] Mỗi mục có ít nhất một `gags` đặt đúng từ punchline (linh vật, đứng hình, zoom giật…), và một shot clip dùng thử minh hoạ đúng câu đang đọc.
- [ ] Đạt **bảng tự chấm độ lầy** ở mục 13 của `kenh/cam-nang-phong-cach.md` (năm chỗ bắt buộc, đoạn khô dài nhất, số cách gây cười, running gag, callback).
