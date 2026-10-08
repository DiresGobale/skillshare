import { db } from "../src/lib/db";
async function main() {
  await db.job.update({
    where: { id: "cmuzb7ebe000nos1zpwrtuap5" },
    data: { expiresAt: new Date(Date.now() - 60 * 60 * 1000) },
  });
  console.log("Set expiresAt to 1 hour ago");
}
main().catch(console.error).finally(() => db.$disconnect());
