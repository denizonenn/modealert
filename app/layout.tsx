import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModeAlert",
  description: "Never miss your favorite game modes again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}