const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/estimate", (req, res) => {
  const { rooms } = req.body || {};
  const priceMap = {
    "1–2 rooms": 129,
    "3–4 rooms": 219,
    "5+ rooms": 349,
  };
  const price = priceMap[rooms] || 129;
  res.json({ startingPrice: price });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
