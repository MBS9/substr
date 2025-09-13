import { Roboto } from "next/font/google"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"

import type { Metadata, Viewport } from "next"
import type React from "react"
import "./globals.css"
import { ShowNotification } from "./components/showNotification"
import { ThemeProvider, Typography } from "@mui/material"
import theme from "./theme"

export const metadata: Metadata = {
  title: "Substring Tiler",
  description:
    "A tool for comparing two texts and highlighting their similarities/differences.",
}

export const viewport: Viewport = {
  themeColor: "rgb(25, 118, 210)",
}

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={roboto.variable}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <ShowNotification>{children}</ShowNotification>
            <footer>
              <Typography>
                Developed by:
                Laszlo Zala, ELTE Eötvös Loránd University |
                Mark Barsi-Siminszky, University of Toronto
              </Typography>
            </footer>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
