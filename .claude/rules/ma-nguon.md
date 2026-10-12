---
paths:
  - "src/**/*.ts"
  - "package.json"
  - "tsconfig.json"
---

# Quy ước mã nguồn (Node.js + TypeScript)

## Cấu trúc

- Mỗi bước là một module riêng trong `src/`: `research.ts`, `assets.ts`, `voice.ts`, `timing.ts`, `render.ts`. `cli.ts` chỉ phân tích tham số và gọi các module.
- Mỗi module có một hàm chính dạng `run(projectDir: string, options): Promise<void>`: đọc file đầu vào, ghi file đầu ra. Không truyền dữ liệu giữa các bước qua biến toàn cục.
- Schema dùng chung đặt trong `src/schema.ts` (Zod). Mọi file JSON đọc vào đều phải được parse qua schema.
- CLI: `appreel make "<chủ đề>" --format vertical|horizontal --template top-list|news|tier-list` và từng bước riêng: `appreel research|assets|voice|timing|render <thư mục dự án>`.

## Gọi Claude API (`src/research.ts`)

- Dùng SDK chính thức `@anthropic-ai/sdk`, không gọi HTTP thô.
- Model mặc định `claude-opus-5`, cho phép đổi qua biến môi trường `APPREEL_MODEL`.
- Bật `thinking: { type: "adaptive" }` và dùng streaming (`.stream()` + `.finalMessage()`) vì bước nghiên cứu dài.
- Công cụ web phía server: `{ type: "web_search_20260209", name: "web_search", max_uses: 8 }` và `{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 15 }`. Không khai báo thêm `code_execution`.
- Kịch bản trả về qua structured outputs `output_config: { format: ... }` (không dùng tham số cũ `output_format`). Lưu ý: structured outputs không dùng chung được với `citations`, nên nguồn phải nằm trong trường `sources` của schema.
- Xử lý `stop_reason`: `pause_turn` thì gửi tiếp, `refusal` thì báo lỗi rõ ràng, `max_tokens` thì báo thiếu token. Lỗi web tool trả về trong block kết quả (HTTP 200), phải kiểm tra `content` là object lỗi hay danh sách kết quả.
- Ghi `usage` của mỗi lần gọi vào `projects/<...>/cost.json` để đo chi phí ở P0.
- Prompt nghiên cứu phải yêu cầu tóm tắt bằng lời mới, không chép nguyên văn nội dung trang đã `web_fetch` (tối đa một câu trích có nguồn), và bỏ qua trang chia sẻ bản bẻ khoá, APK/IPA lậu, trang đăng lại nội dung rò rỉ.
- `assets.ts` ghi `origin`, `rights_holder`, `basis` cho mọi tài nguyên như `store_assets.py`.
- `voice.ts` mặc định dùng Azure AI Speech; Edge TTS chỉ bật bằng cờ `--draft`.
- Trước khi viết code gọi Claude API, nạp skill `claude-api` để lấy cú pháp mới nhất.

## Chung

- TypeScript strict, ES modules, Node 22+.
- Đường dẫn luôn tính từ thư mục dự án video, không hard-code.
- Gọi FFmpeg/ffprobe qua `execa` hoặc `child_process.spawn` với mảng tham số, không ghép chuỗi lệnh shell.
- Log bằng tiếng Việt ngắn gọn, mỗi bước một dòng tóm tắt cuối cùng.
- Không commit `.env`, `projects/**/assets`, `projects/**/audio`, `projects/**/out`.
