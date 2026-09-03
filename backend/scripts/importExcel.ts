import "dotenv/config";
import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
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

const excelPath = path.resolve(
  process.cwd(),
  "../Datastructure.xlsx",
);

if (!fs.existsSync(excelPath)) {
  throw new Error(`Excel file not found: ${excelPath}`);
}

/*
 * ------------------------------------------------------------
 * HELPERS
 * ------------------------------------------------------------
 */

function clean(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  if (
    text === "" ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return null;
  }

  return text;
}

function toNumber(value: unknown): number | null {
  const text = clean(value);

  if (text === null) {
    return null;
  }

  const normalized = text
    .replace(/,/g, "")
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function toInteger(value: unknown): number | null {
  const number = toNumber(value);

  if (number === null) {
    return null;
  }

  return Number.isInteger(number)
    ? number
    : Math.trunc(number);
}

/*
 * Converts Excel serial dates such as:
 *
 * 43556
 * 43586
 * 44958
 * 45261
 *
 * into JavaScript Date objects.
 *
 * Excel's default 1900 date system is used by this workbook.
 */
function excelSerialToDate(value: unknown): Date | null {
  const number = toNumber(value);

  if (number === null) {
    return null;
  }

  if (number < 1) {
    return null;
  }

  const excelEpoch = new Date(
    Date.UTC(1899, 11, 30),
  );

  const milliseconds =
    number * 24 * 60 * 60 * 1000;

  const date = new Date(
    excelEpoch.getTime() + milliseconds,
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/*
 * Snapshot Date is inconsistent in the source:
 *
 * - Some rows contain Excel serial dates.
 * - Some rows contain only a year such as 2023.
 * - Some rows contain NULL.
 *
 * Therefore:
 * - serial date -> snapshotDate
 * - four digit year -> snapshotYear
 */
function parseSnapshot(value: unknown): {
  snapshotDate: Date | null;
  snapshotYear: number | null;
} {
  const text = clean(value);

  if (text === null) {
    return {
      snapshotDate: null,
      snapshotYear: null,
    };
  }

  const number = Number(text);

  if (
    Number.isInteger(number) &&
    number >= 1900 &&
    number <= 2100
  ) {
    return {
      snapshotDate: null,
      snapshotYear: number,
    };
  }

  const date = excelSerialToDate(value);

  return {
    snapshotDate: date,
    snapshotYear: null,
  };
}

/*
 * Converts values such as:
 *
 * 6928cr
 * 500cr
 * 3,400Cr
 * 425Cr
 * 89cr
 *
 * into numeric crore values.
 */
function parseCrore(value: unknown): number | null {
  const text = clean(value);

  if (text === null) {
    return null;
  }

  const normalized = text
    .replace(/,/g, "")
    .replace(/crores?/gi, "")
    .replace(/cr/gi, "")
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number)
    ? number
    : null;
}

/*
 * Compensation_Status is mixed in the Excel source.
 *
 * Examples can represent either:
 *
 * - an amount: 15.78Cr
 * - a status: High
 * - NULL
 *
 * We preserve the original meaning:
 *
 * numeric amount -> compensationAmountCrore
 * text/status    -> compensationStatus
 */
function parseCompensation(value: unknown): {
  compensationAmountCrore: number | null;
  compensationStatus: string | null;
} {
  const text = clean(value);

  if (text === null) {
    return {
      compensationAmountCrore: null,
      compensationStatus: null,
    };
  }

  const numericText = text
    .replace(/,/g, "")
    .replace(/crores?/gi, "")
    .replace(/cr/gi, "")
    .trim();

  const number = Number(numericText);

  if (Number.isFinite(number)) {
    return {
      compensationAmountCrore: number,
      compensationStatus: null,
    };
  }

  return {
    compensationAmountCrore: null,
    compensationStatus: text,
  };
}

/*
 * Possesion_status in the source is numeric/progress style.
 */
function parsePossession(
  value: unknown,
): number | null {
  return toNumber(value);
}

/*
 * ------------------------------------------------------------
 * WORKBOOK
 * ------------------------------------------------------------
 */

const workbook = XLSX.read(
  fs.readFileSync(excelPath),
  {
    cellDates: false,
  },
);

if (workbook.SheetNames.length < 2) {
  throw new Error(
    "Expected at least two sheets in Datastructure.xlsx",
  );
}

const sheet1Name = workbook.SheetNames[0];
const sheet2Name = workbook.SheetNames[1];

const sheet1 = XLSX.utils.sheet_to_json<
  Record<string, unknown>
>(
  workbook.Sheets[sheet1Name],
  {
    defval: null,
  },
);

const sheet2 = XLSX.utils.sheet_to_json<
  Record<string, unknown>
>(
  workbook.Sheets[sheet2Name],
  {
    defval: null,
  },
);

/*
 * ------------------------------------------------------------
 * MASTER PROJECT PREPARATION
 * ------------------------------------------------------------
 */

type ProjectRow = {
  sourceProjectId: string;
  name: string;
  projectType: string;
  state: string;
  landArea: number | null;
  affectedFamilies: number | null;
  stakeholderResponsiveness: number | null;
  historicalPerformance: number | null;
  districts: string[];
  districtCount: number | null;
};

const projectRows: ProjectRow[] = [];

const seenProjectIds = new Set<string>();

for (const row of sheet1) {
  const sourceProjectId =
    clean(row["Project_id"]);

  if (!sourceProjectId) {
    console.warn(
      "Skipping Sheet1 row without Project_id:",
      row,
    );
    continue;
  }

  if (seenProjectIds.has(sourceProjectId)) {
    throw new Error(
      `Duplicate Project_id in Sheet1: ${sourceProjectId}`,
    );
  }

  seenProjectIds.add(sourceProjectId);

  const districts: string[] = [];

  for (let i = 1; i <= 17; i++) {
    const district = clean(
      row[`District_${i}`],
    );

    if (district) {
      districts.push(district);
    }
  }

  projectRows.push({
    sourceProjectId,

    name:
      clean(row["Project_name"]) ??
      "Unnamed Project",

    projectType:
      clean(row["Project_type"]) ??
      "Unknown",

    state:
      clean(row["State"]) ??
      "Unknown",

    landArea: toNumber(
      row["Land Area"],
    ),

    affectedFamilies: toInteger(
      row["No. Of affected Families"],
    ),

    stakeholderResponsiveness:
      toNumber(
        row["Stake Holder Responsiveness"],
      ),

    historicalPerformance:
      toNumber(
        row["Historical Performance"],
      ),

    districts,

    districtCount:
      toInteger(row["District_Count"]) ??
      districts.length,
  });
}

/*
 * ------------------------------------------------------------
 * VALIDATION
 * ------------------------------------------------------------
 */

if (projectRows.length !== 57) {
  throw new Error(
    `Expected 57 Sheet1 projects, found ${projectRows.length}`,
  );
}

if (sheet2.length !== 73) {
  throw new Error(
    `Expected 73 Sheet2 status records, found ${sheet2.length}`,
  );
}

console.log(
  `Sheet1 projects: ${projectRows.length}`,
);

console.log(
  `Sheet2 status records: ${sheet2.length}`,
);

/*
 * ------------------------------------------------------------
 * IMPORT
 * ------------------------------------------------------------
 */

async function main() {
  /*
   * ----------------------------------------------------------
   * 1. IMPORT MASTER PROJECTS
   * ----------------------------------------------------------
   */

  let projectsCreated = 0;
  let projectsExisting = 0;

  for (const project of projectRows) {
    const existing =
      await prisma.project.findUnique({
        where: {
          sourceProjectId:
            project.sourceProjectId,
        },
      });

    if (existing) {
      projectsExisting++;
      continue;
    }

    await prisma.project.create({
      data: {
        sourceProjectId:
          project.sourceProjectId,

        name: project.name,

        projectType:
          project.projectType,

        state:
          project.state,

        landArea:
          project.landArea,

        affectedFamilies:
          project.affectedFamilies,

        stakeholderResponsiveness:
          project.stakeholderResponsiveness,

        historicalPerformance:
          project.historicalPerformance,

        districts:
          project.districts,

        districtCount:
          project.districtCount,
      },
    });

    projectsCreated++;
  }

  console.log(
    `Master projects created: ${projectsCreated}`,
  );

  console.log(
    `Master projects already existing: ${projectsExisting}`,
  );

  /*
   * ----------------------------------------------------------
   * 2. LOAD PROJECTS FOR RELATIONSHIP LOOKUP
   * ----------------------------------------------------------
   */

  const projects =
    await prisma.project.findMany({
      select: {
        id: true,
        sourceProjectId: true,
        name: true,
        projectType: true,
      },
    });

  const projectBySourceId =
    new Map<
      string,
      (typeof projects)[number]
    >();

  for (const project of projects) {
    projectBySourceId.set(
      project.sourceProjectId,
      project,
    );
  }

  /*
   * ----------------------------------------------------------
   * 3. IMPORT STATUS HISTORY
   * ----------------------------------------------------------
   */

  let statusInserted = 0;
  let statusExisting = 0;
  let statusLinked = 0;
  let statusUnlinked = 0;

  for (
    let index = 0;
    index < sheet2.length;
    index++
  ) {
    const row = sheet2[index];

    /*
     * Excel data starts at row 2 because row 1
     * contains the headers.
     */
    const sourceRowNumber = index + 2;

    const sourceProjectId =
      clean(row["Project_id"]);

    if (!sourceProjectId) {
      console.warn(
        `Skipping Sheet2 row ${sourceRowNumber}: missing Project_id`,
      );
      continue;
    }

    const sourceProjectName =
      clean(row["Project_name"]) ??
      "Unknown";

    const sourceProjectType =
      clean(row["Project_type"]) ??
      "Unknown";

    const masterProject =
      projectBySourceId.get(
        sourceProjectId,
      );

    /*
     * We only attach the status row to the master
     * project when BOTH name and type match.
     *
     * This intentionally protects P068.
     */
    let projectId: string | null = null;

    if (
      masterProject &&
      masterProject.name ===
        sourceProjectName &&
      masterProject.projectType ===
        sourceProjectType
    ) {
      projectId = masterProject.id;
      statusLinked++;
    } else {
      statusUnlinked++;

      console.warn(
        `Identity mismatch: ${sourceProjectId} | ${sourceProjectName} | ${sourceProjectType}`,
      );
    }

    const budgetAllocatedCrore =
      parseCrore(
        row["Budget alloted"],
      );

    const compensation =
      parseCompensation(
        row["Compensation_Status"],
      );

    const snapshot =
      parseSnapshot(
        row["SnapShot Date"],
      );

    const targetCompletion =
      excelSerialToDate(
        row["Target completion"],
      );

    /*
     * Check by ORIGINAL EXCEL ROW NUMBER.
     *
     * This is important because Sheet2 contains
     * duplicate-looking records.
     */
    const existing =
      await prisma.projectStatus.findFirst({
        where: {
          sourceProjectId,
          sourceRowNumber,
        },
      });

    if (existing) {
      statusExisting++;
      continue;
    }

    await prisma.projectStatus.create({
      data: {
        sourceProjectId,

        sourceRowNumber,

        sourceProjectName,

        sourceProjectType,

        projectId,

        budgetAllocatedCrore,

        compensationAmountCrore:
          compensation.compensationAmountCrore,

        compensationStatus:
          compensation.compensationStatus,

        approvalTimelines:
          clean(row["Approval Timelines"]),

        legalDisputes:
          clean(row["Legal Disputes"]),

        possessionStatus:
          parsePossession(
            row["Possesion_status"],
          ),

        rehabilitationStatus:
          clean(
            row["Rehabilitation Status"],
          ),

        delayStatus:
          clean(row["Delay_status"]),

        targetCompletion,

        snapshotDate:
          snapshot.snapshotDate,

        snapshotYear:
          snapshot.snapshotYear,
      },
    });

    statusInserted++;
  }

  /*
   * ----------------------------------------------------------
   * 4. IMPORT SUMMARY
   * ----------------------------------------------------------
   */

  console.log(
    "\n========== IMPORT COMPLETE ==========",
  );

  console.log(
    `Projects in Excel: ${projectRows.length}`,
  );

  console.log(
    `Status rows in Excel: ${sheet2.length}`,
  );

  console.log(
    `Status rows inserted: ${statusInserted}`,
  );

  console.log(
    `Status rows already existing: ${statusExisting}`,
  );

  console.log(
    `Status rows linked: ${statusLinked}`,
  );

  console.log(
    `Status rows unlinked: ${statusUnlinked}`,
  );

  /*
   * ----------------------------------------------------------
   * 5. FINAL DATABASE VERIFICATION
   * ----------------------------------------------------------
   */

  const projectCount =
    await prisma.project.count();

  const statusCount =
    await prisma.projectStatus.count();

  console.log(
    "\n========== DATABASE VERIFICATION ==========",
  );

  console.log(
    `Projects in DB: ${projectCount}`,
  );

  console.log(
    `Status rows in DB: ${statusCount}`,
  );

  /*
   * Expected final state:
   *
   * Project      = 57
   * ProjectStatus = 73
   */

  if (projectCount !== 57) {
    throw new Error(
      `Expected 57 projects, found ${projectCount}`,
    );
  }

  if (statusCount !== 73) {
    throw new Error(
      `Expected 73 status rows, found ${statusCount}`,
    );
  }

  /*
   * Verify the two P068 rows are intentionally
   * unlinked rather than attached to the wrong project.
   */
  const p068Unlinked =
    await prisma.projectStatus.count({
      where: {
        sourceProjectId: "P068",
        projectId: null,
      },
    });

  if (p068Unlinked !== 2) {
    throw new Error(
      `Expected 2 unlinked P068 rows, found ${p068Unlinked}`,
    );
  }

  console.log(
    "\n✅ Excel import verified successfully.",
  );

  console.log(
    "✅ 57 master projects present.",
  );

  console.log(
    "✅ 73 status/history rows present.",
  );

  console.log(
    "✅ P068 identity mismatch safely preserved.",
  );
}

main()
  .catch((error) => {
    console.error(
      "\n❌ Import failed:",
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });