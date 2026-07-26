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

  let lastW = -1;
  addEventListener("scroll", onScroll, { passive: true });
  // only re-position waypoints on a real width/orientation change — an
  // address-bar height toggle just moves the ship (via onScroll), never the layout
  addEventListener("resize", () => {
    if (innerWidth === lastW) { onScroll(); return; }
    lastW = innerWidth; layout(); onScroll();
  }, { passive: true });
  addEventListener("orientationchange", () => { lastW = -1; setTimeout(() => { lastW = innerWidth; layout(); onScroll(); }, 180); });
  // position once layout settles (fonts/sections), then keep in sync
  requestAnimationFrame(() => { lastW = innerWidth; layout(); onScroll(); });
  setTimeout(() => { layout(); onScroll(); }, 1600);
}
