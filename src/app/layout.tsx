import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.universityName}`,
    default: `${SITE_CONFIG.universityName} | ${SITE_CONFIG.tagline}`,
  },
  description: `${SITE_CONFIG.universityName} (${SITE_CONFIG.universityShort}) - ${SITE_CONFIG.affiliation}. ${SITE_CONFIG.naacAccreditation}. Current Academic Year: ${SITE_CONFIG.academicYear}.`,
  icons: {
    icon: SITE_CONFIG.logoUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
