/* UrbanBike Hub: bike details page (bike.html?id=...). */
(function () {
  "use strict";

  var UBH = window.UBH;
  var ui = UBH.ui;
  var data = UBH.data;
  var cart = UBH.cart;

  var id = new URLSearchParams(window.location.search).get("id");
  var bike = id ? ui.byId[id] : null;
  var view = document.getElementById("bike-view");
  var missing = document.getElementById("bike-missing");

  if (!bike) {
    view.hidden = true;
    missing.hidden = false;
    document.title = "Bike not found · UrbanBike Hub";
    return;
  }

  var style = ui.styleById[bike.style];
  var esc = ui.escapeHTML;
  document.title = bike.name + " · UrbanBike Hub";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", bike.summary + " A demo listing on UrbanBike Hub.");
  document.getElementById("crumb-current").textContent = bike.name;

  var qtyOptions = "";
  for (var n = 1; n <= cart.MAX; n += 1) qtyOptions += '<option value="' + n + '">' + n + "</option>";

  document.getElementById("bike-detail").innerHTML =
    '<div class="detail-media' + (bike.image.fit === "cover" ? " is-photo" : "") + '">' + ui.bikeImage(bike, "detail-img").replace(' loading="lazy"', ' fetchpriority="high"') + "</div>" +
    '<div class="detail-info">' +
      '<p class="eyebrow"><a href="' + ui.catalogUrl(style.id) + '">' + esc(style.name) + "</a></p>" +
      '<h1 class="detail-title">' + esc(bike.name) + "</h1>" +
      ui.priceTag(bike, "detail-price") +
      '<p class="detail-description">' + esc(bike.description) + "</p>" +
      '<h2 class="detail-subtitle">In the photo</h2>' +
      '<ul class="feature-list">' + bike.features.map(function (f) { return "<li>" + ui.icon("check") + "<span>" + esc(f) + "</span></li>"; }).join("") + "</ul>" +
      '<dl class="detail-facts"><div><dt>Style</dt><dd>' + esc(style.name) + "</dd></div><div><dt>Colour</dt><dd>" + esc(bike.colour) + "</dd></div></dl>" +
      '<div class="buy-box">' +
        '<div class="field field-qty"><label for="qty">Quantity</label><select id="qty" class="select">' + qtyOptions + "</select></div>" +
        '<button class="btn btn-primary btn-lg" type="button" data-add-to-cart="' + bike.id + '" data-qty-from="qty">' + ui.icon("plus") +
          '<span class="btn-label">Add to cart</span></button>' +
        '<p class="in-cart" id="in-cart" aria-live="polite"></p>' +
      "</div>" +
      '<p class="detail-note">' + ui.icon("info") + "<span>Demo listing: the name, description and price are illustrative. " +
        "No specifications are listed because none are verified. Adding a bike to your cart doesn't order it.</span></p>" +
    "</div>";

  function updateInCart() {
    var qty = cart.qty(bike.id);
    var el = document.getElementById("in-cart");
    el.innerHTML = qty ? "In your cart: " + qty + ' · <a href="cart.html">View cart</a>' : "";
  }
  updateInCart();
  cart.subscribe(updateInCart);

  // Other bikes: the same style first, then the rest in catalog order.
  var others = data.bikes.filter(function (b) { return b.id !== bike.id; });
  var related = others.filter(function (b) { return b.style === bike.style; })
    .concat(others.filter(function (b) { return b.style !== bike.style; }))
    .slice(0, 3);
  document.getElementById("related-grid").innerHTML = related.map(function (b) { return ui.bikeCard(b, { headingLevel: 3 }); }).join("");
})();
