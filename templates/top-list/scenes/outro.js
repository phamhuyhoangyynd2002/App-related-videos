/* Cảnh outro của top-list: đóng vòng tò mò và kêu gọi.
 * Có bảng (có mục và ≥ 2 nhịp text):
 *   text (đầu)   → on_screen_text thành dòng tựa to (≥ 84px, đọc được khi tắt tiếng) trên bảng tổng các mục
 *                  (hạng + ảnh nhỏ + thể loại), bảng lấp phần khung còn lại. Mục có `verdict` nền accent; nếu tựa có
 *                  "→ #N" (vd. "#10 APP STORE → #2") thì hàng hạng N có viền accent.
 *   text (lần 2) → bảng và tựa giữ nguyên, từng hàng sáng lần lượt theo nhịp lời đọc (câu hỏi kéo bình luận)
 *   logo         → màn kết chuẩn (appreel.js) phủ lên
 *   Có sticker trước nhịp logo: chỗ dành sẵn bên phải dòng tựa thứ hai (tựa nới đáy, bảng thấp lại một chút).
 *   "→" trong tựa vẽ bằng SVG (h.drawArrows) vì font không có glyph này.
 * Không có bảng: on_screen_text là câu hỏi đập vào giữa khung ở nhịp text.
 */
(function () {
  "use strict";
  var TL = (window.TopList = window.TopList || {});
  var ROW_MAX = 168; // hàng bảng tổng cao tối đa (px); ít mục thì hàng to, lấp khung
  var SLOT_MAX = 230, SLOT_MIN = 170; // chỗ cho sticker cạnh dòng tựa thứ hai (px)

  TL.outro = function (ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var sc = ctx.sc;
    var el = h.el;
    var node = ctx.el;
    node.classList.add("tl-outro");

    var bg = el("div", "tl-bg", null, node);
    var band = el("div", "tl-band", null, bg);
    band.setAttribute("data-layout-allow-overflow", "");
    var col = el("div", "tl-col", null, node);

    var shots = s.shots || [];
    var textShots = shots.filter(function (sh) {
      return sh.show === "text";
    });
    var logoShot = shots.filter(function (sh) {
      return sh.show === "logo";
    })[0];
    var useBoard = ctx.items.length > 0 && textShots.length > 1;

    var board = null;
    var rows = [];
    var headline = null;
    var question = null;
    var slot = null;
    if (useBoard) {
      node.classList.add("tl-outro-board");
      headline = el("div", "tl-headline", sc.on_screen_text || "", col);
      headline.setAttribute("data-gag-avoid", "");
      // "→ #N" ở cuối tựa: hàng hạng N được nhắc tới (chỗ để cãi)
      var ref = /→\s*#\s*(\d+)\s*$/.exec(sc.on_screen_text || "");
      var refRank = ref ? parseInt(ref[1], 10) : null;
      board = el("div", "tl-board", null, col);
      // màn kết phủ kín bảng ở giây cuối là chủ ý
      ctx.items.forEach(function (it, i) {
        var row = el("div", "tl-row", null, board);
        if (it.scene.verdict) row.classList.add("tl-row-hit");
        var rank = it.sc.rank !== undefined && it.sc.rank !== null ? it.sc.rank : i + 1;
        if (refRank !== null && rank === refRank) row.classList.add("tl-row-ref");
        el("div", "tl-row-num", "#" + rank, row);
        var src = it.scene.media ? h.mediaFor(it.scene.media, "header") : null;
        var thumb = null, img = null;
        if (src) {
          thumb = el("div", "tl-row-thumb", null, row);
          img = el("img", "tl-row-img", null, thumb);
          img.src = src;
          img.alt = "";
          img.setAttribute("data-layout-allow-overflow", "");
        }
        var g = el("div", "tl-row-genre", h.stripRank(it.sc.on_screen_text || ""), row);
        var flash = el("div", "tl-row-flash", null, row);
        rows.push({ node: row, genre: g, thumb: thumb, img: img, crop: src ? h.cropFor(it.scene.media, src) : null, flash: flash });
      });
      board.setAttribute("data-gag-avoid", "");
      // sticker linh vật trong lúc bảng hiện: chỗ dành sẵn (data-gag-slot) cạnh dòng tựa thứ hai (thường ngắn, vd. "→ #2"),
      // để sticker nằm trong vùng an toàn, không đè tựa, bảng, phụ đề. Vị trí, cỡ đặt trong fit.
      var boardSticker = (s.gags || []).some(function (g) {
        return g.kind === "sticker" && (!logoShot || g.at < logoShot.at);
      });
      if (boardSticker) {
        slot = el("div", "tl-sticker-slot", null, col);
        slot.setAttribute("data-gag-slot", "");
        slot.setAttribute("data-layout-allow-overlap", "");
        slot.style.width = "0px";
        slot.style.height = "0px";
      }
    } else {
      question = el("div", "tl-question", sc.on_screen_text || "", col);
      question.setAttribute("data-layout-allow-overlap", "");
      // gag (sticker) không đè câu hỏi từ lúc nó vào
      var qShot0 = textShots[0] || null;
      question.setAttribute("data-gag-avoid", "");
      if (qShot0) question.setAttribute("data-avoid-from", String(Math.max(s.start, qShot0.at - 0.3)));
    }

    var brand = null;
    var cta = null;
    // màn kết chuẩn (appreel.js) đã có logo + tên kênh + kêu gọi đúng lúc câu ký tên: không dựng chữ kênh thứ hai
    var endCardOn = ctx.data.script.end_card !== false;
    if (logoShot && !endCardOn) {
      brand = el("div", "tl-brand", null, col);
      var word = el("div", "tl-wordmark", null, brand);
      el("span", "tl-wordmark-hi", h.BRAND_NAME, word);
      var ctaText = h.lastSentence(sc.narration || "");
      if (ctaText) cta = el("div", "tl-cta", ctaText, brand);
    }

    return {
      fit: function () {
        if (question) h.fitText(question, { maxWidth: col.clientWidth, maxHeight: 440, minPx: 84 });
        if (headline) {
          // tựa một dòng nếu vừa, không thì hai dòng (ngắt trước "→"), co tới 84px
          var hpx = parseFloat(getComputedStyle(headline).fontSize);
          h.wrapBalanced(headline, col.clientWidth);
          h.drawArrows(headline);
          h.fitText(headline, { maxWidth: col.clientWidth, maxHeight: Math.ceil(hpx * 1.3 * 2) + 2, minPx: 84 });
          var lines = headline.querySelectorAll(".gr-line");
          if (slot && lines.length === 2) {
            // sticker vuông bên phải dòng 2, đỉnh ngang đỉnh chữ dòng 2; tựa nới đáy vừa đủ để bảng bắt đầu dưới sticker
            var l1 = lines[0].offsetHeight, l2 = lines[1].offsetHeight;
            var free = col.clientWidth - h.contentWidth(lines[1]) - 40;
            var size = Math.min(SLOT_MAX, Math.floor(free));
            if (size >= SLOT_MIN) {
              var top = l1 + Math.round(l2 * 0.08);
              var need = top + size - (l1 + l2);
              if (need > 0) headline.style.paddingBottom = need + "px";
              slot.style.right = "auto";
              slot.style.left = col.clientWidth - size + "px";
              slot.style.top = headline.offsetTop + top + "px";
              slot.style.width = size + "px";
              slot.style.height = size + "px";
            }
          }
          // bảng lấp phần cột còn lại: mỗi hàng cao tối đa ROW_MAX
          var gap = parseFloat(getComputedStyle(board).rowGap) || 14;
          var avail = col.clientHeight - headline.offsetHeight - (parseFloat(getComputedStyle(col).rowGap) || 24);
          var rowH = Math.max(92, Math.min(ROW_MAX, Math.floor((avail - gap * (rows.length - 1)) / Math.max(1, rows.length))));
          rows.forEach(function (r) {
            r.node.style.height = rowH + "px";
            var num = r.node.firstChild;
            num.style.fontSize = Math.round(rowH * 0.6) + "px";
            num.style.width = Math.round(rowH * 0.95) + "px";
            var t = rowH - 24;
            if (r.thumb) {
              r.thumb.style.width = t + "px";
              r.thumb.style.height = t + "px";
              if (r.crop) h.applyCrop(r.img, r.crop, t, t);
            }
            r.genre.style.fontSize = Math.round(Math.min(66, rowH * 0.42)) + "px";
            var gw = r.genre.parentNode.clientWidth - num.offsetWidth - (r.thumb ? t : 0) - 3 * 22 - 48;
            h.wrapBalanced(r.genre, gw);
            h.fitText(r.genre, { maxWidth: gw, maxHeight: rowH - 16, minPx: 44 });
          });
        }
        if (cta) h.fitText(cta, { maxWidth: col.clientWidth, maxHeight: 130, minPx: 44 });
      },
      animate: function (tl) {
        var start = s.start;
        var end = s.end;
        tl.fromTo(band, { x: -50, rotation: -6 }, { x: 50, rotation: -6, duration: end - start, ease: h.EASE_FLOW }, start);

        var qEnd = logoShot ? logoShot.at : end;
        var bIn = logoShot ? h.enterAt(logoShot.at, 0.3, start) : end;
        if (useBoard) {
          // tựa vào trước (xong lúc đọc chữ đầu), các hàng vào lần lượt sau, cách 0,3s (không hai thứ mới cùng lúc)
          var firstWord = s.words && s.words.length ? s.words[0].start : start;
          tl.fromTo(headline, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: h.EASE_IN }, h.enterAt(firstWord, 0.3, start));
          tl.fromTo(headline, { y: 0 }, { y: -10, duration: Math.max(0.3, qEnd - start - 0.3), ease: h.EASE_FLOW, immediateRender: false }, start + 0.3);
          rows.forEach(function (r, i) {
            tl.fromTo(r.node, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, start + 0.3 + i * 0.3);
            if (r.img) tl.fromTo(r.img, { scale: 1 }, { scale: 1.1, duration: Math.max(0.5, qEnd - start), ease: h.EASE_FLOW }, start);
          });
          var settled = start + 0.3 + rows.length * 0.3;
          var refRow = board.querySelector(".tl-row-ref");
          if (refRow) tl.fromTo(refRow, { scale: 1.05 }, { scale: 1, duration: 0.4, ease: h.EASE_IN, immediateRender: false }, settled);
          var hit = board.querySelector(".tl-row-hit");
          if (hit) tl.fromTo(hit, { scale: 1 }, { scale: 1.03, duration: 0.5, ease: "power2.inOut", immediateRender: false }, settled + 0.4);
          tl.fromTo(board, { y: 0 }, { y: -12, duration: Math.max(0.3, qEnd - start), ease: h.EASE_FLOW }, start);
          // nhịp câu hỏi: từng hàng sáng lần lượt đúng lúc một từ được đọc (chia đều các từ tới hết câu hỏi)
          var qShot = textShots[1];
          var ws = (s.words || []).filter(function (w) { return w.start >= qShot.at - 0.01 && w.start <= qEnd - 0.2; });
          if (ws.length) {
            rows.forEach(function (r, i) {
              var wi = rows.length === 1 ? 0 : Math.round((i * (ws.length - 1)) / (rows.length - 1));
              var at = ws[Math.min(ws.length - 1, wi)].start;
              tl.fromTo(r.node, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, at - 0.05);
              tl.fromTo(r.flash, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, at - 0.05);
            });
          }
          if (ctx.data.script.end_card !== false) [board].concat([].slice.call(board.querySelectorAll("*"))).forEach(function (n) { n.setAttribute("data-layout-allow-overlap", ""); });
          if (logoShot) tl.fromTo([headline, board], { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "power2.in", immediateRender: false }, bIn - 0.05);
        } else {
          var qShot1 = textShots[0] || null;
          var qIn = qShot1 ? h.enterAt(qShot1.at, 0.3, start) : start;
          tl.fromTo(question, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: h.EASE_IN }, qIn);
          tl.fromTo(question, { y: 0 }, { y: -16, duration: Math.max(0.3, qEnd - qIn - 0.3), ease: h.EASE_FLOW, immediateRender: false }, qIn + 0.3);
          if (logoShot) tl.fromTo(question, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "power2.in", immediateRender: false }, bIn - 0.05);
        }
        if (brand) {
          var word = brand.querySelector(".tl-wordmark");
          tl.fromTo(word, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: h.EASE_IN }, bIn);
          tl.fromTo(word, { y: 0 }, { y: -10, duration: Math.max(0.3, end - logoShot.at), ease: h.EASE_FLOW, immediateRender: false }, logoShot.at);
          if (cta) tl.fromTo(cta, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, logoShot.at + 0.3);
        }
      },
    };
  };
})();
