import { PrismaClient } from "@prisma/client";
import { requestPrediction, explainPrediction } from "../src/ml.js";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: {
      sourceProjectId: {
        not: null,
      },
    },
    orderBy: {
      sourceProjectId: "asc",
    },
  });

  console.log(`Found ${projects.length} imported projects.`);
  console.log("Generating predictions...\n");

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    console.log(
      `[${i + 1}/${projects.length}] ${project.sourceProjectId} - ${project.name}`
    );

    try {
      const output = await requestPrediction(project);

      if (
        !output ||
        !["Low", "Medium", "High"].includes(output.predicted_class)
      ) {
        throw new Error("ML API returned an invalid prediction class.");
      }

      const explained = explainPrediction(project, output);

      // Remove an existing prediction for this project so the script
      // can safely be re-run without creating duplicates.
      await prisma.riskPrediction.deleteMany({
        where: {
          projectId: project.id,
        },
      });

      await prisma.riskPrediction.create({
        data: {
          projectId: project.id,
          ...explained,
        },
      });

      successful++;

      console.log(
        `    ✓ ${explained.delayRisk} | score ${explained.riskScore} | confidence ${(explained.confidence * 100).toFixed(1)}%`
      );
    } catch (error) {
      failed++;

      console.error(
        `    ✗ FAILED: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  console.log("\n================================");
  console.log("Prediction generation complete");
  console.log("================================");
  console.log(`Successful: ${successful}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Total:      ${projects.length}`);
}

main()
  .catch((error) => {
    console.error("SCRIPT FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });