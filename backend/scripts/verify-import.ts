import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: {
      sourceProjectId: "P001",
    },
  });

  console.log(JSON.stringify(project, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());