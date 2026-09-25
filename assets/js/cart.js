/* UrbanBike Hub: the cart.
 *
 * The cart is the only thing this site stores. It lives in this browser's localStorage under
 * "urbanbikehub:cart:v1" as {"v": 1, "items": [{"id": "...", "qty": 1}], "savedAt": "..."}.
 * It is never sent anywhere, and adding a bike doesn't order it.
 *
 * Saved data is checked when it's read: unreadable or older-format data is reset, bikes that are no
 * longer in the catalog are dropped, and quantities are limited to 1-5. If the browser won't let the
 * site use storage, the cart still works on the current page but isn't kept.
 */
(function () {
  "use strict";

  var KEY = "urbanbikehub:cart:v1";
  var VERSION = 1;
  var data = window.UBH.data;
  var MAX = data.maxQuantity;
  var known = {};
  data.bikes.forEach(function (bike) { known[bike.id] = true; });

  var items = [];          // [{id, qty}] in the order they were added
  var problems = [];       // what was fixed when the saved cart was read (shown on the cart page)
  var storageOk = true;
  var listeners = [];

  function readRaw() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (e) {
      storageOk = false;   // access itself is blocked (some private modes, disabled site data)
      return null;
    }
  }

  // Turn whatever is saved into a clean list of items, and describe anything that had to be fixed.
  function parse(raw) {
    var found = [];
    if (raw === null || raw === "") return { items: [], problems: found, rewrite: false };

    var value;
    try {
      value = JSON.parse(raw);
    } catch (e) {
      return { items: [], problems: [{ type: "unreadable" }], rewrite: true };
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { items: [], problems: [{ type: "unreadable" }], rewrite: true };
    }
    if (value.v !== VERSION) {
      return { items: [], problems: [{ type: "outdated" }], rewrite: true };
    }
    if (!Array.isArray(value.items)) {
      return { items: [], problems: [{ type: "unreadable" }], rewrite: true };
    }

    var clean = [];
    var index = {};
    var dropped = 0, invalid = 0, lowered = 0;
    value.items.forEach(function (entry) {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string") { invalid += 1; return; }
      if (!known[entry.id]) { dropped += 1; return; }
      var qty = entry.qty;
      if (typeof qty !== "number" || !isFinite(qty) || Math.floor(qty) !== qty || qty < 1) { invalid += 1; return; }
      if (index[entry.id] !== undefined) {             // the same bike twice: merge
        qty += clean[index[entry.id]].qty;
        clean[index[entry.id]].qty = Math.min(qty, MAX);
        if (qty > MAX) lowered += 1;
        return;
      }
      if (qty > MAX) { qty = MAX; lowered += 1; }
      index[entry.id] = clean.length;
      clean.push({ id: entry.id, qty: qty });
    });
    if (dropped) found.push({ type: "dropped", count: dropped });
    if (invalid) found.push({ type: "invalid", count: invalid });
    if (lowered) found.push({ type: "lowered", count: lowered });
    return { items: clean, problems: found, rewrite: found.length > 0 };
  }

  function save() {
    if (!storageOk) return;
    try {
      if (items.length === 0) {
        window.localStorage.removeItem(KEY);
      } else {
        window.localStorage.setItem(KEY, JSON.stringify({ v: VERSION, items: items, savedAt: new Date().toISOString() }));
      }
    } catch (e) {
      storageOk = false;   // blocked or full: keep working in memory for this page
    }
  }

  function load() {
    var result = parse(readRaw());
    items = result.items;
    if (result.problems.length) problems = problems.concat(result.problems);
    if (result.rewrite) save();   // store the cleaned-up cart so the fix only happens once
  }

  function notify(reason) {
    listeners.forEach(function (fn) {
      try { fn(reason); } catch (e) { if (window.console) console.error(e); }
    });
  }

  function find(id) {
    for (var i = 0; i < items.length; i += 1) if (items[i].id === id) return i;
    return -1;
  }

  function copy() {
    return items.map(function (item) { return { id: item.id, qty: item.qty }; });
  }

  var cart = {
    KEY: KEY,
    MAX: MAX,
    items: copy,
    count: function () {
      return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    },
    qty: function (id) {
      var i = find(id);
      return i === -1 ? 0 : items[i].qty;
    },
    // Adds up to `qty` of a bike without going over the limit. Returns what actually happened.
    add: function (id, qty) {
      if (!known[id]) return { added: 0, qty: 0 };
      qty = Math.max(1, Math.floor(Number(qty) || 1));
      var i = find(id);
      var before = i === -1 ? 0 : items[i].qty;
      var after = Math.min(MAX, before + qty);
      if (after === before) return { added: 0, qty: before };
      if (i === -1) items.push({ id: id, qty: after }); else items[i].qty = after;
      save();
      notify("add");
      return { added: after - before, qty: after };
    },
    set: function (id, qty) {
      var i = find(id);
      if (i === -1) return 0;
      qty = Math.min(MAX, Math.max(1, Math.floor(Number(qty) || 1)));
      if (items[i].qty !== qty) {
        items[i].qty = qty;
        save();
        notify("set");
      }
      return qty;
    },
    // Removes a bike and returns what's needed to undo it.
    remove: function (id) {
      var i = find(id);
      if (i === -1) return null;
      var removed = { id: id, qty: items[i].qty, index: i };
      items.splice(i, 1);
      save();
      notify("remove");
      return removed;
    },
    restore: function (removed) {
      if (!removed || !known[removed.id] || find(removed.id) !== -1) return;
      items.splice(Math.min(removed.index, items.length), 0, { id: removed.id, qty: Math.min(MAX, removed.qty) });
      save();
      notify("restore");
    },
    clear: function () {
      var previous = copy();
      items = [];
      save();
      notify("clear");
      return previous;
    },
    replace: function (list) {     // used to undo "Empty cart"
      items = parse(JSON.stringify({ v: VERSION, items: list })).items;
      save();
      notify("restore");
    },
    problems: function () { return problems.slice(); },
    storageOk: function () { return storageOk; },
    subscribe: function (fn) { listeners.push(fn); }
  };

  load();

  // Another tab changed the cart: pick up its version.
  window.addEventListener("storage", function (event) {
    if (event.key !== KEY && event.key !== null) return;
    load();
    notify("external");
  });

  // Coming back with the Back button can show a cached page: refresh the cart in case it changed.
  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    load();
    notify("external");
  });

  window.UBH.cart = cart;
})();
