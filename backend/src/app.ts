import express from "express";
import {prisma} from "./lib/prisma.js";
import projectRoutes from "./routes/project.routes.js"

const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "PRAVEG backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.use("/api/projects", projectRoutes);

export default app;