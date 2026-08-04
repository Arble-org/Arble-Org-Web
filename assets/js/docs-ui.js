/* Documentation chrome: reading progress and Copy page.

   Both are additive. With scripting off the page reads identically — there is
   simply no progress bar and no copy button feedback. */
(function () {
  "use strict";

  /* The documentation is light mode only — there is no theme toggle to wire up.
     Any theme preference left in storage by an earlier build is discarded. */
  try { localStorage.removeItem("arble-docs-theme"); } catch (e) {}

  /* ── mobile navigation drawer ──
     Focus is trapped while open and returns to the trigger on close. */
  var navBtn = document.getElementById("navToggle");
  var side = document.querySelector(".dside");
  if (navBtn && side) {
    var scrim = document.createElement("div");
    scrim.className = "dscrim";
    document.body.appendChild(scrim);

    function setOpen(open) {
      side.classList.toggle("is-open", open);
      scrim.classList.toggle("is-open", open);
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = side.querySelector("a, input, summary");
        if (first) first.focus();
      } else {
        navBtn.focus();
      }
    }

    navBtn.addEventListener("click", function () {
      setOpen(!side.classList.contains("is-open"));
    });
    scrim.addEventListener("click", function () { setOpen(false); });
    side.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && side.classList.contains("is-open")) setOpen(false);
    });
  }

  /* ── "On this page" disclosure, narrow viewports only ──
     Below 1180px the CSS moves the rail above the article. On a phone that put
     a full screen of links in front of the H1, so here it becomes a collapsed
     disclosure. Everything is behind matchMedia, and the injected button is
     removed again on the way back up, so the desktop rail keeps exactly the
     markup and the plain .docs__tocH heading it has always had. */
  var toc = document.querySelector(".docs__toc");
  var tocList = toc && toc.querySelector(".docs__toclist");
  if (toc && tocList) {
    var narrow = matchMedia("(max-width: 900px)");
    var tocBtn = null;

    if (!tocList.id) tocList.id = "docsTocList";

    function collapse(on) {
      toc.classList.toggle("is-collapsed", on);
      if (tocBtn) tocBtn.setAttribute("aria-expanded", on ? "false" : "true");
    }

    function buildBtn() {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dtocbtn";
      b.setAttribute("aria-expanded", "false");
      b.setAttribute("aria-controls", tocList.id);
      b.innerHTML = '<span>On this page</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
      b.addEventListener("click", function () {
        collapse(!toc.classList.contains("is-collapsed"));
      });
      return b;
    }

    function syncToc() {
      if (narrow.matches) {
        if (!tocBtn) {
          tocBtn = buildBtn();
          tocList.parentNode.insertBefore(tocBtn, tocList);
        }
        collapse(true);
      } else if (tocBtn) {
        tocBtn.remove();
        tocBtn = null;
        toc.classList.remove("is-collapsed");
      }
    }

    /* Following a link should hand the screen back to the prose. */
    tocList.addEventListener("click", function (e) {
      if (narrow.matches && e.target.closest("a")) collapse(true);
    });

    if (narrow.addEventListener) narrow.addEventListener("change", syncToc);
    else narrow.addListener(syncToc);
    syncToc();
  }

  /* ── reading progress ──
     A 2px bar driven by scroll position over the article, not the document, so
     it reaches 100% when the prose ends rather than when the footer does. */
  var article = document.getElementById("doc");
  if (article && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var bar = document.createElement("div");
    bar.className = "docs__prog";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var raf = null;
    function paint() {
      raf = null;
      var box = article.getBoundingClientRect();
      var total = box.height - window.innerHeight;
      if (total <= 0) { bar.style.transform = "scaleX(0)"; return; }
      var done = Math.min(1, Math.max(0, -box.top / total));
      bar.style.transform = "scaleX(" + done.toFixed(4) + ")";
    }
    function onScroll() { if (raf === null) raf = requestAnimationFrame(paint); }
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    paint();
  }

  /* ── Copy page ──
     Serialises the article to plain Markdown-ish text. Useful for pasting a
     page into a model, which is the reason Linear ships the same control.
     Clipboard access can be refused, so the failure path says so rather than
     flashing success. */
  var btn = document.getElementById("copyPage");
  if (!btn || !article) return;

  function serialize() {
    var out = [];
    var title = article.querySelector(".docs__title");
    if (title) out.push("# " + title.textContent.trim(), "");

    article.querySelectorAll(
      ".docs__lead, .docs__body > p, .docs__body > h2, .docs__body > h3," +
      ".docs__body > h4, .docs__body > ul, .docs__body > ol, .docs__code," +
      ".docs__tablewrap, .docs__note"
    ).forEach(function (el) {
      var t = el.textContent.replace(/\s+\n/g, "\n").trim();
      if (!t) return;
      if (el.tagName === "H2") out.push("", "## " + t, "");
      else if (el.tagName === "H3") out.push("", "### " + t, "");
      else if (el.tagName === "H4") out.push("", "#### " + t, "");
      else if (el.classList.contains("docs__code")) {
        var code = el.querySelector("code");
        var lang = el.querySelector(".docs__lang");
        out.push("", "```" + (lang ? lang.textContent.toLowerCase() : ""),
                 code ? code.textContent.replace(/\s+$/, "") : "", "```", "");
      } else if (el.tagName === "UL" || el.tagName === "OL") {
        [].forEach.call(el.children, function (li) {
          out.push("- " + li.textContent.replace(/\s+/g, " ").trim());
        });
        out.push("");
      } else if (el.classList.contains("docs__note")) {
        out.push("", "> " + t.replace(/\n/g, "\n> "), "");
      } else if (el.classList.contains("docs__tablewrap")) {
        el.querySelectorAll("tr").forEach(function (tr) {
          var cells = [].map.call(tr.children, function (c) {
            return c.textContent.replace(/\s+/g, " ").trim();
          });
          out.push("| " + cells.join(" | ") + " |");
        });
        out.push("");
      } else {
        out.push(t, "");
      }
    });

    out.push("", location.href);
    return out.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  btn.addEventListener("click", function () {
    var label = btn.querySelector("span");
    var was = label.textContent;
    function flash(msg) {
      label.textContent = msg;
      setTimeout(function () { label.textContent = was; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(serialize()).then(
        function () { flash("Copied"); },
        function () { flash("Press ⌘C"); }
      );
    } else {
      flash("Press ⌘C");
    }
  });
})();
