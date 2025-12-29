import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({ 
  weight: ["400", "500", "600", "700"], 
  subsets: ["latin"] 
})

export const metadata: Metadata = {
  title: "Tennis IdentifAI",
  description: "Tennis Performance Analysis System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  )
}