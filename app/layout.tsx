import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})


export const metadata: Metadata = {
  metadataBase: new URL("https://nvcctech.club"),
  title: {
    default: "NVCC Tech Club",
    template: "%s | NVCC Tech Club",
  },
  description:
    "Build projects, learn new tech, and meet makers at Northern Virginia Community College (Loudoun). Workshops, hackathons, and student-led demos—open to all majors.",
  keywords: [
    "NVCC",
    "Tech Club",
    "Northern Virginia Community College",
    "Loudoun",
    "coding",
    "programming",
    "workshops",
    "hackathon",
    "student club",
    "technology",
  ],
  openGraph: {
    type: "website",
    url: "https://nvcctech.club",
    title: "NVCC Tech Club",
    description:
      "Student-run tech community at NVCC (Loudoun). Join us for workshops, projects, and hackathons.",
    siteName: "NVCC Tech Club",
    images: [
      {
        url: "/loundon.jpg", // add this image to public/ (1200×630 recommended)
        width: 1200,
        height: 630,
        alt: "NVCC Tech Club",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NVCC Tech Club",
    description:
      "Workshops, projects, and hackathons at NVCC (Loudoun). All majors welcome.",
    images: ["/loundon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 w-full pt-32">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}