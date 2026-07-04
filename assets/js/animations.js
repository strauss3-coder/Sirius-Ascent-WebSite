/* =========================================================
   Sirius Ascent — motion
   Hero particles/entrance, seam-glow parallax, reveal-on-scroll
   and the results stat count-up. Progressive enhancement only —
   every element here is fully readable without this file.
   ========================================================= */

import { reduceMotion } from "./utils.js";

/* ---- Hero particles ----
   A handful of small glowing dots drifting upward through the hero glow —
   generated once on load rather than hand-authored in HTML. Skipped
   entirely under reduced motion since it's purely decorative. */
const particleField = document.querySelector("[data-particles]");
if (particleField && !reduceMotion) {
  const PARTICLE_COUNT = 22;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const dot = document.createElement("span");
    dot.className = "hero__particle";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${40 + Math.random() * 55}%`;
    dot.style.setProperty("--size", `${2 + Math.random() * 3}px`);
    dot.style.setProperty("--dur", `${9 + Math.random() * 10}s`);
    dot.style.setProperty("--delay", `${Math.random() * 12}s`);
    dot.style.setProperty("--peak", `${0.35 + Math.random() * 0.35}`);
    particleField.appendChild(dot);
  }
}

/* ---- Seam-glow parallax (subtle depth at section boundaries) ----
   .results/.work/.audit each have a ::before light wash straddling their
   top seam (see styles.css). Drifting it slightly slower than the page
   scroll as the section passes through view is what reads as "depth"
   rather than a flat sticker sitting on top of the background. */
const seamSections = document.querySelectorAll(".results, .work, .audit");
if (seamSections.length && !reduceMotion) {
  let seamTicking = false;
  const updateSeamParallax = () => {
    seamSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const shift = Math.max(-24, Math.min(24, rect.top * 0.06));
      section.style.setProperty("--seam-shift", `${shift}px`);
    });
    seamTicking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!seamTicking) {
        window.requestAnimationFrame(updateSeamParallax);
        seamTicking = true;
      }
    },
    { passive: true }
  );
  updateSeamParallax();
}

/* ---- Hero entrance ----
   A staggered fade-up on load rather than a scroll-jacked reveal — the
   hero has no video to hold attention against, so each element's
   transition-delay is just derived from its existing data-range start
   value to keep the same reveal order/rhythm as before. */
const hero = document.querySelector("[data-hero]");
if (hero) {
  const heroRevealEls = hero.querySelectorAll("[data-hero-reveal]");
  if (reduceMotion) {
    heroRevealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  } else {
    heroRevealEls.forEach((el) => {
      const start = parseFloat((el.dataset.range || "0").split(",")[0]) || 0;
      el.style.transitionDelay = `${(0.15 + start).toFixed(2)}s`;
    });
    requestAnimationFrame(() => hero.classList.add("is-revealed"));
  }
}

/* ---- Reveal-on-scroll for sections (natural transitions) ---- */
const revealables = document.querySelectorAll("[data-reveal]");
// Hero reveals are handled by the cinematic intro above; observe the rest.
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

/* ---- Results stat count-up ---- */
const countEls = document.querySelectorAll("[data-count]");
if (countEls.length) {
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion || !target) {
      el.textContent = String(target);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      el.textContent = String(Math.round(easeOutCubic(t) * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    countEls.forEach((el) => (el.textContent = el.dataset.count));
  } else {
    const countIo = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach((el) => countIo.observe(el));
  }
}
