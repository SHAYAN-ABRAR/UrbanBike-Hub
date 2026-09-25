/* UrbanBike Hub: cart page. Everything here reads and writes the cart saved on this browser. */
(function () {
  "use strict";

  var UBH = window.UBH;
  var ui = UBH.ui;
  var data = UBH.data;
  var cart = UBH.cart;
  var esc = ui.escapeHTML;

  var root = document.getElementById("cart-root");
  var notices = document.getElementById("cart-notices");
  var live = document.getElementById("cart-live");
  var confirmingClear = false;
  var undo = null;   // {kind: "remove", removed} or {kind: "clear", previous}

  var PROBLEM_TEXT = {
    unreadable: function () { return "The cart saved on this browser couldn't be read, so it was reset."; },
    outdated: function () { return "The cart saved on this browser came from an older version of this site, so it was reset."; },
    dropped: function (n) { return (n === 1 ? "One saved bike is" : n + " saved bikes are") + " no longer in the catalog, so " + (n === 1 ? "it was" : "they were") + " removed."; },
    invalid: function (n) { return (n === 1 ? "One saved item was incomplete or had an invalid quantity, so it was" : n + " saved items were incomplete or had invalid quantities, so they were") + " removed."; },
    lowered: function (n) { return (n === 1 ? "One saved quantity was" : n + " saved quantities were") + " over the limit of " + cart.MAX + " and " + (n === 1 ? "was" : "were") + " lowered to " + cart.MAX + "."; }
  };

  function announce(text) {
    live.textContent = "";
    setTimeout(function () { live.textContent = text; }, 30);
  }

  function renderNotices() {
    var html = "";
    if (!cart.storageOk()) {
      html += '<div class="notice notice-warn">' + ui.icon("alert") + "<p>" + esc(ui.storageWarning) +
        " This can happen in a private window or when site data is blocked.</p></div>";
    }
    cart.problems().forEach(function (problem) {
      html += '<div class="notice notice-warn">' + ui.icon("info") + "<p>" + esc(PROBLEM_TEXT[problem.type](problem.count)) + "</p></div>";
    });
    if (undo) {
      var text = undo.kind === "clear" ? "Your cart was emptied." : "Removed the " + ui.byId[undo.removed.id].name + " from your cart.";
      html += '<div class="notice notice-undo">' + ui.icon("check") + "<p>" + esc(text) + '</p><button class="btn btn-small btn-outline" type="button" data-action="undo">Undo</button></div>';
    }
    notices.innerHTML = html;
  }

  function itemRow(item) {
    var bike = ui.byId[item.id];
    var style = ui.styleById[bike.style];
    var url = ui.bikeUrl(bike);
    var atMin = item.qty <= 1;
    var atMax = item.qty >= cart.MAX;
    return '<li class="cart-item" data-id="' + bike.id + '">' +
      '<a class="cart-thumb' + (bike.image.fit === "cover" ? " is-photo" : "") + '" href="' + url + '" tabindex="-1" aria-hidden="true">' +
        ui.bikeImage(bike).replace(/ alt="[^"]*"/, ' alt=""') + "</a>" +
      '<div class="cart-info">' +
        '<h3 class="cart-name"><a href="' + url + '">' + esc(bike.name) + "</a></h3>" +
        '<p class="cart-meta">' + esc(style.name) + " · " + ui.formatPrice(bike.price) + " each</p>" +
      "</div>" +
      '<div class="cart-controls">' +
        '<div class="cart-qty">' +
          '<div class="qty-stepper" role="group" aria-label="Quantity of the ' + esc(bike.name) + '">' +
            '<button type="button" class="qty-btn" data-action="dec" aria-label="One fewer"' + (atMin ? ' aria-disabled="true"' : "") + ">" + ui.icon("minus") + "</button>" +
            '<span class="qty-value">' + item.qty + "</span>" +
            '<button type="button" class="qty-btn" data-action="inc" aria-label="One more"' + (atMax ? ' aria-disabled="true"' : "") + ">" + ui.icon("plus") + "</button>" +
          "</div>" +
          (atMax ? '<p class="qty-hint">Limit of ' + cart.MAX + " per bike</p>" : "") +
        "</div>" +
        '<button type="button" class="icon-btn" data-action="remove" aria-label="Remove the ' + esc(bike.name) + ' from your cart">' + ui.icon("trash") + "</button>" +
        '<p class="cart-line-total"><span class="visually-hidden">Subtotal: </span>' + ui.formatPrice(bike.price * item.qty) + "</p>" +
      "</div>" +
    "</li>";
  }

  function summary(items) {
    var count = cart.count();
    var total = items.reduce(function (sum, item) { return sum + ui.byId[item.id].price * item.qty; }, 0);
    var clearBox = confirmingClear
      ? '<div class="clear-confirm" role="group" aria-labelledby="clear-question"><p id="clear-question">Remove every bike from your cart?</p>' +
          '<div class="clear-actions"><button class="btn btn-small btn-dark" type="button" data-action="clear-confirm">Yes, empty it</button>' +
          '<button class="btn btn-small btn-outline" type="button" data-action="clear-cancel">Keep them</button></div></div>'
      : '<button class="btn-text" type="button" data-action="clear">' + ui.icon("trash") + "Empty cart</button>";
    return '<aside class="cart-summary" aria-labelledby="summary-title">' +
      '<h2 class="summary-title" id="summary-title">Summary</h2>' +
      '<dl class="summary-list"><div><dt>Bikes</dt><dd>' + count + "</dd></div>" +
      '<div class="summary-total"><dt>Demo total</dt><dd>' + ui.formatPrice(total) + "</dd></div></dl>" +
      '<p class="summary-note">These are demo prices. There’s no checkout, and this site doesn’t take orders or payments.</p>' +
      '<a class="btn btn-dark btn-block" href="bikes.html">Browse more bikes</a>' +
      '<div class="clear-box">' + clearBox + "</div>" +
    "</aside>";
  }

  function emptyState() {
    var picks = data.bikes.filter(function (bike) { return bike.hero; }).slice(0, 3);
    return '<div class="empty-state" id="cart-empty" tabindex="-1">' +
        '<svg class="empty-art" viewBox="0 0 120 64" aria-hidden="true" focusable="false"><path d="M4 56h112" class="empty-road"/>' +
        '<path d="M18 56h14M46 56h14M74 56h14M102 56h8" class="empty-lane"/><circle cx="36" cy="36" r="14"/><circle cx="84" cy="36" r="14"/>' +
        '<path d="M36 36l14-18h16l-8 18M50 18h-8M66 18l18 18"/></svg>' +
        '<h2 class="empty-title">Your cart is empty</h2>' +
        "<p>Bikes you add will show up here, saved on this browser for next time.</p>" +
        '<a class="btn btn-primary" href="bikes.html">Browse bikes</a>' +
      "</div>" +
      '<section class="suggestions" aria-labelledby="suggestions-title"><h2 class="section-title section-title-sm" id="suggestions-title">Some bikes to start with</h2>' +
        '<div class="bike-grid">' + picks.map(function (bike) { return ui.bikeCard(bike, { headingLevel: 3 }); }).join("") + "</div></section>";
  }

  function render(focusTarget) {
    renderNotices();
    var items = cart.items();
    if (!items.length) {
      confirmingClear = false;
      root.innerHTML = emptyState();
    } else {
      root.innerHTML = '<div class="cart-layout">' +
        '<section aria-labelledby="cart-items-title"><h2 class="visually-hidden" id="cart-items-title">Bikes in your cart</h2>' +
        '<ul class="cart-list">' + items.map(itemRow).join("") + "</ul></section>" +
        summary(items) + "</div>";
    }
    if (focusTarget) restoreFocus(focusTarget);
  }

  // After re-rendering, put focus back where the person was, or somewhere sensible.
  function restoreFocus(target) {
    var el = null;
    if (target.id && target.action) el = root.querySelector('[data-id="' + target.id + '"] [data-action="' + target.action + '"]');
    if (!el && target.selector) el = document.querySelector(target.selector);
    if (!el && !cart.items().length) el = document.getElementById("cart-empty");
    if (!el) el = document.getElementById("cart-heading");
    if (el) el.focus();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    if (!button || !(root.contains(button) || notices.contains(button))) return;
    var action = button.getAttribute("data-action");
    var row = button.closest("[data-id]");
    var id = row && row.getAttribute("data-id");
    var bike = id && ui.byId[id];

    if (button.getAttribute("aria-disabled") === "true") {
      if (action === "dec") announce("The quantity can't go below 1. Use Remove to take the " + bike.name + " out of your cart.");
      if (action === "inc") announce("The limit is " + cart.MAX + " of each bike in this demo.");
      return;
    }

    if (action === "inc" || action === "dec") {
      var qty = cart.set(id, cart.qty(id) + (action === "inc" ? 1 : -1));
      undo = null;
      render({ id: id, action: action });
      announce(bike.name + ": " + qty + " in your cart.");
    } else if (action === "remove") {
      undo = { kind: "remove", removed: cart.remove(id) };
      confirmingClear = false;
      render({ selector: '[data-action="undo"]' });
      announce("Removed the " + bike.name + " from your cart.");
    } else if (action === "undo" && undo) {
      if (undo.kind === "remove") cart.restore(undo.removed); else cart.replace(undo.previous);
      var restoredId = undo.kind === "remove" ? undo.removed.id : null;
      undo = null;
      render(restoredId ? { id: restoredId, action: "remove" } : { selector: ".cart-name a" });
      announce("Restored.");
    } else if (action === "clear") {
      confirmingClear = true;
      render({ selector: '[data-action="clear-cancel"]' });
    } else if (action === "clear-cancel") {
      confirmingClear = false;
      render({ selector: '[data-action="clear"]' });
    } else if (action === "clear-confirm") {
      undo = { kind: "clear", previous: cart.clear() };
      confirmingClear = false;
      render({ selector: '[data-action="undo"]' });
      announce("Your cart is now empty.");
    }
  });

  // Another tab (or the Back button) changed the cart: show the new contents.
  cart.subscribe(function (reason) {
    if (reason === "external") { undo = null; confirmingClear = false; render(); }
  });

  render();
})();
