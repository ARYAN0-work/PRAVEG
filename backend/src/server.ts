import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import app from "./app.js";

async function start() {
  try {
    await prisma.$connect();

    const server = app.listen(env.PORT, () => {
      logger.info(
        { port: env.PORT },
        "PRAVEG backend started",
      );
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutdown signal received");

      server.close(async () => {
        await prisma.$disconnect();

        logger.info("PRAVEG backend stopped");

        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start backend");

    await prisma.$disconnect();

    process.exit(1);
  }
}

start();