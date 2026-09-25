/* UrbanBike Hub: catalog page (search, style filter, sorting). The choices are kept in the address,
 * so a filtered view can be bookmarked or shared, and the home page can link straight to a style. */
(function () {
  "use strict";

  var UBH = window.UBH;
  var ui = UBH.ui;
  var data = UBH.data;

  var form = document.getElementById("catalog-controls");
  var search = document.getElementById("search");
  var sortSelect = document.getElementById("sort");
  var styleGroup = document.getElementById("style-filter");
  var grid = document.getElementById("bike-grid");
  var status = document.getElementById("results-status");
  var empty = document.getElementById("no-results");
  var emptyText = document.getElementById("no-results-text");

  var SORTS = {
    featured: null,
    "price-asc": function (a, b) { return a.price - b.price; },
    "price-desc": function (a, b) { return b.price - a.price; },
    name: function (a, b) { return a.name.localeCompare(b.name); }
  };

  var state = { style: "all", q: "", sort: "featured" };

  function fold(text) {   // lower case, without accents, so "cafe" finds "Café"
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function readAddress() {
    var params = new URLSearchParams(window.location.search);
    var style = params.get("style");
    state.style = style && ui.styleById[style] ? style : "all";
    state.q = (params.get("q") || "").slice(0, 60);
    var sort = params.get("sort");
    state.sort = sort && Object.prototype.hasOwnProperty.call(SORTS, sort) ? sort : "featured";
  }

  function writeAddress() {
    var params = new URLSearchParams();
    if (state.style !== "all") params.set("style", state.style);
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.sort !== "featured") params.set("sort", state.sort);
    var query = params.toString();
    var url = window.location.pathname + (query ? "?" + query : "");
    try { window.history.replaceState(null, "", url); } catch (e) { /* file:// in some browsers */ }
  }

  function renderStyleFilter() {
    var options = [{ id: "all", name: "All styles", count: data.bikes.length }].concat(data.styles.map(function (style) {
      return { id: style.id, name: style.name, count: data.bikes.filter(function (b) { return b.style === style.id; }).length };
    }));
    styleGroup.innerHTML = '<legend class="control-label">Style</legend><div class="chips">' + options.map(function (o) {
      return '<label class="chip"><input type="radio" name="style" value="' + o.id + '"' + (o.id === state.style ? " checked" : "") + ">" +
        '<span>' + ui.escapeHTML(o.name) + ' <span class="chip-count">' + o.count + "</span></span></label>";
    }).join("") + "</div>";
  }

  function matches(bike, words) {
    if (!words.length) return true;
    var style = ui.styleById[bike.style];
    var text = fold([bike.name, style.name, style.plural, bike.colour, bike.summary].join(" "));
    return words.every(function (word) { return text.indexOf(word) !== -1; });
  }

  function describe(count) {
    var style = ui.styleById[state.style];
    var what = style ? (count === 1 ? style.single : style.plural) : (count === 1 ? "bike" : "bikes");
    var text = count === data.bikes.length && !state.q.trim() ? "Showing all " + count + " bikes" : "Showing " + count + " " + what;
    if (state.q.trim()) text += " matching “" + state.q.trim() + "”";
    return text + ".";
  }

  function render() {
    var words = fold(state.q).split(/\s+/).filter(Boolean);
    var list = data.bikes.filter(function (bike) {
      return (state.style === "all" || bike.style === state.style) && matches(bike, words);
    });
    if (SORTS[state.sort]) list = list.slice().sort(SORTS[state.sort]);

    grid.innerHTML = list.map(function (bike) { return ui.bikeCard(bike, { headingLevel: 2 }); }).join("");
    grid.hidden = list.length === 0;
    empty.hidden = list.length !== 0;
    if (list.length === 0) {
      var style = ui.styleById[state.style];
      emptyText.textContent = "No " + (style ? style.plural : "bikes") + (state.q.trim() ? " match “" + state.q.trim() + "”" : " here") +
        ". Try a different word, or show every style.";
      status.textContent = "No bikes match.";
    } else {
      status.textContent = describe(list.length);
    }
    writeAddress();
  }

  function syncControls() {
    search.value = state.q;
    sortSelect.value = state.sort;
    var radio = styleGroup.querySelector('input[value="' + state.style + '"]');
    if (radio) radio.checked = true;
  }

  var typingTimer = null;
  search.addEventListener("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () { state.q = search.value.slice(0, 60); render(); }, 150);
  });
  sortSelect.addEventListener("change", function () { state.sort = sortSelect.value; render(); });
  styleGroup.addEventListener("change", function (event) {
    if (event.target.name === "style") { state.style = event.target.value; render(); }
  });
  form.addEventListener("submit", function (event) {   // Enter in the search box
    event.preventDefault();
    clearTimeout(typingTimer);
    state.q = search.value.slice(0, 60);
    render();
  });
  document.getElementById("clear-filters").addEventListener("click", function () {
    state = { style: "all", q: "", sort: state.sort };
    syncControls();
    render();
    search.focus();
  });

  readAddress();
  renderStyleFilter();
  syncControls();
  render();

  // Back/Forward between filtered views of this page.
  window.addEventListener("popstate", function () { readAddress(); syncControls(); render(); });
})();
