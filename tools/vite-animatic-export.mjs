// The dev server's side of "🎞 Export animatic" (src/AnimaticExport.tsx): runs tools/export-animatic.mjs as a job,
// reports its progress and serves the finished files from exports/animatics/<job>/. Only under `npm run dev`; a static
// deploy has no server, so the dialog shows the command line instead. See docs/animatic-export.md.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ID = /^[a-z0-9_]{1,64}$/i;
const FILES = { "animatic.mp4": "video/mp4", "captions.srt": "application/x-subrip", "report.json": "application/json" };

export function animaticExportPlugin() {
  const jobs = new Map();
  const send = (res, status, body) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  const readBody = (req) => new Promise((done) => {
    let s = "";
    req.on("data", (d) => (s += d));
    req.on("end", () => {
      try { done(JSON.parse(s || "{}")); } catch { done(null); }
    });
  });
  const view = (j) => ({ id: j.id, status: j.status, options: j.options, progress: j.progress, report: j.report, error: j.error, startedAt: j.startedAt });

  return {
    name: "animatic-export",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      server.middlewares.use("/__animatic", async (req, res) => {
        const url = new URL(req.url ?? "/", "http://x");
        const parts = url.pathname.split("/").filter(Boolean);
        if (req.method === "GET" && parts[0] === "ping") return send(res, 200, { ok: true });
        if (req.method === "POST" && parts[0] === "jobs" && parts.length === 1) {
          const b = await readBody(req);
          if (!b || !ID.test(b.from ?? "") || (b.to && !ID.test(b.to))) return send(res, 422, { error: "Choose the scenes to export." });
          const size = ["1280x720", "1920x1080"].includes(b.size) ? b.size : "1280x720";
          const fps = [12, 24, 25, 30].includes(Number(b.fps)) ? Number(b.fps) : 24;
          const pace = Math.min(2, Math.max(0.5, Number(b.pace) || 1));
          const id = randomUUID();
          const out = join(root, "exports/animatics", id);
          mkdirSync(out, { recursive: true });
          const args = ["tools/export-animatic.mjs", "--from", b.from, ...(b.to ? ["--to", b.to] : []), "--size", size, "--fps", String(fps), "--pace", String(pace),
            "--out", out, "--url", `http://${req.headers.host}`, "--progress-json", ...(b.subtitles === false ? ["--no-subs"] : []), ...(b.descriptions === false ? ["--no-desc"] : [])];
          const child = spawn(process.execPath, args, { cwd: root, env: process.env });
          const job = { id, child, out, status: "running", options: { from: b.from, to: b.to ?? null, size, fps, pace, subtitles: b.subtitles !== false, descriptions: b.descriptions !== false }, progress: null, report: null, error: null, startedAt: Date.now(), tail: "" };
          jobs.set(id, job);
          let buf = "";
          child.stdout.on("data", (d) => {
            buf += d;
            let i;
            while ((i = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, i).trim();
              buf = buf.slice(i + 1);
              if (!line.startsWith("{")) continue;
              try {
                const m = JSON.parse(line);
                if (m.type === "progress") job.progress = m;
                else if (m.type === "done") { job.report = m; job.status = "complete"; }
                else if (m.type === "error") { job.error = m.message; job.status = "failed"; }
              } catch { /* not ours */ }
            }
          });
          child.stderr.on("data", (d) => (job.tail = (job.tail + d).slice(-2000)));
          child.on("close", (code) => {
            if (job.status === "running") {
              job.status = code === 0 && existsSync(join(out, "animatic.mp4")) ? "complete" : "failed";
              if (job.status === "failed" && !job.error) job.error = job.tail.trim().split("\n").slice(-3).join(" ") || `the exporter stopped (code ${code})`;
            }
            // a failed or cancelled render leaves nothing worth keeping, and its frames are large
            if (job.status !== "complete") rmSync(out, { recursive: true, force: true });
          });
          return send(res, 200, view(job));
        }
        const job = parts[0] === "jobs" ? jobs.get(parts[1]) : null;
        if (!job) return send(res, 404, { error: "Export not found." });
        if (req.method === "GET" && parts.length === 2) return send(res, 200, view(job));
        if (req.method === "POST" && parts[2] === "cancel") {
          if (job.status === "running") {
            job.status = "cancelled";
            job.child.kill();
          }
          return send(res, 200, view(job));
        }
        const file = parts[2];
        if (req.method === "GET" && FILES[file]) {
          const path = resolve(job.out, file);
          if (!existsSync(path)) return send(res, 404, { error: "Not ready." });
          res.statusCode = 200;
          res.setHeader("Content-Type", FILES[file]);
          res.setHeader("Content-Length", String(statSync(path).size));
          const name = `nobodys-witness-animatic-${job.options.from}${job.options.to ? `-${job.options.to}` : ""}${file.slice(file.indexOf("."))}`;
          res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
          return createReadStream(path).pipe(res);
        }
        return send(res, 404, { error: "Not found." });
      });
    },
  };
}
