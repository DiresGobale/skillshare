// Seed the SiteImage table with the 4 home page group photos.
// Run with: bun run /home/z/my-project/scripts/seed-site-images.ts

import { db } from "../src/lib/db";

async function main() {
  const images = [
    {
      key: "home-group-1",
      src: "/groups/group1.jpg",
      alt: "Five engineers collaborating in a glass-walled meeting room with laptops and a whiteboard",
      caption: "Collaborative engineering",
      description: "Cross-functional teams iterate daily on customer-facing products.",
      accent: "from-violet-500 to-blue-500",
      category: "home",
      sortOrder: 1,
      isActive: true,
    },
    {
      key: "home-group-2",
      src: "/groups/group2.jpg",
      alt: "Five IT engineers pair-programming at a standing desk with a large monitor",
      caption: "Pair programming",
      description: "Knowledge-sharing built into every sprint through paired work.",
      accent: "from-emerald-500 to-cyan-500",
      category: "home",
      sortOrder: 2,
      isActive: true,
    },
    {
      key: "home-group-3",
      src: "/groups/group3.jpg",
      alt: "Five tech professionals celebrating around a project whiteboard with sticky notes",
      caption: "Milestone celebrations",
      description: "Every shipped feature is recognized, every voice matters.",
      accent: "from-amber-500 to-rose-500",
      category: "home",
      sortOrder: 3,
      isActive: true,
    },
    {
      key: "home-group-4",
      src: "/groups/group4.jpg",
      alt: "Five developers gathered in a tech lounge for a daily standup meeting",
      caption: "Casual standups",
      description: "Quick syncs in our lounge keep momentum without crushing focus.",
      accent: "from-fuchsia-500 to-purple-500",
      category: "home",
      sortOrder: 4,
      isActive: true,
    },
    {
      key: "home-hero",
      src: "/groups/group1.jpg",
      alt: "Five engineers collaborating in a modern tech office",
      caption: "",
      description: "",
      accent: "from-violet-500 to-blue-500",
      category: "home-hero",
      sortOrder: 1,
      isActive: true,
    },
  ];

  for (const img of images) {
    await db.siteImage.upsert({
      where: { key: img.key },
      update: {
        src: img.src,
        alt: img.alt,
        caption: img.caption,
        description: img.description,
        accent: img.accent,
        category: img.category,
        sortOrder: img.sortOrder,
        isActive: img.isActive,
      },
      create: img,
    });
    console.log(`✓ Seeded: ${img.key}`);
  }

  console.log(`\nDone. ${images.length} site images seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
