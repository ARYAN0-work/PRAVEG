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
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return null;
  }

  const validateTransition = (
    current: string,
    next: string,
    transitions: Record<string, string[]>,
  ) => {
    if (current === next) return true;

    return transitions[current]?.includes(next) ?? false;
  };

  if (
    data.compensationStatus &&
    !validateTransition(
      project.compensationStatus,
      data.compensationStatus,
      {
        PENDING: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
      },
    )
  ) {
    throw new Error(
      `Invalid compensation status transition: ${project.compensationStatus} → ${data.compensationStatus}`,
    );
  }

  if (
    data.possessionStatus &&
    !validateTransition(
      project.possessionStatus,
      data.possessionStatus,
      {
        PENDING: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
      },
    )
  ) {
    throw new Error(
      `Invalid possession status transition: ${project.possessionStatus} → ${data.possessionStatus}`,
    );
  }

  if (
    data.rehabilitationStatus &&
    !validateTransition(
      project.rehabilitationStatus,
      data.rehabilitationStatus,
      {
        PENDING: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
      },
    )
  ) {
    throw new Error(
      `Invalid rehabilitation status transition: ${project.rehabilitationStatus} → ${data.rehabilitationStatus}`,
    );
  }

  if (
    data.approvalStatus &&
    !validateTransition(
      project.approvalStatus,
      data.approvalStatus,
      {
        PENDING: ["APPROVED", "REJECTED"],
        APPROVED: [],
        REJECTED: [],
      },
    )
  ) {
    throw new Error(
      `Invalid approval status transition: ${project.approvalStatus} → ${data.approvalStatus}`,
    );
  }

  return prisma.project.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: {
      id,
    },
  });
};