import "dotenv/config";
import app from "./app.js";
import { PrismaClient } from "@prisma/client";

const PORT = Number(process.env.PORT ?? 5000);
const prisma = new PrismaClient();

async function start() {
  await prisma.$connect();
  const server = app.listen(PORT, () => {
    console.log(`Server is running`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received; shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(async (error) => {
  console.error("Failed to start backend:", error);
  await prisma.$disconnect();
  process.exit(1);
});
