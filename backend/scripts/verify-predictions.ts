import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: {
      sourceProjectId: {
        not: null,
      },
    },
    include: {
      predictions: true,
    },
    orderBy: {
      sourceProjectId: "asc",
    },
  });

  const withPredictions = projects.filter(
    (project) => project.predictions.length > 0
  );

  const withoutPredictions = projects.filter(
    (project) => project.predictions.length === 0
  );

  const low = projects.filter((project) =>
    project.predictions.some((prediction) => prediction.delayRisk === "LOW")
  ).length;

  const medium = projects.filter((project) =>
    project.predictions.some((prediction) => prediction.delayRisk === "MEDIUM")
  ).length;

  const high = projects.filter((project) =>
    project.predictions.some((prediction) => prediction.delayRisk === "HIGH")
  ).length;

  console.log("Total imported projects:", projects.length);
  console.log("Projects with predictions:", withPredictions.length);
  console.log("Projects without predictions:", withoutPredictions.length);

  console.log("\nRisk distribution:");
  console.log("LOW:", low);
  console.log("MEDIUM:", medium);
  console.log("HIGH:", high);

  if (withoutPredictions.length > 0) {
    console.log("\nMissing predictions:");
    console.log(
      withoutPredictions.map((project) => project.sourceProjectId)
    );
  }

  console.log("\nSample predictions:");

  for (const project of projects.slice(0, 5)) {
    const prediction = project.predictions[0];

    console.log(
      project.sourceProjectId,
      "|",
      prediction?.delayRisk,
      "| score:",
      prediction?.riskScore,
      "| confidence:",
      prediction
        ? `${(prediction.confidence * 100).toFixed(1)}%`
        : "N/A"
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());