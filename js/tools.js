/* Инструменты: высота столешницы, рабочий треугольник, ящик с доводчиком. */
(function () {
  "use strict";
  function $(s, r) { return (r || document).querySelector(s); }
  function goal(n) { try { if (window.SITE && window.SITE.metrikaId && window.ym) window.ym(window.SITE.metrikaId, "reachGoal", n); } catch (e) {} }

  /* ---------- вкладки ---------- */
  var tabs = document.querySelectorAll(".tool-tab");
  function openTab(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === id;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { openTab(t.getAttribute("data-tab")); goal("tool_" + t.getAttribute("data-tab")); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var n = tabs[(k + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
  });
  document.querySelectorAll("[data-open-tool]").forEach(function (a) {
    a.addEventListener("click", function () { openTab(a.getAttribute("data-open-tool")); });
  });

  /* =========================================================
     1. Высота столешницы
     Удобная рабочая высота – на 10–15 см ниже согнутого локтя.
     Без замера локтя – ориентир 0,53 × рост.
     ========================================================= */
  var H = $("#tool-height");
  if (H) {
    var hIn = $("[name=h1]", H), hRange = $("[name=h1r]", H), eIn = $("[name=elbow]", H);
    var h2Toggle = $("[name=two]", H), h2In = $("[name=h2]", H), h2Wrap = $(".h2-wrap", H);
    var out = $(".height-out", H), art = $(".height-art", H);
    var STD_LO = 85, STD_HI = 90;

    function num(el, lo, hi) {
      var v = parseFloat(String(el.value).replace(",", "."));
      if (isNaN(v)) return null;
      return Math.min(hi, Math.max(lo, v));
    }
    function rec(h, elbow) {
      if (elbow) return { lo: Math.round(elbow - 15), hi: Math.round(elbow - 10), byElbow: true };
      var c = h * 0.53;
      return { lo: Math.round(c - 2.5), hi: Math.round(c + 2.5), byElbow: false };
    }
    function verdict(r) {
      if (r.lo > STD_HI) return { cls: "up", t: "Стандартная кухня (85–90 см) будет вам низковата – придётся сутулиться. Сделаем выше на " + (r.lo - STD_HI) + "–" + (r.hi - STD_HI) + " см за счёт цоколя или корпусов." };
      if (r.hi < STD_LO) return { cls: "down", t: "Стандартная кухня (85–90 см) будет вам высоковата. Сделаем ниже на " + (STD_LO - r.hi) + "–" + (STD_LO - r.lo) + " см." };
      return { cls: "ok", t: "Стандартная высота (85–90 см) вам подходит. Можно не переплачивать за нестандарт." };
    }
    function person(x, h, top, color, label) {
      // фигура рисуется в масштабе 1 см = 2 px, пол на y = 440
      var s = 2, floor = 440, H2 = h * s;
      var head = H2 * 0.13, neck = floor - H2 + head;
      var elbowY = floor - (top + 12.5) * s;
      var shoulderY = neck + H2 * 0.05;
      return '<g class="person" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="' + x + '" cy="' + (floor - H2 + head / 2) + '" r="' + head / 2 + '" fill="' + color + '" stroke="none"/>' +
        '<path d="M' + x + " " + neck + " L" + x + " " + (floor - H2 * 0.48) + '"/>' +
        '<path d="M' + x + " " + (floor - H2 * 0.48) + " L" + (x - 8) + " " + floor + " M" + x + " " + (floor - H2 * 0.48) + " L" + (x + 8) + " " + floor + '"/>' +
        '<path d="M' + x + " " + shoulderY + " L" + (x + 6) + " " + elbowY + " L" + (x + 60) + " " + (elbowY + 6) + '"/>' +
        "</g>" + (label ? '<text x="' + x + '" y="' + (floor - H2 - 10) + '" text-anchor="middle" class="h-lbl">' + label + "</text>" : "");
    }
    function draw(rs, hs) {
      // масштаб 1 см = 2 px, пол на y = 440; шкаф справа, размеры – правее шкафа
      var floor = 440, s = 2, mid = (rs[0].lo + rs[0].hi) / 2, topY = floor - mid * s;
      var stdY = floor - STD_HI * s;
      var g = '<svg viewBox="0 0 600 460" role="img" aria-label="Человек у столешницы высотой ' + Math.round(mid) + ' см">' +
        '<rect x="0" y="440" width="600" height="20" fill="#D8CFC2"/>' +
        // полоса стандарта 85–90 см
        '<rect x="0" y="' + stdY + '" width="600" height="' + ((STD_HI - STD_LO) * s) + '" fill="#A5C33C" opacity=".14"/>' +
        '<text x="10" y="' + (stdY - 8) + '" class="h-std">стандарт 85–90 см</text>' +
        // кухонный модуль
        '<rect x="236" y="' + (topY + 8) + '" width="220" height="' + (floor - topY - 8) + '" fill="#A9B8A0"/>' +
        '<rect x="236" y="' + (floor - 20) + '" width="220" height="20" fill="#3C4146"/>' +
        '<rect x="230" y="' + topY + '" width="232" height="8" fill="#C9A27A"/>' +
        '<rect x="321" y="' + (topY + 26) + '" width="50" height="4" rx="2" fill="#2B2F33"/>' +
        // размерная линия справа от шкафа
        '<path d="M486 ' + topY + " V" + floor + '" stroke="#6F8A1F" stroke-width="2"/><path d="M479 ' + topY + " h14 M479 " + floor + ' h14" stroke="#6F8A1F" stroke-width="2"/>' +
        '<text x="500" y="' + ((topY + floor) / 2 + 6) + '" class="h-dim">' + Math.round(mid) + " см</text>";
      g += person(176, hs[0], mid, "#2B2F33", hs.length > 1 ? "Вы" : "");
      if (hs.length > 1) g += person(96, hs[1], (rs[1].lo + rs[1].hi) / 2, "#8A9096", "Второй");
      art.innerHTML = g + "</svg>";
    }
    function update() {
      var h = num(hIn, 140, 210) || 168;
      var elbow = eIn.value.trim() ? num(eIn, 80, 140) : null;
      var r = rec(h, elbow), v = verdict(r);
      var html = '<p class="h-big">' + r.lo + "–" + r.hi + " см</p>" +
        '<p class="h-how">' + (r.byElbow ? "по высоте локтя: на 10–15 см ниже согнутого локтя" : "примерно, по росту. Точнее – по высоте локтя, ниже") + "</p>" +
        '<p class="h-verdict ' + v.cls + '">' + v.t + "</p>";
      var hs = [h], rs = [r];
      if (h2Toggle.checked) {
        var h2 = num(h2In, 140, 210) || 160, r2 = rec(h2, null);
        hs.push(h2); rs.push(r2);
        if (Math.abs((r.lo + r.hi) / 2 - (r2.lo + r2.hi) / 2) >= 5) {
          html += '<p class="h-two">Рост сильно отличается. Хорошее решение – разная высота зон: мойку чуть выше, варочную панель чуть ниже основной столешницы. Обсудим на замере.</p>';
        } else html += '<p class="h-two">Вам обоим подойдёт одна высота – около ' + Math.round(((r.lo + r.hi) / 2 + (r2.lo + r2.hi) / 2) / 2) + " см.</p>";
      }
      out.innerHTML = html;
      draw(rs, hs);
    }
    hRange.addEventListener("input", function () { hIn.value = hRange.value; update(); });
    hIn.addEventListener("input", function () {
      var v = parseFloat(hIn.value);
      if (isNaN(v) || v < 140 || v > 210) return; // ждём, пока число будет допечатано; крайние случаи исправит change
      hRange.value = v; update();
    });
    hIn.addEventListener("change", function () { var v = num(hIn, 140, 210); hIn.value = v || 168; hRange.value = hIn.value; update(); });
    eIn.addEventListener("input", function () { var v = parseFloat(eIn.value); if (eIn.value.trim() === "" || (v >= 80 && v <= 140)) update(); });
    eIn.addEventListener("change", function () { if (eIn.value.trim()) { var v = num(eIn, 80, 140); eIn.value = v || ""; } update(); });
    h2Toggle.addEventListener("change", function () { h2Wrap.hidden = !h2Toggle.checked; update(); });
    h2In.addEventListener("input", function () { var v = parseFloat(h2In.value); if (v >= 140 && v <= 210) update(); });
    h2In.addEventListener("change", function () { h2In.value = num(h2In, 140, 210) || 160; update(); });
    update();
  }

  /* =========================================================
     2. Рабочий треугольник (правило NKBA):
     каждая сторона 1,2–2,7 м, сумма не больше 7,9 м.
     План в сантиметрах: комната 400 × 320, Г-образная кухня.
     ========================================================= */
  var T = $("#tool-triangle");
  if (T) {
    var svg = $("svg", T), legsG = $(".tri-legs", T), itemsG = $(".tri-items", T), info = $(".tri-info", T);
    var DEPTH = 60, ROOM_W = 400, ROOM_H = 320;
    var ITEMS = {
      sink: { n: "Мойка", w: 80, c: "#5B8FC9" },
      stove: { n: "Плита", w: 60, c: "#E07B39" },
      fridge: { n: "Холодильник", w: 60, c: "#6F8A1F" }
    };
    var START = { sink: { wall: "top", t: 110 }, stove: { wall: "top", t: 360 }, fridge: { wall: "left", t: 280 } };
    var GOOD = { sink: { wall: "top", t: 170 }, stove: { wall: "left", t: 120 }, fridge: { wall: "left", t: 250 } };
    var pos = JSON.parse(JSON.stringify(START));

    // допустимые отрезки: верхняя стена (x от 60 до 400) и левая (y от 60 до 320), без угла
    function range(id, wall) {
      var half = ITEMS[id].w / 2;
      return wall === "top" ? [DEPTH + half, ROOM_W - half] : [DEPTH + half, ROOM_H - half];
    }
    function xy(p) { return p.wall === "top" ? { x: p.t, y: DEPTH / 2 } : { x: DEPTH / 2, y: p.t }; }
    function dist(a, b) { var A = xy(a), B = xy(b); return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y)) / 100; }
    function overlaps(id, p) {
      for (var k in pos) {
        if (k === id || pos[k].wall !== p.wall) continue;
        if (Math.abs(pos[k].t - p.t) < (ITEMS[k].w + ITEMS[id].w) / 2) return true;
      }
      return false;
    }
    function nearest(id, x, y) {
      var rt = range(id, "top"), rl = range(id, "left");
      var top = { wall: "top", t: Math.min(rt[1], Math.max(rt[0], x)) };
      var left = { wall: "left", t: Math.min(rl[1], Math.max(rl[0], y)) };
      var a = xy(top), b = xy(left);
      var da = (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y), db = (b.x - x) * (b.x - x) + (b.y - y) * (b.y - y);
      return da <= db ? top : left;
    }
    function itemSVG(id) {
      var it = ITEMS[id], p = xy(pos[id]), rot = pos[id].wall === "left" ? 90 : 0, w = it.w, d = 54;
      var inner = "";
      if (id === "sink") inner = '<rect x="' + (-w / 2 + 8) + '" y="-18" width="' + (w - 16) + '" height="34" rx="8" fill="#fff" opacity=".85"/><circle cx="0" cy="-20" r="3" fill="#fff"/>';
      if (id === "stove") inner = [[-14, -12], [14, -12], [-14, 12], [14, 12]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="8" fill="none" stroke="#fff" stroke-width="2.5"/>'; }).join("");
      if (id === "fridge") inner = '<rect x="-22" y="-20" width="44" height="40" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M-22 -4 h44" stroke="#fff" stroke-width="2.5"/>';
      return '<g class="tri-item" data-id="' + id + '" tabindex="0" role="slider" aria-label="' + it.n + ': перетащите или двигайте стрелками" aria-valuetext="' + (pos[id].wall === "top" ? "у окна, " : "у левой стены, ") + (pos[id].t / 100).toFixed(1).replace(".", ",") + ' м от угла" transform="translate(' + p.x + " " + p.y + ')">' +
        '<g transform="rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-d / 2) + '" width="' + w + '" height="' + d + '" rx="6" fill="' + it.c + '"/>' + inner + "</g>" +
        "<title>" + it.n + "</title></g>";
    }
    function legStatus(m) { return m < 1.2 ? "short" : m > 2.7 ? "long" : "ok"; }
    var PAIRS = [["sink", "stove"], ["stove", "fridge"], ["fridge", "sink"]];
    var PAIR_N = { "sink-stove": "Мойка – плита", "stove-fridge": "Плита – холодильник", "fridge-sink": "Холодильник – мойка" };
    function render() {
      var legs = "", rows = "", sum = 0, problems = [];
      PAIRS.forEach(function (pr) {
        var a = xy(pos[pr[0]]), b = xy(pos[pr[1]]), m = dist(pos[pr[0]], pos[pr[1]]), st = legStatus(m);
        sum += m;
        legs += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" class="leg ' + st + '"/>' +
          '<text x="' + (a.x + b.x) / 2 + '" y="' + ((a.y + b.y) / 2 + 4) + '" class="leg-lbl ' + st + '" text-anchor="middle">' + m.toFixed(1).replace(".", ",") + " м</text>";
        var key = pr.join("-");
        rows += '<li class="' + st + '"><span>' + PAIR_N[key] + "</span><b>" + m.toFixed(1).replace(".", ",") + " м</b></li>";
        if (st === "short") problems.push(key === "stove-fridge" ? "плита слишком близко к холодильнику – жар вредит холодильнику, а рядом негде поставить кастрюлю" :
          key === "sink-stove" ? "мойка и плита слишком близко – между ними не останется места, чтобы резать продукты" : "холодильник и мойка слишком близко – тесно");
        if (st === "long") problems.push(PAIR_N[key].toLowerCase() + " – далеко ходить");
      });
      var sumOk = sum <= 7.9;
      if (!sumOk) problems.push("в сумме больше 7,9 м – за день набегает много лишних шагов");
      legsG.innerHTML = legs;
      itemsG.innerHTML = itemSVG("sink") + itemSVG("stove") + itemSVG("fridge");
      var good = !problems.length;
      info.innerHTML = '<p class="tri-verdict ' + (good ? "ok" : "bad") + '">' + (good ? "👍 Удобно! Всё по правилам." : "🤔 Можно удобнее") + "</p>" +
        '<ul class="tri-legs-list">' + rows + '<li class="' + (sumOk ? "ok" : "long") + ' sum"><span>Сумма</span><b>' + sum.toFixed(1).replace(".", ",") + " м</b></li></ul>" +
        (good ? '<p class="tri-hint">Так готовить легко: всё под рукой, и никто не мешает друг другу. Конечно, в реальной кухне многое решают трубы, окна и розетки – это учтём на замере.</p>' :
          '<p class="tri-hint">' + problems.map(function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }).join(". ") + ".</p>");
      if (good && !T._won) { T._won = true; goal("triangle_ok"); }
      bindItems();
    }
    function toSvg(e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    var drag = null;
    function bindItems() {
      itemsG.querySelectorAll(".tri-item").forEach(function (g) {
        var id = g.getAttribute("data-id");
        g.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          drag = id;
          try { svg.setPointerCapture(e.pointerId); } catch (x) {}
          T.classList.add("dragging");
        });
        g.addEventListener("keydown", function (e) {
          var step = { ArrowRight: 10, ArrowDown: 10, ArrowLeft: -10, ArrowUp: -10 }[e.key];
          if (!step) return;
          e.preventDefault();
          var p = pos[id], r = range(id, p.wall), np = { wall: p.wall, t: p.t + step };
          // у угла переходим на другую стену
          if (np.t < r[0]) { var ow = p.wall === "top" ? "left" : "top"; np = { wall: ow, t: range(id, ow)[0] }; }
          np.t = Math.min(range(id, np.wall)[1], np.t);
          if (!overlaps(id, np)) { pos[id] = np; render(); itemsG.querySelector('[data-id="' + id + '"]').focus(); }
        });
      });
    }
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var p = toSvg(e), np = nearest(drag, p.x, p.y);
      if (!overlaps(drag, np)) { pos[drag] = np; render(); }
    });
    function end() { if (drag) { drag = null; T.classList.remove("dragging"); } }
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    $(".tri-good", T).addEventListener("click", function () { pos = JSON.parse(JSON.stringify(GOOD)); render(); });
    $(".tri-reset", T).addEventListener("click", function () { pos = JSON.parse(JSON.stringify(START)); T._won = false; render(); });
    window.PRIM_TRI = { pos: function () { return JSON.parse(JSON.stringify(pos)); }, dist: dist };
    render();
  }

  /* =========================================================
     3. Ящик с доводчиком: обычный хлопает, с доводчиком – мягко.
     Звук синтезируется и играет только после нажатия.
     ========================================================= */
  var D = $("#tool-drawer");
  if (D) {
    var soundOn = false, ctx = null;
    var sBtn = $(".dr-sound", D);
    sBtn.addEventListener("click", function () {
      soundOn = !soundOn;
      sBtn.setAttribute("aria-pressed", soundOn);
      sBtn.textContent = soundOn ? "🔊 Звук включён" : "🔈 Включить звук";
    });
    function sound(kind) {
      if (!soundOn) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        var t = ctx.currentTime, len = kind === "slam" ? 0.25 : 0.12;
        var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === "slam" ? 3 : 6);
        var src = ctx.createBufferSource(); src.buffer = buf;
        var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = kind === "slam" ? 900 : 2500;
        var g = ctx.createGain(); g.gain.setValueAtTime(kind === "slam" ? 0.9 : 0.12, t);
        src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t);
        if (kind === "slam") { // звон посуды
          [1800, 2600].forEach(function (fr, k) {
            var o = ctx.createOscillator(), og = ctx.createGain();
            o.frequency.value = fr; og.gain.setValueAtTime(0.05, t + 0.03 + k * 0.04); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            o.connect(og); og.connect(ctx.destination); o.start(t + 0.03 + k * 0.04); o.stop(t + 0.55);
          });
        }
      } catch (e) {}
    }
    var counts = { slam: 0, soft: 0 };
    D.querySelectorAll(".dr").forEach(function (box) {
      var kind = box.getAttribute("data-kind"), btn = $(".dr-btn", box), drawer = $(".dr-drawer", box), timer = null;
      function toggle() {
        if (box.classList.contains("busy")) return;
        var open = box.classList.toggle("open");
        btn.textContent = open ? "Закрыть" : "Открыть";
        btn.setAttribute("aria-label", (open ? "Закрыть " : "Открыть ") + (kind === "slam" ? "обычный ящик" : "ящик с доводчиком"));
        if (!open) {
          box.classList.add("busy");
          clearTimeout(timer);
          var ms = kind === "slam" ? 260 : 1100;
          timer = setTimeout(function () {
            box.classList.remove("busy");
            box.classList.add("hit"); setTimeout(function () { box.classList.remove("hit"); }, 450);
            sound(kind);
            counts[kind]++;
            $(".dr-said", box).textContent = kind === "slam" ? "БАХ!" : "тсс…";
          }, ms);
        } else $(".dr-said", box).textContent = "";
      }
      btn.addEventListener("click", toggle);
      drawer.addEventListener("click", toggle);
    });
    window.PRIM_DRAWER = { counts: function () { return Object.assign({}, counts); } };
  }
})();
