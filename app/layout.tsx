import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "StudyPlannerHub - Plan Your Studies, Ace Your Exams",
    template: "%s | StudyPlannerHub",
  },
  description: "Free tools for students: timetable builder, exam countdown, and weekly study plan generator. Plan smarter, study better.",
  keywords: ["study planner", "timetable", "exam countdown", "study schedule", "student tools"],
  authors: [{ name: "StudyPlannerHub" }],
  creator: "StudyPlannerHub",
  publisher: "StudyPlannerHub",
  metadataBase: new URL("https://studyplannerhub.com"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studyplannerhub.com",
    siteName: "StudyPlannerHub",
    title: "StudyPlannerHub - Plan Your Studies, Ace Your Exams",
    description: "Free tools for students: timetable builder, exam countdown, and weekly study plan generator.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "StudyPlannerHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyPlannerHub - Plan Your Studies, Ace Your Exams",
    description: "Free tools for students: timetable builder, exam countdown, and weekly study plan generator.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RQ875NGLYC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RQ875NGLYC');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
