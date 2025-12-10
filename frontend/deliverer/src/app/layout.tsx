import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/providers/AppProvider";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DONE Livreur",
  description: "Application livreur DONE Food Delivery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-[#0a0a0f] text-white min-h-screen`}>
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
              {children}
            </main>
            <MobileNav />
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

