/* Cảnh intro của top-list. Hai bố cục:
 *   - hook (intro không có facts, thường là cảnh 1): chữ hook lớn + lưới ô các mục của video
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
    return hasFacts ? promise(ctx) : hook(ctx);
  };
})();
