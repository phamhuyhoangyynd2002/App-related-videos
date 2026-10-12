# Kiểu hình: bộ chuyển động có tên cho cảnh ứng dụng

Chắt lọc từ [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) (Apache-2.0, bản clone 12/10/2026). Repo gốc làm phim quảng cáo phần mềm bằng Remotion, có 124 thẻ công thức chuyển động. Mình chỉ lấy những thẻ hợp **ảnh cửa hàng, icon và clip quay màn hình, khung dọc, giọng lầy** (chọn ở kênh game, dùng được cho ứng dụng), rồi viết lại bằng GSAP trong `kieu-hinh.js` (nhịp hình, thẻ, chuyển mục) và `gags.js` (hai gag mới). Không dùng code Remotion, không chép sfx của repo.

**Lên kế hoạch kiểu hình ở bước viết kịch bản, trước khi viết lời** (`.claude/skills/viet-kich-ban/references/ke-hoach-hinh.md`): đường năng lượng, một khoảnh khắc hình chính mỗi mục, câu mồi trong lời đọc. Gắn kiểu vào kịch bản đã xong thì gần như không thấy khác (bản cắt thử tập 2, 12/10/2026).

Người viết kịch bản chọn kiểu bằng trường `kieu` của shot, `chuyen` của cảnh, hoặc `kind` của gag (schema: `.claude/skills/viet-kich-ban/references/schema.md`). Không khai báo gì thì template dựng như cũ.

## Luật dùng chung

Rút từ bộ quy tắc thẩm mỹ của shotcraft (`references/aesthetic-rules.md`), chỉ lấy những luật không trái nhịp của kênh:

| Luật | Gốc | Ở kênh mình |
|---|---|---|
| Một thủ pháp chỉ làm "nhân vật chính" một lần mỗi phim | P4 | Mỗi kiểu có trần số lần mỗi video (bảng dưới), hai mục liền nhau không dùng cùng kiểu. `validate_script.py` cảnh báo |
| Cú đập cả khung (tác động lên toàn hình, máy quay) tối đa 3 lần mỗi phim, còn lại chỉ động ở lớp phần tử | R4 | `dap-zoom-rung`, `cat-nhay`, gag `rung` cộng lại ≤ 3. Con dấu phán quyết không tính (thuộc nhận diện) |
| Hình rơi xuống rồi phải có nhịp thở | R1, R3 | Mỗi kiểu có độ dài tối thiểu (`build_timeline.py` cảnh báo). Kênh vẫn giữ luật đổi hình 1,5–2 giây: nhịp thở ở đây là 0,5–1 giây, không phải 1 giây trở lên như phim quảng cáo |
| Tốc độ đến từ gia tốc, không phải chạy đều | R2 | Giật vào dùng ease-in (`power4.in`), dừng bằng nảy hoặc rung tắt dần; không easing `linear` |
| Vệt sáng, chớp sáng: một lần cho một nhân vật chính, không rải khắp nơi | Q4 | Chỉ `dap-zoom` (chớp lúc chạm), `cat-nhay` (chớp mỗi nhát), `lat-the` (một vệt sáng). Không thêm chớp ở chỗ khác |
| Đích phóng phải đủ nét | Q2 | Đập zoom lên ảnh đã có `crop` thì độ phóng tự giảm còn 1,35×; ảnh cửa hàng nhỏ thì đặt `zoom` thấp hơn |

**Không lấy**: triết lý "chậm lại, giữ 1 giây, động tác chính ≥ 3 giây" (hợp phim quảng cáo, ngược nhịp video ngắn của kênh); các thẻ lia máy 3D trên giao diện web; thẻ mở đầu logo, màn kết thương hiệu (kênh đã cấm intro logo và có end-card cố định); thư viện sfx Mixkit (phải qua sổ `sfx/GIAY-PHEP.md`).

## Bảng kiểu

| Kiểu | Khai báo | Trần mỗi video | Dài tối thiểu | Thẻ gốc shotcraft |
|---|---|---|---|---|
| Đập zoom | `"kieu": "dap-zoom"` trên nhịp `header`/`screenshot:N` | 2 (tính chung với bản rung) | 1,0s, cách nhịp ảnh trước ≥ 0,85s | `camera/crash-zoom-punch` + `effects/fui-hud-moves` (reticle-lock-on) |
| Đập zoom rung | `"kieu": "dap-zoom-rung"` | như trên; tính 1 cú đập cả khung | như trên | `crash-zoom-punch` (kiểu dừng gắt, rung khung) |
| Cắt nhảy | `"kieu": "cat-nhay"` trên nhịp ảnh | 2; tính 1 cú đập cả khung | 1,3s | `rhythm/beat-cut-moves` + `rhythm/rhythm-interrupt-moves` |
| Chia ô | `"kieu": "chia-o"` trên nhịp ảnh, tuỳ chọn `anh` | 1 | 1,8s, không có thẻ bật lên trong lúc diễn | `rhythm/panel-grid-moves` (comic-panel-split) |
| Lật thẻ | `"kieu": "lat-the"` trên nhịp `fact:<nhãn>` | 2 | 0,6s, cách nhịp thẻ trước ≥ 0,75s | `transition/card-flip-reveal` |
| Đếm số | `"kieu": "dem-so"` trên nhịp `fact:<nhãn>`, tuỳ chọn `tu` | 3 | 0,6s, cách nhịp thẻ trước ≥ 0,9s | `_legacy/data/odometer-digit-roll` + `effects/slam-entrance-moves` (score-slam) |
| Đẩy lên | `"chuyen": "day-len"` trên cảnh (top-list) | không giới hạn (là nhịp chuyển mục) | | `transition/bottom-push-stack-wipe` |
| Lia ngang | `"chuyen": "lia"` trên cảnh (top-list) | không giới hạn | | `transition/shot-transitions` (whip-pan) |
| Combo | gag `"kind": "combo"`, `"text"`, `"so"` | 1 | gag 1,6s | `effects/impact-feedback` (hit-counter) |
| Kéo so sánh | gag `"kind": "keo-so-sanh"`, `"anh"`, `"text"` | 1 | gag 2,4s | `data/before-after-slider-scrub` |

## Thẻ từng kiểu

### Đập zoom (`dap-zoom`, `dap-zoom-rung`)

- **Ý đồ**: zoom chậm là "mời xem", đập zoom là "nhìn cái này!". Một nhịp từ toàn cảnh đập thẳng vào chi tiết, người xem không kịp nhìn chỗ khác.
- **Dùng khi**: lời đọc chỉ thẳng vào một chi tiết trên ảnh ("…con boss **này**", "nút **nạp**", "xúc xắc"). Bản rung cho khoảnh khắc nặng ký ("thua", "toang", "vấp").
- **Diễn ra thế nào**: ảnh hiện toàn cảnh sớm 0,55s. Bốn góc chữ L màu accent lao từ ngoài 120px vào, khoá vùng sẽ được phóng (0,22s, `back.out`). Máy quay lùi 3% để lấy đà, rồi giật vào trong 0,2s (`power4.in`), chạm đúng lúc đọc `cue`. Bản thường vượt 4,5% rồi nảy về (0,17s). Bản rung dừng gắt, rung 14 → 0px trong 6 khung. Lúc chạm có chớp sáng ấm (0,5–0,7 → 0 trong 0,27s). Sau đó máy quay trôi chậm 3% và trả về 1× đúng lúc ảnh sau bắt đầu vào.
- **Tham số**: `diem: [x, y]` là tâm phóng theo tỉ lệ khung (mặc định `[0.5, 0.45]`). `zoom` là độ phóng (mặc định 1,8, ảnh có `crop` 1,35). Khung đích nên chiếm 60–75% khung sau khi phóng.
- **Lỗi hay gặp**: ảnh nhỏ phóng 1,8× sẽ vỡ (thẻ gốc: đích phải là ảnh độ phân giải cao). Đặt ở nhịp đầu cảnh thì không có thời gian dựng toàn cảnh. Không trộn hai bản trong một nhịp (nảy xong lại rung trông như lỗi).

### Cắt nhảy (`cat-nhay`)

- **Ý đồ**: cắt cứng làm nhạc cụ. Một ảnh cửa hàng thành ba nhịp hình (toàn → cận → siêu cận), đúng luật đổi hình 1,5–2 giây mà không cần thêm ảnh.
- **Dùng khi**: ứng dụng chỉ có 2–3 ảnh, hoặc lời đọc liệt kê ba nhịp ("quét, dịch, ghi âm").
- **Diễn ra thế nào**: ảnh vào toàn cảnh đúng `at`. Hai nhát cắt cứng không chuyển tiếp lên 1 + 0,45×(zoom − 1) rồi lên `zoom`, mỗi nhát một chớp trắng 0,12s. Khoảng giữa các nhát bằng một phần 3,4 độ dài nhịp, kẹp trong 0,22–0,4s.
- **Tham số**: `diem` (mặc định giữa), `zoom` (mặc định 1,7).
- **Lỗi hay gặp**: nhịp ngắn hơn 1,3s thì ba nhát dồn vào nhau, trông như giật hình.

### Chia ô (`chia-o`)

- **Ý đồ**: ba ô truyện tranh xéo đập vào "cạch cạch cạch", đứng một nhịp, rồi ô cuối bung ra lấp khung như poster. Khung ngang chia ba cột, khung dọc (ảnh điện thoại) chia ba băng.
- **Dùng khi**: giới thiệu nhanh một ứng dụng ("màn hình chính, tính năng, kết quả"), hoặc liệt kê ba thứ có ảnh riêng. Hợp với mở mục.
- **Tham số**: `anh: ["screenshot:1", "screenshot:3", "screenshot:4"]` cho ba ô (đẹp nhất). Có hai ảnh thì ô đầu dùng ảnh của nhịp. Không khai báo thì là ba góc máy của cùng ảnh: toàn cảnh, cận 2× góc trái trên, cận 2,6× góc phải dưới.
- **Lỗi hay gặp**: thẻ thông tin hoặc `dau-chu` bật lên trong lúc chia ô sẽ che các ô (`build_timeline.py` cảnh báo). Ba góc máy của một ảnh rối (nhiều icon nhỏ) trông na ná nhau, nên khai báo `anh` khác nhau.

### Lật thẻ (`lat-the`)

- **Ý đồ**: thẻ vào úp mặt "?", lật quanh trục dọc ra đáp án. Biến một con số thành khoảnh khắc "mở bài".
- **Dùng khi**: con số người xem muốn đoán (hạng, điểm, giá). Đặt `cue` ở từ nói ra đáp án.
- **Diễn ra thế nào**: thẻ vào sớm 0,45s, mặt úp. Lật 0,13s (`power2.in`) tới 90°, đổi mặt, bật về 0° trong 0,14s (`back.out`), xong đúng `at`. Một vệt sáng lướt qua mặt thẻ (0,4s).
- **Lỗi hay gặp**: hai thẻ lật liên tiếp mất bất ngờ. Thẻ đầu cảnh không đủ thời gian vào trước.

### Đếm số (`dem-so`)

- **Ý đồ**: con số chạy lên (hoặc rơi xuống) rồi chốt đúng lúc đọc, kèm cú đập nhẹ. Hợp với lượt tải, dung lượng, giá.
- **Diễn ra thế nào**: 14 bước trong 0,6s, chậm dần theo `expo.out`, giữ nguyên định dạng của giá trị (dấu chấm nghìn, dấu phẩy thập phân, chữ trước và sau số). Chốt đúng `at`, số đập 1,25 → 1.
- **Tham số**: `tu` là số bắt đầu (mặc định 0). Ví dụ lầy: `"tu": 199000` cho thẻ "0đ" để giá rơi về không. Số khởi đầu dài hơn số thật thì tự thu cỡ trong lúc đếm.
- **Lỗi hay gặp**: chỉ đếm con số đầu tiên trong giá trị. Giá trị bị chia hai dòng thì bỏ qua (có cảnh báo trong console). Không đếm số của khoảng ("29.000–499.000đ" chỉ đếm số đầu), nên chọn thẻ có một số.

### Đẩy lên (`chuyen: "day-len"`) và lia ngang (`chuyen: "lia"`)

- **Ý đồ**: đẩy lên giống vuốt sang video kế tiếp trong feed (cảnh mới đẩy cảnh cũ lên, 0,32s, `power3.inOut`). Lia ngang có nhoè chuyển động, phanh gấp (0,26s). Cảnh cũ được kéo dài đúng thời gian chuyển để hai cảnh cùng hiện.
- **Dùng khi**: chuyển giữa các mục top-list. Xen kẽ hai kiểu, hoặc giữ một kiểu cho cả video làm nhịp chuyển chương.
- **Lỗi hay gặp**: tier-board tự có cách chuyển mục (dải trượt vào, bảng thu về góc) nên bỏ qua `chuyen`. Phụ đề, logo, con dấu nằm ở lớp riêng nên không chạy theo cảnh.

### Combo (gag `combo`)

- **Ý đồ**: bộ đếm đòn kiểu game đối kháng cho một điều lặp đi lặp lại. Lầy mà không cần meme mượn; hợp với quảng cáo, thông báo, popup đòi trả phí.
- **Dùng khi**: "ba mươi giây một quảng cáo", "thua liền ba ván", "nạp lần thứ năm". `text` là nhãn, `so` là số đòn (2–9).
- **Diễn ra thế nào**: các đòn cách nhau 0,16s, đòn cuối xong đúng `at`. Mỗi đòn số đổi, đập 1,7 → 1, khối giật ngang. Chữ "COMBO!" bật ra sau 0,08s. Khối tự tìm chỗ trống như sticker.

### Kéo so sánh (gag `keo-so-sanh`)

- **Ý đồ**: thanh chia lao từ mép phải vào 38% bề rộng trong 0,3s, rồi trượt chậm tới 55%. Bên trái ảnh 1, bên phải ảnh 2, mỗi bên một nhãn.
- **Dùng khi**: cặp đối lập **có thật trên ảnh của ứng dụng**: trước và sau khi xử lý, bản cũ và bản mới, có quảng cáo và đã trả tiền, ảnh quảng bá và ảnh tự quay. `anh: ["screenshot:2", "screenshot:3"]`, `text: ["TRƯỚC", "SAU"]`.
- **Lỗi hay gặp**: không dùng để so với ứng dụng khác hay hình không phải của ứng dụng (ảnh AI, ảnh mạng). Che khung hình nên không đặt lúc thẻ thông tin đang hiện.

## Đã thử

12/10/2026, bản sao trong scratchpad (không đụng dự án thật):

- **top-list** (kênh game, tập 2 "game Việt lên top"): `hyperframes check` 0 lỗi. Chụp khung xác nhận đủ 10 kiểu chạy đúng mốc.
- **tier-board** ("iPhone có, Android không"): `hyperframes check` 0 lỗi, cả 6 kiểu được thử đều đúng mốc.

Kịch bản cũ không khai báo kiểu nên dựng y như trước.
