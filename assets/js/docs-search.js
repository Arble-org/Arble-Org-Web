/* Documentation search.

   Fetches the generated index once on first interaction (not on load — most
   visits never search), then scores client-side. No dependencies, no network
   round-trip per keystroke.

   Scoring is deliberately simple and predictable: an exact title match wins,
   then title prefix, then title substring, then description, then body. A
   reader who types a command name should get that command's page first, and
   they can see why it ranked where it did.

   Progressive enhancement: with scripting off the input is inert but the
   sidebar still navigates. */
(function () {
  "use strict";

  var input = document.getElementById("docsSearch");
  var out = document.getElementById("docsSearchResults");
  if (!input || !out) return;

  var root = window.ARBLE_DOCS_ROOT || "docs/";
  var index = null;
  var loading = false;
  var pending = false;

  function load() {
    if (index || loading) return;
    loading = true;
    fetch(root + "search-index.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) { index = j; loading = false; if (pending) run(); })
      .catch(function () {
        loading = false;
        index = [];
        render([], "Search is unavailable.");
      });
  }

  function score(entry, q) {
    var t = entry.t.toLowerCase();
    if (t === q) return 1000;
    if (t.indexOf(q) === 0) return 500;
    if (t.indexOf(q) !== -1) return 250;
    if ((entry.s || "").toLowerCase().indexOf(q) !== -1) return 120;
    if ((entry.d || "").toLowerCase().indexOf(q) !== -1) return 60;
    if ((entry.x || "").toLowerCase().indexOf(q) !== -1) return 20;
    return 0;
  }

  function render(rows, message) {
    out.innerHTML = "";
    if (message) {
      var li = document.createElement("li");
      li.className = "docs__searchempty";
      li.textContent = message;
      out.appendChild(li);
      out.hidden = false;
      return;
    }
    if (!rows.length) { out.hidden = true; return; }
    rows.forEach(function (r) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = root + r.u;
      var strong = document.createElement("span");
      strong.className = "docs__searchr-t";
      strong.textContent = r.t;
      var sec = document.createElement("span");
      sec.className = "docs__searchr-s";
      sec.textContent = r.s;
      a.appendChild(strong);
      a.appendChild(sec);
      li.appendChild(a);
      out.appendChild(li);
    });
    out.hidden = false;
  }

  function run() {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) { out.hidden = true; return; }
    if (!index) { pending = true; load(); return; }
    pending = false;
    var rows = index
      .map(function (e) { return { e: e, n: score(e, q) }; })
      .filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.n - a.n || a.e.t.localeCompare(b.e.t); })
      .slice(0, 8)
      .map(function (x) { return x.e; });
    render(rows, rows.length ? null : "No matches for “" + input.value.trim() + "”");
  }

  input.addEventListener("focus", load);
  input.addEventListener("input", run);

  /* Escape closes results; Enter opens the top hit. */
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { out.hidden = true; input.blur(); return; }
    if (e.key === "Enter") {
      var first = out.querySelector("a");
      if (first && !out.hidden) { e.preventDefault(); window.location.href = first.href; }
    }
  });

  /* "/" focuses search, the convention on every docs site that has one. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    e.preventDefault();
    input.focus();
  });

  document.addEventListener("click", function (e) {
    if (!out.contains(e.target) && e.target !== input) out.hidden = true;
  });
})();
