import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Provedor } from "@/components/provedor";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hackthon — Elegibilidade da Lei do Bem",
  description:
    "Acesso da equipe de P&D e dos proponentes para a análise preliminar de enquadramento na Lei do Bem.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        <Provedor>{children}</Provedor>
      </body>
    </html>
  );
}
