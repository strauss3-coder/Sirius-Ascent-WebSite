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

  /* ---- Hero cinematic intro ----
     The BMW video plays alone on load. The page is held in place (scroll is
     captured, not the browser's) while the visitor scrolls/swipes/presses a
     key — that input drives the headline/copy/CTA reveal directly. Once the
     reveal completes, the capture is released for good and the page scrolls
     normally from then on. */
  const hero = document.querySelector("[data-hero]");
  const heroVideo = document.querySelector(".hero__video");
  const heroOverlay = document.querySelector(".hero__overlay");
  const heroRevealEls = hero ? hero.querySelectorAll("[data-hero-reveal]") : [];
  const clamp01 = (n) => Math.min(Math.max(n, 0), 1);

  if (hero && heroVideo && heroOverlay) {
    if (reduceMotion) {
      heroOverlay.style.opacity = "0.45";
      heroVideo.style.transform = "scale(1.05)";
      heroRevealEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    } else {
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      let progress = 0;

      const applyHeroIntro = () => {
        heroOverlay.style.opacity = String(0.28 + progress * 0.17);
        heroVideo.style.transform = `scale(${1 + progress * 0.05})`;

        heroRevealEls.forEach((el) => {
          const [start, end] = el.dataset.range.split(",").map(Number);
          const eased = easeOutCubic(clamp01((progress - start) / (end - start)));
          el.style.opacity = String(eased);
          el.style.transform = `translateY(${(1 - eased) * 20}px)`;
        });
      };
      applyHeroIntro();

      root.classList.add("hero-locked");

      const nudge = (delta) => {
        progress = clamp01(progress + delta);
        applyHeroIntro();
        if (progress >= 1) unlockHero();
      };

      const onWheel = (e) => {
        e.preventDefault();
        nudge(e.deltaY / 480);
      };

      let touchStartY = null;
      const onTouchStart = (e) => {
        touchStartY = e.touches[0].clientY;
      };
      const onTouchMove = (e) => {
        if (touchStartY === null) return;
        e.preventDefault();
        const currentY = e.touches[0].clientY;
        nudge((touchStartY - currentY) / 320);
        touchStartY = currentY;
      };

      const onKeyDown = (e) => {
        if (["ArrowDown", "PageDown", " "].includes(e.key)) {
          e.preventDefault();
          nudge(0.12);
        } else if (["ArrowUp", "PageUp"].includes(e.key)) {
          e.preventDefault();
          nudge(-0.12);
        }
      };

      function unlockHero() {
        root.classList.remove("hero-locked");
        window.removeEventListener("wheel", onWheel, { passive: false });
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove, { passive: false });
        window.removeEventListener("keydown", onKeyDown);
      }

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKeyDown);
    }
  }

  /* ---- Pricing feature explorer ----
     Most visitors never click a tab — left alone, they'd only ever see the
     first ("Photography") panel and silently miss the other four. Auto-
     advance through them on a timer, but the instant a visitor actually
     touches a tab themselves, their choice wins permanently: the timer
     stops for good rather than yanking the panel out from under them. */
  const explorerTabs = document.querySelectorAll(".pricing__explorer-tab");
  const explorerPanels = document.querySelectorAll(".pricing__explorer-panel");
  if (explorerTabs.length && explorerPanels.length) {
    const tabOrder = Array.from(explorerTabs).map((tab) => tab.dataset.feature);
    let autoIndex = 0;
    let autoTimer = null;
    let userTookControl = false;

    const activateFeature = (feature) => {
      explorerTabs.forEach((tab) => {
        const isMatch = tab.dataset.feature === feature;
        tab.classList.toggle("is-active", isMatch);
        tab.setAttribute("aria-selected", String(isMatch));
      });
      explorerPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.feature === feature);
      });
    };

    const stopAutoAdvance = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };
    const takeControl = (tab) => {
      userTookControl = true;
      stopAutoAdvance();
      activateFeature(tab.dataset.feature);
    };

    explorerTabs.forEach((tab) => {
      tab.addEventListener("mouseenter", () => takeControl(tab));
      tab.addEventListener("click", () => takeControl(tab));
      tab.addEventListener("focus", () => takeControl(tab));
    });

    if (!reduceMotion && "IntersectionObserver" in window) {
      const explorerSection = document.querySelector(".pricing__explorer");
      const startAutoAdvance = () => {
        if (autoTimer || userTookControl) return;
        autoTimer = setInterval(() => {
          autoIndex = (autoIndex + 1) % tabOrder.length;
          activateFeature(tabOrder[autoIndex]);
        }, 4500);
      };
      const explorerIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startAutoAdvance();
            else stopAutoAdvance();
          });
        },
        { threshold: 0.5 }
      );
      if (explorerSection) explorerIo.observe(explorerSection);
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
})();
