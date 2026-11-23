import type { Metadata } from "next";
import { Montserrat, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { DeviconStylesheet } from "@/components/portfolio/devicon-stylesheet";
import { getSiteMetadata } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = getSiteMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      </head>
      <body className="min-h-full">
        <noscript>
          <style>{"#intro { display: none !important; }"}</style>
        </noscript>
        <DeviconStylesheet />
        {children}
      </body>
    </html>
  );
}
