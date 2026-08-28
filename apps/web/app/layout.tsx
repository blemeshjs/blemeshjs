import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { MeshProvider } from "@/app/components/mesh-provider";
import "./globals.css";
import { Toast } from "@heroui/react";
import { QueryProvider } from "./components/query-provider";
import { ThemeProvider } from "next-themes";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BLEMeshJS Dashboard",
  description: "Bluetooth mesh development dashboard for building new blemeshjs SDK features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <Toast.Provider />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
