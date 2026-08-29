import { prisma } from "../lib/prisma.js";

export const createProject = async (data: {
  name: string;
  projectType: string;
  state: string;
  district: string;
  landArea: number;
  affectedFamilies: number;
  compensationStatus: string;
  approvalStatus: string;
  legalDispute: boolean;
  possessionStatus: string;
  rehabilitationStatus: string;
}) => {
  return prisma.project.create({
    data,
  });
};

export const getProjects = async () => {
  return prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

