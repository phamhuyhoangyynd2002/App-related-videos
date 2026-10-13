# Prompt bộ biểu cảm linh vật "Lười" (12/10/2026)

Cách dùng: **luôn đính kèm `logo-goc.png` làm ảnh tham chiếu** rồi dán khung chung + một dòng biểu cảm. Mỗi biểu cảm tạo 2–4 ảnh, chọn bản giống logo nhất. Lưu thành `templates/_shared/sticker/linh-vat-<tên>.png` (Claude tách nền).

## Khung chung (dán trước mỗi biểu cảm)

```
Use the attached logo as the exact character reference: the same chunky 3D extruded mint letter "L"
(#6FE3C1 front, #3FB89A extrusion), thick dark navy outlines (#0B1524), cream (#F4F1E6) half-lidded eyes
and a cream pill-shaped mouth like a phone home indicator. Keep proportions, colors and outline weight identical.
Remove the row of icons. Add small simple black cartoon arms with white cartoon gloves and short black legs.
Die-cut sticker style: thick white border around the whole figure, flat vector, no gradients, no text,
plain white background, centered, full body visible.
Pose and expression:
```

Mặc định đứng trên bệ điện thoại nhỏ như logo. Biểu cảm nào ghi "không bệ" thì thêm `no platform`.

## 10 biểu cảm

| Tên file | Dùng khi | Dòng thêm vào cuối prompt |
|---|---|---|
| `linh-vat-lim-dim` | mặc định, giới thiệu ứng dụng | `relaxed default pose, leaning back on the phone platform, one gloved hand waving lazily, signature half-closed eyes, flat mouth` |
| `linh-vat-ngu-gat` | ứng dụng chán, chờ lâu | `fallen asleep lying flat on the phone platform like a bed, eyes fully closed as curved lines, small "z z" floating above, mouth bar slightly tilted` |
| `linh-vat-tinh-ngu` | ứng dụng xịn bất ngờ (punchline) | `eyes suddenly wide open and round, pupils tiny, mouth bar turned into a small open oval, sitting bolt upright, both gloved hands up, small motion lines around` |
| `linh-vat-duyet` | "Anh Lười duyệt", con dấu CÀI NGAY | `confident lazy approval, one eye half-closed, thumbs up with one gloved hand, mouth bar curved into a small smirk` |
| `linh-vat-che` | ứng dụng tệ, BỎ QUA | `unimpressed side glance, eyelids even heavier, mouth bar tilted down, one gloved hand pushing away, no platform` |
| `linh-vat-soc-gia` | gói trả phí đắt | `shocked, eyes wide, mouth pill stretched into a long open oval, both gloved hands on cheeks, a few sweat drops, no platform` |
| `linh-vat-nghi` | so sánh, cân nhắc | `thinking, one gloved hand on chin, eyes looking up, mouth bar tilted, small question mark above, no platform` |
| `linh-vat-cuoi` | gag, chuyện buồn cười | `laughing hard, eyes closed as happy upturned arcs, mouth pill curved into a wide open smile, leaning back holding belly` |
| `linh-vat-buc` | quảng cáo dày đặc, xin quyền vô lý | `annoyed, eyelids flat and low, small angry vein symbol, mouth bar pressed thin, arms crossed, no platform` |
| `linh-vat-luoi-cham` | "ba chạm, hết việc", mẹo nhanh | `lying on the phone platform, lazily tapping the screen with one gloved finger, small tap ripple circles, satisfied half-closed eyes` |

## Lưu ý

- Không thêm tóc, mũ, quần áo: linh vật chỉ là chữ L, giống Vừa chỉ là chữ V.
- Màu lệch (xanh lá, xanh dương) hoặc nét mảnh hơn logo thì tạo lại, không tự chỉnh màu.
- Mỗi khung video chỉ hiện một hình linh vật (luật trong `frame.md`).
