import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "PRAVEG backend is running",
  });
});

export default app;