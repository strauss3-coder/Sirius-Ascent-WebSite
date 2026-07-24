// Canonical content-side data for the observatory. The canvas engine keeps its
// own layout coordinates; this is the source of truth for portfolio listings,
// case-study links and structured data. Keep names in sync with the engine.

/** @typedef {"risen"|"plotted"} Status  risen = live on its own domain; plotted = demo */

// Order = the order the star travels to them in the constellation.
// accent = the system's atmosphere colour; tempo = drift speed in seconds
// (lower = more energetic) — each project becomes its own star system.
export const projects = [
  { slug: "supreme-auto", name: "Supreme Auto", designation: "α", industry: "Automotive", status: "risen", url: "https://supremeautonorth.co.za", magnitude: -1.4, accent: "#cfe0ff", tempo: 10, system: "White dwarf · metallic dust" },
  { slug: "venom-racing", name: "Venom Racing", designation: "β", industry: "Automotive", status: "risen", url: "https://venomracing.co.za/", magnitude: -1.1, accent: "#ff5a4d", tempo: 6, system: "Red giant · high energy" },
  { slug: "riverside-padel", name: "Riverside Padel", designation: "γ", industry: "Leisure", status: "plotted", url: "https://strauss3-coder.github.io/riverside-padel-website/", magnitude: 1.5, accent: "#f0c46a", tempo: 12, system: "Golden dawn · warm drift" },
  { slug: "rhinos-pool-club", name: "Rhino's Pool Club", designation: "δ", industry: "Leisure", status: "plotted", url: "https://strauss3-coder.github.io/rhinos-pool-club/", magnitude: 1.5, accent: "#37c8e8", tempo: 16, system: "Blue binary · calm" },
  { slug: "xtreme-bikes", name: "Xtreme Bikes", designation: "ε", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/xtreme-bikes-website/", magnitude: 1.4, accent: "#ff7a2d", tempo: 7, system: "Ember flare · kinetic" },
  { slug: "revline-panel-beating", name: "Revline Panel Beating", designation: "ζ", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/revline-panelbeating-website/", magnitude: 1.5, accent: "#f0a23c", tempo: 10, system: "Amber forge · steady" },
  { slug: "the-view-lodge", name: "The View Lodge", designation: "η", industry: "Hospitality", status: "plotted", url: "https://strauss3-coder.github.io/the-view-lodge/", magnitude: 1.5, accent: "#d8b06a", tempo: 18, system: "Warm gold · serene" },
  { slug: "bankenveld", name: "Bankenveld", designation: "θ", industry: "Hospitality", status: "plotted", url: "https://strauss3-coder.github.io/bankenveld-demo/index.html", magnitude: 1.4, accent: "#8fb56a", tempo: 16, system: "Fairway green · composed" },
  { slug: "crossfit-indefinite", name: "CrossFit Indefinite", designation: "ι", industry: "Fitness", status: "plotted", url: "https://strauss3-coder.github.io/crossfit-indefinite/", magnitude: 1.4, accent: "#ff4d6d", tempo: 7, system: "Pulsar · high intensity" },
  { slug: "smallies-car-wash", name: "Smallie's Car Wash", designation: "κ", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/smallies-car-wash/", magnitude: 1.4, accent: "#45c6ff", tempo: 9, system: "Cyan clean · crisp" },
];

export const services = [
  "Web Design",
  "Development",
  "SEO",
  "Brand Identity",
  "Care & Management",
];

export const processStages = ["Discovery", "Design", "Build", "Launch", "Care"];

export const studio = {
  name: "Sirius Ascent",
  role: "Digital Architecture Studio",
  location: "Pretoria, South Africa",
  star: { designation: "α CMa", ra: "06ʰ 45ᵐ 08.9ˢ", dec: "−16° 42′ 58″", magnitude: -1.46, distanceLy: 8.6 },
};
