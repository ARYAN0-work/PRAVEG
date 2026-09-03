import "dotenv/config";
import XLSX from "xlsx";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const workbook = XLSX.read(
  fs.readFileSync("../Datastructure.xlsx")
);

const sheet1 = XLSX.utils.sheet_to_json<Record<string, any>>(
  workbook.Sheets[workbook.SheetNames[0]]
);

const sheet2 = XLSX.utils.sheet_to_json<Record<string, any>>(
  workbook.Sheets[workbook.SheetNames[1]]
);

function clean(value: any): string {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function toFloat(value: any): number {
  const text = clean(value)
    .replace(/,/g, "")
    .replace(/cr/gi, "")
    .trim();

  const number = parseFloat(text);

  return Number.isFinite(number) ? number : 0;
}

function toInt(value: any): number {
  const number = parseInt(clean(value).replace(/,/g, ""), 10);

  return Number.isFinite(number) ? number : 0;
}

function toBoolean(value: any): boolean {
  const text = clean(value).toLowerCase();

  return (
    text === "true" ||
    text === "yes" ||
    text === "1" ||
    text === "high"
  );
}

async function main() {
  console.log(`Found ${sheet1.length} rows in sheet 1.`);
  console.log(`Found ${sheet2.length} rows in sheet 2.`);

  const statusByProjectId = new Map<string, Record<string, any>>();

  for (const row of sheet2) {
    const projectId = clean(row["Project_id"]);

    if (projectId) {
      statusByProjectId.set(projectId, row);
    }
  }

  const projects = [];

  for (const row of sheet1) {
    const projectId = clean(row["Project_id"]);

    if (!projectId) {
      continue;
    }

    const statusRow = statusByProjectId.get(projectId);

    const districts = [
      row["District_1"],
      row["District_2"],
      row["District_3"],
      row["District_4"],
      row["District_5"],
      row["District_6"],
      row["District_7"],
      row["District_8"],
      row["District_9"],
      row["District_10"],
      row["District_11"],
      row["District_12"],
      row["District_13"],
      row["District_14"],
      row["District_15"],
      row["District_16"],
      row["District_17"],
    ]
      .map(clean)
      .filter(Boolean);

    projects.push({
      name: clean(row["Project_name"]),
      projectType: clean(row["Project_type"]),
      state: clean(row["State"]),
      district: districts.join(", "),
      landArea: toFloat(row["Land_Area"]),
      affectedFamilies: toInt(row["No. of affected Families"]),

      compensationStatus:
        clean(statusRow?.["Compensation_Status"]) || "PENDING",

      approvalStatus:
        clean(statusRow?.["Approval_Timelines"]) || "PENDING",

      legalDispute: toBoolean(statusRow?.["Legal_Disputes"]),

      possessionStatus:
        clean(statusRow?.["Possession_status"]) || "PENDING",

      rehabilitationStatus:
        clean(statusRow?.["Rehabilitation_Status"]) || "PENDING",
    });
  }

  console.log(`Prepared ${projects.length} projects for import.`);

  const existingCount = await prisma.project.count();

  console.log(`Existing projects in database: ${existingCount}`);

  if (existingCount > 0) {
    console.log(
      "Import cancelled to prevent duplicate records."
    );
    return;
  }

  if (projects.length === 0) {
    console.log("No projects found in Excel.");
    return;
  }

    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    
    const result = await prisma.project.createMany({
        data: batch,
      });
    
      insertedCount += result.count;
    
      console.log(
        `Inserted ${insertedCount}/${projects.length} projects.`
      );
}

console.log(`Successfully inserted ${insertedCount} projects.`);
}

main()
  .catch((error) => {
    console.error("Import failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });