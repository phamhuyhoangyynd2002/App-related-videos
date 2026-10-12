# Độ chính xác, bản quyền và tuân thủ

> File này là hàng rào an toàn của kênh, không phải tư vấn pháp lý. Khi kênh có doanh thu đáng kể hoặc nhận tài trợ, nên hỏi luật sư sở hữu trí tuệ. Phần luật Việt Nam và chính sách nền tảng kế thừa từ kênh game (tra cứu 28/09/2026, xem `docs/tham-khao-kenh-game/`); phần riêng cho ứng dụng soạn ngày 12/10/2026. Điều khoản của bên thứ ba có thể thay đổi, nên xem lại mỗi 6 tháng.

## 1. Nguyên tắc nền

- **Không có "dùng tự do".** Mọi hình ảnh, video, âm thanh, font mà mình không tự tạo ra đều phải có một trong ba căn cứ:
  1. **Giấy phép rõ ràng** cho phép dùng thương mại trên TikTok, YouTube, Facebook, Instagram (nhạc có giấy phép, font OFL, press kit có điều khoản cho phép, thư cho phép của nhà phát triển).
  2. **Tự tạo**: ảnh, clip tự quay màn hình khi dùng thử ứng dụng. Giao diện ứng dụng vẫn thuộc nhà phát triển, nhưng quay lại để bình luận, đánh giá là trích dẫn hợp lý; bản ghi thuộc kênh.
  3. **Trích dẫn để bình luận**: dùng một phần vừa đủ, kèm bình luận thật, không thay thế được bản gốc. Luật Sở hữu trí tuệ Việt Nam cho phép trích dẫn hợp lý để bình luận, minh hoạ; các nền tảng (trụ sở ở Mỹ) xét theo "fair use". Áp dụng cho icon, screenshot cửa hàng.
- Kênh có kiếm tiền là **mục đích thương mại**. Điều khoản nào chỉ cho phép "phi thương mại" thì coi như **không được dùng**.
- Mỗi dự án phải có hồ sơ chứng minh `ban-quyen.md`, do `kiem_tra_ban_quyen.py` sinh ra, liệt kê mọi tài nguyên trong video cuối cùng: nguồn, chủ sở hữu, căn cứ sử dụng, thời điểm xuất hiện. Hồ sơ này dùng khi bị Content ID hoặc khiếu nại. Giữ ít nhất 12 tháng.

## 2. Nguồn số liệu và kiểm chứng

- Mọi con số, ngày tháng, giá, điểm đánh giá, lượt tải, tên nhà phát triển, tính năng phải có ít nhất một nguồn trong `sources`, liên kết qua `source_ids`.
- Thứ tự ưu tiên nguồn: **trang cửa hàng chính thức** (App Store Việt Nam `country=vn`, Google Play) và trang chính thức, blog, ghi chú phát hành của nhà phát triển → báo công nghệ uy tín (The Verge, TechCrunch, 9to5Mac, 9to5Google, Android Authority, MacRumors, VnExpress Số hoá, GenK, Tinh tế, Sforum) → hãng đo lường (Sensor Tower, Appfigures, data.ai, Adjust). Diễn đàn, mạng xã hội chỉ để tham khảo, không làm nguồn duy nhất.
- Giá lấy từ App Store Việt Nam; Google Play khác khu vực VN thì ghi rõ khu vực, không dùng giá của khu vực khác làm giá Việt Nam. Ghi rõ thời điểm tra. Giá gói trả phí (tháng, năm) ghi đúng kỳ hạn.
- **Tính năng phải được kiểm thử hoặc có nguồn**: chỉ nói ứng dụng "làm được X" khi người làm video đã dùng thử (có clip) hoặc trang chính thức ghi rõ. Tính năng chỉ có ở bản trả phí, chỉ có ở một hệ điều hành, chỉ có ở một số nước thì phải nói rõ.
- Tin đồn phải nói rõ là tin đồn trong lời đọc ("theo tin đồn", "chưa được xác nhận").
- Không tự bịa `app_store_id`, `play_package`.
- Khi nguồn mâu thuẫn: ghi cả hai vào `research.md`, chọn nguồn chính thức hơn, đánh dấu cho người dùng ở DỪNG 2.
- Trước DỪNG 2 luôn chạy agent `kiem-chung-thong-tin`. SAI thì sửa trước khi trình, KHÔNG RÕ thì liệt kê riêng.

## 3. Hình ảnh và video

| Nguồn | Được dùng? | Điều kiện |
|---|---|---|
| Ảnh, clip **tự quay màn hình** khi dùng thử | Có, **nguồn hình chính** | Khung dọc; dùng tài khoản thử; che tên, số điện thoại, email, số dư, vị trí, danh bạ, tin nhắn, thông báo (skill `/cat-quay-man-hinh`). Ghi `clip_origin: "tu-quay"` |
| Icon, screenshot trên App Store, Google Play | Có, căn cứ **trích dẫn để bình luận** | Ảnh thuộc nhà phát triển, cửa hàng không cấp giấy phép; ghi chủ sở hữu vào manifest và mô tả video. Luôn kèm lời bình luận và lớp đồ hoạ riêng. **Không** dùng huy hiệu, logo App Store, Google Play; bỏ ảnh quảng bá có chữ nói quá hoặc người thật. **Rủi ro đã chấp nhận ở kênh game (01/10/2026), cần người làm video xác nhận lại cho kênh này**: điều khoản iTunes Search API chỉ cho dùng ảnh để quảng bá cạnh nút tải có link mua, Google Play không có API chính thức; đó là rủi ro điều khoản dịch vụ của Apple, Google, không phải rủi ro bản quyền với nhà phát triển. Công cụ: `store_assets.py` |
| Video xem trước trên App Store, Google Play; video YouTube của nhà phát triển | **Không** | Không tải được hợp lệ (Google Play nhúng YouTube) và không phải nội dung của kênh |
| Press kit, media kit chính thức | Có | Lưu điều khoản vào `assets/<khoá>/dieu-khoan.txt`. Nếu press kit chỉ cho "báo chí" hoặc cấm thương mại thì không dùng |
| Ảnh, clip nhà phát triển gửi sau khi xin phép | Có, căn cứ **giấy phép** | Xin bằng `kenh/mau-thu-xin-phep.md`. Thư phải cho phép dùng **thương mại** trên TikTok, YouTube, Facebook, Instagram; lưu nguyên văn vào `assets/<khoá>/dieu-khoan.txt` và `kenh/bang-chung/`, ghi `clip_origin: "giay-phep"` |
| Logo, tên ứng dụng | Có, để nói về chính ứng dụng đó | Không làm méo, đổi màu logo; không ngụ ý được nhà phát triển tài trợ, hợp tác (mục 6) |
| Google Images, Pinterest, Wikipedia, ảnh chụp từ video, stream, bài báo của người khác, ảnh có watermark báo hoặc kênh khác | **Không** | |
| Clip cắt từ video của người khác (YouTuber, TikToker, kênh chính thức), kể cả crop, lật, đổi tốc độ, phủ chữ | **Không** | Bản ghi và cách dựng thuộc người quay; nền tảng nhận ra clip trùng (Content ID; Meta 13/03/2026 coi thêm viền, phụ đề, đổi tốc độ là không nguyên bản) |
| Giao diện, ảnh do AI vẽ mô phỏng ứng dụng có thật | **Không** | Dễ gây hiểu nhầm là giao diện thật |
| Hình, video rò rỉ, bản beta kín có NDA | **Không** | Chỉ được nhắc tin rò rỉ bằng lời, có nguồn uy tín, gắn nhãn "chưa xác nhận". Beta công khai (TestFlight công khai, Play beta mở) thì được, nói rõ là bản beta |
| Số liệu trên App Store, Google Play | Có, **nguồn chính thức số 1** | Giá, dung lượng, nhà phát triển, độ tuổi, điểm, số lượt đánh giá, lượt tải (Google Play), có quảng cáo, có mua trong ứng dụng, ngôn ngữ. Ghi khu vực cửa hàng và thời điểm tra |

Clip quay màn hình: suốt thời gian hiện clip nên có **giọng đọc bình luận** (ít nhất 70% thời lượng đoạn đó) và lớp đồ hoạ riêng (thứ hạng, thẻ thông tin, phụ đề). Chỉ chiếu lại màn hình mà không nói gì thêm bị Meta coi là không nguyên bản. Tắt âm thanh của ứng dụng khi quay; ứng dụng phát nhạc, phim thì không để lộ nội dung có bản quyền quá vài giây.

## 4. Hướng dẫn thương hiệu của nhà phát triển

- Trước khi làm video về ứng dụng của một hãng lớn lần đầu, tra "<tên hãng> brand guidelines / press kit / trademark guidelines" và ghi tóm tắt vào `kenh/chinh-sach-nha-phat-trien.md`.
- Apple, Google có hướng dẫn riêng về cách nhắc tên iPhone, Android, App Store, Google Play: không dùng huy hiệu cửa hàng trong video, không ghép logo của họ vào logo kênh.
- Ứng dụng đang thử nghiệm kín: không quay, không đăng cảnh bị cấm chia sẻ.

## 5. Âm thanh

**Giọng đọc**
- Edge TTS là dịch vụ không chính thức của trình duyệt Edge. Microsoft trả lời chính thức rằng dùng thương mại mà không có gói Azure **có thể vi phạm điều khoản**. Vì vậy:
  - Kênh có kiếm tiền dùng **Azure AI Speech** (cùng giọng `vi-VN-HoaiMyNeural`, `vi-VN-NamMinhNeural`; gói miễn phí F0 có 500.000 ký tự/tháng). Chạy `tts_edge.py --provider azure`.
  - Edge TTS chỉ dùng để làm nháp, thử nghiệm.
- Không nhân bản giọng của người thật.

**Nhạc nền** (`music/`)
- Mỗi file phải có một dòng trong `music/GIAY-PHEP.md`: nguồn, loại giấy phép, **có cho thương mại trên TikTok/YouTube/Facebook/Instagram không**, yêu cầu ghi công, đường dẫn bằng chứng. File không có trong sổ thì **không được dùng**.
- "Royalty-free" không có nghĩa là không có bản quyền; giữ bằng chứng để kháng nghị Content ID.
- Không dùng nhạc phim, nhạc thương mại, nhạc tải từ YouTube, TikTok, nhạc phát trong ứng dụng đang quay.
- **TikTok**: tài khoản doanh nghiệp chỉ được dùng Commercial Music Library. Ghi loại tài khoản TikTok vào `kenh/ho-so-kenh.md`.

**Hiệu ứng âm thanh** (`sfx/`)
- Cùng quy tắc sổ giấy phép: `sfx/GIAY-PHEP.md`.
- Cấm âm thanh "meme" cắt từ phim, chương trình TV, game, hệ điều hành (ví dụ tiếng thông báo iPhone, nhạc chuông mặc định, âm khởi động Windows) dù chúng có trong thư viện sfx trên mạng.

## 6. Font, logo, nhãn hiệu

- Chỉ dùng font có giấy phép cho phép dùng thương mại và nhúng vào video (SIL Open Font License: Be Vietnam Pro, Montserrat, Inter). Lưu file giấy phép cạnh font trong `templates/_shared/fonts/`.
- Được dùng tên ứng dụng để nói về ứng dụng đó. **Không** ngụ ý kênh là kênh chính thức, được nhà phát triển tài trợ hay hợp tác khi không có ("kênh chính thức", "đối tác của…").
- Logo, tên kênh không được giống logo, tên ứng dụng, nhà phát triển, hay Apple, Google.
- Không dùng logo, watermark của kênh hoặc báo khác.

## 7. Nội dung

- **Không đạo văn**: không đọc nguyên văn câu trong bài báo; tối đa một câu trích ngắn, ghi rõ nguồn. Đánh giá của người dùng trên cửa hàng: tóm tắt ý, không hiện tên người dùng.
- **Không phỉ báng**: nhận xét về ứng dụng được tự do; **không** cáo buộc cá nhân hoặc công ty (lừa đảo, ăn cắp dữ liệu…) nếu không có nguồn chính thức hoặc báo uy tín, và phải nói rõ ai cáo buộc.
- **Không giới thiệu, không hướng dẫn**:
  - ứng dụng bẻ khoá, bản mod, "mở khoá premium miễn phí", tải ứng dụng ngoài cửa hàng chính thức (APK, IPA không rõ nguồn);
  - ứng dụng phát phim, truyện, nhạc lậu;
  - công cụ gian lận game, hack tài khoản, theo dõi lén, đọc trộm tin nhắn, định vị người khác không có sự đồng ý;
  - cờ bạc, cá cược, ứng dụng "kiếm tiền online", "làm nhiệm vụ nhận thưởng" chưa có căn cứ chính thức (dễ là lừa đảo, đa cấp);
  - ứng dụng cho vay tiền: chỉ nói về tổ chức có giấy phép của Ngân hàng Nhà nước, không kêu gọi vay; không giới thiệu ứng dụng cho vay ngang hàng không phép;
  - cách vượt chặn, lách quy định (VPN để vào dịch vụ bị chặn, đổi vùng để mua rẻ trái điều khoản).
- **Ứng dụng tài chính, sức khoẻ, đầu tư**: chỉ mô tả tính năng, không đưa lời khuyên tài chính, y tế. Ứng dụng ngân hàng, ví điện tử, chứng khoán phải là đơn vị có giấy phép tại Việt Nam.
- **Bảo mật và quyền riêng tư của người xem**: ứng dụng xin quyền truy cập nhiều (danh bạ, tin nhắn, vị trí, trợ năng) thì nói rõ trong video. Không khuyên người xem tắt các lớp bảo vệ của điện thoại.
- **Chủ quyền, lịch sử (luật Việt Nam)**: không dùng hình có bản đồ "đường lưỡi bò" hoặc bản đồ sai chủ quyền Việt Nam (ứng dụng bản đồ, du lịch, thời tiết của nước ngoài hay gặp). Xem kỹ từng ảnh, khung clip; phát hiện thì bỏ, và nói rõ điểm trừ này nếu là ứng dụng bản đồ.
- **Game online chưa được cấp phép tại Việt Nam** (Nghị định 147/2024/NĐ-CP): nếu video nhắc tới game, không kêu gọi "tải ngay", không gắn link tải.
- **Độ tuổi**: ứng dụng 17+ (hẹn hò, mạng xã hội ẩn danh) thì không đưa nội dung người lớn vào hook, ảnh bìa. Trên YouTube chọn "Không dành cho trẻ em". Kênh không nhắm trẻ dưới 13 tuổi.

## 8. Quảng cáo, tài trợ, quà tặng, affiliate

Luật Quảng cáo sửa đổi (số 75/2025/QH15, hiệu lực 1/1/2026) yêu cầu người có ảnh hưởng thông báo công khai nội dung quảng cáo và chịu trách nhiệm về thông tin quảng cáo, chỉ giới thiệu sản phẩm mình đã dùng. Kênh ứng dụng hay được mời tài trợ, tặng gói trả phí, gắn mã giới thiệu, nên:
- Nhận gói trả phí miễn phí, tiền tài trợ, link hoặc mã giới thiệu (affiliate) thì ghi vào `brief.md` và trường `sponsorship` trong `script.json`.
- Video phải có câu công bố trên màn hình ngay cảnh đầu (ví dụ "Có tài trợ từ …", "Được tặng gói Pro để đánh giá") và trong caption. Bật "Paid promotion" (YouTube), "Branded content" (TikTok), "Paid partnership" (Facebook, Instagram).
- Nhà tài trợ không mua được phán quyết của kênh: con dấu giữ đúng như khi không có tài trợ.
- Không khen điều mình chưa kiểm chứng, không "review" ứng dụng chưa tự dùng thử.

## 9. Nhãn AI và nội dung không nguyên bản

- **Luật Việt Nam**: Luật Trí tuệ nhân tạo (số 134/2025/QH15, hiệu lực 1/3/2026) yêu cầu nội dung do AI tạo có dấu hiệu nhận biết. Nghị định 142/2026/NĐ-CP (hiệu lực 1/5/2026), khoản 2 Điều 18, **bắt buộc** gắn nhãn khi mô phỏng ngoại hình, giọng nói của người thật, hoặc tái hiện sự kiện có thật. Giọng TTS thông thường không giả giọng ai thì không thuộc hai trường hợp này (suy luận, nên hỏi luật sư khi kênh có doanh thu).
- **Video về ứng dụng AI**: kết quả do ứng dụng AI tạo ra (ảnh, video, giọng) hiện trong video là nội dung AI. Có người thật (khuôn mặt, giọng) thì phải gắn nhãn AI trên mọi nền tảng và có sự đồng ý của người đó; tốt nhất chỉ dùng ảnh của chính người làm video hoặc ảnh không có người.
- **YouTube**: giọng TTS thông thường **không bắt buộc** gắn nhãn "nội dung thay đổi hoặc tổng hợp". Bắt buộc khi làm người thật nói điều họ không nói, hoặc tạo cảnh thật như thật.
- **TikTok**: bắt buộc gắn nhãn cho nội dung AI trông như thật; nội dung AI khác gắn nhãn tự nguyện.
- **Chính sách của kênh** (ghi trong `kenh/ho-so-kenh.md`): TikTok bật nhãn "Nội dung do AI tạo" cho video dùng giọng TTS; mọi nền tảng ghi dòng "Giọng đọc: AI" trong caption; bật nhãn AI trên mọi nền tảng khi có hình hoặc giọng mô phỏng người thật.
- **YouTube "nội dung không xác thực"** (15/7/2025, làm rõ 16/7/2026) và **Meta "nội dung không nguyên bản"** (13/3/2026): không kiếm tiền, không đề xuất với nội dung làm theo khuôn ít biến thể, trình chiếu ảnh gần như không lời dẫn, thuật lại những gì đã có trên màn hình. Video ứng dụng dễ rơi vào bẫy "đọc lại mô tả trên cửa hàng": lời đọc phải nói trải nghiệm thật khi dùng thử, điều cửa hàng không nói.
- Hàng rào của kênh: mục "Nội dung gốc" trong `.claude/rules/phong-cach-thuong-hieu.md`, cùng các kiểm tra: mỗi video có `angle`, `message`, `verdict`; không lặp câu mở, câu kết, kiểu hook (validator); `kiem_tra_ban_quyen.py` cảnh báo khi lời đọc trùng quá 30% với các video gần đây.

## 10. Khi bị nhận quyền hoặc khiếu nại

- **Content ID nhận quyền**: mở `ban-quyen.md` của dự án. Nhạc có giấy phép thì kháng nghị kèm bằng chứng. Nội dung khác thì chấp nhận hoặc thay tài nguyên, rồi ghi vào `kenh/bai-hoc.md`.
- **Gỡ video, cảnh cáo bản quyền**: không đăng lại video đó; báo người dùng ngay; dừng dùng loại tài nguyên liên quan cho tới khi xem xét xong. Ba cảnh cáo trên YouTube sẽ mất kênh.
- Không bao giờ tự gửi kháng nghị hay phản hồi pháp lý thay người dùng.

## 11. Chống nội dung lặp lại trong cùng kênh

- Mỗi video có góc nhìn riêng trong `brief.md`. Nếu người dùng chưa nêu, đề xuất 2–3 góc nhìn ở DỪNG 1.
- Không dùng lại nguyên văn câu mở hoặc câu kết giữa các video.
- Mỗi video chỉ đăng một lần trên mỗi nền tảng (`.claude/rules/phong-cach-thuong-hieu.md`, mục "Hệ thống kênh").

## Căn cứ đã tra cứu

Kế thừa từ kênh game (28/09/2026, danh sách đầy đủ ở `docs/tham-khao-kenh-game/nghien-cuu-khan-gia-va-phong-cach-2026-09.md`):
- Microsoft về Edge TTS và dùng thương mại: https://learn.microsoft.com/en-us/answers/questions/2088770/are-opensource-edge-tts-free-for-commercial-use
- Azure Speech (hạn mức gói miễn phí): https://learn.microsoft.com/azure/ai-services/speech-service/speech-services-quotas-and-limits
- YouTube, nhãn nội dung thay đổi hoặc tổng hợp: https://blog.youtube/news-and-events/disclosing-ai-generated-content/
- YouTube, chính sách kiếm tiền: https://support.google.com/youtube/answer/1311392 ; làm rõ ngày 16/7/2026: https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/
- Meta, nội dung nguyên bản (13/3/2026): https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/
- TikTok, nhãn nội dung AI: https://newsroom.tiktok.com/en-us/new-labels-for-disclosing-ai-generated-content
- TikTok Commercial Music Library cho tài khoản doanh nghiệp: https://www.soundstripe.com/blogs/why-can-i-only-use-commercial-sounds-on-tiktok
- Nghị định 147/2024/NĐ-CP: https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Nghi-dinh-147-2024-ND-CP-quan-ly-cung-cap-su-dung-dich-vu-Internet-thong-tin-tren-mang-480755.aspx
- Luật Quảng cáo sửa đổi 2025: https://sotuphap.daklak.gov.vn/nhung-diem-moi-dang-chu-y-cua-luat-quang-cao-sua-doi-nam-2025-14428.html
- Luật Trí tuệ nhân tạo: https://genk.vn/tu-hom-nay-1-3-luat-tri-tue-nhan-tao-co-hieu-luc-noi-dung-ai-tao-ra-phai-co-dau-nhan-biet-165260301185217976.chn
- Nghị định 142/2026/NĐ-CP: https://luatvietnam.vn/tin-van-ban-moi/2-truong-hop-noi-dung-do-ai-tao-ra-bat-buoc-phai-gan-nhan-tu-01-5-2026-186-108836-article.html
- Bộ VHTTDL về "đường lưỡi bò": https://bvhttdl.gov.vn/ngan-chan-duong-luoi-bo-phi-phap-chong-viec-tuyen-truyen-sai-lech-ve-chu-quyen-quoc-gia-20230719085600357.htm
- Điều khoản dùng ảnh của iTunes Search API (mục Legal, Promotional Content): https://performance-partners.apple.com/resources/documentation/itunes-store-web-service-search-api

Chưa tra cứu, cần làm trước khi kênh kiếm tiền: hướng dẫn thương hiệu của Apple và Google khi nhắc tên App Store, Google Play trong video; quy định quảng cáo ứng dụng tài chính, cho vay tại Việt Nam.
