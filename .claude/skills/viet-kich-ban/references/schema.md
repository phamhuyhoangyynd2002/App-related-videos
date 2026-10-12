# Schema `script.json`

Mở rộng từ schema trong README. Các trường gốc của README giữ nguyên, phần thêm vào lấy ý tưởng từ HyperFrames (thông điệp, vai trò cảnh, nhịp hình theo lời đọc), claude-youtube (nhiều phương án hook) và video-use (hiệu ứng âm thanh gắn với sự kiện).

## Trường cấp gốc

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `title` | string | có | Tên video |
| `format` | `"vertical"` \| `"horizontal"` | có | Mặc định `vertical`; `horizontal` chỉ khi người dùng yêu cầu |
| `template` | `"top-list"` \| `"news"` \| `"tier-list"` \| `"tier-board"` | có | `news` cũng dùng cho video một ứng dụng (bản nhanh, có con dấu phán quyết ở cảnh cuối) |
| `language` | `"vi"` | có | |
| `message` | string | nên có | Một câu: "Video này nói với [ai] rằng [điều gì]". Mọi cảnh phải phục vụ câu này |
| `angle` | string | nên có | Góc nhìn riêng, lấy từ `brief.md` |
| `series` | string | không | Tên series trong `kenh/series.md`, nếu video thuộc một series |
| `end_card_cta` | string | không | Chữ nút ở màn kết. Bỏ trống thì template tự chọn: có `series` → `THEO DÕI ĐỂ XEM TẬP SAU`, không có → `THEO DÕI ĐỂ XEM THÊM` |
| `hook_type` | string | nên có | Kiểu hook đang dùng, xem `hook-va-giu-chan.md` |
| `hook_variants` | `{ hook_type, narration, on_screen_text, why }[]` | nên có | 2–3 phương án hook khác cơ chế để người duyệt đổi nhanh ở DỪNG 2 |
| `sponsorship` | `{ "type": "tai-tro"\|"tang-goi"\|"affiliate", "brand": string, "disclosure": string }` | khi có | Bắt buộc khi nhận tiền, gói trả phí miễn phí, link hoặc mã giới thiệu. Câu `disclosure` phải xuất hiện trong chữ trên màn hình của cảnh 1 |
| `target_seconds` | `[min, max]` | không | Mặc định: top-list, tier-list, tier-board `[120, 180]`; news `[20, 45]`; bản nhanh `[13, 25]` |
| `voice` | `{ "name": string, "rate": string }` | không | Mặc định theo `kenh/ho-so-kenh.md` |
| `scenes` | Scene[] | có | |
| `sources` | Source[] | có | Ít nhất 1 |

## Scene

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `id` | số nguyên | có | 1, 2, 3… liên tục |
| `type` | `"intro"` \| `"item"` \| `"headline"` \| `"tier"` \| `"outro"` | có | |
| `role` | string | nên có | Việc của cảnh trong câu chuyện, ví dụ "hook: hứa lợi ích", "bằng chứng: cơ chế bão", "đóng vòng tò mò" |
| `narration` | string | có | 1–3 câu. Video dọc: hook 1,5–3 giây, cảnh khác 3–8 giây |
| `on_screen_text` | string | có | Ngắn, xem quy tắc văn phong |
| `on_screen_subtext` | string | không | Chỉ cảnh `intro`: dòng lời hứa nhỏ dưới chữ hook, cho người tắt tiếng biết video nói gì (ví dụ `4 APP MIỄN PHÍ · CÓ TIẾNG VIỆT`), ≤ 36 ký tự. Nên có khi chữ hook là câu đùa không nhắc tới ứng dụng |
| `reveal_top` | bool | không | Chỉ cảnh `intro` của top-list: `true` thì không che ô hạng 1 (bỏ hộp khoá) và cho ảnh hạng 1 to ngay giây 0; dùng khi hook đã nói hạng 1 là ứng dụng nào. Mặc định `false` (che để mở vòng tò mò) |
| `app` | `{ "name", "app_store_id": int\|null, "play_package": string\|null, "platform": "both"\|"ios"\|"android"\|"web" }` \| null | có | Bắt buộc khác `null` với `item` và `tier` (validator báo LỖI nếu dùng trường `game` của kênh game). `app_store_id` là số sau `id` trong `apps.apple.com/vn/app/.../id<số>`, `play_package` là giá trị `id=` trên link Google Play; chỉ ghi khi thấy trên URL, không có thì để `null` (bước tài nguyên tìm theo tên, dễ khớp nhầm ứng dụng "ăn theo"). `platform`: `android` bỏ qua App Store, `web` là công cụ web (không lấy ảnh cửa hàng) |
| `rank` | số nguyên | với `item` của top-list | |
| `tier` | `"S"`…`"D"`; template `tier-board`: `"SSS"`, `"S"`…`"D"` | với `tier`, và với `item` của `tier-board` | `tier-board`: hàng mà icon ứng dụng rơi vào ở câu chốt |
| `tier_cue` | string | không | `tier-board`: từ trong câu chốt lúc icon rơi vào hàng (mặc định `"hạng"`, lấy lần xuất hiện cuối). Đặt sfx `drop` cùng cue này |
| `emphasis` | string[] | không | Từ khoá tô màu accent và to hơn trong phụ đề (1–3 từ mỗi cảnh, từ đơn âm tiết như trong lời đọc) |
| `facts` | `{ "label", "value", "source_ids": string[] }[]` | không | Tối đa 3 |
| `source_ids` | string[] | với `item`, `headline`, `tier` | Nguồn cho các ý trong lời đọc |
| `visual_hint` | string | có | Mô tả ngắn hình ảnh của cảnh |
| `shots` | Shot[] | nên có | Các nhịp đổi hình trong cảnh, xem bên dưới. Không có thì hệ thống tự chia mỗi ~2,5 giây |
| `sfx` | `{ "name", "cue"?, "volume"? }[]` | không | Hiệu ứng âm thanh, file ở `sfx/<name>.wav|mp3`. Chỉ dùng cho sự kiện nhìn thấy. Không khai báo chữ ký âm thanh `chu-ky` ở đây: `build_timeline.py` tự thêm cùng con dấu |
| `verdict` | `{ "label": <nhãn trong dòng "Nhãn con dấu" của hồ sơ kênh; mặc định "CÀI NGAY"\|"DÙNG THỬ"\|"CHỜ GIẢM GIÁ"\|"BỎ QUA">, "reason": string, "for_who": string, "cue": string }` | với cảnh phán quyết | Con dấu phán quyết của thương hiệu, **đúng một lần mỗi video**: top-list ở hạng 1, video một ứng dụng ở cảnh cuối, tier-list ở ứng dụng hạng S. Miễn phí dùng CÀI NGAY / DÙNG THỬ / BỎ QUA; trả phí dùng CÀI NGAY / CHỜ GIẢM GIÁ / BỎ QUA. `reason` là lý do, `for_who` là ai nên dùng, `cue` là từ trong lời đọc lúc con dấu đóng xuống (thường chính là nhãn). Xem `.claude/rules/phong-cach-thuong-hieu.md` |
| `gags` | Gag[] | nên có (bản đầy đủ: ít nhất 1 mỗi cảnh `item`/`tier`) | Nhịp cười bằng hình, xem bên dưới và `kenh/cam-nang-phong-cach.md` |
| `hinh_chinh` | string | nên có (bản đầy đủ: mỗi cảnh `item`/`tier`) | Khoảnh khắc hình chính của mục, lên kế hoạch **trước khi viết lời** (`references/ke-hoach-hinh.md`): kiểu gì, rơi vào chữ nào, vì sao. Vd. `"đập zoom vào nút Xoá phông đúng chữ 'một chạm' (cao trào nhịp 3)"`. Phải ứng với một `kieu` trong `shots` hoặc gag `combo` / `keo-so-sanh`. Hiện ở cột "Khoảnh khắc hình" của bảng DỪNG 2 |
| `chuyen` | `"day-len"` \| `"lia"` | không | Cách vào cảnh này từ cảnh trước (top-list): `day-len` cảnh mới đẩy cảnh cũ lên như vuốt feed, `lia` lia ngang có nhoè. Tier-board bỏ qua. Xem `templates/_shared/kieu-hinh.md` |
| `media` | `{ "prefer": "clip"\|"screenshot"\|"header", "clip_start": số giây }` | không | |
| `pronunciation` | string | không | Cách đọc tên ứng dụng nếu TTS đọc sai, ví dụ `"nâu sần"` cho Notion. Nhiều tên trong một cảnh: `"Tên A: phiên âm; Tên B: phiên âm"`, tên phải viết **đúng như trong `narration`** (ví dụ "CapCut", không phải "Cap Cut"). Sau khi tạo giọng, nghe lại hoặc nhận dạng lời để chắc TTS không đọc lẫn chuỗi phiên âm |

## Shot: nhịp hình khớp theo lời đọc

Mỗi shot là một lần đổi hình. Shot đầu tiên bắt đầu cùng cảnh. Các shot sau có `cue` là một từ hoặc cụm từ **có trong lời đọc**: hình sẽ hiện xong đúng lúc từ đó được đọc. Nhờ vậy hình ảnh "rơi" đúng vào điểm nhấn thay vì đổi theo giờ cố định.

| Trường | Ghi chú |
|---|---|
| `show` | `header`, `icon`, `clip` (video tự quay màn hình), `screenshot:N` (N từ 1), `fact:<nhãn>` (thẻ thông tin bật lên), `text` (chữ lớn), `logo` |
| `cue` | Từ khoá trong `narration`, bỏ trống với shot đầu |
| `crop` | Không bắt buộc, chỉ với `screenshot:N`, `header`: `[x, y, w, h]` (pixel trên ảnh gốc) vùng cắt cận; template phóng vùng đó lấp khung ảnh. Dùng để một ảnh cho 2–3 nhịp hình khác nhau khớp lời đang đọc (nút bấm, kết quả, dòng chữ nhỏ). Chọn vùng bằng cách mở ảnh, giữ đúng tỉ lệ gần với khung hiển thị, không cắt vào chữ quảng bá |
| `from` | Với `clip`: bắt đầu từ giây thứ mấy của clip quay màn hình |
| `kieu` | Không bắt buộc. Kiểu hình (`templates/_shared/kieu-hinh.md`): `dap-zoom`, `dap-zoom-rung`, `cat-nhay`, `chia-o` cho nhịp `header`/`screenshot:N`; `lat-the`, `dem-so` cho nhịp `fact:<nhãn>`. Chỉ dựng ở cảnh `item` (top-list, tier-board) |
| `diem` | Với `dap-zoom*`, `cat-nhay`: tâm phóng `[x, y]` theo tỉ lệ 0–1 của khung ảnh, mặc định `[0.5, 0.45]` |
| `zoom` | Với `dap-zoom*`, `cat-nhay`: độ phóng cuối (mặc định 1,8, có `crop` 1,35; cắt nhảy 1,7) |
| `anh` | Với `chia-o`: 2–3 nhịp ảnh cho các ô, vd. `["screenshot:1", "screenshot:3", "screenshot:4"]`; bỏ trống thì ba góc máy của cùng ảnh |
| `tu` | Với `dem-so`: số bắt đầu đếm (mặc định 0), vd. `199000` để giá rơi về 0đ |

Mỗi shot không nên dài quá 3,5 giây. `build_timeline.py` sẽ cảnh báo nếu vượt.

## Gag: nhịp cười bằng hình

Mỗi gag là một khoảnh khắc 0,8–3 giây đè lên hình đang chạy, xong đúng lúc đọc `cue` (từ punchline). Không hai gag cách nhau dưới 1,5 giây, không gag trùng lúc thẻ `fact` bật lên.

| Trường | Ghi chú |
|---|---|
| `cue` | Từ trong `narration`, thường là chữ đầu của câu punchline |
| `kind` | `sticker` (hình linh vật hoặc đạo cụ), `dong-bang` (đứng hình ngả xám + chữ), `zoom-kich-tinh` (zoom giật vào chi tiết, khoanh đỏ), `rung` (rung khung), `ky-vong-thuc-te`, `ten-that`, `tin-nhan`, `the-thoi-gian`, `ba-giai-doan`, `so-sanh` (cặp mạnh / yếu), `chu-to` (chữ "???", "HẾT." phủ tối toàn khung; cùng `dong-bang` tối đa 2 lần mỗi video, chỉ câu cụt 1–3 chữ, không nhắc lại lời đọc), `dau-chu` (chữ đóng dấu nghiêng đè lên ảnh, không phủ tối, tối đa 4 chữ; dùng thay `chu-to` cho mọi chữ nhấn khác), `binh-luan` (bình luận tập trước, đã che tên và ảnh đại diện), `combo` (bộ đếm đòn "QUẢNG CÁO x3 COMBO!", tối đa 1 lần mỗi video), `keo-so-sanh` (thanh kéo chia đôi hai ảnh của cùng ứng dụng, tối đa 1 lần mỗi video) |
| `asset` | Với `sticker`, `so-sanh`: tên file trong `templates/_shared/sticker/` không có đuôi, ví dụ `linh-vat-khoc` |
| `strong` | Tuỳ chọn, chỉ `so-sanh`: dòng mạnh (0 hoặc 1) để tô nền brand và đặt linh vật. Bỏ trống thì template tự nhận dòng yếu qua từ KHÔNG, CHƯA, THỬ… |
| `text` | Chữ của gag (≤ 20 ký tự mỗi dòng), ví dụ `"5 PHÚT SAU…"`, `["KỲ VỌNG", "THỰC TẾ"]`, tin nhắn `[["Pin", "Đừng."], ["Mình", "Một ứng dụng nữa thôi."]]` |
| `so` | Chỉ `combo`: số đòn, số nguyên 2–9 (mặc định 3). `text` là nhãn ("QUẢNG CÁO") |
| `anh` | Chỉ `keo-so-sanh` (bắt buộc): hai nhịp ảnh khác nhau của cảnh, vd. `["screenshot:2", "screenshot:3"]`; `text` là hai nhãn `["TRƯỚC", "SAU"]` |
| `sfx` | Tên sfx đi kèm (tuỳ chọn); nếu có thì không khai báo trùng ở `sfx` của cảnh |

Trạng thái 06/10/2026: `templates/_shared/gags.js` đã dựng mọi loại trừ `binh-luan` (gag chưa dựng bị bỏ qua và `hyperframes check` cảnh báo; khi đó bỏ sfx đi kèm để không có tiếng mà không có hình).

## Source

`{ "id": "S1", "title": string, "url": string, "published": "YYYY-MM-DD" }`. Trang cửa hàng không có ngày đăng thì ghi ngày tra.

## Ví dụ

```json
{
  "title": "4 ứng dụng miễn phí ít người biết cho sinh viên",
  "format": "vertical",
  "template": "top-list",
  "language": "vi",
  "message": "Video này nói với sinh viên dùng điện thoại tầm trung rằng có bốn ứng dụng miễn phí làm được việc mà họ đang trả tiền.",
  "angle": "Ứng dụng miễn phí thay ứng dụng trả phí cho việc học",
  "series": "ung-dung-it-nguoi-biet",
  "hook_type": "ket-qua-truoc",
  "hook_variants": [
    { "hook_type": "cau-hoi", "narration": "Bạn còn trả tiền để quét tài liệu à?", "on_screen_text": "CÒN TRẢ TIỀN À?", "why": "đánh thẳng vào khoản chi quen thuộc" },
    { "hook_type": "con-so", "narration": "Bốn ứng dụng này tiết kiệm cho mình hơn một triệu mỗi năm.", "on_screen_text": "TIẾT KIỆM 1 TRIỆU/NĂM", "why": "con số cụ thể, có nguồn từ giá App Store" }
  ],
  "target_seconds": [45, 60],
  "scenes": [
    {
      "id": 1,
      "type": "intro",
      "role": "hook: kết quả bất ngờ trước, mở vòng tò mò về ứng dụng cuối",
      "narration": "Chụp một trang vở. Ba giây sau, nó thành file chữ sửa được. Và ứng dụng cuối còn làm được nhiều hơn.",
      "on_screen_text": "3 GIÂY. MIỄN PHÍ.",
      "on_screen_subtext": "4 APP MIỄN PHÍ · CÓ TIẾNG VIỆT",
      "app": null,
      "visual_hint": "clip quay màn hình: chụp trang vở → chữ hiện ra",
      "shots": [
        { "show": "text" },
        { "cue": "ba giây", "show": "clip", "from": 4 }
      ]
    },
    {
      "id": 2,
      "type": "item",
      "rank": 4,
      "role": "bằng chứng: quét tài liệu không cần gói trả phí",
      "narration": "Số bốn, Tên Ứng Dụng. Đang chép bài thì hết giờ, chụp một phát là xong. Nhưng muốn xuất file thì xem một quảng cáo.",
      "on_screen_text": "#4 · TÊN ỨNG DỤNG",
      "app": { "name": "Tên Ứng Dụng", "app_store_id": 1234567890, "play_package": "com.hang.ungdung", "platform": "both" },
      "facts": [
        { "label": "Giá", "value": "Miễn phí", "source_ids": ["S1"] },
        { "label": "Quảng cáo", "value": "Có", "source_ids": ["S2"] }
      ],
      "source_ids": ["S1", "S2"],
      "visual_hint": "icon → clip quét trang vở → thẻ quảng cáo",
      "shots": [
        { "show": "icon" },
        { "cue": "chụp một phát", "show": "clip", "from": 10 },
        { "cue": "quảng cáo", "show": "fact:Quảng cáo" }
      ],
      "gags": [{ "cue": "quảng cáo", "kind": "sticker", "asset": "linh-vat-cay", "sfx": "bonk" }],
      "sfx": [{ "name": "whoosh", "cue": "Số bốn" }]
    },
    {
      "id": 6,
      "type": "outro",
      "role": "đóng vòng tò mò + kéo bình luận",
      "narration": "Bốn ứng dụng, không tốn đồng nào. Bạn đang trả tiền cho ứng dụng nào mà muốn tìm bản miễn phí? Theo dõi để xem phần sau.",
      "on_screen_text": "BẠN TRẢ TIỀN APP NÀO?",
      "app": null,
      "visual_hint": "bảng 4 icon xếp hạng, logo kênh nhỏ ở góc"
    }
  ],
  "sources": [
    { "id": "S1", "title": "Tên Ứng Dụng trên App Store Việt Nam", "url": "https://apps.apple.com/vn/app/id1234567890", "published": "2026-10-12" },
    { "id": "S2", "title": "Tên Ứng Dụng trên Google Play", "url": "https://play.google.com/store/apps/details?id=com.hang.ungdung", "published": "2026-10-12" }
  ]
}
```

Trong ví dụ trên, cảnh hạng 1 (không in ra) mang con dấu, ví dụ `"verdict": { "label": "CÀI NGAY", "reason": "làm được việc của ứng dụng trả phí, không quảng cáo", "for_who": "sinh viên hay ghi chép", "cue": "cài ngay" }`.

## Ví dụ video một ứng dụng (template `news`, bản nhanh)

Chỉ in cảnh cuối, nơi đặt con dấu:

```json
{
  "id": 4,
  "type": "outro",
  "role": "phán quyết + ai nên dùng + kéo bình luận",
  "narration": "Chờ giảm giá. Xịn thật, nhưng hai trăm nghìn một tháng thì hơi đau. Bạn sẽ trả hay dùng bản miễn phí?",
  "on_screen_text": "TRẢ HAY DÙNG FREE?",
  "app": { "name": "Tên Ứng Dụng", "app_store_id": 1234567890, "play_package": null, "platform": "ios" },
  "visual_hint": "icon mờ, con dấu CHỜ GIẢM GIÁ đóng giữa khung; chữ trên màn hình là câu hỏi, không lặp nhãn con dấu",
  "verdict": { "label": "CHỜ GIẢM GIÁ", "reason": "giá gói tháng cao so với bản miễn phí", "for_who": "người chỉnh ảnh hằng ngày", "cue": "chờ giảm giá" }
}
```
