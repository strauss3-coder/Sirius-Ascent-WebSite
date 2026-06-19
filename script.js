/* =========================================================
   Sirius Ascent — Hero interactions
   Progressive enhancement only. The page is fully usable
   and readable without this file.
   ========================================================= */

(function () {
  "use strict";

  const root = document.documentElement;

  // Swap the "no-js" fallback for the JS-ready state. This flips the
  // reveal animations on (they are hidden by default only when JS runs).
  root.classList.remove("no-js");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Reveal hero content on load ---- */
  function triggerReveal() {
    // Add on the next frame so the browser registers the start state first.
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  }

  if (prefersReducedMotion) {
    document.body.classList.add("is-ready");
  } else {
    triggerReveal();
  }

  /* ---- Scroll-aware header ---- */
  const header = document.querySelector("[data-header]");

  if (header) {
    let ticking = false;

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeader(); // set correct state on load (e.g. refresh mid-page)
  }
})();
