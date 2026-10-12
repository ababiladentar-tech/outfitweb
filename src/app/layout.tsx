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

export const metadata: Metadata = {
  title: "Outfitly — Find Your Perfect Style | Fashion & UMKM Community",
  description: "Temukan paduan outfit terbaik sesuai rona warna, siluet tubuh, dan gaya personalmu dengan kurasi produk UMKM fashion lokal dan preloved terverifikasi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EFEFEA] text-[#162D24]">{children}</body>
    </html>
  );
}
