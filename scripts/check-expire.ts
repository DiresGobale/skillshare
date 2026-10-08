import { db } from "../src/lib/db";
async function main() {
  const job = await db.job.findFirst({ where: { title: "oop" } });
  console.log("After API call:", { title: job?.title, status: job?.status, expiresAt: job?.expiresAt });
}
main().catch(console.error).finally(() => db.$disconnect());
