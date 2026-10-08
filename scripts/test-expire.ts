import { db } from "../src/lib/db";

async function main() {
  // Find the "oop" job (it has no expiresAt) and set it to expired in the past
  const job = await db.job.findFirst({ where: { title: "oop" } });
  if (!job) {
    console.log("Job 'oop' not found");
    return;
  }
  
  console.log("Before:", { id: job.id, title: job.title, status: job.status, expiresAt: job.expiresAt });
  
  // Set expiresAt to 1 hour ago and status to published
  await db.job.update({
    where: { id: job.id },
    data: {
      expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      status: "published",
    },
  });
  
  console.log("Updated: set expiresAt to 1 hour ago, status=published");
  
  // Now hit the GET /api/jobs endpoint which should auto-expire it
  const updated = await db.job.findUnique({ where: { id: job.id } });
  console.log("DB state (before API call):", { status: updated?.status, expiresAt: updated?.expiresAt });
}
main().catch(console.error).finally(() => db.$disconnect());
