# Sirius Ascent

Marketing website for Sirius Ascent — a Pretoria-based web design, development,
SEO and Google Business Profile management agency. Static HTML/CSS/JS, no
build step, deployed via GitHub Pages (see `CNAME`).

## Structure

```
index.html / about.html / services.html / portfolio.html   Pages
robots.txt, sitemap.xml, manifest.json, browserconfig.xml   SEO / PWA metadata
favicon/                                                     Favicon set (all sizes)

assets/
  css/
    styles.css        Entry point — @imports the four files below
    variables.css      Design tokens (colour, type, spacing, motion)
    components.css       Base reset + every section/component's styling
    animations.css         Keyframes + the reveal-on-scroll / hero-entrance system
    responsive.css           Breakpoints only, loaded last
  js/
    main.js            Entry point — the only <script type="module"> tag per page
    utils.js            Shared values (e.g. prefers-reduced-motion)
    navigation.js         Header, mobile menu, floating enquiry button (FAB)
    animations.js          Hero particles/entrance, reveal-on-scroll, stat count-up
    portfolio.js            Before/after slider, showcase carousels, portfolio filters
    forms.js                 Dropdowns, enquiry wizard, cost estimator, audit lead form
    testimonials.js           Reserved for future testimonial-specific controls
  images/
    branding/, hero/, portfolio/, team/, icons/, backgrounds/
  videos/
  documents/
```

Each page includes its own copy of the header/footer/FAB markup (no server-side
templating), so navigation/footer edits need to be applied per page.

## Notes

- `assets/js/*.js` are native ES modules — serve over HTTP (GitHub Pages, or a
  local dev server) rather than opening `index.html` directly via `file://`,
  or module imports will be blocked by the browser.
- `assets/images/backgrounds/` and the extra screenshots under
  `assets/images/portfolio/{jacques-auto,revline-panel-beaters}/` aren't wired
  into any page yet — see project notes for what's pending.
