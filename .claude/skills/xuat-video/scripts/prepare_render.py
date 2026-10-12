#!/usr/bin/env python3
"""Chuẩn bị thư mục render/ cho HyperFrames: chép template + tài nguyên, chèn dữ liệu vào index.html.

Cách dùng: python3 prepare_render.py <thư mục dự án> [--template top-list]

Template phải có thẻ: <script id="appreel-data" type="application/json"></script>
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

DATA_TAG = re.compile(r'(<script id="appreel-data" type="application/json">)(.*?)(</script>)', re.S)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--template", help="ghi đè template trong script.json")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    root = project.parent.parent
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    timeline = json.loads((project / "timeline.json").read_text(encoding="utf-8"))
    template = args.template or script["template"]

    tpl_dir = root / "templates" / template
    if not (tpl_dir / "index.html").exists():
        print(f"LỖI: chưa có templates/{template}/index.html. Chạy /tao-template {template} trước.")
        return 1

    render = project / "render"
    if render.exists():
        shutil.rmtree(render)
    shutil.copytree(tpl_dir, render)
    shared = root / "templates" / "_shared"
    if shared.exists():
        shutil.copytree(shared, render / "_shared")
        # HyperFrames đọc hệ thiết kế từ frame.md ở gốc project
        if (shared / "frame.md").exists() and not (render / "frame.md").exists():
            shutil.copy2(shared / "frame.md", render / "frame.md")
    for sub in ("assets", "audio"):
        if (project / sub).exists():
            shutil.copytree(project / sub, render / sub,
                            ignore=shutil.ignore_patterns("appstore.json", "googleplay.json", "subtitles.json"))

    # Nhạc nền không đưa vào composition: mix_audio.py trộn sau khi render.
    timeline = {**timeline, "music": None}

    data = {"script": script, "timeline": timeline}
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    index = render / "index.html"
    html = index.read_text(encoding="utf-8")
    if not DATA_TAG.search(html):
        print('LỖI: index.html thiếu <script id="appreel-data" type="application/json"></script>')
        return 1
    html = DATA_TAG.sub(lambda m: m.group(1) + payload + m.group(3), html, count=1)

    # Renderer HyperFrames đọc độ dài và <audio> từ HTML tĩnh (thuộc tính gán bằng JS lúc chạy bị bỏ qua):
    # ghi data-duration của root theo timeline và chèn sẵn <audio> giọng đọc từng cảnh.
    root_tag = re.compile(r'(<div id="root"[^>]*?data-duration=")[^"]*(")')
    if not root_tag.search(html):
        print('LỖI: index.html thiếu <div id="root" ... data-duration="...">')
        return 1
    html = root_tag.sub(lambda m: m.group(1) + f"{timeline['duration']:g}" + m.group(2), html, count=1)
    audios = []
    for s in timeline.get("scenes", []):
        v = s.get("voice") or {}
        if v.get("src"):
            track = 30 + (int(s["id"]) % 2)
            audios.append(
                f'<audio id="vo-{s["id"]}" src="{v["src"]}" preload="auto" data-start="{round(v["start"], 3):g}" '
                f'data-duration="{round(v["duration"], 3):g}" data-track-index="{track}"></audio>'
            )
    if audios:
        html = re.sub(r'(<div id="root"[^>]*>)', lambda m: m.group(1) + "\n      " + "\n      ".join(audios) + "\n    ", html, count=1)
    index.write_text(html, encoding="utf-8")
    print(f"Xong: {render} ({timeline['width']}x{timeline['height']}, {timeline['duration']}s, template {template})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
