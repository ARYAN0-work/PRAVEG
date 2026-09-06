import { PrismaClient } from "@prisma/client";
import { requestPrediction, explainPrediction } from "../src/ml.js";

const prisma = new PrismaClient();

async function main() {
  console.log("1. Finding P001...");

  const project = await prisma.project.findFirst({
    where: {
      sourceProjectId: "P001",
    },
  });

  if (!project) {
    throw new Error("P001 not found");
  }

  console.log("2. P001 found:", project.name);

  console.log("3. Calling FastAPI...");

  const prediction = await requestPrediction(project);

  console.log("4. Prediction received:");
  console.log(JSON.stringify(prediction, null, 2));

  console.log("5. Building explanation...");

  const explanation = explainPrediction(project, prediction);

  console.log("6. Final explanation:");
  console.log(JSON.stringify(explanation, null, 2));
}

main()
  .catch((error) => {
    console.error("TEST FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });