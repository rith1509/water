import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Nav } from "@/components/site/nav";
import { CommandMenu } from "@/components/site/command-menu";
import { Cursor } from "@/components/site/cursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "commReach · Water at IIT Roorkee",
  description: "Student survey on rainwater harvesting and water waste across IIT Roorkee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Nav />
        <div className="relative z-10">{children}</div>
        <CommandMenu />
        <Cursor />
      </body>
    </html>
  );
}
