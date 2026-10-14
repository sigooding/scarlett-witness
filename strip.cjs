const fs = require("fs");
const j = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const kinds = {};
for (const a of j.assets || []) {
  const k = (a.kind || a.type || (a.dataUrl || "").slice(5, (a.dataUrl || "").indexOf(";")) || "?");
  kinds[k] = (kinds[k] || 0) + 1;
}
console.log("asset kinds:", kinds);
console.log("sample entries:");
for (const a of (j.assets || []).slice(0, 5)) {
  const { dataUrl, ...rest } = a;
  console.log(JSON.stringify(rest));
}
console.log("top-level keys:", Object.keys(j));
for (const a of j.assets || []) delete a.dataUrl;
const out = process.argv[2].replace(/\.json$/, "") + ".nodata.json";
fs.writeFileSync(out, JSON.stringify(j));
console.log("wrote", out, (fs.statSync(out).size / 1e6).toFixed(2) + " MB");