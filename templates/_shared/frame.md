---
version: draft
name: Kênh ứng dụng — Frame (bản kế thừa từ Game linh vật Ví, 12/10/2026)
description: >
  Hệ thiết kế khung hình của kênh ứng dụng điện thoại cho video ngắn dọc 1080×1920 đăng TikTok,
  YouTube Shorts, Facebook Reels (Instagram Reels đăng thêm). Chép từ hệ thiết kế của kênh game Game linh vật Ví:
  bố cục, cỡ chữ, chuyển động, thành phần giữ nguyên; **bảng màu, logo, tên kênh, linh vật phải đổi** bằng
  /thiet-lap-kenh để hai kênh không trông giống hệt nhau.
  Định dạng theo frame.md của HyperFrames: frontmatter là giá trị bắt buộc, phần chữ bên dưới là ý đồ.
  Thành phần nhận diện (logo-bug, verdict-stamp, sonic-signature, score-card) kế thừa từ kênh game;
  bảng màu dưới đây là màu của kênh game, chỉ dùng tạm.
unit: khung 1080×1920 (chính); 1920×1080 (phụ)
principle: một điểm nhấn mỗi cảnh · chữ đọc được trên điện thoại · số liệu lấy từ kịch bản

colors:
  ground: "#1A1633"     # nền chính
  ground-2: "#2A2350"   # mảng nền phụ, thẻ thông tin
  text: "#FFFFFF"
  text-dim: "#C9C3E6"
  accent: "#FFC23D"     # thứ hạng, từ đang đọc trong phụ đề
  accent-2: "#FF5C7A"   # điểm nhấn thứ hai, dùng rất ít; con dấu BỎ QUA
  outline: "#000000"    # viền chữ phụ đề
  verdict-play: "#34D27B" # chỉ dùng cho con dấu CHƠI NGAY
  brand: "#98BE45"      # xanh lá của logo: tên kênh, viền bóng thẻ
  brand-dark: "#131B1D" # đen của logo: nền màn kết, viền chữ tên kênh

typography:
  # Font phải có đủ dấu tiếng Việt và nằm trong templates/_shared/fonts/ (HyperFrames lint bắt buộc @font-face tới file cục bộ)
  hook:      { fontFamily: "Be Vietnam Pro", px: 96, weight: 900, lineHeight: 1.3, upper: true }   # chữ in hoa nhiều dòng: ≥ 1.3, dấu chồng (Ằ, Ổ, Ợ) cao ~1,3em, thấp hơn thì chạm dòng trên
  rank:      { fontFamily: "Be Vietnam Pro", px: 260, weight: 900, lineHeight: 0.9 }
  title:     { fontFamily: "Be Vietnam Pro", px: 84, weight: 800, lineHeight: 1.2 }
  caption:   { fontFamily: "Be Vietnam Pro", px: 68, weight: 800, lineHeight: 1.2, stroke: "6px outline" }
  fact-label:{ fontFamily: "Be Vietnam Pro", px: 36, weight: 600 }
  fact-value:{ fontFamily: "Be Vietnam Pro", px: 52, weight: 800 }
  source:    { fontFamily: "Be Vietnam Pro", px: 28, weight: 500, opacity: 0.8 }
  stamp:     { fontFamily: "Be Vietnam Pro", px: 120, weight: 900, lineHeight: 1.0, upper: true }

spacing:
  safe-top: "250px"
  safe-bottom: "450px"
  safe-right: "150px"
  safe-left: "60px"
  caption-center-y: "65%"

motion:
  ease-in: "expo.out"        # tương đương cubic-bezier(0.16, 1, 0.3, 1); không dùng linear
  enter: "0.25–0.4s"
  shot-change: "cắt hoặc chuyển 0.2–0.3s, hình đổi mỗi 1,5–2s; khung đập nhẹ (scale 1.07→1) đúng lúc đọc từ khoá emphasis"

components:
  rank-badge:
    description: "Số thứ hạng rất lớn màu accent, vào bằng scale 1.4→1 trong 0.3s đúng lúc lời đọc nói thứ hạng."
  fact-card:
    background: "{colors.ground-2}"
    description: "Tối đa 3 thẻ, bật lên lần lượt (không cùng lúc) theo cue trong shots."
  caption:
    description: "Cụm 2–4 âm tiết từ timeline.captions, từ đang đọc đổi sang accent. Video dọc luôn MỘT dòng: build_timeline.py tách cụm theo bề rộng đo bằng font (≤ 840px ở 68px, tên tiếng Anh dài được tách); template co chữ (tối thiểu 60px) nếu vẫn tràn, sticker gag không dùng chỗ dành sẵn khi chỗ đó đè thẻ đang hiện."
  logo-bug:
    description: "Ngoại lệ tier-board: chỉ giữ chữ tên kênh (ẩn hình logo) để mỗi khung tối đa một hình linh vật/logo. Logo _shared/logo.png (cao 84px, viền sáng mảnh) + chữ tên kênh (BRAND_NAME trong appreel.js) in hoa 50px weight 900 màu brand viền brand-dark, góc trên bên trái trong vùng an toàn (x 60px, y 256px). Có từ khung t = 0, nảy nhẹ một lần ở 0,3s, đứng yên suốt video. Không có đoạn intro logo."
  end-card:
    description: "Màn kết chuẩn, giống nhau ở mọi video: vào đúng lúc đọc câu ký tên (từ 'theo' cuối cùng của cảnh cuối), nền brand-dark 94%, logo lớn 360px bật vào (back.out), chữ tên kênh 128px màu brand, câu định vị (BRAND_TAG), nút vàng 'THEO DÕI ĐỂ XEM TẬP SAU'. Âm thanh: sfx ting cùng lúc (khai báo trong cảnh cuối, cue 'Theo'). Tắt bằng end_card: false."
  intro-kit:
    description: "Mở đầu chuẩn: khung t = 0 đã có băng chữ hook lớn (chữ trắng viền đen trên nền đen 82%) đè lên hình ứng dụng hoặc bảng xếp hạng, logo-bug đã nằm sẵn ở góc. Không fade từ đen, không chào."
  tier-board:
    description: "Bảng SSS→D (nhãn hạng chữ trắng viền đen trên ô màu đỏ, cam, vàng, xanh vàng, xanh lá, xanh dương). Kể từng ứng dụng: bảng thu về góc phải trên (0,36 lần, gốc biến đổi (930, 290): đủ cả hàng D, đáy y ≈ 607, trên dải hình), tên ứng dụng ở góc trái trên trên nền accent, hình ứng dụng dải rộng 1080×560 (y 630–1190), linh vật nhỏ ở góc phải dưới dải hình. Thẻ thông tin (nhãn 44px, giá trị 56px) dùng chung MỘT ô dưới phụ đề (x 60, y 1312–1456, rộng ≤ 870): thẻ mới bật vào thì thẻ cũ trượt ra (cách ≥ 0,3s). Trước câu chốt 0,95s bảng trở về giữa, icon game bay vào hàng. Sticker gag sau lúc đó và ở cảnh kết dùng chỗ dành sẵn góc phải dưới phụ đề (x 750–930, y 1298–1470), không che hàng bảng. Cảnh kết: bảng đầy đủ để soi; đúng lúc đọc câu hỏi (hai từ đầu của chữ trên màn hình) bảng thu 0,72 lần lên trên và băng câu hỏi bật ra ngay dưới bảng (y 940–1188), không che hàng nào. Hook: nhịp nào lời đọc nhắc một hạng ('hạng S', 'C với D', 'ba S') thì ảnh nền là game của hạng đó."
  verdict-stamp:
    description: "Con dấu phán quyết, đúng một lần mỗi video, vào xong đúng timeline.scenes[].verdict.at. Chữ in hoa theo typography.stamp, viền đôi, xoay −8°, đặt giữa khung ở khoảng 45% chiều cao (trên vùng phụ đề). Vào bằng scale 1.6→1 trong 0.18s kèm rung nhẹ, giữ ít nhất 1.2s. Màu: CHƠI NGAY = verdict-play; CHỜ GIẢM GIÁ, CHƠI THỬ = accent; BỎ QUA = accent-2. Hình dạng và vị trí giống nhau ở mọi kênh. Ngoại lệ tier-board (06/10/2026): bảng chiếm giữa khung, nên lúc icon vào hàng xong bảng thu 0,5 lần lên trên (đáy y ≈ 750) và con dấu đóng ở tâm y 900 (~47%) cỡ 80%: không đè bảng, không đè phụ đề (y ~1198–1298), không vào 450px đáy. Ngoại lệ (người làm video duyệt 05/10/2026): ở bố cục item có ảnh dọc (khung điện thoại), cột tựa mục và thẻ nằm đúng dải 45% nên con dấu đóng lên nửa trên ảnh dọc (tâm khoảng y 480) ở cỡ 60%, để không che tựa mục và thẻ; hình dạng, màu, chuyển động, âm thanh giữ nguyên."
  gag-so-sanh:
    description: "Gag so-sanh (gags.js): hai dòng đối lập xếp chồng (x 60–930, y ~700–1110, trên phụ đề), mỗi dòng 'NHÃN: GIÁ TRỊ' (nhãn 0,6em). Dòng mạnh nền brand, dòng yếu nền accent-2 đập vào nghiêng nhẹ; dòng yếu tự nhận ra qua từ KHÔNG/CHƯA/THỬ…, ghi đè bằng trường strong (0/1). Dòng 1 xong đúng at, dòng 2 xong đúng lúc đọc từ đầu của nó. linh vật (asset) đứng mép phải dòng mạnh, là hình linh vật duy nhất của khung. Ngoại lệ tier-board màn kết (06/10/2026): bảng đầy đủ chiếm y 430–1170 nên lúc gag vào bảng thu 0,45 lần lên trên (đáy y ≈ 706, đủ S→D), hai dòng đặt từ y 760 (data-vs-top trên nút cảnh), bảng giữ cỡ đó tới câu hỏi rồi về 0,72 lần."
  gag-ba-giai-doan:
    description: "Gag ba-giai-doan: ba nấc chữ bậc thang (lệch phải 90px, xuống 170px; 72 → 88 → 104px; trắng → accent → accent-2), mỗi nấc có ô số 1–3, nấc cũ mờ 60%. Nấc sau xong đúng lúc đọc từ cuối của nó nếu có trong lời, không thì chia đều, cách ≥ 0,3s. Không vẽ ba biểu cảm linh vật (luật một hình linh vật mỗi khung); asset tuỳ chọn hiện một linh vật ở nấc cuối."
  gag-dau-chu:
    description: "Gag dau-chu (gags.js, 12/10/2026): chữ đóng dấu nghiêng −7°, weight 900 in hoa màu #111 trên nền vàng #FFC23D hoặc xanh #98BE45 (luân phiên, ghi đè bằng color), viền đen 10px, bóng đổ cứng 10/12px. Đè lên góc/mép khung hình ứng dụng của cảnh (data-gag-media), ưu tiên vắt qua mép trên/dưới, không đè tựa, thẻ, phụ đề, logo-bug, trong vùng an toàn; không phủ tối khung; dấu ≤ 28% diện tích khung hình. Tối đa 4 chữ, co chữ theo khung (tối thiểu 52px). Đập vào scale 1.4→1 trong 0,15s, xong đúng at, giữ tới end (build_timeline đặt 1,4s)."
  gag-lop-toi:
    description: "Không gag nào phủ đen toàn khung (12/10/2026): chu-to và ky-vong-thuc-te chỉ tối cục bộ (elip mép mờ ~45% quanh khối chữ), dong-bang khử màu + xám 22%, viền tối mỏng. Ngoại lệ: the-thoi-gian là thẻ chuyển cảnh toàn khung."
  kieu-hinh:
    description: "Bộ chuyển động có tên (kieu-hinh.js, thẻ từng kiểu ở kieu-hinh.md, chắt lọc từ video-shotcraft 12/10/2026): dap-zoom (khung ngắm bốn góc accent khoá mục tiêu, giật zoom 0,2s ease-in, nảy 4% hoặc rung 14px tắt dần, chớp sáng ấm), cat-nhay (hai nhát cắt cứng vào gần, chớp trắng 0,12s), chia-o (ba ô truyện tranh xéo viền trắng, ô cuối bung thành poster), lat-the (thẻ úp '?' lật trục Y, một vệt sáng), dem-so (số đếm 0,6s chậm dần, đập 1,25→1), chuyen day-len / lia giữa các mục top-list; gag combo, keo-so-sanh (gags.js). Mọi kiểu dùng màu, font của hệ này. Máy quay của kiểu hình (.kh-cam) chỉ chứa ảnh; thẻ, chữ, logo, phụ đề, con dấu không chạy theo. Cú đập cả khung tối đa 3 lần mỗi video; một kiểu không lặp ở hai mục liền nhau."
  sonic-signature:
    description: "sfx/chu-ky.*, tối đa 1 giây, chỉ đi cùng verdict-stamp, không bao giờ ở giây đầu. Template không phát: build_timeline.py đặt vào timeline.sfx, mix_audio.py trộn."
  score-card:
    background: "{colors.ground-2}"
    description: "Thang 'Điểm máy yếu' 1–5 cho series PC: 5 ô, ô đạt màu accent; nhãn 'ĐIỂM MÁY YẾU' theo fact-label. Bật lên như một fact-card, theo cue."
---

## Tổng quan

Video ngắn được xem trên điện thoại, trong vài giây, thường tắt tiếng. Thiết kế phục vụ ba việc: người xem dừng lướt ở khung đầu, đọc được chữ ở cỡ điện thoại, và luôn biết đang ở hạng mấy/tin nào.

## Nguyên tắc

- **Một điểm nhấn mỗi cảnh** (Remotion: "thiết kế video, không phải trang web"). Quyết định người xem phải thấy gì đầu tiên, dựng khung quanh đúng thứ đó.
- **Không hiện hai thứ mới cùng lúc** (video-use): mắt không theo kịp. Thứ này vào, ngừng một nhịp, thứ tiếp theo.
- **Dồn sự táo bạo vào một chỗ** (anthropics/frontend-design): thứ hạng lớn là điểm nhớ; mọi thứ khác tiết chế.
- Tránh các "dấu hiệu AI" mặc định: nhãn chữ in hoa giãn chữ trên mọi tiêu đề, chuỗi "A · B · C" khắp nơi, thẻ bo góc giống hệt nhau, gradient chỉ để trang trí.
- Ứng dụng nào mang màu riêng của ứng dụng đó: có thể lấy một màu chủ đạo từ icon làm nền cảnh của ứng dụng, nhưng giữ accent của kênh cho thứ hạng và phụ đề.

## Nhận diện dùng chung mọi kênh

- **Con dấu phán quyết là "meme" của thương hiệu** (`.claude/rules/phong-cach-thuong-hieu.md`). Nó phải trông giống hệt nhau ở mọi kênh, mọi series: cùng hình dạng, vị trí, chuyển động, âm thanh. Nhân vật và âm thanh lặp lại lâu dài là loại tài sản thương hiệu người xem nhận ra nhanh nhất; đổi kiểu theo từng video sẽ làm mất tác dụng.
- Ba màu con dấu theo kiểu đèn giao thông (xanh cài ngay, vàng dùng thử / chờ giảm giá, đỏ bỏ qua) để người đang tắt tiếng hiểu ngay trong nửa giây, không cần đọc chữ.
- Con dấu là điểm "táo bạo" thứ hai của video, sau số thứ hạng. Cảnh có con dấu không đặt thêm thẻ thông tin mới cùng lúc.

## Kiểm tra trước khi dùng một font khác

Font lỗi tải sẽ âm thầm rơi về font mặc định. Template phải gọi `document.fonts.check('900 96px "Be Vietnam Pro"')` và báo lỗi nếu false. Font trang trí (ví dụ "Press Start 2P" trong theme arcade của HyperFrames) thường **không có dấu tiếng Việt**: chỉ dùng cho số và chữ Latin không dấu.
