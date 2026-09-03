/*
  Warnings:

  - You are about to drop the column `approvalStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `compensationStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `legalDispute` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `possessionStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `rehabilitationStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to alter the column `landArea` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - A unique constraint covering the columns `[sourceProjectId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceProjectId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "approvalStatus",
DROP COLUMN "compensationStatus",
DROP COLUMN "district",
DROP COLUMN "legalDispute",
DROP COLUMN "possessionStatus",
DROP COLUMN "rehabilitationStatus",
ADD COLUMN     "districtCount" INTEGER,
ADD COLUMN     "districts" JSONB,
ADD COLUMN     "historicalPerformance" DECIMAL(10,2),
ADD COLUMN     "sourceProjectId" TEXT NOT NULL,
ADD COLUMN     "stakeholderResponsiveness" DECIMAL(10,2),
ALTER COLUMN "landArea" DROP NOT NULL,
ALTER COLUMN "landArea" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "affectedFamilies" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProjectStatus" (
    "id" TEXT NOT NULL,
    "sourceProjectId" TEXT NOT NULL,
    "sourceProjectName" TEXT NOT NULL,
    "sourceProjectType" TEXT NOT NULL,
    "projectId" TEXT,
    "budgetAllocatedCrore" DECIMAL(18,2),
    "compensationAmountCrore" DECIMAL(65,30),
    "compensationStatus" TEXT,
    "approvalTimelines" TEXT,
    "legalDisputes" TEXT,
    "possessionStatus" DECIMAL(10,4),
    "rehabilitationStatus" TEXT,
    "delayStatus" TEXT,
    "targetCompletion" TIMESTAMP(3),
    "snapshotDate" TIMESTAMP(3),
    "snapshotYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectStatus_sourceProjectId_idx" ON "ProjectStatus"("sourceProjectId");

-- CreateIndex
CREATE INDEX "ProjectStatus_projectId_idx" ON "ProjectStatus"("projectId");

-- CreateIndex
CREATE INDEX "ProjectStatus_snapshotDate_idx" ON "ProjectStatus"("snapshotDate");

-- CreateIndex
CREATE INDEX "ProjectStatus_snapshotYear_idx" ON "ProjectStatus"("snapshotYear");

-- CreateIndex
CREATE UNIQUE INDEX "Project_sourceProjectId_key" ON "Project"("sourceProjectId");

-- CreateIndex
CREATE INDEX "Project_state_idx" ON "Project"("state");

-- CreateIndex
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");

-- AddForeignKey
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
