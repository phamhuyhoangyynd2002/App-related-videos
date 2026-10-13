/* Cảnh intro của top-list. Ba bố cục:
 *   - hook điện thoại (13/10/2026; intro không có facts, media của cảnh là ảnh dọc): xem hookPhone bên dưới.
 *   - hook (intro không có facts, ảnh ngang hoặc không có ảnh): chữ hook lớn + lưới ô các mục của video
 *     (ô có ảnh dùng header của mục đó, ô không ảnh là số hạng + thể loại). Ô của mục có `verdict`
 *     (lời giải của vòng tò mò) bị che: ảnh mờ + dấu hỏi + ổ khoá. Khung t = 0 đã đủ chữ hook và hình.
 *     Nhịp text lần 2: các ô khác rút đi, ô bí ẩn phóng to.
 *     `on_screen_subtext`: dòng lời hứa (≥ 44px) dưới chữ hook, cho người tắt tiếng biết video nói gì.
 *     `reveal_top: true`: không che hạng 1; ô hạng 1 to bên trái ngay giây 0, kéo xuống lấp phần dưới khung,
 *     các ô khác nhỏ bên phải; nhịp text sau: ô hạng 1 đập nhẹ + viền sáng.
 *   - lời hứa (intro có facts): thẻ số liệu lớn bật theo cue, câu chữ trên màn hình vào ở nhịp text.
 */
(function () {
  "use strict";
  var TL = (window.TopList = window.TopList || {});
  var SLOT_MAX = 240; // cạnh tối đa (px) của chỗ dành cho sticker ở góc ô hạng 1

  /* Chữ trong ô: tựa mục bỏ số hạng; ô nhỏ chỉ lấy đoạn đầu trước " · " hoặc ":" cho đủ to (≥ 44px). */
  function tileGenre(h, sc, full) {
    var g = h.stripRank(sc.on_screen_text || "");
    if (full) return g;
    return g.split(/\s+[·•|]\s+|:/)[0].trim();
  }

  function hook(ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var sc = ctx.sc;
    var el = h.el;
    var node = ctx.el;
    var isFirst = ctx.index === 0;
    node.classList.add("tl-intro", "tl-hook");

    var bg = el("div", "tl-bg", null, node);
    var band = el("div", "tl-band", null, bg);
    band.setAttribute("data-layout-allow-overflow", "");
    var col = el("div", "tl-col", null, node);
    var hookText = el("div", "tl-hook-text", sc.on_screen_text || "", col);
    hookText.setAttribute("data-gag-avoid", "");
    var subText = null;
    if (sc.on_screen_subtext) {
      subText = el("div", "tl-hook-sub", sc.on_screen_subtext, col);
      subText.setAttribute("data-gag-avoid", "");
    }
    var grid = el("div", "tl-grid", null, col);
    var n = ctx.items.length;
    var reveal = sc.reveal_top === true && n > 1;
    // mục hạng 1 (mục có verdict, không có thì hạng nhỏ nhất)
    var topItem = null;
    ctx.items.forEach(function (it, i) {
      var r = it.sc.rank !== undefined && it.sc.rank !== null ? it.sc.rank : i + 1;
      if (it.scene.verdict && !topItem) topItem = it;
      it._rank = r;
    });
    if (!topItem) topItem = ctx.items.slice().sort(function (a, b) { return a._rank - b._rank; })[0] || null;
    if (reveal) {
      node.classList.add("tl-reveal");
      grid.classList.add("tl-grid-hero");
      grid.style.gridTemplateRows = "repeat(" + (n - 1) + ", 1fr)";
    } else {
      grid.classList.add(n > 4 ? "tl-grid-3" : "tl-grid-2");
    }

    var mysteryItem = null;
    var heroTile = null;
    var heroSlot = null;
    var tiles = ctx.items.map(function (it) {
      var tile = el("div", "tl-tile", null, grid);
      var isHero = reveal && it === topItem;
      if (isHero) {
        tile.classList.add("tl-tile-hero");
        tile.style.gridRow = "1 / span " + (n - 1);
        heroTile = tile;
      }
      var src = it.scene.media ? h.mediaFor(it.scene.media, "header") : null;
      var isMystery = !!it.scene.verdict && !reveal;
      var tileImg = null;
      if (src) {
        tileImg = el("img", "tl-tile-img", null, tile);
        tileImg.src = src;
        tileImg.alt = ""; tileImg.setAttribute("data-layout-allow-overflow", "");
        el("div", "tl-tile-scrim", null, tile);
      }
      var rank = it.sc.rank !== undefined && it.sc.rank !== null ? it.sc.rank : ctx.items.indexOf(it) + 1;
      el("div", "tl-tile-num", "#" + rank, tile).setAttribute("data-gag-avoid", "");
      if (isMystery) {
        tile.classList.add("tl-tile-mystery");
        el("div", "tl-tile-q", "?", tile);
        el("div", "tl-lock", null, tile);
        mysteryItem = { it: it, src: src, tile: tile };
      } else {
        var lab = el("div", "tl-tile-genre", tileGenre(h, it.sc, isHero), tile);
        lab.setAttribute("data-gag-avoid", "");
      }
      var flash = el("div", "tl-tile-flash", null, tile);
      if (isHero) {
        // chỗ dành sẵn cho sticker linh vật (gags.js, data-gag-slot): góc trên phải ô hạng 1, cạnh số hạng, để sticker
        // không che vùng giữa ảnh (thường là mặt nhân vật). Cỡ đặt trong fit.
        heroSlot = el("div", "tl-sticker-slot", null, tile);
        heroSlot.setAttribute("data-gag-slot", "");
        heroSlot.setAttribute("data-layout-allow-overlap", "");
      }
      return { tile: tile, flash: flash, mystery: isMystery, hero: isHero, img: tileImg, crop: h.cropFor(it.scene.media, src) };
    });

    // ô bí ẩn cỡ lớn cho nhịp text thứ hai
    var big = null;
    // khung hình ứng dụng cho gag dau-chu (gags.js): lưới ô tới lúc ô bí ẩn phóng to, sau đó là ô bí ẩn
    var shot2 = (s.shots || [])[1];
    grid.setAttribute("data-gag-media", "");
    if (mysteryItem) {
      big = el("div", "tl-mystery-big", null, col);
      if (shot2) {
        grid.setAttribute("data-media-to", String(shot2.at - 0.35));
        // số hạng, nhãn của ô lưới chỉ cần chừa tới lúc lưới rút đi
        Array.prototype.slice.call(grid.querySelectorAll("[data-gag-avoid]")).forEach(function (n) {
          if (!n.hasAttribute("data-avoid-to")) n.setAttribute("data-avoid-to", String(shot2.at - 0.1));
        });
        big.setAttribute("data-gag-media", "");
        big.setAttribute("data-media-from", String(shot2.at - 0.35));
      }
      if (mysteryItem.src) {
        var bimg = el("img", "tl-tile-img", null, big);
        bimg.src = mysteryItem.src;
        bimg.alt = ""; bimg.setAttribute("data-layout-allow-overflow", "");
        el("div", "tl-tile-scrim", null, big);
      }
      el("div", "tl-big-q", "?", big).setAttribute("data-layout-allow-overlap", "");
      el("div", "tl-lock tl-lock-big", null, big);
    }

    return {
      fit: function () {
        var hpx = parseFloat(getComputedStyle(hookText).fontSize);
        h.fitText(hookText, { maxWidth: col.clientWidth, maxHeight: Math.max(330, Math.ceil(hpx * 1.3 * 2) + 2), minPx: 84 });
        if (subText) h.fitText(subText, { maxWidth: col.clientWidth, minPx: 44 });
        tiles.forEach(function (t) {
          var g = t.tile.querySelector(".tl-tile-genre");
          if (g) {
            // một dòng nếu vừa, không thì hai dòng cân (không rớt chữ lẻ), rồi co tới 44px nếu cần
            h.wrapBalanced(g, t.tile.clientWidth - 40);
            h.fitText(g, { maxWidth: t.tile.clientWidth - 40, maxHeight: Math.ceil(parseFloat(getComputedStyle(g).fontSize) * 1.3 * 2) + 2, minPx: 44 });
          }
          if (t.img && t.crop) h.applyCrop(t.img, t.crop, t.tile.clientWidth, t.tile.clientHeight);
        });
        if (heroSlot) {
          // vuông, sát góc trên phải (trong viền), không lấn sang số hạng ở góc trên trái
          // cạnh ≈ 36% bề rộng ô: đủ to để thấy biểu cảm, đủ nhỏ để không lấn vào giữa ảnh
          var num = heroTile.querySelector(".tl-tile-num");
          var room = heroTile.clientWidth - (num ? num.offsetLeft + h.contentWidth(num) : 0) - 24;
          var size = Math.max(150, Math.min(SLOT_MAX, Math.round(heroTile.clientWidth * 0.36), room));
          heroSlot.style.width = size + "px";
          heroSlot.style.height = size + "px";
        }
      },
      animate: function (tl) {
        var start = s.start;
        var end = s.end;
        var shots = s.shots || [];
        var second = shots.length > 1 ? shots[1] : null;
        tl.fromTo(band, { x: -40, rotation: -10 }, { x: 40, rotation: -10, duration: end - start, ease: h.EASE_FLOW }, start);
        if (!isFirst) {
          tl.fromTo(hookText, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, start);
        }
        // khung t = 0 đứng đủ: chữ hook chỉ phóng rất chậm
        tl.fromTo(hookText, { scale: 1 }, { scale: 1.03, duration: (second ? second.at : end) - start, ease: h.EASE_FLOW, transformOrigin: "0% 50%" }, start);

        // đổi ô nhanh: viền sáng chạy qua từng ô mỗi 0,45s cho tới nhịp thứ hai
        var until = second ? second.at - 0.35 : end;
        var step = 0.45;
        var count = 0;
        for (var t = start + 0.15; t < until - 0.2 && tiles.length; t += step) {
          var tt = tiles[count % tiles.length];
          tl.fromTo(tt.flash, { opacity: 1 }, { opacity: 0, duration: 0.42, ease: "power2.out", immediateRender: false }, t);
          count++;
        }
        // Ken Burns: ô hạng 1 (reveal_top) phóng chậm 1,0 → 1,16 suốt cảnh, các ô khác lùi 1,12 → 1,0 (đảo chiều xen kẽ),
        // để lưới không đứng yên cả cảnh hook (6 giây) dù chỉ có phụ đề đổi
        tiles.forEach(function (t2, i) {
          var imgs = t2.tile.querySelector(".tl-tile-img");
          if (!imgs) return;
          var z = t2.hero ? [1.0, 1.16] : i % 2 ? [1.0, 1.1] : [1.12, 1.0];
          tl.fromTo(imgs, { scale: z[0] }, { scale: z[1], duration: end - start, ease: "power1.inOut" }, start);
        });

        // sáng lần lượt từng ô theo nhịp lời đọc: sau nhịp text thứ hai, mỗi ô (hạng thấp → cao) đập nhẹ + viền sáng
        // đúng lúc một từ được đọc (chia đều các từ trong khoảng), ô hạng 1 cuối cùng (hoặc để nhịp text sau lo)
        if (reveal && second) {
          var later = shots.filter(function (sh) { return sh.at > second.at + 0.01 && sh.show === "text"; })[0];
          var w0 = second.at + 0.45;
          var w1 = (later ? later.at : end) - 0.3;
          var ws = (s.words || []).filter(function (w) { return w.start >= w0 && w.start <= w1; });
          var seq = tiles.filter(function (x) { return !x.hero; });
          if (!later) seq = seq.concat(tiles.filter(function (x) { return x.hero; }));
          if (ws.length && seq.length) {
            seq.forEach(function (t3, i) {
              var wi = seq.length === 1 ? 0 : Math.round((i * (ws.length - 1)) / (seq.length - 1));
              var at = ws[Math.min(ws.length - 1, wi)].start;
              tl.fromTo(t3.tile, { scale: 1.07 }, { scale: 1, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, at - 0.05);
              tl.fromTo(t3.flash, { opacity: 1 }, { opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, at - 0.05);
            });
          }
        }

        // nhịp text thứ hai: các ô khác rút đi, ô bí ẩn phóng to (xong đúng `at`)
        if (second && big) {
          var t0 = h.enterAt(second.at, 0.35, start);
          tiles.forEach(function (t2, i) {
            tl.fromTo(t2.tile, { opacity: 1, y: 0 }, { opacity: 0, y: 40, duration: 0.25, ease: "power2.in", immediateRender: false }, t0 + i * 0.012);
          });
          tl.fromTo(big, { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 0.35, ease: h.EASE_IN }, t0 + 0.05);
          var bq = big.querySelector(".tl-big-q");
          tl.fromTo(bq, { scale: 1 }, { scale: 1.12, duration: end - second.at, ease: h.EASE_FLOW }, second.at);
          var bimg2 = big.querySelector(".tl-tile-img");
          if (bimg2) tl.fromTo(bimg2, { scale: 1.05 }, { scale: 1.15, duration: end - t0, ease: h.EASE_FLOW }, t0);
        } else if (second && heroTile) {
          // reveal_top: mỗi nhịp text sau, ô hạng 1 đập nhẹ + viền sáng (xong đúng `at`)
          shots.slice(1).forEach(function (sh) {
            if (sh.show !== "text") return;
            var hero = tiles.filter(function (x) { return x.hero; })[0];
            tl.fromTo(heroTile, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, sh.at - 0.05);
            if (hero) tl.fromTo(hero.flash, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, sh.at - 0.05);
          });
        } else if (second) {
          tl.fromTo(hookText, { y: 0 }, { y: -12, duration: 0.3, ease: h.EASE_IN, immediateRender: false }, h.enterAt(second.at, 0.3, start));
        }
      },
    };
  }

  /* ---------- hook điện thoại (13/10/2026) ----------
   * Người làm video chê "đầu video khó thu hút": giây 0 là lưới 4 ô nhỏ, từ ~1s tới hết cảnh là ô "?" khoá đứng yên.
   * Khi media của cảnh hook là ảnh dọc (manifest gán cảnh 1 cho ứng dụng hạng 1):
   *   - khung t = 0: chữ hook lớn + dòng sub, dưới là điện thoại lớn (cao tới y 1470, rộng hơn khung mp) hiện màn hình
   *     thật của ứng dụng hạng 1, nghiêng nhẹ, ảnh phóng chậm ngay từ khung đầu (không fade, không màn đen);
   *   - không lộ tên/icon: bỏ dải trên của ảnh (chữ quảng bá, thanh tiêu đề) và che đỉnh màn bằng nhãn "APP CUỐI ?"
   *     (script: scenes[].hook_label đổi chữ nhãn; reveal_top: true thì không che); nhịp icon không đưa vào điện thoại;
   *   - mỗi nhịp ảnh đổi bằng một kiểu chuyển khác nhau (phone.js, xoay vòng vuốt ngang → đập zoom → cuộn lên);
   *   - nhịp text đầu tiên: dock icon các mục (#4 #3 #2, ô hạng 1 là "?") trồi lên ở đáy màn, các ô sáng lần lượt;
   *     nhịp text sau (và nhịp icon): điện thoại nảy nhẹ;
   *   - lần đổi ảnh cuối sau khi dock hiện ("app cuối"): dấu "?" của nhãn và ô hạng 1 đập cùng nhịp đổi ảnh.
   * Hạn chế: chưa phát clip quay màn hình trong điện thoại hook (nhịp clip bị bỏ qua, có cảnh báo console).
   */
  var HOOK_TOP = 0.2; // không có vùng cắt manifest: bỏ 20% trên của ảnh cửa hàng (chữ quảng bá, thanh trạng thái, tiêu đề)
  var BEZEL = 10; // viền điện thoại (px), khớp inset của .tl-hk-screen
  var PHONE_MAX_W = 640;
  var DOCK_MAX = 5; // dock chỉ dựng khi video có 2–5 mục (ô ≥ 84px trong bề rộng điện thoại)
  var HOOK_KINDS = ["vuot", "dap", "cuon"];

  function rankOf(it, i) {
    return it.sc.rank !== undefined && it.sc.rank !== null ? it.sc.rank : i + 1;
  }

  /* Các nhịp ảnh của hook điện thoại (ảnh của chính cảnh intro, trừ icon); không có nhịp ảnh thì dùng screenshot đầu. */
  function phoneShots(ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var media = s.media || {};
    var out = [];
    (s.shots || []).forEach(function (sh, i) {
      if (sh.show === "clip" || !h.isMediaShow(sh.show)) return;
      var src = h.mediaFor(media, sh.show);
      if (!src || src === media.icon) return; // icon lộ ứng dụng hạng 1: không đưa vào điện thoại bí ẩn
      out.push({ shot: sh, index: i, src: src });
    });
    if (!out.length && (media.screenshots || [])[0]) {
      out.push({ shot: { show: "screenshot:1", at: s.start, end: s.end }, index: 0, src: media.screenshots[0] });
    }
    return out;
  }

  function hookPhone(ctx, list) {
    var h = ctx.helpers;
    var PH = TL.phone;
    var s = ctx.scene;
    var sc = ctx.sc;
    var el = h.el;
    var node = ctx.el;
    var media = s.media || {};
    var shots = s.shots || [];
    var isFirst = ctx.index === 0;
    node.classList.add("tl-intro", "tl-hook", "tl-hookp");

    var bg = el("div", "tl-bg", null, node);
    var band = el("div", "tl-band", null, bg);
    band.setAttribute("data-layout-allow-overflow", "");
    var col = el("div", "tl-col", null, node);
    var hookText = el("div", "tl-hook-text", sc.on_screen_text || "", col);
    hookText.setAttribute("data-gag-avoid", "");
    var subText = null;
    if (sc.on_screen_subtext) {
      subText = el("div", "tl-hook-sub", sc.on_screen_subtext, col);
      subText.setAttribute("data-gag-avoid", "");
    }
    // điện thoại: phone (nghiêng, trôi) > kick (nảy theo nhịp) > screen (bo góc, cắt tràn) > khe ảnh + nhãn + dock
    var stage = el("div", "tl-hk-stage", null, col);
    var phone = el("div", "tl-hk-phone", null, stage);
    phone.setAttribute("data-gag-media", ""); // khung hình ứng dụng cho gag dau-chu (gags.js)
    var kick = el("div", "tl-hk-kick", null, phone);
    var screen = el("div", "tl-hk-screen", null, kick);
    shots.forEach(function (sh) {
      if (sh.show === "clip") console.warn("top-list: hook điện thoại chưa phát clip quay màn hình (cảnh " + s.id + "), dùng ảnh");
    });
    var layers = list.map(function (it) {
      var slot = el("div", "tl-slot", null, screen);
      slot.setAttribute("data-layout-allow-overflow", "");
      var img = el("img", "tl-shot", null, slot);
      img.src = it.src;
      img.alt = "";
      img.setAttribute("data-layout-allow-overflow", "");
      return { shot: it.shot, index: it.index, src: it.src, slot: slot, img: img };
    });

    // nhãn che đỉnh màn (tên ứng dụng thường nằm ở thanh tiêu đề): giữ vòng tò mò tới hạng 1
    var reveal = sc.reveal_top === true;
    var label = null;
    var labelQ = null;
    if (!reveal) {
      label = el("div", "tl-hk-label", null, screen);
      var lt = el("span", "tl-hk-label-text", sc.hook_label || "APP CUỐI", label);
      labelQ = el("span", "tl-hk-q", "?", label);
      label.setAttribute("data-gag-avoid", "");
      // nhãn che ảnh là chủ ý: báo cho `hyperframes check`
      [label, lt, labelQ].forEach(function (n) { n.setAttribute("data-layout-allow-overlap", ""); });
    }

    // dock icon các mục ở đáy màn, trồi lên ở nhịp text đầu tiên ("Bốn app…"); ô hạng 1 là "?"
    var dockShot = null;
    shots.forEach(function (sh, i) {
      if (!dockShot && i > 0 && sh.show === "text") dockShot = sh;
    });
    var dock = null;
    var chips = [];
    var n = ctx.items.length;
    if (dockShot && n > 1 && n <= DOCK_MAX) {
      var topItem = null;
      ctx.items.forEach(function (it) {
        if (it.scene.verdict && !topItem) topItem = it;
      });
      if (!topItem) {
        topItem = ctx.items.slice().sort(function (a, b) {
          return rankOf(a, ctx.items.indexOf(a)) - rankOf(b, ctx.items.indexOf(b));
        })[0];
      }
      dock = el("div", "tl-hk-dock", null, screen);
      dock.setAttribute("data-gag-avoid", "");
      dock.setAttribute("data-avoid-from", String(Math.max(s.start, dockShot.at - 0.3)));
      dock.setAttribute("data-layout-allow-overlap", "");
      ctx.items.forEach(function (it, i) {
        var mystery = !reveal && it === topItem;
        var chip = el("div", "tl-hk-chip" + (mystery ? " tl-hk-chip-mystery" : ""), null, dock);
        var isrc = !mystery && it.scene.media ? h.mediaFor(it.scene.media, "icon") : null;
        if (isrc) {
          var ci = el("img", "tl-hk-chip-img", null, chip);
          ci.src = isrc;
          ci.alt = "";
        }
        if (mystery) el("div", "tl-hk-chip-q", "?", chip);
        el("div", "tl-hk-chip-num", "#" + rankOf(it, i), chip);
        var flash = el("div", "tl-hk-chip-flash", null, chip);
        [chip].concat([].slice.call(chip.children)).forEach(function (c) { c.setAttribute("data-layout-allow-overlap", ""); });
        chips.push({ node: chip, flash: flash, mystery: mystery });
      });
    }
    var dapFy = 0.6; // tâm đập zoom (tỉ lệ cao màn): giữa phần màn không bị nhãn và dock che, đặt trong fit

    return {
      fit: function () {
        var hpx = parseFloat(getComputedStyle(hookText).fontSize);
        h.fitText(hookText, { maxWidth: col.clientWidth, maxHeight: Math.max(330, Math.ceil(hpx * 1.3 * 2) + 2), minPx: 84 });
        if (subText) h.fitText(subText, { maxWidth: col.clientWidth, minPx: 44 });
        // vùng ảnh được lộ: vùng cắt manifest, không có thì bỏ dải trên HOOK_TOP
        layers.forEach(function (L) {
          var sz = h.imageSize(L.img, media, L.src);
          var mc = h.cropFor(media, L.src);
          var cut = Math.round(sz.h * HOOK_TOP);
          L.size = sz;
          L.region = mc ? { x: mc.x, y: mc.y, w: mc.w, h: mc.h } : sz.w && sz.h ? { x: 0, y: cut, w: sz.w, h: sz.h - cut } : null;
        });
        // điện thoại cao hết chỗ dưới chữ (đáy chừa 16px cho góc nghiêng, tới y ≈ 1454), rộng theo tỉ lệ vùng ảnh đầu
        var SW = stage.clientWidth;
        var SH = stage.clientHeight;
        var r0 = layers[0].region;
        var aspect = r0 ? r0.w / r0.h : 0.62;
        var ph = Math.max(320, SH - 16);
        var pw = Math.round((ph - 2 * BEZEL) * aspect + 2 * BEZEL);
        if (pw > PHONE_MAX_W) {
          pw = PHONE_MAX_W;
          ph = Math.round((pw - 2 * BEZEL) / aspect + 2 * BEZEL);
        }
        phone.style.width = pw + "px";
        phone.style.height = ph + "px";
        phone.style.left = Math.round((SW - pw) / 2) + "px";
        phone.style.top = Math.max(0, SH - 16 - ph) + "px";
        var W = pw - 2 * BEZEL;
        var H = ph - 2 * BEZEL;
        layers.forEach(function (L) {
          L.W = W;
          L.H = H;
          L.geo = L.region ? h.placeCrop(L.img, L.region, L.size.w, L.size.h, W, H, { mode: "cover", bounds: L.region }) : null;
        });
        if (dock) {
          // ô vuông vừa bề rộng màn (dock cách mép 10px, đệm 10px, khe 12px), 84–104px: dock cao ≤ 124px, đỉnh dock
          // nằm dưới dải phụ đề (đáy ~y 1298) khi điện thoại chạm đáy vùng an toàn
          var cs = Math.floor((W - 20 - 20 - (chips.length - 1) * 12) / chips.length);
          cs = Math.max(84, Math.min(104, cs));
          chips.forEach(function (c) {
            c.node.style.width = cs + "px";
            c.node.style.height = cs + "px";
          });
        }
        var top0 = label ? label.offsetHeight : 0;
        var bot0 = dock ? dock.offsetTop : H;
        dapFy = Math.max(0.35, Math.min(0.68, (top0 + bot0) / 2 / H));
      },
      animate: function (tl) {
        var start = s.start;
        var end = s.end;
        tl.fromTo(band, { x: -40, rotation: -10 }, { x: 40, rotation: -10, duration: end - start, ease: h.EASE_FLOW }, start);
        if (!isFirst) {
          tl.fromTo(hookText, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, start);
          tl.fromTo(phone, { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: h.EASE_IN }, start);
        }
        // khung t = 0 đứng đủ: chữ hook chỉ phóng rất chậm
        tl.fromTo(hookText, { scale: 1 }, { scale: 1.03, duration: end - start, ease: h.EASE_FLOW, transformOrigin: "0% 50%" }, start);
        // điện thoại nghiêng nhẹ từ khung đầu, trôi và đứng dần lên suốt cảnh
        tl.fromTo(phone, { rotation: -3, y: 0 }, { rotation: -1, y: -12, duration: end - start, ease: "sine.inOut" }, start);

        // lịch đổi ảnh: ảnh đầu có sẵn từ đầu cảnh; mỗi nhịp ảnh sau một kiểu chuyển (cùng ảnh thì đập zoom)
        var changes = 0;
        layers.forEach(function (L, i) {
          var P = i ? layers[i - 1] : null;
          if (!P) {
            L.kind = null;
            L.land = start;
            L.t0 = start;
            return;
          }
          L.land = Math.max(start + 0.15, L.shot.at);
          L.kind = P.src === L.src ? "dap" : HOOK_KINDS[changes++ % HOOK_KINDS.length];
          L.t0 = Math.max(start, L.land - (L.kind === "dap" ? PH.DAP_PRE : PH.T));
        });
        layers.forEach(function (L, i) {
          var N = layers[i + 1];
          L.out = N ? (N.kind === "dap" ? N.t0 + 0.04 : N.land) : end;
        });
        layers.forEach(function (L, i) {
          var P = i ? layers[i - 1] : null;
          if (L.kind) PH.change(tl, { kind: L.kind, slot: L.slot, prev: P.slot, W: L.W, H: L.H, t0: L.t0, t1: L.land });
          if (L.kind === "dap") {
            PH.punch(tl, { node: L.img, geo: L.geo, W: L.W, H: L.H, cut: L.t0, at: L.land, end: L.out, fy: dapFy, zoom: 1.3, bounds: L.region });
          } else {
            // ảnh đầu: phóng nhanh dần đều ngay từ khung 0 (power1.out) để khung đầu đã thấy chuyển động
            PH.drift(tl, { node: L.img, geo: L.geo, W: L.W, H: L.H, t0: L.t0, t1: L.out,
              mode: PH.isTall(L.geo, L.H, L.region) ? "scroll" : "push", z0: 1, z1: i === 0 ? 1.08 : 1.06,
              ease: i === 0 ? "power1.out" : undefined, bounds: L.region });
          }
        });

        // nhịp không đổi ảnh (text sau dock, icon, ảnh đầu tới muộn): điện thoại nảy nhẹ
        var used = {};
        layers.forEach(function (L) { if (L.kind) used[L.index] = true; });
        if (dockShot) used[shots.indexOf(dockShot)] = true;
        var kicks = [];
        shots.forEach(function (sh, i) {
          if (i > 0 && !used[i] && sh.at > start + 0.3) kicks.push(sh.at);
        });
        kicks.sort(function (a, b) { return a - b; }).forEach(function (t) {
          tl.fromTo(kick, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, t - 0.05);
        });

        // đỉnh vòng tò mò: lần đổi ảnh cuối (sau khi dock đã hiện, nếu có dock)
        var climax = null;
        layers.forEach(function (L) {
          if (L.kind && (!dockShot || L.land > dockShot.at + 0.2)) climax = L;
        });
        if (dock) {
          var dIn = h.enterAt(dockShot.at, 0.3, start);
          tl.fromTo(dock, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, dIn);
          // các ô sáng lần lượt sau khi dock vào (cách ≥ 0,16s), tới trước nhịp kế; ô "?" để dành cho đỉnh
          var nextAt = end;
          shots.forEach(function (sh) {
            if (sh.at > dockShot.at + 0.01 && sh.at < nextAt) nextAt = sh.at;
          });
          var runChips = chips.filter(function (c) { return !(climax && c.mystery); });
          var a0 = dockShot.at + 0.15;
          var a1 = Math.max(a0, nextAt - 0.3);
          var step = runChips.length > 1 ? Math.max(0.16, (a1 - a0) / (runChips.length - 1)) : 0;
          runChips.forEach(function (c, i) {
            var t = a0 + i * step;
            if (t > end - 0.25) return;
            tl.fromTo(c.flash, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, t);
            tl.fromTo(c.node, { scale: 1.12 }, { scale: 1, duration: 0.3, ease: h.EASE_IN, immediateRender: false }, t);
          });
        }
        if (climax) {
          var tc = climax.land - 0.04;
          chips.forEach(function (c) {
            if (!c.mystery) return;
            tl.fromTo(c.flash, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, tc);
            tl.fromTo(c.node, { scale: 1.22 }, { scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, tc);
          });
          if (labelQ) tl.fromTo(labelQ, { scale: 1.5, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)", immediateRender: false }, tc);
        }
      },
    };
  }

  function promise(ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var sc = ctx.sc;
    var el = h.el;
    var node = ctx.el;
    node.classList.add("tl-intro", "tl-promise");

    var bg = el("div", "tl-bg", null, node);
    var band = el("div", "tl-band", null, bg);
    band.setAttribute("data-layout-allow-overflow", "");
    var col = el("div", "tl-col", null, node);
    var cardsBox = el("div", "tl-pcards", null, col);
    var statement = el("div", "tl-statement", sc.on_screen_text || "", col);

    var factByLabel = {};
    (sc.facts || []).forEach(function (f) {
      factByLabel[f.label] = f;
    });
    var shots = s.shots || [];
    var cards = [];
    var textShot = null;
    shots.forEach(function (sh) {
      var m = /^fact:(.+)$/.exec(sh.show || "");
      if (m && factByLabel[m[1]]) {
        var f = factByLabel[m[1]];
        var card = el("div", "tl-pcard", null, cardsBox);
        el("div", "tl-pcard-label", f.label, card);
        var v = el("div", "tl-pcard-value", f.value, card);
        cards.push({ shot: sh, node: card, value: v });
      } else if (sh.show === "text" && !textShot) {
        textShot = sh;
      }
    });
    // facts không có trong shots vẫn hiện (lần lượt sau thẻ cuối) để không mất số liệu
    (sc.facts || []).forEach(function (f) {
      var used = cards.some(function (c) {
        return c.shot.show === "fact:" + f.label;
      });
      if (!used) console.warn("top-list: cảnh " + s.id + " có fact '" + f.label + "' không có nhịp hình, bỏ qua");
    });

    return {
      fit: function () {
        h.fitText(statement, { maxWidth: col.clientWidth, maxHeight: 300, minPx: 84 });
        cards.forEach(function (c) {
          h.fitText(c.value, { maxHeight: 180, minPx: 56 });
        });
      },
      animate: function (tl) {
        var start = s.start;
        var end = s.end;
        tl.fromTo(band, { x: 50, rotation: 8 }, { x: -50, rotation: 8, duration: end - start, ease: h.EASE_FLOW }, start);
        cards.forEach(function (c, j) {
          var inAt = h.enterAt(c.shot.at, 0.3, start + 0.3 * j);
          tl.fromTo(c.node, { x: j % 2 ? 90 : -90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, inAt);
          tl.fromTo(c.value, { scale: 1 }, { scale: 1.04, duration: end - inAt, ease: h.EASE_FLOW, transformOrigin: "0% 50%" }, inAt);
        });
        var tAt = textShot ? h.enterAt(textShot.at, 0.3, start) : start;
        tl.fromTo(statement, { scale: 1.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: h.EASE_IN }, tAt);
        if (textShot) {
          tl.fromTo(cardsBox, { y: 0 }, { y: -30, duration: 0.35, ease: h.EASE_IN }, tAt);
        }
      },
    };
  }

  TL.intro = function (ctx) {
    var hasFacts = ctx.sc.facts && ctx.sc.facts.length;
    if (hasFacts) return promise(ctx);
    // ảnh dọc (13/10/2026): hook điện thoại lớn thay lưới ô; ảnh ngang hoặc không có ảnh thì giữ lưới ô
    if (TL.phone && ctx.helpers.isPortraitMedia(ctx.scene.media)) {
      var list = phoneShots(ctx);
      if (list.length) return hookPhone(ctx, list);
    }
    return hook(ctx);
  };
})();
