import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bonoriya - Authentic Ethnic Rice Bowls",
  description: "Ethnic rice bowls for modern lives. Healthy, homely North Eastern cuisine served fresh in eco-friendly packaging.",
  keywords: ["Bonoriya", "Rice Bowls", "Assamese", "North Eastern", "Ethnic Food", "Healthy Food", "Eco-Friendly"],
  authors: [{ name: "Bonoriya Team" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "Bonoriya - Authentic Ethnic Rice Bowls",
    description: "Ethnic rice bowls for modern lives. Healthy, homely North Eastern cuisine.",
    url: "https://bonoriya.com",
    siteName: "Bonoriya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bonoriya - Authentic Ethnic Rice Bowls",
    description: "Ethnic rice bowls for modern lives. Healthy, homely North Eastern cuisine.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
