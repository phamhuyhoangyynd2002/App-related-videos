#!/usr/bin/env python3
"""Mở một lần chạy bản tin: tính khoảng tin, lấy bảng xếp hạng ứng dụng (không tính game) App Store Việt Nam
và tìm kiếm thịnh hành Google Trends VN, so với lần chạy trước.

Cách dùng:
  python3 bang_xep_hang.py [--che-do day-du|cap-nhat] [--goc ke-hoach/ban-tin] [--ngay YYYY-MM-DD] [--khong-trends]

Mỗi lần chạy là một thư mục ke-hoach/ban-tin/<ngày>/. Chạy lại cùng ngày thì ghi đè thư mục đó.
Ghi ra:
  <ngày>/lan-chay.json  thời điểm chạy, chế độ, khoảng tin (từ thời điểm lần chạy gần nhất trước đó,
                        nhưng không xa quá 7 ngày; chưa có lần nào thì 7 ngày), thư mục lần chạy trước
Ghi ra <ngày>/du-lieu/:
  appstore.json   dữ liệu thô: 3 bảng (mien-phi, co-phi, doanh-thu) đã bỏ game + thông tin từng ứng dụng (lookup)
  trends.json     tìm kiếm thịnh hành Google Trends VN (RSS, khoảng 24 giờ gần nhất)
  bang-xep-hang.md bảng đã so sánh với lần chạy gần nhất trước đó: MỚI, ▲n, ▼n, rơi khỏi top,
                   số ứng dụng theo thể loại, ứng dụng AI trong top, ứng dụng mới phát hành (≤ 90 ngày) lọt top,
                   tìm kiếm thịnh hành có vẻ liên quan ứng dụng

Không cần key. Google Play không có API bảng xếp hạng chính thức nên không lấy ở đây.
Bảng App Store là thứ hạng tại thời điểm chạy, không phải số lượt tải hay doanh thu. Bảng lấy từ RSS mọi thể loại
(200 dòng) rồi bỏ ứng dụng thể loại Games, nên thứ hạng ghi ở đây là thứ hạng trong bảng chung của App Store.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (AppReel ban-tin-tuan)"}
BANG = {
    "mien-phi": ("topfreeapplications", 200),
    "co-phi": ("toppaidapplications", 200),
    "doanh-thu": ("topgrossingapplications", 200),
}
TEN_BANG = {"mien-phi": "Miễn phí", "co-phi": "Có phí", "doanh-thu": "Doanh thu cao"}
MOI_NGAY = 90  # ứng dụng phát hành trong chừng này ngày mà đã lọt top
TU_AI = re.compile(r"\b(ai|gpt|chat ?gpt|gemini|copilot|claude|grok|deepseek|perplexity|trợ lý ảo)\b", re.I)
TU_UNG_DUNG = re.compile(
    r"\bapp\b|ứng dụng|\bai\b|chatgpt|gemini|zalo|vneid|vssid|etax|ngân hàng|banking|ví điện tử|momo|zalopay|"
    r"capcut|tiktok|facebook|messenger|threads|instagram|google|iphone|ios|android|cập nhật|lỗi|sập|bảo mật|lừa đảo",
    re.I,
)


def get(url: str, attempts: int = 3) -> bytes:
    for i in range(attempts):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            if i == attempts - 1:
                raise
            print(f"  thử lại ({e})", file=sys.stderr)
            time.sleep(2 * (i + 1))
    raise RuntimeError("unreachable")


def lay_bang(feed: str, limit: int) -> list[dict]:
    url = f"https://itunes.apple.com/vn/rss/{feed}/limit={limit}/json"
    data = json.loads(get(url))
    out = []
    for hang, e in enumerate(data["feed"].get("entry", []), 1):
        out.append({
            "hang": hang,
            "id": e["id"]["attributes"]["im:id"],
            "ten": e["im:name"]["label"],
            "nha_phat_hanh": e["im:artist"]["label"],
        })
    return out


def tra_thong_tin(ids: list[str]) -> dict[str, dict]:
    info: dict[str, dict] = {}
    for i in range(0, len(ids), 100):
        chunk = ",".join(ids[i:i + 100])
        data = json.loads(get(f"https://itunes.apple.com/lookup?id={chunk}&country=vn"))
        for r in data.get("results", []):
            size = int(r.get("fileSizeBytes") or 0)
            info[str(r["trackId"])] = {
                "la_game": r.get("primaryGenreName") == "Games",
                "the_loai": r.get("primaryGenreName") or "?",
                "the_loai_phu": [g for g in r.get("genres", []) if g != r.get("primaryGenreName")],
                "dung_luong_mb": round(size / 1_048_576) if size else None,
                "gia": r.get("formattedPrice"),
                "diem": r.get("averageUserRating"),
                "so_danh_gia": r.get("userRatingCount"),
                "ngay_phat_hanh": (r.get("releaseDate") or "")[:10],
                "ngay_cap_nhat": (r.get("currentVersionReleaseDate") or "")[:10],
                "do_tuoi": r.get("contentAdvisoryRating"),
                "nha_phat_trien": r.get("artistName"),
                "url": r.get("trackViewUrl", "").split("?")[0],
            }
    return info


def lay_trends() -> list[dict]:
    root = ET.fromstring(get("https://trends.google.com/trending/rss?geo=VN"))
    ns = {"ht": "https://trends.google.com/trending/rss"}
    out = []
    for it in root.iter("item"):
        tieu_de = [n.findtext("ht:news_item_title", "", ns) for n in it.findall("ht:news_item", ns)]
        out.append({
            "tu_khoa": it.findtext("title", ""),
            "luot_tim": it.findtext("ht:approx_traffic", "", ns),
            "ngay": it.findtext("pubDate", ""),
            "tin": tieu_de[:3],
        })
    return out


TOI_DA_NGAY = 7


def lan_truoc(goc: Path, ngay: str) -> Path | None:
    """Thư mục lần chạy gần nhất trước ngày này (tên dạng YYYY-MM-DD, có lan-chay.json)."""
    cu = sorted(p for p in goc.iterdir()
                if p.is_dir() and re.fullmatch(r"\d{4}-\d{2}-\d{2}", p.name) and p.name < ngay
                and (p / "lan-chay.json").exists())
    return cu[-1] if cu else None


def khoang_tin(truoc: Path | None, bay_gio: dt.datetime) -> dt.datetime:
    som_nhat = bay_gio - dt.timedelta(days=TOI_DA_NGAY)
    if truoc is None:
        return som_nhat
    tu = dt.datetime.fromisoformat(json.loads((truoc / "lan-chay.json").read_text())["thoi_diem"])
    return max(tu, som_nhat)


def bien_dong(hien: list[dict], cu: list[dict] | None) -> tuple[dict[str, str], list[dict]]:
    if cu is None:
        return {}, []
    hang_cu = {g["id"]: g["hang"] for g in cu}
    nhan = {}
    for g in hien:
        h = hang_cu.get(g["id"])
        if h is None:
            nhan[g["id"]] = "MỚI"
        elif h > g["hang"]:
            nhan[g["id"]] = f"▲{h - g['hang']}"
        elif h < g["hang"]:
            nhan[g["id"]] = f"▼{g['hang'] - h}"
        else:
            nhan[g["id"]] = "="
    con = {g["id"] for g in hien}
    roi = [g for g in cu if g["id"] not in con]
    return nhan, roi


def dem_the_loai(bang: list[dict], info: dict[str, dict]) -> dict[str, int]:
    dem: dict[str, int] = {}
    for g in bang:
        tl = info.get(g["id"], {}).get("the_loai", "?")
        dem[tl] = dem.get(tl, 0) + 1
    return dict(sorted(dem.items(), key=lambda x: -x[1]))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--goc", default="ke-hoach/ban-tin")
    ap.add_argument("--che-do", choices=["day-du", "cap-nhat"], default="day-du")
    ap.add_argument("--ngay", default=dt.date.today().isoformat())
    ap.add_argument("--khong-trends", action="store_true")
    ap.add_argument("--top", type=int, default=20, help="số dòng mỗi bảng trong bang-xep-hang.md")
    a = ap.parse_args()

    goc = Path(a.goc)
    goc.mkdir(parents=True, exist_ok=True)
    lan_chay = goc / a.ngay
    thu_muc = lan_chay / "du-lieu"
    thu_muc.mkdir(parents=True, exist_ok=True)
    bay_gio = dt.datetime.now().astimezone()
    tra_luc = bay_gio.isoformat(timespec="minutes")
    truoc = lan_truoc(goc, a.ngay)
    tu = khoang_tin(truoc, bay_gio)
    (lan_chay / "lan-chay.json").write_text(json.dumps({
        "thoi_diem": tra_luc,
        "che_do": a.che_do,
        "tuan_iso": f"{bay_gio.isocalendar()[0]}-W{bay_gio.isocalendar()[1]:02d}",
        "khoang_tin": {"tu": tu.isoformat(timespec="minutes"), "den": tra_luc},
        "lan_truoc": truoc.name if truoc else None,
    }, ensure_ascii=False, indent=1))
    print(f"Khoảng tin: {tu:%d/%m/%Y %H:%M} – {bay_gio:%d/%m/%Y %H:%M}"
          + (f" (từ lần chạy {truoc.name})" if truoc else " (chưa có lần chạy trước, lấy 7 ngày)"), file=sys.stderr)

    bang = {}
    for key, (feed, limit) in BANG.items():
        print(f"Lấy bảng {key}…", file=sys.stderr)
        try:
            bang[key] = lay_bang(feed, limit)
        except Exception as e:  # noqa: BLE001
            print(f"  LỖI bảng {key}: {e}", file=sys.stderr)
            bang[key] = []
    ids = sorted({g["id"] for b in bang.values() for g in b})
    print(f"Tra thông tin {len(ids)} ứng dụng…", file=sys.stderr)
    info = tra_thong_tin(ids)
    # bỏ game, giữ thứ hạng gốc trong bảng chung của App Store
    for key in bang:
        bang[key] = [g for g in bang[key] if not info.get(g["id"], {}).get("la_game")]
    (thu_muc / "appstore.json").write_text(json.dumps(
        {"khu_vuc": "vn", "tra_luc": tra_luc, "bang": bang, "thong_tin": info}, ensure_ascii=False, indent=1))

    trends: list[dict] = []
    if not a.khong_trends:
        try:
            trends = lay_trends()
            (thu_muc / "trends.json").write_text(json.dumps(
                {"khu_vuc": "VN", "tra_luc": tra_luc, "muc": trends}, ensure_ascii=False, indent=1))
        except Exception as e:  # noqa: BLE001
            print(f"  LỖI Google Trends: {e}", file=sys.stderr)

    file_cu = truoc / "du-lieu" / "appstore.json" if truoc else None
    cu = json.loads(file_cu.read_text()) if file_cu and file_cu.exists() else None
    md = [f"# Bảng xếp hạng ứng dụng App Store Việt Nam, {a.ngay}", "",
          f"Tra lúc {tra_luc}, khu vực VN, mọi thể loại trừ Games (thứ hạng là hạng trong bảng chung). "
          + (f"So với lần chạy {truoc.name}." if cu else "Chưa có lần chạy trước để so sánh."), ""]
    ten_moi = {g["id"]: g["ten"] for b in bang.values() for g in b}
    for key, ds in bang.items():
        nhan, roi = bien_dong(ds, cu["bang"].get(key) if cu else None)
        md += [f"## {TEN_BANG[key]} (top {min(a.top, len(ds))}/{len(ds)})", "",
               "| # | Biến động | Ứng dụng | Nhà phát triển | Thể loại | Giá | Điểm (lượt) | app_store_id |",
               "|---|---|---|---|---|---|---|---|"]
        for g in ds[:a.top]:
            i = info.get(g["id"], {})
            diem = f"{i['diem']:.1f} ({i['so_danh_gia']})" if i.get("diem") else "-"
            md.append(f"| {g['hang']} | {nhan.get(g['id'], '')} | {g['ten']} | {g['nha_phat_hanh']} | "
                      f"{i.get('the_loai', '?')} | {i.get('gia') or '-'} | {diem} | {g['id']} |")
        moi_ngoai_top = [g for g in ds[a.top:] if nhan.get(g["id"]) == "MỚI"]
        if moi_ngoai_top:
            md += ["", "Mới vào bảng (ngoài top hiển thị): "
                   + "; ".join(f"#{g['hang']} {g['ten']}" for g in moi_ngoai_top)]
        tang_manh = sorted((g for g in ds if nhan.get(g["id"], "").startswith("▲")),
                           key=lambda g: -int(nhan[g["id"]][1:]))[:5]
        if tang_manh:
            md += ["", "Tăng mạnh nhất: " + "; ".join(f"{g['ten']} {nhan[g['id']]} (#{g['hang']})" for g in tang_manh)]
        if roi:
            md += ["", "Rơi khỏi bảng: " + "; ".join(f"{g['ten']} (trước #{g['hang']})" for g in roi[:10])]
        dem = dem_the_loai(ds, info)
        dem_cu = dem_the_loai(cu["bang"].get(key, []), {**cu["thong_tin"], **info}) if cu else {}
        md += ["", "Thể loại: " + ", ".join(
            f"{tl} {n}" + (f" ({n - dem_cu.get(tl, 0):+d})" if cu else "") for tl, n in dem.items()), ""]

    ai = [g for g in bang["mien-phi"] if TU_AI.search(g["ten"])]
    md += ["## Ứng dụng AI trong top miễn phí (lọc theo tên)", "",
           "; ".join(f"#{g['hang']} {g['ten']}" for g in ai) or "Không có", ""]
    moc = (bay_gio - dt.timedelta(days=MOI_NGAY)).date().isoformat()
    moi = [(k, g) for k, ds in bang.items() for g in ds
           if (info.get(g["id"], {}).get("ngay_phat_hanh") or "0") >= moc]
    md += [f"## Ứng dụng mới phát hành (từ {moc}) đã lọt bảng", "",
           "; ".join(f"{TEN_BANG[k]} #{g['hang']} {g['ten']} (phát hành {info[g['id']]['ngay_phat_hanh']})"
                     for k, g in moi) or "Không có", ""]

    if trends:
        lien_quan = [t for t in trends if TU_UNG_DUNG.search(t["tu_khoa"]) or any(
            ten.lower() in t["tu_khoa"].lower() for ten in ten_moi.values() if len(ten) > 4)]
        md += ["## Google Trends VN, tìm kiếm thịnh hành có vẻ liên quan ứng dụng", "",
               "Lọc tự động bằng từ khoá, cần người đọc xác nhận. Danh sách đầy đủ trong trends.json.", ""]
        md += [f"- {t['tu_khoa']} ({t['luot_tim']}): {' / '.join(t['tin'][:2])}" for t in lien_quan] or ["- Không thấy"]
        md.append("")

    (thu_muc / "bang-xep-hang.md").write_text("\n".join(md))
    print(thu_muc / "bang-xep-hang.md")


if __name__ == "__main__":
    main()
