const express = require("express");
const path = require("path");
const api = require("./api/routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", api);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Hoop Central Data Engine Running");
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
