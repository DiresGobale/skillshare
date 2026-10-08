import { db } from "../src/lib/db";
async function main() {
  const job = await db.job.findFirst({ where: { title: "oop" } });
  if (job) console.log(job.id);
}
main().catch(console.error).finally(() => db.$disconnect());
