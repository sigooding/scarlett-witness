const j = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
const hits = {};
(function w(v, p) {
  if (typeof v === "string") {
    if (v.startsWith("data:")) {
      const k = p.replace(/\[\d+\]/g, "[]").replace(/\.nw_[a-z0-9_]+/g, ".<id>");
      hits[k] ??= { n: 0, mb: 0 };
      hits[k].n++;
      hits[k].mb += v.length / 1e6;
    }
    return;
  }
  if (Array.isArray(v)) v.forEach((x, i) => w(x, p + "[" + i + "]"));
  else if (v && typeof v === "object") for (const k in v) w(v[k], p + "." + k);
})(j, "");
console.table(hits);