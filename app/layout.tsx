import React from "react";
import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({ 
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "FoodBuddy AI",
  description: "ผู้ช่วยวางแผนมื้ออาหารอัจฉริยะส่วนตัวของคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.className} bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}