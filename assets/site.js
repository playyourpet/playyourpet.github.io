// Zaxlon Games — ortak site betiği
// Menü, dil tercihi + Türkçe önerisi, Play bağlantısına kaynak (referrer), kayan görünme,
// Zax maskotu (göz kırpma, imleci izleme, dokununca tepki, boşta uyuma), "bugünün yıldızı" seçici,
// oynanış videosu, mobil indir çubuğu, ekran görüntüsü şeridi, ifade panosu, kopyala düğmeleri.
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  var LANG = /^(tr|es|pt)/.exec(root.lang || "");
  LANG = LANG ? LANG[1] : "en";
  var KEY = "zxLang";
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = {
    // Zax konuşmaz; tek istisna: Türkçe sayfada 12. dürtüşte kızgın tek söz (fed). Diğer dillerde hiç yazı yok.
    en: { close: "Close", copied: "Copied", copy: "Copy", fed: "" },
    tr: { close: "Kapat", copied: "Kopyalandı", copy: "Kopyala", fed: "Ne dürtüyon la!" },
    es: { close: "Cerrar", copied: "Copiado", copy: "Copiar", fed: "" },
    pt: { close: "Fechar", copied: "Copiado", copy: "Copiar", fed: "" }
  }[LANG];
  // İngilizce sayfada, tarayıcı dili TR/ES/PT ise o dilin sürümünü öneren ince şerit (o dilde yazılır)
  var HINT = {
    tr: { hl: "tr", text: "Bu sayfanın Türkçesi de var:", go: "Türkçe sürüm", close: "Kapat" },
    es: { hl: "es", text: "Esta página también está en español:", go: "Ver en español", close: "Cerrar" },
    pt: { hl: "pt", text: "Esta página também está em português:", go: "Ver em português", close: "Fechar" }
  };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function $all(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

  // ---------- Dil ----------
  $all("[data-setlang]").forEach(function (a) {
    a.addEventListener("click", function () { store(KEY, a.getAttribute("data-setlang")); });
  });
  (function hint() {
    if (LANG !== "en") return;
    var pref = load(KEY);
    if (pref === "en") return;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || "").toLowerCase();
    var want = HINT[pref] ? pref : (/^(tr|es|pt)\b/.exec(nav) || [])[1];
    var h = want && HINT[want];
    if (!h) return;
    var alt = document.querySelector('link[rel="alternate"][hreflang="' + h.hl + '"]');
    if (!alt) return;
    var bar = document.createElement("div");
    bar.className = "lang-hint";
    bar.setAttribute("lang", want === "pt" ? "pt-BR" : want);
    bar.innerHTML = h.text + ' <a href="' + alt.getAttribute("href") + '">' + h.go + '</a>' +
      '<button type="button" aria-label="' + h.close + '">×</button>';
    bar.querySelector("a").addEventListener("click", function () { store(KEY, want); });
    bar.querySelector("button").addEventListener("click", function () { store(KEY, "en"); bar.remove(); });
    document.body.insertBefore(bar, document.body.firstChild);
  })();

  // ---------- Üst çubuk + menü ----------
  var top = document.querySelector(".top");
  if (top) {
    var onScroll = function () { top.classList.toggle("scrolled", window.scrollY > 6); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }
  var burger = document.querySelector(".burger");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
    $all(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 980) setMenu(false); });
  }

  // ---------- Play bağlantısı: ?src=tiktok (ya da utm_source) mağazaya kaynak olarak geçer ----------
  (function referrer() {
    var q = new URLSearchParams(location.search);
    var src = (q.get("src") || q.get("utm_source") || "").toLowerCase();
    var med = (q.get("utm_medium") || "social").toLowerCase();
    var ok = /^[a-z0-9_-]{1,32}$/;
    if (ok.test(src)) { try { sessionStorage.setItem("zxSrc", src + "|" + (ok.test(med) ? med : "social")); } catch (e) {} }
    var saved = null; try { saved = sessionStorage.getItem("zxSrc"); } catch (e) {}
    if (!saved) return;
    var p = saved.split("|");
    $all("a[data-play]").forEach(function (a) {
      var u = new URL(a.href);
      u.searchParams.set("referrer", "utm_source=" + p[0] + "&utm_medium=" + p[1] + "&utm_campaign=" + a.getAttribute("data-play"));
      a.href = u.toString();
    });
  })();

  // ---------- Kayan görünme ----------
  var rv = $all(".rv");
  if ("IntersectionObserver" in window && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  // ---------- Zax ----------
  // Hareketler Web Animations ile: yaylı ezilme-esneme, solungaç çırpma (CSS salınımının ÜSTÜNE eklenir), sallanma.
  // Dürtme sırası (Zax konuşmaz): 1-3 mutlu, 4-5 kızgın, 6 "Giga Zax" pozu, 7-8 ve 10-11 giderek sertleşen kızgınlık, 9 gizli Man Face,
  // 12. dürtüş: kızgın sarsılma + yalnız Türkçe sayfada "Ne dürtüyon la!" balonu, sonra baştan. 4 sn dürtülmezse sayaç sıfırlanır.
  var CAN_ANIM = !REDUCED && typeof Element !== "undefined" && "animate" in Element.prototype;
  function anim(el, kf, opt) { if (!el || !CAN_ANIM) return null; try { return el.animate(kf, opt); } catch (e) { return null; } }
  function squash(body, k) {
    k = k || 1;
    return anim(body, [
      { transform: "translateY(0) scale(1, 1)", easing: "cubic-bezier(.3,0,.6,1)" },
      { transform: "translateY(" + 2 * k + "px) scale(" + (1 + .075 * k) + "," + (1 - .09 * k) + ")", offset: .16, easing: "cubic-bezier(.2,.7,.3,1)" },
      { transform: "translateY(" + -13 * k + "px) scale(" + (1 - .04 * k) + "," + (1 + .05 * k) + ")", offset: .46, easing: "cubic-bezier(.5,0,.7,.4)" },
      { transform: "translateY(0) scale(" + (1 + .03 * k) + "," + (1 - .035 * k) + ")", offset: .74, easing: "cubic-bezier(.3,0,.4,1)" },
      { transform: "translateY(0) scale(1, 1)" }
    ], { duration: 660 });
  }
  function flutter(svg, amp, dur) {
    $all(".gw", svg).forEach(function (g, i) {
      anim(g, [{ transform: "rotate(0deg)" }, { transform: "rotate(" + -amp + "deg)", offset: .32 }, { transform: "rotate(" + amp * .45 + "deg)", offset: .66 }, { transform: "rotate(0deg)" }],
        { duration: dur || 700, delay: (i % 3) * 45, easing: "cubic-bezier(.45,0,.55,1)", composite: "add" });
    });
  }
  function Zax(svg) {
    var faces = svg.querySelector(".zx-faces"), body = svg.querySelector(".zx-body");
    var base = svg.getAttribute("data-face") || "main";
    var stage = svg.closest("[data-zax-stage]") || svg.parentNode;
    var bubble = stage.querySelector(".bubble-say");
    var pokes = 0, pokeT = 0, busy = 0, sleeping = false, idleT = 0, hovering = false, hold = null;
    var follow = svg.hasAttribute("data-follow");

    function face(f) { svg.setAttribute("data-face", f); }
    function rest() { if (!sleeping) face(hovering ? "happy" : base); }
    function say(txt, mood, ms) {
      if (!bubble) return;
      bubble.textContent = txt;
      bubble.classList.remove("mad", "on"); void bubble.offsetWidth;
      if (mood) bubble.classList.add(mood);
      bubble.classList.add("on");
      clearTimeout(bubble._t); bubble._t = setTimeout(function () { bubble.classList.remove("on"); }, ms || 2400);
    }
    function hush() { if (bubble) { clearTimeout(bubble._t); bubble.classList.remove("on"); } }
    function blink() {
      if (!sleeping && !document.hidden) {
        $all(".f-" + svg.getAttribute("data-face") + " .zx-eye", svg).forEach(function (e) {
          anim(e, [{ transform: "scaleY(1)" }, { transform: "scaleY(.08)", offset: .42 }, { transform: "scaleY(1)" }], { duration: 190, easing: "cubic-bezier(.45,0,.55,1)" });
        });
      }
      setTimeout(blink, 2600 + Math.random() * 3400);
    }
    function release() { if (hold) { var h = hold; hold = null; anim(body, [{ transform: "translateY(-5px) rotate(-2.5deg) scale(1.04)" }, { transform: "translateY(0) rotate(0) scale(1)" }], { duration: 460, easing: "cubic-bezier(.3,0,.2,1)" }); h.cancel(); } }
    function wake() {
      if (sleeping) { sleeping = false; face("wow"); setTimeout(rest, 700); }
      resetIdle();
    }
    function shake(k) {   // kızgın sarsılma; k büyüdükçe sertleşir
      anim(body, [{ transform: "translateX(0) rotate(0)" }, { transform: "translateX(" + -5 * k + "px) rotate(" + -2.2 * k + "deg)", offset: .14 },
        { transform: "translateX(" + 5 * k + "px) rotate(" + 2.2 * k + "deg)", offset: .32 }, { transform: "translateX(" + -4 * k + "px) rotate(" + -1.6 * k + "deg)", offset: .5 },
        { transform: "translateX(" + 3 * k + "px) rotate(" + 1.1 * k + "deg)", offset: .68 }, { transform: "translateX(" + -k + "px) rotate(" + -.4 * k + "deg)", offset: .86 },
        { transform: "translateX(0) rotate(0)" }], { duration: 480 + 60 * k, easing: "cubic-bezier(.45,0,.55,1)" });
    }
    function resetIdle() {
      clearTimeout(idleT);
      if (svg.hasAttribute("data-sleepy") && !REDUCED) idleT = setTimeout(function () { sleeping = true; release(); face("sleep"); }, 20000);
    }
    function giga() {
      // Giga Zax konuşmaz: açık balon varsa kapanır, yalnız poz verir (hafif çene yukarı)
      face("chad"); hush(); flutter(svg, 8, 900);
      hold = anim(body, [{ transform: "translateY(0) rotate(0) scale(1)" }, { transform: "translateY(-8px) rotate(-3.5deg) scale(1.055)", offset: .55 }, { transform: "translateY(-5px) rotate(-2.5deg) scale(1.04)" }],
        { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      busy = setTimeout(function () { busy = 0; release(); rest(); }, 3000);
    }
    function manface() {
      // Man Face = gizli yüz (2026-11-13 kullanıcı: "tıklayınca gözüksün ama Zax'la tanış kısmında bulunmasın"):
      // ifade düğmelerinde yok, yalnız 9. dürtüşte çıkar. Sessiz, dimdik ve ciddi: hafif yükselir, dönmeden durur.
      face("manface"); hush(); flutter(svg, 6, 1000);
      hold = anim(body, [{ transform: "translateY(0) rotate(0) scale(1)" }, { transform: "translateY(-7px) rotate(0) scale(1.05)", offset: .6 }, { transform: "translateY(-5px) rotate(0) scale(1.04)" }],
        { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      busy = setTimeout(function () { busy = 0; release(); rest(); }, 3200);
    }

    svg.addEventListener("pointerenter", function () {
      hovering = true; wake(true);
      if (!busy) { face("happy"); flutter(svg, 9, 620); }
    });
    svg.addEventListener("pointerleave", function () { hovering = false; if (!busy) rest(); });
    svg.addEventListener("click", function () {
      wake(); clearTimeout(busy); busy = 0; release();
      pokes++; clearTimeout(pokeT); pokeT = setTimeout(function () { pokes = 0; }, 4000);
      if (base === "respawn") {
        face("wow"); squash(body, 1.2); flutter(svg, 14, 700);
        busy = setTimeout(function () { busy = 0; base = "main"; face("happy"); }, 380);
        return;
      }
      if (pokes >= 12) {
        pokes = 0; clearTimeout(pokeT);
        face("angry"); shake(2.4); flutter(svg, 16, 560);
        if (T.fed) say(T.fed, "mad", 2600);
        busy = setTimeout(function () { busy = 0; rest(); }, 2600);
        return;
      }
      if (pokes === 6) { giga(); return; }
      if (pokes === 9) { manface(); return; }
      if (pokes >= 4) {
        face("angry"); shake(pokes < 6 ? 1 : 1 + (pokes - 6) * .22);
        if (pokes > 6) flutter(svg, 6 + pokes, 420);
        busy = setTimeout(function () { busy = 0; rest(); }, 1700);
        return;
      }
      face("wow"); squash(body, 1); flutter(svg, 12, 680);
      busy = setTimeout(function () {
        busy = 0; face("happy");
        setTimeout(function () { if (!busy) rest(); }, 1100);
      }, 300);
    });
    svg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); svg.dispatchEvent(new Event("click")); } });

    // göz takibi: imlece doğru yumuşak (lerp) kayma, durunca rAF kapanır
    if (follow && faces && !REDUCED) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      var step = function () {
        cx += (tx - cx) * .14; cy += (ty - cy) * .14;
        faces.style.transform = "translate(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px)";
        raf = (Math.abs(tx - cx) > .02 || Math.abs(ty - cy) > .02) ? requestAnimationFrame(step) : 0;
      };
      window.addEventListener("pointermove", function (e) {
        var r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var dx = e.clientX - (r.left + r.width * 0.5), dy = e.clientY - (r.top + r.height * 0.36);
        var d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 360);
        tx = dx / d * 3.6 * k; ty = dy / d * 2.6 * k;
        if (!raf) raf = requestAnimationFrame(step);
      }, { passive: true });
    }
    if (svg.hasAttribute("data-sleepy")) {
      ["pointermove", "scroll", "keydown", "touchstart"].forEach(function (ev) { window.addEventListener(ev, function () { if (!sleeping) resetIdle(); }, { passive: true }); });
      resetIdle();
    }
    setTimeout(blink, 1200 + Math.random() * 2000);
  }
  $all(".zax[data-live]").forEach(function (s) { new Zax(s); });
  // klavye odağı yalnız klavyeyle gezilirken görünsün (dürtünce kare çerçeve çıkmasın)
  window.addEventListener("keydown", function (e) { if (e.key === "Tab") root.classList.add("kb"); });
  window.addEventListener("pointerdown", function () { root.classList.remove("kb"); }, { passive: true });
  // Alt bilgideki göz kırpan Zax
  $all(".foot-peek").forEach(function (p) {
    var z = p.querySelector(".zax"); if (!z) return;
    var t = 0;
    function wink() { z.setAttribute("data-face", "wink"); p.classList.add("up"); clearTimeout(t); t = setTimeout(function () { z.setAttribute("data-face", "main"); p.classList.remove("up"); }, 1300); }
    p.addEventListener("pointerenter", wink); p.addEventListener("click", wink);
  });

  // ---------- "Bugünün yıldızı" seçici ----------
  // Tarçın + Karabaş (data-head): gövde ve kafa aynı SVG viewBox'ta ayrı katman; kafa imlece / parmağa doğru döner,
  // data-tilt > 0 ise yukarı-aşağı da biraz eğilir. Diğer yıldızlar tek <img>. Hiçbiri konuşmaz (yalnız ad etiketi).
  // Dönüş = TEK KAREDE aynalama + kısa büyüyüp oturma (2026-11-13 kullanıcı: "kafa çevirirken boşluklar gözüküyor"):
  // eski ölçek 1 → -1 geçişinde kafa incelirken altındaki gövde kesiği ve boşluk görünüyordu. İki duruş da boşluksuz;
  // büyüme yalnız ≥ 1 (kafa küçülürse kenarından gövde kesiği görünür).
  $all("[data-chooser]").forEach(function (c) {
    var room = c.querySelector(".room"), img = c.querySelector("img.star"), svg = c.querySelector(".star-svg");
    var name = c.querySelector(".nametag b");
    var body = svg && svg.querySelector(".st-body"), headG = svg && svg.querySelector(".st-head"), headI = headG && headG.querySelector("image");
    var btns = $all(".picks button", c), ix = 0, auto = 0, touched = false, hover = false;
    var turn = null, look = 0, tilt = 0, aimRaf = 0, px = 0, py = 0, shownF = 1;
    btns.forEach(function (b) {
      ["data-img", "data-body", "data-head"].forEach(function (a) { var u = b.getAttribute(a); if (u) { var i = new Image(); i.src = u; } });
    });
    function setHead() {
      // görünür yön = facing × F; scale(F) rotate(R) → görünür dönüş F·R, bu yüzden R = istenen × F
      var F = look === 0 ? 1 : look * turn.facing, R = (tilt * F).toFixed(2);
      var tf = "scale(" + F + ",1) rotate(" + R + "deg)";
      if (F !== shownF) {
        // yön değişti: geçişsiz aynala, sonra kısa "pop" (yalnız büyür)
        headG.style.transition = "none"; headG.style.transform = tf;
        void headG.getBoundingClientRect(); headG.style.transition = "";
        anim(headG, [{ transform: tf }, { transform: "scale(" + F * 1.07 + ",1.07) rotate(" + R + "deg)", offset: .3, easing: "cubic-bezier(.3,0,.4,1)" }, { transform: tf }],
          { duration: 360, easing: "cubic-bezier(.2,.7,.3,1)" });
        shownF = F;
      } else headG.style.transform = tf;   // yalnız eğilme: CSS geçişiyle yumuşak
    }
    function aim() {
      aimRaf = 0;
      if (!turn) return;
      var r = svg.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      var W = turn.vb[0], H = turn.vb[1], k = Math.min(r.width / W, r.height / H);
      var ox = r.left + (r.width - W * k) / 2, oy = r.top + (r.height - H * k);       // xMidYMax meet
      var hx = ox + (turn.box[0] + turn.box[2] / 2) * k, hy = oy + (turn.box[1] + turn.box[3] * .55) * k;
      var dx = px - hx, dy = py - hy, dead = turn.box[2] * k * .2;
      var A = look || turn.facing;
      if (dx > dead) A = 1; else if (dx < -dead) A = -1;                                // ölü bölge: kafa titremesin
      var t = A * Math.max(-1, Math.min(1, dy / 220)) * turn.tilt;                         // imleç yukarıdaysa burun yukarı
      if (A !== look || Math.abs(t - tilt) > .25) { look = A; tilt = t; setHead(); }
    }
    function track(x, y) { px = x; py = y; if (turn && !aimRaf) aimRaf = requestAnimationFrame(aim); }
    function pick(i, quiet) {
      ix = i; var b = btns[i];
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      name.textContent = b.getAttribute("data-name");
      var hd = svg && b.getAttribute("data-head");
      if (hd) {
        var vb = b.getAttribute("data-vb").split(" ").map(Number), hb = b.getAttribute("data-hbox").split(" ").map(Number);
        svg.setAttribute("viewBox", "0 0 " + vb[0] + " " + vb[1]); svg.setAttribute("aria-label", b.getAttribute("data-alt"));
        body.setAttribute("width", vb[0]); body.setAttribute("height", vb[1]); body.setAttribute("href", b.getAttribute("data-body"));
        headI.setAttribute("x", hb[0]); headI.setAttribute("y", hb[1]); headI.setAttribute("width", hb[2]); headI.setAttribute("height", hb[3]);
        headI.setAttribute("href", hd);
        turn = { facing: +b.getAttribute("data-facing") || 1, tilt: +b.getAttribute("data-tilt") || 0, box: hb, vb: vb };
        look = 0; tilt = 0; shownF = 1; headG.style.transform = "";
        c.classList.add("turning");
        if (px || py) track(px, py);
      } else {
        turn = null; c.classList.remove("turning");
        img.src = b.getAttribute("data-img"); img.alt = b.getAttribute("data-alt");
      }
      if (!REDUCED && !quiet) { var el = turn ? svg : img; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
    }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { touched = true; clearInterval(auto); pick(i); }); });
    pick(0, true);
    if (svg && !REDUCED) {
      window.addEventListener("pointermove", function (e) { if (e.pointerType !== "touch") track(e.clientX, e.clientY); }, { passive: true });
      ["touchstart", "touchmove"].forEach(function (ev) {
        window.addEventListener(ev, function (e) { var t = e.touches && e.touches[0]; if (t) track(t.clientX, t.clientY); }, { passive: true });
      });
    }
    // fareyle odanın üstündeyken otomatik geçiş durur (kafayla oynarken yıldız değişmesin)
    room.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
    room.addEventListener("pointerleave", function () { hover = false; });
    if (REDUCED || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        clearInterval(auto);
        if (e.isIntersecting && !touched) auto = setInterval(function () { if (!hover) pick((ix + 1) % btns.length); }, 3400);
      });
    }, { threshold: 0.5 }).observe(c);
  });

  // ---------- Oynanış videosu: yalnız görünürken oynar; hareket azaltma açıksa poster kalır ----------
  $all("video[data-loop]").forEach(function (v) {
    v.muted = true;
    if (REDUCED) return;
    function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!("IntersectionObserver" in window)) { play(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(); else v.pause(); });
    }, { threshold: 0.15 }).observe(v);
  });

  // ---------- Mobil "İndir" çubuğu: sayfanın ilk Play düğmesi ekrandan çıkınca belirir, alt bilgide gizlenir ----------
  $all("[data-getbar]").forEach(function (bar) {
    var first = document.querySelector("main [data-play]"), foot = document.querySelector(".foot");
    if (!first || !("IntersectionObserver" in window)) return;
    var passed = false, atFoot = false;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === foot) atFoot = e.isIntersecting;
        else passed = !e.isIntersecting && e.boundingClientRect.top < 0;
      });
      bar.classList.toggle("on", passed && !atFoot);
    }).observe(first);
    if (foot) new IntersectionObserver(function (es) {
      atFoot = es[0].isIntersecting; bar.classList.toggle("on", passed && !atFoot);
    }).observe(foot);
    // iPhone/iPad: Play bağlantısı işe yaramaz → "şimdilik yalnız Android" + "Haber ver" (e-posta = iOS talebi oyu)
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) {
      var sm = bar.querySelector("small"), a = bar.querySelector(".btn");
      if (sm) sm.textContent = bar.getAttribute("data-ios-sub");
      if (a) { a.textContent = bar.getAttribute("data-ios-btn"); a.href = bar.getAttribute("data-ios-href"); a.removeAttribute("target"); a.removeAttribute("data-play"); }
    }
  });

  // ---------- Sesli fragman: büyük "Ses açık" düğmesi; oynayınca yerel denetimler gelir ----------
  $all(".trailer").forEach(function (t) {
    var v = t.querySelector("video"), b = t.querySelector(".tplay");
    if (!v || !b) return;
    v.removeAttribute("controls");                    // JS yoksa yerel denetimler kalır
    b.addEventListener("click", function () { v.controls = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); });
    v.addEventListener("play", function () { t.classList.add("playing"); });
    v.addEventListener("ended", function () { t.classList.remove("playing"); v.controls = false; try { v.currentTime = 0; } catch (e) {} });
  });

  // ---------- Ekran görüntüsü şeridi ----------
  $all("[data-strip]").forEach(function (nav) {
    var strip = document.getElementById(nav.getAttribute("data-strip"));
    if (!strip) return;
    $all("button", nav).forEach(function (b) {
      b.addEventListener("click", function () {
        strip.scrollBy({ left: (b.value === "next" ? 1 : -1) * Math.round(strip.clientWidth * 0.8), behavior: REDUCED ? "auto" : "smooth" });
      });
    });
  });

  // ---------- İfade panosu (Stüdyo) ----------
  $all("[data-faceboard]").forEach(function (board) {
    var z = board.querySelector(".stage .zax");
    $all(".faces button", board).forEach(function (b) {
      b.addEventListener("click", function () {
        $all(".faces button", board).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        z.setAttribute("data-face", b.getAttribute("data-face"));
        squash(z.querySelector(".zx-body"), .8); flutter(z, 10, 640);
      });
    });
  });

  // ---------- SSS: yumuşak açılış/kapanış ----------
  // <details> kendiliğinden anında açılıp kapanır; burada yanıt yüksekliği 0 ↔ içerik boyu arasında kayar.
  // Kapanırken "closing" sınıfı artıyı hemen geri çevirir, animasyon bitince details kapanır. Hareket azaltma açıksa dokunulmaz.
  if (!REDUCED) $all(".qa details").forEach(function (d) {
    var s = d.querySelector("summary"), a = d.querySelector(".a"), anim = null;
    if (!s || !a || !a.animate) return;
    s.addEventListener("click", function (e) {
      e.preventDefault();
      // kapalı details'in içi çizilmese de Chrome kutu boyu bildirebiliyor → kapalıysa başlangıç 0
      var from = d.open ? a.getBoundingClientRect().height : 0;
      if (anim) { anim.cancel(); anim = null; }
      var opening = !d.open || d.classList.contains("closing");
      d.classList.remove("closing");
      if (opening) {
        d.open = true;
        var to = a.scrollHeight;
        anim = a.animate([{ height: from + "px", opacity: from ? 1 : 0 }, { height: to + "px", opacity: 1 }],
                         { duration: 340, easing: "cubic-bezier(.2,.7,.2,1)" });
      } else {
        d.classList.add("closing");
        anim = a.animate([{ height: from + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,.6,1)" });
      }
      anim.onfinish = function () {
        if (d.classList.contains("closing")) { d.classList.remove("closing"); d.open = false; }
        anim = null;
      };
    });
  });

  // ---------- Kopyala ----------
  $all("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy"));
      if (!el || !navigator.clipboard) return;
      navigator.clipboard.writeText(el.innerText.trim()).then(function () {
        b.textContent = T.copied; b.classList.add("ok");
        setTimeout(function () { b.textContent = T.copy; b.classList.remove("ok"); }, 1600);
      });
    });
  });
})();
