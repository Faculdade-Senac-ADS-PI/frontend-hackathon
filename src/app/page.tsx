"use client";

import Link from "next/link";
import { useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";

const ETAPAS_IMPLEMENTACAO = [
  {
    numero: "01",
    titulo: "Cadastro da Empresa Proponente",
    descricao:
      "A empresa cria sua conta gratuita de proponente em menos de 1 minuto, tendo acesso imediato ao painel de submissão.",
  },
  {
    numero: "02",
    titulo: "Submissão da Proposta de Inovação",
    descricao:
      "Você descreve o projeto, detalha a incerteza tecnológica e os dispêndios orçados para o desenvolvimento experimental.",
  },
  {
    numero: "03",
    titulo: "Análise Técnica pelo Especialista (com IA)",
    descricao:
      "Nossa equipe de analistas valida os 5 critérios do Manual de Frascati com suporte de inteligência artificial sobre as normativas do MCTI.",
  },
  {
    numero: "04",
    titulo: "Parecer Preliminar e Rastro Seguro",
    descricao:
      "Você recebe a decisão fundamentada com rastro auditável, garantindo conformidade e segurança jurídica para o aproveitamento fiscal.",
  },
];

const REQUISITOS = [
  {
    titulo: "Regime de Lucro Real",
    texto: "A empresa deve ser tributada pelo Lucro Real no exercício fiscal correspondente.",
    valido: true,
  },
  {
    titulo: "Regularidade Fiscal (CND)",
    texto: "Certidão Negativa de Débitos ou CND Positiva com Efeito de Negativa junto à Receita Federal e PGFN.",
    valido: true,
  },
  {
    titulo: "Investimento em P&D / Não-Rotina",
    texto: "Atividades que buscam superação de incerteza técnica, criação de novos produtos ou processos.",
    valido: true,
  },
  {
    titulo: "Lucro Fiscal no Exercício",
    texto: "Necessário para absorver a dedução do benefício na base de cálculo de IRPJ e CSLL.",
    valido: true,
  },
];

export default function Inicio() {
  const [investimento, setInvestimento] = useState<number>(600000);

  const beneficioEstimado = investimento * 0.34;
  const deducaoBaseCalculo = investimento * 0.6;

  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-[#C4161C]" />

      {/* Header Institucional Neumorphic */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#C4161C] font-display text-lg text-white shadow-[4px_4px_10px_#c8cad1]">
            H
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl leading-none">Hackthon</p>
            <p className="truncate text-xs tracking-wide text-[#5E6570]">STS 2026 · Banco do Nordeste</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <BotaoSecundario asChild className="hidden sm:inline-flex">
            <Link href="/entrar">Entrar</Link>
          </BotaoSecundario>
          <BotaoPrimario asChild>
            <Link href="/cadastrar">Cadastrar Proponente</Link>
          </BotaoPrimario>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 sm:px-6">
        {/* Hero Section de Alta Conversão */}
        <section className="grid items-center gap-8 pt-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,24rem)]">
          <div className="neo min-w-0 p-6 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8E1218]">
              <span className="h-2 w-2 rounded-full bg-[#C4161C]" />
              Incentivo Fiscal à Inovação (Lei 11.196/05)
            </span>

            <h1 className="font-display mt-4 text-3xl leading-tight text-balance text-[#2C3138] sm:text-4xl lg:text-5xl">
              Reduza até 34% dos custos de inovação da sua empresa.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#5E6570] sm:text-lg">
              Sua empresa desenvolve novos softwares, produtos ou melhorias tecnológicas com incerteza científica?
              A <strong>Lei do Bem</strong> permite abater investimentos em P&D diretamente dos impostos federais (IRPJ e CSLL).
            </p>

            <p className="mt-2 text-sm text-[#5E6570]">
              Nossa plataforma conecta seu projeto à esteira dos <strong>analistas técnicos especializados</strong> para análise
              preliminar de elegibilidade, gerando o rastro comprobatório necessário.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <BotaoPrimario asChild className="text-base px-6 py-3">
                <Link href="/cadastrar">Submeter Proposta ao Analista →</Link>
              </BotaoPrimario>
              <BotaoSecundario asChild>
                <Link href="/entrar">Já sou cadastrado</Link>
              </BotaoSecundario>
            </div>
          </div>

          {/* Card Rápido de Ação */}
          <aside className="neo flex flex-col justify-between gap-6 p-6 sm:p-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Acesso Imediato</span>
              <h2 className="font-display text-2xl text-[#2C3138] mt-1">Portal do Proponente</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5E6570]">
                Cadastre sua empresa e submeta sua proposta na esteira de análise em poucos passos.
              </p>
            </div>

            <div className="neo-inset p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#2C3138] font-semibold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Sem custos de adesão inicial
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2C3138] font-semibold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Critérios do Manual de Frascati
              </div>
              <div className="flex items-center gap-2 text-xs text-[#2C3138] font-semibold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                Parecer de analista com rastro seguro
              </div>
            </div>

            <BotaoPrimario asChild className="w-full">
              <Link href="/cadastrar">Criar Conta Gratuita</Link>
            </BotaoPrimario>
          </aside>
        </section>

        {/* O Que É a Lei do Bem */}
        <section className="flex flex-col gap-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Entenda o Benefício</span>
            <h2 className="font-display text-3xl text-[#2C3138] mt-1">O que é a Lei do Bem?</h2>
            <p className="mt-2 text-base leading-relaxed text-[#5E6570]">
              Criada pela <strong>Lei nº 11.196/2005</strong>, a Lei do Bem é o principal mecanismo do governo brasileiro
              para fomentar inovação tecnológica no setor empresarial. Diferente de editais com aprovação prévia, a Lei do Bem
              é de <em>fruição direta</em>: a empresa executa os projetos e usufrui do incentivo na apuração contábil anual.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="neo p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-[#C4161C] font-display text-xl font-bold">
                60%
              </div>
              <h3 className="font-display text-xl mt-4 text-[#2C3138]">Dedução em IRPJ e CSLL</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5E6570]">
                Exclusão de 60% a 80% do valor gasto em P&D da base de cálculo do IRPJ e da CSLL, gerando economia líquida de até 34%.
              </p>
            </article>

            <article className="neo p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-[#C4161C] font-display text-xl font-bold">
                50%
              </div>
              <h3 className="font-display text-xl mt-4 text-[#2C3138]">Redução de IPI em Máquinas</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5E6570]">
                Desconto de 50% no IPI incidente sobre equipamentos, máquinas e aparelhos destinados exclusivamente a P&D.
              </p>
            </article>

            <article className="neo p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-[#C4161C] font-display text-xl font-bold">
                100%
              </div>
              <h3 className="font-display text-xl mt-4 text-[#2C3138]">Amortização Acelerada</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5E6570]">
                Depreciação e amortização acelerada no próprio ano de aquisição de bens voltados à pesquisa tecnológica.
              </p>
            </article>
          </div>
        </section>

        {/* Simulador Interativo Neumorphic de Benefício */}
        <section className="neo p-6 sm:p-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Simulador Interativo</span>
            <h2 className="font-display text-3xl text-[#2C3138] mt-1">Quanto sua empresa pode economizar?</h2>
            <p className="mt-2 text-sm text-[#5E6570]">
              Informe a estimativa anual de gastos em equipe técnica, materiais e serviços voltados a desenvolvimento experimental:
            </p>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Investimento Anual em P&D</span>
                  <span className="font-display text-lg text-[#C4161C]">{formatarReal(investimento)}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={5000000}
                  step={50000}
                  value={investimento}
                  onChange={(e) => setInvestimento(Number(e.target.value))}
                  className="w-full accent-[#C4161C] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#5E6570] mt-1">
                  <span>R$ 100 mil</span>
                  <span>R$ 2.5 milhões</span>
                  <span>R$ 5 milhões</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[300000, 600000, 1200000].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setInvestimento(valor)}
                    className={`neo-inset p-3 text-xs font-semibold rounded-xl transition-all ${
                      investimento === valor ? "outline-2 outline-[#C4161C]" : ""
                    }`}
                  >
                    {formatarReal(valor)}
                  </button>
                ))}
              </div>
            </div>

            <div className="neo-inset flex flex-col justify-between p-6">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-[#5E6570]">Economia Tributária Estimada</p>
                <p className="font-display text-3xl font-bold text-emerald-700 mt-2">
                  {formatarReal(beneficioEstimado)}
                </p>
                <p className="text-xs text-[#5E6570] mt-1">
                  Base de dedução adicional no IRPJ/CSLL: {formatarReal(deducaoBaseCalculo)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#D9DCE3]">
                <BotaoPrimario asChild className="w-full">
                  <Link href="/cadastrar">Submeter com este Potencial →</Link>
                </BotaoPrimario>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona a Implementação */}
        <section className="flex flex-col gap-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Jornada do Proponente</span>
            <h2 className="font-display text-3xl text-[#2C3138] mt-1">Como funciona a implementação?</h2>
            <p className="mt-2 text-base leading-relaxed text-[#5E6570]">
              Entenda como seu projeto sai da ideia e passa pela esteira de validação técnica dos analistas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS_IMPLEMENTACAO.map((etapa) => (
              <article key={etapa.numero} className="neo flex flex-col justify-between p-6">
                <div>
                  <span className="font-display text-2xl font-bold text-[#C4161C]">{etapa.numero}</span>
                  <h3 className="font-display text-lg text-[#2C3138] mt-2">{etapa.titulo}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#5E6570]">{etapa.descricao}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Requisitos de Elegibilidade */}
        <section className="neo p-6 sm:p-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Critérios de Enquadramento</span>
            <h2 className="font-display text-2xl text-[#2C3138] mt-1">Quem pode se beneficiar?</h2>
            <p className="mt-1 text-sm text-[#5E6570]">
              Para que o analista aprove o enquadramento preliminar, sua empresa deve atender aos seguintes critérios:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REQUISITOS.map((req) => (
              <div key={req.titulo} className="neo-inset p-4">
                <span className="text-xs font-bold text-[#8E1218] uppercase">{req.titulo}</span>
                <p className="text-xs text-[#5E6570] mt-1 leading-relaxed">{req.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final para Conversão do Proponente */}
        <section className="neo flex flex-col items-center justify-between gap-6 p-8 text-center sm:p-12 lg:flex-row lg:text-left">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl text-[#2C3138]">
              Pronto para transformar inovação em benefício fiscal?
            </h2>
            <p className="mt-2 text-base text-[#5E6570]">
              Crie agora a sua conta de proponente e envie sua proposta para a esteira de análise do analista.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <BotaoPrimario asChild className="text-base px-6 py-3">
              <Link href="/cadastrar">Cadastrar como Proponente</Link>
            </BotaoPrimario>
            <BotaoSecundario asChild>
              <Link href="/entrar">Acessar Minha Área</Link>
            </BotaoSecundario>
          </div>
        </section>
      </main>
    </div>
  );
}

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
