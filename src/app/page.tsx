import Link from "next/link";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";

const papeis = [
  {
    titulo: "Proponente",
    texto: "Cria a própria conta e, na próxima etapa, envia o material do projeto para análise.",
  },
  {
    titulo: "Analista",
    texto: "Entra para revisar o enquadramento. A conta nasce com a administração, não no cadastro público.",
  },
  {
    titulo: "ADM",
    texto: "Cria as pessoas, define o papel e desativa quem não deve mais acessar o sistema.",
  },
];

export default function Inicio() {
  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-[#C4161C]" />
      <header className="mx-auto flex max-w-6xl items-center px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#C4161C] font-display text-lg text-white">
            H
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl leading-none">Hackthon</p>
            <p className="truncate text-xs tracking-wide text-[#5E6570]">STS 2026 · Banco do Nordeste</p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]">
          <section className="neo min-w-0 p-6 sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8E1218]">Lei do Bem</p>
            <h1 className="font-display mt-3 text-3xl leading-tight text-balance text-[#2C3138] sm:text-4xl lg:text-5xl">
              Análise preliminar de elegibilidade, com rastro.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5E6570] sm:text-lg">
              A equipe de P&D precisa decidir se um projeto é pesquisa ou rotina, e explicar essa decisão anos
              depois. O Hackthon organiza esse caminho. Nesta versão, o que já funciona é o acesso: quem entra, e
              com qual papel.
            </p>
          </section>
          <aside className="neo flex h-fit min-w-0 flex-col gap-4 p-6 sm:p-8">
            <h2 className="font-display text-2xl">Acessar</h2>
            <p className="text-sm leading-relaxed text-[#5E6570]">
              Proponente se cadastra aqui. Analista e ADM recebem a conta de quem administra.
            </p>
            <BotaoPrimario asChild className="w-full">
              <Link href="/entrar">Entrar</Link>
            </BotaoPrimario>
            <BotaoSecundario asChild className="w-full">
              <Link href="/cadastrar">Cadastrar como proponente</Link>
            </BotaoSecundario>
          </aside>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Papéis">
          {papeis.map((papel) => (
            <article key={papel.titulo} className="neo-inset min-w-0 p-5">
              <h2 className="font-display text-xl">{papel.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5E6570]">{papel.texto}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
