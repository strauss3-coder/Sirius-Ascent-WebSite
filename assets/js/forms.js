/* =========================================================
   Sirius Ascent — forms
   Custom dropdowns, the enquiry wizard (-> WhatsApp), the
   website cost estimator, and the free website audit lead form.
   None of these have a real backend — see each section's own
   comment for why that's a deliberate choice, not an oversight.
   ========================================================= */

import { reduceMotion } from "./utils.js";

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
    challenge: "What You Need",
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

I'd like to enquire about a project.

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

What I Need:
${get("challenge")}

Timeline:
${get("timeline")}${notes ? `\n\nAdditional Notes:\n${notes}` : ""}

I'm looking forward to discussing how Sirius Ascent can help my business grow online.

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

/* ---- Website Cost Estimator ----
   Pure client-side, rough-range calculator — there's no backend to price
   a project properly, so this is deliberately framed as a starting
   estimate, not a quote. Recomputes on every change; no submit step. */
const estimator = document.querySelector("[data-estimator]");
if (estimator) {
  const output = estimator.querySelector("[data-estimator-output]");
  // Pricing tuned for a growing premium agency: a minimum website lands at
  // R4,500, most business sites fall in the R4,500–R7,000 band, and only
  // stacking several optional features (or a rush timeline) pushes a project
  // meaningfully above that.
  const MIN_PRICE = 4500;
  const TYPE_BASE = { landing: 4500, business: 5000 };
  const PAGES_ADD = { "1-3": 0, "4-7": 1000, "8+": 2500 };
  const FEATURE_ADD = { booking: 900, animations: 800, seo: 700, gbp: 500 };

  const formatRand = (n) => `R ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  const round500 = (n) => Math.round(n / 500) * 500;

  const recalc = () => {
    const type = estimator.querySelector('input[name="est-type"]:checked').value;
    const pages = estimator.querySelector('input[name="est-pages"]:checked').value;
    const timeline = estimator.querySelector('input[name="est-timeline"]:checked').value;
    const features = Array.from(estimator.querySelectorAll('input[name="est-feature"]:checked')).map((f) => f.value);

    let total = (TYPE_BASE[type] || MIN_PRICE) + (PAGES_ADD[pages] || 0);
    features.forEach((f) => { total += FEATURE_ADD[f] || 0; });
    if (timeline === "rush") total *= 1.1;

    const low = Math.max(MIN_PRICE, round500(total * 0.92));
    let high = round500(total * 1.12);
    if (high <= low) high = low + 500;
    output.innerHTML = `${formatRand(low)} – <span>${formatRand(high)}</span>`;
  };

  estimator.addEventListener("change", recalc);
  recalc();
}

/* ---- Free Website Audit lead form ----
   No backend and no cross-origin way to actually fetch/analyse a
   visitor's site from a static page, so this is a lead-capture form —
   it hands off to a real, human review over WhatsApp rather than
   pretending to run an instant automated audit. */
const freeAuditForm = document.querySelector("[data-free-audit-form]");
if (freeAuditForm) {
  freeAuditForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = freeAuditForm.querySelector('[name="site-url"]').value.trim();
    const name = freeAuditForm.querySelector('[name="audit-name"]').value.trim();
    const phone = freeAuditForm.querySelector('[name="audit-phone"]').value.trim();
    if (!url || !name || !phone) return;

    const message = `Hi Sirius Ascent,

I'd like a free review of my current website.

Name:
${name}

Website URL:
${url}

Phone:
${phone}

Please take a look and let me know what could be improved.

Thank you.`;

    window.open(`https://wa.me/27816614559?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    freeAuditForm.reset();
  });
}
