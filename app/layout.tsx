import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Oracle Labs · Trusted IoT Data On-Chain",
  description: "把真实世界的数据，可信上链",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "AI Oracle Labs",
    description: "AI 增强的 IoT 预言机，一站式解决方案",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
