import { v4 as uuidv4 } from "uuid";

import { db, type ImportJob } from "./index";

const nowIso = () => new Date().toISOString();

export const createImportJob = async (
  totalCount: number,
): Promise<ImportJob> => {
  const job: ImportJob = {
    id: uuidv4(),
    status: "pending",
    total_count: totalCount,
    completed_count: 0,
    failed_count: 0,
    started_at: nowIso(),
  };

  await db.import_jobs.add(job);
  return job;
};

export const updateImportJob = async (
  id: string,
  updates: Partial<ImportJob>,
): Promise<ImportJob | undefined> => {
  await db.import_jobs.update(id, updates);
  return db.import_jobs.get(id);
};

export const recordImportJobResult = async (
  id: string,
  result: "success" | "failed",
): Promise<void> => {
  await db.transaction("rw", db.import_jobs, async () => {
    const job = await db.import_jobs.get(id);
    if (!job) {
      return;
    }

    const completed_count =
      job.completed_count + (result === "success" ? 1 : 0);
    const failed_count = job.failed_count + (result === "failed" ? 1 : 0);

    await db.import_jobs.update(id, {
      completed_count,
      failed_count,
      status: job.status === "pending" ? "in_progress" : job.status,
    });
  });
};

export const completeImportJob = async (
  id: string,
): Promise<ImportJob | undefined> =>
  updateImportJob(id, { status: "completed", completed_at: nowIso() });
