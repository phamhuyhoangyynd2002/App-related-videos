# Prompt tạo logo "Anh Lười đây!" (12/10/2026)

Công thức chung của chuỗi kênh (từ logo Vừa của kênh game): chữ cái đầu thành nhân vật có mắt · biểu tượng ngách làm miệng · bệ xếp tầng · hàng 4 biểu tượng nét rỗng phía trên. Kênh này: chữ L, mắt lim dim, miệng là thanh vuốt home, bệ là điện thoại nằm ngửa.

## Prompt chính

```
Flat vector mascot logo, chunky 3D extruded letter "L" turned into a lazy character.
The vertical stroke of the L is the body, the horizontal stroke stretches out like legs lounging,
the whole letter leaning back slightly as if reclining.
Two big half-closed sleepy eyes (heavy eyelids, small black pupils) on the upper part of the vertical stroke.
The mouth is a short rounded horizontal pill-shaped bar (like a phone's home swipe indicator), cream white with a thin dark outline.
The L lies on a stepped two-layer platform shaped like a smartphone lying flat face-up: dark navy rim, mint screen surface.
Above the letter, a row of four simple outline icons in the same mint color, thick strokes, evenly spaced:
a speech bubble, a camera lens circle, a note sheet with folded corner, a bell.
Colors only: mint green #6FE3C1 (main), darker mint #3FB89A (extrusion side/shadow), dark navy #0B1524 (outlines, rim),
cream #F4F1E6 (eyes, mouth). Bold clean shapes, thick consistent outlines, no gradients, no text,
centered, isolated on plain white background, readable at very small size.
```

## Negative prompt (nếu công cụ có ô riêng)

```
apple logo, google play triangle, app store icon, rounded square app icon, android robot, letter V,
d-pad, game controller, text, words, watermark, gradient, realistic, photo, extra letters, multiple characters
```

## Biến thể nên tạo (mỗi bản 3–4 ảnh)

1. Bản chính như trên.
2. Bỏ hàng biểu tượng (cho logo-bug cỡ nhỏ 84px): thêm "no icons above".
3. Mắt nhắm hẳn kèm "z z" nhỏ: chỉ để tham khảo cho bộ biểu cảm linh vật, không dùng làm logo.

## Khi có ảnh

Đặt ảnh gốc vào `templates/_shared/logo-nguon/`, báo Claude: tách nền, kiểm ở cỡ 84px trên khung video, so với logo Vừa và thương hiệu Apple/Google, rồi ghi `templates/_shared/logo.png`.
