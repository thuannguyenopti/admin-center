'use client'
import Template from "./components/template";
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
          <Template>
            {children}
          </Template>
        </AxiomProvider>
      </body>
    </html>
  );
}
