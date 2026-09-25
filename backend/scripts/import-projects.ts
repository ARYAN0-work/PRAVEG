import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

const workbook = XLSX.readFile(fileURLToPath(new URL("../../ml-api/Datastructure_3.xlsx", import.meta.url)));

const sheet1 = XLSX.utils.sheet_to_json<Record<string, unknown>>(
  workbook.Sheets["Sheet1"],
);

const sheet2 = XLSX.utils.sheet_to_json<Record<string, unknown>>(
  workbook.Sheets["Sheet2"],
);

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  const text = String(value).trim().toLowerCase();

  return text === "" || text === "null" || text === "na" || text === "-";
}

function toNumber(value: unknown): number | null {
  if (isMissing(value)) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value)
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/cr/g, "")
    .trim();

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function normalizePossession(value: unknown): number | null {
  const number = toNumber(value);

  if (number === null) return null;

  // Source contains both fractions (0.69, 0.95, 1.0)
  // and percentages (69, 95, 100).
  if (number >= 0 && number <= 1) {
    return number * 100;
  }

  return number;
}

function normalizeProjectType(value: unknown): string {
  const text = String(value ?? "").trim();

  if (text.includes("Irrigation")) return "Irrigation";
  if (text.includes("Metro")) return "Metro Rail";
  if (text.includes("Airport")) return "Airport";
  if (text.includes("Expressway")) return "Expressway";
  if (text.includes("Highway") || text.includes("Road")) return "Highway";
  if (text.includes("Industrial")) return "Industrial Infrastructure";
  if (text.includes("Urban Transport")) return "Urban Transport";
  if (text.includes("Urban")) return "Urban Development";

  return text;
}

function normalizeStakeholder(value: unknown): string | null {
  if (isMissing(value)) return null;

  const text = String(value).trim();

  const allowed = ["Poor", "Low", "Moderate", "High"];

  const match = allowed.find(
    (item) => item.toLowerCase() === text.toLowerCase(),
  );

  return match ?? text;
}

function latestSnapshot(projectId: string) {
  const rows = sheet2.filter(
    (row) => String(row.Project_id ?? "").trim() === projectId,
  );

  if (!rows.length) return null;

  // Prefer rows with an actual snapshot date.
  // Excel contains both dates and year-like numeric values.
  const datedRows = rows
    .map((row, index) => ({
      row,
      index,
      date: parseSnapshotDate(row["SnapShot Date"]),
    }))
    .filter((item) => item.date !== null);

  if (!datedRows.length) {
    // If no snapshot has a usable date, use the final source row.
    return rows[rows.length - 1];
  }

  datedRows.sort((a, b) => {
    return a.date!.getTime() - b.date!.getTime();
  });

  return datedRows[datedRows.length - 1].row;
}

function parseSnapshotDate(value: unknown): Date | null {
  if (isMissing(value)) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  // Excel year-only values such as 2019, 2021, etc.
  if (typeof value === "number" && value >= 1900 && value <= 2100) {
    return new Date(Date.UTC(value, 11, 31));
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

function buildDistricts(row: Record<string, unknown>): string[] {
  return [...new Set(Object.keys(row)
    .filter((key) => /^District_\d+$/.test(key))
    .map((key) => String(row[key] ?? "").trim())
    .filter((value) => !isMissing(value)))];
}

async function main() {
  console.log(`Sheet1 rows: ${sheet1.length}`);
  console.log(`Sheet2 rows: ${sheet2.length}`);

  const projectIds = new Set(
    sheet1
      .map((row) => String(row.Project_id ?? "").trim())
      .filter(Boolean),
  );

  console.log(`Unique Sheet1 projects: ${projectIds.size}`);

  let imported = 0;

  for (const row of sheet1) {
    const sourceProjectId = String(row.Project_id ?? "").trim();

    if (!sourceProjectId) {
      console.warn("Skipping row without Project_id");
      continue;
    }

    const snapshot = latestSnapshot(sourceProjectId);

    const stakeholder = normalizeStakeholder(
      row["Stake Holder Responsiveness"],
    );

    const projectData = {
      name: String(row.Project_name ?? "").trim(),
      projectType: normalizeProjectType(row.Project_type),
      state: String(row.State ?? "").trim(),
      districts: buildDistricts(row),

      landAreaHectares: toNumber(row["Land Area"]),
      affectedFamilies: toNumber(row["No. Of affected Families"]),
      budgetAllocatedCrore: toNumber(snapshot?.["Budget_allotted"]),

      // The source does not provide a reliable compensation percentage.
      compensationPaidPercent: null,

      compensationStatus: null,

      legalDisputes: toNumber(row["Legal_Disputes"]),

      possessionPercent: normalizePossession(
        snapshot?.["Possesion_status"],
      ),

      // Do NOT invent a numeric percentage from Poor/Low/Moderate/High.
      stakeholderResponsePercent: null,
      stakeholderResponsiveness: stakeholder,

      historicalPerformance: toNumber(row["Historical Performance"]),
    };

    await prisma.project.upsert({
      where: {
        sourceProjectId,
      },
      create: {
        sourceProjectId,
        ...projectData,
      },
      update: {
        ...projectData,
      },
    });

    imported++;

    console.log(
      `[${imported}/${projectIds.size}] Imported ${sourceProjectId}: ${projectData.name}`,
    );
  }

  const count = await prisma.project.count();

  console.log("");
  console.log("================================");
  console.log(`Projects in database: ${count}`);
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });