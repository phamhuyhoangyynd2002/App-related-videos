/* AppReel – hàm dùng chung cho mọi template HyperFrames (top-list, news, tier-list).
 *
 * Hợp đồng dữ liệu: prepare_render.py điền <script id="appreel-data" type="application/json">
 * bằng { script, timeline } (script.json + timeline.json của dự án; timeline.music = null).
 * Mọi mốc thời gian lấy từ timeline: scenes[].start/duration, scenes[].shots[].at/end,
 * scenes[].voice, scenes[].verdict, captions[]. Không tự tính lại thời gian từ chữ.
 *
 * Tài nguyên hình: timeline.scenes[].media (build_timeline.py chép từ assets/manifest.json):
 *   { header, icon, screenshots: [...], clip } – đường dẫn tương đối "assets/<key>/...". clip là video tự quay
 *   màn hình ứng dụng (cat_quay_man_hinh.py), phát tắt tiếng.
 *
 * Chỉ để chụp thử: thêm "debug": { "safeZone": true } vào dữ liệu để bật lớp phủ vùng an toàn.
 * prepare_render.py không bao giờ ghi khoá này, nên bản render thật không có lớp phủ.
 *
 * Không dùng Math.random, Date.now, gọi mạng; timeline đăng ký sau khi font tải xong.
 */
(function () {
  "use strict";

  var FONT = "Be Vietnam Pro";
  var EASE_IN = "expo.out";
  var EASE_FLOW = "power2.inOut";
  // Màu con dấu theo nhãn (nhãn khai báo ở kenh/ho-so-kenh.md); nhãn khác dùng màu accent
  var STAMP_COLORS = {
    "CÀI NGAY": "var(--verdict-play)",
    "DÙNG THỬ": "var(--accent)",
    "CHỜ GIẢM GIÁ": "var(--accent)",
    "BỎ QUA": "var(--accent-2)",
  };

  function readData() {
    var tag = document.getElementById("appreel-data");
    var raw = tag ? tag.textContent.trim() : "";
    if (!raw) throw new Error("AppReel: thẻ appreel-data trống – chạy prepare_render.py trước khi xem/render");
    var data = JSON.parse(raw);
    if (!data.timeline || !data.script) throw new Error("AppReel: dữ liệu thiếu timeline hoặc script");
    return data;
  }

  function el(tag, cls, text, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    if (parent) parent.appendChild(node);
    return node;
  }

  function timed(node, start, duration, track) {
    node.setAttribute("data-start", String(round(start)));
    node.setAttribute("data-duration", String(round(duration)));
    if (track !== undefined) node.setAttribute("data-track-index", String(track));
    return node;
  }

  function round(x) {
    return Math.round(x * 1000) / 1000;
  }

  /* Thời điểm bắt đầu hiệu ứng vào để hình hiện xong đúng lúc `at` (không sớm hơn `floor`). */
  function enterAt(at, dur, floor) {
    return Math.max(floor || 0, at - dur);
  }

  /* Chữ trên màn hình của cảnh item bỏ tiền tố thứ hạng "#3 " vì số hạng đã có khối riêng. */
  function stripRank(text) {
    return String(text || "").replace(/^#\s*\d+\s*[:.\-–·•|]?\s*/, "").trim();
  }

  /* Tên ứng dụng hiển thị: bỏ phụ đề sau dấu ":" khi tên quá dài cho một dòng. */
  function shortName(name, max) {
    name = String(name || "");
    if (name.length > (max || 24)) {
      var cut = name.split(/:|\s[-–—]\s/)[0].trim();
      // cắt giữa ngoặc ("Notion (Notes: Docs, Tasks)") thì bỏ luôn phần trong ngoặc, không để "(" mở
      if ((cut.match(/\(/g) || []).length > (cut.match(/\)/g) || []).length) cut = cut.slice(0, cut.lastIndexOf("(")).trim();
      if (cut && cut.length < name.length) return cut;
    }
    return name;
  }

  /* Tách câu cuối của lời đọc (dùng cho câu kêu gọi ở outro). */
  function lastSentence(text) {
    var parts = String(text || "").match(/[^.!?…]+[.!?…]*/g) || [];
    return parts.length ? parts[parts.length - 1].trim() : "";
  }

  /* Đường dẫn ảnh cho một nhịp hình; null nếu cảnh không có tài nguyên đó. */
  function mediaFor(media, show) {
    if (!media) return null;
    if (show === "header") return media.header || (media.screenshots || [])[0] || null;
    if (show === "icon") return media.icon || media.header || null;
    var m = /^screenshot:(\d+)$/.exec(show);
    if (m) {
      var shots = media.screenshots || [];
      if (!shots.length) return media.header || null;
      return shots[(parseInt(m[1], 10) - 1) % shots.length];
    }
    return null;
  }

  /* Vùng cắt của một ảnh: media.crops["assets/<key>/shot-N.jpg"] = { x, y, w, h, iw, ih } (px trên ảnh gốc).
     Dùng để bỏ chữ quảng bá trên ảnh cửa hàng hoặc giữ trọn khung điện thoại dọc. Không có thì null. */
  function cropFor(media, src) {
    return (media && media.crops && src && media.crops[src]) || null;
  }

  /* Đặt ảnh sao cho vùng cắt phủ kín khung W×H (giống object-fit: cover nhưng trên vùng cắt).
     Gọi trong fit() (khung đã có kích thước). Tâm phóng (transform-origin) đặt ở tâm vùng cắt để zoom chậm
     không kéo phần đã cắt (chữ quảng bá) vào khung. */
  function applyCrop(img, crop, W, H) {
    if (!crop || !W || !H) return false;
    var s = Math.max(W / crop.w, H / crop.h);
    var left = (W - crop.w * s) / 2 - crop.x * s;
    var top = (H - crop.h * s) / 2 - crop.y * s;
    img.style.objectFit = "fill";
    img.style.right = "auto";
    img.style.bottom = "auto";
    img.style.left = round(left) + "px";
    img.style.top = round(top) + "px";
    img.style.width = round(crop.iw * s) + "px";
    img.style.height = round(crop.ih * s) + "px";
    img.style.transformOrigin = round((crop.x + crop.w / 2) * s) + "px " + round((crop.y + crop.h / 2) * s) + "px";
    return true;
  }

  /* Vùng cắt riêng của một nhịp hình: timeline.scenes[].shots[].crop = [x, y, w, h] (px trên ảnh gốc).
     Trả về { x, y, w, h } hoặc null nếu shot không có / sai dạng. */
  function shotCrop(shot) {
    var c = shot && shot.crop;
    if (!c || c.length !== 4) return null;
    var r = { x: +c[0], y: +c[1], w: +c[2], h: +c[3] };
    if (!(r.w > 0 && r.h > 0) || !isFinite(r.x) || !isFinite(r.y)) return null;
    return r;
  }

  /* Kích thước gốc của ảnh: ưu tiên iw/ih trong media.crops (manifest), không thì naturalWidth (đã chờ ảnh tải). */
  function imageSize(img, media, src) {
    var mc = cropFor(media, src);
    if (mc && mc.iw && mc.ih) return { w: mc.iw, h: mc.ih };
    return { w: img.naturalWidth || 0, h: img.naturalHeight || 0 };
  }

  /* Đặt ảnh trong khung W×H theo một vùng (px trên ảnh gốc), không méo:
   *   mode "cover"  : vùng phủ kín ô đích (cắt bớt phần thừa của vùng), như object-fit: cover.
   *   mode "contain": vùng nằm trọn trong ô đích, phần thiếu tỉ lệ được mở rộng quanh tâm vùng (crop của nhịp hình).
   * opts.box    : ô đích trong khung {x,y,w,h} (mặc định cả khung), vd. phần khung không bị thẻ thông tin che.
   * opts.bounds : phần ảnh được phép lộ ra {x,y,w,h} (mặc định cả ảnh), vd. vùng cắt manifest để không lộ chữ quảng bá.
   * opts.coverBox: chỉ bắt buộc phủ kín ô đích (phần khung còn lại đang bị thứ khác che).
   * opts.dry    : chỉ trả hình học, không đặt style.
   * Ảnh (trong bounds) luôn phủ kín cả khung: phóng tối thiểu tới mức đó và dời tâm khi vùng sát mép.
   * Trả về hình học { left, top, s, fx, fy } (fx, fy: tâm vùng trong toạ độ của ảnh đã phóng) để tween bằng x/y/scale
   * với transform-origin 0 0. Gọi trong fit() khi khung đã có kích thước. */
  function placeCrop(img, region, iw, ih, W, H, opts) {
    opts = opts || {};
    if (!region || !iw || !ih || !W || !H) return null;
    // vùng lấn ra ngoài ảnh (vd. crop viết cho ảnh lớn hơn): kẹp vào trong ảnh, để tâm vùng không rơi ra ngoài
    var rx0 = Math.max(0, Math.min(iw - 1, region.x)), ry0 = Math.max(0, Math.min(ih - 1, region.y));
    region = { x: rx0, y: ry0, w: Math.max(1, Math.min(iw, region.x + region.w) - rx0), h: Math.max(1, Math.min(ih, region.y + region.h) - ry0) };
    var box = opts.box || { x: 0, y: 0, w: W, h: H };
    var b = opts.bounds || { x: 0, y: 0, w: iw, h: ih };
    // vùng cần lộ lấn ra ngoài bounds (người viết kịch bản chọn có chủ ý): nới bounds vừa đủ bao vùng đó
    var bx0 = Math.max(0, Math.min(b.x, region.x)), by0 = Math.max(0, Math.min(b.y, region.y));
    var bx1 = Math.min(iw, Math.max(b.x + b.w, region.x + region.w)), by1 = Math.min(ih, Math.max(b.y + b.h, region.y + region.h));
    b = { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 };
    var s = opts.mode === "contain" ? Math.min(box.w / region.w, box.h / region.h) : Math.max(box.w / region.w, box.h / region.h);
    // ô cần phủ kín: cả khung, hoặc chỉ ô đích (opts.coverBox: phần khung ngoài ô đang bị thẻ che)
    var cov = opts.coverBox ? box : { x: 0, y: 0, w: W, h: H };
    s = Math.max(s, cov.w / b.w, cov.h / b.h);
    var cx = region.x + region.w / 2;
    var cy = region.y + region.h / 2;
    var left = box.x + box.w / 2 - cx * s;
    var top = box.y + box.h / 2 - cy * s;
    left = Math.min(cov.x - b.x * s, Math.max(cov.x + cov.w - (b.x + b.w) * s, left));
    top = Math.min(cov.y - b.y * s, Math.max(cov.y + cov.h - (b.y + b.h) * s, top));
    var geo = { left: left, top: top, s: s, w: iw * s, h: ih * s, fx: cx * s, fy: cy * s };
    if (opts.dry || !img) return geo; // chỉ tính, không đặt (vd. vị trí sau khi thẻ che lui đi)
    img.style.objectFit = "fill";
    img.style.right = "auto";
    img.style.bottom = "auto";
    img.style.left = round(left) + "px";
    img.style.top = round(top) + "px";
    img.style.width = round(iw * s) + "px";
    img.style.height = round(ih * s) + "px";
    img.style.transformOrigin = "0px 0px";
    return geo;
  }

  /* Chờ mọi <img> trong root tải xong (để đo naturalWidth trong fit). Ảnh lỗi không chặn dựng cảnh. */
  function waitImages(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img"));
    return Promise.all(
      imgs.map(function (img) {
        if (img.complete && img.naturalWidth) return null;
        return new Promise(function (res) {
          img.addEventListener("load", res, { once: true });
          img.addEventListener("error", res, { once: true });
        });
      })
    );
  }

  /* Ảnh của cảnh là ảnh dọc (khung điện thoại): media.orientation = "portrait", hoặc mọi vùng cắt đều dọc. */
  function isPortraitMedia(media) {
    if (!media) return false;
    if (media.orientation) return media.orientation === "portrait";
    var keys = media.crops ? Object.keys(media.crops) : [];
    return keys.length > 0 && keys.every(function (k) { return media.crops[k].h > media.crops[k].w; });
  }

  function isMediaShow(show) {
    return show === "header" || show === "icon" || show === "clip" || /^screenshot:\d+$/.test(show);
  }

  /* Bề rộng thật của chữ (dòng dài nhất), không phải bề rộng khối: khối chữ rộng hơn maxWidth (vd. left:0;right:0)
     nhưng chữ ngắn thì không bị co oan. Bỏ ảnh hưởng transform bằng tỉ lệ rect / offsetWidth. */
  function contentWidth(node) {
    var r = document.createRange();
    r.selectNodeContents(node);
    var w = r.getBoundingClientRect().width;
    var box = node.getBoundingClientRect().width;
    var k = box && node.offsetWidth ? node.offsetWidth / box : 1;
    return Math.max(w * k, node.scrollWidth > node.clientWidth + 1 ? node.scrollWidth : 0);
  }

  /* Thu nhỏ cỡ chữ (bước 2px) tới khi vừa khung; gọi sau khi font đã tải. */
  function fitText(node, opts) {
    var min = opts.minPx || 36;
    var size = parseFloat(getComputedStyle(node).fontSize);
    var guard = 0;
    while (guard++ < 80 && size > min) {
      var tooWide = opts.maxWidth && contentWidth(node) > opts.maxWidth + 1;
      var tooTall = opts.maxHeight && node.scrollHeight > opts.maxHeight + 1;
      if (!tooWide && !tooTall) break;
      size -= 2;
      node.style.fontSize = size + "px";
    }
    return size;
  }

  /* Chia chữ thành tối đa 2 dòng đẹp khi một dòng không vừa maxWidth: chọn chỗ ngắt cho hai dòng dài gần bằng nhau,
     ưu tiên ngắt trước "(" và sau "," "·" (không để một chữ lẻ rơi xuống dòng dưới). Mỗi dòng là một span khối
     (không dùng <br>). Trả về true nếu đã chia. Gọi sau khi font đã tải và cỡ chữ đã chốt. */
  function wrapBalanced(node, maxWidth) {
    var text = node.getAttribute("data-wrap-text") || node.textContent;
    node.setAttribute("data-wrap-text", text);
    node.textContent = text;
    node.style.whiteSpace = "nowrap";
    if (contentWidth(node) <= maxWidth + 1) return false;
    var words = text.split(" ");
    if (words.length < 2) { node.style.whiteSpace = "normal"; return false; }
    var probe = el("span", null, "", node.parentNode);
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;";
    var cs = getComputedStyle(node);
    probe.style.font = cs.font;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.style.textTransform = cs.textTransform;
    function w(t) { probe.textContent = t; return probe.offsetWidth; }
    var best = null;
    for (var i = 1; i < words.length; i++) {
      var a = words.slice(0, i).join(" ");
      var b = words.slice(i).join(" ");
      var dot = /^[·•|]$/.test(words[i]);
      if (dot) b = words.slice(i + 1).join(" "); // ngắt ở dấu chấm giữa đứng riêng: bỏ luôn dấu đó
      if (!b) continue;
      var wa = w(a), wb = w(b);
      var score = Math.max(wa, wb);
      if (dot) score -= 160;
      if (/^[(\[]/.test(words[i])) score -= 120; // ngắt trước ngoặc
      if (/^[→➜⟶]$/.test(words[i])) score -= 300; // ngắt trước mũi tên ("#10 APP STORE" / "→ #2")
      if (/^[→➜⟶]$/.test(words[i - 1])) score += 300; // không để mũi tên ở cuối dòng
      if (/^[·•|]$/.test(words[i - 1])) score += 300; // không để dấu chấm giữa ở cuối dòng
      if (/[,:;]$/.test(words[i - 1])) score -= 80; // ngắt sau dấu phẩy
      if (b.indexOf(" ") < 0 && b.length <= 4 && !/\d/.test(b)) score += 400; // tránh chữ lẻ (số đứng riêng thì được)
      if (words.slice(0, i).length === 1 && a.length <= 3) score += 400;
      if (!best || score < best.score) best = { a: a, b: b, score: score };
    }
    probe.parentNode.removeChild(probe);
    node.textContent = "";
    el("span", "gr-line", best.a, node).style.display = "block";
    el("span", "gr-line", best.b, node).style.display = "block";
    return true;
  }

  /* Mũi tên "→" (và ➜ ⟶) trong chữ: Be Vietnam Pro không có glyph này, trình duyệt rơi về phông khác nét mảnh.
     Thay bằng mũi tên SVG nét đậm cùng màu chữ (currentColor), cao bằng chữ in hoa, đứng trên đường chân chữ.
     Gọi sau wrapBalanced (hàm đó đặt lại textContent) và trước fitText. Trả về số mũi tên đã thay. */
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ARROW_RE = /([→➜⟶])/;
  function arrowNode() {
    var wrap = el("span", "gr-arrow");
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 70");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M4 35 H84 M54 8 L86 35 L54 62");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "17");
    path.setAttribute("stroke-linejoin", "miter");
    path.setAttribute("stroke-linecap", "butt");
    svg.appendChild(path);
    wrap.appendChild(svg);
    return wrap;
  }
  function drawArrows(node) {
    var found = [];
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (ARROW_RE.test(walker.currentNode.nodeValue)) found.push(walker.currentNode);
    var n = 0;
    found.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      tn.nodeValue.split(ARROW_RE).forEach(function (part) {
        if (!part) return;
        if (ARROW_RE.test(part) && part.length === 1) { frag.appendChild(arrowNode()); n++; }
        else frag.appendChild(document.createTextNode(part));
      });
      tn.parentNode.replaceChild(frag, tn);
    });
    return n;
  }

  function ensureFonts() {
    var weights = ["500", "600", "800", "900"];
    return Promise.all(
      weights.map(function (w) {
        return document.fonts.load(w + ' 96px "' + FONT + '"', "Ạà Ỹ ờ đ 0123");
      })
    ).then(function () {
      var loaded = [];
      document.fonts.forEach(function (f) {
        if (f.family.replace(/"/g, "") === FONT && f.status === "loaded") loaded.push(String(f.weight));
      });
      var ok = document.fonts.check('900 96px "' + FONT + '"') && loaded.indexOf("900") >= 0 && loaded.indexOf("800") >= 0;
      if (!ok) throw new Error('AppReel: font "' + FONT + '" chưa tải được (kiểm tra _shared/fonts và @font-face trong brand.css)');
    });
  }

  /* ---------- Thành phần dùng chung theo frame.md ---------- */

  function buildBackground(root, total) {
    var bg = el("div", "clip gr-root-bg", null, root);
    timed(bg, 0, total, 0);
    return bg;
  }

  /* logo-bug: logo + tên kênh, đứng yên suốt video (có từ khung 0), nảy nhẹ một lần ở 0,3s.
     Tên kênh, lời hứa và logo điền bằng /thiet-lap-kenh (kenh/ho-so-kenh.md); chưa có logo thì ảnh tự ẩn. */
  var LOGO_DEFAULT = "_shared/logo.png";
  var BRAND_NAME = "TÊN KÊNH";
  var BRAND_TAG = "Lời hứa của kênh";

  function hideIfMissing(img) {
    img.onerror = function () { img.style.display = "none"; };
  }

  function buildLogoBug(root, total, logoSrc) {
    var wrap = el("div", "clip gr-logo-layer", null, root);
    timed(wrap, 0, total, 20);
    wrap.setAttribute("data-layout-ignore", "");
    var bug = el("div", "gr-logo-bug", null, wrap);
    var img = el("img", "gr-logo-img", null, bug);
    hideIfMissing(img);
    img.src = logoSrc || LOGO_DEFAULT;
    img.alt = "";
    el("span", "gr-logo-text", BRAND_NAME, bug);
    return {
      animate: function (tl) {
        tl.fromTo(img, { scale: 1, rotation: 0 }, { scale: 1.18, rotation: -6, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 }, 0.3);
      },
    };
  }

  /* end-card: màn kết chuẩn, vào lúc đọc câu ký tên (từ "theo" cuối cùng của cảnh cuối) và giữ tới hết video.
     Tắt bằng "end_card": false trong script.json. */
  function buildEndCard(root, scenes, total, logoSrc, script) {
    if (script.end_card === false || !scenes.length) return null;
    var last = scenes[scenes.length - 1];
    var at = Math.max(last.start, total - 2.8);
    var words = last.words || [];
    for (var i = words.length - 1; i >= 0; i--) {
      if (String(words[i].text).toLowerCase().replace(/[^a-zà-ỹđ]/g, "") === "theo") { at = words[i].start; break; }
    }
    at = Math.min(at, total - 1.2);
    // script.end_card_max (giây, tuỳ chọn): màn kết không dài quá mức này; chữ cảnh cuối (câu hỏi) giữ tới lúc đó
    var ecMax = parseFloat(script.end_card_max);
    if (isFinite(ecMax) && ecMax > 0) at = Math.max(at, total - ecMax);
    var k = Math.min(1, (total - at) / 1.6); // màn kết ngắn: nén nhịp vào của logo, tên, kêu gọi
    var layer = el("div", "clip gr-end-layer", null, root);
    timed(layer, at, total - at, 26);
    layer.setAttribute("data-layout-allow-overlap", "");
    var bg = el("div", "gr-end-bg", null, layer);
    var stack = el("div", "gr-end-stack", null, layer);
    var img = el("img", "gr-end-logo", null, stack);
    hideIfMissing(img);
    img.src = logoSrc || LOGO_DEFAULT;
    img.alt = "";
    var name = el("div", "gr-end-name", BRAND_NAME, stack);
    var tag = el("div", "gr-end-tag", BRAND_TAG, stack);
    // "TẬP SAU" chỉ khi video thuộc một series (script.series); không thì lời mời chung
    var ctaText = script.end_card_cta || (script.series ? "THEO DÕI ĐỂ XEM TẬP SAU" : "THEO DÕI ĐỂ XEM THÊM");
    var cta = el("div", "gr-end-cta", ctaText, stack);
    // màn kết phủ toàn khung là chủ ý: báo cho `hyperframes check`
    [layer, bg, stack, img, name, tag, cta].forEach(function (n) {
      n.setAttribute("data-layout-allow-overlap", "");
      n.setAttribute("data-layout-allow-occlusion", "");
    });
    return {
      at: at,
      fit: function () {
        fitText(name, { maxWidth: 860, minPx: 80 });
        wrapBalanced(tag, 860);
      },
      animate: function (tl) {
        // nền kín hẳn để phụ đề phía dưới không lộ mờ qua màn kết
        tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, at);
        // logo to hiện thì logo nhỏ ở góc lui đi (không hai logo cùng lúc)
        var bug = root.querySelector(".gr-logo-bug");
        if (bug) tl.to(bug, { opacity: 0, duration: 0.15, ease: "power2.in" }, at);
        tl.fromTo(img, { opacity: 0, scale: 0.4, rotation: -12 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.8)" }, at + 0.05);
        tl.fromTo(name, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.3 * k, ease: EASE_IN }, at + 0.35 * k);
        tl.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: 0.25 * k, ease: "power2.out" }, at + 0.65 * k);
        tl.fromTo(cta, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.25 * k, ease: "back.out(2)" }, at + 0.9 * k);
        tl.fromTo(img, { y: 0 }, { y: -14, duration: Math.max(0.5, total - at - 0.45), ease: EASE_FLOW, immediateRender: false }, at + 0.45);
      },
    };
  }

  function buildVoices(root, scenes) {
    scenes.forEach(function (s) {
      if (!s.voice || !s.voice.src) return;
      // prepare_render.py đã ghi sẵn <audio id="vo-N"> vào HTML tĩnh (renderer chỉ đọc audio tĩnh): không tạo trùng.
      if (document.getElementById("vo-" + s.id)) return;
      var a = el("audio", null, null, root);
      a.id = "vo-" + s.id;
      a.src = s.voice.src;
      a.preload = "auto";
      timed(a, s.voice.start, s.voice.duration, 30 + (s.id % 2));
    });
  }

  /* Từ khoá phụ đề: script.scenes[].emphasis (danh sách từ) → tô accent, to hơn, giữ suốt cụm. */
  function normWord(t) {
    return String(t || "").toLowerCase().normalize("NFC").replace(/[.,!?…:;"'()]/g, "").trim();
  }

  function buildCaptions(root, captions, total, keywords) {
    keywords = keywords || {};
    var layer = el("div", "clip gr-caption-layer", null, root);
    timed(layer, 0, total, 21);
    layer.setAttribute("data-layout-allow-caption-zone", "");
    var groups = (captions || []).map(function (c, i) {
      var g = el("div", "gr-caption", null, layer);
      g.id = "cap-" + i;
      var line = el("div", "gr-caption-line", null, g);
      var spans = (c.words || []).map(function (w, j) {
        if (j) line.appendChild(document.createTextNode(" "));
        return el("span", keywords[normWord(w.text)] ? "gr-word gr-word-key" : "gr-word", w.text, line);
      });
      return { data: c, node: g, line: line, spans: spans };
    });
    /* Video dọc: phụ đề MỘT dòng (build_timeline.py đã tách cụm theo bề rộng font). Lưới an toàn: cụm vẫn quá rộng thì
       co chữ (tối thiểu 60px); vẫn không vừa mới cho xuống dòng, kèm cảnh báo để sửa ở build_timeline.py. */
    function fit() {
      var vertical = root.classList.contains("is-vertical");
      groups.forEach(function (g) {
        var max = g.node.clientWidth - 12; // viền 12px lấn 6px mỗi bên
        if (!vertical || !(max > 0)) return;
        g.line.style.whiteSpace = "nowrap";
        if (contentWidth(g.line) <= max + 1) return;
        fitText(g.line, { maxWidth: max, minPx: 60 });
        if (contentWidth(g.line) > max + 1) {
          g.line.style.whiteSpace = "normal";
          console.warn("AppReel: phụ đề quá rộng cho một dòng: '" + g.data.text + "'");
        }
      });
    }
    return { fit: fit, animate: function animate(tl) {
      groups.forEach(function (g) {
        var c = g.data;
        tl.fromTo(g.node, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.1, ease: "power3.out" }, c.start);
        tl.to(g.node, { opacity: 0, duration: 0.04, ease: "power2.inOut" }, Math.max(c.start + 0.1, c.end - 0.04));
        (c.words || []).forEach(function (w, j) {
          if (keywords[normWord(w.text)]) return; // từ khoá giữ màu accent suốt cụm
          var next = c.words[j + 1];
          tl.set(g.spans[j], { color: "#FFC23D" }, w.start);
          tl.set(g.spans[j], { color: "#FFFFFF" }, next ? next.start : Math.min(w.end, c.end));
        });
      });
    } };
  }

  /* Con dấu phán quyết: một lần mỗi video, vào xong đúng verdict.at, giữ tới hết cảnh.
   * Mặc định tâm ở 45% chiều cao (frame.md). Bố cục cảnh có tựa mục/thẻ thông tin nằm đúng dải đó (vd. top-list mp:
   * cột chữ trái + ảnh dọc phải) đặt data-stamp-center-y (px) và data-stamp-scale trên nút cảnh trong fit()
   * để con dấu nằm ở chỗ không che chữ (mp: thay chỗ số hạng). */
  function buildVerdictStamp(root, scene, node) {
    var v = scene.verdict;
    if (!v || !v.label) return null;
    var dur = 0.18;
    var start = Math.max(scene.start, v.at - dur);
    var layer = el("div", "clip gr-stamp-layer", null, root);
    timed(layer, start, scene.end - start, 22);
    var stamp = el("div", "gr-stamp", null, layer);
    stamp.setAttribute("data-layout-allow-occlusion", "");
    stamp.setAttribute("data-layout-allow-overlap", "");
    stamp.style.color = STAMP_COLORS[v.label] || "var(--accent)";
    // gag (sticker, nhãn zoom) không được nằm dưới con dấu
    stamp.setAttribute("data-gag-avoid", "");
    stamp.setAttribute("data-avoid-scene", String(scene.id));
    stamp.setAttribute("data-avoid-from", String(round(start)));
    var txt = el("span", "gr-stamp-text", v.label, stamp);
    txt.setAttribute("data-layout-allow-overlap", "");
    var S = 1; // cỡ con dấu; bố cục cảnh có thể đặt data-stamp-scale (vd. top-list mp: 0.72)
    return {
      fit: function () {
        // bố cục cảnh đặt data-stamp-center-y trong fit() của nó (chạy trước), nên đọc ở đây
        var cy = node ? parseFloat(node.getAttribute("data-stamp-center-y")) : NaN;
        if (isFinite(cy)) stamp.style.top = Math.round(cy - 120) + "px";
        var sc = node ? parseFloat(node.getAttribute("data-stamp-scale")) : NaN;
        if (isFinite(sc) && sc > 0) S = sc;
        fitText(txt, { maxWidth: 700, minPx: 72 });
        // tâm ngang tuỳ chọn; giữ mép phải (đã thu cỡ S) trong vùng an toàn x ≤ 930
        var cx = node ? parseFloat(node.getAttribute("data-stamp-center-x")) : NaN;
        if (isFinite(cx)) {
          var w = stamp.offsetWidth || 820;
          cx = Math.max(60 + (w * S) / 2, Math.min(cx, 930 - (w * S) / 2 - 10));
          stamp.style.right = "auto";
          stamp.style.margin = "0";
          stamp.style.left = Math.round(cx - w / 2) + "px";
        }
      },
      animate: function (tl) {
        tl.fromTo(stamp, { scale: 1.6 * S, rotation: -8, opacity: 0 }, { scale: S, rotation: -8, opacity: 1, duration: dur, ease: "power4.in" }, start);
        // rung nhẹ khi dấu đóng xuống (dãy cố định, không ngẫu nhiên)
        var shake = [10, -8, 6, -3, 0];
        shake.forEach(function (x, i) {
          tl.to(stamp, { x: x, y: -x * 0.4, duration: 0.035, ease: "power2.inOut" }, v.at + i * 0.035);
        });
      },
    };
  }

  function buildSafeZone(root, total) {
    var layer = el("div", "clip gr-safe-layer", null, root);
    timed(layer, 0, total, 40);
    layer.setAttribute("data-layout-ignore", "");
    var img = el("img", "gr-safe-img", null, layer);
    img.src = "_shared/safe-zone.png";
    img.alt = "";
  }

  /* ---------- Điểm vào ---------- */

  /*
   * run({ compositionId, builders: { intro, item, outro, ... }, chuyen? }) → Promise<{ timeline }>
   * chuyen: false thì bỏ qua scenes[].chuyen (template tự có cách chuyển mục, vd. tier-board).
   * Composition tự đăng ký timeline trả về vào window.__timelines (lint cần thấy dòng đó trong HTML).
   * Mỗi builder(ctx) dựng DOM cảnh ngay (đồng bộ) và trả về { fit?(), animate(tl) }.
   * ctx: { scene (timeline), sc (script), index, typeIndex, el, root, data, items, total, helpers }
   */
  function run(opts) {
    var data = readData();
    var tlData = data.timeline;
    var root = document.querySelector('[data-composition-id="' + opts.compositionId + '"]');
    if (!root) throw new Error("AppReel: không thấy root " + opts.compositionId);
    var total = tlData.duration;
    root.setAttribute("data-width", String(tlData.width));
    root.setAttribute("data-height", String(tlData.height));
    root.setAttribute("data-duration", String(total));
    root.classList.add(tlData.width >= tlData.height ? "is-horizontal" : "is-vertical");

    var scriptById = {};
    (data.script.scenes || []).forEach(function (s) {
      scriptById[s.id] = s;
    });
    var scenes = tlData.scenes || [];
    var items = scenes
      .filter(function (s) {
        return s.type === "item";
      })
      .map(function (s) {
        return { scene: s, sc: scriptById[s.id] || {} };
      });

    var logoSrc = null;
    try {
      var vars = window.__hyperframes && window.__hyperframes.getVariables ? window.__hyperframes.getVariables() : {};
      logoSrc = vars && vars.logoSrc ? vars.logoSrc : null;
    } catch (e) {
      logoSrc = null;
    }

    buildBackground(root, total);
    var parts = [];
    var counters = {};
    scenes.forEach(function (scene, index) {
      var sc = scriptById[scene.id] || {};
      var builder = opts.builders[scene.type];
      if (!builder) throw new Error("AppReel: template không có bố cục cho cảnh loại '" + scene.type + "'");
      var node = el("div", "clip gr-scene gr-scene-" + scene.type, null, root);
      node.id = "sc-" + scene.id;
      timed(node, scene.start, scene.duration, 1 + (index % 2));
      counters[scene.type] = (counters[scene.type] || 0) + 1;
      parts.push(
        builder({
          scene: scene,
          sc: sc,
          index: index,
          typeIndex: counters[scene.type] - 1,
          el: node,
          root: root,
          data: data,
          items: items,
          total: total,
          helpers: helpers,
        })
      );
      // chuyển mục (kieu-hinh.js, scenes[].chuyen trong script.json): template tắt bằng run({ chuyen: false })
      var KH = window.AppReel && window.AppReel.kieu;
      if (KH && sc.chuyen && index > 0 && opts.chuyen !== false) {
        var tr = KH.transition(root.querySelector("#sc-" + scenes[index - 1].id), node, scene, sc.chuyen);
        if (tr) parts.push(tr);
      }
      var stamp = buildVerdictStamp(root, scene, node);
      if (stamp) parts.push(stamp);
      // gag hình (gags.js, nạp sau appreel.js; template nào không nạp thì bỏ qua)
      if (window.AppReel && window.AppReel.buildGags) {
        var gagPart = window.AppReel.buildGags(root, scene);
        if (gagPart) parts.push(gagPart);
      }
    });
    var keywords = {};
    (data.script.scenes || []).forEach(function (s) {
      (s.emphasis || []).forEach(function (w) {
        String(w).split(/\s+/).forEach(function (x) { if (normWord(x)) keywords[normWord(x)] = true; });
      });
    });
    parts.push(buildCaptions(root, tlData.captions, total, keywords));
    parts.push(buildLogoBug(root, total, logoSrc));
    parts.push(buildEndCard(root, scenes, total, logoSrc, data.script));
    buildVoices(root, scenes);
    if (data.debug && data.debug.safeZone) buildSafeZone(root, total);

    return ensureFonts()
      .then(function () {
        return waitImages(root);
      })
      .then(function () {
        parts.forEach(function (p) {
          if (p && p.fit) p.fit();
        });
        var tl = gsap.timeline({ paused: true });
        parts.forEach(function (p) {
          if (p && p.animate) p.animate(tl);
        });
        // độ dài timeline GSAP khớp đúng timeline.duration
        tl.set({}, {}, total);
        // ảnh tạo trong lúc dựng tween (ô truyện tranh chia-o, thanh kéo keo-so-sanh) cũng phải tải xong trước khi
        // đăng ký timeline. Bọc trong object: timeline GSAP có .then(), trả thẳng sẽ khiến Promise chờ timeline chạy hết
        return waitImages(root).then(function () {
          return { timeline: tl };
        });
      })
      .catch(function (err) {
        console.error(err && err.message ? err.message : err);
        throw err;
      });
  }

  var helpers = {
    el: el,
    timed: timed,
    enterAt: enterAt,
    stripRank: stripRank,
    shortName: shortName,
    lastSentence: lastSentence,
    mediaFor: mediaFor,
    cropFor: cropFor,
    applyCrop: applyCrop,
    shotCrop: shotCrop,
    imageSize: imageSize,
    placeCrop: placeCrop,
    isPortraitMedia: isPortraitMedia,
    isMediaShow: isMediaShow,
    fitText: fitText,
    wrapBalanced: wrapBalanced,
    drawArrows: drawArrows,
    contentWidth: contentWidth,
    hideIfMissing: hideIfMissing,
    BRAND_NAME: BRAND_NAME,
    BRAND_TAG: BRAND_TAG,
    EASE_IN: EASE_IN,
    EASE_FLOW: EASE_FLOW,
  };

  window.AppReel = { run: run, helpers: helpers };
})();
