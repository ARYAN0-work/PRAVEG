import "dotenv/config";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { explainPrediction, requestPrediction } from "./ml.js";
import { referenceData, responsivenessBand } from "./reference-data.js";

const app = express();
const prisma = new PrismaClient();

app.disable("x-powered-by");

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "PRAVEG backend is running",
  });
});
type ProjectPayload = {
  name: string;
  projectType: string;
  state: string;
  districts: string[];
  landAreaHectares: number;
  affectedFamilies: number;
  budgetAllocatedCrore: number;
  compensationPaidPercent: number;
  legalDisputes: number;
  possessionPercent: number;
  stakeholderResponsePercent: number;
  historicalPerformance: number;
};

const projectInclude = { predictions: { orderBy: { createdAt: "desc" }, take: 1 } } as const;

function asNumber(value: unknown, field: string, errors: string[], options: { min?: number; max?: number; integer?: boolean } = {}) {
  const number = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(number) || (options.integer && !Number.isInteger(number)) ||
      (options.min !== undefined && number < options.min) || (options.max !== undefined && number > options.max)) {
    errors.push(`${field} is invalid.`);
  }
  return number;
}

function validateProject(body: unknown): { data?: ProjectPayload; errors?: string[] } {
  const errors: string[] = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Request body must be a JSON object."] };
  }
  const input = body as Record<string, unknown>;
  const name = String(input.name ?? "").trim();
  const projectType = String(input.projectType ?? "").trim();
  const state = String(input.state ?? "").trim();
  const districts = Array.isArray(input.districts) ? input.districts.map(String).map((d) => d.trim()).filter(Boolean) : [];
  if (!name || name.length > 200) errors.push("name must be between 1 and 200 characters.");
  if (!(referenceData.projectTypes as readonly string[]).includes(projectType)) errors.push("projectType must be selected from the approved list.");
  if (!(referenceData.states as readonly string[]).includes(state)) errors.push("state must be selected from the approved list.");
  if (!districts.length || districts.some((d) => !(referenceData.districts as readonly string[]).includes(d))) errors.push("Select at least one valid district.");
  const data: ProjectPayload = {
    name, projectType, state, districts,
    landAreaHectares: asNumber(input.landAreaHectares, "landAreaHectares", errors, { min: 0 }),
    affectedFamilies: asNumber(input.affectedFamilies, "affectedFamilies", errors, { min: 0, integer: true }),
    budgetAllocatedCrore: asNumber(input.budgetAllocatedCrore, "budgetAllocatedCrore", errors, { min: 0 }),
    compensationPaidPercent: asNumber(input.compensationPaidPercent, "compensationPaidPercent", errors, { min: 0, max: 100 }),
    legalDisputes: asNumber(input.legalDisputes, "legalDisputes", errors, { min: 0, integer: true }),
    possessionPercent: asNumber(input.possessionPercent, "possessionPercent", errors, { min: 0, max: 100 }),
    stakeholderResponsePercent: asNumber(input.stakeholderResponsePercent, "stakeholderResponsePercent", errors, { min: 0, max: 100 }),
    historicalPerformance: asNumber(input.historicalPerformance, "historicalPerformance", errors, { min: 0, max: 4 }),
  };
  return errors.length ? { errors } : { data };
}

function serializeProject(project: any) {
  const prediction = project.predictions?.[0];
  const latestPrediction = prediction && {
    ...prediction,
    delayRisk: prediction.delayRisk[0] + prediction.delayRisk.slice(1).toLowerCase(),
  };
  return { ...project, predictions: undefined, latestPrediction };
}

async function createPrediction(project: any) {
  try {
    const output = await requestPrediction(project);
    if (!output || !["Low", "Medium", "High"].includes(output.predicted_class)) {
      throw new Error("ML API returned an invalid prediction class.");
    }
    const explained = explainPrediction(project, output);
    return await prisma.riskPrediction.create({ data: { projectId: project.id, ...explained } as any });
  } catch (error) {
    console.error("ML API connection error:", error);
    return null;
  }
}

app.get("/api/reference-data", (_req, res) => res.json(referenceData));

app.get("/api/projects", async (_req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ include: projectInclude, orderBy: { updatedAt: "desc" } });
    res.json(projects.map(serializeProject));
  } catch (error) { next(error); }
});

app.get("/api/projects/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: projectInclude });
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json(serializeProject(project));
  } catch (error) { next(error); }
});

app.post("/api/projects", async (req, res, next) => {
  const parsed = validateProject(req.body);
  if (!parsed.data) return res.status(400).json({ message: "Invalid project data.", errors: parsed.errors });
  try {
    const project = await prisma.project.create({
      data: { ...parsed.data, stakeholderResponsiveness: responsivenessBand(parsed.data.stakeholderResponsePercent) },
      include: projectInclude,
    });
    const prediction = await createPrediction(project);
    res.status(201).json({ ...serializeProject(project), latestPrediction: prediction, predictionStatus: prediction ? "created" : "pending" });
  } catch (error) { next(error); }
});

app.put("/api/projects/:id", async (req, res, next) => {
  const parsed = validateProject(req.body);
  if (!parsed.data) return res.status(400).json({ message: "Invalid project data.", errors: parsed.errors });
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { ...parsed.data, stakeholderResponsiveness: responsivenessBand(parsed.data.stakeholderResponsePercent) },
      include: projectInclude,
    });
    const prediction = await createPrediction(project);
    res.json({ ...serializeProject(project), latestPrediction: prediction, predictionStatus: prediction ? "created" : "pending" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Project not found." });
    next(error);
  }
});

app.post("/api/projects/:id/predict", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: projectInclude });
    if (!project) return res.status(404).json({ message: "Project not found." });
    const prediction = await createPrediction(project);
    if (!prediction) return res.status(503).json({ message: "ML API is unavailable; project was not changed." });
    res.status(201).json(prediction);
  } catch (error) { next(error); }
});

app.delete("/api/projects/:id", async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Project not found." });
    next(error);
  }
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected server error." });
});

export default app;
