import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Provedor } from "@/components/provedor";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Banco do Nordeste — Lei do Bem | Portal de Projetos de Inovação",
  description:
    "Acesso da equipe de P&D e dos proponentes para a análise preliminar de enquadramento na Lei do Bem.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${heebo.variable} antialiased`}>
        <Provedor>{children}</Provedor>
      </body>
    </html>
  );
}
