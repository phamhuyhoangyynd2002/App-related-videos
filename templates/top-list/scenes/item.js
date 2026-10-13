/* Cảnh item của top-list: số hạng rất lớn + tựa mục + tên ứng dụng + thẻ thông tin theo cue.
 *
 * Bố cục đổi theo cảnh (không một bố cục cho mọi cảnh):
 *   - Có ảnh (header/screenshot trong timeline.scenes[].media): m0 (hạng trái) / m1 (hạng phải), khung ảnh
 *     có zoom chậm, thẻ thông tin nổi trên đáy khung.
 *   - Không có ảnh (ứng dụng, chỉ đồ hoạ): xoay vòng v0 (hạng trái), v1 (hạng phải, căn phải),
 *     v2 (hạng giữa) với nền khác nhau. Không vẽ logo/icon giả lập ứng dụng thật.
 * Nhịp hình (timeline.scenes[].shots):
 *   text (đầu cảnh)   → khối hạng + thể loại + ứng dụng đại diện
 *   fact:<nhãn>       → thẻ bật lên xong đúng `at`, các thẻ trước giữ nguyên (tối đa 3). Thẻ đè trên ảnh (m0/m1):
 *                       các thẻ bật gần nhau (≤ FACT_BURST_GAP) thành một đợt, cả đợt lui sau FACT_HOLD giây để
 *                       mục dài (20–25s) không bị thẻ che ảnh suốt cảnh; đợt cuối cảnh giữ tới hết cảnh.
 *   header/screenshot → đổi ảnh (crossfade) nếu có; không có ảnh thì thành nhịp nhấn như text lần 2
 *                       shot có `crop: [x, y, w, h]` (px trên ảnh gốc): vùng đó phóng lấp khung, giữ tỉ lệ, vùng khác
 *                       tỉ lệ khung thì mở rộng quanh tâm (phần khung bị thẻ che không tính). Hai nhịp liền nhau cùng
 *                       ảnh: lia/zoom 0,3s từ vùng cũ sang vùng mới thay vì crossfade. mp (ảnh dọc): nhịp có crop hiện
 *                       trong ô phóng to (tl-zoom) phá khung điện thoại, rộng hết cột, dưới tên ứng dụng.
 *   clip              → video quay màn hình (tắt tiếng) đặt trên khung ảnh, từ giây `from`
 *   text (lần sau)    → nhịp nhấn: nền quét màu, gạch chân thể loại, số hạng đập nhẹ
 *   shots[].kieu      → kiểu hình (_shared/kieu-hinh.js): dap-zoom, dap-zoom-rung, cat-nhay, chia-o cho nhịp ảnh;
 *                       lat-the, dem-so cho thẻ. Ảnh nằm trong máy quay .kh-cam của khung.
 *
 * mp – chống nhàm (13/10/2026, người làm video chê "trong video nhàm chán"; giữ nguyên khung bố cục mp):
 *   - điện thoại vào cảnh trượt từ phải, nghiêng 8° rồi đứng thẳng (nảy nhẹ);
 *   - nhịp icon (header = icon ở ứng dụng Google Play) là màn mở app: icon giữa màn, không phóng icon lấp khung;
 *     ảnh kế tiếp bung ra từ icon như mở ứng dụng;
 *   - mỗi lần đổi ảnh là một kiểu chuyển có chủ đích (phone.js), xoay vòng vuốt ngang / cuộn lên / đập zoom nửa
 *     trên–dưới, lệch pha theo thứ tự mục để hai mục liền nhau không mở cùng kiểu; nhịp có kiểu hình thì không đập
 *     thêm (kiểu hình là nhân vật chính), chia-o thì cắt cứng;
 *   - ảnh cao hơn khung cuộn chậm từ trên xuống như đang lướt; ảnh khác phóng chậm 7%;
 *   - nhịp text lần 2: số hạng đập mạnh hơn (1,3×) và khung điện thoại rung nhẹ.
 */
(function () {
  "use strict";
  var TL = (window.TopList = window.TopList || {});
  // tựa mục phình chậm tới mức này suốt cảnh; fit() trừ sẵn biên độ để chữ không lấn lề an toàn khi to nhất
  var GENRE_GROW = 1.04;
  var FACT_BURST_GAP = 4.0; // thẻ cách nhau tối đa chừng này giây thì chung một đợt
  var FACT_HOLD = 3.2; // đợt thẻ đè ảnh giữ chừng này giây sau thẻ cuối rồi lui
  var FACT_MIN = 1.8; // nhưng gặp nhịp crop thì lui sớm, sau khi thẻ cuối đã đứng ít nhất chừng này giây
  var PAN = 0.3; // lia/zoom giữa hai vùng của cùng một ảnh
  var REFRAME = 0.4; // thẻ đè ảnh lui đi giữa nhịp crop: vùng crop phóng ra lấp cả khung

  function easeInOut2(p) {
    p = Math.max(0, Math.min(1, p));
    return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  }

  function sceneHasMedia(scene, h) {
    return (scene.shots || []).some(function (sh) {
      if (sh.show === "clip") return !!(scene.media && scene.media.clip);
      return h.isMediaShow(sh.show) && !!h.mediaFor(scene.media, sh.show);
    });
  }

  TL.sceneHasMedia = sceneHasMedia;

  TL.item = function (ctx) {
    var h = ctx.helpers;
    var s = ctx.scene;
    var sc = ctx.sc;
    var node = ctx.el;
    var el = h.el;
    var shots = s.shots || [];
    var hasMedia = sceneHasMedia(s, h);
    var KH = window.AppReel.kieu || null; // kiểu hình (kieu-hinh.js), không nạp thì dựng như cũ
    var PH = TL.phone || null; // chuyển ảnh của điện thoại dọc (phone.js), không nạp thì mp dựng như cũ

    // vị trí của cảnh trong nhóm cùng kiểu (có ảnh / không ảnh) để xoay vòng bố cục
    var same = ctx.items.filter(function (it) {
      return sceneHasMedia(it.scene, h) === hasMedia;
    });
    var k = 0;
    same.forEach(function (it, i) {
      if (it.scene.id === s.id) k = i;
    });
    // ảnh dọc (khung điện thoại): bố cục mp, chữ và thẻ bên trái, ảnh cao bên phải, không cắt ngang
    var portrait = hasMedia && h.isPortraitMedia(s.media);
    var variant = hasMedia ? (portrait ? "mp" : "m" + (k % 2)) : "v" + (k % 3);
    node.classList.add("tl-item", "tl-" + variant);
    // script.media_tall (tuỳ chọn, 09/10/2026): ảnh ngang (m0/m1) phóng hết vùng an toàn tới y 1470, phụ đề nằm đè
    // trên ảnh, thẻ lên đỉnh khung. Không bật thì giữ bố cục cũ (video khác không đổi).
    var tall = hasMedia && !portrait && ctx.data.script.media_tall === true;
    if (tall) {
      node.classList.add("tl-tall");
      node.setAttribute("data-vs-compact", "");
    }
    if (portrait) {
      // mp: cột trái là chữ + thẻ, nên sticker linh vật ưu tiên bên phải (trên ảnh); gags.js vẫn tự né chữ, thẻ, phụ đề
      node.setAttribute("data-sticker-side", "right");
    }

    var rankNum = sc.rank !== undefined && sc.rank !== null ? sc.rank : ctx.items.findIndex(function (it) { return it.scene.id === s.id; }) + 1;
    var genreText = h.stripRank(sc.on_screen_text || "");
    var appName = sc.app && sc.app.name ? h.shortName(sc.app.name, 24) : "";

    // ---- nền ----
    var bg = el("div", "tl-bg", null, node);
    var band = el("div", "tl-band", null, bg);
    band.setAttribute("data-layout-allow-overflow", "");
    var wipe = el("div", "tl-wipe", null, bg);

    // ---- cột nội dung ----
    var col = el("div", "tl-col", null, node);
    var head = el("div", "tl-head", null, col);
    var rankWrap = el("div", "tl-rank-wrap", null, head);
    var rankPunch = el("div", "tl-rank-punch", null, rankWrap);
    var rank = el("div", "tl-rank", null, rankPunch);
    el("span", "tl-hash", "#", rank);
    el("span", "tl-num", rankNum, rank);
    rank.setAttribute("data-layout-allow-overlap", "");
    rankWrap.setAttribute("data-gag-avoid", "");

    var info = el("div", "tl-info", null, head);
    var genreBox = el("div", "tl-genre-box", null, hasMedia ? info : col);
    genreBox.setAttribute("data-gag-avoid", "");
    var genre = el("div", "tl-genre", genreText, genreBox);
    var focusShots = shots.filter(function (sh, i) {
      return i > 0 && (sh.show === "text" || (h.isMediaShow(sh.show) && !(sh.show === "clip" ? s.media && s.media.clip : h.mediaFor(s.media, sh.show))));
    });
    var bar = focusShots.length ? el("div", "tl-bar", null, genreBox) : null;

    // tên ứng dụng (không kèm nhãn "Ứng dụng đại diện": top-list xếp hạng chính các ứng dụng)
    var rep = null;
    if (appName) {
      rep = el("div", "tl-rep", null, variant === "v2" ? col : info);
      el("span", "tl-rep-name", appName, rep);
      rep.setAttribute("data-gag-avoid", "");
    }
    if (variant === "v2") {
      // v2: hạng ở giữa, thể loại ngay dưới, ứng dụng đại diện sau thể loại
      col.insertBefore(genreBox, rep || null);
    }

    var frame = null;
    if (hasMedia) {
      frame = el("div", "tl-frame", null, col);
      frame.setAttribute("data-gag-media", ""); // khung hình ứng dụng cho gag dau-chu (gags.js)
    }
    // mp: nhịp có crop hiện trong ô phóng to rộng hết cột (phá khung điện thoại dọc hẹp)
    var zoom = null;
    if (portrait && shots.some(function (sh) { return h.shotCrop(sh) && sh.show !== "clip" && h.isMediaShow(sh.show) && h.mediaFor(s.media, sh.show); })) {
      zoom = el("div", "tl-zoom", null, col);
      zoom.setAttribute("data-layout-allow-overlap", "");
      zoom.setAttribute("data-layout-allow-occlusion", "");
    }
    var facts = el("div", "tl-facts", null, hasMedia && !portrait ? frame : col);

    // ---- thẻ thông tin theo thứ tự nhịp ----
    var factByLabel = {};
    (sc.facts || []).forEach(function (f) {
      factByLabel[f.label] = f;
    });
    var cards = [];
    var layers = [];
    shots.forEach(function (sh, i) {
      var m = /^fact:(.+)$/.exec(sh.show || "");
      if (m) {
        var f = factByLabel[m[1]];
        if (!f) {
          console.warn("top-list: cảnh " + s.id + " không có fact '" + m[1] + "'");
          return;
        }
        var card = el("div", "tl-fact", null, facts);
        el("div", "tl-fact-label", f.label, card);
        var val = el("div", "tl-fact-value", f.value, card);
        // gag không đè thẻ từ lúc thẻ bật lên; zoom-kich-tinh tìm thẻ theo chữ giá trị
        card.setAttribute("data-gag-avoid", "");
        card.setAttribute("data-avoid-from", String(Math.round((sh.at - 0.3) * 1000) / 1000));
        card.setAttribute("data-gag-target", "");
        card.setAttribute("data-gag-text", f.value);
        // mp: ô phóng to che tạm cột thẻ trong chuỗi nhịp crop (có chủ ý)
        if (portrait) [card, card.firstChild, val].forEach(function (n) { n.setAttribute("data-layout-allow-occlusion", ""); });
        cards.push({ shot: sh, node: card, value: val });
        return;
      }
      if (frame && h.isMediaShow(sh.show)) {
        if (sh.show === "clip") {
          if (!s.media || !s.media.clip) return;
          var v = el("video", "tl-clip", null, ctx.root);
          v.muted = true;
          v.setAttribute("muted", "");
          v.setAttribute("playsinline", "");
          v.src = s.media.clip;
          var vs = i === 0 ? s.start : Math.max(s.start, sh.at - 0.25);
          h.timed(v, vs, Math.max(0.1, sh.end - vs), 10);
          v.setAttribute("data-media-start", String(sh.from || 0));
          layers.push({ shot: sh, index: i, node: v, video: true });
          return;
        }
        var src = h.mediaFor(s.media, sh.show);
        if (!src) return;
        var region = h.shotCrop(sh);
        var box = region && zoom ? zoom : frame;
        // ảnh nằm trong máy quay của khung (kieu-hinh.js) để kiểu hình phóng/cắt cả khung
        var holder = KH ? KH.cam(box) : box;
        // mp (13/10/2026): mỗi ảnh của khung điện thoại nằm trong một khe riêng (phone.js) để chuyển ảnh tween khe,
        // zoom/cuộn trong ảnh tween ảnh. Ảnh là icon ứng dụng thì thành màn mở app (icon giữa màn).
        var slot = null;
        var splash = false;
        if (portrait && PH && box === frame) {
          slot = el("div", "tl-slot", null, holder);
          slot.setAttribute("data-layout-allow-overflow", "");
          splash = !!(s.media && s.media.icon && src === s.media.icon);
          if (splash) slot.classList.add("tl-splash");
        }
        var img = el("img", splash ? "tl-splash-icon" : "tl-shot", null, slot || holder);
        img.src = src;
        img.alt = ""; img.setAttribute("data-layout-allow-overflow", "");
        if (!slot && holder === box && facts.parentNode === box) box.insertBefore(img, facts);
        layers.push({ shot: sh, index: i, node: img, slot: slot, splash: splash, src: src, box: box, region: region, crop: h.cropFor(s.media, src) });
      }
    });

    // lúc mỗi lớp ảnh bắt đầu vào và lúc nó bị lớp sau phủ (để tính vùng thẻ che, chuyển động)
    // kiểu hình cần ảnh hiện sớm hơn (dap-zoom: toàn cảnh trước khi giật vào): cộng KH.lead vào mốc vào
    layers.forEach(function (L) {
      L.t0 = L.index === 0 ? s.start : h.enterAt(L.shot.at, 0.3 + (KH ? KH.lead(L.shot) : 0), s.start);
    });

    // thẻ đè trên ảnh (m0/m1): chia đợt, mỗi đợt lui sau FACT_HOLD giây (trừ đợt cuối cảnh)
    var overlay = facts.parentNode === frame;
    var sceneEnd = s.start + s.duration;
    if (overlay && cards.length) {
      var bursts = [];
      cards.forEach(function (c) {
        var b = bursts[bursts.length - 1];
        if (b && c.shot.at - b[b.length - 1].shot.at <= FACT_BURST_GAP) b.push(c);
        else bursts.push([c]);
      });
      // mỗi đợt một chồng thẻ riêng ở đáy khung (thẻ đầu nằm dưới cùng): đợt sau không bị chừa chỗ trống của đợt trước,
      // và thẻ chỉ che phần đáy ảnh vừa đủ số thẻ đang hiện
      bursts.forEach(function (b, bi) {
        var stack = bi === 0 ? facts : el("div", "tl-facts", null, null);
        if (bi > 0) frame.insertBefore(stack, facts.nextSibling);
        b.forEach(function (c) { stack.appendChild(c.node); });
      });
      bursts.forEach(function (b) {
        var lastAt = b[b.length - 1].shot.at;
        var hideAt = lastAt + FACT_HOLD;
        if (hideAt > sceneEnd - 1.5) hideAt = null;
        // nhịp crop (chi tiết cận) vào khi đợt thẻ còn hiện: thẻ lui ngay lúc ảnh crop bắt đầu vào (đã đứng ít nhất
        // FACT_MIN giây), để vùng crop lấp cả khung từ đầu nhịp thay vì bị thẻ che phần lớn (vd. «Bạn là» ngay sau thẻ hạng)
        if (hideAt !== null) {
          layers.forEach(function (L) {
            if (L.video || !L.region || L.box !== frame || L.t0 <= lastAt || L.t0 >= hideAt) return;
            hideAt = Math.min(hideAt, Math.max(L.t0, lastAt + FACT_MIN));
          });
        }
        b.forEach(function (c) {
          c.hideAt = hideAt;
          if (hideAt !== null) c.node.setAttribute("data-avoid-to", String(Math.round((hideAt + 0.25) * 1000) / 1000));
        });
      });
    }
    return {
      fit: function () {
        var colW = col.clientWidth;
        // tựa mục tối đa 2 dòng (line-height 1.3 để dấu chồng của chữ in hoa không đè dòng trên).
        // Tựa phình tới GENRE_GROW suốt cảnh, nên đo với bề rộng đã trừ biên độ phình: lúc to nhất vẫn trong cột
        // (cột đã nằm trong vùng an toàn, chừa 150px bên phải).
        var gcs = getComputedStyle(genre);
        var glh = parseFloat(gcs.lineHeight) / parseFloat(gcs.fontSize) || 1.3;
        var genreW = Math.floor((genreBox.clientWidth || colW) / GENRE_GROW) - 2;
        // đặt luôn bề rộng khối tựa (dòng chia cân là span khối, đo theo bề rộng khối), giữ căn lề theo bố cục
        genre.style.width = genreW + "px";
        genre.style.alignSelf = variant === "v1" || variant === "m1" ? "flex-end" : variant === "v2" ? "center" : "flex-start";
        h.wrapBalanced(genre, genreW);
        h.fitText(genre, { maxWidth: genreW, maxHeight: Math.ceil(parseFloat(gcs.fontSize) * glh * 2) + 2, minPx: 64 });
        if (rep) h.fitText(rep.lastChild, { maxWidth: rep.clientWidth || colW, maxHeight: 130, minPx: 44 });
        // giá trị thẻ: một dòng nếu co tới 48px còn vừa; không thì chia 2 dòng cân (ngắt trước "(", sau ","), tối thiểu 44px
        cards.forEach(function (c) {
          // thẻ hàng ngang (m0/m1): giá trị chỉ còn phần bên phải nhãn
          var cs = getComputedStyle(c.node);
          var row = cs.display === "flex";
          var lab = c.node.firstChild;
          var inner = c.node.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
          // nhãn quá một dòng thì chia cân, không để một chữ lẻ ("VN") rơi xuống
          if (!row) h.wrapBalanced(lab, inner);
          var maxW = inner - (row ? lab.offsetWidth + 24 : 0);
          c.value.style.whiteSpace = "nowrap";
          var base = parseFloat(getComputedStyle(c.value).fontSize);
          h.fitText(c.value, { maxWidth: maxW, minPx: 48 });
          if (c.value.scrollWidth > maxW + 1) {
            c.value.style.fontSize = base + "px";
            h.wrapBalanced(c.value, maxW);
            h.fitText(c.value, { maxWidth: maxW, minPx: 44 });
          }
          // thẻ hàng ngang mà giá trị vẫn không vừa phần bên phải nhãn (nhãn dài, vd. "Hạng App Store VN"):
          // xếp nhãn trên, giá trị dưới, giá trị dùng cả bề rộng thẻ
          if (row && h.contentWidth(c.value) > maxW + 1) {
            c.node.classList.add("tl-fact-stack");
            c.value.style.fontSize = base + "px";
            c.value.textContent = c.value.getAttribute("data-wrap-text") || c.value.textContent;
            h.fitText(c.value, { maxWidth: inner, minPx: 48 });
            if (h.contentWidth(c.value) > inner + 1) {
              c.value.style.fontSize = base + "px";
              h.wrapBalanced(c.value, inner);
              h.fitText(c.value, { maxWidth: inner, minPx: 44 });
            }
          }
        });
        // cột không được lấn xuống vùng phụ đề: co số hạng, rồi tựa mục, rồi giá trị thẻ (≥ 44px), nếu cần.
        // Đo khi mọi thẻ đã hiện (cuối cảnh), vì thẻ bật lần lượt nhưng chiếm chỗ ngay từ đầu.
        var num = rank;
        var guard = 0;
        while (guard++ < 60 && col.scrollHeight > col.clientHeight + 1) {
          var px = parseFloat(getComputedStyle(num).fontSize);
          if (px > 150) { num.style.fontSize = px - 10 + "px"; continue; }
          var gp = parseFloat(getComputedStyle(genre).fontSize);
          if (gp > 60) { genre.style.fontSize = gp - 4 + "px"; continue; }
          var shrunk = false;
          cards.forEach(function (c) {
            var vp = parseFloat(getComputedStyle(c.value).fontSize);
            if (vp > 48) { c.value.style.fontSize = vp - 2 + "px"; shrunk = true; }
          });
          if (!shrunk) break;
        }
        // mp: điện thoại bắt đầu ngay dưới hàng hạng + tựa (chiều cao hàng đổi theo tựa 1 hay 2 dòng), cột thẻ
        // bên trái cùng đỉnh với điện thoại
        if (portrait && frame) {
          frame.style.top = Math.round(head.offsetTop + head.offsetHeight + 18) + "px";
        }
        // mp có phán quyết: thẻ và tựa nằm đúng dải 45% của con dấu, nên con dấu đóng lên nửa trên ảnh dọc
        // (cỡ 60%), không che tựa mục, tên ứng dụng, thẻ. Lệch frame.md có chủ ý, ghi ở nhat-ky.md.
        if (portrait && s.verdict && frame) {
          node.setAttribute("data-stamp-center-x", String(Math.round(col.offsetLeft + frame.offsetLeft + frame.offsetWidth / 2)));
          node.setAttribute("data-stamp-center-y", String(Math.round(col.offsetTop + frame.offsetTop + 130)));
          node.setAttribute("data-stamp-scale", "0.6");
        }
        if (tall && frame) {
          // đáy chồng thẻ cao nhất (mọi thẻ đã hiện) tính theo khung 1080×1920
          var fTop = col.offsetTop + frame.offsetTop;
          var fBot = fTop + 18;
          frame.querySelectorAll(".tl-facts").forEach(function (st) { fBot = Math.max(fBot, fTop + st.offsetTop + st.offsetHeight); });
          // khối so-sanh dưới thẻ, trên phụ đề (đỉnh phụ đề ~1198)
          node.setAttribute("data-vs-top", String(Math.min(fBot + 16, 1190 - 340)));
          if (s.verdict) {
            // con dấu giữa đáy thẻ và đỉnh phụ đề, không che thẻ
            var room = 1190 - fBot;
            var S = Math.max(0.55, Math.min(0.85, (room - 20) / 240));
            node.setAttribute("data-stamp-center-y", String(Math.round(fBot + room / 2)));
            node.setAttribute("data-stamp-scale", String(Math.round(S * 100) / 100));
          }
        }
        // ô phóng to (mp): rộng hết cột, từ dưới tên ứng dụng tới đáy cột
        if (zoom) {
          var anchor = rep || genreBox;
          var y = 0, n = anchor;
          while (n && n !== col) { y += n.offsetTop || 0; n = n.offsetParent; }
          zoom.style.top = Math.round(y + anchor.offsetHeight + 16) + "px";
        }
        // đặt ảnh: nhịp có crop → vùng đó lấp phần khung không bị thẻ che (contain, mở rộng quanh tâm);
        // không crop → vùng cắt manifest (bỏ chữ quảng bá, giữ khung dọc) hoặc cả ảnh, phủ kín khung (cover)
        layers.forEach(function (L) {
          if (L.video) return;
          var W = L.box.clientWidth, H = L.box.clientHeight;
          L.W = W;
          L.H = H;
          if (L.splash) return; // màn mở app: icon đặt bằng CSS giữa khe
          var size = h.imageSize(L.node, s.media, L.src);
          if (!W || !H || !size.w || !size.h) return;
          var mc = L.crop ? { x: L.crop.x, y: L.crop.y, w: L.crop.w, h: L.crop.h } : null;
          if (L.region) {
            var bx = { x: 0, y: 0, w: W, h: H };
            var lastHide = -1; // thẻ che lui hết lúc nào (null: giữ tới hết lớp)
            if (overlay && L.box === frame) {
              var tEnd = L.shot.end;
              var topY = H;
              cards.forEach(function (c) {
                var cIn = h.enterAt(c.shot.at, 0.3, s.start);
                var hide = c.hideAt === undefined ? null : c.hideAt;
                if (cIn < tEnd && (hide === null || hide > L.t0)) {
                  topY = Math.min(topY, c.node.parentNode.offsetTop + c.node.offsetTop);
                  lastHide = hide === null || lastHide === null ? null : Math.max(lastHide, hide);
                }
              });
              if (topY < H) bx.h = Math.max(Math.round(H * 0.4), topY - 10);
            }
            if (bx.h < H) {
              // vùng đặt trong phần khung trên thẻ; chỉ phần đó buộc phủ kín (dưới thẻ có thể lộ nền khung)
              L.geo = h.placeCrop(L.node, L.region, size.w, size.h, W, H, { mode: "contain", box: bx, bounds: mc, coverBox: true });
              // thẻ lui trước khi hết nhịp: lấy lại cả khung cho vùng crop (tween left/top/width/height)
              if (lastHide !== null && lastHide >= 0 && lastHide < L.shot.end - 0.3) {
                L.reframe = { at: lastHide, geo: h.placeCrop(null, L.region, size.w, size.h, W, H, { mode: "contain", bounds: mc, dry: true }) };
              }
            } else {
              L.geo = h.placeCrop(L.node, L.region, size.w, size.h, W, H, { mode: "contain", box: bx, bounds: mc });
            }
          } else {
            L.geo = h.placeCrop(L.node, mc || { x: 0, y: 0, w: size.w, h: size.h }, size.w, size.h, W, H, { mode: "cover" });
            if (L.geo) { L.geo.fx = W / 2 - L.geo.left; L.geo.fy = H / 2 - L.geo.top; }
          }
        });
        // clip: đặt video đúng khung ảnh (khung đã có kích thước sau khi font tải)
        layers.forEach(function (L) {
          if (!L.video) return;
          var r = frame.getBoundingClientRect();
          var rr = ctx.root.getBoundingClientRect();
          L.node.style.left = r.left - rr.left + "px";
          L.node.style.top = r.top - rr.top + "px";
          L.node.style.width = r.width + "px";
          L.node.style.height = r.height + "px";
        });
      },
      animate: function (tl) {
        var start = s.start;
        var end = s.end;
        var dur = end - start;
        var firstWord = s.words && s.words.length ? s.words[0].start : start;
        var bandFrom = { v0: -60, v1: 60, v2: -30, m0: -50, m1: 50 }[variant];
        var bandRot = { v0: -12, v1: 10, v2: 0, m0: -8, m1: 8 }[variant];

        // chuyển động nền liên tục suốt cảnh (không khung nào đứng yên)
        tl.fromTo(band, { x: bandFrom, y: 0, rotation: bandRot }, { x: -bandFrom, y: -30, rotation: bandRot, duration: dur, ease: h.EASE_FLOW }, start);
        tl.fromTo(rankWrap, { y: 0 }, { y: -14, duration: dur, ease: h.EASE_FLOW }, start);

        // vào cảnh: số hạng xong đúng lúc đọc thứ hạng, rồi thể loại, rồi ứng dụng đại diện (cách nhau 0,3s)
        var rankIn = h.enterAt(firstWord, 0.3, start);
        tl.fromTo(rank, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: h.EASE_IN }, rankIn);
        tl.fromTo(genreBox, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, rankIn + 0.3);
        if (rep) tl.fromTo(rep, { x: variant === "v1" || variant === "m1" ? 40 : -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN }, rankIn + 0.6);
        tl.fromTo(genre, { scale: 1 }, { scale: GENRE_GROW, duration: dur, ease: h.EASE_FLOW }, start);

        // mp (13/10/2026): điện thoại vào cảnh trượt từ phải, nghiêng 8° rồi đứng thẳng (back.out: lắc qua nhẹ rồi dừng).
        // Clip quay màn hình nằm ngoài khung (lớp gốc) nên cảnh mở bằng clip thì bỏ, để clip không lệch khung.
        var phoneSettled = null; // lúc điện thoại đã đứng yên: rung nhịp nhấn chỉ chạy sau mốc này
        if (portrait && frame && PH && !layers.some(function (L) { return L.video && L.index === 0; })) {
          tl.fromTo(frame, { x: 150, y: 30 }, { x: 0, y: 0, duration: 0.5, ease: "expo.out" }, start);
          tl.fromTo(frame, { rotation: 8 }, { rotation: 0, duration: 0.7, ease: "back.out(1.8)" }, start);
          phoneSettled = start + 0.7;
        }

        // mp: lịch đổi ảnh trong khung điện thoại (phone.js). Mỗi lớp: kind (kiểu chuyển), land (lúc vào xong),
        // cut (lúc bắt đầu chuyển; dap, cat là lúc cắt), out (lúc lớp sau đã phủ kín), mode (splash, scroll, push).
        var mpL = PH && portrait ? layers.filter(function (L) { return !!L.slot; }) : [];
        var itemPos = Math.max(0, ctx.items.findIndex(function (it) { return it.scene.id === s.id; }));
        var changes = 0;
        var daps = 0;
        mpL.forEach(function (L, i) {
          var P = i ? mpL[i - 1] : null;
          var lead = KH ? KH.lead(L.shot) : 0;
          L.land = L.index === 0 ? start : Math.max(L.t0 + 0.12, L.shot.at - lead);
          L.mode = L.splash ? "splash" : PH.isTall(L.geo, L.H, L.crop) ? "scroll" : "push";
          if (L.index === 0) L.kind = null; // có sẵn từ đầu cảnh, điện thoại vào cảnh mang nó theo
          else if (!P) L.kind = "cuon"; // ảnh đầu tiên tới sau đầu cảnh: trượt lên vào khung trống
          else if (P.splash && !L.splash) L.kind = "mo-app";
          else if (L.shot.kieu === "chia-o") { L.kind = "cat"; changes++; }
          else if (P.src === L.src && !L.shot.kieu && !L.splash) { L.kind = "dap"; changes++; }
          else {
            var kind = PH.KINDS[(itemPos + changes) % PH.KINDS.length];
            // nhịp có kiểu hình (dap-zoom, cat-nhay) đã có cú đập riêng: không đập thêm lúc đổi ảnh
            if (kind === "dap" && (L.shot.kieu || L.splash)) kind = PH.KINDS[(itemPos + changes + 1) % PH.KINDS.length];
            L.kind = kind;
            changes++;
          }
          L.cut = L.kind === "dap" ? Math.max(L.t0, L.land - PH.DAP_PRE)
            : L.kind === "cat" ? Math.max(L.t0, L.shot.at - 0.14) : L.t0;
          if (L.kind === "dap") L.fy = daps++ % 2 ? 0.36 : 0.66; // xen kẽ nửa dưới / nửa trên màn hình
        });
        mpL.forEach(function (L, i) {
          var N = mpL[i + 1];
          L.out = N ? Math.min(end, N.kind === "dap" || N.kind === "cat" ? N.cut + 0.04 : N.land) : end;
        });
        var pushes = 0;
        function mpLayer(L) {
          var i = mpL.indexOf(L);
          var P = i > 0 ? mpL[i - 1] : null;
          if (L.kind) PH.change(tl, { kind: L.kind, slot: L.slot, prev: P ? P.slot : null, W: L.W, H: L.H, t0: L.cut, t1: L.land });
          if (L.mode === "splash") {
            tl.fromTo(L.node, { scale: 1 }, { scale: 1.08, duration: Math.max(0.3, L.out - L.t0), ease: h.EASE_FLOW }, L.t0);
          } else if (L.kind === "dap") {
            PH.punch(tl, { node: L.node, geo: L.geo, W: L.W, H: L.H, cut: L.cut, at: L.land, end: L.out, fy: L.fy, bounds: L.crop });
          } else {
            // mở app luôn phóng vào; còn lại xen kẽ phóng vào / lùi ra
            var zin = L.kind === "mo-app" || pushes % 2 === 0;
            if (L.mode === "push") pushes++;
            PH.drift(tl, { node: L.node, geo: L.geo, W: L.W, H: L.H, t0: L.t0, t1: L.out, mode: L.mode,
              z0: zin ? 1 : 1.07, z1: zin ? 1.07 : 1, bounds: L.crop });
          }
        }

        // ảnh: crossfade xong đúng `at`, zoom chậm quanh tâm vùng tới khi lớp sau phủ lên (đảo chiều xen kẽ).
        // Hai nhịp liền nhau cùng ảnh: lớp mới khớp đúng chỗ lớp cũ đang hiện rồi lia/zoom PAN giây sang vùng của nó.
        var prevIn = {}; // lớp trước trong cùng khung
        var count = {};
        layers.forEach(function (L, j) {
          var sh = L.shot;
          var inAt = L.t0;
          if (L.video) {
            tl.fromTo(L.node, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, inAt);
            return;
          }
          var key = L.box === zoom ? "zoom" : "frame";
          var k = (count[key] = (count[key] || 0) + 1) - 1;
          var nextL = null;
          for (var q = j + 1; q < layers.length; q++) if (!layers[q].video && layers[q].box === L.box) { nextL = layers[q]; break; }
          var dEnd = nextL ? Math.min(end, nextL.t0 + PAN) : end;
          if (L.region) { L.z0 = k % 2 ? 1.06 : 1.0; L.z1 = k % 2 ? 1.0 : 1.06; }
          else if (portrait) { L.z0 = k % 2 ? 1.04 : 1.0; L.z1 = k % 2 ? 1.0 : 1.04; }
          else { L.z0 = k % 2 ? 1.1 : 1.0; L.z1 = k % 2 ? 1.02 : 1.08; }
          var P = prevIn[key];
          prevIn[key] = L;
          if (L.slot) {
            mpLayer(L); // mp: chuyển ảnh có chủ đích (phone.js) thay crossfade
            return;
          }
          if (!L.geo) {
            // ảnh chưa đo được kích thước: giữ cách cũ (object-fit: cover, zoom quanh tâm khung)
            tl.fromTo(L.node, { opacity: L.index === 0 ? 0.001 : 0 }, { opacity: 1, duration: L.index === 0 ? 0.2 : 0.3, ease: "power2.out" }, inAt);
            tl.fromTo(L.node, { scale: L.z0 }, { scale: L.z1, duration: Math.max(0.5, dEnd - inAt), ease: h.EASE_FLOW }, inAt);
            L.dStart = inAt; L.dEnd = dEnd;
            return;
          }
          var g = L.geo;
          if (L.reframe) {
            var rg = L.reframe.geo;
            tl.fromTo(L.node, { left: g.left, top: g.top, width: g.w, height: g.h },
              { left: rg.left, top: rg.top, width: rg.w, height: rg.h, duration: REFRAME, ease: "power3.inOut", immediateRender: false }, L.reframe.at);
          }
          function state(z) { return { scale: z, x: g.fx * (1 - z), y: g.fy * (1 - z) }; }
          // lớp trước liền kề (không có ảnh khác chen giữa) và cùng file ảnh → lia/zoom
          var adjacent = P && P.geo && P.src === L.src && layers.indexOf(P) === j - 1 && L.index !== 0;
          if (adjacent) {
            var pe = easeInOut2((inAt - P.dStart) / Math.max(0.01, P.dEnd - P.dStart));
            var kP = P.z0 + (P.z1 - P.z0) * pe;
            // khung đang hiện của lớp trước (đã lấy lại cả khung nếu thẻ đã lui)
            var pg = P.reframe && inAt >= P.reframe.at + REFRAME ? P.reframe.geo : P.geo;
            var from = {
              scale: (kP * pg.s) / g.s,
              x: pg.left + P.geo.fx * (1 - kP) - g.left,
              y: pg.top + P.geo.fy * (1 - kP) - g.top,
            };
            var to0 = state(L.z0);
            // cùng ảnh, cùng khung hình (vd. header → screenshot:1 không crop): đập zoom nhẹ để vẫn thấy nhịp mới
            if (Math.abs(from.scale - to0.scale) < 0.03 && Math.abs(from.x - to0.x) < 12 && Math.abs(from.y - to0.y) < 12) from = state(L.z0 + 0.08);
            tl.fromTo(L.node, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "power2.out" }, inAt);
            tl.fromTo(L.node, from, { scale: to0.scale, x: to0.x, y: to0.y, duration: PAN, ease: "power3.inOut" }, inAt);
            var s1 = state(L.z1);
            L.dStart = inAt + PAN; L.dEnd = Math.max(L.dStart + 0.3, dEnd);
            tl.fromTo(L.node, to0, { scale: s1.scale, x: s1.x, y: s1.y, duration: L.dEnd - L.dStart, ease: h.EASE_FLOW, immediateRender: false }, L.dStart);
            return;
          }
          tl.fromTo(L.node, { opacity: L.index === 0 ? 0.001 : 0 }, { opacity: 1, duration: L.index === 0 ? 0.2 : 0.3, ease: "power2.out" }, inAt);
          var a = state(L.z0), b = state(L.z1);
          L.dStart = inAt; L.dEnd = Math.max(inAt + 0.5, dEnd);
          tl.fromTo(L.node, a, { scale: b.scale, x: b.x, y: b.y, duration: L.dEnd - L.dStart, ease: h.EASE_FLOW }, inAt);
        });

        // kiểu hình của nhịp (kieu-hinh.js): máy quay của khung phải về 1× lúc ảnh kế tiếp trong cùng khung bắt đầu vào
        if (KH) {
          layers.forEach(function (L, j) {
            if (L.video || !L.shot.kieu) return;
            var nx = null;
            for (var q = j + 1; q < layers.length; q++) if (!layers[q].video && layers[q].box === L.box) { nx = layers[q]; break; }
            // mp: ảnh sau vào bằng cắt (dap, cat) thì máy quay về 1× đúng lúc cắt
            var until = nx ? (nx.slot && (nx.kind === "dap" || nx.kind === "cat") ? nx.cut : nx.t0) : null;
            KH.shot(tl, { box: L.box, shot: L.shot, media: s.media, src: L.src, region: L.region,
              until: until, floor: start });
          });
        }

        // ô phóng to (mp): bật ra từ phía khung điện thoại khi chuỗi nhịp crop bắt đầu, lui khi ảnh khác tới
        if (zoom) {
          var media = layers.filter(function (L) { return !L.video; });
          var runs = 0;
          media.forEach(function (L, j) {
            var inZoom = L.box === zoom;
            var prevZoom = j > 0 && media[j - 1].box === zoom;
            if (inZoom && !prevZoom) {
              tl.fromTo(zoom, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: h.EASE_IN, immediateRender: runs++ === 0 }, L.t0);
            } else if (!inZoom && prevZoom) {
              tl.fromTo(zoom, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.96, duration: 0.25, ease: "power2.in", immediateRender: false }, L.t0);
            }
          });
        }

        // thẻ thông tin: bật lần lượt, xong đúng `at`
        cards.forEach(function (c, j) {
          var fromX = variant === "v1" || variant === "m1" ? -70 : 70;
          if (variant === "v2") fromX = 0;
          tl.fromTo(
            c.node,
            { x: fromX, y: variant === "v2" ? 40 : 0, opacity: 0 },
            { x: 0, y: 0, opacity: 1, duration: 0.3, ease: h.EASE_IN },
            h.enterAt(c.shot.at - (KH ? KH.lead(c.shot) : 0), 0.3, start + 0.3 * (j + 1))
          );
          // lat-the / dem-so: thẻ vào sớm hơn KH.lead, lật hoặc đếm xong đúng `at`
          if (KH) KH.fact(tl, { card: c.node, value: c.value, shot: c.shot });
          if (c.hideAt !== null && c.hideAt !== undefined) {
            tl.fromTo(c.node, { x: 0, opacity: 1 }, { x: fromX * 0.6, opacity: 0, duration: 0.25, ease: "power2.in", immediateRender: false }, c.hideAt);
          }
        });

        // nhịp nhấn (text lần 2 hoặc ảnh không có): nền quét màu, gạch chân, số hạng đập nhẹ
        focusShots.forEach(function (sh, j) {
          var t = h.enterAt(sh.at, 0.35, start);
          if (j === 0) {
            tl.fromTo(wipe, { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.35, ease: h.EASE_IN }, t);
            if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: h.EASE_IN }, t + 0.05);
          } else {
            tl.fromTo(wipe, { opacity: 1 }, { opacity: 0.35, duration: 0.35, ease: h.EASE_IN, immediateRender: false }, t);
          }
          // mp (13/10/2026): số hạng đập mạnh hơn (1,3×) vì nhịp text là nhịp nhấn duy nhất không đổi ảnh
          tl.fromTo(rankPunch, { scale: portrait && PH ? 1.3 : 1.16 }, { scale: 1, duration: 0.4, ease: h.EASE_IN, immediateRender: false }, sh.at - 0.05);
          // mp: khung điện thoại rung nhẹ (12px, tắt dần trong 0,2s); không chạy khi điện thoại còn đang vào cảnh hoặc
          // clip quay màn hình đang hiện (clip nằm ngoài khung, không rung theo)
          var clipOn = layers.some(function (L) { return L.video && L.t0 <= sh.at && L.shot.end > sh.at; });
          if (portrait && frame && PH && !clipOn && (phoneSettled === null || sh.at - 0.02 >= phoneSettled)) {
            var offs = [0, 12, -9, 6, -3, 0];
            for (var q = 1; q < offs.length; q++) {
              tl.fromTo(frame, { x: offs[q - 1] }, { x: offs[q], duration: 0.04, ease: "power1.inOut", immediateRender: false }, sh.at - 0.02 + (q - 1) * 0.04);
            }
          }
        });
      },
    };
  };
})();
