import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unmixer - AI-Powered Vocal Separation | Extract Vocals & Instrumentals",
  description: "Professional AI-powered vocal separation. Extract vocals and instrumentals from any audio file with studio-quality results. Perfect for DJs, producers, and music creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
