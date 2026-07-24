/* FIRST CONTACT — the transmission console.
   Not a modal: activating the beacon powers the observatory down and the whole
   interface becomes a deep-space communication console. Questions arrive one at
   a time; each answer is confirmed; then the answers compress into light and
   launch as a beam. Fully keyboard-operable, focus-trapped, Escape aborts.
   Returns the visitor exactly where they left the journey. */
export function initConsole() {
  const el = document.getElementById("console");
  const opener = document.querySelector("[data-console-open]");
  if (!el || !opener) return;

  const statusEl = el.querySelector("[data-console-status]");
  const stageEl = el.querySelector("[data-console-stage]");
  const starEl = el.querySelector(".console__star");
  const closeBtn = el.querySelector("[data-console-close]");
  const noMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stages = [
    { key: "identity", kind: "text", status: "Who is initiating this transmission?", placeholder: "Your name", auto: "name", confirm: "Identity confirmed" },
    { key: "origin", kind: "text", status: "Origin system?", placeholder: "The business you represent", auto: "organization", confirm: "Origin logged" },
    { key: "objective", kind: "cards", status: "Mission objective?", options: ["Launch a new website", "Redesign an existing platform", "Build a web application", "Create a digital brand", "Something completely unique"], confirm: "Objective set" },
    { key: "log", kind: "textarea", status: "Mission log", placeholder: "Tell the story of what you're building…", confirm: "Log recorded" },
    { key: "channel", kind: "channel", status: "Communication channel?", confirm: "Channel open" },
  ];
  const answers = {};
  let idx = 0;
  let lastFocus = null;

  // WhatsApp hand-off — opened inside the final click gesture (no popup block)
  const WA_NUMBER = "27816614559";
  function openWhatsApp() {
    const lines = [
      "✦ New transmission — Sirius Ascent",
      "",
      "Name: " + (answers.identity || ""),
      "Business: " + (answers.origin || ""),
      "Objective: " + (answers.objective || ""),
      "Mission: " + (answers.log || ""),
      "Email: " + (answers.email || ""),
      answers.phone ? "Phone: " + answers.phone : "",
      "Preferred channel: " + (answers.method || ""),
    ].filter(Boolean).join("\n");
    try {
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines), "_blank", "noopener");
    } catch (e) { /* pop-up blocked — the cinematic success still plays */ }
  }

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const wait = (ms) => new Promise((r) => setTimeout(r, noMotion ? Math.min(ms, 120) : ms));

  function setStatus(t) { statusEl.textContent = t; }

  function fieldTemplate(stage) {
    if (stage.kind === "text") {
      return '<label class="console__q" for="cInput">' + stage.status + '</label>' +
        '<input class="console__input" id="cInput" autocomplete="' + stage.auto + '" placeholder="' + stage.placeholder + '" />' +
        controls();
    }
    if (stage.kind === "textarea") {
      return '<label class="console__q" for="cInput">' + stage.status + '</label>' +
        '<textarea class="console__input console__textarea" id="cInput" rows="4" placeholder="' + stage.placeholder + '"></textarea>' +
        controls();
    }
    if (stage.kind === "cards") {
      return '<p class="console__q" id="cLabel">' + stage.status + '</p>' +
        '<div class="console__cards" role="radiogroup" aria-labelledby="cLabel">' +
        stage.options.map((o, i) =>
          '<button type="button" class="console__card" role="radio" aria-checked="false" data-card="' + i + '"><span class="console__card-mark">○</span>' + o + '</button>',
        ).join("") + '</div>' + controls(true);
    }
    // channel
    return '<p class="console__q" id="cLabel">' + stage.status + '</p>' +
      '<div class="console__channel">' +
      '<input class="console__input" id="cEmail" type="email" autocomplete="email" placeholder="Signal address (email)" />' +
      '<input class="console__input" id="cPhone" type="tel" autocomplete="tel" placeholder="Direct frequency (phone, optional)" />' +
      '<div class="console__methods" role="radiogroup" aria-label="Preferred channel">' +
      ["Email", "Phone", "WhatsApp"].map((m, i) =>
        '<button type="button" class="console__method" role="radio" aria-checked="' + (i === 0) + '" data-method="' + m + '">' + m + '</button>',
      ).join("") + '</div></div>' + controls();
  }

  function controls(hideDefault) {
    return '<div class="console__ctrl">' +
      '<p class="console__err mono" data-console-err hidden>The channel needs this to continue.</p>' +
      '<button type="button" class="console__next" data-console-next' + (hideDefault ? " disabled" : "") + '>Transmit ↵</button>' +
      '</div>';
  }

  function renderStage(i) {
    const s = stages[i];
    setStatus("Transmission · " + (i + 1) + " of " + stages.length);
    stageEl.innerHTML = fieldTemplate(s);
    stageEl.classList.remove("is-in");
    requestAnimationFrame(() => stageEl.classList.add("is-in"));

    const nextBtn = stageEl.querySelector("[data-console-next]");
    const err = stageEl.querySelector("[data-console-err]");
    const clearErr = () => { if (err) err.hidden = true; };

    if (s.kind === "text" || s.kind === "textarea") {
      const input = stageEl.querySelector("#cInput");
      requestAnimationFrame(() => input.focus());
      input.addEventListener("input", clearErr);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !(s.kind === "textarea" && e.shiftKey)) { e.preventDefault(); attempt(); }
      });
      nextBtn.addEventListener("click", attempt);
      function attempt() {
        const v = input.value.trim();
        if (!v) return fail(err);
        answers[s.key] = v; advance();
      }
    } else if (s.kind === "cards") {
      let sel = -1;
      const cards = Array.prototype.slice.call(stageEl.querySelectorAll("[data-card]"));
      cards.forEach((c) => c.addEventListener("click", () => {
        sel = +c.dataset.card;
        cards.forEach((x) => { x.setAttribute("aria-checked", x === c); x.querySelector(".console__card-mark").textContent = x === c ? "◉" : "○"; });
        nextBtn.disabled = false; clearErr();
      }));
      nextBtn.addEventListener("click", () => {
        if (sel < 0) return fail(err);
        answers[s.key] = s.options[sel]; advance();
      });
    } else {
      const email = stageEl.querySelector("#cEmail");
      const phone = stageEl.querySelector("#cPhone");
      let method = "Email";
      const methods = Array.prototype.slice.call(stageEl.querySelectorAll("[data-method]"));
      methods.forEach((m) => m.addEventListener("click", () => {
        method = m.dataset.method;
        methods.forEach((x) => x.setAttribute("aria-checked", x === m));
      }));
      email.addEventListener("input", clearErr);
      requestAnimationFrame(() => email.focus());
      nextBtn.addEventListener("click", attempt);
      email.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); attempt(); } });
      function attempt() {
        if (!emailOk(email.value.trim())) return fail(err);
        answers.email = email.value.trim(); answers.phone = phone.value.trim(); answers.method = method;
        openWhatsApp(); // still in the click gesture → not blocked
        advance();
      }
    }
  }

  function fail(err) {
    if (err) err.hidden = false;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 400);
  }

  async function advance() {
    const s = stages[idx];
    dispatchEvent(new CustomEvent("sa:pulse"));
    stageEl.classList.remove("is-in");
    setStatus("✓ " + s.confirm);
    await wait(650);
    idx += 1;
    if (idx < stages.length) renderStage(idx);
    else transmit();
  }

  async function transmit() {
    stageEl.innerHTML = "";
    el.classList.add("is-transmitting");
    setStatus("Compressing transmission…");
    // answers become particles that converge on the star
    const field = document.createElement("div");
    field.className = "console__particles";
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("i");
      p.style.setProperty("--tx", (Math.random() * 200 - 100).toFixed(0) + "px");
      p.style.setProperty("--ty", (Math.random() * 200 - 100).toFixed(0) + "px");
      p.style.animationDelay = (Math.random() * 0.4).toFixed(2) + "s";
      field.appendChild(p);
    }
    stageEl.appendChild(field);
    await wait(1100);
    setStatus("Charging…");
    el.classList.add("is-charged");
    await wait(900);
    setStatus("Launching signal…");
    el.classList.add("is-launched");
    dispatchEvent(new CustomEvent("sa:transmit"));
    await wait(1400);
    el.classList.remove("is-transmitting", "is-charged", "is-launched");
    setStatus("");
    stageEl.innerHTML =
      '<div class="console__success">' +
      '<p class="console__success-t">Signal successfully transmitted.</p>' +
      '<p class="console__success-b mono">Expected response window · 24–48 hours</p>' +
      '<button type="button" class="console__return" data-console-close>Return to the observatory</button>' +
      '</div>';
    const ret = stageEl.querySelector("[data-console-close]");
    ret.addEventListener("click", close);
    ret.setAttribute("tabindex", "0");
    requestAnimationFrame(() => ret.focus());
  }

  async function open() {
    lastFocus = document.activeElement;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("console-open");
    requestAnimationFrame(() => el.classList.add("is-open"));
    setStatus("Powering down the observatory…");
    await wait(900);
    setStatus("· · ·");
    await wait(700);
    setStatus("Connection established");
    el.classList.add("is-live");
    await wait(700);
    idx = 0;
    renderStage(0);
  }

  function close() {
    el.classList.remove("is-open", "is-live");
    document.body.classList.remove("console-open");
    setTimeout(() => {
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
      el.classList.remove("is-transmitting", "is-charged", "is-launched");
      stageEl.innerHTML = "";
      idx = 0;
      for (const k in answers) delete answers[k];
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 700);
  }

  opener.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = el.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex="0"]');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
