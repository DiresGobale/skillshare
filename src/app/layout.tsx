import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillMatch AI — Skill-Based Employment Recommendations",
  description:
    "AI-powered employment platform that matches job seekers and employers through verified skills, proficiency, and explainable match scores.",
  keywords: [
    "AI recruitment",
    "skill-based hiring",
    "job matching",
    "career platform",
    "employment",
  ],
  authors: [{ name: "SkillMatch AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
