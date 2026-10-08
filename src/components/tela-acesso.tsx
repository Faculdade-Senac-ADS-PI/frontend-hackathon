import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function TelaAcesso({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[#ebebeb] bg-white">
        <div className="barra-bnb" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Banco do Nordeste — Início">
            <Image src="/logo-bnb.svg" alt="Banco do Nordeste" width={166} height={77} className="h-11 w-auto" priority />
            <span className="hidden border-l border-[#ebebeb] pl-3 text-xs leading-tight text-[#727c81] sm:block">
              Lei do Bem
              <br />
              <strong className="font-semibold text-[#a6193c]">STS 2026</strong>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[#d3dadd] px-3 py-2 text-sm font-semibold text-[#4a4a4a] transition-colors hover:border-[#a6193c] hover:text-[#a6193c]"
          >
            ← Voltar ao Início
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#a6193c]">Banco do Nordeste · Lei do Bem</p>
          <h1 className="font-display mt-2 text-3xl text-balance text-[#333333] sm:text-4xl">{titulo}</h1>
          <p className="mt-3 max-w-md text-[#727c81]">{texto}</p>
        </div>
        <section className="neo flex min-w-0 flex-col gap-5 p-5 sm:p-8">{children}</section>
      </main>

      <footer className="border-t border-[#ebebeb] bg-[#f7f8f9]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-[#727c81] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 Banco do Nordeste — Protótipo STS · Hackathon</span>
          <span className="font-semibold text-[#a6193c]">Governo Federal · Desenvolvimento Regional</span>
        </div>
      </footer>
    </div>
  );
}
