/* The Deep Field — the work is discovered, not displayed.
   Each project arrives as an unresolved smudge: blurred, colourless, noisy.
   As the visitor scrolls it to the centre of the field it RESOLVES — the
   telescope focuses, colour returns, noise clears, and the telemetry decodes
   from static into the real designation. Scroll-driven; one resolve at a time. */
export function initDeepField() {
  const section = document.getElementById("deepfield");
  if (!section) return;
  const fields = Array.prototype.slice.call(section.querySelectorAll(".df-field"));
  const noMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789/<>#*+=".split("");

  fields.forEach((f) => {
    const dec = f.querySelector("[data-df-decode]");
    if (dec) dec.dataset.full = dec.textContent.trim();
    f._decoded = false;
  });

  function decode(el) {
    const full = el.dataset.full || el.textContent;
    let i = 0;
    clearInterval(el._iv);
    el._iv = setInterval(() => {
      i += 1;
      let out = "";
      for (let k = 0; k < full.length; k++) {
        if (k < i || full[k] === " ") out += full[k];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (i >= full.length) { clearInterval(el._iv); el.textContent = full; }
    }, 26);
  }

  function loop() {
    const vh = innerHeight, mid = vh / 2;
    for (const f of fields) {
      const r = f.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue; // skip far offscreen
      const c = r.top + r.height / 2;
      let focus = 1 - Math.min(1, Math.abs(c - mid) / (vh * 0.5));
      if (focus < 0) focus = 0;
      const e = noMotion ? 1 : focus;

      const img = f.querySelector(".df-shot");
      if (img) {
        const blur = (1 - e) * 18;
        img.style.filter =
          "blur(" + blur.toFixed(1) + "px) grayscale(" + (1 - e).toFixed(2) +
          ") brightness(" + (0.5 + e * 0.5).toFixed(2) + ") contrast(" + (0.85 + e * 0.15).toFixed(2) + ")";
        img.style.opacity = (0.3 + e * 0.7).toFixed(2);
        img.style.transform = "scale(" + (1.07 - e * 0.07).toFixed(3) + ")";
      }
      const win = f.querySelector(".df-window");
      if (win) win.style.setProperty("--resolve", e.toFixed(3));
      const tele = f.querySelector(".df-tele");
      if (tele) {
        const te = Math.max(0, (e - 0.25) / 0.75);
        tele.style.opacity = te.toFixed(2);
        tele.style.transform = "translateY(" + ((1 - te) * 14).toFixed(1) + "px)";
      }
      if (!noMotion) {
        const dec = f.querySelector("[data-df-decode]");
        if (dec) {
          if (e > 0.55 && !f._decoded) {
            f._decoded = true;
            decode(dec);
            if (window.__markExplored) window.__markExplored(f.dataset.slug);
          } else if (e < 0.2 && f._decoded) { f._decoded = false; }
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
