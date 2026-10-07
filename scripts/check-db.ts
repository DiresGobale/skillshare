import { db } from "../src/lib/db";

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, twoFactorEnabled: true }
  });
  for (const u of users) {
    console.log(`${u.email} | role=${u.role} | status=${u.status} | 2fa=${u.twoFactorEnabled}`);
  }
  console.log("---");
  console.log("Total users:", users.length);
  console.log("Admins:", users.filter(u => u.role === "admin").length);
}

main().catch(console.error).finally(() => db.$disconnect());
