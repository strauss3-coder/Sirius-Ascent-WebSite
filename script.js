/* =========================================================
   Sirius Ascent — interactions
   Progressive enhancement only. The page is fully usable
   and readable without this file.
   ========================================================= */

(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Page-ready (drives hero stagger) ---- */
  if (reduceMotion) {
    document.body.classList.add("is-ready");
  } else {
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  }

  /* ---- Scroll-aware header ---- */
  const header = document.querySelector("[data-header]");
  if (header) {
    let ticking = false;
    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
    };
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Close after navigating to an anchor
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });
    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---- Reveal-on-scroll for sections (natural transitions) ---- */
  const revealables = document.querySelectorAll("[data-reveal]");
  // Hero reveals are handled by the .is-ready stagger; observe the rest.
  const observed = Array.from(revealables).filter((el) => !el.closest(".hero"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    observed.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    observed.forEach((el) => io.observe(el));
  }
})();
