import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import type { Metadata, Viewport } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ShowNotification } from './components/showNotification';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Substring Tiler",
  description:
    "A tool for comparing two texts and highlighting their similarities/differences.",
};

export const viewport: Viewport = {
  themeColor: 'rgb(25, 118, 210)',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ShowNotification>{children}</ShowNotification>
      </body>
    </html>
  );
}
