/* =========================================================
   Sirius Ascent — navigation & site chrome
   Scroll-aware header, mobile menu, and the floating enquiry
   button (FAB) + panel present on every page.
   ========================================================= */

import { reduceMotion } from "./utils.js";

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

/* ---- Floating enquiry button + panel ----
   Reuses the audit page's wizard wholesale rather than duplicating it:
   opening the panel physically moves the #wizardForm node into the
   panel's slot, closing moves it back to the anchor left in its place.
   Because it's the same DOM node (not a clone), the wizard's current
   step, every field's value, and the dropdowns' selections all survive
   the move for free — there's nothing to save/restore by hand, and the
   wizard's own code (above) is completely untouched. */
const fab = document.querySelector("[data-fab]");
if (fab) {
  const overlay = document.querySelector("[data-fab-overlay]");
  const panel = document.querySelector("[data-fab-panel]");
  const closeBtn = document.querySelector("[data-fab-close]");
  const slot = document.querySelector("[data-fab-slot]");
  const anchor = document.querySelector("[data-wizard-anchor]");
  const wizardForm = document.getElementById("wizardForm");
  const ring = fab.querySelector(".fab__ring");
  let lastFocused = null;
  let engaged = false;
  let savedScrollY = 0;

  // Locks scroll by pinning body to a fixed offset rather than
  // overflow:hidden, which resets scrollTop to 0 in most browsers when
  // applied anywhere below the very top of the page.
  const lockScroll = () => {
    savedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.documentElement.classList.add("fab-locked");
  };
  const unlockScroll = () => {
    document.documentElement.classList.remove("fab-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollY);
  };

  const trapFocus = (e) => {
    if (e.key !== "Tab") return;
    const focusables = Array.from(
      panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Escape") closePanel();
    else trapFocus(e);
  };

  const openPanel = () => {
    engaged = true;
    lastFocused = document.activeElement;
    slot.appendChild(wizardForm);

    // The panel's own header already covers the wizard's "welcome"
    // step's job, so skip straight to question one — but only the very
    // first time; if a visitor already made progress, leave them there.
    const wizardEl = wizardForm.querySelector("[data-wizard]");
    const startBtn = wizardForm.querySelector("[data-wizard-start]");
    if (wizardEl && wizardEl.dataset.current === "welcome" && startBtn) startBtn.click();

    overlay.classList.add("is-open");
    lockScroll();
    fab.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKeydown);
    setTimeout(() => panel.focus({ preventScroll: true }), reduceMotion ? 0 : 360);
  };

  function closePanel() {
    overlay.classList.remove("is-open");
    unlockScroll();
    fab.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKeydown);
    anchor.after(wizardForm);
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  }

  fab.addEventListener("click", () => {
    if (!reduceMotion && ring) {
      ring.classList.remove("is-rippling");
      // restart the animation even if it's already mid-run from a fast double-click
      void ring.offsetWidth;
      ring.classList.add("is-rippling");
    }
    openPanel();
  });
  closeBtn.addEventListener("click", closePanel);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePanel();
  });

  /* ---- One-time attention hint ----
     Whichever comes first — ~25s on the page or 60% scrolled — the
     button briefly expands to a different, more direct message, then
     reverts. Never fires if they've already opened the panel by then,
     and never fires twice in one visit. */
  let hintShown = false;
  const showHint = () => {
    if (hintShown || engaged || reduceMotion) return;
    hintShown = true;
    fab.classList.add("is-hinting");
    setTimeout(() => fab.classList.remove("is-hinting"), 5000);
  };
  const hintTimer = setTimeout(showHint, 25000);
  let hintTicking = false;
  const onScrollForHint = () => {
    if (hintShown || hintTicking) return;
    hintTicking = true;
    requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= 0.6) {
        showHint();
        clearTimeout(hintTimer);
        window.removeEventListener("scroll", onScrollForHint);
      }
      hintTicking = false;
    });
  };
  window.addEventListener("scroll", onScrollForHint, { passive: true });
}
