/* Конструктор «Соберите свою кухню»: перекрашивает встроенную SVG-кухню
   через CSS-переменные и передаёт выбор в квиз расчёта. */
(function () {
  "use strict";
  var box = document.getElementById("cfg");
  if (!box) return;
  var art = box.querySelector(".cfg-art");

  var FRONTS = [
    { id: "white", n: "Белый", c: "#FBFBF9" },
    { id: "cashmere", n: "Кашемир", c: "#E4DBCF" },
    { id: "sage", n: "Шалфей", c: "#A9B8A0" },
    { id: "olive", n: "Олива", c: "#7E8663" },
    { id: "blue", n: "Глубокий синий", c: "#3F5266" },
    { id: "graphite", n: "Графит", c: "#454B51" },
    { id: "terra", n: "Терракота", c: "#B8775A" },
    { id: "oak", n: "Дуб", c: "#C9A27A", wood: 1 },
    { id: "walnut", n: "Орех", c: "#8A6446", wood: 1 }
  ];
  var GROUPS = {
    low: { title: "Фасады – нижний ряд", items: FRONTS },
    up: { title: "Фасады – верхний ряд", items: [{ id: "same", n: "Как нижний", c: "linear-gradient(135deg,#FBFBF9 50%,#454B51 50%)" }].concat(FRONTS) },
    top: { title: "Столешница", items: [
      { id: "oak", n: "Дуб", c: "#C9A27A", wood: 1 }, { id: "walnut", n: "Орех", c: "#8A6446", wood: 1 },
      { id: "stone", n: "Белый камень", c: "#ECEBE6" }, { id: "concrete", n: "Бетон", c: "#B9BBB6" },
      { id: "dark", n: "Тёмный камень", c: "#3C4146" }] },
    h: { title: "Ручки", items: [
      { id: "bar-black", n: "Чёрная скоба", c: "#2B2F33", kind: "bar" }, { id: "bar-brass", n: "Латунная скоба", c: "#B8954A", kind: "bar" },
      { id: "bar-chrome", n: "Хромированная скоба", c: "#A9AEB2", kind: "bar" }, { id: "knob-brass", n: "Латунные кнопки", c: "#B8954A", kind: "knob" },
      { id: "knob-black", n: "Чёрные кнопки", c: "#2B2F33", kind: "knob" }, { id: "gola", n: "Профиль Gola, без ручек", c: "#3A3F44", kind: "profile" }] },
    bs: { title: "Фартук", items: [
      { id: "white", n: "Белая плитка", c: "#F7F7F4" }, { id: "grey", n: "Серая плитка", c: "#D9DCD6" },
      { id: "green", n: "Зелёная плитка", c: "#CFDDB0" }, { id: "terra", n: "Терракотовая плитка", c: "#D9A58A" },
      { id: "dark", n: "Графитовая плитка", c: "#5B6168" }] },
    wall: { title: "Стены", items: [
      { id: "light", n: "Светлые", c: "#ECEEE9" }, { id: "warm", n: "Тёплые", c: "#EFE7DC" },
      { id: "green", n: "Серо-зелёные", c: "#DDE3D6" }, { id: "dark", n: "Тёмные", c: "#59606A" }] }
  };
  var ORDER = ["low", "up", "top", "h", "bs", "wall"];
  var PRESETS = [
    { n: "Скандинавская", s: { low: "white", up: "same", top: "oak", h: "bar-black", bs: "white", wall: "light" } },
    { n: "Природа", s: { low: "sage", up: "white", top: "oak", h: "bar-brass", bs: "white", wall: "warm" } },
    { n: "Тёплая классика", s: { low: "cashmere", up: "same", top: "walnut", h: "knob-brass", bs: "terra", wall: "warm" } },
    { n: "Строгая", s: { low: "graphite", up: "oak", top: "concrete", h: "gola", bs: "grey", wall: "light" } },
    { n: "Глубокий синий", s: { low: "blue", up: "white", top: "stone", h: "bar-brass", bs: "white", wall: "light" } }
  ];
  var state = Object.assign({}, PRESETS[1].s);

  function find(g, id) { var it = GROUPS[g].items; for (var k = 0; k < it.length; k++) if (it[k].id === id) return it[k]; return it[0]; }

  function apply() {
    var low = find("low", state.low), up = state.up === "same" ? low : find("up", state.up), top = find("top", state.top), h = find("h", state.h);
    var st = art.style;
    st.setProperty("--cf-low", low.c); st.setProperty("--cf-low-wood", low.wood ? 1 : 0);
    st.setProperty("--cf-up", up.c); st.setProperty("--cf-up-wood", up.wood ? 1 : 0);
    st.setProperty("--cf-top", top.c); st.setProperty("--cf-top-wood", top.wood ? 1 : 0);
    st.setProperty("--cf-h", h.c);
    st.setProperty("--cf-bs", find("bs", state.bs).c);
    st.setProperty("--cf-wall", find("wall", state.wall).c);
    art.setAttribute("data-h", h.kind);
    box.querySelectorAll(".sw").forEach(function (b) { b.setAttribute("aria-pressed", state[b.getAttribute("data-g")] === b.getAttribute("data-id")); });
    ORDER.forEach(function (g) { var el = box.querySelector('[data-cur="' + g + '"]'); if (el) el.textContent = find(g, state[g]).n; });
    box.querySelectorAll(".cfg-preset").forEach(function (b) {
      var p = PRESETS[+b.getAttribute("data-p")].s, same = ORDER.every(function (g) { return p[g] === state[g]; });
      b.setAttribute("aria-pressed", same);
    });
    var sum = box.querySelector(".cfg-sum");
    if (sum) sum.textContent = describe();
  }
  function describe() {
    var low = find("low", state.low).n, up = state.up === "same" ? low : find("up", state.up).n;
    return "фасады " + (low === up ? low.toLowerCase() : "низ – " + low.toLowerCase() + ", верх – " + up.toLowerCase()) +
      "; столешница – " + find("top", state.top).n.toLowerCase() + "; ручки – " + find("h", state.h).n.toLowerCase() +
      "; фартук – " + find("bs", state.bs).n.toLowerCase();
  }

  /* ---------- разметка управления ---------- */
  var ctrl = box.querySelector(".cfg-ctrl");
  var html = '<div class="cfg-presets" role="group" aria-label="Готовые стили">' + PRESETS.map(function (p, k) {
    return '<button type="button" class="chip cfg-preset" data-p="' + k + '" aria-pressed="false">' + p.n + "</button>";
  }).join("") + '<button type="button" class="chip cfg-random">🎲 Удиви меня</button></div>';
  ORDER.forEach(function (g) {
    html += '<div class="cfg-group"><div class="cfg-label">' + GROUPS[g].title + ': <b data-cur="' + g + '"></b></div><div class="cfg-sws" role="group" aria-label="' + GROUPS[g].title + '">' +
      GROUPS[g].items.map(function (it) {
        var bg = it.c.indexOf("gradient") > -1 ? "background:" + it.c : "background-color:" + it.c;
        var cls = "sw" + (it.wood ? " wood" : "") + (it.kind ? " h-" + it.kind : "");
        return '<button type="button" class="' + cls + '" data-g="' + g + '" data-id="' + it.id + '" style="' + bg + '" title="' + it.n + '" aria-label="' + it.n + '" aria-pressed="false"></button>';
      }).join("") + "</div></div>";
  });
  ctrl.innerHTML = html;

  ctrl.addEventListener("click", function (e) {
    var sw = e.target.closest(".sw"), pr = e.target.closest(".cfg-preset"), rnd = e.target.closest(".cfg-random");
    if (sw) state[sw.getAttribute("data-g")] = sw.getAttribute("data-id");
    else if (pr) state = Object.assign({}, PRESETS[+pr.getAttribute("data-p")].s);
    else if (rnd) {
      var prev = JSON.stringify(state);
      for (var guard = 0; guard < 10 && JSON.stringify(state) === prev; guard++) {
        ORDER.forEach(function (g) { var it = GROUPS[g].items; state[g] = it[Math.floor(Math.random() * it.length)].id; });
        // тёмные стены – только к светлому низу, чтобы кухня не терялась
        if (state.wall === "dark" && ["blue", "graphite", "walnut", "olive"].indexOf(state.low) > -1) state.wall = "light";
      }
    } else return;
    apply();
  });

  box.querySelector(".cfg-want").addEventListener("click", function () {
    var txt = describe();
    try { if (window.SITE && window.SITE.metrikaId && window.ym) window.ym(window.SITE.metrikaId, "reachGoal", "config_want"); } catch (x) {}
    if (window.PRIM_QUIZ && window.PRIM_QUIZ.open) window.PRIM_QUIZ.open({ product: "kitchen", colors: txt });
  });

  window.PRIM_CFG = { state: function () { return Object.assign({}, state); }, describe: describe };
  apply();
})();
