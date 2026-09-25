/* UrbanBike Hub: shared helpers and page chrome (cart count, "Add to cart" buttons, notices). */
(function () {
  "use strict";

  var UBH = window.UBH;
  var data = UBH.data;
  var cart = UBH.cart;

  var byId = {};
  data.bikes.forEach(function (bike) { byId[bike.id] = bike; });
  var styleById = {};
  data.styles.forEach(function (style) { styleById[style.id] = style; });

  // Line icons drawn for this project on a 24 x 24 grid; they take the text colour.
  var ICONS = {
    cart: '<path d="M3 4h2.2l2.3 10.4a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.5-1.1L21 8H6.3"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.1a1.6 1.6 0 0 0 1.6 1.4h6a1.6 1.6 0 0 0 1.6-1.4L17.5 7M10.2 11v6M13.8 11v6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/>',
    alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5M12 17.2v.2"/>'
  };

  function icon(name, extraClass) {
    return '<svg class="icon' + (extraClass ? " " + extraClass : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      ICONS[name] + "</svg>";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  function formatPrice(amount) {
    return data.currency + numberFormat.format(amount);
  }

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many);
  }

  function bikeUrl(bike) {
    return "bike.html?id=" + encodeURIComponent(bike.id);
  }

  function catalogUrl(styleId) {
    return "bikes.html" + (styleId ? "?style=" + encodeURIComponent(styleId) : "");
  }

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function bikeImage(bike, extraClass, sizes) {
    return '<img class="bike-img ' + (bike.image.fit === "cover" ? "is-photo" : "is-cutout") + (extraClass ? " " + extraClass : "") +
      '" src="' + escapeHTML(bike.image.src) + '" width="' + bike.image.width + '" height="' + bike.image.height +
      '" alt="' + escapeHTML(bike.alt) + '" loading="lazy" decoding="async"' + (sizes ? ' sizes="' + sizes + '"' : "") + ">";
  }

  function priceTag(bike, extraClass) {
    return '<p class="price-row' + (extraClass ? " " + extraClass : "") + '"><span class="price">' + formatPrice(bike.price) +
      '</span> <span class="badge">Demo price</span></p>';
  }

  // One catalog card. The photo links to the details page but is skipped by keyboard and screen
  // readers, which get the "View details" link instead.
  function bikeCard(bike, options) {
    options = options || {};
    var level = options.headingLevel || 2;
    var style = styleById[bike.style];
    var url = bikeUrl(bike);
    return '<article class="bike-card">' +
      '<a class="bike-card-media" href="' + url + '" tabindex="-1" aria-hidden="true">' + bikeImage(bike).replace(/ alt="[^"]*"/, ' alt=""') + "</a>" +
      '<div class="bike-card-body">' +
        '<p class="card-style">' + escapeHTML(style.name) + "</p>" +
        "<h" + level + ' class="card-title">' + escapeHTML(bike.name) + "</h" + level + ">" +
        '<p class="card-summary">' + escapeHTML(bike.summary) + "</p>" +
        priceTag(bike) +
        '<div class="card-actions">' +
          '<a class="btn btn-outline" href="' + url + '">View details<span class="visually-hidden"> of the ' + escapeHTML(bike.name) + "</span></a>" +
          '<button class="btn btn-dark" type="button" data-add-to-cart="' + bike.id + '">' + icon("plus") +
            '<span class="btn-label">Add to cart</span><span class="visually-hidden"> the ' + escapeHTML(bike.name) + "</span></button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* Cart count in the header ------------------------------------------------------------------ */
  function updateCartCount() {
    var n = cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = String(n); });
    document.querySelectorAll("[data-cart-count-text]").forEach(function (el) {
      el.textContent = n === 0 ? ", empty" : ", " + plural(n, "bike", "bikes");
    });
    document.querySelectorAll(".cart-link").forEach(function (el) { el.classList.toggle("has-items", n > 0); });
  }

  /* Short notices at the bottom of the screen ---------------------------------------------------- */
  // The live region exists from the start (empty), so screen readers announce what's put in it later.
  var toastRegion = document.createElement("div");
  toastRegion.className = "toast-region";
  toastRegion.setAttribute("role", "status");
  toastRegion.setAttribute("aria-live", "polite");
  document.body.appendChild(toastRegion);
  var toastTimer = null;
  function toast(message, link) {
    var html = '<div class="toast">' + icon("check", "toast-icon") + '<p class="toast-text">' + escapeHTML(message) + "</p>";
    if (link) html += '<a class="toast-link" href="' + link.href + '">' + escapeHTML(link.text) + "</a>";
    html += '<button class="toast-close" type="button" aria-label="Dismiss">' + icon("close") + "</button></div>";
    toastRegion.innerHTML = html;
    var node = toastRegion.firstChild;
    node.querySelector(".toast-close").addEventListener("click", function () { hide(); });
    requestAnimationFrame(function () { node.classList.add("is-visible"); });

    function hide() {
      if (!node.parentNode) return;
      node.classList.remove("is-visible");
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, reduceMotion() ? 0 : 200);
    }
    // Stay while the pointer or focus is on it, so the link can still be used.
    var paused = false;
    node.addEventListener("mouseenter", function () { paused = true; });
    node.addEventListener("mouseleave", function () { paused = false; });
    node.addEventListener("focusin", function () { paused = true; });
    node.addEventListener("focusout", function () { paused = false; });
    clearTimeout(toastTimer);
    (function wait() {
      toastTimer = setTimeout(function () { if (paused) wait(); else hide(); }, 5000);
    })();
  }

  var storageWarning = "This browser isn't saving your cart, so it will be empty when you leave this page.";

  function addToCart(id, qty, button) {
    var bike = byId[id];
    if (!bike) return;
    var result = cart.add(id, qty);
    var message;
    if (result.added === 0) {
      message = "You already have " + cart.MAX + " of the " + bike.name + " in your cart, the most this demo allows.";
    } else if (result.qty === cart.MAX && result.added < qty) {
      message = "Added " + result.added + " more. You now have " + cart.MAX + " of the " + bike.name + ", the most this demo allows.";
    } else {
      message = (result.added === 1 ? "Added the " : "Added " + result.added + " of the ") + bike.name + " to your cart.";
    }
    if (!cart.storageOk()) message += " " + storageWarning;
    toast(message, { href: "cart.html", text: "View cart" });

    if (button && result.added > 0) {
      var label = button.querySelector(".btn-label");
      if (label) {
        clearTimeout(button._ubhTimer);
        if (!button._ubhText) button._ubhText = label.textContent;
        label.textContent = "Added";
        button.classList.add("is-added");
        button._ubhTimer = setTimeout(function () {
          label.textContent = button._ubhText;
          button.classList.remove("is-added");
        }, 1600);
      }
    }
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-add-to-cart]");
    if (!button) return;
    var qty = 1;
    var from = button.getAttribute("data-qty-from");
    if (from) {
      var field = document.getElementById(from);
      qty = field ? parseInt(field.value, 10) || 1 : 1;
    }
    addToCart(button.getAttribute("data-add-to-cart"), qty, button);
  });

  /* Page chrome --------------------------------------------------------------------------------- */
  function markCurrentNav() {
    var page = document.body.getAttribute("data-page");
    var section = document.body.getAttribute("data-section");
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var nav = link.getAttribute("data-nav");
      if (nav === page) link.setAttribute("aria-current", "page");
      else if (nav === section) link.setAttribute("aria-current", "true");   // e.g. "Bikes" on a bike's page
    });
  }

  // Counts written in the page ("7 bikes in 4 styles") come from the catalog data.
  function fillTotals() {
    document.querySelectorAll("[data-bike-total]").forEach(function (el) { el.textContent = String(data.bikes.length); });
    document.querySelectorAll("[data-style-total]").forEach(function (el) { el.textContent = String(data.styles.length); });
  }

  UBH.ui = {
    byId: byId,
    styleById: styleById,
    icon: icon,
    escapeHTML: escapeHTML,
    formatPrice: formatPrice,
    plural: plural,
    bikeUrl: bikeUrl,
    catalogUrl: catalogUrl,
    reduceMotion: reduceMotion,
    bikeImage: bikeImage,
    priceTag: priceTag,
    bikeCard: bikeCard,
    toast: toast,
    storageWarning: storageWarning,
    updateCartCount: updateCartCount
  };

  markCurrentNav();
  fillTotals();
  updateCartCount();
  cart.subscribe(updateCartCount);
})();
