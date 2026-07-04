/* =========================================================
   Sirius Ascent — shared utilities
   Small values used across the other modules — kept here once
   so nothing recomputes the same media query twice.
   ========================================================= */

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
