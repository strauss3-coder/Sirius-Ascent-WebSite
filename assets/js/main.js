/* =========================================================
   Sirius Ascent — entry point
   The only <script type="module"> tag loaded by each page.
   Every imported module wires up its own DOM queries and no-ops
   safely if its markup isn't present on the current page, so
   the same main.js works unmodified across all four pages.
   ========================================================= */

import "./intro.js";
import "./navigation.js";
import "./animations.js";
import "./portfolio.js";
import "./forms.js";
import "./testimonials.js";

document.documentElement.classList.remove("no-js");
