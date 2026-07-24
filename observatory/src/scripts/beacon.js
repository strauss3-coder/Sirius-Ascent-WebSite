/* The transmission beacon — the contact experience.
   Not a form: a deep-space communication sequence. One question at a time, each
   confirmed answer logged to the transmission, Sirius reacting to every pulse.
   Fully keyboard-operable; submit (Enter or button) advances, then sends. */
export function initBeacon() {
  const root = document.getElementById("tx");
  if (!root) return;

  const activateBtn = root.querySelector("[data-tx-activate]");
  const panel = root.querySelector("#txPanel");
  const stage = root.querySelector("[data-tx-stage]");
  const promptEl = root.querySelector("[data-tx-prompt]");
  const input = root.querySelector("[data-tx-input]");
  const errorEl = root.querySelector("[data-tx-error]");
  const log = root.querySelector("[data-tx-log]");
  const ready = root.querySelector("[data-tx-ready]");
  const done = root.querySelector("[data-tx-done]");
  const status = root.querySelector("[data-tx-status]");
  const signal = root.querySelector(".tx__signal");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const steps = [
    { key: "name", label: "Name", prompt: "My name is…", type: "text", auto: "name" },
    { key: "business", label: "Origin", prompt: "The business I represent…", type: "text", auto: "organization" },
    { key: "mission", label: "Mission", prompt: "The mission we're building…", type: "text", auto: "off" },
    { key: "email", label: "Return signal", prompt: "Reach me at…", type: "email", auto: "email" },
  ];
  const answers = {};
  let idx = 0;

  const pulse = () => dispatchEvent(new CustomEvent("sa:pulse"));
  const esc = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function setStep(i) {
    const s = steps[i];
    promptEl.textContent = s.prompt;
    input.value = "";
    input.type = s.type;
    input.setAttribute("autocomplete", s.auto);
    input.setAttribute("inputmode", s.type === "email" ? "email" : "text");
    errorEl.hidden = true;
    status.textContent = "Calibrating · " + (i + 1) + " / " + steps.length;
    requestAnimationFrame(() => input.focus());
  }

  const valid = (s, v) =>
    !!v.trim() && (s.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));

  function addLog(label, value) {
    const line = document.createElement("p");
    line.className = "tx__line" + (reduce ? " is-in" : "");
    line.innerHTML =
      '<span class="tx__line-k">' + label.toUpperCase() +
      '</span><span class="tx__line-v">' + esc(value) +
      '</span><span class="tx__line-ok" aria-hidden="true">✓ logged</span>';
    log.appendChild(line);
    if (!reduce) requestAnimationFrame(() => line.classList.add("is-in"));
  }

  function fillSignal(n) {
    if (!signal) return;
    Array.prototype.forEach.call(signal.querySelectorAll("i"), (bar, k) =>
      bar.classList.toggle("on", k < n),
    );
  }

  function commit() {
    const s = steps[idx];
    const v = input.value.trim();
    if (!valid(s, v)) {
      errorEl.hidden = false;
      root.classList.add("shake");
      setTimeout(() => root.classList.remove("shake"), 400);
      input.focus();
      return;
    }
    answers[s.key] = v;
    addLog(s.label, v);
    fillSignal(idx + 1);
    pulse();
    idx += 1;
    if (idx < steps.length) {
      setStep(idx);
    } else {
      stage.hidden = true;
      status.textContent = "Transmission ready";
      ready.hidden = false;
      const send = ready.querySelector("[type=submit]");
      requestAnimationFrame(() => send && send.focus());
    }
  }

  function send() {
    ready.hidden = true;
    done.hidden = false;
    status.textContent = "Signal sent";
    root.classList.add("is-sent");
    dispatchEvent(new CustomEvent("sa:transmit"));
    const t = done.querySelector(".tx__done-t");
    if (t) {
      t.setAttribute("tabindex", "-1");
      requestAnimationFrame(() => t.focus());
    }
  }

  activateBtn.addEventListener("click", () => {
    activateBtn.setAttribute("aria-expanded", "true");
    activateBtn.hidden = true;
    panel.hidden = false;
    root.classList.add("is-active");
    fillSignal(0);
    setStep(0);
    pulse();
  });

  input.addEventListener("input", () => { errorEl.hidden = true; });

  // one submit path: advance through the steps, then transmit
  panel.addEventListener("submit", (e) => {
    e.preventDefault();
    if (idx < steps.length) commit();
    else send();
  });
}
