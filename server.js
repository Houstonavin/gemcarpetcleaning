const fs = require("fs");
const path = require("path");
const express = require("express");

/** Load `.env` if present (simple KEY=value parser; lines starting with `#` skipped). */
function loadEnvFromFile() {
  const envPath = path.join(__dirname, ".env");
  try {
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch (_) {
    /* ignore */
  }
}

loadEnvFromFile();

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "public");

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/reviews", async (_req, res) => {
  const sheetUrl = process.env.GEM_APPS_SCRIPT_URL;
  const secret = process.env.GEM_APPS_SCRIPT_SECRET;
  if (!sheetUrl?.trim() || !secret?.trim()) {
    return res.json({
      ok: true,
      reviews: [],
      configured: false,
    });
  }
  const qs = `${sheetUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(secret)}`;
  try {
    const r = await fetch(`${sheetUrl.trim()}${qs}`, {
      method: "GET",
      redirect: "follow",
    });
    const data = /** @type {Record<string, unknown>} */ (
      JSON.parse(await r.text())
    );
    if (!r.ok || !data || data.ok !== true) {
      return res.status(502).json({
        ok: false,
        reviews: [],
        configured: true,
        error: "Unable to load reviews.",
      });
    }
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    return res.json({
      ok: true,
      reviews,
      configured: true,
    });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      reviews: [],
      configured: true,
      error: err instanceof Error ? err.message : "Sheet request failed.",
    });
  }
});

app.post("/api/reviews", async (req, res) => {
  const sheetUrl = process.env.GEM_APPS_SCRIPT_URL?.trim();
  const secret = process.env.GEM_APPS_SCRIPT_SECRET?.trim();
  if (!sheetUrl || !secret) {
    return res.status(503).json({
      ok: false,
      error: "Reviews are not configured. Add GEM_APPS_SCRIPT_URL and GEM_APPS_SCRIPT_SECRET.",
    });
  }

  const body = req.body || {};
  const ratingNum = Number(body.rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ ok: false, error: "Rating must be between 1 and 5." });
  }
  const service = typeof body.service === "string" ? body.service.trim() : "";
  if (!service || service.length > 240) {
    return res.status(400).json({ ok: false, error: "A valid service is required." });
  }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 140) : "";
  const comments = typeof body.comments === "string" ? body.comments.trim().slice(0, 2000) : "";

  const payload = {
    secret,
    rating: ratingNum,
    service,
    name,
    comments,
  };

  try {
    const r = await fetch(sheetUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!r.ok || !data || data.ok !== true) {
      return res.status(502).json({
        ok: false,
        error: "Could not save to the spreadsheet.",
        detail: data,
      });
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: err instanceof Error ? err.message : "Network error.",
    });
  }
});

/** Pretty URL for review submission (physical file stays `public/submit-review.html`). */
const submitReviewFile = path.join(publicPath, "submit-review.html");
app.get("/submit-review", (_req, res) => res.sendFile(submitReviewFile));
app.get("/submit-review.html", (_req, res) => res.redirect(301, "/submit-review"));
app.get("/submit-review/", (_req, res) => res.redirect(301, "/submit-review"));

app.use(express.static(publicPath));

/** Express 5 / path-to-regexp v8 rejects `app.get("*")` — SPA fallback via middleware */
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
