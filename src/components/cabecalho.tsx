import Image from "next/image";
import Link from "next/link";

/**
 * Cabeçalho institucional no modelo do portal do Banco do Nordeste (bnb.gov.br):
 * barra vermelha superior, navbar branca com logo, navegação e botão "Acesse sua Conta".
 */
export function CabecalhoSite({ atual }: { atual?: string }) {
  return (
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

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`hidden rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:inline-flex ${
              atual === "inicio" ? "text-[#a6193c]" : "text-[#4a4a4a] hover:text-[#a6193c]"
            }`}
          >
            Início
          </Link>
          <Link
            href="/#servicos"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#4a4a4a] transition-colors hover:text-[#a6193c] sm:inline-flex"
          >
            Produtos e Serviços
          </Link>
          <Link
            href="/#noticias"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-[#4a4a4a] transition-colors hover:text-[#a6193c] md:inline-flex"
          >
            Notícias
          </Link>
          <Link
            href="/entrar"
            className="rounded-md border border-[#d3dadd] px-3 py-2 text-sm font-semibold text-[#4a4a4a] transition-colors hover:border-[#a6193c] hover:text-[#a6193c]"
          >
            Entrar
          </Link>
          <Link
            href="/entrar"
            className="btn-red !min-h-2.5 !px-4 !py-2 text-sm"
          >
            Acesse sua Conta
          </Link>
        </nav>
      </div>
    </header>
  );
}

/** Barra de segmentos (linha secundária), no modelo "Você · Empresas · ..." do BNB. */
export function BarraSegmentos() {
  const segmentos = [
    { rotulo: "Portal do Proponente", href: "/cadastrar" },
    { rotulo: "Área do Analista", href: "/entrar" },
    { rotulo: "Administração", href: "/entrar" },
    { rotulo: "Simulador de Benefício", href: "/#simulador" },
    { rotulo: "Como Funciona", href: "/#jornada" },
  ];

  return (
    <nav aria-label="Segmentos" className="border-b border-[#ebebeb] bg-[#f7f8f9]">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {segmentos.map((segmento) => (
          <Link
            key={segmento.rotulo}
            href={segmento.href}
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-[#4a4a4a] transition-colors hover:border-[#a6193c] hover:text-[#a6193c]"
          >
            {segmento.rotulo}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Rodapé institucional no modelo BNB: colunas de links, selos e barra de crédito. */
export function Rodape() {
  const colunas = [
    {
      titulo: "Lei do Bem",
      itens: [
        { rotulo: "Cadastro de Proponente", href: "/cadastrar" },
        { rotulo: "Submissão de Propostas", href: "/entrar" },
        { rotulo: "Simulador de Benefício", href: "/#simulador" },
        { rotulo: "Critérios de Elegibilidade", href: "/#servicos" },
      ],
    },
    {
      titulo: "Acesso Rápido",
      itens: [
        { rotulo: "Acesse sua Conta", href: "/entrar" },
        { rotulo: "Criar Conta Proponente", href: "/cadastrar" },
        { rotulo: "Área do Analista", href: "/entrar" },
        { rotulo: "Painel ADM", href: "/entrar" },
      ],
    },
    {
      titulo: "Institucional",
      itens: [
        { rotulo: "Tudo Sobre o Banco", href: "/" },
        { rotulo: "Transparência e Prestação de Contas", href: "/" },
        { rotulo: "Privacidade e Proteção de Dados", href: "/" },
        { rotulo: "Educação Financeira", href: "/" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t-4 border-[#a6193c] bg-[#f7f8f9]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Image src="/logo-bnb.svg" alt="Banco do Nordeste" width={166} height={77} className="h-12 w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-[#727c81]">
            Banco do Nordeste — Agência de Fomento do Nordeste e do Amapá. Protocolo único de projetos de inovação da
            Lei do Bem.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md border border-[#ebebeb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#727c81]">
              Selo Ética
            </span>
            <span className="rounded-md border border-[#ebebeb] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#727c81]">
              Selo LAI
            </span>
          </div>
        </div>

        {colunas.map((coluna) => (
          <div key={coluna.titulo}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#333333]">{coluna.titulo}</h3>
            <ul className="mt-3 space-y-2">
              {coluna.itens.map((item) => (
                <li key={item.rotulo}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#727c81] transition-colors hover:text-[#a6193c] hover:underline"
                  >
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-[#a6193c]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-white/90 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 Banco do Nordeste — Protótipo STS · Hackathon</span>
          <span className="font-semibold">Governo Federal · Desenvolvimento Regional</span>
        </div>
      </div>
    </footer>
  );
}
