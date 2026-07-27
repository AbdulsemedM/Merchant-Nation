import fs from "fs";
import path from "path";

const raw = fs.readFileSync(
  "d:/Coop/merchant_nation/coop/scripts/landing-extract/styles.css",
  "utf8"
);

let css = raw
  .replace(/^  /gm, "")
  .replace(/:root\s*\{/g, ".landing-page {")
  .replace(/^html\{scroll-behavior:smooth;\}/m, ".landing-page { scroll-behavior: smooth; }")
  .replace(
    /^body\{([^}]+)\}/m,
    ".landing-page {\n  $1\n}"
  );

// Merge duplicate .landing-page blocks by keeping as-is (scroll-behavior adds to first block)
// Prefix bare element selectors
const prefixSelectors = [
  ["^img\\{", ".landing-page img{"],
  ["^a\\{", ".landing-page a{"],
  ["^section\\{", ".landing-page section{"],
  ["^footer\\{", ".landing-page footer{"],
  ["^h1,h2,h3\\{", ".landing-page h1,.landing-page h2,.landing-page h3{"],
  ["^::selection\\{", ".landing-page ::selection{"],
];

for (const [from, to] of prefixSelectors) {
  css = css.replace(new RegExp(from, "m"), to);
}

// Scope ID selectors under landing-page for specificity over app globals
css = css.replace(/^(#nav|#hero|#operation|#terminal|#command|#advancement|#deploy)\{/gm, ".landing-page $1 {");

const outPath = "d:/Coop/merchant_nation/coop/src/components/landing/landing.css";
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, css);
console.log("Wrote", outPath, css.length);
