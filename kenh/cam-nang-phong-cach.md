# Cẩm nang phong cách kênh ứng dụng

> Bản 1, ngày 12/10/2026, chuyển từ cẩm nang của kênh game (bản 2, 30/09/2026). **Cách làm** (thang độ lầy, năm chỗ bắt buộc, cách gây cười, gag hình, nhịp TTS, bảng tự chấm) giữ nguyên vì đó là kỹ thuật viết, không phải nhận diện. **Nhận diện** (tính cách người kể, linh vật, running gag, câu cửa miệng, tên cộng đồng) để trống, chốt bằng `/thiet-lap-kenh`. Ví dụ đã đổi sang ứng dụng và chỉ minh hoạ cấu trúc; dùng thật phải kiểm chứng.
> Độ lầy mặc định **3**, theo lựa chọn của người làm video ở kênh game ("lầy hơn, nhiều meme hơn, vẫn nhẹ nhàng"). Đổi ở `kenh/ho-so-kenh.md` nếu kênh ứng dụng cần giọng khác.
> Ai đọc: agent `bien-kich-video`, `phan-bien-video`, `nghien-cuu-ung-dung`, skill `viet-kich-ban`, `tao-template`, `xuat-video`. Luật cứng (số liệu, bản quyền, pháp lý) ở `.claude/rules/`; file này chỉ nói **cách vui mà không phạm luật**.
> Chỗ ghi **bắt buộc** là luật. Còn lại là ví dụ đã chứng minh ở kênh game, được làm khác khi nội dung cần (ghi lý do vào `nhat-ky.md`).

## 1. Kênh này là ai

TODO (`/thiet-lap-kenh`): một câu tính cách người kể. Gợi ý khởi điểm: **người bạn rành công nghệ, hơi lười nên luôn tìm ứng dụng làm hộ**, ghét quảng cáo và gói trả phí vô lý, thử hết rồi mới khuyên, lúc chốt "cài hay bỏ" thì tỉnh và nói thật.

| Là | Không phải |
|---|---|
| Kể chuyện dùng thử: "đang… thì…", "đoán xem chuyện gì xảy ra" | Đọc lại mô tả trên cửa hàng, đọc bảng thông số |
| Trêu ứng dụng, trêu quảng cáo, trêu gói trả phí, trêu chính mình | Chê người xem "không biết dùng điện thoại", chê nhóm người |
| Dám chê ứng dụng nổi tiếng, rồi khích fan vào cãi | Nước đôi "ứng dụng nào cũng có cái hay" |
| Nói quá tới mức phi lý, ai nghe cũng biết là đùa | Bịa số liệu, bịa tính năng nghe như thật |
| Vui nhưng sạch: không tục, không "tao/mày" | Mượn chữ tục cho "có muối" |

Công thức cảm xúc (kế thừa): **cười 60% · "à ra thế" 30% · tin tưởng 10%**. Kênh ứng dụng có thể cần nhiều "à ra thế" hơn; kiểm lại bằng số liệu.

## 2. Thang độ lầy

| Mức | Dùng cho | Mật độ | Ví dụ |
|---|---|---|---|
| 1 · Tỉnh | Tin bảo mật, lừa đảo, ứng dụng bị gỡ, có yếu tố pháp lý | 1 câu đùa mỗi 20 giây, chỉ đùa về ứng dụng | "Tin buồn cho anh em hay bấm 'Đồng ý' không đọc." |
| 2 · Vui | Tin tức, video một ứng dụng bản nhanh | 1 nhịp cười mỗi 8–10 giây | "Ứng dụng miễn phí. Chỉ có điều nó thu phí bằng ba mươi giây quảng cáo." |
| 3 · Lầy (**mặc định**) | Top-list, tier-list, "N ứng dụng ít người biết" | 1 nhịp cười mỗi 5–6 giây (lời hoặc hình) | "Người ta dùng AI để viết luận văn. Mình dùng AI để… viết tin nhắn xin lỗi người yêu." |
| 4 · Lầy hết cỡ | Thử thách, nhật ký dùng thử, so tài hai ứng dụng | 1 nhịp cười mỗi 3–4 giây | "Ứng dụng A, tôi tin cậu. … Treo máy rồi. Chúc ngủ ngon, ứng dụng A." |

"Nhịp cười" = một câu punchline **hoặc** một gag hình. Mức 3 không có nghĩa câu nào cũng đùa: thân bài vẫn kể chuyện, nhưng đoạn "khô" dài nhất không quá 8 giây.

Ghi mức vào `brief.md` (dòng `Độ lầy: 3`). Không ghi thì theo hồ sơ kênh.

## 3. Năm chỗ bắt buộc phải lầy

**Bắt buộc** với video mức 3–4 (người xem quen kênh chờ đúng những chỗ này):

| # | Chỗ | Việc | Ví dụ |
|---|---|---|---|
| 1 | **Hook** (0–3 giây) | Ra lệnh chống lướt, nỗi đau nói quá, kết quả bất ngờ. Có một yếu tố gây cười hoặc bất ngờ ngay câu đầu | "Khoan xoá ứng dụng. Có một cái miễn phí làm được việc của ba cái trả phí." |
| 2 | **Giải thích hạng** (≤ 4 giây, tier-list) | Hạng cao nói nhanh, **hạng thấp nhất luôn có một câu gây sốc sạch** theo khuôn cố định (mục 5) | "S là cài ngay. Còn D là ứng dụng chỉ để… làm đầy bộ nhớ." |
| 3 | **Cuối mỗi mục** | Một punchline ngay trước câu chốt hạng | "Định chỉnh một tấm ảnh. Ngẩng lên đã chỉnh luôn cả album người yêu cũ." |
| 4 | **Hạng cao nhất** | Linh vật phản ứng + con dấu; câu chốt có một nửa câu đùa | "Hạng một. Và bộ nhớ của mình, lần đầu tiên, không kêu cứu." |
| 5 | **Câu kết** | Khích bình luận có chút trêu, rồi câu ký tên | "Ai thấy mình xếp sai thì vào cãi. Mình đọc hết, nhưng không gỡ đâu." |

## 4. Mười lăm cách gây cười

Mỗi mục dùng ít nhất 1 cách; cả video dùng ít nhất **5 cách khác nhau**.

| # | Cách | Cấu trúc | Ví dụ |
|---|---|---|---|
| 1 | Nói quá có hình ảnh | Đẩy sự thật tới mức phi lý | "Ứng dụng này xin quyền nhiều tới mức chỉ còn thiếu xin số đo ba vòng." |
| 2 | Đảo vai | Đổi chủ thể, đối tượng | "Không phải mình dùng điện thoại. Điện thoại đang dùng mình." |
| 3 | Ba nhịp, nhịp ba lệch | Hai ý thường, ý ba bất ngờ | "Nó ăn pin, ăn bộ nhớ, và ăn luôn cả buổi tối." |
| 4 | Kỳ vọng / thực tế | Nói điều người ta tưởng, rồi lật | "Quảng cáo nói chỉnh ảnh như studio. Thực tế: mặt mình như được làm bằng sáp." |
| 5 | Đặt tên thật | "X, tên thật là…" | "Ứng dụng dọn rác, tên thật: máy phát quảng cáo có nút dọn rác." |
| 6 | Tự trào | Người kể, bộ nhớ, pin làm nạn nhân | "Bộ nhớ mình đọc tới đây là xin nghỉ phép." |
| 7 | Câu cụt sau câu dài | Kể dài, chốt 1–2 chữ | "Chọn ảnh, bấm làm nét, chờ ba giây, tưởng đã thành nhiếp ảnh gia. Rồi nó đòi trả phí. Hết." |
| 8 | Nhân hoá đồ vật | Pin, bộ nhớ, thông báo có cảm xúc | "Cục pin nhìn ứng dụng này như nhìn kẻ thù." |
| 9 | So sánh đời thường Việt | Ghép ứng dụng với chuyện ai cũng gặp | "Thông báo dày như tin nhắn nhóm lớp lúc có điểm thi." |
| 10 | Hỏi chấm | Kể một chi tiết vô lý đúng như thật, rồi dừng | "Ứng dụng đèn pin. Xin quyền đọc danh bạ. Ủa?" |
| 11 | Thừa nhận thật thà | Nói điều ai cũng nghĩ | "Mình không đọc điều khoản. Không ai đọc cả." |
| 12 | Gọi lại (callback) | Câu đùa ở hook quay lại ở cuối | |
| 13 | "Đoán xem chuyện gì xảy ra" | Câu đệm hồi hộp, rồi kết quả tệ nhất | "Mình bấm 'bỏ qua quảng cáo'. Đoán xem chuyện gì xảy ra. Mở thêm một quảng cáo." |
| 14 | Bình luận viên thể thao | Cổ vũ → thảm hoạ → tổng kết cụt | |
| 15 | Nói với chính ứng dụng | Hỏi thẳng ứng dụng hoặc nhà phát triển | "Này bạn, tắt thông báo mà cũng phải vào năm lớp menu à?" |

**Luật để câu đùa vẫn đúng sự thật** (bắt buộc):
- Nói quá phải **rõ là đùa**. Không đùa bằng một con số, một tính năng nghe như thật mà sai.
- Tình huống "đang… thì…" phải đúng cách ứng dụng chạy thật (có clip dùng thử càng tốt).
- Đùa về chuyện có thật (bị gỡ, bị phạt, lộ dữ liệu) vẫn cần nguồn.
- Trêu nhà phát triển về **sản phẩm** (giá, quảng cáo, lỗi), không cáo buộc con người (`.claude/rules/chinh-xac-va-ban-quyen.md` mục 7).

## 5. Running gag cho hạng thấp nhất

Khuôn của kênh game: một câu so sánh phi lý kiểu Việt ở cùng một chỗ (cuối phần giải thích hạng), đổi mỗi video. Giữ **chỗ và khuôn**; tên gag chốt bằng `/thiet-lap-kenh`.

Khuôn đề xuất: **"Còn D là ứng dụng [so sánh]."** + huy hiệu D + linh vật biểu cảm chê + sfx `buzz-sai`.

Kho gợi ý (thêm dần, không lặp trong 10 video gần nhất):
- "…chỉ để làm đầy bộ nhớ."
- "…cài vào thì pin xin nghỉ việc."
- "…như người yêu cũ: hay gửi thông báo, chẳng giúp được gì."
- "…mở lên một lần, gỡ đi cả đời."
- "…quảng cáo nhiều hơn tính năng."

## 6. Các dạng video

| Dạng | Giọng kể | Khi dùng | Điều kiện |
|---|---|---|---|
| **N ứng dụng ít người biết** | Nhịp nhanh, mỗi ứng dụng một kết quả bất ngờ | Bản gọn 45–60 giây hoặc bản đầy đủ | Mỗi ứng dụng cần một clip tự quay cho khoảnh khắc "ồ" |
| **Bảng tier lầy** | "Mình" kể 5 nhịp, punchline cuối mục | Tier-list 2–3 phút | Template `tier-board` |
| **Một ứng dụng, một phán quyết** | Lời hứa có ích trước, điểm cộng, điểm trừ, con dấu | Bản nhanh 13–25 giây | Cần clip dùng thử |
| **Nhật ký dùng thử** | "Mình" kể như nhật ký, "đoán xem chuyện gì xảy ra" | Một ứng dụng 1–3 phút | **Cần clip tự quay dài** (skill `cat-quay-man-hinh`) |
| **So tài** | Bình luận viên cho hai ứng dụng làm cùng một việc | Hai ứng dụng cùng loại | Cần clip cả hai, cùng đầu vào |
| **Troll** (bait-and-switch) | Giọng nghiêm túc cho một mục "sai chỗ" | Tối đa 1 trong 5 video danh sách | Cảnh cuối **bắt buộc** có câu lật "đùa thôi…" + lý do thật; mục troll không mang con dấu |

## 7. Cách gọi khán giả và câu cửa miệng

TODO (`/thiet-lap-kenh`): xưng hô ("mình" – "anh em" hay "mình" – "bạn"), tên cộng đồng, 3–5 câu cửa miệng của người kể hoặc linh vật (xoay vòng, tối đa 2 lần mỗi video), câu ký tên cố định.

- Câu cửa miệng làm câu mở đầu thì không dùng hai video liền nhau: `validate_script.py` coi đó là câu mở đầu dùng lại. Muốn dùng thường xuyên hơn thì đặt nó thành chữ trên màn hình.

## 8. Từ ngữ

**Dùng thoải mái** (gợi ý, chốt bằng `/thiet-lap-kenh`): toang, bay màu, hết nước chấm, ảo ma, não to, hack não, lú, khét lẹt, flex, vả, kèo thơm, tiền nào của nấy, ơ kìa, ủa, thôi xong, khoan đã, xịn sò, chạy bằng niềm tin.

**Có hạn dùng** (trend, tối đa 2 lần mỗi video, xem lại mỗi quý, ghi ngày khi thêm): ối dồi ôi, đỉnh nóc kịch trần, cứu, khum, u là trời, chữa lành, red flag (kế thừa 30/09/2026).

**Không dùng**:
- Danh sách "không dùng" trong `kenh/ho-so-kenh.md`.
- Chữ tục, nói lái tục, "tao/mày".
- Đùa về ngoại hình, giới tính, vùng miền, tuổi tác ("người già không biết dùng điện thoại"), bệnh tật thật, tự tử, bạo lực thật, chính trị, tôn giáo.
- Chê người xem ("dùng iPhone mà không biết cái này thì phí"). Chỉ tự chê mình.

## 9. Meme: vui mà không dính bản quyền

| Loại | Ví dụ | Được dùng? |
|---|---|---|
| **A. Khuôn meme** (cấu trúc câu, bố cục) | Kỳ vọng / thực tế; trước / sau; "MIỄN PHÍ vs 200K/THÁNG"; "POV: bạn là bộ nhớ 64GB"; ba giai đoạn; tin nhắn với cục pin; "5 PHÚT SAU…" | **Có, thường xuyên.** Dựng bằng đồ hoạ, font và linh vật của kênh |
| **B. Từ lóng, câu cửa miệng** | Mục 8 | **Có**, theo danh sách |
| **C. Meme có chủ sở hữu** | Cheems và Buff Doge, mèo "Huh?", cảnh phim, âm "vine boom", tiếng thông báo iPhone | **Không.** Thay bằng linh vật và sfx tự làm |

### Gag hình dựng sẵn

Gọi trong `script.json` bằng trường `gags` (xem `.claude/skills/viet-kich-ban/references/schema.md`).

**Luật chữ phủ khung** (kế thừa 12/10/2026: 10 gag chữ phủ tối trong 75 giây làm video giống trình chiếu): `chu-to` và `dong-bang` cộng lại **tối đa 2 lần mỗi video**, chỉ cho câu cụt 1–3 chữ, không chép lại lời đọc; tổng thời gian gag phủ khung không quá 5%. Nhịp cười ưu tiên gag **giữ hình ứng dụng**: `zoom-kich-tinh` vào đúng nút, đúng chi tiết đang nói, `sticker` linh vật, `rung`, `dau-chu`. `validate_script.py` báo LỖI khi quá 2 lần.

| `kind` | Trông thế nào | Dùng khi (ví dụ ứng dụng) |
|---|---|---|
| `sticker` | Linh vật (hoặc đạo cụ) nảy vào 0,8–1,5 giây | Ngay sau punchline |
| `so-sanh` | Cặp hình linh vật mạnh / yếu, hai nhãn chữ | "MIỄN PHÍ vs 200K/THÁNG", "iPHONE vs ANDROID" |
| `dong-bang` | Đứng hình, ngả xám, chữ "KHOAN…" / "???" | Hỏi chấm, trước câu lật |
| `zoom-kich-tinh` | Zoom giật 3 nấc vào chi tiết, khoanh đỏ, mũi tên | Nút trả phí giấu kín, dòng chữ nhỏ, quyền truy cập |
| `rung` | Rung khung 0,2 giây | "Toang", treo máy, lỗi |
| `ky-vong-thuc-te` | Chia đôi: KỲ VỌNG (ảnh quảng bá) / THỰC TẾ (ảnh tự quay) | Ảnh cửa hàng đẹp hơn thật |
| `ten-that` | Tên ứng dụng bị gạch, chữ viết tay đè tên mới | Cách 5 |
| `tin-nhan` | Khung chat 2–3 dòng | Gói trả phí, quảng cáo, thông báo |
| `the-thoi-gian` | Thẻ toàn khung "5 PHÚT SAU…" | Chờ tải, chờ xử lý |
| `ba-giai-doan` | Ba ô NGÀY 1 / TUẦN 1 / THÁNG 1, ba biểu cảm | Ứng dụng gây nghiện, thói quen |
| `chu-to` | Chữ "HẾT." / "???" toàn khung, phủ tối | Câu cụt 1–3 chữ. **Cùng `dong-bang` tối đa 2 lần mỗi video** |
| `dau-chu` | Chữ đóng dấu nghiêng đè lên góc ảnh; hình vẫn thấy rõ | Nhấn một từ khoá, giá, con số (tối đa 4 chữ) |
| `binh-luan` | Bình luận của tập trước, **che tên và ảnh đại diện** | Hook nối series |
| `combo` | Bộ đếm "x3" nhảy số + "COMBO!" | Điều lặp lại: quảng cáo, thông báo, popup đòi trả phí. Tối đa 1 lần mỗi video |
| `keo-so-sanh` | Thanh kéo chia đôi hai ảnh của cùng ứng dụng | Trước / sau khi xử lý ảnh, có quảng cáo / đã trả phí. Tối đa 1 lần mỗi video |

## 10. Lời đọc cho câu đùa (TTS)

TTS không biết đâu là chỗ cười. Nhịp cười nằm ở **dấu câu và độ dài câu**:

- Punchline đứng thành câu riêng, 1–4 chữ, sau một câu dài: "…rồi nó đòi trả phí. Hết."
- "…" trước chữ bất ngờ: "xin quyền đọc… danh bạ." Nếu TTS bỏ qua quãng ngừng thì tách thành hai câu.
- Câu hỏi tu từ ngay trước câu lật: "Tưởng thế là xong? Chưa đâu."
- Thán từ ngắn TTS đọc tốt: "Ủa?", "Khoan.", "Thôi xong.", "Chưa đâu.", "Ơ kìa."
- Tốc độ: kênh mẫu (game) đọc 4,7–5,5 từ/giây. Video hướng dẫn thao tác có thể chậm hơn một chút để người xem kịp nhìn.

## 11. Dựng hình và âm thanh

**Khung xương** (template `top-list`, `tier-board`):
- Giây 0: chữ hook + **kết quả bất ngờ nhất** từ clip dùng thử (không phải màn hình mở ứng dụng).
- Mỗi ứng dụng: tên + icon đầu khung → clip dùng thử khung dọc → thẻ thông tin (giá, có quảng cáo, có tiếng Việt) → câu chốt.
- Phụ đề: 1–2 từ mỗi lần, một từ khoá mỗi câu tô vàng và to hơn.
- Màn kết: bảng đầy đủ + linh vật + câu ký tên.

**Nhịp một câu đùa trên timeline**:

```
câu dẫn ──────────┐ 0,3 s nhạc tụt còn 30% ┌ punchline ┐ gag 0,8–1,5 s + sfx ┐ nhạc trở lại
```

- Gag vào **đúng từ punchline** (`cue`), không sớm hơn.
- Một gag mỗi lúc, cách nhau ít nhất 1,5 giây, không trùng lúc thẻ `fact` bật lên.

**Âm thanh hài** (tự tổng hợp bằng `sfx/nguon/tao_sfx.py`, có trong `sfx/GIAY-PHEP.md`):

| Tên | Âm | Dùng khi |
|---|---|---|
| `bonk` | Gõ gỗ ngắn | Thất bại, tự trào |
| `boing` | Lò xo | Sticker nảy, chuyện vô lý |
| `ka-ching` | Máy tính tiền | Giá, gói trả phí, giảm giá |
| `buzz-sai` | Chuông báo sai | Kỳ vọng sai, hạng D |
| `de-kem` | Kèn buồn đi xuống | Toang, hết pin, hết bộ nhớ |
| `im-lang` | Tiếng dế | Câu đùa "khô" có chủ ý |
| `xuoc-dia` | Dừng đột ngột | Đi cùng `dong-bang` |

Không dùng tiếng thông báo, nhạc chuông của iPhone, Android, ứng dụng khác dù rất hợp chủ đề (`.claude/rules/chinh-xac-va-ban-quyen.md` mục 5).

## 12. Bảng tự chấm độ lầy

Biên kịch tự chấm trước DỪNG 2; `phan-bien-video` chấm lại sau khi render.

- [ ] Đủ **năm chỗ bắt buộc** ở mục 3 (video mức 3–4).
- [ ] Hook có yếu tố gây cười hoặc bất ngờ trong câu đầu, và hình giây 0 là kết quả thật của ứng dụng.
- [ ] Tier-list: giải thích hạng ≤ 4 giây, câu hạng D chưa dùng trong 10 video gần nhất.
- [ ] Mỗi mục có ít nhất 1 punchline trước câu chốt và ít nhất 1 gag trong `gags`.
- [ ] Đoạn "khô" dài nhất (không punchline, không gag): ≤ 8 giây ở mức 3, ≤ 12 giây ở mức 2.
- [ ] Cả video dùng ít nhất 5 cách gây cười khác nhau (mục 4).
- [ ] Có ít nhất 1 running gag của kênh và 1 callback từ hook về kết.
- [ ] Mỗi mục đọc thành lời tối đa 1 con số.
- [ ] Không câu đùa nào cần giải thích; không tục; không đùa về người (ngoài tự trào).
- [ ] Đọc to toàn bộ lời: có ít nhất 5 chỗ tự bật cười. Không có thì viết lại mục khô nhất trước.

## 13. Việc còn phải làm

| Việc | Ai | Trạng thái |
|---|---|---|
| Chốt tính cách người kể, xưng hô, câu cửa miệng, running gag, tên cộng đồng | Người làm video, qua `/thiet-lap-kenh` | Chưa có |
| Linh vật và bộ biểu cảm (nếu kênh có) | Người làm video, theo `kenh/nhan-vat.md` | Chưa có |
| Chữ ký âm thanh riêng (`sfx/chu-ky.wav`) | Claude, bằng `sfx/nguon/tao_sfx.py` | Bản nháp 12/10/2026, chờ nghe thử |
| Kiểm lại độ dài, công thức cảm xúc bằng số liệu 10 video đầu | `/phan-tich-hieu-qua` | Chưa có |
