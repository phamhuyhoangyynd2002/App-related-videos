# Đánh giá thị trường: kênh game PC và kênh ứng dụng điện thoại

> Nghiên cứu ngày 12/10/2026 · Người yêu cầu: Hoàng Phạm
> Hai nhóm chủ đề: (1) giới thiệu, xếp hạng, đánh giá **game PC**; (2) giới thiệu, xếp hạng, đánh giá **ứng dụng điện thoại** (hiểu là ứng dụng không phải game; game điện thoại đã có trong [nghien-cuu-khan-gia-va-phong-cach-2026-09.md](nghien-cuu-khan-gia-va-phong-cach-2026-09.md)).
> Nền tảng xét: TikTok, Facebook, YouTube; thị trường Việt Nam, đối chiếu quốc tế và Trung Quốc.

## Cách đọc tài liệu

Mỗi con số thuộc một trong hai loại:

- **[Đo]**: số đo trực tiếp ngày 12/10/2026 (khoảng 13:30–14:10, giờ Việt Nam) từ trang công khai của YouTube, TikTok, Bilibili, Facebook. Dữ liệu thô và công cụ đo nằm trong [du-lieu-thi-truong-2026-10-12/](du-lieu-thi-truong-2026-10-12/), ai cũng chạy lại được.
- **[Mã nguồn]**: số liệu từ báo cáo, bài báo, có link ở mục Nguồn cuối tài liệu.

Những câu đánh giá được ghi rõ **Nhận định** và luôn chỉ ra số liệu mà nó dựa vào. Không có con số nào trong tài liệu là ước đoán. Chỗ nào không đo được thì ghi **chưa đo được**.

## Tóm tắt

| Tiêu chí | Game PC | Ứng dụng điện thoại |
|---|---|---|
| 1. Khả thi ở Việt Nam | **Rủi ro lớn**: Steam bị chặn một phần từ 5/2024 và gián đoạn rộng hơn từ 02/10/2026 [M5][M6][M7]. Chỉ 0,25% máy trong khảo sát Steam dùng tiếng Việt [M1] | **Có**: Việt Nam có 2,88 tỉ lượt cài ứng dụng năm 2025, đứng thứ 11 thế giới [M3] |
| 2. Hợp video ngắn (TikTok, FB, YouTube Shorts) | **Yếu ở Việt Nam**: 11 kênh game PC Việt có Shorts, trung vị lượt xem Shorts từ 292 đến 35.000; trong khi 5 kênh game PC Việt mạnh nhất về video dài đạt trung vị 123.500–280.000 [Đo] | **Mạnh**: 5 tài khoản công nghệ Việt lớn nhất trên TikTok có trung vị 51.250–880.550 lượt xem mỗi video [Đo]; 4 tài khoản chuyên ứng dụng nước ngoài đang hoạt động trên TikTok đạt trung vị 34.950–245.100 [Đo] |
| 3. Đã có kênh Việt làm chưa | **Có, mạnh ở video dài**: 5 kênh từ 615.000 người đăng ký trở lên. Video ngắn chuyên game PC: chưa tìm thấy tài khoản TikTok Việt nào chuyên làm | **Có, nhưng là kênh công nghệ tổng hợp** (Ngô Đức Duy 8,3 triệu người theo dõi TikTok). Kênh **chuyên** giới thiệu ứng dụng: chưa tìm thấy kênh Việt nào |
| 4. Nước ngoài, Trung Quốc có làm không | Có, nhiều. Bilibili: 81/109 video hàng đầu theo 6 từ khoá vượt 1 triệu lượt xem [Đo] | Có, nhiều. Bilibili: kênh 102.880 người theo dõi có video 9,4 triệu lượt xem [Đo] |
| 5. Khoảng trống (nước ngoài có, Việt Nam ít) | Có (demo Steam Next Fest, săn giá thấp nhất mỗi tuần), nhưng cầu ở Việt Nam bị Steam chặn kéo xuống, chưa đo được | **Rõ hơn**: dạng "N ứng dụng ít người biết" và series "Top ứng dụng hay của tháng" có kênh chuyên ở nước ngoài, Trung Quốc; ở Việt Nam chỉ thấy rải rác trong kênh công nghệ |

**Nhận định**: theo số đo ở trên, ứng dụng điện thoại có nhiều bằng chứng ủng hộ hơn game PC cho định dạng video ngắn tại Việt Nam. Game PC ở Việt Nam đang ăn khách ở **video dài** trên YouTube, không phải video ngắn, và chịu rủi ro Steam bị chặn. Chi tiết và giới hạn của từng số đo ở các mục dưới.

## 1. Phương pháp và giới hạn

| Nền tảng | Đo được gì | Cách đo | Giới hạn |
|---|---|---|---|
| YouTube | Số người đăng ký; lượt xem 30 video dài và 30 Shorts mới nhất của kênh; ngày đăng video cũ nhất, mới nhất trong mẫu | yt-dlp 2026.08.19 đọc trang kênh | YouTube làm tròn số người đăng ký và lượt xem trên trang danh sách (ví dụ 131.000). Kết quả tìm kiếm của YouTube chỉ trả về video dài, không lọc được Shorts |
| TikTok | Số người theo dõi, tổng tim, số video (chính xác đến đơn vị); lượt xem 30 video đầu trang hồ sơ | Dữ liệu `statsV2` trên trang hồ sơ; yt-dlp cho danh sách video | TikTok không có tìm kiếm công khai: tài khoản được tìm qua máy tìm kiếm web và đoán tên, nên **danh sách không đầy đủ**. "Chưa tìm thấy" không có nghĩa là "không tồn tại". Danh sách video có thể gồm video được ghim, nên ghi kèm khoảng ngày |
| Facebook | Số người theo dõi trang | Thẻ mô tả công khai của trang | Không đo được lượt xem Reels |
| Bilibili (Trung Quốc) | Lượt xem, tác giả, ngày đăng; số người theo dõi tác giả | API tìm kiếm công khai: 20 video nhiều lượt xem nhất và 20 video mới nhất cho mỗi từ khoá | Bilibili là nền tảng video dài và ngắn, không phải Douyin |
| Douyin (TikTok Trung Quốc) | **Chưa đo được** | | Trang web Douyin không trả dữ liệu khi không đăng nhập. Mã trang Douyin (đọc ngày 12/10/2026) có đoạn thông báo nền tảng "nâng cấp" số người theo dõi (粉丝数) thành "chỉ số người hâm mộ" (粉丝指数), một điểm số động; chưa tìm thấy thông báo này trên báo chí Phần Douyin dưới đây chỉ dùng số liệu Douyin tự công bố |

Trung vị (median) là giá trị đứng giữa khi xếp 30 video theo lượt xem, ít bị một video lan truyền kéo lệch như số trung bình.

## 2. Thị trường Việt Nam

### 2.1 Quy mô nền tảng

| Nền tảng | Người dùng tại Việt Nam (tiếp cận được bằng quảng cáo, cuối 2025) |
|---|---|
| Facebook | 79,0 triệu |
| TikTok | 76,1 triệu (chỉ tính từ 18 tuổi) |
| YouTube | 62,1 triệu |

Nguồn: DataReportal, Digital 2026: Vietnam, đăng 08/11/2025 [M2]. Đây là số tiếp cận quảng cáo, không phải người dùng hoạt động hằng tháng.

### 2.2 Game PC

- **Khảo sát phần cứng và phần mềm Steam, tháng 9/2026** (Valve) [M1], tỉ lệ máy theo ngôn ngữ cài cho Steam:

  | Ngôn ngữ | Tỉ lệ | So với tháng trước |
  |---|---|---|
  | Tiếng Trung giản thể | 31,39% | +7,42 điểm |
  | Tiếng Anh | 34,20% | −4,05 |
  | Tiếng Nga | 9,05% | −0,85 |
  | Tiếng Hàn | 1,37% | −0,26 |
  | Tiếng Thái | 0,82% | −0,07 |
  | **Tiếng Việt** | **0,25%** | −0,04 |
  | Tiếng Indonesia | 0,15% | −0,01 |

  Số này đo ngôn ngữ cài cho Steam, không đo số người Việt chơi Steam (người Việt dùng Steam bằng tiếng Anh không được tính). Không đổi được sang số người.
- **Steam bị chặn ở Việt Nam**:
  - Từ đầu tháng 5/2024, các nhà mạng trong nước chặn truy cập ứng dụng và trang Steam (Game Developer, 09/05/2024) [M5].
  - Từ 02/10/2026, người dùng báo không đăng nhập được, không tải, không cập nhật game, không dùng được Cộng đồng và Steam Cloud; tình trạng khác nhau giữa các mạng; chưa có thông báo chính thức mới của cơ quan nhà nước hay nhà mạng (Inven Global, 03/10/2026 [M6]; Techz, 05/10/2026 [M7]).
  - Mã nguồn bổ sung: 24hstore (09/2025) cho rằng tại thời điểm đó Steam chưa bị cấm chính thức [M8].
- **Số người chơi game PC tại Việt Nam**: **chưa tìm được số liệu đáng tin**. Một con số "57 triệu người chơi" gán cho Niko Partners xuất hiện trong kết quả tìm kiếm, nhưng trang của Niko không có số liệu riêng về Việt Nam (báo cáo trả phí) [M4], nên tài liệu này không dùng.

### 2.3 Ứng dụng điện thoại

Báo cáo của Adjust về xu hướng ứng dụng di động Việt Nam 2026 (dữ liệu 01/2024–03/2026), qua Tuổi Trẻ ngày 28/05/2026 [M3]:

| Chỉ số | Giá trị |
|---|---|
| Tổng lượt cài ứng dụng năm 2025 | 2,88 tỉ, đứng thứ 11 thế giới |
| Trong đó lượt tải game | 1,29 tỉ (nhóm lớn nhất) |
| Phần còn lại (2,88 − 1,29, phép trừ) | 1,59 tỉ lượt cài ứng dụng không phải game |
| Thời lượng mỗi phiên dùng ứng dụng giải trí, quý 1/2026 | 24,46 phút (tăng 12%); Đông Nam Á 14,28 phút |

## 3. Kênh Việt Nam đang làm

### 3.1 Game PC: YouTube [Đo]

Lượt xem là trung vị của 30 video gần nhất mỗi loại. "≥100k" là số video trong 30 video có từ 100.000 lượt xem.

| Kênh | Người đăng ký | Video dài: trung vị | ≥100k | Khoảng ngày | Shorts: trung vị | Khoảng ngày Shorts |
|---|---|---|---|---|---|---|
| meGAME | 2.570.000 | 126.000 | 20/30 | 01–08/2026 | 35.000 | 08–10/2024 (đã ngừng) |
| Trực Tiếp Game | 2.040.000 | 131.000 | 17/30 | 12/2025–09/2026 | không có Shorts | |
| Phân Tích Game | 1.040.000 | 280.000 | 27/29 | 09/2025–09/2026 | không có Shorts | |
| Phê Game | 831.000 | 123.500 | 15/24 | 09–10/2026 | 10.000 (cao nhất 3,3 triệu) | 08–10/2026 |
| Game Cực Hay | 615.000 | 80.000 | 12/29 | 08–10/2026 | 20.000 (5 video) | 10/2025–06/2026 |
| TopGame | 538.000 | 13.000 | 1/30 | 08–10/2026 | 3.900 | 05/2025–07/2026 |
| Mọt Game | 394.000 | 15.000 | 4/30 | 06–10/2026 | 9.650 | 04/2025–06/2026 |
| Người Già Chơi Game | 115.000 | **210.500** | 25/30 | 07–10/2026 | không có Shorts | |
| MG Gaming | 108.000 | 1.200 | 1/29 | 07–10/2026 | 12.500 | 10/2024 |
| Sub Game | 5.390 | 1.450 | 0/30 | 11/2024–08/2026 | 1.650 | 2023 |
| IndieLab | 4.690 | 1.300 (14 video) | 1/14 | 03/2025–10/2026 | 1.450 | 03–10/2026 |
| Muakey Biết Tuốt | 2.940 | 5.300 | 0/30 | 12/2024–12/2025 | 1.150 | 03–10/2026 |
| Tê, No Time No Game | 2.250 | 2.600 | 0/30 | 04–10/2026 | 2.300 | 03–10/2026 |
| New Game | 1.820 | 2.100 | 0/30 | 2022–10/2026 | 292 | 03/2025–10/2026 |

Những điều số đo cho thấy:
- 11 kênh có Shorts. 8 kênh có trung vị Shorts thấp hơn trung vị video dài của chính kênh đó; 3 kênh nhỏ ngược lại (Sub Game, IndieLab, MG Gaming).
- Trung vị Shorts cao nhất là 35.000 (meGAME, mẫu từ năm 2024, kênh đã ngừng làm Shorts). Trong các mẫu có Shorts đăng năm 2026, cao nhất là 20.000 (Game Cực Hay, chỉ 5 video, 10/2025–06/2026), tiếp theo là 10.000 (Phê Game).
- Người Già Chơi Game có 115.000 người đăng ký nhưng trung vị video dài 210.500, và 25/30 video vượt 100.000. Dạng nội dung: video dài "Tôi xếp hạng tất cả…" (ví dụ "Tôi xếp hạng tất cả Game Of The Year": 544.975 lượt xem).

### 3.2 Game PC: TikTok và Facebook [Đo]

| Tài khoản TikTok | Người theo dõi | Trung vị lượt xem | Khoảng ngày | Nội dung |
|---|---|---|---|---|
| GameK (@gamek.vn) | 1.238.792 | 1.543 | 22/09–12/10/2026 | Báo game, tin tổng hợp |
| Quốc Đạt Computer (@qdc.vn) | 84.807 | 475 | 07–09/2026 | Cửa hàng máy tính |
| Pinn tìm web (@pinntimweb) | 6.340 | 10.048 | 11/2022–01/2023 (đã ngừng) | Có video "Top game PC Steam miễn phí" |

- Thử tên TikTok của 8 kênh YouTube game PC ở mục 3.1 (phegame, motgame, motgame.vn, topgame, tructiepgame, megame…): không tài khoản nào có từ 1.000 người theo dõi. Đây là kết quả thử tên, **không** chứng minh các kênh đó không có TikTok.
- **Chưa tìm thấy tài khoản TikTok Việt nào chuyên giới thiệu, xếp hạng game PC.**
- Facebook: Trực Tiếp Game 519.271 người theo dõi; GameK 1.633.199; MixiGaming 5.430.795 [Đo].

### 3.3 Ứng dụng điện thoại: YouTube [Đo]

| Kênh | Người đăng ký | Video dài: trung vị | Shorts: trung vị | Khoảng ngày Shorts | Loại kênh |
|---|---|---|---|---|---|
| Vật Vờ Studio | 2.340.000 | 27.500 | 7.900 | 08–10/2026 | Công nghệ tổng hợp |
| Thế Tâm Youtube | 936.000 | 96.500 | 10.500 | 04/2025–10/2026 | Hướng dẫn công nghệ |
| Duy Luân Dễ Thương | 501.000 | 63.000 | 30.500 | 08–10/2026 | Công nghệ tổng hợp |
| Vinh Xô | 385.000 | 90.000 | 27.500 | 09–10/2026 | Đánh giá điện thoại |
| Mrx Mobile | 331.000 | 5.600 | 27.000 (4 video) | 06–07/2026 | Hướng dẫn điện thoại |
| Gia Huy 93 | 329.000 | 2.150 | 764 | 10/2026 | Hướng dẫn iPhone |
| Văn Thế Web | 250.000 | 1.750 | 4.250 | 07/2025–09/2026 | Hướng dẫn công cụ AI |
| Mẹo Hay iOS & Android | 37.200 | 3.550 | 1.600 | 01–07/2026 | Mẹo điện thoại |
| Ninh Mobile TV | 33.100 | 2.050 | không có Shorts | | Mẹo điện thoại |

Video về danh sách ứng dụng tìm thấy trên YouTube Việt Nam đều nằm trong kênh công nghệ tổng hợp, ví dụ "10 Ứng Dụng Hay Và Nên Dùng Do Team Vật Vờ Studio Gợi Ý" (137.876 lượt xem), "5 ứng dụng Android hay nhưng không có trên Google Play" của Khôi Ngọng (65.759) [Đo].

### 3.4 Ứng dụng điện thoại: TikTok và Facebook [Đo]

| Tài khoản TikTok | Người theo dõi | Trung vị lượt xem | Video ≥1 triệu (trong 30) | Khoảng ngày |
|---|---|---|---|---|
| Ngô Đức Duy (@duyyy.real.channel, Schannel) | 8.315.923 | **880.550** | 12 | 18/09–11/10/2026 |
| Tuấn Ngọc đây (@tuanngocday) | 2.788.793 | 69.350 | 2 | 26/09–11/10/2026 |
| HÙNG RV (@hung.rv) | 1.208.171 | 114.700 | 0 | 05/09–09/10/2026 |
| Vật Vờ Studio (@vatvostudio) | 1.177.755 | 51.250 | 1 | 23/09–11/10/2026 |
| Duy Luân Dễ Thương (@duyluandethuong) | 1.156.440 | 126.350 | 0 | 10/09–07/10/2026 |
| tamhn (@itstamhn) | 163.523 | 11.750 | 0 | 08–12/2025 |
| Trương Thư (@truongthu.tech) | 127.796 | 3.266 | 0 | 06–10/2026 |
| Điện Thoại Trung (@dienthoaitrung) | 7.453 | 9.153 | 0 | 09–10/2026 |

- Cả 8 tài khoản là kênh công nghệ, điện thoại tổng hợp; ứng dụng chỉ là một phần nội dung.
- **Chưa tìm thấy tài khoản TikTok Việt nào chuyên giới thiệu ứng dụng.** Thử 6 tên có thể (apphay, apphaymoingay, ungdunghay, meohaycongnghe…): tài khoản không tồn tại hoặc dưới 1.100 người theo dõi.
- Trang khám phá TikTok tiếng Việt về ứng dụng chủ yếu là chủ đề lẻ theo nhu cầu (app học Văn, học Toán, đọc sách), và có cả chủ đề vi phạm pháp luật ("app xem phim lậu", app "aimlock" gian lận Free Fire) [M9].
- Facebook: Schannel 1.269.839 người theo dõi; trang cá nhân Nguyễn Ngọc Duy Luân 405.327 [Đo].

## 4. Kênh nước ngoài [Đo]

### 4.1 Game PC

| Kênh | Nền tảng | Người theo dõi | Trung vị lượt xem | Ghi chú |
|---|---|---|---|---|
| gameranx | YouTube | 8.660.000 | 639.000 (video dài) | Top game mới mỗi tháng, "Before You Buy" |
| Force Gaming | YouTube | 1.090.000 | 157.000 dài; 34.000 Shorts | "10 game mới nên chơi tháng 10/2026" |
| yakkocmn | YouTube | 486.000 | 430.000 dài | Đăng không đều (2021–2026) |
| gamewise | YouTube | 110.000 | 108.000 dài; 6.700 Shorts | |
| Get To It | YouTube | 89.700 | 73.000 dài; 11.000 Shorts | Game Steam giá rẻ, miễn phí |
| Get To It (@gettoit_) | TikTok | 61.488 | 2.397 | Cùng nội dung, TikTok thấp hơn nhiều |
| PHIZZI | YouTube | 63.600 | 164.000 dài; 6.850 Shorts | "Top 50 game indie" |
| MadMorph (@madmorph) | TikTok | 1.521.246 | 61.150 | Gợi ý game, game dưới 5 USD dịp Steam sale |
| JustSaySteven (@justsaysteven) | TikTok | 138.281 | 61.300 | Tổng hợp game Steam điểm cao, game mới |
| Rogan (@roganplaysgames) | TikTok | 70.718 | 38.700 | Game indie "Overwhelmingly Positive" |
| WePC (@wepc) | TikTok | 427.943 | 7.096 | Phần cứng PC, game cho máy yếu |
| gamergirlgale | TikTok | 375.253 | 7.768 (cao nhất 15,5 triệu) | Game cozy, co-op giá rẻ |
| Indie Games (@indiegames) | TikTok | 100.092 | 4.215 | |
| Vencen (@vencenj) | TikTok | 1.560 | 1.610 (cao nhất 919.500) | Game Steam miễn phí mỗi ngày |

Những điều số đo cho thấy: kênh gợi ý game PC dạng video ngắn ở nước ngoài có trung vị rất chênh lệch (1.610 đến 61.300 trên TikTok), và cùng một kênh (Get To It) đạt trung vị 73.000 với video dài nhưng 2.397 trên TikTok.

### 4.2 Ứng dụng điện thoại

| Kênh | Nền tảng | Người theo dõi | Trung vị lượt xem | Dạng nội dung (theo tiêu đề) |
|---|---|---|---|---|
| Hayls World | YouTube | 2.750.000 | 532.000 dài; **373.000 Shorts** (27/30 Shorts ≥100k) | "10 ứng dụng bạn không biết là có tồn tại" (video từ 655.810 đến 2.823.735 lượt xem) |
| HowToMen | YouTube | 905.000 | 139.000 dài; 31.000 Shorts | **Series tháng** "Top 15 Best Android Apps – <tháng>": 12 tập trong mẫu tìm kiếm, mỗi tập 145.597–304.188 lượt xem |
| Andrew Ethan Zeng | YouTube | 445.000 | 177.500 dài; 163.500 Shorts | "12 ứng dụng iPhone độc đáo bạn nên có" (1.024.866) |
| Jeff Su | YouTube | 1.920.000 | 332.500 dài; 29.500 Shorts | Công cụ năng suất, AI |
| Trakin Tech (Ấn Độ) | YouTube | 15.600.000 | 890.500 dài; 954.500 Shorts | Công nghệ tổng hợp |
| Matty McTech (@setupspawn) | TikTok | 5.206.973 | 98.750 | Trang web, công cụ hữu ích |
| Tyler Morgan (@hitomidocameraroll) | TikTok | 2.004.641 | **245.100** | Ứng dụng, mẹo iPhone |
| Valstech (@valstechtalk) | TikTok | 469.617 | 208.950 | "Ứng dụng iPhone nên có" |
| Enrique Barrón (@soyenriquebarron) | TikTok | 100.518 | 34.950 | "50 ứng dụng cần có trên iPhone" (tiếng Tây Ban Nha), có video được nhà phát triển ứng dụng tài trợ |
| Ann App recommendations (@ann.apps) | TikTok | 23.187 | 30.850 (cao nhất 9,9 triệu) | Chuyên giới thiệu ứng dụng; ngừng đăng từ 07/2023 |

## 5. Trung Quốc

### 5.1 Douyin: số liệu do Douyin công bố [Mã nguồn]

- Hội nghị OEGC của Ocean Engine (bộ phận quảng cáo của ByteDance), 26/12/2025: Douyin có **hơn 9 triệu người sáng tạo nội dung game**, phủ **64,7% người quan tâm đến game** trên cả nước [M10]. Bài báo không nêu tên đơn vị đo.
- Không tìm được số liệu công khai về số tài khoản Douyin chuyên giới thiệu game PC hay ứng dụng. Lượt xem trên Douyin **chưa đo được** (mục 1).

### 5.2 Bilibili [Đo]

Mẫu: 6 từ khoá game PC (steam游戏推荐, 低配游戏推荐, steam免费游戏推荐, steam史低推荐, steam新品节 demo推荐, 独立游戏推荐) và 6 từ khoá ứng dụng (宝藏APP推荐, 手机必备APP, 冷门好用的软件, 安卓必备软件, iPhone必备app, AI工具推荐). Mỗi từ khoá lấy 20 video nhiều lượt xem nhất (mọi thời điểm) và 20 video mới nhất.

| | Game PC | Ứng dụng |
|---|---|---|
| Số video khác nhau trong nhóm nhiều lượt xem nhất | 109 | 112 |
| Trung vị lượt xem | 2.011.963 | 649.382 |
| Số video từ 1 triệu lượt xem | 81 | 41 |

**Tốc độ ra video mới** (20 video mới nhất chứa từ khoá được đăng trong bao lâu):

| Từ khoá | 20 video mới nhất nằm trong khoảng |
|---|---|
| steam游戏推荐 (gợi ý game Steam) | 12/10/2026 (cùng một ngày) |
| 独立游戏推荐 (gợi ý game indie) | 12/10/2026 (cùng một ngày) |
| steam史低推荐 (game Steam giá thấp nhất lịch sử) | 10–12/10/2026 |
| AI工具推荐 (công cụ AI) | 10–12/10/2026 |
| 宝藏APP推荐 (ứng dụng "kho báu") | 06–12/10/2026 |
| 低配游戏推荐 (game cho máy yếu) | 03–12/10/2026 |
| iPhone必备app (ứng dụng iPhone nên có) | 24/03–07/09/2026 |

**Tác giả tiêu biểu**:

| Tác giả | Người theo dõi | Video tiêu biểu (lượt xem, ngày đăng) |
|---|---|---|
| 晚晚是也 | **102.880** | "4 trang web, ứng dụng game mà 98% người không biết" (9.399.960; 29/12/2025); 5 video khác từ 1,0 đến 3,0 triệu, đều dài khoảng 2 phút |
| 阿闲说软件 | 113.012 | "4 ứng dụng mạnh đến phạm luật" (3.537.674; 20/05/2025) |
| 一网一匠 | 846.601 | "Ứng dụng nhà nước làm cho mọi người, chứa đầy công cụ" (3.545.135; 13/04/2026). Mô tả kênh: chuyên chia sẻ ứng dụng và trang web |
| 初夏ChuXXia | chưa đo | Series "Game Steam giá thấp nhất lịch sử tuần này" theo từng đợt sale: 1.842.083–2.720.473 lượt xem mỗi tập |
| 嗨大兴 | 867.468 | "10 game miễn phí, nhẹ cho máy yếu" (8.339.328; 16/01/2022) |
| 游戏达baka | 1.039.123 | Mô tả kênh: "giới thiệu thêm nhiều game hay" |
| 三石游戏日志 | 1.083.026 | Nhật ký chơi game lẻ, 1.024 video |
| 超级funky橙子 | 1.011.768 | Giải thích cốt truyện, kết thúc ẩn của game indie |

## 6. Khoảng trống: dạng nội dung nước ngoài có, Việt Nam ít

Cách kiểm tra: tìm dạng tương đương bằng tiếng Việt trên YouTube (40 kết quả đầu, chỉ đếm video có tiêu đề tiếng Việt) và đối chiếu với các mục 3–5 [Đo].

| Dạng nội dung | Nước ngoài, Trung Quốc | Việt Nam | Kết quả |
|---|---|---|---|
| Ứng dụng: "N ứng dụng/trang web ít người biết", khoảng 2 phút | Hayls World (Shorts trung vị 373.000); 晚晚是也 (1,0–9,4 triệu với 102.880 người theo dõi); Matty McTech (5,2 triệu người theo dõi TikTok) | Từ khoá "10 ứng dụng hay bạn chưa biết": 13 kết quả tiếng Việt có lượt xem, không video nào là danh sách ứng dụng. Từ khoá "website hay ít người biết": có "10 Trang Web Bạn Phải Vào Một Lần Trong Đời" của Sơn Đù (690.323) | **Khoảng trống**: chưa tìm thấy kênh Việt chuyên làm |
| Ứng dụng: series tháng "Top ứng dụng Android/iPhone hay tháng N" | HowToMen: 12 tập, 145.597–304.188 lượt xem mỗi tập | Từ khoá "top ứng dụng android hay nhất tháng": có video danh sách ứng dụng rải rác (Vật Vờ Studio 137.876 và 25.339; Khôi Ngọng 65.759 và 22.500; Tech VH 321.869, năm 2022), một series đánh số đã dừng từ 2020 (Night Siven: 11.256 và 1.570), **không có series theo tháng** | **Khoảng trống** cho dạng series |
| Ứng dụng: công cụ AI | 一木的AI工具库 86.074 người theo dõi; AI工具推荐 có 20 video mới trong 3 ngày | Văn Thế Web (250.000 người đăng ký, trung vị video dài 1.750); Vật Vờ "8 Công Cụ AI Miễn Phí Cho Người Việt 2026" (24.511) | Đã có người làm, lượt xem thấp |
| Game PC: thử demo Steam Next Fest | Bilibili có video demo 277.944–649.004 lượt xem | Từ khoá "steam next fest demo hay": 1/40 kết quả là tiếng Việt, 790 lượt xem | **Khoảng trống**, nhưng phụ thuộc Steam (mục 2.2) |
| Game PC: game Steam giá thấp nhất mỗi đợt sale | 初夏ChuXXia 1,8–2,7 triệu mỗi tập; MadMorph "5 game dưới 5 USD" | "Tê, No Time No Game" (2.250 người đăng ký): Summer Sale 2026 được 4.559 và 4.301 lượt xem | Có người làm, rất nhỏ; phụ thuộc Steam |
| Game PC: game cho máy yếu | 嗨大兴 8,3 triệu; WePC | TopGame, Phê Game, Trực Tiếp Game đã làm (video dài 583.883–1.043.175 lượt xem) | **Không phải khoảng trống** |
| Game PC: giải thích cốt truyện game indie | 超级funky橙子 1,01 triệu người theo dõi | Phân Tích Game: 1,04 triệu người đăng ký, trung vị 280.000; 37/38 kết quả là tiếng Việt và đều từ 100.000 lượt xem | **Không phải khoảng trống** |
| Game PC: video dài "Tôi xếp hạng tất cả…" | | Người Già Chơi Game: trung vị 210.500 với 115.000 người đăng ký | Đã có, đang tăng tốt |

## 7. Đánh giá theo từng tiêu chí

### 7.1 Game PC

1. **Khả thi**: rủi ro cao. Bằng chứng: Steam bị chặn từ 5/2024 [M5], gián đoạn rộng hơn từ 02/10/2026 [M6][M7]; tiếng Việt chỉ 0,25% trong khảo sát Steam [M1]. Video gợi ý mua game Steam đi kèm nguy cơ người xem không truy cập được cửa hàng.
2. **Hợp nền tảng**: hợp YouTube video dài (5 kênh Việt trung vị 123.500–280.000); **chưa có bằng chứng hợp video ngắn ở Việt Nam** (trung vị Shorts của các mẫu năm 2026 cao nhất 20.000, chỉ 5 video; không tìm thấy tài khoản TikTok Việt chuyên làm). Ở nước ngoài, video ngắn gợi ý game PC có trung vị 1.610–61.300 trên TikTok.
3. **Đối thủ Việt**: mạnh ở video dài (meGAME 2,57 triệu, Trực Tiếp Game 2,04 triệu, Phân Tích Game 1,04 triệu người đăng ký). Ở video ngắn: chưa tìm thấy đối thủ chuyên làm.
4. **Phổ biến ở Việt Nam**: có khán giả cho video dài; số người chơi PC tại Việt Nam chưa có số liệu đáng tin.
5. **Khoảng trống**: demo Steam Next Fest và săn giá thấp nhất mỗi đợt sale (mục 6), cả hai đều phụ thuộc Steam.

**Nhận định**: nếu làm game PC, số liệu ủng hộ video dài trên YouTube hơn video ngắn, và nên tránh định vị phụ thuộc vào việc mua game trên Steam cho tới khi tình trạng chặn rõ ràng.

### 7.2 Ứng dụng điện thoại

1. **Khả thi**: có. Bằng chứng: 2,88 tỉ lượt cài năm 2025, khoảng 1,59 tỉ là ứng dụng không phải game [M3].
2. **Hợp nền tảng**: hợp video ngắn. Kênh công nghệ Việt trên TikTok có trung vị 51.250–880.550 (5 tài khoản lớn); kênh chuyên ứng dụng nước ngoài: Tyler Morgan 245.100, Valstech 208.950, Matty McTech 98.750, Enrique Barrón 34.950 trên TikTok; Hayls World 373.000 trên Shorts.
3. **Đối thủ Việt**: kênh công nghệ tổng hợp rất lớn (Ngô Đức Duy 8,3 triệu người theo dõi TikTok). Kênh chuyên ứng dụng: chưa tìm thấy.
4. **Phổ biến ở Việt Nam**: nội dung ứng dụng có người xem nhưng nằm rải rác trong kênh công nghệ (ví dụ Vật Vờ "10 Ứng Dụng Hay": 137.876).
5. **Khoảng trống**: dạng "N ứng dụng ít người biết" và series tháng (mục 6).

Rủi ro có bằng chứng: chủ đề ứng dụng trên TikTok Việt có nhánh vi phạm (phim lậu, app gian lận game) [M9]; kênh chuyên ứng dụng nước ngoài có thể ngừng (Ann App recommendations ngừng từ 07/2023 dù có video 9,9 triệu lượt xem).

**Nhận định**: theo số đo, ứng dụng điện thoại có khoảng trống rõ hơn và có bằng chứng hợp video ngắn hơn. Đối thủ khó nhất là các kênh công nghệ tổng hợp sẵn có lượng người theo dõi lớn, nên kênh mới cần một ngách hẹp (ví dụ "ứng dụng miễn phí thay ứng dụng trả phí") thay vì "công nghệ" chung.

## 8. Chưa đo được và cách đo tiếp

| Chưa đo được | Cách đo |
|---|---|
| Lượt xem, số người theo dõi trên Douyin | Đăng nhập Douyin trên điện thoại và ghi tay 10 tài khoản cho mỗi chủ đề; hoặc dùng nền tảng dữ liệu trả phí (蝉妈妈, 新榜) |
| Danh sách đầy đủ tài khoản TikTok Việt theo chủ đề | Tìm trong ứng dụng TikTok (cần đăng nhập) theo 10 từ khoá, ghi 20 tài khoản đầu |
| Lượt xem Facebook Reels | Meta Content Library (cần đăng ký) hoặc ghi tay |
| Lượng tìm kiếm của người Việt | Google Trends (chỉ cho chỉ số tương đối, không cho số tuyệt đối); công cụ từ khoá của Google Ads |
| Cầu thật của khán giả với kênh mới | Đăng thử 10 video mỗi chủ đề trong 30 ngày, đo bằng `/phan-tich-hieu-qua` |
| Số người chơi game PC tại Việt Nam | Báo cáo trả phí của Niko Partners (Vietnam Market Model, 05/2026) |

## Nguồn

**Mã nguồn bên ngoài**

- [M1] Valve, Steam Hardware & Software Survey, tháng 9/2026, mục Language. https://store.steampowered.com/hwsurvey/Steam-Hardware-Software-Survey-Welcome-to-Steam
- [M2] DataReportal, "Digital 2026: Vietnam", 08/11/2025. https://datareportal.com/reports/digital-2026-vietnam
- [M3] Tuổi Trẻ, "Với 1,29 tỉ lượt tải, người dùng Việt chơi game di động nhiều và lâu hàng đầu khu vực" (báo cáo của Adjust), 28/05/2026. https://tuoitre.vn/voi-1-29-ti-luot-tai-nguoi-dung-viet-choi-game-di-dong-nhieu-va-lau-hang-dau-khu-vuc-20260528141837525.htm
- [M4] Niko Partners, "Insights into the Growth of SEA Games Market" (không có số liệu riêng về Việt Nam). https://nikopartners.com/vietnam-gameverse-2025-the-vibrant-health-of-the-countrys-video-games-industry/
- [M5] Game Developer, "Steam suddenly banned in Vietnam", 09/05/2024. https://www.gamedeveloper.com/business/steam-suddenly-banned-in-vietnam
- [M6] Inven Global, "Steam Effectively Blocked in Vietnam? Issues Extend to Downloads and Updates", 03/10/2026. https://www.invenglobal.com/articles/26798/steam-effectively-blocked-in-vietnam-issues-extend-to-downloads-and-updates
- [M7] Techz, "Nền tảng Steam gặp sự cố kết nối tại Việt Nam: Nguyên nhân thực sự tới từ đâu?", 05/10/2026. https://www.techz.vn/223-1026-1-nen-tang-steam-gap-su-co-ket-noi-tai-viet-nam-nguyen-nhan-thuc-su-toi-tu-dau-ylt712028.html
- [M8] 24hstore, "Sự thật về lệnh cấm Steam ở Việt Nam", 09/2025. https://24hstore.vn/cong-nghe/su-that-ve-lenh-cam-steam-o-viet-nam-n8534
- [M9] Trang khám phá TikTok tiếng Việt: "Những App Xem Phim Lậu Cực Hay" https://www.tiktok.com/discover/nh%E1%BB%AFng-app-xem-phim-l%E1%BA%ADu-c%E1%BB%B1c-hay ; "Cách Cài Aimlock Cho Android" https://www.tiktok.com/discover/c%C3%A1ch-c%C3%A0i-aimlock-cho-android
- [M10] Trung Hoa Võng (china.com), bài về hội nghị OEGC 2025 của Ocean Engine (巨量引擎), 30/12/2025. https://m.tech.china.com/articles/20251230/202512301789841.html

**Số đo trực tiếp [Đo]**, thư mục [du-lieu-thi-truong-2026-10-12/](du-lieu-thi-truong-2026-10-12/):

- `youtube-kenh.tsv`: 37 kênh YouTube (số người đăng ký, lượt xem 30 video dài và 30 Shorts gần nhất, khoảng ngày).
- `tiktok-tai-khoan.tsv`: các tài khoản TikTok đã kiểm tra, gồm cả tên đoán không tồn tại.
- `facebook-trang.tsv`: 5 trang Facebook.
- `bilibili-video.tsv`: 480 kết quả tìm kiếm Bilibili theo 12 từ khoá.
- `youtube-tim-kiem.tsv`: 1.796 kết quả tìm kiếm YouTube theo 51 từ khoá (Việt, Anh).
- `yt_channel.py`, `tt_check.py`, `bili.py`, `yt_search.sh`: công cụ đo, chạy lại để kiểm chứng. Số liệu mạng xã hội thay đổi theo ngày, nên khi chạy lại sẽ lệch nhẹ.
