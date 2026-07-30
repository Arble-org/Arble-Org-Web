/* Docs page: copy buttons on the code blocks, and an on-this-page rail that
   marks the section you are currently reading.

   Both are additive — with scripting off the code blocks still show their
   contents and the TOC links still jump, they just do not highlight. */
(function () {
  "use strict";

  /* ── copy buttons ──
     Clipboard access can be refused, or absent entirely on an insecure origin,
     so the failure path says so rather than flashing a success state that did
     nothing. */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".docs__copy");
    if (!btn) return;
    var src = document.getElementById(btn.getAttribute("data-copy"));
    if (!src) return;

    var flash = function (label) {
      var was = btn.textContent;
      btn.textContent = label;
      btn.classList.add("is-done");
      setTimeout(function () {
        btn.textContent = was;
        btn.classList.remove("is-done");
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(src.textContent).then(
        function () { flash("Copied"); },
        function () { flash("Press ⌘C"); }
      );
    } else {
      flash("Press ⌘C");
    }
  });

  /* ── on-this-page highlighting ──
     rootMargin pulls the observation band up to just under the sticky nav and
     down to the upper third of the viewport, so a heading counts as "current"
     once it reaches reading position rather than the moment it appears at the
     bottom edge.

     Exposed as initToc() because the playbook swaps its whole article — and
     therefore its whole TOC — on hashchange, so the observer has to be rebuilt
     against the new headings. Static docs pages just call it once. */
  var io = null;

  function initToc() {
    if (io) { io.disconnect(); io = null; }

    var toc = document.getElementById("docsToc");
    if (!toc || !("IntersectionObserver" in window)) return;

    var links = {};
    [].slice.call(toc.querySelectorAll("a[href*='#']")).forEach(function (a) {
      var id = a.getAttribute("href").split("#")[1];
      if (id) links[id] = a.parentNode;
    });

    var headings = Object.keys(links)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!headings.length) return;

    var seen = {};

    function paint() {
      /* Topmost visible heading wins. Falling back to the last one scrolled
         past keeps a section marked while you read the prose under it, instead
         of the highlight vanishing between headings. */
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        if (seen[h.id]) { current = h.id; break; }
        if (h.getBoundingClientRect().top < 160) current = h.id;
      }
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle("is-on", id === current);
      });
    }

    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
      paint();
    }, { rootMargin: "-120px 0px -66% 0px", threshold: 0 });

    headings.forEach(function (h) { io.observe(h); });
    paint();
  }

  window.ArbleDocs = { initToc: initToc };
  initToc();
})();
