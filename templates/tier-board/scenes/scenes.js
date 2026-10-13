/* Cảnh của tier-board: intro (hook), item (một ứng dụng), outro (kết). Bảng xếp hạng dựng trong board.js.
 *
 * item:
 *   - đầu cảnh: dải hình trượt vào đè lên bảng, nhãn tên ứng dụng màu accent phía trên dải;
 *   - shots header/screenshot:N → ảnh crossfade xong đúng `at`, zoom/pan chậm; trailer → video tắt tiếng;
 *   - fact:<nhãn> → thẻ nhỏ bật lên dưới dải, xong đúng `at` (tối đa 3);
 *   - text (lần sau) → nhịp nhấn: dải đập nhẹ;
 *   - shots[].kieu (kieu-hinh.js): dap-zoom, dap-zoom-rung, cat-nhay, chia-o trên dải; lat-the, dem-so trên thẻ;
 *   - trước lúc icon rơi vào hàng (board.js) 0,35s: dải và nhãn tên rút đi, để lộ bảng.
 * Cảnh không có ảnh: tên ứng dụng hiện thành băng chữ lớn thay cho dải.
 */
(function () {
  "use strict";
  var TB = (window.TierBoard = window.TierBoard || {});
  var STRIP = { left: 0, top: 630, width: 1080, height: 560 };
  var STICKER = "_shared/sticker/";
  var introPool = null;
  var introCount = 0;
  var boardBuilt = false;

  function withBoard(ctx, part) {
    if (boardBuilt) return part;
    boardBuilt = true;
    var board = TB.buildBoard(ctx);
    return {
      fit: function () {
        board.fit();
        if (part.fit) part.fit();
      },
      animate: function (tl) {
        board.animate(tl);
        part.animate(tl);
      },
    };
  }

  /* Ảnh/video của các shot trong dải. Trả về danh sách lớp để animate. */
  function buildMedia(ctx, strip) {
    var h = ctx.helpers;
    var cam = h.el("div", "tb-cam", null, strip);
    strip.__cam = cam;
    var s = ctx.scene;
    var layers = [];
    (s.shots || []).forEach(function (sh, i) {
      if (!h.isMediaShow(sh.show)) return;
      if (sh.show === "clip") {
        if (!s.media || !s.media.clip) return;
        // video đặt thẳng trong root (không lồng trong phần tử có data-start), trùng khung dải
        var v = h.el("video", "tb-strip-video", null, ctx.root);
        v.muted = true;
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.src = s.media.clip;
        v.style.cssText = "position:absolute;left:" + STRIP.left + "px;top:" + STRIP.top + "px;width:" + STRIP.width +
          "px;height:" + STRIP.height + "px;object-fit:cover;z-index:11;opacity:0;";
        var vs = i === 0 ? s.start : Math.max(s.start, sh.at - 0.25);
        h.timed(v, vs, Math.max(0.1, sh.end - vs), 10);
        v.setAttribute("data-media-start", String(sh.from || 0));
        layers.push({ shot: sh, index: i, node: v, video: true });
        return;
      }
      var src = h.mediaFor(s.media, sh.show);
      if (!src) return;
      // ảnh nằm trong máy quay kiểu hình (kieu-hinh.js) bên trong máy quay của dải: hai chuyển động cộng dồn
      var img = h.el("img", "tb-shot", null, window.AppReel.kieu ? window.AppReel.kieu.cam(cam) : cam);
      img.src = src;
      img.alt = "";
      img.setAttribute("data-layout-allow-overflow", "");
      layers.push({ shot: sh, index: i, node: img });
    });
    return layers;
  }

  function animateMedia(tl, h, s, layers, until, strip) {
    var KH = window.AppReel.kieu || null;
    function entry(L) {
      return L.index === 0 ? s.start : h.enterAt(L.shot.at, 0.3 + (KH ? KH.lead(L.shot) : 0), s.start);
    }
    layers.forEach(function (L, j) {
      var sh = L.shot;
      var inAt = entry(L);
      if (inAt >= until) return;
      tl.fromTo(L.node, { opacity: 0 }, { opacity: 1, duration: L.index === 0 ? 0.15 : 0.3, ease: "power2.out" }, inAt);
      if (L.video) return;
      var z0 = j % 2 ? 1.12 : 1.0;
      var z1 = j % 2 ? 1.02 : 1.1;
      tl.fromTo(L.node, { scale: z0, xPercent: j % 2 ? 2 : -2 },
        { scale: z1, xPercent: j % 2 ? -2 : 2, duration: Math.max(0.5, Math.min(sh.end, until) - inAt + 0.3), ease: h.EASE_FLOW }, inAt);
      // kiểu hình của nhịp: máy quay về 1× lúc ảnh kế tiếp bắt đầu vào, hoặc lúc dải rút đi
      if (KH && sh.kieu && strip && sh.at < until - 0.3) {
        var nx = null;
        for (var q = j + 1; q < layers.length; q++) if (!layers[q].video) { nx = layers[q]; break; }
        var nxIn = nx ? Math.min(entry(nx), until) : until;
        KH.shot(tl, { box: strip, cam: strip.__cam.__khCam, shot: sh, media: s.media, src: L.node.getAttribute("src"),
          region: null, until: nxIn, floor: s.start });
      }
    });
  }

  /* Lớp đè lên bảng xếp hạng là chủ ý của bố cục: báo cho `hyperframes check`. */
  function overlay(node) {
    node.setAttribute("data-layout-allow-overlap", "");
    node.setAttribute("data-layout-allow-occlusion", "");
    Array.prototype.forEach.call(node.querySelectorAll("*"), function (c) {
      c.setAttribute("data-layout-allow-overlap", "");
      c.setAttribute("data-layout-allow-occlusion", "");
    });
    return node;
  }
  TB.overlay = overlay;

  function banner(ctx, text) {
    var wrap = ctx.helpers.el("div", "tb-banner", null, ctx.el);
    var t = ctx.helpers.el("div", "tb-banner-text", text, wrap);
    overlay(wrap);
    return { wrap: wrap, text: t };
  }

  /* Ảnh cho hook: ứng dụng hạng cao nhất trước, mỗi ứng dụng một ảnh; dùng chung cho các cảnh intro. */
  function poolOf(ctx) {
    if (introPool) return introPool;
    var order = ["SSS", "S", "A", "B", "C", "D"];
    var its = ctx.items.slice().sort(function (a, b) {
      return order.indexOf(TB.tierOf(a.sc)) - order.indexOf(TB.tierOf(b.sc));
    });
    introPool = [];
    its.forEach(function (it) {
      var m = it.scene.media;
      var src = m ? ctx.helpers.mediaFor(m, "screenshot:1") || ctx.helpers.mediaFor(m, "header") : null;
      if (src) introPool.push(src);
    });
    its.forEach(function (it) {
      var m = it.scene.media;
      var src = m ? ctx.helpers.mediaFor(m, "screenshot:2") : null;
      if (src && introPool.indexOf(src) < 0) introPool.push(src);
    });
    return introPool;
  }

  /* Ảnh đại diện mỗi hạng (ứng dụng đầu tiên của hạng): khi lời đọc của một nhịp hook nhắc tới một hạng ("hạng S",
     "C với D", "ba S") thì nhịp đó dùng ảnh ứng dụng của hạng ấy, để chữ, lời và hình nói cùng một chuyện. */
  function tierImages(ctx) {
    var out = {};
    ctx.items.forEach(function (it) {
      var t = TB.tierOf(it.sc);
      var m = it.scene.media;
      var src = m ? ctx.helpers.mediaFor(m, "screenshot:1") || ctx.helpers.mediaFor(m, "header") : null;
      if (src && !out[t]) out[t] = src;
    });
    return out;
  }
  function tierSaid(words, from, to) {
    var TIERS = ["SSS", "S", "A", "B", "C", "D"];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.start < from - 0.01 || w.start >= to) continue;
      var tok = String(w.text).replace(/[.,!?…:;"'()]/g, "").trim();
      if (TIERS.indexOf(tok) < 0) continue;
      var prev = i > 0 ? String(words[i - 1].text).toLowerCase().replace(/[.,!?…:;"'()]/g, "") : "";
      if (tok === "S" && prev === "ba") return "SSS";
      return tok;
    }
    return null;
  }

  /* Mỗi khung tối đa MỘT hình logo/linh vật (ưu tiên: logo end-card > sticker gag > linh vật nhỏ > logo-bug,
     logo-bug của tier-board chỉ còn chữ). linh vật nhỏ mờ đi (0,15s) khi sticker gag linh vật hiện và trước end-card. */
  function endCardAt(ctx) {
    var sc = ctx.data && ctx.data.script;
    if (sc && sc.end_card === false) return Infinity;
    var all = (ctx.data && ctx.data.timeline && ctx.data.timeline.scenes) || [];
    var last = all[all.length - 1];
    if (!last) return Infinity;
    var at = Math.max(last.start, ctx.total - 2.8);
    var w = last.words || [];
    for (var i = w.length - 1; i >= 0; i--) {
      if (String(w[i].text).toLowerCase().replace(/[^a-zà-ỹđ]/g, "") === "theo") { at = w[i].start; break; }
    }
    return Math.min(at, ctx.total - 1.2);
  }
  TB.endCardAt = endCardAt;

  function guardLinhVat(tl, ctx, node, from, to) {
    var F = 0.15;
    var ec = endCardAt(ctx);
    (ctx.scene.gags || []).forEach(function (g) {
      // gag mang hình linh vật: sticker; so-sanh, ba-giai-doan khi có asset (gags.js)
      var withLinhVat = g.kind === "sticker" || ((g.kind === "so-sanh" || g.kind === "ba-giai-doan") && g.asset);
      if (!withLinhVat || g.at == null) return;
      var off = Math.max(ctx.scene.start, g.at - 0.25) - F;
      var on = Math.min(ctx.scene.end, (g.end != null ? g.end : g.at + 1) + 0.2);
      if (on <= from || off >= to) return;
      tl.to(node, { opacity: 0, duration: F, ease: "power2.out" }, Math.max(from, off));
      if (on + F < to && on + F < ec - F) tl.to(node, { opacity: 1, duration: F, ease: "power2.out" }, on);
    });
    if (ec > from && ec - F < to) tl.to(node, { opacity: 0, duration: F, ease: "power2.out" }, Math.max(from, ec - F));
  }

  function linhVat(ctx, asset, cls) {
    var img = ctx.helpers.el("img", "tb-linhvat " + (cls || ""), null, ctx.el);
    ctx.helpers.hideIfMissing(img); // chưa có linh vật (kenh/nhan-vat.md) thì không hiện gì
    img.src = STICKER + asset + ".png";
    img.alt = "";
    overlay(img);
    return img;
  }

  /* Hook: khung t = 0 có chữ hook + ảnh ứng dụng + dải icon các ứng dụng + linh vật; ảnh đổi theo từng shot của timeline. */
  TB.intro = function (ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var pool = poolOf(ctx);
    var strip = h.el("div", "tb-strip tb-strip-intro", null, ctx.el);
    strip.setAttribute("data-gag-media", ""); // khung hình ứng dụng cho gag dau-chu (gags.js)
    var cam = h.el("div", "tb-cam", null, strip);
    var shots = (s.shots || []).length ? s.shots : [{ at: s.start, end: s.end }];
    var byTier = tierImages(ctx);
    var imgs = pool.length ? shots.map(function (sh, k) {
      var img = h.el("img", "tb-shot", null, cam);
      var said = tierSaid(s.words || [], k === 0 ? s.start : sh.at, sh.end != null ? sh.end : s.end);
      img.src = (said && byTier[said]) || pool[(introCount + k) % pool.length];
      img.alt = "";
      img.setAttribute("data-layout-allow-overflow", "");
      return { node: img, shot: sh, k: k };
    }) : [];
    introCount += shots.length;
    var icons = h.el("div", "tb-intro-icons", null, ctx.el);
    ctx.items.forEach(function (it) {
      var m = it.scene.media;
      if (!m || !(m.icon || m.icon_crop || h.mediaFor(m, "header"))) return;
      var b = h.el("div", "tb-intro-icon", null, icons);
      TB.fillIcon(h, b, m);
    });
    var b = banner(ctx, h.stripRank(ctx.sc.on_screen_text || ""));
    b.wrap.classList.add("tb-banner-intro");
    var v = linhVat(ctx, ctx.typeIndex === 0 ? "linh-vat-tinh-ngu" : "linh-vat-nghi", "tb-linhvat-intro");
    var first = s.start < 0.01;
    return withBoard(ctx, {
      fit: function () {
        [strip, icons].forEach(overlay);
        h.fitText(b.text, { maxWidth: 940, maxHeight: 230, minPx: 84 });
      },
      animate: function (tl) {
        var t0 = s.start;
        // cảnh đầu: mọi thứ đã có ở t = 0 (không fade từ đen); cảnh intro sau: vào nhanh 0,2s
        var d = first ? 0.01 : 0.2;
        tl.fromTo([strip, b.wrap, icons, v], { opacity: first ? 1 : 0 }, { opacity: 1, duration: d }, t0);
        imgs.forEach(function (L, j) {
          var inAt = j === 0 ? t0 : h.enterAt(L.shot.at, 0.25, t0);
          if (j > 0) tl.fromTo(L.node, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, inAt);
          else tl.fromTo(L.node, { opacity: 1 }, { opacity: 1, duration: 0.01 }, t0);
          var end = j + 1 < imgs.length ? imgs[j + 1].shot.at + 0.3 : s.end;
          tl.fromTo(L.node, { scale: j % 2 ? 1.18 : 1.0, xPercent: j % 2 ? 3 : -3 },
            { scale: j % 2 ? 1.04 : 1.14, xPercent: j % 2 ? -3 : 3, duration: Math.max(0.4, end - inAt), ease: h.EASE_FLOW }, inAt);
          // dải icon nháy theo nhịp đổi hình
          if (j > 0) tl.fromTo(icons, { scale: 1.08 }, { scale: 1, duration: 0.3, ease: h.EASE_IN, immediateRender: false }, L.shot.at);
        });
        tl.fromTo(b.text, { scale: 1 }, { scale: 1.06, duration: s.duration, ease: h.EASE_FLOW }, t0);
        tl.fromTo(v, { y: 0, rotation: -4 }, { y: -18, rotation: 4, duration: s.duration, ease: "power1.inOut" }, t0);
        guardLinhVat(tl, ctx, v, t0, s.end - 0.2);
        tl.to([b.wrap, strip, icons, v], { opacity: 0, duration: 0.2, ease: "power2.in" }, Math.max(t0, s.end - 0.2));
      },
    });
  };

  TB.item = function (ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var sc = ctx.sc;
    var el = h.el;
    var drop = TB.dropAt(s, sc);
    var leave = Math.max(s.start + 0.6, drop - TB.RETURN_BEFORE - 0.05);

    var strip = el("div", "tb-strip", null, ctx.el);
    strip.setAttribute("data-gag-media", ""); // khung hình ứng dụng cho gag dau-chu (gags.js)
    var layers = buildMedia(ctx, strip);
    var hasMedia = layers.length > 0;
    var appName = sc.app && sc.app.name ? h.shortName(sc.app.name, 26) : h.stripRank(sc.on_screen_text || "");
    var name = el("div", "tb-name", hasMedia ? appName : h.stripRank(sc.on_screen_text || ""), ctx.el);
    var big = hasMedia ? null : banner(ctx, appName);
    if (big) big.wrap.classList.add("tb-banner-item");
    if (!hasMedia) ctx.el.classList.add("tb-nomedia");
    var LINHVAT_BY_TIER = { SSS: "linh-vat-duyet", S: "linh-vat-duyet", A: "linh-vat-cuoi", B: "linh-vat-nghi", C: "linh-vat-buc", D: "linh-vat-ngu-gat" };
    var buddy = linhVat(ctx, LINHVAT_BY_TIER[TB.tierOf(sc)] || "linh-vat-nghi", "tb-linhvat-strip");
    // chỗ dành sẵn cho sticker gag sau khi dải rút đi (bảng về giữa khung): góc phải dưới phụ đề, không che bảng
    var slot = el("div", "tb-gag-slot", null, ctx.el);
    slot.setAttribute("data-gag-slot", "");
    slot.setAttribute("data-avoid-from", String(Math.round(leave * 1000) / 1000));

    var factByLabel = {};
    (sc.facts || []).forEach(function (f) { factByLabel[f.label] = f; });
    var factsBox = el("div", "tb-facts", null, ctx.el);
    var cards = [];
    var punches = [];
    (s.shots || []).forEach(function (sh, i) {
      var m = /^fact:(.+)$/.exec(sh.show || "");
      if (m && factByLabel[m[1]] && cards.length < 3) {
        var c = el("div", "tb-fact tb-fact-p" + cards.length, null, factsBox);
        el("div", "tb-fact-label", factByLabel[m[1]].label, c);
        el("div", "tb-fact-value", factByLabel[m[1]].value, c);
        cards.push({ shot: sh, node: c });
      } else if (i > 0 && sh.show === "text") {
        punches.push(sh);
      }
    });

    return withBoard(ctx, {
      fit: function () {
        [strip, name, factsBox, buddy, slot].forEach(overlay);
        h.fitText(name, { maxWidth: 870, minPx: 44 });
        if (big) h.fitText(big.text, { maxWidth: 870, maxHeight: 420, minPx: 84 });
        // thẻ rộng tối đa 870 (lề 20 + viền 4 mỗi bên): chữ trong 822px, nhãn ≥ 44, giá trị ≥ 56
        cards.forEach(function (c) {
          h.fitText(c.node.firstChild, { maxWidth: 822, minPx: 44 });
          h.fitText(c.node.lastChild, { maxWidth: 822, minPx: 56 });
        });
        // con dấu (nếu cảnh có verdict): tâm y 900, cỡ 0,8 — dưới bảng đã thu nhỏ (board.js), trên phụ đề
        ctx.el.setAttribute("data-stamp-center-y", String(TB.STAMP_CENTER_Y));
        ctx.el.setAttribute("data-stamp-scale", String(TB.STAMP_SCALE));
      },
      animate: function (tl) {
        var t0 = s.start;
        // dải trượt vào từ phải (chuyển mục, đi cùng sfx whoosh), nhãn tên vào sau 0,3s
        if (hasMedia) {
          tl.fromTo(strip, { opacity: 1, x: 1080 }, { opacity: 1, x: 0, duration: 0.3, ease: h.EASE_IN }, t0);
          animateMedia(tl, h, s, layers, leave, strip);
        } else {
          tl.fromTo(big.wrap, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: h.EASE_IN }, t0);
          // không có ảnh: chữ trôi và phóng chậm suốt cảnh để khung không đứng yên
          tl.fromTo(big.text, { scale: 1, y: 20 }, { scale: 1.12, y: -20, duration: Math.max(0.5, leave - t0), ease: h.EASE_FLOW }, t0);
        }
        tl.fromTo(name, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.3, ease: h.EASE_IN }, t0 + 0.3);

        // thẻ dùng chung một ô dưới phụ đề: thẻ mới bật vào thì thẻ cũ trượt ra (không hai thẻ mới cùng lúc, cách ≥ 0,3s)
        var prevAt = -Infinity;
        cards.forEach(function (c, j) {
          var lead = window.AppReel.kieu ? window.AppReel.kieu.lead(c.shot) : 0;
          var at = Math.max(prevAt + 0.3, Math.min(leave - 0.3, h.enterAt(c.shot.at - lead, 0.25, t0 + 0.6 + 0.3 * j)));
          c.at = at;
          prevAt = at;
          var rot = [-2, 1.5, -1][j % 3];
          tl.fromTo(c.node, { opacity: 0, y: 30, scale: 0.6, x: 0, rotation: rot }, { opacity: 1, y: 0, scale: 1, x: 0, rotation: rot, duration: 0.25, ease: "back.out(2.4)", immediateRender: false }, at);
          if (j > 0) tl.to(cards[j - 1].node, { opacity: 0, x: -80, duration: 0.18, ease: "power2.in" }, at - 0.05);
          // lat-the / dem-so (kieu-hinh.js): lật hoặc đếm xong đúng `at` của nhịp
          if (window.AppReel.kieu) window.AppReel.kieu.fact(tl, { card: c.node, value: c.node.lastChild, shot: c.shot });
        });
        cards.forEach(function (c, j) {
          // gag (sticker, nhãn zoom) không đè thẻ đang hiện
          c.node.setAttribute("data-gag-avoid", "");
          c.node.setAttribute("data-avoid-from", String(Math.round(c.at * 1000) / 1000));
          c.node.setAttribute("data-avoid-to", String(Math.round((j + 1 < cards.length ? cards[j + 1].at : leave) * 1000) / 1000));
        });
        // nhấn theo từ khoá (emphasis) trong lời đọc: khung hình đập nhẹ đúng lúc đọc
        var keys = (sc.emphasis || []).map(function (w) { return String(w).toLowerCase(); });
        (s.words || []).forEach(function (w) {
          var t = String(w.text).toLowerCase().replace(/[.,!?…:;"'()]/g, "");
          if (keys.indexOf(t) < 0 || w.start >= leave - 0.2) return;
          tl.fromTo(hasMedia ? strip : big.text, { scale: 1.07 }, { scale: 1, duration: 0.3, ease: h.EASE_IN, immediateRender: false }, w.start);
        });
        punches.forEach(function (sh) {
          if (sh.at >= leave) return;
          tl.fromTo(strip, { scale: 1.035 }, { scale: 1, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, sh.at - 0.05);
        });

        // linh vật ngồi góc dưới phải suốt phần kể ứng dụng, lắc nhẹ ở mỗi nhịp
        tl.fromTo(buddy, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t0 + 0.4);
        guardLinhVat(tl, ctx, buddy, t0 + 0.7, leave);
        // nhịp không đổi ảnh (fact, text, header lặp): đổi khung máy quay rõ ràng (zoom + dịch) để hình không đứng
        var cam = strip.__cam;
        var FR = [{ scale: 1.22, xPercent: -6, yPercent: -4 }, { scale: 1.0, xPercent: 0, yPercent: 0 },
          { scale: 1.28, xPercent: 6, yPercent: 5 }, { scale: 1.0, xPercent: 0, yPercent: 0 }];
        var fi = 0;
        var cur = FR[1];
        var allShots = s.shots || [];
        // nhịp dài (> 2,5 giây, vd. TTS đọc tên ứng dụng dài): sau cú đẩy khung, máy quay trôi chậm (zoom + dịch)
        // tới nhịp kế tiếp để khung không đứng yên. Mọi tween máy quay dùng fromTo với giá trị tường minh.
        function drift(f, from, to, k) {
          if (!(cam && hasMedia) || to - from < 2.5) return f;
          var dx = f.xPercent > 0 ? -4 : 4;
          var dy = k % 2 ? 3 : -3;
          var g = { scale: f.scale + 0.1, xPercent: f.xPercent + dx, yPercent: f.yPercent + dy };
          tl.fromTo(cam, { scale: f.scale, xPercent: f.xPercent, yPercent: f.yPercent },
            { scale: g.scale, xPercent: g.xPercent, yPercent: g.yPercent, duration: to - from, ease: h.EASE_FLOW, immediateRender: false }, from);
          return g;
        }
        function beatEnd(i) {
          var nx = allShots[i + 1];
          var e = nx && nx.at < leave - 0.3 ? nx.at - 0.35 : leave;
          return Math.min(e, leave);
        }
        allShots.forEach(function (sh, i) {
          if (i === 0) {
            cur = drift(cur, t0 + 0.3, beatEnd(0), i);
            return;
          }
          if (sh.at >= leave - 0.3) return;
          var media = h.isMediaShow(sh.show) && sh.show !== "header";
          if (cam && hasMedia) {
            // ảnh mới: trả khung về toàn cảnh; nhịp khác: lần lượt đẩy vào hai góc khác nhau
            var f = media ? FR[1] : FR[fi++ % 2 === 0 ? 0 : 2];
            var p0 = Math.max(t0, sh.at - 0.35);
            tl.fromTo(cam, { scale: cur.scale, xPercent: cur.xPercent, yPercent: cur.yPercent },
              { scale: f.scale, xPercent: f.xPercent, yPercent: f.yPercent, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, p0);
            cur = drift(f, p0 + 0.35, beatEnd(i), i);
          }
          tl.fromTo(buddy, { rotation: i % 2 ? 8 : -8, y: -16 }, { rotation: 0, y: 0, duration: 0.35, ease: "back.out(2)", immediateRender: false }, sh.at);
        });
        // rút đi để lộ bảng đúng lúc icon rơi vào hàng
        var out = [name, factsBox, buddy];
        out.push(hasMedia ? strip : big.wrap);
        tl.to(out, { opacity: 0, duration: 0.25, ease: "power2.in" }, leave);
        layers.forEach(function (L) {
          if (L.video) tl.to(L.node, { opacity: 0, duration: 0.25, ease: "power2.in" }, leave);
        });
      },
    });
  };

  /* Mốc đọc câu hỏi của màn kết: hai từ đầu của chữ trên màn hình ("BẠN ĐỨNG…") trong lời đọc; không thấy thì từ
     đầu của câu hỏi (câu kết thúc bằng "?"); không có nữa thì 40% cảnh (tối đa 2,5s). */
  function questionAt(s, text) {
    var words = s.words || [];
    function n(x) { return String(x).toLowerCase().normalize("NFC").replace(/[.,!?…:;"'()]/g, "").trim(); }
    var toks = String(text).split(/\s+/).map(n).filter(Boolean).slice(0, 2);
    for (var i = 0; toks.length && i + toks.length <= words.length; i++) {
      var ok = toks.every(function (t, k) { return n(words[i + k].text) === t; });
      if (ok) return words[i].start;
    }
    var sentence = 0;
    for (var j = 0; j < words.length; j++) {
      var raw = String(words[j].text);
      if (/\?$/.test(raw)) return words[sentence].start;
      if (/[.!?…:]$/.test(raw)) sentence = j + 1;
    }
    return s.start + Math.min(2.5, s.duration * 0.4);
  }

  TB.outro = function (ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var text = h.stripRank(ctx.sc.on_screen_text || "");
    var b = banner(ctx, text);
    b.wrap.classList.add("tb-banner-outro");
    var v = linhVat(ctx, "linh-vat-cuoi", "tb-linhvat-item");
    var slot = ctx.helpers.el("div", "tb-gag-slot", null, ctx.el);
    slot.setAttribute("data-gag-slot", "");
    overlay(slot);
    // gag so-sanh (hai băng cao 190px) trước câu hỏi: bảng đầy đủ chiếm y 430–1170 nên băng sẽ che hàng B–D.
    // Lúc gag vào, bảng thu COMPACT lên trên (đáy ≈ y 706, vẫn đủ S→D), hai băng nằm dưới bảng (y VS_TOP → ~1170,
    // trên phụ đề); bảng giữ cỡ đó tới câu hỏi rồi về 0,72 lần như cũ.
    var qAt = Math.max(s.start + 0.4, questionAt(s, text) - 0.3);
    var COMPACT = TB.centered(0.45, 20);
    var VS_TOP = 760;
    var vsGags = (s.gags || []).filter(function (g) {
      return g.kind === "so-sanh" && g.at != null && g.at - 0.55 > s.start + 0.4 && g.at < qAt;
    });
    if (vsGags.length) ctx.el.setAttribute("data-vs-top", String(VS_TOP));
    return withBoard(ctx, {
      fit: function () {
        h.fitText(b.text, { maxWidth: 870, maxHeight: 232, minPx: 84 });
      },
      animate: function (tl) {
        // bảng đầy đủ (về lại cỡ 1 nếu vừa thu cho con dấu) để người xem soi; tới câu hỏi thì bảng thu 0,72 lần lên
        // trên, băng câu hỏi bật ra ngay dưới bảng (không che hàng nào), vào xong đúng lúc đọc câu hỏi
        var B0 = TB.board;
        if (B0 && B0.move && (B0.state.scale !== 1 || B0.state.x || B0.state.y)) B0.move(TB.FULL, s.start, 0.35);
        var at = qAt;
        if (B0 && B0.move && vsGags.length) B0.move(COMPACT, vsGags[0].at - 0.55, 0.3);
        if (B0 && B0.move) B0.move(TB.centered(0.72, 6), at - 0.05, 0.3);
        tl.fromTo(b.wrap, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: h.EASE_IN }, at);
        tl.fromTo(b.text, { scale: 1 }, { scale: 1.05, duration: Math.max(0.5, s.end - at), ease: h.EASE_FLOW }, at);
        tl.fromTo(v, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, s.start + 0.2);
        guardLinhVat(tl, ctx, v, s.start + 0.5, s.end);
        // end-card mang logo lớn: logo-bug (chữ) mờ đi trước đó
        var bug = document.querySelector(".gr-logo-bug");
        var ec = endCardAt(ctx);
        if (bug && ec < ctx.total) tl.to(bug, { opacity: 0, duration: 0.15, ease: "power2.out" }, Math.max(s.start, ec - 0.15));
        // mỗi nhịp của màn kết: soi lần lượt một ứng dụng trên bảng (từ hạng cao xuống), icon phóng to + hàng loé
        var B = TB.board;
        if (!B) return;
        var order = B.order;
        var ics = B.icons.slice().sort(function (a, c) { return order.indexOf(a.tier) - order.indexOf(c.tier); });
        var k = 0;
        (s.shots || []).forEach(function (sh) {
          if (sh.show === "logo" || !ics.length) return;
          var ic = ics[k++ % ics.length];
          tl.fromTo(ic.node, { scale: 1.5, zIndex: 3 }, { scale: 1, duration: 0.6, ease: h.EASE_IN, immediateRender: false }, sh.at);
          tl.fromTo(B.flashes[ic.tier], { opacity: 0.5 }, { opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, sh.at);
          tl.fromTo(v, { rotation: k % 2 ? 8 : -8 }, { rotation: 0, duration: 0.35, ease: "back.out(2)", immediateRender: false }, sh.at);
        });
      },
    });
  };
})();
