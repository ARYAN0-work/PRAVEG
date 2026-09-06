-- CreateEnum
CREATE TYPE "DelayRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "districts" JSONB NOT NULL,
    "landAreaHectares" DOUBLE PRECISION NOT NULL,
    "affectedFamilies" INTEGER NOT NULL,
    "budgetAllocatedCrore" DOUBLE PRECISION NOT NULL,
    "compensationPaidPercent" DOUBLE PRECISION NOT NULL,
    "legalDisputes" INTEGER NOT NULL,
    "possessionPercent" DOUBLE PRECISION NOT NULL,
    "stakeholderResponsePercent" DOUBLE PRECISION NOT NULL,
    "stakeholderResponsiveness" TEXT NOT NULL,
    "historicalPerformance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskPrediction" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "delayRisk" "DelayRisk" NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "lowProbability" DOUBLE PRECISION NOT NULL,
    "mediumProbability" DOUBLE PRECISION NOT NULL,
    "highProbability" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "riskFactors" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiskPrediction_projectId_createdAt_idx" ON "RiskPrediction"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "RiskPrediction" ADD CONSTRAINT "RiskPrediction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
