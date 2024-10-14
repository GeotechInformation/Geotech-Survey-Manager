// Root Layout tsx

import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const inter = Inter({ subsets: ["latin"] });
const dm_serif_display = DM_Serif_Display({ weight: ['400'], subsets: ["latin"], variable: '--font-display' });
const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: "Geotech Survey Manager",
  description: "Survey Manager for Geotech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dm_serif_display.variable} ${montserrat.variable} relative`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}