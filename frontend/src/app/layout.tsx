import { Roboto } from "next/font/google"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import type { Metadata, Viewport } from "next"
import type React from "react"
import "./globals.css"
import { ShowNotification } from "./components/showNotification"
import { ThemeProvider, Typography } from "@mui/material"
import theme from "./theme"
import Link from "next/link"

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
      <body style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "1fr auto",
      }}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <div>
              <ShowNotification>{children}</ShowNotification>
            </div>
            <footer
              style={{
                marginTop: "0.5rem",
                width: "100%",
                textAlign: "center",
                padding: "1rem 0",
                background: "#fff",
                boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="subtitle1">
                Developed by:
                Laszlo Zala, ELTE Eötvös Loránd University |
                Mark Barsi-Siminszky, University of Toronto
              </Typography>
              <Typography variant="subtitle1">
                <Link href="https://github.com/mbs9/substr">GitHub Repository</Link>
                {" | "}
                Git commit: {process.env.GIT_COMMIT_ID}
              </Typography>
            </footer>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
