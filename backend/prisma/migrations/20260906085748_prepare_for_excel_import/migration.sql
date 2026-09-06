/*
  Warnings:

  - A unique constraint covering the columns `[sourceProjectId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "compensationStatus" TEXT,
ADD COLUMN     "sourceProjectId" TEXT,
ALTER COLUMN "landAreaHectares" DROP NOT NULL,
ALTER COLUMN "affectedFamilies" DROP NOT NULL,
ALTER COLUMN "budgetAllocatedCrore" DROP NOT NULL,
ALTER COLUMN "compensationPaidPercent" DROP NOT NULL,
ALTER COLUMN "legalDisputes" DROP NOT NULL,
ALTER COLUMN "possessionPercent" DROP NOT NULL,
ALTER COLUMN "stakeholderResponsePercent" DROP NOT NULL,
ALTER COLUMN "stakeholderResponsiveness" DROP NOT NULL,
ALTER COLUMN "historicalPerformance" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_sourceProjectId_key" ON "Project"("sourceProjectId");
