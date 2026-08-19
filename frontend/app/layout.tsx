import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "WayMark AI - Accessibility Auditing",
  description: "AI-assisted physical accessibility auditing tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="bg-mesh">
            <div className="bg-city-sketch"></div>
          </div>
          <Navbar />
          <div className="relative min-h-screen flex flex-col pt-24">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
