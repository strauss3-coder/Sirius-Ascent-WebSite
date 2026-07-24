/* Inner-page ambient universe: a drifting star field with a persistent Sirius,
   so case studies still feel like they're inside the same sky. Lightweight —
   no docking/sections. Sirius sits toward a corner and holds its glow. */
export function initAmbient() {
  const cv = document.getElementById("ambient");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR, stars = [], mx = 0, my = 0, tx = 0, ty = 0;

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * DPR;
    H = cv.height = innerHeight * DPR;
    cv.style.width = innerWidth + "px";
    cv.style.height = innerHeight + "px";
    const n = Math.min(200, Math.floor((innerWidth * innerHeight) / 8000));
    stars = [];
    for (let i = 0; i < n; i++) stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1 + 0.25) * DPR,
      b: Math.random() * 0.5 + 0.15, tw: Math.random() * 6.28,
      sp: Math.random() * 0.9 + 0.3, depth: Math.random() * 0.6 + 0.2,
      blue: Math.random() > 0.85,
    });
    if (reduce) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
    ctx.globalCompositeOperation = "lighter";
    for (const s of stars) {
      const a = reduce ? s.b : s.b + Math.sin(t * 0.001 * s.sp + s.tw) * 0.26;
      if (a <= 0) continue;
      const ox = tx * s.depth * 12 * DPR, oy = ty * s.depth * 12 * DPR;
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, 7);
      ctx.fillStyle = s.blue ? "rgba(125,148,255," + a + ")" : "rgba(228,232,238," + a * 0.9 + ")";
      ctx.fill();
    }
    // Sirius — persistent, upper-right
    const sx = W * 0.82 + tx * 22 * DPR, sy = H * 0.22 + ty * 22 * DPR;
    const pulse = reduce ? 1 : 1 + Math.sin(t * 0.0016) * 0.1;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70 * DPR * pulse);
    g.addColorStop(0, "rgba(234,240,255,0.55)");
    g.addColorStop(0.25, "rgba(125,148,255,0.22)");
    g.addColorStop(1, "rgba(77,107,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, 70 * DPR * pulse, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath(); ctx.arc(sx, sy, 2.4 * DPR, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    if (!reduce) requestAnimationFrame(draw);
  }

  addEventListener("resize", resize, { passive: true });
  if (matchMedia("(pointer:fine)").matches && !reduce) {
    addEventListener("pointermove", (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  resize();
  if (!reduce) requestAnimationFrame(draw);
}
