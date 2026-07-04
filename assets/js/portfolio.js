/* =========================================================
   Sirius Ascent — portfolio & case-study interactions
   Before/after compare slider, project/brand showcase
   carousels, and the portfolio page's filter buttons.
   ========================================================= */

import { reduceMotion } from "./utils.js";

/* ---- Before/after drag-to-compare slider ----
   A functional interaction, not ambient motion, so it stays active even
   under prefers-reduced-motion — only the decorative parts of the site
   pause for that, not the things a visitor deliberately operates. */
const compareSlider = document.querySelector("[data-compare-slider]");
if (compareSlider) {
  const clipLayer = compareSlider.querySelector("[data-compare-clip]");
  const handle = compareSlider.querySelector("[data-compare-handle]");

  const setPosition = (percent) => {
    const clamped = Math.min(100, Math.max(0, percent));
    clipLayer.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    handle.style.left = `${clamped}%`;
    compareSlider.setAttribute("aria-valuenow", String(Math.round(clamped)));
  };

  const positionFromPointer = (clientX) => {
    const rect = compareSlider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  let dragging = false;
  const onPointerMove = (e) => {
    if (!dragging) return;
    setPosition(positionFromPointer(e.clientX));
  };
  const stopDrag = () => {
    dragging = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDrag);
  };
  compareSlider.addEventListener("pointerdown", (e) => {
    dragging = true;
    setPosition(positionFromPointer(e.clientX));
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
  });

  compareSlider.addEventListener("keydown", (e) => {
    const current = parseFloat(compareSlider.getAttribute("aria-valuenow")) || 50;
    if (e.key === "ArrowLeft") {
      setPosition(current - 5);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setPosition(current + 5);
      e.preventDefault();
    }
  });
}

/* ---- Brand showcase carousels ----
   Each track is a native CSS scroll-snap row — touch swipe, momentum and
   snapping all come from the browser for free, nothing to reimplement or
   break. JS only adds what the browser doesn't give a mouse user for
   free: arrow buttons, dot navigation, and click-and-drag scrolling. */
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector("[data-prev]");
  const nextBtn = carousel.querySelector("[data-next]");
  const dotsWrap = carousel.querySelector("[data-dots]");

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
    dot.addEventListener("click", () => {
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const currentIndex = () => {
    let closest = 0;
    let closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  };

  const syncUI = () => {
    const i = currentIndex();
    dots.forEach((dot, di) => dot.classList.toggle("is-active", di === i));
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === slides.length - 1;
  };

  let scrollTicking = false;
  track.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          syncUI();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  const goTo = (delta) => {
    const next = Math.min(slides.length - 1, Math.max(0, currentIndex() + delta));
    track.scrollTo({ left: slides[next].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };
  if (prevBtn) prevBtn.addEventListener("click", () => goTo(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(1));

  // Click-and-drag scrolling for mouse users (touch already scrolls natively)
  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") return;
    dragging = true;
    track.classList.add("is-dragging");
    dragStartX = e.clientX;
    dragStartScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    track.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    goTo(0); // snap to nearest slide after a free-form drag
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  syncUI();
});

/* ---- Portfolio filters ---- */
const portfolioFilters = document.querySelector("[data-portfolio-filters]");
const portfolioGrid = document.querySelector("[data-portfolio-grid]");
if (portfolioFilters && portfolioGrid) {
  const buttons = Array.from(portfolioFilters.querySelectorAll("[data-filter]"));
  const cards = Array.from(portfolioGrid.querySelectorAll("[data-category]"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const categories = card.dataset.category.split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.style.display = show ? "" : "none";
      });
    });
  });
}
