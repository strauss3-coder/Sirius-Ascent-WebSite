// Canonical content-side data for the observatory. The canvas engine keeps its
// own layout coordinates; this is the source of truth for portfolio listings,
// case-study links and structured data. Keep names in sync with the engine.

/** @typedef {"risen"|"plotted"} Status  risen = live on its own domain; plotted = demo */

export const projects = [
  {
    slug: "supreme-auto",
    name: "Supreme Auto",
    designation: "α",
    industry: "Automotive",
    status: "risen",
    url: "https://supremeautonorth.co.za",
    magnitude: -1.4,
  },
  {
    slug: "venom-racing",
    name: "Venom Racing",
    designation: "β",
    industry: "Automotive",
    status: "risen",
    url: "https://venomracing.co.za",
    magnitude: -1.1,
  },
  {
    slug: "rhinos-pool-club",
    name: "Rhino's Pool Club",
    designation: "ζ",
    industry: "Leisure",
    status: "plotted",
    magnitude: 1.5,
  },
  {
    slug: "the-view-lodge",
    name: "The View Lodge",
    designation: "δ",
    industry: "Hospitality",
    status: "plotted",
    magnitude: 1.5,
  },
  {
    slug: "bankenveld",
    name: "Bankenveld Golf Estate",
    designation: "γ",
    industry: "Hospitality",
    status: "plotted",
    magnitude: 1.5,
  },
  {
    slug: "riverview-padel",
    name: "Riverview Padel",
    designation: "ε",
    industry: "Leisure",
    status: "plotted",
    magnitude: 1.4,
  },
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
