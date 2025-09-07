import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unmixer - Clean Vocal Extraction",
  description: "Extract vocals and music cleanly from any audio file with professional quality results",
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
