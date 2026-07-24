/* Small magic: the details that make the observatory feel alive and personal.
   - "Welcome back, explorer." for returning visitors (localStorage).
   - The Observatory Log: how many systems you've discovered this session. */
export function initMagic() {
  // ---- Returning from a transmission (e.g. WhatsApp hand-off) ----
  // Takes priority over the welcome-back so the visitor knows the signal landed.
  let showedReturn = false;
  try {
    const sent = Number(sessionStorage.getItem("sa-tx-sent")) || 0;
    const note = document.querySelector("[data-return-note]");
    if (sent && Date.now() - sent < 15 * 60 * 1000 && note) {
      sessionStorage.removeItem("sa-tx-sent");
      showedReturn = true;
      setTimeout(() => {
        note.hidden = false;
        requestAnimationFrame(() => note.classList.add("in"));
        setTimeout(() => note.classList.remove("in"), 7000);
      }, 1200);
    }
  } catch (e) {}

  // ---- Welcome back ----
  const wb = document.querySelector("[data-welcome]");
  try {
    if (!showedReturn && localStorage.getItem("sa-visited") && wb) {
      setTimeout(() => {
        wb.hidden = false;
        requestAnimationFrame(() => wb.classList.add("in"));
        setTimeout(() => wb.classList.remove("in"), 5200);
      }, 4600);
    }
    localStorage.setItem("sa-visited", String(Date.now()));
  } catch (e) { /* private mode — no memory, no harm */ }

  // ---- Observatory Log ----
  const readout = document.querySelector("[data-log]");
  const total = 10;
  let explored;
  try { explored = new Set(JSON.parse(sessionStorage.getItem("sa-explored") || "[]")); }
  catch (e) { explored = new Set(); }

  function render() {
    if (!readout) return;
    readout.textContent = "Systems explored · " + explored.size + " / " + total;
    readout.classList.toggle("show", explored.size > 0);
  }

  window.__markExplored = function (slug) {
    if (!slug || explored.has(slug)) return;
    explored.add(slug);
    try { sessionStorage.setItem("sa-explored", JSON.stringify(Array.prototype.slice.call(explored))); } catch (e) {}
    render();
    if (readout) {
      readout.classList.add("pulse");
      setTimeout(() => readout.classList.remove("pulse"), 700);
    }
  };
  render();
}
