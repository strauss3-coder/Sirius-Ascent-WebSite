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

  /* ---- Custom dropdowns (Industry / biggest challenge / timeline) ----
     Standard ARIA listbox pattern: the trigger button owns aria-expanded,
     the menu owns aria-activedescendant pointing at whichever option is
     currently highlighted, and a hidden input carries the actual value
     since role="listbox" isn't a real form control the browser submits. */
  const closeAllDropdowns = (except) => {
    document.querySelectorAll(".dropdown.is-open").forEach((d) => {
      if (d !== except) d.dispatchEvent(new CustomEvent("dropdown:close"));
    });
  };

  document.querySelectorAll("[data-dropdown]").forEach((dropdown) => {
    const trigger = dropdown.querySelector("[data-dropdown-trigger]");
    const menu = dropdown.querySelector("[data-dropdown-menu]");
    const valueEl = dropdown.querySelector("[data-dropdown-value]");
    const input = dropdown.querySelector("[data-dropdown-input]");
    const options = Array.from(menu.querySelectorAll('[role="option"]'));
    let activeIndex = -1;

    trigger.setAttribute("data-placeholder", "");

    options.forEach((opt) => {
      const check = document.createElement("span");
      check.className = "dropdown__check";
      check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>';
      opt.appendChild(check);
    });

    const highlight = (i) => {
      options.forEach((o, oi) => o.classList.toggle("is-highlighted", oi === i));
      if (options[i]) menu.setAttribute("aria-activedescendant", options[i].id);
    };

    const close = () => {
      dropdown.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };
    dropdown.addEventListener("dropdown:close", close);

    const open = () => {
      closeAllDropdowns(dropdown);
      dropdown.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      const selected = options.findIndex((o) => o.getAttribute("aria-selected") === "true");
      activeIndex = selected >= 0 ? selected : 0;
      highlight(activeIndex);
      menu.focus({ preventScroll: true });
    };

    const select = (i) => {
      options.forEach((o) => o.removeAttribute("aria-selected"));
      const opt = options[i];
      opt.setAttribute("aria-selected", "true");
      valueEl.textContent = opt.dataset.value;
      trigger.removeAttribute("data-placeholder");
      input.value = opt.dataset.value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      trigger.focus();
    };

    trigger.addEventListener("click", () => {
      if (dropdown.classList.contains("is-open")) close();
      else open();
    });

    trigger.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        open();
      }
    });

    menu.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(options.length - 1, activeIndex + 1);
        highlight(activeIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        highlight(activeIndex);
      } else if (e.key === "Home") {
        e.preventDefault();
        activeIndex = 0;
        highlight(activeIndex);
      } else if (e.key === "End") {
        e.preventDefault();
        activeIndex = options.length - 1;
        highlight(activeIndex);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (activeIndex >= 0) select(activeIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
        trigger.focus();
      } else if (e.key === "Tab") {
        close();
      }
    });

    options.forEach((opt, i) => {
      opt.addEventListener("click", () => select(i));
      opt.addEventListener("mouseenter", () => {
        activeIndex = i;
        highlight(i);
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-dropdown]")) closeAllDropdowns();
  });

  /* ---- Enquiry wizard -> WhatsApp ----
     One question per step inside a floating card. Steps stay in the DOM
     at all times (never `display: none` mid-transition, same reasoning
     as the dropdown menus) so the slide/fade/scale can animate both
     directions. The form never had a real backend (action="#" was
     removed entirely), so the final step builds a pre-filled WhatsApp
     message and opens wa.me, which resolves to the app on mobile and
     WhatsApp Web on desktop with no branching needed. */
  const wizard = document.querySelector("[data-wizard]");
  if (wizard) {
    const WHATSAPP_NUMBER = "27816614559";
    const bar = wizard.querySelector("[data-wizard-bar-fill]");
    const count = wizard.querySelector("[data-wizard-count]");
    const prevBtn = wizard.querySelector("[data-wizard-prev]");
    const nextBtn = wizard.querySelector("[data-wizard-next]");
    const startBtn = wizard.querySelector("[data-wizard-start]");
    const summaryDl = wizard.querySelector("[data-wizard-summary]");
    const successEl = wizard.querySelector("[data-wizard-success]");
    const steps = Array.from(wizard.querySelectorAll(".wizard__step"));
    const fieldSteps = steps.filter((el) => el.hasAttribute("data-field-step"));
    const prevDefaultHTML = prevBtn.innerHTML;
    const nextDefaultHTML = nextBtn.innerHTML;
    let index = 0;

    const SUMMARY_LABELS = {
      name: "Name",
      business: "Business",
      phone: "Phone",
      location: "Location",
      industry: "Business Type",
      challenge: "Biggest Challenge",
      timeline: "Timeline",
      notes: "Additional Notes",
    };

    const fieldOf = (step) => step.querySelector("[data-wizard-field]");
    const invalidElOf = (step) => {
      const field = fieldOf(step);
      return field.closest(".dropdown") || field;
    };
    const errorElOf = (step) => step.querySelector("[data-field-error]");
    const focusTargetOf = (step) => {
      const invalidEl = invalidElOf(step);
      return invalidEl.matches(".dropdown") ? invalidEl.querySelector(".dropdown__trigger") : invalidEl;
    };

    const updateProgress = () => {
      const step = steps[index];
      if (step.dataset.step === "welcome") {
        bar.style.width = "0%";
        count.textContent = "";
      } else if (step.dataset.step === "summary") {
        bar.style.width = "100%";
        count.textContent = "Almost done";
      } else {
        const fieldIndex = fieldSteps.indexOf(step);
        bar.style.width = `${((fieldIndex + 1) / fieldSteps.length) * 100}%`;
        count.textContent = `Step ${fieldIndex + 1} of ${fieldSteps.length}`;
      }
    };

    const pulseBar = () => {
      if (reduceMotion) return;
      bar.classList.add("is-pulsing");
      setTimeout(() => bar.classList.remove("is-pulsing"), 320);
    };

    const updateNav = () => {
      const stepName = steps[index].dataset.step;
      wizard.dataset.current = stepName;
      if (stepName === "summary") {
        prevBtn.className = "wizard__arrow wizard__arrow--edit";
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg><span>Edit</span>';
        nextBtn.className = "wizard__arrow wizard__arrow--send";
        nextBtn.innerHTML = '<span>Send via WhatsApp</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>';
      } else {
        prevBtn.className = "wizard__arrow wizard__arrow--prev";
        prevBtn.innerHTML = prevDefaultHTML;
        nextBtn.className = "wizard__arrow wizard__arrow--next";
        nextBtn.innerHTML = nextDefaultHTML;
      }
    };

    const populateSummary = () => {
      summaryDl.innerHTML = "";
      summaryDl.classList.remove("is-hidden");
      successEl.classList.remove("is-active");
      fieldSteps.forEach((step) => {
        const value = fieldOf(step).value.trim();
        if (!value) return;
        const row = document.createElement("div");
        row.className = "wizard__summary-row";
        row.innerHTML = `<dt>${SUMMARY_LABELS[step.dataset.step]}</dt><dd>${value.replace(/</g, "&lt;")}</dd>`;
        summaryDl.appendChild(row);
      });
    };

    const focusStep = (step) => {
      if (reduceMotion) {
        if (step.dataset.step !== "welcome" && step.dataset.step !== "summary") focusTargetOf(step).focus({ preventScroll: true });
        return;
      }
      setTimeout(() => {
        if (step.dataset.step !== "welcome" && step.dataset.step !== "summary") focusTargetOf(step).focus({ preventScroll: true });
      }, 260);
    };

    const goTo = (newIndex, direction) => {
      const oldEl = steps[index];
      const newEl = steps[newIndex];

      if (reduceMotion) {
        oldEl.classList.remove("is-active");
        newEl.classList.add("is-active");
      } else {
        const exitClass = direction > 0 ? "wizard__step--exit-left" : "wizard__step--exit-right";
        const enterClass = direction > 0 ? "wizard__step--enter-right" : "wizard__step--enter-left";
        oldEl.classList.add(exitClass);
        // setTimeout, not transitionend — transitionend is unreliable here (won't
        // fire at all if the property never visually changes, and can double-fire
        // across opacity+transform), so a timer matched to the CSS duration is
        // the more dependable way to know the exit animation is done.
        setTimeout(() => oldEl.classList.remove("is-active", "wizard__step--exit-left", "wizard__step--exit-right"), 230);
        newEl.classList.add("is-active", enterClass);
        newEl.getBoundingClientRect();
        requestAnimationFrame(() => newEl.classList.remove(enterClass));
      }

      index = newIndex;
      updateProgress();
      updateNav();
      if (newEl.dataset.step === "summary") populateSummary();
      focusStep(newEl);
    };

    const validateStep = (step) => {
      if (!step.hasAttribute("data-required")) return true;
      const field = fieldOf(step);
      if (field.value.trim()) return true;

      const invalidEl = invalidElOf(step);
      const errorEl = errorElOf(step);
      invalidEl.classList.add("is-invalid");
      errorEl.classList.add("is-visible");
      if (!reduceMotion) {
        invalidEl.classList.add("is-shake");
        invalidEl.addEventListener("animationend", () => invalidEl.classList.remove("is-shake"), { once: true });
      }
      focusTargetOf(step).focus({ preventScroll: true });
      return false;
    };

    fieldSteps.forEach((step) => {
      if (!step.hasAttribute("data-required")) return;
      const field = fieldOf(step);
      const eventName = field.tagName === "INPUT" && field.type === "hidden" ? "change" : "input";
      field.addEventListener(eventName, () => {
        if (field.value.trim()) {
          invalidElOf(step).classList.remove("is-invalid");
          errorElOf(step).classList.remove("is-visible");
        }
      });
      if (field.tagName === "INPUT" && field.type !== "hidden") {
        field.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            nextBtn.click();
          }
        });
      }
    });

    startBtn.addEventListener("click", () => goTo(index + 1, 1));

    prevBtn.addEventListener("click", () => {
      if (index > 0) goTo(index - 1, -1);
    });

    nextBtn.addEventListener("click", () => {
      const step = steps[index];

      if (step.dataset.step === "summary") {
        const invalidStep = fieldSteps.find((s) => !validateStep(s));
        if (invalidStep) {
          goTo(steps.indexOf(invalidStep), -1);
          return;
        }
        summaryDl.classList.add("is-hidden");
        successEl.classList.add("is-active");

        const get = (name) => wizard.querySelector(`[name="${name}"]`).value.trim();
        const notes = get("notes");
        const message = `Hi Sirius Ascent,

I'd like to enquire about improving my online presence.

Name:
${get("name")}

Business:
${get("business")}

Phone:
${get("phone")}

Business Location:
${get("location")}

Business Type:
${get("industry")}

Biggest Challenge:
${get("challenge")}

Timeline:
${get("timeline")}${notes ? `\n\nAdditional Notes:\n${notes}` : ""}

I'm looking forward to discussing how Sirius Ascent can help my business become the obvious choice.

Thank you.`;

        setTimeout(() => {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
        }, reduceMotion ? 0 : 650);
        return;
      }

      if (!validateStep(step)) return;
      pulseBar();
      goTo(index + 1, 1);
    });

    wizard.dataset.current = "welcome";
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
