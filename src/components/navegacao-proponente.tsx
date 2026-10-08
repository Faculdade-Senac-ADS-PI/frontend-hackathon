"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  {
    nome: "Visão Geral",
    href: "/proponente",
    icone: "📊",
    descricao: "Métricas e resumo do portfólio",
  },
  {
    nome: "Envios",
    href: "/proponente/envios",
    icone: "📤",
    descricao: "Submissão e projetos de P&D",
  },
  {
    nome: "Acompanhamento",
    href: "/proponente/acompanhamento",
    icone: "⏱️",
    descricao: "Timeline e pareceres técnicos",
  },
  {
    nome: "Configurações",
    href: "/proponente/configuracoes",
    icone: "⚙️",
    descricao: "Dados da empresa e perfil fiscal",
  },
];

export function NavegacaoProponente() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação do Proponente" className="neo p-2">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 list-none p-0 m-0">
        {ABAS.map((aba) => {
          const ativo =
            aba.href === "/proponente"
              ? pathname === "/proponente"
              : pathname.startsWith(aba.href);

          return (
            <li key={aba.href} className="m-0 p-0">
              <Link
                href={aba.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-center transition-all ${
                  ativo
                    ? "neo-inset font-bold text-[#8a1533] shadow-[inset_3px_3px_6px_#e3e5e9,inset_-3px_-3px_6px_#ffffff]"
                    : "text-[#727c81] hover:text-[#333333] hover:bg-[#ebebeb]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base" aria-hidden="true">
                    {aba.icone}
                  </span>
                  <span className="text-sm font-semibold">{aba.nome}</span>
                </div>
                <span className="hidden text-[11px] font-normal text-[#828f95] lg:inline">
                  {aba.descricao}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
