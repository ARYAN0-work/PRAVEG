import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

type ProjectCreateData = {
  sourceProjectId?: string;
  name: string;
  projectType: string;
  state: string;
  landArea?: number;
  affectedFamilies?: number;
  stakeholderResponsiveness?: number;
  historicalPerformance?: number;
  districts?: string[];
  districtCount?: number;
};

type ProjectUpdateData = {
  name?: string;
  projectType?: string;
  state?: string;
  landArea?: number;
  affectedFamilies?: number;
  stakeholderResponsiveness?: number;
  historicalPerformance?: number;
  districts?: string[];
  districtCount?: number;
};

export const createProject = async (
  data: ProjectCreateData,
) => {
  const sourceProjectId =
    data.sourceProjectId?.trim() ||
    `MANUAL-${randomUUID()}`;

  return prisma.project.create({
    data: {
      sourceProjectId,
      name: data.name,
      projectType: data.projectType,
      state: data.state,
      landArea: data.landArea ?? null,
      affectedFamilies: data.affectedFamilies ?? null,
      stakeholderResponsiveness:
        data.stakeholderResponsiveness ?? null,
      historicalPerformance:
        data.historicalPerformance ?? null,
      districts: data.districts ?? Prisma.JsonNull,
      districtCount:
        data.districtCount ??
        data.districts?.length ??
        null,
    },
  });
};

export const getProjects = async () => {
  return prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      statuses: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      statuses: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

export const updateProject = async (
  id: string,
  data: ProjectUpdateData,
) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return null;
  }

  return prisma.project.update({
    where: {
      id,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.projectType !== undefined && {
        projectType: data.projectType,
      }),

      ...(data.state !== undefined && {
        state: data.state,
      }),

      ...(data.landArea !== undefined && {
        landArea: data.landArea,
      }),

      ...(data.affectedFamilies !== undefined && {
        affectedFamilies: data.affectedFamilies,
      }),

      ...(data.stakeholderResponsiveness !== undefined && {
        stakeholderResponsiveness:
          data.stakeholderResponsiveness,
      }),

      ...(data.historicalPerformance !== undefined && {
        historicalPerformance:
          data.historicalPerformance,
      }),

      ...(data.districts !== undefined && {
        districts: data.districts,
        districtCount: data.districts.length,
      }),

      ...(data.districtCount !== undefined && {
        districtCount: data.districtCount,
      }),
    },
  });
};

export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: {
      id,
    },
  });
};
