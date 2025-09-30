import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SciCalc Next",
  description:
    "Scientific calculator for square roots, factorials, logarithms, and powers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
