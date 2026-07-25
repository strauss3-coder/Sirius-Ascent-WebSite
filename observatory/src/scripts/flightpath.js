/* The flight path — the craft travels the right-hand rail from launch (top) to
   first contact (bottom) as a smooth progress indicator, replacing the plain
   scrollbar. Section waypoints are positioned by their true scroll fraction, so
   the craft passes each one exactly as you reach that region of the journey. */
export function initFlightpath() {
  const rail = document.getElementById("prog");
  if (!rail) return;
  const ship = rail.querySelector("[data-ship]");
  const dots = Array.prototype.slice.call(rail.querySelectorAll("a[href^='#']"));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let target = 0, cur = 0, raf = 0;

  const maxScroll = () =>
    Math.max(1, document.documentElement.scrollHeight - innerHeight);

  function layout() {
    const max = maxScroll();
    dots.forEach((a) => {
      const el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      const frac = Math.min(1, Math.max(0, el.offsetTop / max));
      a.style.top = (frac * 100).toFixed(3) + "%";
    });
  }

  function tick() {
    cur += (target - cur) * (reduce ? 1 : 0.12);
    if (ship) ship.style.top = (cur * 100).toFixed(3) + "%";
    if (!reduce && Math.abs(target - cur) > 0.0004) raf = requestAnimationFrame(tick);
    else raf = 0;
  }

  function onScroll() {
    target = Math.min(1, Math.max(0, (window.scrollY || 0) / maxScroll()));
    if (!raf) raf = requestAnimationFrame(tick);
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { layout(); onScroll(); }, { passive: true });
  // position once layout settles (fonts/sections), then keep in sync
  requestAnimationFrame(() => { layout(); onScroll(); });
  setTimeout(() => { layout(); onScroll(); }, 1600);
}
