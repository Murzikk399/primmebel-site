/* «Анатомия кухни»: цифры на картинке ↔ пункты списка */
(function () {
  "use strict";
  var wrap = document.querySelector(".anat");
  if (!wrap) return;
  var dots = wrap.querySelectorAll(".an-dot"), items = wrap.querySelectorAll(".an-list li");
  function show(n, scroll) {
    dots.forEach(function (d) { d.setAttribute("aria-pressed", d.getAttribute("data-n") === n); });
    items.forEach(function (li) { li.classList.toggle("on", li.getAttribute("data-n") === n); });
    var li = wrap.querySelector('.an-list li[data-n="' + n + '"]');
    // на узком экране список под картинкой – прокручиваем к пояснению
    if (scroll && li && window.matchMedia("(max-width: 900px)").matches) li.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  dots.forEach(function (d) {
    d.addEventListener("click", function () { show(d.getAttribute("data-n"), true); });
    d.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) show(d.getAttribute("data-n"), false); });
  });
  items.forEach(function (li) {
    li.addEventListener("mouseenter", function () { show(li.getAttribute("data-n"), false); });
    li.addEventListener("click", function (e) { if (e.target.tagName !== "A") show(li.getAttribute("data-n"), false); });
  });
  show("1", false);
})();
