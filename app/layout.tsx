'use client'
import "./globals.css";
import { AxiomProvider } from "@optiaxiom/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AxiomProvider>
          {children}
        </AxiomProvider>
      </body>
    </html>
  );
}
