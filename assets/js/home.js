/* UrbanBike Hub: home page (featured-bike carousel, style counts, more bikes). */
(function () {
  "use strict";

  var UBH = window.UBH;
  var ui = UBH.ui;
  var data = UBH.data;

  // Prices and counts come from the catalog data, so the page never disagrees with it.
  document.querySelectorAll("[data-price-for]").forEach(function (el) {
    var bike = ui.byId[el.getAttribute("data-price-for")];
    if (bike) el.innerHTML = '<span class="price">' + ui.formatPrice(bike.price) + '</span> <span class="badge badge-on-dark">Demo price</span>';
  });
  document.querySelectorAll("[data-style-count]").forEach(function (el) {
    var id = el.getAttribute("data-style-count");
    var n = data.bikes.filter(function (bike) { return bike.style === id; }).length;
    el.textContent = ui.plural(n, "bike", "bikes");
  });

  var more = document.getElementById("more-bikes");
  if (more) {
    more.innerHTML = data.bikes
      .filter(function (bike) { return !bike.hero; })
      .map(function (bike) { return ui.bikeCard(bike, { headingLevel: 3 }); })
      .join("");
  }

  /* Carousel ------------------------------------------------------------------------------------
   * The slides sit in a horizontal scroll-snap strip, so touch swiping and trackpads work natively.
   * The buttons and the arrow keys move it; slides that aren't showing are made inert so keyboard
   * and screen-reader users only meet the current one. It never moves on its own. */
  function initCarousel(root) {
    var track = root.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-carousel-to]"));
    var current = 0;
    var settleTimer = null;

    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        var on = i === index;
        if (on) slide.removeAttribute("inert"); else slide.setAttribute("inert", "");
        slide.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dots.forEach(function (dot, i) { dot.setAttribute("aria-current", i === index ? "true" : "false"); });
    }

    function goTo(index, instant) {
      var n = slides.length;
      index = ((index % n) + n) % n;
      show(index);
      track.scrollTo({ left: slides[index].offsetLeft, behavior: instant || ui.reduceMotion() ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () { goTo(current - 1); });
    next.addEventListener("click", function () { goTo(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () { goTo(Number(dot.getAttribute("data-carousel-to"))); });
    });

    // Arrow keys, Home and End while the controls have focus.
    root.querySelector("[data-carousel-controls]").addEventListener("keydown", function (event) {
      var target = null;
      if (event.key === "ArrowLeft") target = current - 1;
      else if (event.key === "ArrowRight") target = current + 1;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = slides.length - 1;
      if (target === null) return;
      event.preventDefault();
      goTo(target);
      var dot = dots[((target % slides.length) + slides.length) % slides.length];
      if (event.target.hasAttribute("data-carousel-to") && dot) dot.focus();
    });

    // After a swipe or trackpad scroll settles, work out which slide is showing.
    track.addEventListener("scroll", function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        var index = Math.round(track.scrollLeft / track.clientWidth);
        index = Math.max(0, Math.min(slides.length - 1, index));
        if (index !== current) show(index);
      }, 90);
    }, { passive: true });

    // Keep the current slide in place when the window is resized or rotated.
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { goTo(current, true); }, 120);
    });

    root.classList.add("is-ready");
    show(0);
  }

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) initCarousel(carousel);
})();
