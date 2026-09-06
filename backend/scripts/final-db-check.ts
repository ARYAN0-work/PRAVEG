import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const totalProjects = await prisma.project.count();

  const importedProjects = await prisma.project.count({
    where: {
      sourceProjectId: {
        not: null,
      },
    },
  });

  const projectsWithoutSourceId = await prisma.project.findMany({
    where: {
      sourceProjectId: null,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const totalPredictions = await prisma.riskPrediction.count();

  console.log("FINAL DATABASE CHECK");
  console.log("====================");
  console.log("Total projects:", totalProjects);
  console.log("Imported Excel projects:", importedProjects);
  console.log("Projects without source ID:", projectsWithoutSourceId);
  console.log("Total predictions:", totalPredictions);

  if (
    totalProjects === 57 &&
    importedProjects === 57 &&
    projectsWithoutSourceId.length === 0 &&
    totalPredictions === 57
  ) {
    console.log("\n✅ DATABASE IS READY FOR DEMO");
  } else {
    console.log("\n⚠️ DATABASE NEEDS ATTENTION");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());