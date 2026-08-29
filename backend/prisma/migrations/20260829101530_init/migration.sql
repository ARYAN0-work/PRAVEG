-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "landArea" DOUBLE PRECISION NOT NULL,
    "affectedFamilies" INTEGER NOT NULL,
    "compensationStatus" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "legalDispute" BOOLEAN NOT NULL,
    "possessionStatus" TEXT NOT NULL,
    "rehabilitationStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
