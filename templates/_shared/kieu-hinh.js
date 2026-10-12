/* AppReel – kiểu hình (kieu-hinh.js): bộ chuyển động có tên cho nhịp hình, thẻ thông tin và chuyển mục.
 *
 * Chắt lọc từ thẻ công thức của video-shotcraft (Apache-2.0, bản clone 12/10/2026), viết lại bằng GSAP cho khung dọc,
 * ảnh cửa hàng và nhịp đổi hình 1,5–2 giây của kênh. Bảng đối chiếu, tham số, lỗi hay gặp: templates/_shared/kieu-hinh.md.
 *
 * Khai báo trong script.json (build_timeline.py chép nguyên trường của shot sang timeline):
 *   shots[].kieu   : "dap-zoom" | "dap-zoom-rung" | "cat-nhay" | "chia-o"   (nhịp header/screenshot:N)
 *                    "lat-the" | "dem-so"                                     (nhịp fact:<nhãn>)
 *   shots[].diem   : [fx, fy] tâm đập zoom / cắt nhảy, tỉ lệ 0–1 trên khung ảnh (mặc định [0.5, 0.45])
 *   shots[].zoom   : độ phóng cuối (dap-zoom mặc định 1.8, có crop 1.35; cat-nhay 1.7)
 *   shots[].anh    : chia-o: 2–3 nhịp ảnh cho các ô, vd. ["screenshot:1", "screenshot:3"]; không có thì 3 góc máy của
 *                    cùng một ảnh (toàn cảnh, cận trái, cận phải)
 *   shots[].tu     : dem-so: đếm từ số này (mặc định 0), vd. 199000 để giá rơi về 0đ
 *   scenes[].chuyen: "day-len" | "lia"  cách vào cảnh này từ cảnh trước (template bật `chuyen` trong run())
 *
 * Luật chung (thẻ shotcraft: aesthetic-rules R4, P4): một kiểu đặc biệt chỉ làm "nhân vật chính" vài lần mỗi video;
 * cú đập toàn khung (dap-zoom-rung, cat-nhay, rung) tối đa 3 lần; sau khi hình rơi xuống phải có nhịp thở ≥ 0,5s.
 * validate_script.py đếm và cảnh báo.
 *
 * Không Math.random, Date.now, onUpdate: mọi thay đổi là tween thuộc tính (seek được). Không CSS transform ban đầu trên
 * phần tử được tween. Nạp SAU appreel.js, TRƯỚC file cảnh.
 */
(function () {
  "use strict";

  var GR = window.AppReel;
  if (!GR) throw new Error("kieu-hinh.js phải nạp SAU appreel.js");
  var h = GR.helpers;

  var SHOT = ["dap-zoom", "dap-zoom-rung", "cat-nhay", "chia-o"];
  var FACT = ["lat-the", "dem-so"];
  var CHUYEN = ["day-len", "lia"];
  var LEAD = { "dap-zoom": 0.55, "dap-zoom-rung": 0.55, "lat-the": 0.45, "dem-so": 0.6 };

  function allow(node) {
    node.setAttribute("data-layout-allow-overlap", "");
    node.setAttribute("data-layout-allow-occlusion", "");
    node.setAttribute("data-layout-allow-overflow", "");
    return node;
  }

  /* Máy quay riêng của khung ảnh: mọi lớp ảnh nằm trong đây để kiểu hình phóng/cắt cả khung mà không đụng tới
     tween riêng của từng ảnh. Đặt ngay đầu khung (dưới thẻ thông tin, lớp phủ). */
  function cam(box) {
    if (box.__khCam) return box.__khCam;
    var c = allow(h.el("div", "kh-cam"));
    box.insertBefore(c, box.firstChild);
    box.__khCam = c;
    return c;
  }

  /* Lớp phủ của khung (khung ngắm, chớp sáng, ô truyện tranh): cuối khung, z-index 2 (trên ảnh, dưới thẻ thông tin
     z-index 3), không chịu chuyển động của máy quay. */
  function over(box) {
    if (box.__khOver) return box.__khOver;
    var o = allow(h.el("div", "kh-over", null, box));
    box.__khOver = o;
    return o;
  }

  /* Ảnh phải hiện xong sớm hơn `at` bao nhiêu giây (đập zoom cần toàn cảnh trước khi giật vào). */
  function lead(shot) {
    return (shot && LEAD[shot.kieu]) || 0;
  }

  function isShotKind(k) { return SHOT.indexOf(k) >= 0; }
  function isFactKind(k) { return FACT.indexOf(k) >= 0; }

  /* Trạng thái máy quay phóng z lần quanh điểm (px, py) của khung (transform-origin 0 0). */
  function zoomState(z, px, py) {
    return { scale: z, x: px * (1 - z), y: py * (1 - z) };
  }

  function focus(shot, W, H) {
    var d = shot.diem;
    var fx = d && d.length === 2 && isFinite(+d[0]) ? Math.max(0, Math.min(1, +d[0])) : 0.5;
    var fy = d && d.length === 2 && isFinite(+d[1]) ? Math.max(0, Math.min(1, +d[1])) : 0.45;
    return { x: fx * W, y: fy * H };
  }

  function flash(tl, o, at, peak, dur) {
    var f = allow(h.el("div", "kh-flash", null, o));
    tl.fromTo(f, { opacity: 0 }, { opacity: peak, duration: 0.02, immediateRender: false }, at);
    tl.fromTo(f, { opacity: peak }, { opacity: 0, duration: dur, ease: "expo.out", immediateRender: false }, at + 0.02);
  }

  /* Máy quay trôi chậm từ trạng thái a tới hết nhịp rồi trả về toàn cảnh (1×) đúng lúc `until` (lúc ảnh sau bắt đầu vào). */
  function holdAndReturn(tl, c, a, px, py, from, until) {
    var back = Math.max(from + 0.3, until - 0.25);
    var b = zoomState(a.scale * 1.03, px, py);
    if (back - from > 0.2) {
      tl.fromTo(c, a, { scale: b.scale, x: b.x, y: b.y, duration: back - from, ease: "power2.inOut", immediateRender: false }, from);
    } else {
      b = a;
    }
    if (until !== null) {
      tl.fromTo(c, b, { scale: 1, x: 0, y: 0, duration: 0.25, ease: "power2.inOut", immediateRender: false }, back);
    }
  }

  /* ---------- nhịp hình ----------
   * o: { box (khung ảnh, đã có kích thước), cam (tuỳ chọn: máy quay đã tạo bằng cam(), mặc định cam(box)), shot ({at, end, kieu, ...}), media (scene.media), src (ảnh của nhịp),
   *      region (crop của nhịp hoặc null), until (lúc máy quay phải về 1×; null nếu nhịp chạy tới hết cảnh),
   *      floor (không bắt đầu sớm hơn mốc này, thường là đầu cảnh) } */
  var SHOTS = {
    /* crash-zoom-punch (+ fui-hud reticle-lock-on): khung ngắm bốn góc khoá mục tiêu trên toàn cảnh, rồi giật zoom
       0,2s (ease-in) xong đúng `at`; nảy lùi 4% (dap-zoom) hoặc rung tắt dần 14px (dap-zoom-rung); chớp sáng lúc chạm. */
    "dap-zoom": function (tl, o, rung) {
      var sh = o.shot, at = sh.at;
      var W = o.box.clientWidth, H = o.box.clientHeight;
      if (!W || !H) return;
      var c = o.cam || cam(o.box), ov = over(o.box);
      var p = focus(sh, W, H);
      var Z = +sh.zoom > 1 ? +sh.zoom : o.region ? 1.35 : 1.8;
      // khung ngắm: bốn góc chữ L ôm vùng sẽ lấp khung sau khi phóng
      var tw = W / Z, th = H / Z;
      var tx = Math.max(0, Math.min(W - tw, p.x - tw / 2)), ty = Math.max(0, Math.min(H - th, p.y - th / 2));
      var lockIn = Math.max(o.floor, at - 0.55);
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (k, i) {
        var g = allow(h.el("div", "kh-bracket kh-bracket-" + i, null, ov));
        g.style.left = Math.round(tx + k[0] * tw - (k[0] ? 64 : 0)) + "px";
        g.style.top = Math.round(ty + k[1] * th - (k[1] ? 64 : 0)) + "px";
        var dx = (k[0] ? 1 : -1) * 120, dy = (k[1] ? 1 : -1) * 120;
        tl.fromTo(g, { x: dx, y: dy, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.22, ease: "back.out(1.7)" }, lockIn);
        tl.fromTo(g, { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "power2.in", immediateRender: false }, at - 0.18);
      });
      // giật vào: lùi nhẹ 3% (lấy đà) rồi lao tới, phóng đúng xong ở `at`
      var pre = zoomState(0.97, p.x, p.y);
      tl.fromTo(c, { scale: 1, x: 0, y: 0 }, { scale: pre.scale, x: pre.x, y: pre.y, duration: 0.12, ease: "power2.out", immediateRender: false }, at - 0.32);
      var hit = zoomState(rung ? Z : Z * 1.045, p.x, p.y);
      tl.fromTo(c, pre, { scale: hit.scale, x: hit.x, y: hit.y, duration: 0.2, ease: "power4.in", immediateRender: false }, at - 0.2);
      var land = zoomState(Z, p.x, p.y);
      var t = at;
      if (rung) {
        // rung tắt dần (biên độ 14px, ~6 khung), không nảy
        var offs = [0, 14, -10, 7, -4, 2, 0];
        for (var i = 1; i < offs.length; i++) {
          tl.fromTo(c, { x: land.x + offs[i - 1], y: land.y - offs[i - 1] * 0.5 },
            { x: land.x + offs[i], y: land.y - offs[i] * 0.5, duration: 0.033, ease: "power1.inOut", immediateRender: false }, at + (i - 1) * 0.033);
        }
        t = at + 0.2;
      } else {
        tl.fromTo(c, hit, { scale: land.scale, x: land.x, y: land.y, duration: 0.17, ease: "power2.out", immediateRender: false }, at);
        t = at + 0.17;
      }
      flash(tl, ov, at, rung ? 0.7 : 0.5, 0.27);
      holdAndReturn(tl, c, land, p.x, p.y, t, o.until);
    },

    /* beat-cut-moves + rhythm-interrupt (jump-cut punch-in): ảnh vào toàn cảnh đúng `at`, rồi hai nhát cắt cứng
       vào gần hơn (1,3× → zoom), mỗi nhát một chớp trắng ngắn. Cùng một ảnh thành ba nhịp hình. */
    "cat-nhay": function (tl, o) {
      var sh = o.shot, at = sh.at;
      var W = o.box.clientWidth, H = o.box.clientHeight;
      if (!W || !H) return;
      var c = o.cam || cam(o.box), ov = over(o.box);
      var p = focus(sh, W, H);
      var Z = +sh.zoom > 1 ? +sh.zoom : 1.7;
      var stop = o.until !== null ? o.until : sh.end;
      var d = Math.max(0.22, Math.min(0.4, (stop - at) / 3.4));
      var z1 = zoomState(1 + (Z - 1) * 0.45, p.x, p.y);
      var z2 = zoomState(Z, p.x, p.y);
      var prev = { scale: 1, x: 0, y: 0 };
      [z1, z2].forEach(function (z, i) {
        var t = at + d * (i + 1);
        tl.fromTo(c, prev, { scale: z.scale, x: z.x, y: z.y, duration: 0.001, ease: "none", immediateRender: false }, t);
        flash(tl, ov, t, 0.55, 0.12);
        prev = z;
      });
      holdAndReturn(tl, c, z2, p.x, p.y, at + 2 * d + 0.01, o.until);
    },

    /* panel-grid-moves (comic-panel-split): ba ô truyện tranh xéo đập vào lần lượt (ô đầu xong đúng `at`, cách 0,3s),
       đứng một nhịp rồi ô cuối phóng ra lấp khung như poster. Khung ngang: ba cột; khung dọc: ba băng. */
    "chia-o": function (tl, o) {
      var sh = o.shot, at = sh.at;
      var W = o.box.clientWidth, H = o.box.clientHeight;
      if (!W || !H) return;
      var ov = over(o.box);
      var srcs = (sh.anh || []).map(function (s) { return h.mediaFor(o.media, s); }).filter(Boolean);
      var own = o.src;
      var angles; // [ảnh, phóng, tâm x, tâm y]
      if (srcs.length >= 2) {
        if (srcs.length === 2 && own) srcs.unshift(own);
        angles = srcs.slice(0, 3).map(function (s) { return [s, 1.08, 0.5, 0.5]; });
      } else {
        // một ảnh: ba góc máy khác hẳn nhau (toàn cảnh, cận 2× bên trái trên, cận 2,6× bên phải dưới)
        angles = [[own, 1.0, 0.5, 0.5], [own, 2.0, 0.22, 0.3], [own, 2.6, 0.78, 0.68]];
      }
      var cols = W >= H * 0.85;
      var g = 0.3;
      var wrap = allow(h.el("div", "kh-panels", null, ov));
      var full = "polygon(0px 0px, " + W + "px 0px, " + W + "px " + H + "px, 0px " + H + "px)";
      var last = null;
      angles.forEach(function (a, i) {
        if (!a[0]) return;
        var poly;
        if (cols) {
          var s = H * 0.14, x0 = (i * W) / 3, x1 = ((i + 1) * W) / 3;
          if (i === 0) x0 = -s;
          if (i === 2) x1 = W + s;
          poly = [[x0 + s / 2, 0], [x1 + s / 2, 0], [x1 - s / 2, H], [x0 - s / 2, H]];
        } else {
          var s2 = W * 0.14, y0 = (i * H) / 3, y1 = ((i + 1) * H) / 3;
          if (i === 0) y0 = -s2;
          if (i === 2) y1 = H + s2;
          poly = [[0, y0 + s2 / 2], [W, y0 - s2 / 2], [W, y1 - s2 / 2], [0, y1 + s2 / 2]];
        }
        var clip = "polygon(" + poly.map(function (q) { return Math.round(q[0]) + "px " + Math.round(q[1]) + "px"; }).join(", ") + ")";
        var pan = allow(h.el("div", "kh-panel", null, wrap));
        var inner = allow(h.el("div", "kh-panel-clip", null, pan));
        inner.style.clipPath = clip;
        inner.style.webkitClipPath = clip;
        var img = allow(h.el("img", "kh-panel-img", null, inner));
        img.src = a[0];
        img.alt = "";
        img.style.transformOrigin = Math.round(a[2] * 100) + "% " + Math.round(a[3] * 100) + "%";
        var t = Math.max(o.floor, at - 0.14 + i * g);
        var off = (i % 2 ? 1 : -1) * (cols ? H : W) * 0.35;
        tl.fromTo(pan, cols ? { y: off, opacity: 0 } : { x: off, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.14, ease: "power4.out" }, t);
        tl.fromTo(img, { scale: a[1] * 1.08 }, { scale: a[1], duration: 0.5, ease: "power2.out", immediateRender: false }, t);
        last = { pan: pan, inner: inner, img: img, clip: clip, t: t, scale: a[1] };
      });
      if (!last) return;
      var stop = o.until !== null ? o.until : sh.end;
      var poster = Math.min(stop - 0.6, last.t + 0.14 + 0.45);
      if (poster > last.t + 0.3) {
        tl.fromTo(last.inner, { clipPath: last.clip, webkitClipPath: last.clip }, { clipPath: full, webkitClipPath: full, duration: 0.3, ease: "power3.inOut", immediateRender: false }, poster);
        tl.fromTo(last.img, { scale: last.scale }, { scale: last.scale * 1.06, duration: Math.max(0.3, stop - poster), ease: "power2.inOut", immediateRender: false }, poster);
      }
      if (o.until !== null) tl.fromTo(wrap, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "power2.in", immediateRender: false }, o.until);
    },
  };

  function shot(tl, o) {
    var k = o.shot && o.shot.kieu;
    if (!k) return false;
    if (k === "dap-zoom-rung") { SHOTS["dap-zoom"](tl, o, true); return true; }
    if (!SHOTS[k]) {
      if (!isFactKind(k)) console.warn("kieu-hinh: chưa có kiểu '" + k + "' cho nhịp hình, bỏ qua");
      return false;
    }
    SHOTS[k](tl, o);
    return true;
  }

  /* ---------- thẻ thông tin ----------
   * o: { card (khối thẻ), value (phần giá trị), shot ({at, kieu, tu?}) }. Gọi SAU tween vào của thẻ.
   * Thẻ phải vào sớm hơn `at` đúng lead(shot) giây (bố cục tự cộng vào mốc vào). */
  var FACTS = {
    /* card-flip-reveal: thẻ vào úp ("?"), lật quanh trục Y (lấy đà 0,13s + bật 0,14s) xong đúng `at`, lộ giá trị,
       một vệt sáng lướt qua mặt thẻ một lần. */
    "lat-the": function (tl, o) {
      var at = o.shot.at;
      o.card.classList.add("kh-flip");
      var cover = allow(h.el("div", "kh-flip-cover", null, o.card));
      allow(h.el("span", "kh-flip-q", "?", cover));
      var sheen = allow(h.el("div", "kh-sheen", null, o.card));
      tl.fromTo(o.card, { rotationY: 0, transformPerspective: 900 }, { rotationY: 90, duration: 0.13, ease: "power2.in", immediateRender: false }, at - 0.27);
      tl.fromTo(cover, { opacity: 1 }, { opacity: 0, duration: 0.001, immediateRender: false }, at - 0.14);
      tl.fromTo(o.card, { rotationY: -90 }, { rotationY: 0, duration: 0.14, ease: "back.out(2)", immediateRender: false }, at - 0.14);
      tl.fromTo(sheen, { xPercent: -160, opacity: 1 }, { xPercent: 260, opacity: 1, duration: 0.4, ease: "power2.inOut", immediateRender: false }, at);
      tl.fromTo(sheen, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, at + 0.4);
      // mặt úp che chữ của thẻ là chủ ý: báo cho `hyperframes check`
      Array.prototype.forEach.call(o.card.querySelectorAll("*"), allow);
    },

    /* odometer (shotcraft _legacy/data) + score-slam: số trong giá trị đếm từ `tu` (mặc định 0) tới số thật trong 0,6s,
       chậm dần, chốt đúng `at` rồi đập nhẹ. Giữ nguyên định dạng (dấu chấm nghìn, dấu phẩy thập phân, chữ trước/sau). */
    "dem-so": function (tl, o) {
      var at = o.shot.at;
      var val = o.value;
      if (val.querySelector(".gr-line")) {
        console.warn("kieu-hinh: dem-so bỏ qua giá trị hai dòng: " + val.textContent);
        return;
      }
      var text = val.getAttribute("data-wrap-text") || val.textContent;
      var m = /(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)/.exec(text);
      if (!m) {
        console.warn("kieu-hinh: dem-so không thấy số trong '" + text + "'");
        return;
      }
      var raw = m[1];
      var grouped = raw.indexOf(".") >= 0;
      var dec = !grouped && raw.indexOf(",") >= 0 ? raw.split(",")[1].length : 0;
      var target = grouped ? +raw.replace(/\./g, "") : +raw.replace(",", ".");
      var from = isFinite(+o.shot.tu) ? +o.shot.tu : 0;
      function fmt(v) {
        var s;
        if (dec) s = v.toFixed(dec).replace(".", ",");
        else {
          s = String(Math.round(v));
          if (grouped) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        return text.slice(0, m.index) + s + text.slice(m.index + raw.length);
      }
      var N = 14, D = 0.6;
      var color = getComputedStyle(val).color;
      var wFinal = h.contentWidth(val); // đo trước khi thêm các số trung gian (chúng nằm chồng trong cùng khối)
      val.classList.add("kh-count");
      var steps = [];
      for (var k = 0; k < N; k++) {
        var p = k / N;
        var e = 1 - Math.pow(2, -10 * p); // expo.out
        var sp = allow(h.el("span", "kh-count-step", fmt(from + (target - from) * e), val));
        sp.style.color = color;
        steps.push(sp);
      }
      // số khởi đầu dài hơn số thật (vd. 199.000đ → 0đ): thu cỡ trong lúc đếm để không tràn thẻ
      var wFrom = steps[0].offsetWidth;
      var k0 = wFrom > wFinal && wFinal > 0 ? Math.max(0.5, wFinal / wFrom) : 1;
      var t0 = at - D;
      var show = Math.max(0, t0 - 0.35); // lúc thẻ đang vào: đã thấy số khởi đầu
      tl.fromTo(val, { color: color }, { color: "rgba(0,0,0,0)", duration: 0.001, immediateRender: false }, show);
      steps.forEach(function (sp, i) {
        var on = i === 0 ? show : t0 + (D * i) / N;
        var off = t0 + (D * (i + 1)) / N;
        tl.fromTo(sp, { opacity: 0, scale: k0 }, { opacity: 1, scale: k0, duration: 0.001, immediateRender: false }, on);
        tl.fromTo(sp, { opacity: 1 }, { opacity: 0, duration: 0.001, immediateRender: false }, off);
      });
      tl.fromTo(val, { color: "rgba(0,0,0,0)" }, { color: color, duration: 0.001, immediateRender: false }, at);
      tl.fromTo(val, { scale: 1.25 }, { scale: 1, duration: 0.25, ease: "back.out(2.4)", immediateRender: false }, at);
    },
  };

  function fact(tl, o) {
    var k = o.shot && o.shot.kieu;
    if (!k || !FACTS[k]) {
      if (k && !isShotKind(k)) console.warn("kieu-hinh: chưa có kiểu '" + k + "' cho thẻ, bỏ qua");
      return false;
    }
    FACTS[k](tl, o);
    return true;
  }

  /* ---------- chuyển mục (scenes[].chuyen) ----------
   * bottom-push-stack-wipe ("day-len"): cảnh mới đẩy cảnh cũ lên khỏi khung như vuốt sang video sau (0,32s).
   * shot-transitions whip-pan ("lia"): lia ngang có nhoè chuyển động, phanh gấp (0,26s).
   * Cảnh cũ được kéo dài thêm đúng thời gian chuyển (hai cảnh nằm hai track xen kẽ nên được chồng nhau). */
  function transition(prevNode, node, scene, kind) {
    if (CHUYEN.indexOf(kind) < 0) {
      console.warn("kieu-hinh: chưa có kiểu chuyển '" + kind + "', bỏ qua");
      return null;
    }
    var T = kind === "lia" ? 0.26 : 0.32;
    var b = scene.start;
    var pd = parseFloat(prevNode.getAttribute("data-duration"));
    if (isFinite(pd)) prevNode.setAttribute("data-duration", String(Math.round((pd + T) * 1000) / 1000));
    [prevNode, node].forEach(allow);
    return {
      animate: function (tl) {
        if (kind === "lia") {
          tl.fromTo(prevNode, { x: 0, filter: "blur(0px)" }, { x: -1080, filter: "blur(18px)", duration: T, ease: "power4.in", immediateRender: false }, b);
          tl.fromTo(node, { x: 1080, filter: "blur(18px)" }, { x: 0, filter: "blur(0px)", duration: T, ease: "expo.out", immediateRender: false }, b);
        } else {
          tl.fromTo(prevNode, { y: 0 }, { y: -1920, duration: T, ease: "power3.inOut", immediateRender: false }, b);
          tl.fromTo(node, { y: 1920 }, { y: 0, duration: T, ease: "power3.inOut", immediateRender: false }, b);
        }
      },
    };
  }

  GR.kieu = {
    SHOT: SHOT,
    FACT: FACT,
    CHUYEN: CHUYEN,
    cam: cam,
    over: over,
    lead: lead,
    shot: shot,
    fact: fact,
    transition: transition,
  };
})();
