/*
  Warnings:

  - A unique constraint covering the columns `[sourceProjectId,sourceRowNumber]` on the table `ProjectStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceRowNumber` to the `ProjectStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectStatus" ADD COLUMN     "sourceRowNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStatus_sourceProjectId_sourceRowNumber_key" ON "ProjectStatus"("sourceProjectId", "sourceRowNumber");
