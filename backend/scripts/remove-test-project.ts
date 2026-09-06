import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: {
      id: "c9e9fd9a-e4e9-4966-af8c-6295f67ece85",
    },
  });

  if (!project) {
    console.log("Test project 'ggj' not found.");
    return;
  }

  await prisma.project.delete({
    where: {
      id: project.id,
    },
  });

  console.log(`Deleted test project '${project.name}'.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());