import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: {
      sourceProjectId: {
        not: null
      }
    },
    orderBy: {
      sourceProjectId: "asc"
    },
    take: 10
  });

  for (const p of projects) {
    console.log(
      p.sourceProjectId,
      "|",
      p.name,
      "| affectedFamilies:", p.affectedFamilies,
      "| budget:", p.budgetAllocatedCrore,
      "| compensationStatus:", p.compensationStatus,
      "| stakeholder:", p.stakeholderResponsiveness,
      "| stakeholder%:", p.stakeholderResponsePercent,
      "| possession:", p.possessionPercent,
      "| historical:", p.historicalPerformance
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
