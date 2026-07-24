// Canonical content-side data for the observatory. The canvas engine keeps its
// own layout coordinates; this is the source of truth for portfolio listings,
// case-study links and structured data. Keep names in sync with the engine.

/** @typedef {"risen"|"plotted"} Status  risen = live on its own domain; plotted = demo */

// Order = the order the star travels to them in the constellation.
export const projects = [
  { slug: "supreme-auto", name: "Supreme Auto", designation: "α", industry: "Automotive", status: "risen", url: "https://supremeautonorth.co.za", magnitude: -1.4 },
  { slug: "venom-racing", name: "Venom Racing", designation: "β", industry: "Automotive", status: "risen", url: "https://venomracing.co.za/", magnitude: -1.1 },
  { slug: "riverside-padel", name: "Riverside Padel", designation: "γ", industry: "Leisure", status: "plotted", url: "https://strauss3-coder.github.io/riverside-padel-website/", magnitude: 1.5 },
  { slug: "rhinos-pool-club", name: "Rhino's Pool Club", designation: "δ", industry: "Leisure", status: "plotted", url: "https://strauss3-coder.github.io/rhinos-pool-club/", magnitude: 1.5 },
  { slug: "xtreme-bikes", name: "Xtreme Bikes", designation: "ε", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/xtreme-bikes-website/", magnitude: 1.4 },
  { slug: "revline-panel-beating", name: "Revline Panel Beating", designation: "ζ", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/revline-panelbeating-website/", magnitude: 1.5 },
  { slug: "the-view-lodge", name: "The View Lodge", designation: "η", industry: "Hospitality", status: "plotted", url: "https://strauss3-coder.github.io/the-view-lodge/", magnitude: 1.5 },
  { slug: "bankenveld", name: "Bankenveld", designation: "θ", industry: "Hospitality", status: "plotted", url: "https://strauss3-coder.github.io/bankenveld-demo/index.html", magnitude: 1.4 },
  { slug: "crossfit-indefinite", name: "CrossFit Indefinite", designation: "ι", industry: "Fitness", status: "plotted", url: "https://strauss3-coder.github.io/crossfit-indefinite/", magnitude: 1.4 },
  { slug: "smallies-car-wash", name: "Smallie's Car Wash", designation: "κ", industry: "Automotive", status: "plotted", url: "https://strauss3-coder.github.io/smallies-car-wash/", magnitude: 1.4 },
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
