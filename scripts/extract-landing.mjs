import fs from "fs";
import path from "path";

const html = fs.readFileSync("d:/Coop/merchant_nation/coop/.tmp-landing.html", "utf8");
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const bodyMatch = html.match(/<body>([\s\S]*?)<script>/);
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);

const outDir = "d:/Coop/merchant_nation/coop/scripts/landing-extract";
fs.mkdirSync(outDir, { recursive: true });

if (styleMatch) fs.writeFileSync(path.join(outDir, "styles.css"), styleMatch[1]);
if (bodyMatch) fs.writeFileSync(path.join(outDir, "body.html"), bodyMatch[1]);
if (scriptMatch) fs.writeFileSync(path.join(outDir, "script.js"), scriptMatch[1]);

const imgDir = "d:/Coop/merchant_nation/coop/public/images/landing";
fs.mkdirSync(imgDir, { recursive: true });

let bodyHtml = bodyMatch ? bodyMatch[1] : "";
const imgs = [...html.matchAll(/src="(data:image\/[^;]+;base64,[^"]+)"/g)];
console.log("images", imgs.length);

imgs.forEach((m, i) => {
  const full = m[1];
  const mime = full.match(/^data:(image\/[^;]+);base64,/)[1];
  const ext = mime.split("/")[1].replace("jpeg", "jpg");
  const filename = `img-${i}.${ext}`;
  const data = Buffer.from(full.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
  fs.writeFileSync(path.join(imgDir, filename), data);
  bodyHtml = bodyHtml.replace(full, `/images/landing/${filename}`);
  console.log("saved", filename, data.length);
});

fs.writeFileSync(path.join(outDir, "body-with-images.html"), bodyHtml);
console.log("done");
