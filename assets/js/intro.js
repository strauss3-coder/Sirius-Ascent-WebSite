/* =========================================================
   Sirius Ascent — intro + page transitions
   Entry loader (logo + ring) shown on every page load; the welcome
   line ("Welcome to Sirius Ascent") plays once per session on the
   homepage. A carbon fade-out plays on internal navigation so pages
   flow cinematically into one another. Progressive enhancement only:
   the loader fail-safe-hides via CSS even without this file, and the
   whole thing is disabled under reduced motion (CSS display:none).
   ========================================================= */

import { reduceMotion } from "./utils.js";

const loader = document.querySelector("[data-page-loader]");
const exit = document.querySelector("[data-page-exit]");

if (loader) {
  if (reduceMotion) {
    loader.classList.add("is-done");
  } else {
    // Welcome line: homepage (has the hero) and only the first visit per session.
    const isHome = !!document.querySelector("[data-hero]");
    let firstVisit = false;
    try {
      firstVisit = isHome && !sessionStorage.getItem("sa-welcomed");
      if (firstVisit) sessionStorage.setItem("sa-welcomed", "1");
    } catch (e) {
      firstVisit = isHome; // sessionStorage blocked — still show once this load
    }
    if (firstVisit) loader.classList.add("is-welcome");

    const hold = firstVisit ? 2500 : 600;
    window.setTimeout(() => loader.classList.add("is-done"), hold);
  }
}

/* Fade to carbon before following an internal link. */
if (exit && !reduceMotion) {
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let new-tab/save through
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    let url;
    try {
      url = new URL(href, location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== location.origin) return;          // external site
    if (url.pathname === location.pathname) return;       // same page (anchor / self)

    e.preventDefault();
    exit.classList.add("is-active");
    window.setTimeout(() => {
      location.href = url.href;
    }, 400);
  });
}
