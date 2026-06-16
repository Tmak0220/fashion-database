import type { Metadata } from "next"
import { Bodoni_Moda, Noto_Serif_JP } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Script from "next/script"
import { AuthModalProvider } from "@/context/AuthModalContext"
import AuthModal from "@/components/AuthModal"
import { Suspense } from "react"
import { AuthListener } from "@/components/AuthListener"

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://fashdb.com"),
  title: {
    default: "ファッションデータベース",
    template: "%s | ファッションデータベース",
  },
  description: "ブランド・デザイナー・コレクションをまとめたファッションデータベース",
  keywords: ["ファッション", "ブランド", "デザイナー", "コレクション", "モード", "ラグジュアリー", "fashion", "designer", "brand", "collection"],
  openGraph: {
    title: "ファッションデータベース",
    description: "ブランド・デザイナー・コレクションをまとめたファッションデータベース",
    url: "https://fashdb.com",
    siteName: "ファッションデータベース",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ファッションデータベース",
    description: "ブランド・デザイナー・コレクションをまとめたファッションデータベース",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`
        ${bodoniModa.variable}
        ${notoSerifJP.variable}
        h-full
        antialiased
      `}
    >
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body
        className="
          min-h-screen
          flex
          flex-col
          text-foreground
          bg-background
        "
      >
        <AuthListener />
        <AuthModalProvider>
          <Suspense fallback={<div className="h-[81px] bg-background border-b border-border" />}>
            <Header />
          </Suspense>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AuthModal />
        </AuthModalProvider>
      </body>
    </html>
  )
}