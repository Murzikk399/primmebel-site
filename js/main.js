(function () {
  "use strict";
  var S = window.SITE || {};

  /* ---------- значки ---------- */
  var I = {
    tg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.4 4.2 2.9 11.4c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.4 1.4.1 1.6-.6l3-15.6c.2-.9-.7-1.6-1.6-1.4zM9.6 14.3l-.5 3.6-1.2-3.9 9.6-6.2-7.9 6.5z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5 5 16.2a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9 8.5c0 3.5 2.6 6.5 6.4 6.6l.9-1.6-2-1-1 .8c-1.2-.5-2-1.4-2.5-2.5l.8-1-.9-2.1z" fill="currentColor" stroke="none"/></svg>',
    max: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21a9 9 0 1 0-8.2-5.3L3 21l5.2-.9A9 9 0 0 0 12 21z"/><path d="M8 15V9l4 4 4-4v6"/></svg>',
    ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>',
    cube: '<svg viewBox="0 0 64 64" fill="none" stroke="#A5C33C" stroke-width="3" stroke-linejoin="round" aria-hidden="true"><path d="M32 6 56 19v26L32 58 8 45V19z"/><path d="M8 19l24 13 24-13M32 32v26"/></svg>'
  };

  function goal(name) {
    try { if (S.metrikaId && window.ym) window.ym(S.metrikaId, "reachGoal", name); } catch (e) {}
  }

  /* ---------- Яндекс Метрика (включается номером счётчика в config.js) ---------- */
  if (S.metrikaId) {
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(S.metrikaId, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }

  /* В превью на claude.ai сторонние iframe (Sketchfab, Яндекс Карты)
     запрещены, поэтому там показываем заглушки со ссылками.
     На собственном хостинге всё встраивается как обычно. */
  var framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  var embedsAllowed = !framed && !/claude|anthropic/i.test(location.hostname) && location.protocol !== "file:";
  if (/[?&]embeds=0/.test(location.search)) embedsAllowed = false;

  /* ---------- подстановка контактов из config.js ---------- */
  document.querySelectorAll("[data-phone]").forEach(function (a) { a.textContent = S.phone; a.href = "tel:" + S.phoneHref; });
  document.querySelectorAll("[data-email]").forEach(function (a) { a.textContent = S.email; a.href = "mailto:" + S.email; });
  document.querySelectorAll("[data-link]").forEach(function (a) { var k = a.getAttribute("data-link"); if (S[k]) a.href = S[k]; });
  document.querySelectorAll("[data-text]").forEach(function (el) { var k = el.getAttribute("data-text"); if (S[k]) el.textContent = S[k]; });
  document.querySelectorAll("[data-icon]").forEach(function (el) { var k = el.getAttribute("data-icon"); if (I[k]) el.insertAdjacentHTML("afterbegin", I[k]); });

  /* ---------- меню ---------- */
  var burger = document.querySelector(".burger"), nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
  }

  /* ---------- плавающий виджет мессенджеров ---------- */
  var fab = document.createElement("div");
  fab.className = "fab";
  fab.innerHTML =
    '<div class="fab-list" id="fab-list">' +
      '<a href="' + S.max + '" target="_blank" rel="noopener" data-goal="messenger_click"><i style="background:linear-gradient(135deg,#3E5BFF,#9B3CFF)">' + I.max + '</i>MAX</a>' +
      '<a href="' + S.telegram + '" target="_blank" rel="noopener" data-goal="messenger_click"><i style="background:#1A74A3">' + I.tg + '</i>Telegram</a>' +
      '<a href="' + S.whatsapp + '" target="_blank" rel="noopener" data-goal="messenger_click"><i style="background:#15803D">' + I.wa + '</i>WhatsApp</a>' +
      '<a href="tel:' + S.phoneHref + '" data-goal="phone_click"><i style="background:#2B2F33">' + I.ph + '</i>' + S.phone + '</a>' +
    '</div>' +
    '<button class="fab-toggle" type="button" aria-expanded="false" aria-controls="fab-list" aria-label="Связаться с нами"><span class="fab-pulse"></span>' + I.chat + '</button>';
  document.body.appendChild(fab);
  var fabBtn = fab.querySelector(".fab-toggle");
  fabBtn.addEventListener("click", function () {
    var open = fab.classList.toggle("open");
    fabBtn.setAttribute("aria-expanded", open);
    fabBtn.innerHTML = (open ? "" : '<span class="fab-pulse"></span>') + (open ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' : I.chat);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && fab.classList.contains("open")) fabBtn.click(); });

  /* ---------- цели Метрики ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-goal], a[href^='tel:']");
    if (!a) return;
    goal(a.getAttribute("data-goal") || "phone_click");
  });

  /* ---------- «Наши возможности»: фильтр ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip); });
      document.querySelectorAll(".gallery figure").forEach(function (fig) {
        fig.hidden = !(f === "all" || fig.getAttribute("data-cat") === f);
      });
    });
  });

  /* ---------- 3D-модели Sketchfab ---------- */
  var modelsBox = document.getElementById("models");
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function renderModels(list) {
    if (!modelsBox) return;
    var profile = S.sketchfabUser ? "https://sketchfab.com/" + encodeURIComponent(S.sketchfabUser) + "/models" : "https://sketchfab.com/";
    if (!list.length) {
      // демонстрационные места под модели
      list = [{ title: "Кухня – 3D-проект" }, { title: "Шкаф-купе – 3D-проект" }];
    }
    modelsBox.innerHTML = list.slice(0, S.sketchfabMax || 4).map(function (m) {
      var page = m.uid ? "https://sketchfab.com/3d-models/" + m.uid : profile;
      var frame;
      if (m.uid && embedsAllowed) {
        frame = '<iframe title="' + esc(m.title) + '" loading="lazy" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen ' +
          'src="https://sketchfab.com/models/' + encodeURIComponent(m.uid) + '/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_hint=2&dnt=1"></iframe>';
      } else {
        frame = '<div class="stub"><div>' + I.cube + '<b>' + esc(m.title) + '</b><br><span class="muted">' +
          (m.uid ? "Модель откроется на Sketchfab" : "Здесь появится 3D-модель из аккаунта Sketchfab") + '</span></div></div>';
      }
      return '<div class="model"><div class="frame">' + frame + '</div><div class="cap"><span>' + esc(m.title) +
        '</span><a href="' + page + '" target="_blank" rel="noopener" data-goal="model_view">Открыть в 3D ↗</a></div></div>';
    }).join("");
  }
  if (modelsBox) {
    if (S.sketchfabModels && S.sketchfabModels.length) renderModels(S.sketchfabModels);
    else if (S.sketchfabUser && embedsAllowed && window.fetch) {
      renderModels([]);
      fetch("https://api.sketchfab.com/v3/search?type=models&sort_by=-publishedAt&count=" + (S.sketchfabMax || 4) + "&user=" + encodeURIComponent(S.sketchfabUser))
        .then(function (r) { return r.json(); })
        .then(function (d) { var r = (d && d.results) || []; if (r.length) renderModels(r.map(function (m) { return { uid: m.uid, title: m.name }; })); })
        .catch(function () {});
    } else renderModels([]);
  }

  /* ---------- карта ---------- */
  var map = document.getElementById("map");
  if (map && embedsAllowed) {
    var q = encodeURIComponent("Калининград, улица Рыбников, 91");
    map.insertAdjacentHTML("beforeend", '<iframe title="Производство на карте" loading="lazy" src="https://yandex.ru/map-widget/v1/?text=' + q + '&z=16"></iframe>');
  }

  /* ---------- форма заявки ---------- */
  var form = document.getElementById("lead-form");
  if (form) {
    var result = document.getElementById("form-result");
    var err = form.querySelector(".error");
    // кнопки «Заказать замер» с выбором изделия
    document.querySelectorAll("[data-product]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sel = form.querySelector("[name=product]");
        if (sel) sel.value = b.getAttribute("data-product");
        goal("zamer_click");
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get("name") || "").trim();
      var phone = (d.get("phone") || "").trim();
      var digits = phone.replace(/\D/g, "");
      if (!name || digits.length < 10) { err.textContent = "Укажите имя и телефон – иначе не сможем перезвонить."; return; }
      if (!d.get("agree")) { err.textContent = "Нужно согласие на обработку данных."; return; }
      err.textContent = "";
      var text = "Здравствуйте! Хочу заказать замер.\n" +
        "Имя: " + name + "\nТелефон: " + phone + "\nЧто нужно: " + d.get("product") +
        (d.get("comment") ? "\nКомментарий: " + d.get("comment").trim() : "");
      goal("form_send");

      function showResult(sentToCrm) {
        form.hidden = true;
        result.classList.add("show");
        result.querySelector(".r-title").textContent = sentToCrm ?
          "Спасибо, заявка принята! Перезвоним в рабочее время." :
          "Остался один шаг – отправьте заявку в удобный мессенджер:";
        var wa = result.querySelector(".r-wa");
        wa.href = S.whatsapp + "?text=" + encodeURIComponent(text);
        result.querySelector(".r-text").textContent = text;
        result.querySelector(".r-messengers").hidden = sentToCrm;
      }
      if (S.formEndpoint) {
        fetch(S.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name, phone: phone, product: d.get("product"), comment: d.get("comment"), page: location.href }) })
          .then(function (r) { showResult(r.ok); }).catch(function () { showResult(false); });
      } else showResult(false);
    });
    var copyBtn = document.getElementById("copy-text");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var t = result.querySelector(".r-text").textContent;
      try {
        navigator.clipboard.writeText(t).then(function () { copyBtn.textContent = "Скопировано ✓"; }, function () { copyBtn.textContent = "Выделите текст и скопируйте"; });
      } catch (e2) { copyBtn.textContent = "Выделите текст и скопируйте"; }
    });
  }

  /* ---------- год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
