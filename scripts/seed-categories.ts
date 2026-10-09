import { db } from "../src/lib/db";

async function main() {
  const cats = [
    { name: "Engineering", color: "bg-violet-500", sortOrder: 1 },
    { name: "Design", color: "bg-blue-500", sortOrder: 2 },
    { name: "Product", color: "bg-emerald-500", sortOrder: 3 },
    { name: "Data", color: "bg-amber-500", sortOrder: 4 },
    { name: "Marketing", color: "bg-rose-500", sortOrder: 5 },
    { name: "Operations", color: "bg-slate-500", sortOrder: 6 },
    { name: "General", color: "bg-cyan-500", sortOrder: 7 },
  ];

  for (const c of cats) {
    await db.jobCategory.upsert({
      where: { name: c.name },
      update: { color: c.color, sortOrder: c.sortOrder, isActive: true },
      create: { ...c, isActive: true },
    });
    console.log(`✓ Seeded: ${c.name}`);
  }
  console.log(`\nDone. ${cats.length} categories seeded.`);
}

main().catch(console.error).finally(() => db.$disconnect());
