#!/usr/bin/env python3
"""Mở một lần soi kênh lớn: lấy video mới của các kênh ứng dụng nước ngoài trong references/kenh.json,
đo lượt xem so với trung vị của chính kênh, rút link cửa hàng trong mô tả và tra xem ứng dụng có trên App Store VN không.

Cách dùng:
  python3 quet_kenh.py [--goc ke-hoach/soi-kenh] [--ngay YYYY-MM-DD] [--so-video 30] [--chi-tiet 12] [--kenh "HowToMen"]

Mỗi lần chạy là một thư mục ke-hoach/soi-kenh/<ngày>/ (chạy lại cùng ngày thì ghi đè). Ghi ra:
  lan-chay.json        thời điểm, khoảng video (từ lần chạy trước, tối đa 30 ngày; lần đầu 30 ngày), lần chạy trước
  du-lieu/video.json   dữ liệu thô từng kênh: trung vị, mọi video trong mẫu, chi tiết video mới
  du-lieu/video.md     bảng video mới trong khoảng, hệ số so với trung vị, mô tả rút gọn, ứng dụng có link cửa hàng
Cập nhật ke-hoach/soi-kenh/da-thay.json: mọi video đã thấy (để lần sau chỉ tra chi tiết video mới).

Không cần key. Cần yt-dlp bản mới (Python 3.10+); máy chỉ có Python 3.9 thì chạy qua uv:
  uv run --python 3.12 --with yt-dlp --with google-play-scraper python quet_kenh.py …
google-play-scraper để tra ứng dụng có trên Google Play VN không (thiếu thì bỏ qua bước này). Lượt xem là số tại thời điểm chạy;
video mới đăng 1–2 ngày chưa đủ thời gian nên hệ số thấp là bình thường. Lỗi một kênh thì ghi vào "Nguồn lỗi" và làm tiếp.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
import statistics
import subprocess
import sys
import urllib.request
from pathlib import Path

GOC_SKILL = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (AppReel soi-kenh-lon)"}
TOI_DA_NGAY = 30
RE_APPSTORE = re.compile(r"apps\.apple\.com/[^\s]*?/id(\d{6,12})")
RE_PLAY = re.compile(r"play\.google\.com/store/apps/details\?id=([A-Za-z0-9_.]+)")


def lenh_ytdlp() -> list[str]:
    if shutil.which("yt-dlp"):
        return ["yt-dlp"]
    try:
        import yt_dlp  # noqa: F401
        return [sys.executable, "-m", "yt_dlp"]
    except ImportError:
        sys.exit("Thiếu yt-dlp: chạy `pip install yt-dlp` rồi thử lại.")


def ytdlp_json(yt: list[str], url: str, them: list[str], timeout: int = 300) -> dict:
    loi = ""
    for _ in range(2):
        p = subprocess.run([*yt, *them, "-J", "--no-warnings", url], capture_output=True, text=True, timeout=timeout)
        if p.returncode == 0 and p.stdout.strip():
            return json.loads(p.stdout)
        loi = (p.stderr.strip().splitlines() or ["không rõ lỗi"])[-1]
    raise RuntimeError(loi)


def ngay_dang(e: dict) -> str:
    if e.get("upload_date"):
        return e["upload_date"]
    if e.get("timestamp"):
        return dt.datetime.fromtimestamp(e["timestamp"], dt.timezone.utc).strftime("%Y%m%d")
    return ""


def gon(e: dict) -> dict:
    return {
        "id": e.get("id"),
        "tieu_de": (e.get("title") or e.get("description") or "").strip(),
        "luot_xem": e.get("view_count"),
        "ngay": ngay_dang(e),
        "thoi_luong": e.get("duration"),
        "url": e.get("webpage_url") or e.get("url"),
    }


def chi_tiet(yt: list[str], url: str) -> dict:
    e = ytdlp_json(yt, url, ["--skip-download"], timeout=120)
    mo_ta = e.get("description") or ""
    return {
        "ngay": ngay_dang(e),
        "luot_xem": e.get("view_count"),
        "thich": e.get("like_count"),
        "binh_luan": e.get("comment_count"),
        "thoi_luong": e.get("duration"),
        "the": (e.get("tags") or [])[:15],
        "mo_ta": mo_ta[:1500],
        "appstore_id": sorted(set(RE_APPSTORE.findall(mo_ta))),
        "play": sorted(set(RE_PLAY.findall(mo_ta))),
    }


def tra_appstore_vn(ids: list[str]) -> dict[str, dict]:
    kq: dict[str, dict] = {}
    for i in range(0, len(ids), 100):
        lo = ids[i:i + 100]
        url = f"https://itunes.apple.com/lookup?id={','.join(lo)}&country=vn"
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                data = json.load(r)
        except Exception as ex:  # mạng lỗi thì coi như chưa tra
            for x in lo:
                kq[x] = {"loi": str(ex)}
            continue
        thay = {str(a["trackId"]): a for a in data.get("results", [])}
        for x in lo:
            a = thay.get(x)
            kq[x] = {"co_o_vn": bool(a), "ten": a.get("trackName") if a else None,
                     "gia": a.get("formattedPrice") if a else None, "the_loai": a.get("primaryGenreName") if a else None}
    return kq


def tra_play_vn(goi: list[str]) -> dict[str, dict]:
    try:
        from google_play_scraper import app as play_app
    except ImportError:
        return {g: {"loi": "thiếu google-play-scraper"} for g in goi}
    kq: dict[str, dict] = {}
    for g in goi:
        try:
            a = play_app(g, lang="vi", country="vn")
            kq[g] = {"co_o_vn": True, "ten": a.get("title"), "gia": "Miễn phí" if a.get("free") else a.get("price"),
                     "the_loai": a.get("genre"), "luot_tai": a.get("installs")}
        except Exception as ex:
            kq[g] = {"co_o_vn": False} if "not found" in str(ex).lower() or "404" in str(ex) else {"loi": str(ex)}
    return kq


def lan_truoc(goc: Path, ngay: str) -> Path | None:
    cu = sorted(p for p in goc.glob("????-??-??") if p.is_dir() and p.name < ngay and (p / "lan-chay.json").exists())
    return cu[-1] if cu else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--goc", default="ke-hoach/soi-kenh")
    ap.add_argument("--ngay", default=dt.date.today().isoformat())
    ap.add_argument("--so-video", type=int, default=30, help="số video mới nhất lấy mỗi tab để tính trung vị")
    ap.add_argument("--chi-tiet", type=int, default=12, help="tối đa số video mới mỗi tab được tra mô tả, ngày đăng")
    ap.add_argument("--kenh", action="append", help="chỉ quét kênh có tên này (lặp được)")
    a = ap.parse_args()

    yt = lenh_ytdlp()
    goc = Path(a.goc)
    thu_muc = goc / a.ngay
    (thu_muc / "du-lieu").mkdir(parents=True, exist_ok=True)
    bay_gio = dt.datetime.now()
    truoc = lan_truoc(goc, a.ngay)
    tu = bay_gio - dt.timedelta(days=TOI_DA_NGAY)
    if truoc:
        t = dt.datetime.fromisoformat(json.loads((truoc / "lan-chay.json").read_text())["thoi_diem"])
        tu = max(tu, t - dt.timedelta(days=1))  # lùi 1 ngày vì ngày đăng chỉ có ngày, không có giờ
    tu_s = tu.strftime("%Y%m%d")

    da_thay_f = goc / "da-thay.json"
    da_thay: dict = json.loads(da_thay_f.read_text()) if da_thay_f.exists() else {}

    ds = [k for k in json.loads((GOC_SKILL / "references" / "kenh.json").read_text())["kenh"] if not k.get("tat")]
    if a.kenh:
        ds = [k for k in ds if k["ten"] in a.kenh]

    ket_qua, loi = [], []
    for k in ds:
        tabs = k.get("tab", ["videos"]) if k["nen_tang"] == "youtube" else ["video"]
        for tab in tabs:
            if k["nen_tang"] == "youtube":
                url = f"https://www.youtube.com/channel/{k['id']}/{tab}"
            else:
                url = f"https://www.tiktok.com/@{k['id']}"
            print(f"… {k['ten']} / {tab}", flush=True)
            try:
                info = ytdlp_json(yt, url, ["--flat-playlist", "--playlist-end", str(a.so_video)])
            except Exception as ex:
                loi.append(f"{k['ten']} / {tab}: {ex}")
                continue
            ds_video = [gon(e) for e in (info.get("entries") or []) if e]
            for v in ds_video:
                if not v["url"]:
                    v["url"] = (f"https://www.youtube.com/watch?v={v['id']}" if k["nen_tang"] == "youtube"
                                else f"https://www.tiktok.com/@{k['id']}/video/{v['id']}")
            xem = [v["luot_xem"] for v in ds_video if v["luot_xem"] is not None]
            trung_vi = int(statistics.median(xem)) if xem else None

            # Video chưa thấy bao giờ: tra chi tiết (ngày đăng, mô tả). Danh sách xếp mới nhất trước.
            moi = []
            for v in ds_video:
                khoa = f"{k['nen_tang']}:{v['id']}"
                if khoa in da_thay:
                    v["ngay"] = v["ngay"] or da_thay[khoa]
                    continue
                if len(moi) >= a.chi_tiet:
                    break
                try:
                    v.update({kk: vv for kk, vv in chi_tiet(yt, v["url"]).items() if vv not in (None, "")})
                except Exception as ex:  # không đánh dấu đã thấy, để lần sau tra lại
                    loi.append(f"{k['ten']} / {v['id']}: {ex}")
                    moi.append(v)
                    continue
                da_thay[khoa] = v["ngay"]
                moi.append(v)
            for v in ds_video:
                v["he_so"] = round(v["luot_xem"] / trung_vi, 2) if trung_vi and v["luot_xem"] is not None else None
                v["trong_khoang"] = bool(v["ngay"]) and v["ngay"] >= tu_s
            ket_qua.append({"kenh": k["ten"], "nen_tang": k["nen_tang"], "tab": tab, "vi_sao": k.get("vi_sao", ""),
                            "theo_doi": info.get("channel_follower_count"), "trung_vi": trung_vi,
                            "so_mau": len(xem), "video": ds_video})

    ids = sorted({i for kq in ket_qua for v in kq["video"] for i in v.get("appstore_id", [])})
    appstore = tra_appstore_vn(ids) if ids else {}
    goi = sorted({g for kq in ket_qua for v in kq["video"] if v["trong_khoang"] for g in v.get("play", [])})
    play = tra_play_vn(goi) if goi else {}

    (thu_muc / "lan-chay.json").write_text(json.dumps({
        "thoi_diem": bay_gio.isoformat(timespec="seconds"), "tu": tu.date().isoformat(), "den": bay_gio.date().isoformat(),
        "lan_truoc": truoc.name if truoc else None, "so_kenh": len(ds), "nguon_loi": loi}, ensure_ascii=False, indent=2))
    (thu_muc / "du-lieu" / "video.json").write_text(json.dumps(
        {"kenh": ket_qua, "appstore_vn": appstore, "play_vn": play}, ensure_ascii=False, indent=2))
    da_thay_f.write_text(json.dumps(da_thay, ensure_ascii=False, indent=0))

    # Bảng đọc nhanh
    d = [f"# Video mới của kênh lớn ({tu.date().isoformat()} – {bay_gio.date().isoformat()})", "",
         "Hệ số = lượt xem ÷ trung vị lượt xem của tab đó trong mẫu. ≥ 2 là vượt trội. Lượt xem đo lúc chạy script.", ""]
    d += ["## Tổng quan kênh", "", "| Kênh | Nền tảng / tab | Theo dõi | Trung vị | Video mới trong khoảng |", "|---|---|---|---|---|"]
    for kq in ket_qua:
        n = sum(v["trong_khoang"] for v in kq["video"])
        d.append(f"| {kq['kenh']} | {kq['nen_tang']} / {kq['tab']} | {kq['theo_doi'] or ''} | {kq['trung_vi'] or ''} | {n} |")
    d += ["", "## Video mới trong khoảng (xếp theo hệ số)", ""]
    moi_all = [(kq, v) for kq in ket_qua for v in kq["video"] if v["trong_khoang"]]
    moi_all.sort(key=lambda x: x[1]["he_so"] or 0, reverse=True)
    for kq, v in moi_all:
        tieu_de = v["tieu_de"].replace("\n", " ")[:150]
        d.append(f"### {kq['kenh']} ({kq['tab']}) · {v['ngay']} · {v['luot_xem']} lượt xem · ×{v['he_so']}")
        d.append(f"- Tiêu đề: {tieu_de}")
        d.append(f"- Link: {v['url']}")
        if v.get("thoi_luong"):
            d.append(f"- Thời lượng: {v['thoi_luong']} giây; thích {v.get('thich')}; bình luận {v.get('binh_luan')}")
        for i in v.get("appstore_id", []):
            s = appstore.get(i, {})
            vn = "có ở VN" if s.get("co_o_vn") else ("chưa tra được" if "loi" in s else "không có ở App Store VN")
            d.append(f"- App Store id{i}: {s.get('ten') or '?'} · {vn} · {s.get('gia') or ''} · {s.get('the_loai') or ''}")
        for p in v.get("play", []):
            s = play.get(p, {})
            vn = "có ở VN" if s.get("co_o_vn") else ("chưa tra được" if "loi" in s else "không có ở Google Play VN")
            d.append(f"- Google Play {p}: {s.get('ten') or '?'} · {vn} · {s.get('gia') or ''} · {s.get('the_loai') or ''} · {s.get('luot_tai') or ''}")
        if v.get("mo_ta"):
            d.append("- Mô tả (rút gọn): " + re.sub(r"\s+", " ", v["mo_ta"])[:600])
        d.append("")
    if not moi_all:
        d.append("Không có video mới trong khoảng.")
    d += ["", "## Nguồn lỗi", ""] + ([f"- {x}" for x in loi] or ["Không có."])
    (thu_muc / "du-lieu" / "video.md").write_text("\n".join(d) + "\n")
    print(f"Xong: {thu_muc}/du-lieu/video.md · {len(moi_all)} video mới · {len(loi)} lỗi")


if __name__ == "__main__":
    main()
