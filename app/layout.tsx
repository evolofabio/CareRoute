import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { DemoProvider } from "@/lib/demo/DemoProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareRoute — Cura di famiglia, organizzata",
    template: "%s · CareRoute",
  },
  description:
    "CareRoute è il percorso di cura per famiglie e operatori: farmaci, turni, documenti, spese e benessere — con calma, chiarezza e un’interfaccia a una mano.",
  applicationName: "CareRoute",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareRoute",
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "CareRoute — Cura di famiglia, organizzata",
    description:
      "Software di assistenza familiare: coordina farmaci, turni, documenti e spese senza caos.",
    locale: "it_IT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A4D3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${manrope.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-dvh bg-fog font-sans text-ink antialiased">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
