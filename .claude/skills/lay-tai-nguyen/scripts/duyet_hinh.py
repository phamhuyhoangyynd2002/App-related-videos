#!/usr/bin/env python3
"""Duyệt hình ảnh, video của một dự án (DỪNG 2b).

  tao  <dự án>                        đánh số mọi tài nguyên trong assets/manifest.json, ghi
                                      assets/bang-anh.jpg (bảng ảnh có số) và assets/duyet-hinh.md
  ghi  <dự án> --duyet-het            người làm video duyệt tất cả
  ghi  <dự án> --loai 3,7 [--ly-do "3: chữ quảng cáo che giao diện; 7: lộ thông tin cá nhân"]
                                      loại các số đã nêu, duyệt phần còn lại: gỡ khỏi manifest,
                                      sửa shots trong script.json trỏ tới ảnh bị loại (sao lưu
                                      script.v<N>.json trước khi ghi)
  kiem <dự án>                        thoát mã 1 nếu chưa duyệt, hoặc có tài nguyên mới/đổi sau
                                      lần duyệt cuối (dùng làm cổng trước bước giọng đọc, render)

Số thứ tự cố định giữa `tao` và `ghi` (lưu trong manifest["duyet"]). Thêm, đổi tài nguyên thì
chạy lại `tao` rồi duyệt lại.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
FONT_DIR = ROOT / "templates/_shared/fonts"
VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v"}
THUMB_H = 360
PAD = 16
MIN_CELL = 230


def now() -> str:
    return dt.datetime.now().strftime("%Y-%m-%d %H:%M")


def sha1(path: Path) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load(project: Path) -> tuple[dict, dict]:
    mpath = project / "assets/manifest.json"
    if not mpath.exists():
        sys.exit(f"Không thấy {mpath}: chạy lay-tai-nguyen trước.")
    manifest = json.loads(mpath.read_text(encoding="utf-8"))
    spath = project / "script.json"
    script = json.loads(spath.read_text(encoding="utf-8")) if spath.exists() else {}
    return manifest, script


def save_manifest(project: Path, manifest: dict) -> None:
    (project / "assets/manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")


def collect(manifest: dict) -> list[dict]:
    """Danh sách tài nguyên theo thứ tự ứng dụng → icon, screenshot, clip quay màn hình."""
    items = []
    for key, g in (manifest.get("apps") or {}).items():
        if g.get("icon"):
            items.append({"app": key, "kind": "icon", "file": g["icon"]})
        for i, f in enumerate(g.get("screenshots") or [], 1):
            items.append({"app": key, "kind": f"screenshot:{i}", "file": f})
        if g.get("header") and g["header"] not in (g.get("screenshots") or []) and g["header"] != g.get("icon"):
            items.append({"app": key, "kind": "header", "file": g["header"]})
        if g.get("clip"):
            items.append({"app": key, "kind": "clip", "file": g["clip"]})
    return items


def mapping_errors(manifest: dict, script: dict) -> list[str]:
    """Cảnh có ứng dụng trong script.json phải trỏ đúng ứng dụng trong manifest.scenes (lỗi gặp ở kênh game
    05/10/2026: gộp cảnh sau khi lấy tài nguyên làm hạng 1 và hạng 2 hiện nhầm ảnh của nhau)."""
    errs = []
    scene_app = manifest.get("scenes") or {}
    apps = manifest.get("apps") or {}
    for sc in script.get("scenes") or []:
        app = sc.get("app") or {}
        if not app.get("name"):
            continue
        key = scene_app.get(str(sc.get("id")))
        g = apps.get(key or "")
        if not g:
            errs.append(f"cảnh {sc['id']} ({app['name']}): manifest.scenes không trỏ tới ứng dụng nào")
            continue
        ids = {str(app.get("app_store_id") or ""), app.get("play_package") or ""} - {""}
        same_id = any(i and i in key for i in ids)
        same_name = (g.get("name") or "").casefold() == app["name"].casefold()
        if not (same_id or same_name):
            errs.append(f"cảnh {sc['id']} ({app['name']}): manifest.scenes trỏ tới {g.get('name', key)}")
    return errs


def usage_by_file(manifest: dict, script: dict) -> dict[str, list[str]]:
    """Ảnh nào được cảnh nào dùng (theo shots trong script.json)."""
    out: dict[str, list[str]] = {}
    scene_app = manifest.get("scenes") or {}
    for sc in script.get("scenes") or []:
        key = scene_app.get(str(sc.get("id")))
        g = (manifest.get("apps") or {}).get(key or "")
        if not g:
            continue
        shots = sc.get("shots") or []
        for sh in shots:
            show = sh.get("show", "")
            f = None
            if show == "header":
                f = g.get("header")
            elif show.startswith("screenshot:"):
                idx = int(show.split(":")[1]) - 1
                shots_list = g.get("screenshots") or []
                f = shots_list[idx] if 0 <= idx < len(shots_list) else None
            elif show == "clip":
                f = g.get("clip")
            elif show == "icon":
                f = g.get("icon")
            if f:
                cue = f" «{sh['cue']}»" if sh.get("cue") else ""
                out.setdefault(f, []).append(f"cảnh {sc['id']}{cue}")
        if not shots and g.get("header"):
            out.setdefault(g["header"], []).append(f"cảnh {sc['id']} (tự chia)")
    return out


def video_info(path: Path) -> tuple[float, Path | None]:
    dur = 0.0
    try:
        dur = float(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, timeout=30).stdout.strip() or 0)
    except Exception:
        pass
    frame = Path(tempfile.mkstemp(suffix=".jpg")[1])
    t = min(2.0, dur / 2) if dur else 0
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", str(path),
                        "-frames:v", "1", str(frame)], capture_output=True)
    return dur, frame if r.returncode == 0 and frame.stat().st_size else None


def font(size: int, bold: bool = True):
    from PIL import ImageFont
    name = "BeVietnamPro-ExtraBold.ttf" if bold else "BeVietnamPro-Medium.ttf"
    try:
        return ImageFont.truetype(str(FONT_DIR / name), size)
    except OSError:
        return ImageFont.load_default(size=size)


def contact_sheet(project: Path, manifest: dict, items: list[dict], usage: dict) -> Path:
    from PIL import Image, ImageDraw
    rows: list[tuple[str, list[tuple[dict, Image.Image]]]] = []
    for key, g in (manifest.get("apps") or {}).items():
        thumbs = []
        for it in items:
            if it["app"] != key:
                continue
            p = project / it["file"] if not Path(it["file"]).is_absolute() else Path(it["file"])
            if not p.exists() and (ROOT / it["file"]).exists():
                p = ROOT / it["file"]
            img = None
            if p.suffix.lower() in VIDEO_EXT:
                dur, frame = video_info(p)
                it["duration"] = round(dur, 1)
                if frame:
                    img = Image.open(frame).convert("RGB")
            elif p.exists():
                img = Image.open(p).convert("RGB")
            if img is None:
                img = Image.new("RGB", (THUMB_H, THUMB_H), (60, 60, 60))
            w = max(1, round(img.width * THUMB_H / img.height))
            thumbs.append((it, img.resize((min(w, THUMB_H * 2), THUMB_H))))
        rows.append((g.get("name") or key, thumbs))

    title_h, cap_h = 64, 84
    cell = lambda t: max(t.width, MIN_CELL)
    width = max([PAD + sum(cell(t) + PAD for _, t in r[1]) for r in rows] + [1200])
    height = PAD + sum(title_h + THUMB_H + cap_h + PAD for _ in rows)
    sheet = Image.new("RGB", (width, height), (19, 27, 29))
    d = ImageDraw.Draw(sheet)
    y = PAD
    for name, thumbs in rows:
        d.text((PAD, y + 8), name, font=font(36), fill=(152, 190, 69))
        y += title_h
        x = PAD
        for it, t in thumbs:
            sheet.paste(t, (x, y))
            badge = str(it["so"])
            bw = 28 + 26 * len(badge)
            d.rounded_rectangle((x + 8, y + 8, x + 8 + bw, y + 72), 12, fill=(255, 194, 61))
            d.text((x + 22, y + 10), badge, font=font(44), fill=(19, 27, 29))
            if it["kind"] == "clip":
                d.rounded_rectangle((x + 8, y + THUMB_H - 52, x + 190, y + THUMB_H - 8), 10, fill=(200, 40, 40))
                d.text((x + 18, y + THUMB_H - 50), f"VIDEO {it.get('duration', 0)}s", font=font(28), fill="white")
            used = usage.get(it["file"])
            scenes = ", ".join(sorted(set(u.split(" «")[0] for u in used))) if used else "chưa dùng"
            d.text((x, y + THUMB_H + 8), it["kind"], font=font(22, bold=False), fill=(230, 230, 230))
            d.text((x, y + THUMB_H + 40), scenes[:28], font=font(22, bold=False),
                   fill=(230, 230, 230) if used else (150, 150, 150))
            x += cell(t) + PAD
        y += THUMB_H + cap_h + PAD
    out = project / "assets/bang-anh.jpg"
    sheet.save(out, quality=85)
    return out


def write_md(project: Path, manifest: dict, items: list[dict], usage: dict) -> Path:
    duyet = manifest.get("duyet") or {}
    apps = manifest.get("apps") or {}
    lines = [
        "# Duyệt hình ảnh, video (DỪNG 2b)",
        "",
        f"- Trạng thái: **{duyet.get('trang_thai', 'cho-duyet')}**"
        + (f" ({duyet.get('ngay')}, {duyet.get('nguoi', '')})" if duyet.get("ngay") else ""),
        "- Bảng ảnh: `assets/bang-anh.jpg` (số vàng ở góc mỗi ảnh)",
        "- Duyệt: `duyet_hinh.py ghi <dự án> --duyet-het` hoặc `--loai <số,số> --ly-do \"...\"`",
        "",
        "| Số | Ứng dụng | Loại | File | Nguồn | Dùng ở | Trạng thái |",
        "|---|---|---|---|---|---|---|",
    ]
    for it in items:
        g = apps.get(it["app"], {})
        used = "; ".join(usage.get(it["file"], [])) or "chưa dùng"
        extra = f" ({it['duration']}s)" if it.get("duration") else ""
        lines.append(f"| {it['so']} | {g.get('name', it['app'])} | {it['kind']}{extra} | `{it['file']}` | "
                     f"{g.get('origin', '?')} · {g.get('basis', '?')} | {used} | {it.get('trang_thai', 'chờ')} |")
    loai = [(k, x) for k, g in apps.items() for x in g.get("loai") or []]
    if loai:
        lines += ["", "## Đã loại", ""]
        lines += [f"- {apps[k].get('name', k)}: `{x['file']}`: {x.get('ly_do', '')}" for k, x in loai]
    warns = manifest.get("warnings") or []
    if warns:
        lines += ["", "## Cảnh báo khi lấy tài nguyên", ""] + [f"- {w}" for w in warns]
    goi_y = project / "assets/goi-y-tu-quay.md"
    if goi_y.exists():
        lines += ["", "Gợi ý cảnh nên tự quay: `assets/goi-y-tu-quay.md`."]
    out = project / "assets/duyet-hinh.md"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out


def cmd_tao(project: Path) -> None:
    manifest, script = load(project)
    errs = mapping_errors(manifest, script)
    if errs:
        print("LỖI ánh xạ cảnh → ứng dụng (chạy lại store_assets.py để cập nhật manifest.scenes):")
        print("  " + "\n  ".join(errs))
        sys.exit(1)
    items = collect(manifest)
    for i, it in enumerate(items, 1):
        it["so"] = i
        p = project / it["file"] if (project / it["file"]).exists() else ROOT / it["file"]
        it["sha1"] = sha1(p) if p.exists() else None
        it["trang_thai"] = "chờ"
        if not p.exists():
            print(f"CẢNH BÁO: thiếu file {it['file']}")
    usage = usage_by_file(manifest, script)
    sheet = contact_sheet(project, manifest, items, usage)
    manifest["duyet"] = {"trang_thai": "cho-duyet", "tao_luc": now(), "danh_sach": items}
    save_manifest(project, manifest)
    md = write_md(project, manifest, items, usage)
    unused = [it["so"] for it in items if it["file"] not in usage]
    print(f"{len(items)} tài nguyên → {sheet.relative_to(project)}, {md.relative_to(project)}")
    if unused:
        print(f"Chưa được cảnh nào dùng: {', '.join(map(str, unused))}")


def next_backup(project: Path) -> Path:
    nums = [int(m.group(1)) for p in project.glob("script.v*.json")
            if (m := re.match(r"script\.v(\d+)\.json$", p.name))]
    return project / f"script.v{max(nums, default=0) + 1}.json"


def remap_script(project: Path, manifest: dict, script: dict, removed: dict[str, set[int]]) -> list[str]:
    """Sửa shots trỏ tới screenshot bị loại; screenshot phía sau dồn số."""
    changes = []
    scene_app = manifest.get("scenes") or {}
    for sc in script.get("scenes") or []:
        key = scene_app.get(str(sc.get("id")))
        if key not in removed:
            continue
        gone = removed[key]
        remaining = len(manifest["apps"][key].get("screenshots") or [])

        def new_index(i: int) -> int:
            return i - sum(1 for r in gone if r < i)

        used = set()
        for sh in sc.get("shots") or []:
            m = re.match(r"screenshot:(\d+)$", sh.get("show", ""))
            if m and int(m.group(1)) not in gone:
                used.add(new_index(int(m.group(1))))
        for sh in sc.get("shots") or []:
            m = re.match(r"screenshot:(\d+)$", sh.get("show", ""))
            if not m:
                continue
            i = int(m.group(1))
            if i in gone:
                spare = [k for k in range(1, remaining + 1) if k not in used]
                new = f"screenshot:{spare[0]}" if spare else "header"
                if spare:
                    used.add(spare[0])
            else:
                new = f"screenshot:{new_index(i)}"
            if new != sh["show"] or i in gone:
                note = " (ảnh cũ bị loại, thay ảnh khác)" if i in gone else ""
                changes.append(f"cảnh {sc['id']}{' «' + sh['cue'] + '»' if sh.get('cue') else ''}: "
                               f"{sh['show']} → {new}{note}")
                sh["show"] = new
    return changes


def cmd_ghi(project: Path, duyet_het: bool, loai: list[int], ly_do: str) -> None:
    manifest, script = load(project)
    duyet = manifest.get("duyet")
    if not duyet or not duyet.get("danh_sach"):
        sys.exit("Chưa có danh sách duyệt: chạy `duyet_hinh.py tao` trước.")
    items = duyet["danh_sach"]
    by_no = {it["so"]: it for it in items}
    bad = [n for n in loai if n not in by_no]
    if bad:
        sys.exit(f"Không có số: {bad}")
    reasons = {}
    for part in re.split(r";\s*", ly_do or ""):
        m = re.match(r"\s*(\d+)\s*:\s*(.+)", part)
        if m:
            reasons[int(m.group(1))] = m.group(2).strip()
    removed: dict[str, set[int]] = {}
    for n in loai:
        it = by_no[n]
        g = manifest["apps"][it["app"]]
        g.setdefault("loai", []).append({"file": it["file"], "kind": it["kind"],
                                         "ly_do": reasons.get(n, ly_do or "người làm video loại"),
                                         "ngay": now()})
        it["trang_thai"] = "loại"
        kind = it["kind"]
        if kind.startswith("screenshot:"):
            removed.setdefault(it["app"], set()).add(int(kind.split(":")[1]))
        elif kind in ("icon", "clip"):
            g[kind] = None
        if g.get("header") == it["file"]:
            g["header"] = None
    for key, idxs in removed.items():
        g = manifest["apps"][key]
        g["screenshots"] = [f for i, f in enumerate(g.get("screenshots") or [], 1) if i not in idxs]
    for g in manifest["apps"].values():
        if not g.get("header"):
            g["header"] = (g.get("screenshots") or [None])[0] or g.get("icon")
    for it in items:
        if it["trang_thai"] != "loại":
            it["trang_thai"] = "duyệt"
    changes = remap_script(project, manifest, script, removed) if removed else []
    if changes:
        backup = next_backup(project)
        shutil.copy(project / "script.json", backup)
        (project / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Đã sao lưu {backup.name}, sửa shots:")
        for c in changes:
            print("  " + c)
    duyet.update({"trang_thai": "da-duyet", "ngay": now(), "nguoi": "người làm video",
                  "loai": loai, "duyet_het": duyet_het})
    save_manifest(project, manifest)
    usage = usage_by_file(manifest, script)
    write_md(project, manifest, items, usage)
    empty = [g.get("name", k) for k, g in manifest["apps"].items() if not g.get("screenshots") and not g.get("clip")]
    print(f"Đã duyệt {sum(1 for it in items if it['trang_thai'] == 'duyệt')}, loại {len(loai)}.")
    if empty:
        print(f"CẢNH BÁO: không còn screenshot/clip cho {', '.join(empty)}: tự quay màn hình ứng dụng hoặc lấy thêm nguồn hợp lệ.")
    if (project / "timeline.json").exists() and (removed or loai):
        print("timeline.json đã cũ: chạy lại build_timeline.py (và render nếu đã render).")


def cmd_kiem(project: Path) -> int:
    manifest, script = load(project)
    errs = mapping_errors(manifest, script)
    if errs:
        print("LỖI ánh xạ cảnh → ứng dụng:\n  " + "\n  ".join(errs))
        return 1
    duyet = manifest.get("duyet") or {}
    if duyet.get("trang_thai") != "da-duyet":
        print("CHƯA DUYỆT: tài nguyên chưa qua DỪNG 2b (duyet_hinh.py tao, rồi ghi).")
        return 1
    approved = {it["file"]: it.get("sha1") for it in duyet.get("danh_sach", []) if it.get("trang_thai") == "duyệt"}
    problems = []
    for it in collect(manifest):
        p = project / it["file"] if (project / it["file"]).exists() else ROOT / it["file"]
        if it["file"] not in approved:
            problems.append(f"mới, chưa duyệt: {it['file']}")
        elif p.exists() and approved[it["file"]] and sha1(p) != approved[it["file"]]:
            problems.append(f"đã đổi sau khi duyệt: {it['file']}")
    if problems:
        print("CẦN DUYỆT LẠI:\n  " + "\n  ".join(problems))
        return 1
    print(f"Đã duyệt ({duyet.get('ngay')}): {len(approved)} tài nguyên.")
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("lenh", choices=["tao", "ghi", "kiem"])
    ap.add_argument("project")
    ap.add_argument("--duyet-het", action="store_true")
    ap.add_argument("--loai", default="", help="số cần loại, ví dụ 3,7")
    ap.add_argument("--ly-do", default="", help='"3: lý do; 7: lý do" hoặc một lý do chung')
    a = ap.parse_args()
    project = Path(a.project).resolve()
    if a.lenh == "tao":
        cmd_tao(project)
    elif a.lenh == "ghi":
        loai = [int(x) for x in a.loai.split(",") if x.strip()]
        if not a.duyet_het and not loai:
            sys.exit("Cần --duyet-het hoặc --loai.")
        cmd_ghi(project, a.duyet_het, loai, a.ly_do)
    else:
        sys.exit(cmd_kiem(project))


if __name__ == "__main__":
    main()
