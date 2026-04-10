require("dotenv").config({ path: ".env.local" });
const express = require("express");
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, ngrok-skip-browser-warning",
  );
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

const getPhone = require("./api/get-phone").default;
const warrantyActivate = require("./api/warranty-activate").default;

app.post("/api/get-phone", getPhone);
app.post("/api/warranty-activate", warrantyActivate);

app.listen(3000, () => console.log("Server running on port 3000"));
