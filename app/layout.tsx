import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cormorantGaramondSerif, interSans } from "./fonts";


export const metadata: Metadata = {
  title: "Bad as e bad",
  description: "Made with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${cormorantGaramondSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
