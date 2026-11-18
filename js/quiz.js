/* Квиз «Рассчитать стоимость».
   Ветки: кухня, шкаф, офис. Цены берутся из SITE.prices (config.js).
   Если цены не заполнены, цифры не показываются. */
(function () {
  "use strict";
  var S = window.SITE || {};
  var P = S.prices || {};
  var root = document.getElementById("quiz");

  function goal(n) { try { if (S.metrikaId && window.ym) window.ym(S.metrikaId, "reachGoal", n); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- справочники ---------- */
  var L = {
    product: { kitchen: "Кухня", wardrobe: "Шкаф или гардеробная", office: "Офисная мебель" },
    shape: { straight: "Прямая", corner: "Угловая", u: "П\u2011образная", island: "С островом" },
    facade: { ldsp: "ЛДСП", mdf_film: "МДФ в плёнке", mdf_enamel: "МДФ в эмали", plastic: "Пластик или акрил", mirror: "Зеркало и ЛДСП" },
    worktop: { ldsp: "ЛДСП 38 мм", hpl: "Компакт-плита HPL", acryl: "Искусственный камень", quartz: "Кварцевый агломерат", unknown: "Пока не знаю" },
    tech: { built: "Вся встроенная", part: "Частично встроенная", free: "Отдельностоящая", unknown: "Пока не знаю" },
    wtype: { kupe: "Шкаф-купе", swing: "Распашной шкаф", walkin: "Гардеробная" },
    items: { desks: "Рабочие столы", pedestals: "Тумбы", docs: "Шкафы для документов", reception: "Ресепшен", staffkitchen: "Кухня для сотрудников" },
    when: { now: "Ремонт уже идёт", month: "В течение месяца", later: "Через 2–3 месяца", look: "Пока прицениваюсь" }
  };

  var SHAPE_ICONS = {
    straight: '<path d="M6 30h52" stroke-width="7"/>',
    corner: '<path d="M8 8v24h48" stroke-width="7" fill="none"/>',
    u: '<path d="M8 8v24h48V8" stroke-width="7" fill="none"/>',
    island: '<path d="M6 10h52" stroke-width="7"/><rect x="20" y="24" width="24" height="8" rx="1" fill="currentColor" stroke="none"/>'
  };

  function shapeOpt(k) {
    return { v: k, t: L.shape[k], icon: '<svg viewBox="0 0 64 40" stroke="currentColor" stroke-linecap="square">' + SHAPE_ICONS[k] + "</svg>" };
  }
  function opts(dict, keys) { return keys.map(function (k) { return { v: k, t: dict[k] }; }); }

  var STEPS = {
    product: { q: "Что нужно сделать?", type: "single", key: "product", options: opts(L.product, ["kitchen", "wardrobe", "office"]) },
    shape: { q: "Какой формы будет кухня?", type: "single", key: "shape", options: ["straight", "corner", "u", "island"].map(shapeOpt), icons: true },
    length: { q: "Какая длина кухни по стенам?", hint: "Сложите длину всех сторон, где будут шкафы. Не знаете точно – укажите примерно, уточним на замере.", type: "range", key: "length", min: 1.2, max: 10, step: 0.1, def: 3, unit: "м" },
    facade: { q: "Из чего фасады?", hint: "Не уверены – выберите ЛДСП, на замере покажем образцы.", type: "single", key: "facade", options: opts(L.facade, ["ldsp", "mdf_film", "mdf_enamel", "plastic"]), link: "sovety/vybor-materialov.html" },
    worktop: { q: "Какая столешница?", type: "single", key: "worktop", options: opts(L.worktop, ["ldsp", "hpl", "acryl", "quartz", "unknown"]) },
    tech: { q: "Какая будет техника?", type: "single", key: "tech", options: opts(L.tech, ["built", "part", "free", "unknown"]) },
    wtype: { q: "Что именно нужно?", type: "single", key: "wtype", options: opts(L.wtype, ["kupe", "swing", "walkin"]) },
    width: { q: "Какой ширины шкаф?", hint: "Для гардеробной – общая длина стен с полками и штангами.", type: "range", key: "width", min: 0.8, max: 8, step: 0.1, def: 2.4, unit: "м" },
    wfacade: { q: "Из чего фасады?", type: "single", key: "facade", options: opts(L.facade, ["ldsp", "mdf_film", "mdf_enamel", "mirror"]) },
    items: { q: "Что нужно для офиса?", hint: "Можно выбрать несколько.", type: "multi", key: "items", options: opts(L.items, ["desks", "pedestals", "docs", "reception", "staffkitchen"]) },
    seats: { q: "Сколько рабочих мест?", type: "range", key: "seats", min: 1, max: 40, step: 1, def: 4, unit: "" },
    when: { q: "Когда нужна мебель?", type: "single", key: "when", options: opts(L.when, ["now", "month", "later", "look"]) }
  };
  var FLOW = {
    kitchen: ["product", "shape", "length", "facade", "worktop", "tech", "when"],
    wardrobe: ["product", "wtype", "width", "wfacade", "when"],
    office: ["product", "items", "seats", "when"]
  };

  /* ---------- расчёт ---------- */
  function roundK(x) { return Math.round(x / 1000) * 1000; }
  function money(x) { return x.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽"; }
  function estimate(a) {
    var spread = P.spread || 0.15, base = 0;
    if (a.product === "kitchen") {
      var r = (P.kitchen || {})[a.facade || "ldsp"];
      if (!r) return null;
      var len = +a.length || 3;
      var w = (P.worktop || {})[a.worktop && a.worktop !== "unknown" ? a.worktop : "ldsp"] || 0;
      base = r * len * ((P.kitchenShape || {})[a.shape || "straight"] || 1) + w * len;
    } else if (a.product === "wardrobe") {
      var rw = (P.wardrobe || {})[a.facade || "ldsp"];
      if (!rw) return null;
      base = rw * (+a.width || 2.4) * ((P.wardrobeType || {})[a.wtype || "kupe"] || 1);
    } else return null;
    if (!(base > 0)) return null;
    return { from: roundK(base * (1 - spread)), to: roundK(base * (1 + spread)) };
  }
  window.PRIM_QUIZ = { estimate: estimate, money: money };

  function summary(a) {
    var lines = ["Здравствуйте! Хочу рассчитать стоимость.", "Что: " + L.product[a.product]];
    if (a.colors) lines.push("Собрал в конструкторе: " + a.colors);
    if (a.product === "kitchen") {
      lines.push("Форма: " + L.shape[a.shape], "Длина: " + (+a.length).toFixed(1).replace(".", ",") + " м",
        "Фасады: " + L.facade[a.facade], "Столешница: " + L.worktop[a.worktop], "Техника: " + L.tech[a.tech]);
    } else if (a.product === "wardrobe") {
      lines.push("Тип: " + L.wtype[a.wtype], "Ширина: " + (+a.width).toFixed(1).replace(".", ",") + " м", "Фасады: " + L.facade[a.facade]);
    } else {
      lines.push("Нужно: " + (a.items || []).map(function (k) { return L.items[k]; }).join(", "), "Рабочих мест: " + a.seats);
    }
    lines.push("Сроки: " + L.when[a.when]);
    var e = estimate(a);
    if (e) lines.push("Ориентир с сайта: " + money(e.from) + " – " + money(e.to));
    return lines;
  }

  /* ---------- состояние ---------- */
  var A = {}, flow = FLOW.kitchen, i = 0, started = false;

  function setAnswer(key, val) {
    A[key] = val;
    if (key === "product") flow = FLOW[val];
  }
  function firstUnanswered() {
    for (var k = 0; k < flow.length; k++) {
      var st = STEPS[flow[k]];
      if (A[st.key] == null || (st.type === "multi" && !(A[st.key] || []).length)) return k;
    }
    return flow.length; // всё отвечено – сразу результат
  }

  /* ---------- отрисовка ---------- */
  function render() {
    if (!root) return;
    if (i >= flow.length) return renderResult();
    var st = STEPS[flow[i]];
    var pct = Math.round(i / flow.length * 100);
    var h = '<div class="quiz-top"><span>Шаг ' + (i + 1) + " из " + flow.length + '</span><span>' + pct + ' %</span></div>' +
      '<div class="quiz-bar"><i style="width:' + pct + '%"></i></div>' +
      '<h3 class="quiz-q" tabindex="-1">' + st.q + "</h3>" + (st.hint ? '<p class="quiz-hint">' + st.hint + "</p>" : "");
    if (st.type === "single" || st.type === "multi") {
      var cur = A[st.key];
      h += '<div class="quiz-opts' + (st.icons ? " icons" : "") + '">' + st.options.map(function (o) {
        var on = st.type === "multi" ? (cur || []).indexOf(o.v) > -1 : cur === o.v;
        return '<button type="button" class="quiz-opt" data-v="' + o.v + '" aria-pressed="' + on + '">' + (o.icon || "") + "<span>" + o.t + "</span></button>";
      }).join("") + "</div>";
      if (st.link) h += '<p class="quiz-hint"><a href="' + st.link + '" target="_blank" rel="noopener">Чем отличаются материалы →</a></p>';
    } else {
      var v = A[st.key] != null ? A[st.key] : st.def;
      h += '<div class="quiz-range"><input type="range" min="' + st.min + '" max="' + st.max + '" step="' + st.step + '" value="' + v + '" aria-label="' + st.q + '">' +
        '<label><input type="number" inputmode="decimal" min="' + st.min + '" max="' + st.max + '" step="' + st.step + '" value="' + v + '"> ' + st.unit + "</label></div>";
    }
    var needNext = st.type !== "single";
    h += '<div class="quiz-nav">' + (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm quiz-back">← Назад</button>' : "<span></span>") +
      (needNext ? '<button type="button" class="btn btn-primary btn-sm quiz-next"' + (st.type === "multi" && !(A[st.key] || []).length ? " disabled" : "") + ">Дальше →</button>" : "") + "</div>";
    root.innerHTML = h;
    bind(st);
  }

  function bind(st) {
    var back = root.querySelector(".quiz-back");
    if (back) back.onclick = function () { i--; render(); focusQ(); };
    root.querySelectorAll(".quiz-opt").forEach(function (b) {
      b.onclick = function () {
        if (!started) { started = true; goal("quiz_start"); }
        var v = b.getAttribute("data-v");
        if (st.type === "multi") {
          var arr = (A[st.key] || []).slice(), p = arr.indexOf(v);
          if (p > -1) arr.splice(p, 1); else arr.push(v);
          A[st.key] = arr;
          b.setAttribute("aria-pressed", p === -1);
          root.querySelector(".quiz-next").disabled = !arr.length;
        } else {
          var changedProduct = st.key === "product" && A.product && A.product !== v;
          if (changedProduct) A = {};
          setAnswer(st.key, v);
          i++; render(); focusQ();
        }
      };
    });
    var range = root.querySelector('input[type="range"]'), num = root.querySelector('input[type="number"]');
    if (range) {
      range.oninput = function () { num.value = range.value; };
      num.oninput = function () { if (num.value !== "" && !isNaN(+num.value)) range.value = num.value; };
    }
    var next = root.querySelector(".quiz-next");
    if (next) next.onclick = function () {
      if (st.type === "range") {
        var val = parseFloat(String(num.value).replace(",", "."));
        if (isNaN(val)) val = st.def;
        val = Math.min(st.max, Math.max(st.min, val));
        A[st.key] = st.step < 1 ? Math.round(val * 10) / 10 : Math.round(val);
      }
      i++; render(); focusQ();
    };
  }
  function focusQ() { var q = root.querySelector(".quiz-q"); if (q) q.focus({ preventScroll: true }); }

  function renderResult() {
    var e = estimate(A);
    goal("quiz_done");
    var priceBlock = e ?
      '<p class="quiz-price-label">Ориентировочно, без техники и мойки</p><p class="quiz-price">' + money(e.from) + " – " + money(e.to) + "</p>" +
      '<p class="quiz-hint">Точная цена зависит от фурнитуры, наполнения и размеров. Назовём её после замера – или раньше, по вашим размерам.</p>' :
      '<p class="quiz-price-label">Спасибо, всё понятно!</p><p class="quiz-price small">Пришлём расчёт в мессенджер</p>' +
      '<p class="quiz-hint">' + (A.product === "office" ? "Офисную мебель считаем по списку – оставьте контакты, и мы свяжемся." :
        "Обычно отвечаем в течение рабочего дня. Чтобы цена была точнее, ниже можно указать размеры стен.") + "</p>";
    if (A.colors) priceBlock += '<p class="quiz-colors"><b>Ваша кухня из конструктора:</b> ' + esc(A.colors) + "</p>";
    root.innerHTML =
      '<div class="quiz-bar"><i style="width:100%"></i></div>' + priceBlock +
      '<form class="form quiz-form" novalidate>' +
      '<div class="quiz-two"><label>Имя<input name="name" type="text" autocomplete="name" required></label>' +
      '<label>Телефон<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7" required></label></div>' +
      '<details><summary>Уточнить размеры (необязательно)</summary><label>Длина стен, высота потолка, особенности<textarea name="details" placeholder="Например: стены 3,2 и 2,1 м, потолок 2,7 м, справа окно"></textarea></label>' +
      '<p class="quiz-hint">Фото помещения можно отправить следом в мессенджер.</p></details>' +
      '<label class="agree"><input type="checkbox" name="agree" checked> <span>Согласен на обработку персональных данных по <a href="politika.html">политике конфиденциальности</a></span></label>' +
      '<p class="error" role="alert"></p>' +
      '<button class="btn btn-primary" type="submit">Получить точный расчёт</button></form>' +
      '<div class="quiz-sent" hidden></div>' +
      '<div class="quiz-nav"><button type="button" class="btn btn-ghost btn-sm quiz-back">← Изменить ответы</button><button type="button" class="btn btn-ghost btn-sm quiz-restart">Начать заново</button></div>';
    root.querySelector(".quiz-back").onclick = function () { i = flow.length - 1; render(); focusQ(); };
    root.querySelector(".quiz-restart").onclick = function () { A = {}; flow = FLOW.kitchen; i = 0; render(); focusQ(); };
    var f = root.querySelector(".quiz-form"), err = f.querySelector(".error");
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var d = new FormData(f), name = (d.get("name") || "").trim(), phone = (d.get("phone") || "").trim();
      if (!name || phone.replace(/\D/g, "").length < 10) { err.textContent = "Укажите имя и телефон – иначе не сможем прислать расчёт."; return; }
      if (!d.get("agree")) { err.textContent = "Нужно согласие на обработку данных."; return; }
      err.textContent = "";
      var lines = summary(A);
      lines.push("Имя: " + name, "Телефон: " + phone);
      var det = (d.get("details") || "").trim();
      if (det) lines.push("Размеры: " + det);
      var text = lines.join("\n");
      goal("form_send");
      var sent = root.querySelector(".quiz-sent");
      function show(ok) {
        f.hidden = true; sent.hidden = false;
        sent.innerHTML = ok ? "<b>Заявка принята! Свяжемся в рабочее время.</b>" :
          "<b>Последний шаг – отправьте ответы в удобный мессенджер:</b>" +
          '<div class="messengers" style="margin:.6rem 0">' +
          '<a class="mbtn wa" target="_blank" rel="noopener" data-goal="messenger_click" href="' + S.whatsapp + "?text=" + encodeURIComponent(text) + '">WhatsApp</a>' +
          '<a class="mbtn tg" target="_blank" rel="noopener" data-goal="messenger_click" href="' + S.telegram + '">Telegram</a>' +
          '<a class="mbtn max" target="_blank" rel="noopener" data-goal="messenger_click" href="' + S.max + '">MAX</a></div>' +
          '<p class="quiz-hint">В WhatsApp текст подставится сам. Для Telegram и MAX скопируйте:</p>' +
          '<pre class="quiz-text">' + esc(text) + "</pre>" +
          '<button type="button" class="btn btn-ghost btn-sm quiz-copy">Скопировать текст</button>';
        var c = sent.querySelector(".quiz-copy");
        if (c) c.onclick = function () {
          try { navigator.clipboard.writeText(text).then(function () { c.textContent = "Скопировано ✓"; }, function () { c.textContent = "Выделите текст и скопируйте"; }); }
          catch (e2) { c.textContent = "Выделите текст и скопируйте"; }
        };
      }
      if (S.formEndpoint) {
        fetch(S.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "quiz", answers: A, name: name, phone: phone, details: det, text: text, page: location.href }) })
          .then(function (r) { show(r.ok); }).catch(function () { show(false); });
      } else show(false);
    };
  }

  /* ---------- открытие квиза с предзаполнением ---------- */
  function openQuiz(pre) {
    A = {};
    flow = FLOW.kitchen;
    if (pre) Object.keys(pre).forEach(function (k) { setAnswer(k, pre[k]); });
    i = pre && pre.product ? firstUnanswered() : 0;
    render();
    var sec = document.getElementById("raschet");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(focusQ, 400);
  }
  window.PRIM_QUIZ.open = function (pre) { if (!started) { started = true; goal("quiz_start"); } openQuiz(pre); };
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-quiz]");
    if (!t || !root) return;
    e.preventDefault();
    var pre = null;
    try { pre = JSON.parse(t.getAttribute("data-quiz") || "null"); } catch (x) {}
    if (!started) { started = true; goal("quiz_start"); }
    openQuiz(pre);
  });

  /* ---------- подписи цен под примерами ---------- */
  document.querySelectorAll("[data-estimate]").forEach(function (el) {
    var pre; try { pre = JSON.parse(el.getAttribute("data-estimate")); } catch (x) { return; }
    var e = estimate(pre);
    var size = pre.length || pre.width;
    el.innerHTML = e ? "От " + money(e.from) + (size ? " за " + String(size).replace(".", ",") + " м" : "") + " <u>Рассчитать свою →</u>" : "<u>Узнать цену такого варианта →</u>";
    el.setAttribute("data-quiz", JSON.stringify(pre));
  });

  if (root) render();
})();
