/* =========================================================
   Sirius Ascent — signature interactions
   Desktop-only flourishes: a two-part custom cursor, magnetic CTAs,
   and a pointer-tracked light across glass cards. Everything here is
   additive; the site reads and operates identically without it, and
   it is skipped entirely on touch devices and under reduced motion.
   All movement is done with transforms inside rAF so it stays on the
   compositor.
   ========================================================= */

import { reduceMotion } from "./utils.js";

const finePointer = window.matchMedia("(pointer: fine)").matches;
const enabled = finePointer && !reduceMotion;

/* ---- Custom cursor ---- */
if (enabled) {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-cursor");

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true }
  );

  // The dot pins to the pointer; the ring eases behind it for weight.
  const render = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  // Swell over anything interactive
  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-magnetic]';
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(INTERACTIVE)) document.documentElement.classList.add("cursor-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(INTERACTIVE)) document.documentElement.classList.remove("cursor-active");
  });

  // Don't leave a stranded cursor when the pointer leaves the window
  document.addEventListener("mouseleave", () => document.documentElement.classList.remove("has-cursor"));
  document.addEventListener("mouseenter", () => document.documentElement.classList.add("has-cursor"));
}

/* ---- Magnetic CTAs ---- */
if (enabled) {
  const STRENGTH = 0.32;   // how far the element leans toward the pointer
  const RADIUS = 90;       // px beyond the element's box that it starts reacting

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    let raf = null;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      raf = null;
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Only pull while the pointer is within the element plus a small halo
      if (Math.abs(dx) > r.width / 2 + RADIUS || Math.abs(dy) > r.height / 2 + RADIUS) {
        tx = 0;
        ty = 0;
      } else {
        tx = dx * STRENGTH;
        ty = dy * STRENGTH;
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const reset = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", reset);
  });
}

/* ---- Pointer-tracked light on glass cards ---- */
if (enabled) {
  document.querySelectorAll(".glass-card").forEach((card) => {
    let raf = null;
    let px = 50;
    let py = 50;

    const apply = () => {
      card.style.setProperty("--mx", `${px}%`);
      card.style.setProperty("--my", `${py}%`);
      raf = null;
    };

    card.addEventListener(
      "mousemove",
      (e) => {
        const r = card.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width) * 100;
        py = ((e.clientY - r.top) / r.height) * 100;
        if (!raf) raf = requestAnimationFrame(apply);
      },
      { passive: true }
    );
  });
}
