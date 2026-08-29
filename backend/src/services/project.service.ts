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

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: {
      id,
    },
  });
};

export const updateProject = async (
  id: string,
  data: {
    name?: string;
    projectType?: string;
    state?: string;
    district?: string;
    landArea?: number;
    affectedFamilies?: number;
    compensationStatus?: string;
    approvalStatus?: string;
    legalDispute?: boolean;
    possessionStatus?: string;
    rehabilitationStatus?: string;
  },
) => {
  return prisma.project.update({
    where: {
      id,
    },
    data,
  });
};
