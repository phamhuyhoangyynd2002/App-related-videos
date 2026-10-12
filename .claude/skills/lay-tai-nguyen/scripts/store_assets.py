#!/usr/bin/env python3
"""Tải icon, screenshot và số liệu của ứng dụng điện thoại từ App Store (nguồn chính) và Google Play.

Cách dùng:
  python3 store_assets.py <thư mục dự án> [--screenshots 4] [--only <tên ứng dụng|id>]

Mỗi cảnh có `app` trong script.json được lấy: theo `app_store_id` / `play_package` nếu có, không có thì tìm theo
tên trên App Store Việt Nam và Google Play. `"platform": "android"` là ứng dụng chỉ có trên Android: bỏ qua
App Store (tránh khớp nhầm ứng dụng cùng tên). `"platform": "web"` là công cụ web: bỏ qua, dùng ảnh tự chụp.

Ghi ra:
  assets/<key>/icon.jpg, shot-1.jpg..., appstore.json, googleplay.json (dữ liệu thô để kiểm chứng)
  assets/manifest.json (key "ios-<id>" hoặc "gp-<package>"; giữ clip quay màn hình đã gắn trước đó)
Không sửa script.json. Tìm theo tên thì ghi "match": "exact" | "fuzzy" để người duyệt kiểm tra.

Ảnh trên cửa hàng thuộc nhà phát triển; cửa hàng không cấp giấy phép. Manifest ghi chủ sở hữu
(rights_holder) và căn cứ sử dụng (basis = "trich-dan-binh-luan").
Xem .claude/rules/chinh-xac-va-ban-quyen.md mục 3.
Google Play: không có API chính thức; dùng thư viện google-play-scraper (pip install google-play-scraper).
Từ một số mạng, Google Play khu vực VN trả 404; script tự thử khu vực US và ghi rõ khu vực vào manifest.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (AppReel asset fetcher)"}
ITUNES = "https://itunes.apple.com"


def get_json(url: str, attempts: int = 3):
    for i in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            if i == attempts:
                raise
            print(f"  thử lại lần {i} sau lỗi {e}")
            time.sleep(3 * i)


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
            shutil.copyfileobj(r, f)
        return dest.stat().st_size > 0
    except Exception as e:  # noqa: BLE001 – lỗi một file không được làm dừng cả bước
        print(f"  ! không tải được {url}: {e}")
        return False


def norm(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "", s)


def image_size(path: Path) -> tuple[int, int] | None:
    """Đọc kích thước JPEG/PNG không cần thư viện ngoài."""
    data = path.read_bytes()[:65536]
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    i = 2
    while i < len(data) - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2):
            return int.from_bytes(data[i + 7:i + 9], "big"), int.from_bytes(data[i + 5:i + 7], "big")
        i += 2 + int.from_bytes(data[i + 2:i + 4], "big")
    return None


# ---------- App Store ----------

def big_apple(url: str, px: int = 2000) -> str:
    """URL ảnh của Apple có đuôi kích thước (…/406x228bb.png); đổi để lấy bản lớn."""
    return re.sub(r"/\d+x\d+[a-z]*\.(png|jpg|jpeg|webp)$", f"/{px}x0w.jpg", url)


def apple_lookup(app_id: int, country: str = "vn") -> dict | None:
    res = get_json(f"{ITUNES}/lookup?id={app_id}&country={country}&entity=software").get("results") or []
    return res[0] if res else None


def apple_search(name: str, country: str = "vn") -> tuple[dict | None, str]:
    q = urllib.parse.quote(name)
    res = get_json(f"{ITUNES}/search?term={q}&country={country}&entity=software&limit=8").get("results") or []
    # ưu tiên ứng dụng không phải game: tên ứng dụng hay trùng tên game ăn theo
    apps = [r for r in res if r.get("primaryGenreName") != "Games"] or res
    for r in apps:
        if norm(r.get("trackName", "")) == norm(name):
            return r, "exact"
    for r in apps:  # tên trên cửa hàng hay có đuôi quảng cáo: "Notion: Notes, Tasks, AI"
        if norm(r.get("trackName", "")).startswith(norm(name)):
            return r, "exact"
    return (apps[0], "fuzzy") if apps else (None, "not_found")


def apple_age(rating: str | None) -> int:
    m = re.match(r"(\d+)\+", rating or "")
    return int(m.group(1)) if m else 0


# ---------- Google Play ----------

def play_details(package: str, lang: str = "vi") -> tuple[dict | None, str | None]:
    try:
        from google_play_scraper import app  # type: ignore
    except ImportError:
        print("  ! chưa cài google-play-scraper (pip3 install --user google-play-scraper), bỏ qua Google Play")
        return None, None
    for country in ("vn", "us"):
        try:
            return app(package, lang=lang, country=country), country
        except Exception as e:  # noqa: BLE001
            print(f"  Google Play khu vực {country.upper()}: {e}")
    return None, None


def play_search(name: str) -> str | None:
    try:
        from google_play_scraper import search  # type: ignore
    except ImportError:
        return None
    for country in ("vn", "us"):
        try:
            res = search(name, lang="vi", country=country, n_hits=5)
        except Exception:  # noqa: BLE001
            continue
        for r in res:
            if r.get("appId") and norm(r.get("title", "")).startswith(norm(name)):
                return r["appId"]
    return None


def big_play(url: str, px: int = 2000) -> str:
    return re.sub(r"=[swh]\d+.*$", "", url) + f"=w{px}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--screenshots", type=int, default=4)
    ap.add_argument("--only", help="chỉ lấy lại cho một ứng dụng (tên, app_store_id hoặc play_package)")
    args = ap.parse_args()

    project = Path(args.project)
    script = json.loads((project / "script.json").read_text(encoding="utf-8"))
    assets_dir = project / "assets"
    assets_dir.mkdir(exist_ok=True)
    manifest_path = assets_dir / "manifest.json"
    manifest = (json.loads(manifest_path.read_text(encoding="utf-8"))
                if manifest_path.exists() else {"apps": {}, "scenes": {}, "warnings": []})
    manifest.setdefault("apps", {})
    manifest.setdefault("scenes", {})
    # giữ cảnh báo của các bước khác (cắt clip quay màn hình), chỉ thay cảnh báo cũ của script này
    manifest["warnings"] = [w for w in manifest.get("warnings", []) if not w.startswith("[cửa hàng]")]

    def warn(msg: str) -> None:
        manifest["warnings"].append(f"[cửa hàng] {msg}")

    seen: dict[str, str] = {}
    for sc in script.get("scenes", []):
        app = sc.get("app")
        if not app:
            continue
        name = app.get("name", "")
        ios_id, pkg = app.get("app_store_id"), app.get("play_package")
        if app.get("platform") == "web":
            warn(f"{name}: công cụ web, không có trên cửa hàng; dùng ảnh tự chụp hoặc clip quay màn hình")
            continue
        if args.only and args.only not in (name, str(ios_id), str(pkg)):
            continue
        if name in seen:
            manifest["scenes"][str(sc["id"])] = seen[name]
            continue

        # 1. App Store Việt Nam
        apple, match = None, "given"
        try:
            if app.get("platform") == "android":
                pass  # ứng dụng chỉ có trên Android: bỏ qua App Store, tránh khớp nhầm ứng dụng cùng tên
            elif ios_id:
                apple = apple_lookup(int(ios_id))
                if apple is None:
                    warn(f"{name}: app_store_id {ios_id} không có trên App Store Việt Nam")
            else:
                apple, match = apple_search(name)
        except Exception as e:  # noqa: BLE001
            warn(f"{name}: lỗi gọi App Store: {e}")

        # 2. Google Play (số liệu lượt tải, quảng cáo, mua trong ứng dụng; ảnh khi App Store không có)
        play, play_country = None, None
        if not pkg:
            pkg = play_search(name)
        if pkg:
            play, play_country = play_details(pkg)

        if apple is None and play is None:
            warn(f"{name}: không tìm thấy trên App Store VN và Google Play; dùng press kit hoặc clip tự quay màn hình")
            print(f"- {name}: không tìm thấy trên cửa hàng")
            continue

        key = f"ios-{apple['trackId']}" if apple else f"gp-{pkg}"
        seen[name] = key
        manifest["scenes"][str(sc["id"])] = key
        gdir = assets_dir / key
        gdir.mkdir(exist_ok=True)
        if apple:
            (gdir / "appstore.json").write_text(json.dumps(apple, ensure_ascii=False, indent=2), encoding="utf-8")
        if play:
            play = {k: v for k, v in play.items() if k not in ("comments", "descriptionHTML")}
            (gdir / "googleplay.json").write_text(json.dumps(play, ensure_ascii=False, indent=2, default=str),
                                                  encoding="utf-8")
        print(f"- {name}: {key} ({match}){' + Google Play ' + play_country.upper() if play else ''}")

        holders = set()
        if apple:
            holders.update(x for x in (apple.get("artistName"), apple.get("sellerName")) if x)
        if play and play.get("developer"):
            holders.add(play["developer"])
        age = apple_age(apple.get("contentAdvisoryRating")) if apple else 0
        entry = {
            "name": name,
            "store_name": (apple or {}).get("trackName") or (play or {}).get("title"),
            "match": match,
            "origin": "app-store" if apple else "google-play",
            "source": (apple or {}).get("trackViewUrl", "").split("?")[0] or (play or {}).get("url"),
            "sources": [u for u in [(apple or {}).get("trackViewUrl", "").split("?")[0],
                                    f"https://play.google.com/store/apps/details?id={pkg}" if play else None] if u],
            # cửa hàng không cấp giấy phép: ảnh thuộc nhà phát triển/phát hành
            "rights_holder": sorted(holders),
            "basis": "trich-dan-binh-luan",
            "required_age": age,
            "mature": ["17+ (App Store)"] if age >= 17 else [],
            "store": {
                "app_store_vn": {
                    "id": apple.get("trackId"), "price": apple.get("formattedPrice"),
                    "size_mb": round(int(apple.get("fileSizeBytes") or 0) / 1_000_000, 1),
                    "rating": round(float(apple.get("averageUserRating") or 0), 2),
                    "rating_count": apple.get("userRatingCount"),
                    "age": apple.get("contentAdvisoryRating"), "min_ios": apple.get("minimumOsVersion"),
                    "released": apple.get("releaseDate"), "updated": apple.get("currentVersionReleaseDate"),
                } if apple else None,
                "google_play": {
                    "package": pkg, "region": play_country.upper(), "price": play.get("price"),
                    "currency": play.get("currency"), "free": play.get("free"), "installs": play.get("installs"),
                    "rating": round(float(play.get("score") or 0), 2), "rating_count": play.get("ratings"),
                    "iap": play.get("offersIAP"), "iap_range": play.get("inAppProductPrice"),
                    "ads": play.get("containsAds"), "age": play.get("contentRating"),
                    "released": play.get("released"),
                } if play else None,
            },
            "fetched": time.strftime("%Y-%m-%d %H:%M"),
            "icon": None, "header": None, "screenshots": [],
            # clip quay màn hình do cat_quay_man_hinh.py gắn; giữ lại khi lấy lại ảnh cửa hàng
            "clip": ((manifest["apps"].get(key) or {}).get("clip")),
        }
        if apple:
            entry["store"]["app_store_vn"].update({
                "version": apple.get("version"), "genre": apple.get("primaryGenreName"),
                "languages": apple.get("languageCodesISO2A"),
                "vietnamese": "VI" in (apple.get("languageCodesISO2A") or []),
            })
        if play:
            entry["store"]["google_play"].update({
                "genre": play.get("genre"), "version": play.get("version"), "updated": play.get("updated"),
            })
        if play and play_country != "vn":
            warn(f"{name}: Google Play VN không truy cập được, số liệu Google Play là khu vực {play_country.upper()} "
                 f"(giá khác VN; lượt tải là toàn cầu)")
        if match == "fuzzy":
            warn(f"'{name}' khớp gần đúng với '{entry['store_name']}' trên App Store, cần xác nhận")
        if entry["mature"]:
            warn(f"{name}: App Store xếp {apple.get('contentAdvisoryRating')}; xem kỹ từng ảnh trước khi đưa vào hook, ảnh bìa")
        if apple and "VI" not in (apple.get("languageCodesISO2A") or []):
            warn(f"{name}: App Store không ghi hỗ trợ tiếng Việt; nói rõ trong lời đọc nếu ứng dụng chỉ có tiếng Anh")
        if (apple or {}).get("primaryGenreName") == "Finance" or (play or {}).get("genre") == "Finance":
            warn(f"{name}: ứng dụng tài chính; kiểm tra giấy phép hoạt động tại Việt Nam (.claude/rules/chinh-xac-va-ban-quyen.md mục 7)")

        # icon
        icon_url = (apple or {}).get("artworkUrl512") or (play or {}).get("icon")
        if icon_url and download(icon_url if apple else big_play(icon_url, 512), gdir / "icon.jpg"):
            entry["icon"] = f"assets/{key}/icon.jpg"

        # screenshot: App Store (iPhone, rồi iPad) trước, Google Play sau
        urls = []
        if apple:
            urls = [big_apple(u) for u in (apple.get("screenshotUrls") or []) + (apple.get("ipadScreenshotUrls") or [])]
        if not urls and play:
            urls = [big_play(u) for u in play.get("screenshots") or []]
        landscape = None
        for i, u in enumerate(urls[: args.screenshots], 1):
            dest = gdir / f"shot-{i}.jpg"
            if download(u, dest):
                entry["screenshots"].append(f"assets/{key}/shot-{i}.jpg")
                size = image_size(dest)
                if landscape is None and size and size[0] > size[1]:
                    landscape = f"assets/{key}/shot-{i}.jpg"
        # header dùng cho dải ngang 1080×500: ưu tiên screenshot ngang, không có thì dùng icon
        entry["header"] = landscape or entry["icon"] or (entry["screenshots"] or [None])[0]
        if entry["screenshots"] and landscape is None:
            warn(f"{name}: toàn screenshot dọc (bình thường với ứng dụng): top-list dùng bố cục khung điện thoại; "
                 f"tier-board cắt dải ngang, nên ưu tiên clip quay màn hình hoặc crop")
        if not entry["screenshots"]:
            warn(f"{name}: không có screenshot trên cửa hàng")
        warn(f"{name}: ảnh cửa hàng là ảnh quảng bá; mở từng ảnh, loại ảnh có huy hiệu App Store/Google Play, "
             f"chữ quảng cáo nói quá hoặc nhân vật người thật")
        manifest["apps"][key] = entry

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nĐã ghi {manifest_path}")
    for w in manifest["warnings"]:
        print(f"CẢNH BÁO: {w}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
