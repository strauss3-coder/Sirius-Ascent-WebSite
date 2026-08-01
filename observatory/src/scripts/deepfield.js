/* The Deep Field: three flagship systems resolving out of the dark.
   Lightweight: a scroll-in reveal on three CSS bodies (no image filters, so it
   stays smooth on mobile). Orbiting satellites + asteroid belts are pure CSS. */
export function initDeepField() {
  const systems = document.querySelectorAll("#deepfield .df-system");
  if (!systems.length) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    systems.forEach((s) => s.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
    { threshold: 0.35 },
  );
  systems.forEach((s) => io.observe(s));
}
