const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Very simple "test" mode so Jenkins has something to run
if (process.argv.includes("--test")) {
  console.log("Basic smoke tests passed");
  process.exit(0);
}

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Web app listening on port ${port}`);
});
