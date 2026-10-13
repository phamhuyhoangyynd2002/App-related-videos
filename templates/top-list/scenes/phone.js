/* Điện thoại dọc của top-list (13/10/2026): khe ảnh, chuyển ảnh có chủ đích, chuyển động trong ảnh.
 * Dùng chung cho hook ảnh dọc (intro.js) và cảnh item bố cục mp (item.js). Người làm video chê "trong video nhàm":
 * trước đây ảnh đổi bằng crossfade + zoom 4%, nhịp nào trông cũng như nhau.
 *
 * Mỗi ảnh nằm trong một khe (.tl-slot, phủ kín màn hình điện thoại):
 *   - chuyển ảnh tween KHE (x / y / scale / opacity);
 *   - zoom, cuộn, đập bên trong ảnh tween chính ẢNH (x / y / scale, transform-origin 0 0, hình học từ placeCrop).
 * Hai lớp tách nhau nên không có hai tween cùng thuộc tính trên cùng phần tử chạy chồng thời gian (seek an toàn).
 *
 * Kiểu chuyển (xoay vòng giữa các nhịp để không nhàm):
 *   vuot   : ảnh mới vuốt ngang từ phải vào như lướt app, ảnh cũ lùi sang trái (0,3s, xong đúng lúc đọc từ khoá)
 *   cuon   : ảnh mới trượt từ dưới lên như cuộn màn hình, ảnh cũ trôi lên
 *   dap    : cắt sang ảnh mới (toàn cảnh) rồi đập zoom vào nửa trên/dưới, chạm đúng `at`, nảy nhẹ rồi trôi chậm
 *   mo-app : từ màn icon (splash) ảnh mới bung ra từ giữa màn như mở ứng dụng, icon phóng to rồi tắt
 *   cat    : cắt cứng (nhịp có kiểu hình chia-o: ô truyện tranh là nhân vật chính)
 * Không chớp sáng ở đây: chớp chỉ dành cho kiểu hình dap-zoom, cat-nhay (kieu-hinh.md, luật Q4).
 *
 * Chuyển động trong ảnh: ảnh cao hơn màn hình thì cuộn chậm từ trên xuống như đang lướt; không thì phóng chậm.
 * Không Math.random, Date.now, onUpdate: chỉ tween trên timeline có sẵn. Nạp SAU appreel.js, TRƯỚC intro.js, item.js.
 */
(function () {
  "use strict";
  var TL = (window.TopList = window.TopList || {});
  var T = 0.3; // thời gian một lần chuyển ảnh
  var DAP_PRE = 0.22; // dap: ảnh mới cắt vào sớm hơn `at` chừng này rồi đập vào
  var KINDS = ["vuot", "cuon", "dap"];
  var FLOW = "power2.inOut";

  function r3(x) {
    return Math.round(x * 1000) / 1000;
  }

  /* Trạng thái ảnh (x, y, scale; transform-origin 0 0) để phóng z lần và đưa điểm (fx, fy) của khung (tỉ lệ 0–1, nhìn ở
     trạng thái gốc) vào giữa khung. g: hình học từ placeCrop ({ left, top, s, w, h }). b: phần ảnh được phép lộ (px ảnh
     gốc, vd. vùng cắt manifest bỏ chữ quảng bá); luôn phủ kín khung W×H. z = 1, fx = fy = 0,5 → { 1, 0, 0 }. */
  function view(g, W, H, z, fx, fy, b) {
    var s = g.s;
    var px = fx * W - g.left;
    var py = fy * H - g.top;
    var x = W / 2 - g.left - px * z;
    var y = H / 2 - g.top - py * z;
    var bx0 = (b ? b.x : 0) * s * z;
    var by0 = (b ? b.y : 0) * s * z;
    var bx1 = (b ? b.x + b.w : g.w / s) * s * z;
    var by1 = (b ? b.y + b.h : g.h / s) * s * z;
    x = Math.min(-g.left - bx0, Math.max(W - g.left - bx1, x));
    y = Math.min(-g.top - by0, Math.max(H - g.top - by1, y));
    return { scale: z, x: r3(x), y: r3(y) };
  }

  /* Phần ảnh được lộ theo chiều dọc (px bố cục, tính từ đỉnh ảnh). */
  function allowedY(g, b) {
    return { y0: (b ? b.y : 0) * g.s, y1: (b ? b.y + b.h : g.h / g.s) * g.s };
  }

  /* Ảnh (đã phủ kín khung theo bề ngang) cao hơn khung đủ để cuộn. */
  function isTall(g, H, b) {
    if (!g || !H) return false;
    var a = allowedY(g, b);
    return a.y1 - a.y0 - H > 24;
  }

  /* Chuyển ảnh. o: { kind, slot (khe ảnh mới), prev (khe ảnh cũ hoặc null), W, H (cỡ màn hình), t0 (bắt đầu; dap, cat:
     lúc cắt), t1 (lúc ảnh mới vào xong) }. Khe ảnh cũ tắt hẳn sau khi bị phủ (không lộ lại ở lần chuyển sau). */
  function change(tl, o) {
    var slot = o.slot;
    var prev = o.prev || null;
    var t0 = o.t0;
    var t1 = Math.max(t0 + 0.12, o.t1);
    var d = t1 - t0;
    var hideAt = t1;
    if (o.kind === "vuot" || o.kind === "cuon") {
      var ax = o.kind === "vuot" ? "x" : "y";
      var len = o.kind === "vuot" ? o.W : o.H;
      var from = {};
      var to = { duration: d, ease: "power3.inOut" };
      from[ax] = len;
      to[ax] = 0;
      tl.fromTo(slot, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, t0);
      tl.fromTo(slot, from, to, t0);
      if (prev) {
        var pf = {};
        var pt = { duration: d, ease: "power3.inOut", immediateRender: false };
        pf[ax] = 0;
        pt[ax] = r3(-0.32 * len);
        tl.fromTo(prev, pf, pt, t0);
      }
    } else if (o.kind === "mo-app") {
      tl.fromTo(slot, { opacity: 0 }, { opacity: 1, duration: Math.min(0.1, d), ease: "power2.out" }, t0);
      tl.fromTo(slot, { scale: 0.28 }, { scale: 1, duration: d, ease: "power3.out" }, t0);
      if (prev) tl.fromTo(prev, { scale: 1 }, { scale: 1.3, duration: d, ease: "power2.in", immediateRender: false }, t0);
    } else {
      // dap, cat: cắt cứng
      tl.fromTo(slot, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, t0);
      hideAt = t0 + 0.04;
    }
    if (prev) tl.fromTo(prev, { opacity: 1 }, { opacity: 0, duration: 0.001, ease: "none", immediateRender: false }, hideAt);
  }

  /* Chuyển động trong ảnh từ t0 tới t1. o: { node, geo, W, H, t0, t1, mode ("scroll" | "push"), z0, z1, bounds, ease }.
     scroll: ảnh rộng vừa khung, cuộn từ đỉnh xuống đáy (như đang lướt). push: phóng chậm quanh giữa khung. */
  function drift(tl, o) {
    var d = Math.max(0.3, o.t1 - o.t0);
    var z0 = o.z0 === undefined ? 1 : o.z0;
    var z1 = o.z1 === undefined ? 1.07 : o.z1;
    if (!o.geo) {
      // ảnh chưa đo được kích thước (lỗi tải): phóng quanh tâm như object-fit: cover
      tl.fromTo(o.node, { scale: z0 }, { scale: z1, duration: d, ease: o.ease || FLOW }, o.t0);
      return;
    }
    if (o.mode === "scroll") {
      var a = allowedY(o.geo, o.bounds);
      var yTop = r3(-o.geo.top - a.y0);
      var yBot = r3(o.H - o.geo.top - a.y1);
      tl.fromTo(o.node, { scale: 1, x: 0, y: yTop }, { scale: 1, x: 0, y: yBot, duration: d, ease: o.ease || "power1.inOut" }, o.t0);
      return;
    }
    var A = view(o.geo, o.W, o.H, z0, 0.5, 0.5, o.bounds);
    var B = view(o.geo, o.W, o.H, z1, 0.5, 0.5, o.bounds);
    tl.fromTo(o.node, A, { scale: B.scale, x: B.x, y: B.y, duration: d, ease: o.ease || FLOW }, o.t0);
  }

  /* dap: ảnh ở toàn cảnh lúc o.cut, giật vào (power4.in) nửa trên/dưới (o.fy) chạm đúng o.at, nảy lùi 4%, rồi trôi chậm
     tới o.end. o: { node, geo, W, H, cut, at, end, fy, zoom, bounds }. */
  function punch(tl, o) {
    var Z = o.zoom || 1.32;
    var t1 = Math.max(o.cut + 0.08, o.at);
    if (!o.geo) {
      tl.fromTo(o.node, { scale: 1 }, { scale: Z, duration: t1 - o.cut, ease: "power4.in" }, o.cut);
      return;
    }
    var base = view(o.geo, o.W, o.H, 1, 0.5, 0.5, o.bounds);
    var hit = view(o.geo, o.W, o.H, Z * 1.04, 0.5, o.fy, o.bounds);
    var land = view(o.geo, o.W, o.H, Z, 0.5, o.fy, o.bounds);
    var hold = view(o.geo, o.W, o.H, Z * 1.035, 0.5, o.fy, o.bounds);
    tl.fromTo(o.node, base, { scale: hit.scale, x: hit.x, y: hit.y, duration: t1 - o.cut, ease: "power4.in" }, o.cut);
    tl.fromTo(o.node, hit, { scale: land.scale, x: land.x, y: land.y, duration: 0.16, ease: "power2.out", immediateRender: false }, t1);
    var rest = o.end - (t1 + 0.16);
    if (rest > 0.2) {
      tl.fromTo(o.node, land, { scale: hold.scale, x: hold.x, y: hold.y, duration: rest, ease: FLOW, immediateRender: false }, t1 + 0.16);
    }
  }

  TL.phone = { T: T, DAP_PRE: DAP_PRE, KINDS: KINDS, view: view, isTall: isTall, change: change, drift: drift, punch: punch };
})();
