/* Bảng xếp hạng xuyên suốt video của tier-board.
 *
 * Hàng cố định SSS, S, A, B, C, D. Mỗi cảnh item khai báo hạng bằng `tier` trong script.json
 * (thiếu thì suy từ `rank`: 1→SSS, 2→S, 3→A, 4→B, 5→C, còn lại→D).
 * Thời điểm icon rơi vào hàng (câu chốt "Vậy nên X, mình để hạng A"):
 *   1. từ khoá `tier_cue` của cảnh (mặc định "hạng") – lần xuất hiện CUỐI trong lời đọc;
 *   2. nếu cảnh có verdict: đúng verdict.at;
 *   3. nếu không thấy: 1,8 giây trước khi hết cảnh.
 * build_timeline.py đặt sfx `drop` theo cue trong script; template không phát âm thanh.
 */
(function () {
  "use strict";
  var TB = (window.TierBoard = window.TierBoard || {});

  var TIERS = ["SSS", "S", "A", "B", "C", "D"];
  var TIER_COLORS = { SSS: "#FF4D5E", S: "#FF9F43", A: "#FFD23F", B: "#C8E86B", C: "#7BD88F", D: "#4FC3F7" };
  var RANK_TO_TIER = { 1: "SSS", 2: "S", 3: "A", 4: "B", 5: "C" };

  // hình học (khớp tier-board.css)
  var BOARD = { left: 60, top: 430, width: 870, height: 740, pad: 6, gap: 6, label: 120 };
  var ICON = 100;
  var ICON_GAP = 10;
  var FLY_FROM = { x: 540, y: 910 }; // tâm dải hình
  var FLY_DUR = 0.5;
  var MINI = 0.36; // tỉ lệ bảng mini (góc phải trên, gốc biến đổi (930, 290) của .tb-wrap: đáy hàng D ở y ≈ 607, trên dải hình 630)
  var ORIGIN = { x: 930, y: 290 }; // khớp transform-origin của .tb-wrap trong tier-board.css
  TB.RETURN_BEFORE = 0.95; // bảng về giữa khung xong trước lúc icon bắt đầu bay
  /* Bảng thu nhỏ còn giữa khung theo chiều ngang (tâm x 495), mép trên tiêu đề ở khoảng y 290 + dy.
     Dùng khi con dấu đóng (VERDICT) và khi câu hỏi cuối hiện (outro): bảng nhường chỗ, không bị đè. */
  TB.centered = function (s, dy) {
    var cx = BOARD.left + BOARD.width / 2; // 495
    return { scale: s, x: Math.round(-(ORIGIN.x - cx) * (1 - s)), y: dy || 0 };
  };
  TB.FULL = { scale: 1, x: 0, y: 0 };
  TB.STAMP_CENTER_Y = 900; // tâm con dấu trong tier-board (~47% chiều cao), cỡ 0,8: dưới bảng thu nhỏ, trên phụ đề
  TB.STAMP_SCALE = 0.8;

  function norm(t) {
    return String(t || "").toLowerCase().normalize("NFC").replace(/[.,!?…:;"'()]/g, "").trim();
  }

  function tierOf(sc) {
    var t = String(sc.tier || "").toUpperCase();
    if (TIERS.indexOf(t) >= 0) return t;
    return RANK_TO_TIER[sc.rank] || "D";
  }

  /* Mốc icon rơi vào hàng của một cảnh item. */
  function dropAt(scene, sc) {
    var cue = norm(sc.tier_cue || "hạng");
    var words = scene.words || [];
    // cảnh có con dấu: icon phải nằm trong hàng TRƯỚC khi dấu đóng (verdict.at), không để dấu đè bảng trống
    var cap = scene.verdict && scene.verdict.at ? scene.verdict.at - 0.5 : Infinity;
    for (var i = words.length - 1; i >= 0; i--) {
      if (norm(words[i].text) === cue) return Math.min(words[i].start, cap);
    }
    if (scene.verdict && scene.verdict.at) return scene.verdict.at;
    return Math.max(scene.start + 1, scene.end - 1.8);
  }
  TB.dropAt = dropAt;
  TB.tierOf = tierOf;

  /* Ảnh trong một ô icon vuông (bảng và dải icon của hook).
   * Thứ tự: media.icon → media.icon_crop → ảnh header.
   * media.icon_crop = { src, x, y, w, h, iw, ih } (px trên ảnh gốc): khi icon cửa hàng bị loại ở DỪNG 2b,
   * cắt cận một vùng vuông từ ảnh ĐÃ DUYỆT của chính ứng dụng đó (src phải là header hoặc một screenshot của media).
   * Đặt bằng phần trăm nên không phụ thuộc cỡ ô; vùng cắt nên vuông để không méo. */
  TB.fillIcon = function (h, box, media) {
    if (!media) return null;
    var img;
    var c = media.icon_crop;
    var allowed = [media.header].concat(media.screenshots || []);
    if (!media.icon && c && c.src && allowed.indexOf(c.src) >= 0 && c.w > 0 && c.h > 0 && c.iw > 0 && c.ih > 0) {
      box.style.position = box.style.position || "relative";
      img = h.el("img", "tb-icon-crop", null, box);
      img.setAttribute("data-layout-allow-overflow", "");
      img.src = c.src;
      img.alt = "";
      img.style.position = "absolute";
      img.style.maxWidth = "none";
      img.style.objectFit = "fill";
      img.style.width = ((c.iw / c.w) * 100).toFixed(3) + "%";
      img.style.height = ((c.ih / c.h) * 100).toFixed(3) + "%";
      img.style.left = ((-c.x / c.w) * 100).toFixed(3) + "%";
      img.style.top = ((-c.y / c.h) * 100).toFixed(3) + "%";
      return img;
    }
    var src = media.icon || h.mediaFor(media, "header");
    if (!src) return null;
    img = h.el("img", null, null, box);
    img.src = src;
    img.alt = "";
    return img;
  };

  var ACTIVE = TIERS; // hàng đang dùng: SSS chỉ hiện khi có ứng dụng hạng SSS
  function rowGeom(index) {
    var inner = BOARD.height - 2 * BOARD.pad - BOARD.gap * (ACTIVE.length - 1);
    var h = inner / ACTIVE.length;
    return { top: BOARD.top + BOARD.pad + index * (h + BOARD.gap), height: h };
  }

  /* Dựng một lần cho cả video. ctx: ngữ cảnh của cảnh đầu tiên (có root, items, total, data). */
  TB.buildBoard = function (ctx) {
    var h = ctx.helpers;
    var el = h.el;
    var layer = el("div", "clip tb-board-layer", null, ctx.root);
    h.timed(layer, 0, ctx.total, 3);
    layer.setAttribute("data-layout-allow-overlap", "");

    var script = ctx.data.script || {};
    var intro = (script.scenes || []).filter(function (s) { return s.type === "intro"; })[0] || {};
    var titleText = script.board_title || h.stripRank(intro.on_screen_text || script.title || "BẢNG XẾP HẠNG");
    var wrap = el("div", "tb-wrap", null, layer);
    wrap.setAttribute("data-layout-allow-overlap", "");
    var title = el("div", "tb-title", titleText, wrap);

    var used = ctx.items.map(function (it) { return tierOf(it.sc); });
    ACTIVE = TIERS.filter(function (t) { return t !== "SSS" || used.indexOf("SSS") >= 0; });
    var board = el("div", "tb-board", null, wrap);
    var flashes = {};
    ACTIVE.forEach(function (t) {
      var row = el("div", "tb-row", null, board);
      var lab = el("div", "tb-label", t, row);
      lab.style.background = TIER_COLORS[t];
      flashes[t] = el("div", "tb-flash", null, row);
    });

    // icon của từng ứng dụng, đặt sẵn đúng ô, hiện khi rơi vào hàng
    var counts = {};
    var icons = ctx.items.map(function (it) {
      var t = tierOf(it.sc);
      var k = counts[t] || 0;
      counts[t] = k + 1;
      var g = rowGeom(ACTIVE.indexOf(t));
      var left = BOARD.left + BOARD.pad + BOARD.label + 12 + k * (ICON + ICON_GAP);
      var top = g.top + (g.height - ICON) / 2;
      var box = el("div", "tb-icon", null, wrap);
      box.setAttribute("data-layout-allow-overlap", "");
      box.style.left = left + "px";
      box.style.top = top + "px";
      // ứng dụng có icon vuông của cửa hàng (bị loại thì icon_crop); không có icon thì dùng ảnh header
      if (!TB.fillIcon(h, box, it.scene.media)) {
        el("span", null, h.shortName((it.sc.app && it.sc.app.name) || "", 14), box);
      }
      return {
        node: box,
        tier: t,
        at: dropAt(it.scene, it.sc),
        scene: it.scene,
        dx: FLY_FROM.x - (left + ICON / 2),
        dy: FLY_FROM.y - (top + ICON / 2),
      };
    });
    TB.board = { icons: icons, flashes: flashes, order: ACTIVE, wrap: wrap, state: TB.FULL };
    if (k8(icons)) console.warn("tier-board: một hàng có quá 6 ứng dụng, icon sẽ tràn khỏi bảng");

    return {
      fit: function () {
        h.fitText(title, { maxWidth: 690, minPx: 40 });
        icons.forEach(function (ic) {
          var t = ic.node.querySelector("span");
          if (t) h.fitText(t, { maxWidth: ICON - 16, maxHeight: ICON - 16, minPx: 16 });
        });
      },
      animate: function (tl) {
        // kể từng ứng dụng: bảng thu về góc phải trên (bản đồ mini), trả lại giữa khung trước khi icon rơi vào hàng.
        // Cảnh có con dấu: icon vào hàng xong thì bảng thu còn 0,5 lần, lên trên, để con dấu (tâm y 900) không đè bảng.
        // Mọi tween của bảng là fromTo với scale, x, y tường minh, nối tiếp trạng thái trước (tua đi tua lại đều đúng).
        var cur = TB.FULL;
        var miniS = { scale: MINI, x: 0, y: 0 };
        var verdictS = TB.centered(0.5, 20);
        function move(to, at, dur) {
          tl.fromTo(wrap, { scale: cur.scale, x: cur.x, y: cur.y },
            { scale: to.scale, x: to.x, y: to.y, duration: dur || 0.35, ease: h.EASE_IN, immediateRender: false }, at);
          cur = to;
        }
        icons.slice().sort(function (a, b) { return a.scene.start - b.scene.start; }).forEach(function (ic) {
          var back = Math.max(ic.scene.start + 0.8, ic.at - TB.RETURN_BEFORE);
          move(miniS, ic.scene.start);
          move(TB.FULL, back);
          var v = ic.scene.verdict;
          if (v && v.at) {
            var sAt = Math.max(ic.at + 0.08, v.at - 0.5);
            move(verdictS, sAt, Math.max(0.15, Math.min(0.28, v.at - 0.2 - sAt)));
          }
        });
        TB.board.state = cur;
        TB.board.move = function (to, at, dur) {
          tl.fromTo(wrap, { scale: TB.board.state.scale, x: TB.board.state.x, y: TB.board.state.y },
            { scale: to.scale, x: to.x, y: to.y, duration: dur || 0.35, ease: h.EASE_IN, immediateRender: false }, at);
          TB.board.state = to;
        };
        icons.forEach(function (ic) {
          var s = Math.max(0, ic.at - FLY_DUR);
          tl.fromTo(ic.node, { opacity: 0, x: ic.dx, y: ic.dy, scale: 2.6, rotation: -10 },
            { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: FLY_DUR, ease: "back.out(1.6)", immediateRender: false }, s);
          tl.fromTo(flashes[ic.tier], { opacity: 0.55 }, { opacity: 0, duration: 0.45, ease: "power2.out", immediateRender: false }, ic.at);
        });
      },
    };
  };

  function k8(icons) {
    var c = {};
    return icons.some(function (i) { c[i.tier] = (c[i.tier] || 0) + 1; return c[i.tier] > 6; });
  }
})();
