import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageContext";
import { ThemeProvider } from "@/components/ThemeContext";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "WayMark AI",
  description: "Automated Physical Accessibility Auditing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased bg-[var(--bg-color)] text-[var(--color-foreground)] min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[var(--color-primary)] selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <div className="bg-mesh">
                <div className="bg-city-sketch"></div>
              </div>
              <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"></div>
              
              <Navbar />
              
              <main className="flex-grow pt-20 relative z-[5]">
                {children}
              </main>
              
              <Chatbot />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
