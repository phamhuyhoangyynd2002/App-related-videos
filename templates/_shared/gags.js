/* AppReel – lớp gag hình dùng chung (nhịp cười bằng hình, kenh/cam-nang-phong-cach.md mục 9 và 11).
 *
 * Dữ liệu: timeline.scenes[].gags = [{ kind, at, end, asset?, text? }] do build_timeline.py tạo từ `gags` của
 * script.json. `at` là lúc từ khoá (punchline) được đọc: gag phải VÀO XONG đúng `at`, nên hiệu ứng vào bắt đầu
 * sớm hơn ENTER giây. Mỗi gag là một lớp `.clip` riêng (z-index 23, dưới con dấu 24 và phụ đề 25).
 *
 * Sticker dùng chỗ dành sẵn (data-gag-slot) nếu bố cục có; không thì cùng nhãn của zoom-kich-tinh tự tìm chỗ trống, không đè phần tử data-gag-avoid (chữ cảnh, thẻ, con dấu), phụ đề, logo.
 * Đã dựng: sticker, chu-to, the-thoi-gian, rung, zoom-kich-tinh, ten-that, tin-nhan, dong-bang, ky-vong-thuc-te,
 * so-sanh (06/10/2026), ba-giai-doan (06/10/2026), dau-chu (12/10/2026), combo, keo-so-sanh (12/10/2026, chắt lọc từ
 * thẻ impact-feedback và before-after-slider-scrub của video-shotcraft, xem _shared/kieu-hinh.md).
 * Giữ hình ứng dụng (12/10/2026): chu-to và ky-vong-thuc-te chỉ tối cục bộ quanh khối chữ (~45%, mép mờ), dong-bang
 * khử màu + xám nhẹ; không gag nào phủ đen toàn khung (trừ the-thoi-gian là thẻ chuyển cảnh có chủ ý).
 * Chưa dựng (bỏ qua, ghi console.warn): binh-luan.
 *
 * Mỗi khung tối đa MỘT hình linh vật/logo: gag có hình linh vật (sticker, so-sanh có asset, ba-giai-doan có asset) chỉ mang
 * một hình; template tự cho linh vật nhỏ của cảnh lui đi trong lúc gag hiện (tier-board: guardLinhVat). Gag có hình linh vật
 * rút đi trước màn kết (end-card mang logo lớn).
 *
 * Không Math.random, Date.now; chỉ GSAP fromTo/to trên timeline có sẵn; không CSS transform ban đầu trên
 * phần tử được tween (căn giữa bằng flex/inset).
 */
(function () {
  "use strict";

  var GR = window.AppReel;
  if (!GR) throw new Error("gags.js phải nạp SAU appreel.js");
  var h = GR.helpers;
  var STICKER_DIR = "_shared/sticker/";
  var ENTER = 0.2; // giây hiệu ứng vào
  var EXIT = 0.2; // giây hiệu ứng ra
  var SHAKE = [14, -12, 9, -6, 3, 0];
  var SAFE_BOTTOM = 1920 - 450; // đáy vùng an toàn (.claude/rules/video-ngan-da-nen-tang.md)

  function textOf(g) {
    var t = g.text;
    if (Array.isArray(t)) return t.map(function (x) { return Array.isArray(x) ? x.join(" ") : x; }).join(" ");
    return t ? String(t) : "";
  }

  function allow(node) {
    node.setAttribute("data-layout-allow-overlap", "");
    node.setAttribute("data-layout-allow-occlusion", "");
    return node;
  }

  /* Lớp .clip của một gag: hiện từ (at - ENTER - 0,05 - pre) tới (end + EXIT). pre: gag diễn nhiều nhịp trước `at`
     (combo, keo-so-sanh) cần lớp hiện sớm hơn, xem PRE. */
  function makeLayer(root, scene, g, trackBase, n, pre) {
    var start = Math.max(scene.start, g.at - ENTER - 0.05 - (pre || 0));
    var end = Math.min(scene.end, g.end + EXIT);
    var layer = h.el("div", "clip gr-gag-layer gr-gag-k-" + g.kind, null, root);
    h.timed(layer, start, Math.max(0.3, end - start), trackBase + (n % 2));
    layer.setAttribute("data-layout-allow-overlap", "");
    layer.setAttribute("data-layout-allow-occlusion", "");
    return { layer: layer, start: start, end: end, enterAt: Math.max(start, g.at - ENTER), exitAt: Math.max(g.at, end - EXIT) };
  }

  function fadeOut(tl, node, at, dur) {
    tl.to(node, { opacity: 0, duration: dur || EXIT, ease: "power2.in" }, at);
  }

  /* ---------- chỗ trống: gag không được đè chữ của cảnh (tựa mục, thẻ thông tin, câu hỏi), phụ đề, con dấu ----------
   * Bố cục đánh dấu phần tử cần chừa bằng data-gag-avoid (tuỳ chọn data-avoid-from / data-avoid-to: giây tuyệt đối
   * phần tử đó hiện trên khung). Toạ độ lấy theo bố cục (offsetLeft/Top), không tính transform của GSAP. */
  function layoutRect(node, root) {
    var x = 0, y = 0, n = node;
    while (n && n !== root) {
      x += n.offsetLeft || 0;
      y += n.offsetTop || 0;
      n = n.offsetParent;
    }
    return { x: x, y: y, w: node.offsetWidth || 0, h: node.offsetHeight || 0 };
  }

  function grow(r, p) {
    return { x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p };
  }

  function overlapArea(a, b) {
    var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var hh = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > 0 && hh > 0 ? w * hh : 0;
  }

  /* Vùng cần chừa trong khoảng [t0, t1] của cảnh. onlyMarked: chỉ phần tử data-gag-avoid (không tính phụ đề, logo). */
  function avoidRects(root, scene, t0, t1, onlyMarked) {
    var out = [];
    var sceneNode = root.querySelector("#sc-" + scene.id);
    var nodes = [];
    if (sceneNode) nodes = nodes.concat(Array.prototype.slice.call(sceneNode.querySelectorAll("[data-gag-avoid]")));
    nodes = nodes.concat(Array.prototype.slice.call(root.querySelectorAll('[data-gag-avoid][data-avoid-scene="' + scene.id + '"]')));
    nodes.forEach(function (n) {
      var from = parseFloat(n.getAttribute("data-avoid-from"));
      var to = parseFloat(n.getAttribute("data-avoid-to"));
      if (isFinite(from) && from > t1) return;
      if (isFinite(to) && to < t0) return;
      var r = layoutRect(n, root);
      if (r.w > 0 && r.h > 0) out.push(grow(r, 10));
    });
    if (onlyMarked) return out;
    // phụ đề: một dải cố định quanh caption-center-y
    var cap = root.querySelector(".gr-caption");
    if (cap) {
      var cr = layoutRect(cap, root);
      out.push({ x: cr.x - 10, y: cr.y - 14, w: cr.w + 20, h: cr.h + 28 });
    }
    var bug = root.querySelector(".gr-logo-bug");
    if (bug) out.push(grow(layoutRect(bug, root), 6));
    return out;
  }

  /* Chỗ dành sẵn cho sticker: phần tử data-gag-slot trong cảnh (tuỳ chọn data-avoid-from / data-avoid-to như trên),
     do bố cục đặt ở chỗ không che chữ và không che vùng chính của ảnh (vd. góc ô hạng 1, cạnh dòng tựa ngắn).
     Trả về toạ độ khung hoặc null. */
  function slotFor(root, scene, t0, t1) {
    var sceneNode = root.querySelector("#sc-" + scene.id);
    if (!sceneNode) return null;
    var nodes = sceneNode.querySelectorAll("[data-gag-slot]");
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var from = parseFloat(n.getAttribute("data-avoid-from"));
      var to = parseFloat(n.getAttribute("data-avoid-to"));
      if (isFinite(from) && from > t1) continue;
      if (isFinite(to) && to < t0) continue;
      var r = layoutRect(n, root);
      if (r.w >= 120 && r.h >= 120) return r;
    }
    return null;
  }

  /* Chọn ô đầu tiên không chạm vùng nào; không có thì ô chạm ít nhất. */
  function pickSpot(cands, avoid) {
    var best = null;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      var probe = c.probe || c;
      var area = 0;
      for (var j = 0; j < avoid.length; j++) area += overlapArea(probe, avoid[j]);
      if (area === 0) return c;
      if (!best || area < best.area) best = { c: c, area: area };
    }
    return best ? best.c : null;
  }

  function topsAround(pref, lo, hi, step) {
    var arr = [];
    for (var y = lo; y <= hi; y += step) arr.push(y);
    arr.sort(function (a, b) { return Math.abs(a - pref) - Math.abs(b - pref) || a - b; });
    return arr;
  }

  /* Chữ to toàn khung (chu-to, dong-bang): khối chữ nằm trong vùng an toàn ngang (trái 60, phải chừa 150 → rộng 870,
     tâm x 495, xem gags.css), viền đen 16px lấn 8px mỗi bên nên chữ chỉ được rộng BIG_W. Chữ dài ("TRÚNG SỐ?!",
     "+ SẾU ĐẦU ĐỎ") tự thu cỡ; tới cỡ tối thiểu vẫn tràn thì chia hai dòng cân rồi co cho vừa khối cao 300px. */
  var BIG_W = 870 - 16;
  function fitBig(txt, minPx) {
    h.fitText(txt, { maxWidth: BIG_W, minPx: minPx });
    var r = document.createRange();
    r.selectNodeContents(txt);
    var box = txt.getBoundingClientRect().width;
    var k = box && txt.offsetWidth ? txt.offsetWidth / box : 1; // khung xem trước có thể thu nhỏ cả composition
    if (r.getBoundingClientRect().width * k <= BIG_W + 1) return;
    if (h.wrapBalanced(txt, BIG_W)) {
      txt.style.lineHeight = "1.25";
      h.fitText(txt, { maxWidth: BIG_W, maxHeight: 300, minPx: 56 });
    }
  }

  function norm(t) {
    return String(t || "").toLowerCase().normalize("NFC").replace(/[\s~≈]/g, "");
  }

  /* Một từ (đã bỏ dấu câu, giữ dấu tiếng Việt) để so với từ trong lời đọc. */
  function normTok(t) {
    return String(t || "").toLowerCase().normalize("NFC").replace(/[.,!?…:;"'()“”]/g, "").trim();
  }

  /* Mốc đọc của từ đầu tiên trong scene.words trùng `tok`, trong khoảng (from, to); không có thì null.
     Từ trong timeline có thể là cụm ("Hungry Shark Evolution."): so với từ đầu của cụm. */
  function findWord(scene, tok, from, to) {
    var k = normTok(tok);
    if (!k) return null;
    var ws = scene.words || [];
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (w.start <= from || w.start >= to) continue;
      if (normTok(String(w.text).split(/\s+/)[0]) === k) return w.start;
    }
    return null;
  }

  /* Mốc bắt đầu màn kết (end-card) nếu có, để gag mang hình linh vật rút đi trước khi logo lớn vào. */
  function endCardStart(root) {
    var ec = root.querySelector(".gr-end-layer");
    var at = ec ? parseFloat(ec.getAttribute("data-start")) : NaN;
    return isFinite(at) ? at : Infinity;
  }
  function clampBeforeEndCard(L, root) {
    var ec = endCardStart(root);
    if (L.exitAt + EXIT > ec - 0.05) L.exitAt = Math.max(L.enterAt + 0.3, ec - EXIT - 0.05);
  }

  /* so-sanh: dòng "yếu" là dòng có từ phủ định / kém (KHÔNG, CHƯA, THỬ…); g.strong (0 hoặc 1) ghi đè. */
  var WEAK_WORDS = ["không", "chưa", "thử", "thua", "yếu", "hết", "mất", "đắt", "lag", "xịt"];
  function weakScore(text) {
    var after = String(text).split(":").slice(-1)[0];
    return after.split(/\s+/).filter(function (x) { return WEAK_WORDS.indexOf(normTok(x)) >= 0; }).length;
  }

  /* Chữ "NHÃN: GIÁ TRỊ" thành hai span (nhãn nhỏ, giá trị to); không có ":" thì một span. */
  function labelled(parent, text, cls) {
    var box = allow(h.el("div", cls, null, parent));
    var str = String(text || "");
    var i = str.indexOf(":");
    if (i > 0 && i < str.length - 1) {
      allow(h.el("span", cls + "-label", str.slice(0, i + 1) + " ", box));
      allow(h.el("span", cls + "-value", str.slice(i + 1).trim(), box));
    } else {
      allow(h.el("span", cls + "-value", str, box));
    }
    return box;
  }

  /* combo: số đòn và khoảng cách giữa hai đòn (đòn cuối xong đúng `at`). */
  var COMBO_GAP = 0.16;
  function comboCount(g) {
    return Math.max(2, Math.min(9, parseInt(g.so, 10) || 3));
  }
  /* Gag diễn nhiều nhịp trước `at`: lớp phải hiện sớm hơn chừng này giây. */
  var PRE = {
    combo: function (g) { return (comboCount(g) - 1) * COMBO_GAP + 0.12; },
    "keo-so-sanh": function () { return 0.45; },
  };

  /* Khung hình ứng dụng của cảnh đang hiện lúc t (phần tử data-gag-media; tuỳ chọn data-media-from / data-media-to). */
  function mediaRectAt(ctx, t) {
    var sceneNode = ctx.root.querySelector("#sc-" + ctx.scene.id);
    if (!sceneNode) return null;
    var best = null;
    Array.prototype.slice.call(sceneNode.querySelectorAll("[data-gag-media]")).forEach(function (n) {
      var from = parseFloat(n.getAttribute("data-media-from"));
      var to = parseFloat(n.getAttribute("data-media-to"));
      if (isFinite(from) && from > t) return;
      if (isFinite(to) && to < t) return;
      var r = layoutRect(n, ctx.root);
      if (r.w > 0 && r.h > 0 && (!best || r.w * r.h > best.w * best.h)) best = r;
    });
    return best;
  }

  var KINDS = {
    sticker: function (L, g, tl, ctx) {
      var side = ctx.n % 2 === 0 ? 1 : -1; // luân phiên phải / trái
      // bố cục cảnh có thể chốt một bên (vd. top-list mp: cột chữ + thẻ bên trái thì sticker luôn bên phải)
      if (ctx.stickerSide === "right") side = 1;
      else if (ctx.stickerSide === "left") side = -1;
      var img = allow(h.el("img", "gr-gag-sticker", null, L.layer));
      img.onerror = function () { img.style.display = "none"; };
      img.src = STICKER_DIR + (g.asset || "linh-vat-cuoi") + ".png";
      img.alt = "";
      // chỗ đặt: bố cục cảnh có chỗ dành sẵn (data-gag-slot) thì dùng chỗ đó; không thì tự tìm chỗ không đè chữ cảnh,
      // thẻ, phụ đề, con dấu (thử cỡ 400 → 240, bên ưu tiên trước, gần y 700), trong vùng an toàn (đáy ≤ SAFE_BOTTOM)
      L.fit = function () {
        var slot = slotFor(ctx.root, ctx.scene, L.start, L.end);
        // chỗ dành sẵn chỉ dùng khi không đè phần tử cảnh đang hiện trong lúc sticker hiện (vd. thẻ số liệu dài
        // "KHÔNG CÓ · CÓ BAD PIGGIES" tới x ≈ 930 còn đứng khi sticker vào trước lúc dải rút): đè thì tự tìm chỗ
        if (slot && avoidRects(ctx.root, ctx.scene, L.start, L.end, true).some(function (r) { return overlapArea(slot, r) > 0; })) slot = null;
        if (slot) {
          var ss = Math.round(Math.min(slot.w, slot.h));
          img.style.left = Math.round(slot.x + (slot.w - ss) / 2) + "px";
          img.style.top = Math.round(slot.y + (slot.h - ss) / 2) + "px";
          img.style.width = ss + "px";
          img.style.height = ss + "px";
          return;
        }
        var avoid = avoidRects(ctx.root, ctx.scene, L.start, L.end);
        var cands = [];
        [400, 340, 290, 240].forEach(function (size) {
          var xs = [side > 0 ? 1020 - size : 40, side > 0 ? 40 : 1020 - size, Math.round((1080 - size) / 2)];
          xs.forEach(function (x) {
            // được xuống dưới dải phụ đề nhưng đáy sticker không quá vùng an toàn (giao diện ứng dụng che 450px đáy)
            topsAround(700, 260, SAFE_BOTTOM - size, 20).forEach(function (y) {
              // ảnh sticker có lề trong suốt rất mỏng: tính gần hết khung (lõi 94%)
              var m = size * 0.03;
              cands.push({ x: x, y: y, size: size, probe: { x: x + m, y: y + m, w: size - 2 * m, h: size - 2 * m } });
            });
          });
        });
        var spot = pickSpot(cands, avoid);
        if (!spot) return;
        img.style.left = spot.x + "px";
        img.style.top = spot.y + "px";
        img.style.width = spot.size + "px";
        img.style.height = spot.size + "px";
      };
      clampBeforeEndCard(L, ctx.root);
      if (L.enterAt <= 0.2) {
        // gag ở giây 0: sticker đã có sẵn ở khung đầu (khung đầu là ảnh bìa), chỉ đập nhẹ
        tl.fromTo(img, { scale: 0.86, rotation: side * 6, opacity: 1 },
          { scale: 1, rotation: side * 6, opacity: 1, duration: 0.26, ease: "back.out(2.4)" }, 0);
      } else
      tl.fromTo(img, { scale: 0, rotation: side * -14, opacity: 0 },
        { scale: 1, rotation: side * 6, opacity: 1, duration: 0.26, ease: "back.out(2.4)", immediateRender: false }, L.enterAt);
      tl.to(img, { scale: 1.06, duration: 0.5, ease: "power1.inOut" }, L.enterAt + 0.26);
      fadeOut(tl, img, L.exitAt);
    },

    "chu-to": function (L, g, tl) {
      // g.dim === false: không phủ tối khung (chữ có viền tự đứng được, ảnh và thẻ vẫn đọc được)
      var dim = g.dim === false ? null : allow(h.el("div", "gr-gag-dim", null, L.layer));
      var txt = allow(h.el("div", "gr-gag-big", textOf(g), L.layer));
      L.fit = function () { fitBig(txt, 70); };
      if (dim) tl.fromTo(dim, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, L.enterAt);
      tl.fromTo(txt, { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: ENTER, ease: "power4.out", immediateRender: false }, L.enterAt);
      fadeOut(tl, dim ? [dim, txt] : txt, L.exitAt);
    },

    /* dau-chu: chữ đóng dấu nghiêng (−7°), nền vàng/xanh brand viền đen dày, bóng đổ, ĐÈ LÊN GÓC/MÉP khung hình ứng dụng
       của cảnh (phần tử data-gag-media; tuỳ chọn data-media-from / data-media-to), không phủ tối khung. Dấu chiếm
       ≤ 28% diện tích khung hình (hình ứng dụng còn thấy ≥ 70%). Tối đa 4 chữ (dài hơn vẫn dựng, ghi console.warn).
       Đập vào scale 1.4→1 trong 0,15s, xong đúng `at`, giữ tới `end`. Chỗ đặt: các góc/mép khung, ưu tiên vắt qua mép
       trên/dưới, không đè data-gag-avoid (tựa, thẻ), phụ đề, logo-bug; trong vùng an toàn. g.color = "xanh" thì nền
       xanh #6FE3C1, không thì luân phiên vàng #FFD84D / xanh theo thứ tự gag. */
    "dau-chu": function (L, g, tl, ctx) {
      var text = textOf(g);
      if (text.split(/\s+/).filter(Boolean).length > 4) console.warn("gags.js: dau-chu quá 4 chữ: " + text);
      var green = g.color === "xanh" || (g.color !== "vang" && ctx.n % 2 === 1);
      var stamp = allow(h.el("div", "gr-gag-stamp" + (green ? " is-green" : ""), null, L.layer));
      var txt = allow(h.el("div", "gr-gag-stamp-text", text, stamp));
      var ROT = -7;
      var SAFE = { left: 60, right: 930, top: 260, bottom: SAFE_BOTTOM };

      function mediaRect() {
        var sceneNode = ctx.root.querySelector("#sc-" + ctx.scene.id);
        if (!sceneNode) return null;
        var best = null;
        Array.prototype.slice.call(sceneNode.querySelectorAll("[data-gag-media]")).forEach(function (n) {
          var from = parseFloat(n.getAttribute("data-media-from"));
          var to = parseFloat(n.getAttribute("data-media-to"));
          if (isFinite(from) && from > g.at) return;
          if (isFinite(to) && to < g.at) return;
          var r = layoutRect(n, ctx.root);
          if (r.w > 0 && r.h > 0 && (!best || r.w * r.h > best.w * best.h)) best = r;
        });
        return best;
      }

      L.fit = function () {
        var m = mediaRect() || { x: 60, y: 640, w: 870, h: 520 }; // không có khung hình: dải giữa vùng an toàn
        // cỡ chữ: vừa 70% bề rộng khung (tối đa 640px), rồi co tiếp tới khi dấu ≤ 20% diện tích khung
        var cs = getComputedStyle(stamp);
        var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) * 2;
        h.fitText(txt, { maxWidth: Math.min(640, m.w * 0.7) - padX, minPx: 52 });
        var guard = 0;
        while (guard++ < 40 && stamp.offsetWidth * stamp.offsetHeight > 0.2 * m.w * m.h) {
          var px0 = parseFloat(getComputedStyle(txt).fontSize);
          if (px0 <= 52) break;
          txt.style.fontSize = px0 - 4 + "px";
        }
        var basePx = parseFloat(getComputedStyle(txt).fontSize);
        var avoid = avoidRects(ctx.root, ctx.scene, L.start, L.end);
        var rad = Math.abs(ROT) * Math.PI / 180;
        var INSET = 24;
        // thử cỡ 100% → 70%: mỗi cỡ quét các góc/mép khung; cỡ nào có chỗ không chạm gì thì dùng, không thì chỗ chạm ít nhất
        var best = null;
        [1, 0.85, 0.7, 0.55].some(function (k) {
          txt.style.fontSize = Math.max(44, basePx * k) + "px";
          var w = stamp.offsetWidth, hh = stamp.offsetHeight;
          // khung bao sau khi xoay ROT độ
          var bw = w * Math.cos(rad) + hh * Math.sin(rad), bh = w * Math.sin(rad) + hh * Math.cos(rad);
          var ex = (bw - w) / 2, ey = (bh - hh) / 2;
          var xs = [m.x + INSET, m.x + m.w - w - INSET];
          if (ctx.n % 2 === 1) xs.reverse();
          xs.push(m.x + (m.w - w) / 2);
          var ys = [m.y - hh * 0.4, m.y + m.h - hh * 0.6, m.y + INSET, m.y + m.h - hh - INSET];
          var cands = [];
          ys.forEach(function (y) {
            xs.forEach(function (x) {
              var cx = Math.max(SAFE.left + ex, Math.min(SAFE.right - w - ex, x));
              var cy = Math.max(SAFE.top + ey, Math.min(SAFE.bottom - hh - ey, y));
              cands.push({ x: Math.round(cx), y: Math.round(cy), px: Math.max(44, basePx * k), probe: { x: cx - ex, y: cy - ey, w: bw, h: bh } });
            });
          });
          var spot = pickSpot(cands, avoid);
          if (!spot) return false;
          var area = 0;
          avoid.forEach(function (r) { area += overlapArea(spot.probe, r); });
          if (!best || area < best.area) best = { spot: spot, area: area };
          return area === 0;
        });
        if (!best) return;
        txt.style.fontSize = best.spot.px + "px";
        stamp.style.left = best.spot.x + "px";
        stamp.style.top = best.spot.y + "px";
      };
      var t0 = Math.max(L.start, g.at - 0.15);
      tl.fromTo(stamp, { scale: 1.4, rotation: ROT, opacity: 0 },
        { scale: 1, rotation: ROT, opacity: 1, duration: g.at - t0, ease: "power4.out", immediateRender: false }, t0);
      fadeOut(tl, stamp, L.exitAt);
    },

    "the-thoi-gian": function (L, g, tl) {
      var card = allow(h.el("div", "gr-gag-card", null, L.layer));
      var txt = allow(h.el("div", "gr-gag-card-text", textOf(g), card));
      L.fit = function () { h.fitText(txt, { maxWidth: 900, minPx: 64 }); };
      tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, L.enterAt);
      tl.fromTo(txt, { scale: 0.9 }, { scale: 1.06, duration: Math.max(0.4, L.end - L.enterAt), ease: "power1.out", immediateRender: false }, L.enterAt);
      fadeOut(tl, card, L.exitAt);
    },

    rung: function (L, g, tl, ctx) {
      // rung các lớp cảnh và bảng (không rung phụ đề, logo)
      var targets = ctx.root.querySelectorAll(".gr-scene, .tb-board-layer");
      SHAKE.forEach(function (x, i) {
        tl.to(targets, { x: x, y: -x * 0.35, duration: 0.05, ease: "power2.inOut" }, g.at + i * 0.05);
      });
      L.layer.parentNode.removeChild(L.layer); // không cần lớp riêng
    },

    /* zoom giật 3 nấc vào chi tiết + khung đỏ + nhãn vàng. text = [chữ chính, chữ phụ] (vd. ["7,2 MB", "CẢ ỨNG DỤNG"]).
       Chi tiết = phần tử data-gag-target của cảnh có data-gag-text trùng chữ chính (vd. thẻ thông tin); không có thì
       vòng đỏ ở chỗ mặc định. Chi tiết phóng từ góc trên trái; độ phóng và độ dời dọc được chọn sao cho khung đỏ
       (kể cả viền đen, nhịp phình 4%) nằm gọn giữa phần tử đứng trên và phần tử đứng dưới (thẻ khác, tựa, phụ đề,
       đáy vùng an toàn), không che chữ của chúng. Nhãn vàng đặt vào chỗ trống trong vùng an toàn gần chi tiết,
       cách logo-bug, thẻ, phụ đề; không đủ chỗ thì thu nhỏ nhãn (tới 70%) trước khi chịu chạm. */
    "zoom-kich-tinh": function (L, g, tl, ctx) {
      var t = Array.isArray(g.text) ? g.text : [textOf(g), ""];
      var main = String(t[0] || "");
      var sub = String(t[1] || "");
      var ring = allow(h.el("div", "gr-gag-ring", null, L.layer));
      var box = allow(h.el("div", "gr-gag-callout", null, L.layer));
      var mainEl = allow(h.el("div", "gr-gag-callout-main", main, box));
      var subEl = sub ? allow(h.el("div", "gr-gag-callout-sub", sub, box)) : null;
      var sceneNode = ctx.root.querySelector("#sc-" + ctx.scene.id);
      var target = null;
      if (sceneNode && main) {
        Array.prototype.slice.call(sceneNode.querySelectorAll("[data-gag-target]")).forEach(function (n) {
          if (!target && norm(n.getAttribute("data-gag-text")) === norm(main)) target = n;
        });
      }
      var ZMAX = 1.18; // độ phóng nấc cuối khi đủ chỗ
      var Z = ZMAX, DY = 0;
      var RING_BORDER = 16, RING_SHADOW = 6, RING_PULSE = 1.04, GAP = 8;
      var SAFE = { top: 260, bottom: 1470, left: 60, right: 930 };

      /* Phần tử chữ khác trong cảnh (data-gag-avoid, đang hiện trong gag), không phải chi tiết hay cha/con của nó. */
      function neighbours() {
        var out = [];
        var nodes = sceneNode ? Array.prototype.slice.call(sceneNode.querySelectorAll("[data-gag-avoid]")) : [];
        nodes = nodes.concat(Array.prototype.slice.call(ctx.root.querySelectorAll('[data-gag-avoid][data-avoid-scene="' + ctx.scene.id + '"]')));
        nodes.forEach(function (n) {
          if (n === target || n.contains(target) || target.contains(n)) return;
          var from = parseFloat(n.getAttribute("data-avoid-from"));
          var to = parseFloat(n.getAttribute("data-avoid-to"));
          if (isFinite(from) && from > L.end) return;
          if (isFinite(to) && to < L.start) return;
          var r = layoutRect(n, ctx.root);
          if (r.w > 0 && r.h > 0) out.push(r);
        });
        var cap = ctx.root.querySelector(".gr-caption");
        if (cap) { var cr = layoutRect(cap, ctx.root); out.push({ x: cr.x, y: cr.y - 14, w: cr.w, h: cr.h + 28 }); }
        var bug = ctx.root.querySelector(".gr-logo-bug");
        if (bug) out.push(layoutRect(bug, ctx.root));
        return out;
      }

      L.fit = function () {
        h.fitText(mainEl, { maxWidth: 760, minPx: 60 });
        if (subEl) h.fitText(subEl, { maxWidth: 760, minPx: 44 });
        var mainPx = parseFloat(getComputedStyle(mainEl).fontSize);
        var subPx = subEl ? parseFloat(getComputedStyle(subEl).fontSize) : 0;
        var textW = Math.max(mainEl.scrollWidth, subEl ? subEl.scrollWidth : 0);
        var avoid = avoidRects(ctx.root, ctx.scene, L.start, L.end);
        // nhãn vàng không chỉ không đè mà còn cách hẳn logo-bug (viền chữ logo dày, chạm là thấy dính)
        var bugNode = ctx.root.querySelector(".gr-logo-bug");
        if (bugNode) avoid.push(grow(layoutRect(bugNode, ctx.root), 28));
        var aim = { x: 495, y: 900 };
        if (target) {
          var tr = layoutRect(target, ctx.root);
          // dải dọc trống quanh chi tiết: đáy phần tử phía trên, đỉnh phần tử phía dưới (cùng cột theo chiều ngang)
          var spanX0 = tr.x - 30, spanX1 = tr.x + tr.w * ZMAX + 30;
          var mid = tr.y + tr.h / 2;
          var above = SAFE.top, below = SAFE.bottom;
          neighbours().forEach(function (r) {
            if (r.x >= spanX1 || r.x + r.w <= spanX0) return;
            if (r.y + r.h / 2 < mid) above = Math.max(above, r.y + r.h);
            else below = Math.min(below, r.y);
          });
          // khung chứa có overflow cắt (vd. khung ảnh tl-frame): chi tiết đã phóng phải nằm trong đó, và trong vùng an toàn
          var clip = null;
          for (var an = target.parentElement; an && an !== ctx.root; an = an.parentElement) {
            var ov = getComputedStyle(an);
            if (ov.overflow !== "visible" || ov.overflowX !== "visible") { clip = layoutRect(an, ctx.root); break; }
          }
          var rightLim = Math.min(SAFE.right - RING_BORDER - 2, clip ? clip.x + clip.w : Infinity);
          var zW = (rightLim - tr.x) / tr.w;
          if (zW < ZMAX) ZMAX = Math.max(1, Math.floor(zW * 100) / 100);
          if (clip) { above = Math.max(above, clip.y - RING_BORDER); below = Math.min(below, clip.y + clip.h + RING_BORDER); }
          var space = below - above - 2 * GAP;
          // ngoài khung đỏ = chi tiết đã phóng + pad mỗi bên + viền đen; nhịp phình 4% nới thêm 2% chiều cao mỗi bên
          var pad = RING_BORDER + 2;
          function outer(z, p) { var hh = tr.h * z + 2 * p; return hh * RING_PULSE + 2 * RING_SHADOW; }
          Z = ZMAX;
          while (Z > 1 && outer(Z, pad) > space) Z = Math.round((Z - 0.01) * 100) / 100;
          while (pad > 4 && outer(Z, pad) > space) pad -= 1;
          var ringH = tr.h * Z + 2 * pad;
          var ext = (outer(Z, pad) - ringH) / 2; // phần lồi ra ngoài khung đỏ (viền đen + phình)
          // dời chi tiết xuống vừa đủ để mép trên khung đỏ cách phần tử phía trên; không quá mép dưới
          var minTop = above + GAP + ext; // đỉnh khung đỏ thấp nhất được phép
          var maxTop = below - GAP - ext - ringH;
          var ringTop = Math.max(minTop, Math.min(maxTop, tr.y - pad)); // hết chỗ thì ưu tiên không che phía trên
          DY = Math.round(ringTop + pad - tr.y);
          var rw = tr.w * Z + 2 * pad;
          ring.classList.add("is-box");
          ring.style.left = Math.round(tr.x - pad) + "px";
          ring.style.top = Math.round(ringTop) + "px";
          ring.style.width = Math.round(rw) + "px";
          ring.style.height = Math.round(ringH) + "px";
          avoid.push({ x: tr.x - pad - ext - 10, y: ringTop - ext - 10, w: rw + 2 * ext + 20, h: ringH + 2 * ext + 20 });
          aim = { x: tr.x - pad + rw / 2, y: ringTop + ringH / 2 };
        }
        // nhãn: thử cỡ 100% → 70%, mỗi cỡ quét chỗ trong vùng an toàn, gần chi tiết trước; probe nới 12px cho nhịp nảy
        var cands = [];
        [1, 0.9, 0.8, 0.7].forEach(function (k) {
          var bw = Math.min(870, Math.round(textW * k + 80));
          var bh = Math.round((subEl ? subPx * 1.2 * k + 10 : 0) + mainPx * 1.15 * k + 40);
          var list = [];
          for (var x = SAFE.left; x <= SAFE.right - bw; x += 20) {
            for (var y = SAFE.top; y <= SAFE.bottom - bh; y += 20) {
              list.push({ x: x, y: y, w: bw, h: bh, k: k, probe: { x: x - 12, y: y - 12, w: bw + 24, h: bh + 24 } });
            }
          }
          list.sort(function (a, b) {
            var da = Math.abs(a.x + a.w / 2 - aim.x) + Math.abs(a.y + a.h / 2 - aim.y);
            var db = Math.abs(b.x + b.w / 2 - aim.x) + Math.abs(b.y + b.h / 2 - aim.y);
            return da - db || a.y - b.y || a.x - b.x;
          });
          cands = cands.concat(list);
        });
        var spot = pickSpot(cands, avoid) || { x: 60, y: 1000, w: 760, h: 180, k: 1 };
        if (spot.k !== 1) {
          mainEl.style.fontSize = (mainPx * spot.k).toFixed(1) + "px";
          if (subEl) subEl.style.fontSize = (subPx * spot.k).toFixed(1) + "px";
        }
        box.style.left = spot.x + "px";
        box.style.top = spot.y + "px";
        box.style.width = spot.w + "px";
        box.style.height = spot.h + "px";
      };
      // chỗ đặt phải biết trước khi dựng tween (độ phóng, độ dời của chi tiết): đo ngay, bố cục cảnh đã fit xong
      L.fit();
      L.fit = null;
      // zoom giật 3 nấc vào chính chi tiết (nổi lên trên phần tử bên cạnh), không phóng cả cảnh để số hạng, tựa
      // không bị đẩy vào logo; trả về khi gag hết
      if (target) {
        if (getComputedStyle(target).position === "static") target.style.position = "relative";
        target.style.zIndex = "5";
        var steps = [1 + (Z - 1) / 3, 1 + (2 * (Z - 1)) / 3, Z];
        steps.forEach(function (z, i) {
          var fromZ = i ? steps[i - 1] : 1;
          var fromY = i ? Math.round((DY * i) / 3) : 0;
          tl.fromTo(target, { scale: fromZ, y: fromY }, { scale: z, y: Math.round((DY * (i + 1)) / 3), transformOrigin: "0% 0%", duration: 0.05, ease: "power4.out", immediateRender: false }, L.enterAt + i * 0.1);
        });
        tl.fromTo(target, { scale: Z, y: DY }, { scale: 1, y: 0, duration: EXIT, ease: "power2.inOut", immediateRender: false }, L.exitAt);
      }
      var ringAt = target ? L.enterAt + 0.2 : L.enterAt;
      tl.fromTo(ring, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: "power4.in", immediateRender: false }, ringAt);
      tl.fromTo(box, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2)", immediateRender: false }, ringAt + 0.06);
      tl.to(ring, { scale: RING_PULSE, duration: 0.4, ease: "power1.inOut" }, ringAt + 0.2);
      fadeOut(tl, [ring, box], L.exitAt);
    },

    "ten-that": function (L, g, tl) {
      var t = Array.isArray(g.text) ? g.text : [textOf(g), ""];
      var wrap = allow(h.el("div", "gr-gag-swap", null, L.layer));
      var oldBox = allow(h.el("div", "gr-gag-swap-old", null, wrap));
      var oldTxt = allow(h.el("span", null, t[0], oldBox));
      var strike = allow(h.el("div", "gr-gag-strike", null, oldBox));
      var neu = allow(h.el("div", "gr-gag-swap-new", t[1] || "", wrap));
      L.fit = function () {
        h.fitText(oldTxt, { maxWidth: 900, minPx: 44 });
        h.fitText(neu, { maxWidth: 900, minPx: 44 });
      };
      tl.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, L.enterAt);
      tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power3.out", immediateRender: false }, L.enterAt + 0.2);
      tl.fromTo(neu, { scale: 0, rotation: -12, opacity: 0 }, { scale: 1, rotation: -4, opacity: 1, duration: 0.28, ease: "back.out(2)", immediateRender: false }, L.enterAt + 0.5);
      fadeOut(tl, wrap, L.exitAt);
    },

    "tin-nhan": function (L, g, tl) {
      var msgs = Array.isArray(g.text) ? g.text : [["Mình", textOf(g)]];
      var card = allow(h.el("div", "gr-gag-chat", null, L.layer));
      var bubbles = msgs.slice(0, 3).map(function (m, i) {
        var b = allow(h.el("div", "gr-gag-bubble " + (i % 2 === 0 ? "is-left" : "is-right"), null, card));
        h.el("div", "gr-gag-who", m[0], b);
        h.el("div", "gr-gag-msg", m[1], b);
        return b;
      });
      tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, L.enterAt);
      var step = Math.max(0.5, (L.exitAt - L.enterAt - 0.3) / Math.max(1, bubbles.length));
      bubbles.forEach(function (b, i) {
        tl.fromTo(b, { scale: 0.4, opacity: 0, y: 24 }, { scale: 1, opacity: 1, y: 0, duration: 0.22, ease: "back.out(1.8)", immediateRender: false }, L.enterAt + i * step);
      });
      fadeOut(tl, card, L.exitAt);
    },

    /* kỳ vọng / thực tế: hai thẻ chồng nhau, thẻ "KỲ VỌNG" vào trước, thẻ "THỰC TẾ" đập vào sau 0,3s.
       text = [kỳ vọng, thực tế]. */
    "ky-vong-thuc-te": function (L, g, tl) {
      var t = Array.isArray(g.text) ? g.text : [textOf(g), ""];
      var dim = allow(h.el("div", "gr-gag-dim is-kvtt", null, L.layer));
      var wrap = allow(h.el("div", "gr-gag-kvtt", null, L.layer));
      function panel(label, text, cls) {
        var p = allow(h.el("div", "gr-gag-kvtt-panel " + cls, null, wrap));
        allow(h.el("div", "gr-gag-kvtt-label", label, p));
        var v = allow(h.el("div", "gr-gag-kvtt-text", text, p));
        return { p: p, v: v };
      }
      var a = panel("KỲ VỌNG", t[0] || "", "is-hope");
      var b = panel("THỰC TẾ", t[1] || "", "is-real");
      L.fit = function () {
        // bề rộng trong hộp (trừ padding), không dùng số cố định: hộp 820px, padding 34 + viền 8 mỗi bên → ~736px
        [a, b].forEach(function (x) {
          var cs = getComputedStyle(x.p);
          var inner = x.p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 4;
          h.fitText(x.v, { maxWidth: Math.min(780, inner || 780), minPx: 56 });
        });
      };
      var t0 = L.start;
      var t1 = Math.max(t0 + 0.3, g.at - 0.2);
      tl.fromTo(dim, { opacity: 0 }, { opacity: 1, duration: 0.1, immediateRender: false }, t0);
      tl.fromTo(a.p, { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.18, ease: "power3.out", immediateRender: false }, t0);
      tl.fromTo(b.p, { scale: 1.5, rotation: -6, opacity: 0 }, { scale: 1, rotation: -2, opacity: 1, duration: 0.2, ease: "power4.out", immediateRender: false }, t1);
      tl.fromTo(a.p, { opacity: 1 }, { opacity: 0.55, duration: 0.2, ease: "power2.out", immediateRender: false }, t1);
      fadeOut(tl, [dim, wrap], L.exitAt);
    },

    /* so-sanh: hai dòng đối lập xếp chồng giữa vùng an toàn (y ~700–1110, trên phụ đề). text = [dòng 1, dòng 2],
       mỗi dòng dạng "NHÃN: GIÁ TRỊ". Dòng mạnh nền xanh brand, dòng yếu nền đỏ accent-2 (đập vào, nghiêng nhẹ).
       Linh vật (asset, vd. linh-vat-co-bap) đứng ở mép phải dòng mạnh, là hình linh vật duy nhất của khung.
       Dòng 1 vào xong đúng `at`; dòng 2 vào xong đúng lúc đọc từ đầu của nó (trong khoảng gag), không thấy thì at + 0,45s. */
    "so-sanh": function (L, g, tl, ctx) {
      var t = Array.isArray(g.text) ? g.text : [textOf(g), ""];
      var strong = g.strong === 0 || g.strong === 1 ? g.strong : weakScore(t[0]) > weakScore(t[1]) ? 1 : 0;
      var wrap = allow(h.el("div", "gr-gag-vs", null, L.layer));
      var rows = [0, 1].map(function (i) {
        var row = allow(h.el("div", "gr-gag-vs-row " + (i === strong ? "is-strong" : "is-weak"), null, wrap));
        var txt = labelled(row, t[i] || "", "gr-gag-vs-text");
        return { row: row, txt: txt };
      });
      var linhVat = null;
      if (g.asset) {
        linhVat = allow(h.el("img", "gr-gag-vs-linhvat", null, rows[strong].row));
        linhVat.src = STICKER_DIR + g.asset + ".png";
        linhVat.alt = "";
        rows[strong].row.classList.add("has-linhvat");
      }
      // bố cục cảnh có thể dời khối xuống vùng trống dưới nội dung lớn (vd. tier-board màn kết: bảng thu lên trên,
      // khối so-sanh nằm dưới bảng, trên phụ đề) bằng data-vs-top (px) trên nút cảnh
      var sceneEl = ctx.root.querySelector("#sc-" + ctx.scene.id);
      var vsTop = sceneEl ? parseFloat(sceneEl.getAttribute("data-vs-top")) : NaN;
      if (isFinite(vsTop)) wrap.style.top = Math.round(vsTop) + "px";
      L.fit = function () {
        // bố cục cảnh có thể đặt data-vs-top trong fit() của nó (đo sau khi font tải): đọc lại ở đây
        var vt = sceneEl ? parseFloat(sceneEl.getAttribute("data-vs-top")) : NaN;
        if (isFinite(vt)) wrap.style.top = Math.round(vt) + "px";
        if (sceneEl && sceneEl.hasAttribute("data-vs-compact")) wrap.classList.add("is-compact");
        rows.forEach(function (r) {
          var inner = r.row.clientWidth - (r.row.classList.contains("has-linhvat") ? 300 : 72);
          h.fitText(r.txt, { maxWidth: inner, minPx: 56 });
        });
      };
      var t1 = findWord(ctx.scene, String(t[1] || "").split(/[\s:]+/)[0], g.at + 0.3, L.exitAt - 0.3);
      if (t1 == null) t1 = g.at + 0.45;
      var times = [g.at, Math.max(g.at + 0.35, t1)];
      rows.forEach(function (r, i) {
        var at = times[i];
        if (i === strong) {
          tl.fromTo(r.row, { x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: ENTER, ease: "power3.out", immediateRender: false }, at - ENTER);
        } else {
          tl.fromTo(r.row, { scale: 1.45, rotation: -5, opacity: 0 }, { scale: 1, rotation: -1.5, opacity: 1, duration: ENTER, ease: "power4.out", immediateRender: false }, at - ENTER);
        }
      });
      if (linhVat) {
        var va = times[strong];
        tl.fromTo(linhVat, { scale: 0, rotation: -16, opacity: 0 }, { scale: 1, rotation: 6, opacity: 1, duration: 0.26, ease: "back.out(2.4)", immediateRender: false }, va - 0.1);
        clampBeforeEndCard(L, ctx.root);
      }
      fadeOut(tl, wrap, L.exitAt);
    },

    /* ba-giai-doan: ba nấc chữ bậc thang (nhỏ → to, trắng → vàng → đỏ), mỗi nấc lệch phải và xuống một bậc.
       text = [nấc 1, nấc 2, nấc 3]. Nấc 1 vào xong đúng `at`; nấc sau vào đúng lúc đọc từ cuối của nó nếu có trong
       lời (vd. "MEGALODON"), không thì chia đều; các nấc cách nhau ≥ 0,3s. asset (tuỳ chọn): một hình linh vật ở nấc cuối. */
    "ba-giai-doan": function (L, g, tl, ctx) {
      var t = Array.isArray(g.text) ? g.text.slice(0, 3) : [textOf(g)];
      var wrap = allow(h.el("div", "gr-gag-steps", null, L.layer));
      var steps = t.map(function (x, i) {
        var st = allow(h.el("div", "gr-gag-step is-" + (i + 1), null, wrap));
        allow(h.el("div", "gr-gag-step-n", String(i + 1), st));
        var tx = allow(h.el("div", "gr-gag-step-text", x, st));
        return { st: st, tx: tx };
      });
      var linhVat = null;
      if (g.asset && steps.length) {
        linhVat = allow(h.el("img", "gr-gag-steps-linhvat", null, wrap));
        linhVat.src = STICKER_DIR + g.asset + ".png";
        linhVat.alt = "";
      }
      L.fit = function () {
        steps.forEach(function (s, i) {
          var room = 870 - i * 90 - 190 - (linhVat && i === steps.length - 1 ? 200 : 0); // trừ ô số, lề, viền
          h.fitText(s.tx, { maxWidth: room, minPx: 56 });
        });
      };
      // mốc từng nấc
      var last = Math.max(g.at + 0.3 * (steps.length - 1), L.exitAt - 0.6);
      var known = steps.map(function (s, i) {
        if (i === 0) return g.at;
        var toks = String(t[i]).split(/\s+/);
        return findWord(ctx.scene, toks[toks.length - 1], g.at + 0.2, last + 0.01);
      });
      var times = known.slice();
      for (var i = 1; i < times.length; i++) {
        if (times[i] != null) continue;
        var j = i + 1;
        while (j < times.length && times[j] == null) j++;
        var hi = j < times.length ? times[j] : last;
        times[i] = times[i - 1] + (hi - times[i - 1]) / (j - i + 1);
      }
      for (var k = 1; k < times.length; k++) times[k] = Math.max(times[k], times[k - 1] + 0.3);
      steps.forEach(function (s, i) {
        tl.fromTo(s.st, { scale: 1.35, y: -20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: ENTER, ease: "power4.out", immediateRender: false }, times[i] - ENTER);
        if (i > 0) tl.to(steps[i - 1].st, { opacity: 0.6, duration: 0.15, ease: "power2.out" }, times[i] - ENTER);
      });
      if (linhVat) {
        tl.fromTo(linhVat, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2.4)", immediateRender: false }, times[times.length - 1]);
        clampBeforeEndCard(L, ctx.root);
      }
      fadeOut(tl, wrap, L.exitAt);
    },

    /* combo (shotcraft impact-feedback · hit-counter): bộ đếm đòn kiểu trò chơi đối kháng cho một điều lặp đi lặp lại
       ("QUẢNG CÁO x3"). g.text = nhãn, g.so = số đòn (2–9, mặc định 3). Mỗi đòn cách COMBO_GAP giây: số đổi, đập
       1,7→1, khối giật ngang; đòn cuối xong đúng `at`, rồi chữ "COMBO!" bật ra. Tự tìm chỗ trống như sticker. */
    combo: function (L, g, tl, ctx) {
      var n = comboCount(g);
      var box = allow(h.el("div", "gr-gag-combo", null, L.layer));
      var lab = allow(h.el("div", "gr-gag-combo-label", textOf(g) || "COMBO", box));
      var row = allow(h.el("div", "gr-gag-combo-row", null, box));
      allow(h.el("span", "gr-gag-combo-x", "x", row));
      var nums = allow(h.el("span", "gr-gag-combo-nums", null, row));
      var digits = [];
      for (var k = 1; k <= n; k++) digits.push(allow(h.el("span", "gr-gag-combo-n", String(k), nums)));
      var tag = allow(h.el("div", "gr-gag-combo-tag", "COMBO!", box));
      L.fit = function () {
        h.fitText(lab, { maxWidth: 560, minPx: 44 });
        var w = box.offsetWidth, hh = box.offsetHeight;
        var avoid = avoidRects(ctx.root, ctx.scene, L.start, L.end);
        var cands = [];
        [930 - w, 60, Math.round((990 - w) / 2)].forEach(function (x) {
          topsAround(640, 260, 1180 - hh, 20).forEach(function (y) { cands.push({ x: x, y: y, w: w, h: hh }); });
        });
        var spot = pickSpot(cands, avoid);
        if (!spot) return;
        box.style.left = spot.x + "px";
        box.style.top = spot.y + "px";
      };
      var hits = [];
      for (var i = 0; i < n; i++) hits.push(g.at - (n - 1 - i) * COMBO_GAP);
      tl.fromTo(box, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(2.4)", immediateRender: false }, Math.max(L.start, hits[0] - 0.12));
      digits.forEach(function (d, i) {
        tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.001, immediateRender: false }, hits[i]);
        tl.fromTo(d, { scale: 1.7 }, { scale: 1, duration: 0.14, ease: "power4.out", immediateRender: false }, hits[i]);
        if (i + 1 < n) tl.fromTo(d, { opacity: 1 }, { opacity: 0, duration: 0.001, immediateRender: false }, hits[i + 1]);
        tl.fromTo(box, { x: i % 2 ? -10 : 10 }, { x: 0, duration: 0.1, ease: "power2.out", immediateRender: false }, hits[i]);
      });
      tl.fromTo(tag, { scale: 0, rotation: -18, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.2, ease: "back.out(2.4)", immediateRender: false }, g.at + 0.08);
      fadeOut(tl, box, L.exitAt);
    },

    /* keo-so-sanh (shotcraft before-after-slider-scrub): hai ảnh của cùng ứng dụng chồng lên khung hình ứng dụng của cảnh
       (data-gag-media), thanh chia lao từ mép phải vào 38% bề rộng (0,3s, chậm dần) xong đúng `at`, rồi trượt chậm tới
       55% tới hết gag. Trái: ảnh 1 + nhãn 1; phải: ảnh 2 + nhãn 2. g.anh = ["screenshot:1", "screenshot:3"] (bắt buộc),
       g.text = ["KỲ VỌNG", "THỰC TẾ"] (mặc định "TRƯỚC" / "SAU"). Dùng cho cặp đối lập có thật trên ảnh của ứng dụng. */
    "keo-so-sanh": function (L, g, tl, ctx) {
      var media = ctx.scene.media;
      var srcs = (g.anh || []).map(function (x) { return h.mediaFor(media, x); });
      if (srcs.length < 2 || !srcs[0] || !srcs[1]) {
        console.warn("gags.js: keo-so-sanh cảnh " + ctx.scene.id + " cần 'anh' gồm hai nhịp ảnh có thật, bỏ qua");
        return;
      }
      var labels = Array.isArray(g.text) && g.text.length >= 2 ? g.text : ["TRƯỚC", "SAU"];
      var wrap = allow(h.el("div", "gr-gag-slider", null, L.layer));
      var imgs = srcs.slice(0, 2).map(function (src, i) {
        var pane = allow(h.el("div", "gr-gag-slider-pane", null, wrap));
        var img = allow(h.el("img", "gr-gag-slider-img", null, pane));
        img.src = src;
        img.alt = "";
        return { pane: pane, img: img, src: src };
      });
      var bar = allow(h.el("div", "gr-gag-slider-bar", null, wrap));
      allow(h.el("div", "gr-gag-slider-knob", null, bar));
      var tags = labels.slice(0, 2).map(function (t, i) {
        return allow(h.el("div", "gr-gag-slider-tag" + (i ? " is-right" : ""), String(t), wrap));
      });
      var W = 870;
      // đặt chỗ NGAY (trước khi dựng tween): vị trí thanh chia phụ thuộc bề rộng khung
      (function place() {
        var m = mediaRectAt(ctx, g.at) || { x: 60, y: 640, w: 870, h: 520 };
        wrap.style.left = m.x + "px";
        wrap.style.top = m.y + "px";
        wrap.style.width = m.w + "px";
        wrap.style.height = m.h + "px";
        W = m.w;
        imgs.forEach(function (o) {
          var mc = h.cropFor(media, o.src);
          if (mc && mc.iw && mc.ih) h.placeCrop(o.img, { x: mc.x, y: mc.y, w: mc.w, h: mc.h }, mc.iw, mc.ih, m.w, m.h, { mode: "cover" });
        });
        tags.forEach(function (t) { h.fitText(t, { maxWidth: m.w * 0.45, minPx: 40 }); });
      })();
      var clipAt = function (x) { return "inset(0px 0px 0px " + Math.round(x) + "px)"; };
      var fling = g.at - 0.3;
      tl.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power2.out", immediateRender: false }, L.enterAt - 0.25);
      tl.fromTo(tags[0], { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", immediateRender: false }, L.enterAt - 0.2);
      var x0 = function () { return W; };
      // tween đầu của thanh và ảnh 2 dựng trạng thái ban đầu ngay (thanh ở mép phải, ảnh 2 bị che hết)
      tl.fromTo(imgs[1].pane, { clipPath: clipAt(x0()), webkitClipPath: clipAt(x0()) },
        { clipPath: clipAt(x0() * 0.38), webkitClipPath: clipAt(x0() * 0.38), duration: 0.3, ease: "expo.out" }, fling);
      tl.fromTo(bar, { x: x0() - 6 }, { x: x0() * 0.38 - 6, duration: 0.3, ease: "expo.out" }, fling);
      tl.fromTo(tags[1], { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.15, ease: "power2.out", immediateRender: false }, g.at - 0.1);
      var slow = Math.max(0.3, L.exitAt - g.at);
      tl.fromTo(imgs[1].pane, { clipPath: clipAt(x0() * 0.38), webkitClipPath: clipAt(x0() * 0.38) },
        { clipPath: clipAt(x0() * 0.55), webkitClipPath: clipAt(x0() * 0.55), duration: slow, ease: "power1.inOut", immediateRender: false }, g.at);
      tl.fromTo(bar, { x: x0() * 0.38 - 6 }, { x: x0() * 0.55 - 6, duration: slow, ease: "power1.inOut", immediateRender: false }, g.at);
      fadeOut(tl, wrap, L.exitAt);
    },

    "dong-bang": function (L, g, tl) {
      var gray = allow(h.el("div", "gr-gag-freeze", null, L.layer));
      var txt = allow(h.el("div", "gr-gag-big", textOf(g) || "KHOAN…", L.layer));
      L.fit = function () { fitBig(txt, 72); };
      tl.fromTo(gray, { opacity: 0 }, { opacity: 1, duration: 0.08, immediateRender: false }, L.enterAt);
      tl.fromTo(txt, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "power4.out", immediateRender: false }, L.enterAt);
      fadeOut(tl, [gray, txt], L.exitAt);
    },
  };

  /* Dựng gag của một cảnh; trả về { fit, animate } để appreel.js gom vào timeline. */
  GR.buildGags = function (root, scene) {
    var gags = scene.gags || [];
    if (!gags.length) return null;
    var built = [];
    var n = scene.id * 7; // lệch phải/trái giữa các cảnh nhưng cố định
    var sceneNode = root.querySelector("#sc-" + scene.id);
    var stickerSide = sceneNode ? sceneNode.getAttribute("data-sticker-side") : null;
    gags.forEach(function (g, i) {
      var make = KINDS[g.kind];
      if (!make) {
        console.warn("gags.js: chưa dựng gag '" + g.kind + "' (cảnh " + scene.id + "), bỏ qua");
        return;
      }
      var L = makeLayer(root, scene, g, 20, i, PRE[g.kind] ? PRE[g.kind](g) : 0);
      built.push({ L: L, g: g, make: make, n: n + i });
    });
    // animate chạy sau khi font đã tải: dựng DOM của gag rồi co chữ vừa khung ngay tại đó
    return {
      animate: function (tl) {
        built.forEach(function (b) {
          b.make(b.L, b.g, tl, { root: root, n: b.n, sceneType: scene.type, scene: scene, stickerSide: stickerSide });
          if (b.L.fit) b.L.fit();
        });
      },
    };
  };
})();
