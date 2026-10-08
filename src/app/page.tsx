"use client";

import Link from "next/link";
import { useState } from "react";
import { BarraSegmentos, CabecalhoSite, Rodape } from "@/components/cabecalho";
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
  },
  {
    titulo: "Regularidade Fiscal (CND)",
    texto: "Certidão Negativa de Débitos ou CND Positiva com Efeito de Negativa junto à Receita Federal e PGFN.",
  },
  {
    titulo: "Investimento em P&D / Não-Rotina",
    texto: "Atividades que buscam superação de incerteza técnica, criação de novos produtos ou processos.",
  },
  {
    titulo: "Lucro Fiscal no Exercício",
    texto: "Necessário para absorver a dedução do benefício na base de cálculo de IRPJ e CSLL.",
  },
];

const SERVICOS = [
  {
    sigla: "PP",
    titulo: "Portal do Proponente",
    texto: "Cadastre sua empresa e submeta propostas de inovação com upload de documentos em PDF e CSV.",
    href: "/cadastrar",
    acao: "Saiba mais",
  },
  {
    sigla: "IA",
    titulo: "Análise por IA (Frascati)",
    texto: "Avaliação automática dos 5 critérios do Manual de Frascati com apoio do agente de inteligência artificial.",
    href: "/#jornada",
    acao: "Saiba mais",
  },
  {
    sigla: "AT",
    titulo: "Esteira do Analista Técnico",
    texto: "Deliberação fundamentada por analistas especializados, com notas, justificativas e histórico de versões.",
    href: "/entrar",
    acao: "Saiba mais",
  },
  {
    sigla: "RF",
    titulo: "Benefício Fiscal — Lei do Bem",
    texto: "Até 34% de economia com dedução de investimentos em P&D no IRPJ e na CSLL, com rastro comprobatório.",
    href: "/#simulador",
    acao: "Saiba mais",
  },
];

const NOTICIAS = [
  {
    data: "07/10/2026",
    titulo: "Campanha MPE impulsiona crédito para micro e pequenas empresas do Nordeste",
    texto: "Nova onda de crédito produtivo está disponível para empresas que buscam investir em inovação e tecnologia.",
  },
  {
    data: "03/10/2026",
    titulo: "BNB aprova protocolo único para análise de propostas da Lei do Bem",
    texto: "Plataforma integra submissão digital, análise por inteligência artificial e parecer técnico em um único fluxo.",
  },
  {
    data: "29/09/2026",
    titulo: "Guia dos 5 critérios do Manual de Frascati disponível para proponentes",
    texto: "Material reúne exigências de novelty, incrementalidade e incerteza tecnológica para enquadramento fiscal.",
  },
];

const ACESSOS = [
  {
    titulo: "Portal do Proponente",
    texto: "Envie e acompanhe suas propostas de inovação.",
    href: "/entrar",
    papel: "Proponente",
  },
  {
    titulo: "Área do Analista",
    texto: "Consulte a fila técnica e delibere propostas.",
    href: "/entrar",
    papel: "Analista",
  },
  {
    titulo: "Administração",
    texto: "Gerencie contas, papéis e acessos do sistema.",
    href: "/entrar",
    papel: "ADM",
  },
];

export default function Inicio() {
  const [investimento, setInvestimento] = useState<number>(600000);

  const beneficioEstimado = investimento * 0.34;
  const deducaoBaseCalculo = investimento * 0.6;

  return (
    <div className="flex min-h-screen flex-col">
      <CabecalhoSite atual="inicio" />
      <BarraSegmentos />

      <main className="flex-1">
        {/* Hero — banner de campanha no modelo BNB (1920x768) */}
        <section className="bg-[#a6193c] text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,22rem)] lg:py-16">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-[#f68b1f]" />
                Incentivo Fiscal à Inovação — Lei 11.196/05
              </span>

              <h1 className="mt-4 text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">
                Reduza até 34% dos custos de inovação da sua empresa.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                A <strong>Lei do Bem</strong> permite abater investimentos em P&amp;D diretamente dos impostos federais
                (IRPJ e CSLL). Submeta sua proposta e receba o parecer técnico com rastro comprobatório.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/cadastrar"
                  className="inline-flex items-center rounded-md bg-[#f68b1f] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#d9751a]"
                >
                  Submeter Proposta →
                </Link>
                <Link
                  href="/#servicos"
                  className="inline-flex items-center rounded-md border border-white/70 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Saiba mais
                </Link>
              </div>
            </div>

            {/* Card de acesso rápido (destaque do banner) */}
            <aside className="rounded-lg bg-white p-6 text-[#4a4a4a] shadow-lg sm:p-7">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">Acesso Imediato</span>
              <h2 className="mt-1 text-2xl font-bold text-[#333333]">Acesse sua Conta</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#727c81]">
                Entre com sua conta de proponente, analista ou administração para acessar a esteira de análise.
              </p>

              <ul className="mt-4 space-y-2.5 border-t border-[#ebebeb] pt-4 text-sm">
                <li className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ddf3e1] text-xs font-bold text-[#2f9e44]">
                    ✓
                  </span>
                  Cadastro gratuito de proponente
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ddf3e1] text-xs font-bold text-[#2f9e44]">
                    ✓
                  </span>
                  Critérios do Manual de Frascati
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ddf3e1] text-xs font-bold text-[#2f9e44]">
                    ✓
                  </span>
                  Parecer de analista com rastro seguro
                </li>
              </ul>

              <div className="mt-5 flex flex-col gap-2">
                <BotaoPrimario asChild className="w-full">
                  <Link href="/entrar">Acessar Conta</Link>
                </BotaoPrimario>
                <BotaoSecundario asChild className="w-full">
                  <Link href="/cadastrar">Criar Conta Gratuita</Link>
                </BotaoSecundario>
              </div>
            </aside>
          </div>
        </section>

        {/* O que é a Lei do Bem */}
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">Entenda o Benefício</span>
            <h2 className="font-display mt-1 text-3xl text-[#333333]">O que é a Lei do Bem?</h2>
            <p className="mt-3 text-base leading-relaxed text-[#727c81]">
              Criada pela <strong>Lei nº 11.196/2005</strong>, a Lei do Bem é o principal mecanismo do governo
              brasileiro para fomentar inovação tecnológica no setor empresarial. Diferente de editais com aprovação
              prévia, é de <em>fruição direta</em>: a empresa executa os projetos e usufrui do incentivo na apuração
              contábil anual.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="neo p-5">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-[#fdf0f3] text-lg font-bold text-[#a6193c]">
                60%
              </div>
              <h3 className="mt-3 text-base font-bold text-[#333333]">Dedução em IRPJ e CSLL</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#727c81]">
                Exclusão de 60% a 80% do valor gasto em P&amp;D da base de cálculo, com economia de até 34%.
              </p>
            </article>

            <article className="neo p-5">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-[#fdf0f3] text-lg font-bold text-[#a6193c]">
                50%
              </div>
              <h3 className="mt-3 text-base font-bold text-[#333333]">Redução de IPI em Máquinas</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#727c81]">
                Desconto de 50% no IPI sobre equipamentos e máquinas destinados exclusivamente a P&amp;D.
              </p>
            </article>

            <article className="neo p-5">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-[#fdf0f3] text-lg font-bold text-[#a6193c]">
                100%
              </div>
              <h3 className="mt-3 text-base font-bold text-[#333333]">Amortização Acelerada</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#727c81]">
                Depreciação e amortização acelerada no próprio ano de aquisição de bens de pesquisa.
              </p>
            </article>
          </div>
        </section>

        {/* Produtos e Serviços — cards no modelo MPE/Crediamigo/Agroamigo */}
        <section id="servicos" className="bg-[#f7f8f9] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">
                Produtos e Serviços
              </span>
              <h2 className="font-display mt-1 text-3xl text-[#333333]">Tudo para submeter sua proposta</h2>
              <p className="mt-2 text-base leading-relaxed text-[#727c81]">
                Do cadastro ao parecer final: um único fluxo digital para o enquadramento preliminar na Lei do Bem.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICOS.map((servico) => (
                <article key={servico.titulo} className="neo flex flex-col p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-[#a6193c] text-lg font-bold text-white">
                    {servico.sigla}
                  </span>
                  <h3 className="font-display mt-4 text-lg text-[#333333]">{servico.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#727c81]">{servico.texto}</p>
                  <Link
                    href={servico.href}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#a6193c] transition-colors hover:text-[#8a1533]"
                  >
                    {servico.acao} →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Acesso rápido — cards "Acessar" */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">Acesso Rápido</span>
            <h2 className="font-display mt-1 text-3xl text-[#333333]">Entre com o seu perfil</h2>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {ACESSOS.map((acesso) => (
              <article key={acesso.titulo} className="neo flex flex-col items-start p-6">
                <span className="rounded-md bg-[#fdf0f3] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#a6193c]">
                  {acesso.papel}
                </span>
                <h3 className="font-display mt-3 text-lg text-[#333333]">{acesso.titulo}</h3>
                <p className="mt-1.5 flex-1 text-sm text-[#727c81]">{acesso.texto}</p>
                <BotaoPrimario asChild className="mt-4 w-full">
                  <Link href={acesso.href}>Acessar</Link>
                </BotaoPrimario>
              </article>
            ))}
          </div>
        </section>

        {/* Simulador Interativo */}
        <section id="simulador" className="bg-[#f7f8f9] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="neo p-6 sm:p-10">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">
                  Simulador Interativo
                </span>
                <h2 className="font-display mt-1 text-3xl text-[#333333]">
                  Quanto sua empresa pode economizar?
                </h2>
                <p className="mt-2 text-sm text-[#727c81]">
                  Informe a estimativa anual de gastos em equipe técnica, materiais e serviços voltados a
                  desenvolvimento experimental:
                </p>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex justify-between text-sm font-semibold">
                      <span>Investimento Anual em P&amp;D</span>
                      <span className="text-lg text-[#a6193c]">{formatarReal(investimento)}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={5000000}
                      step={50000}
                      value={investimento}
                      onChange={(e) => setInvestimento(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#a6193c]"
                    />
                    <div className="mt-1 flex justify-between text-xs text-[#727c81]">
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
                        className={`rounded-md border p-3 text-xs font-semibold transition-colors ${
                          investimento === valor
                            ? "border-[#a6193c] bg-[#fdf0f3] text-[#a6193c]"
                            : "border-[#ebebeb] bg-[#f7f8f9] text-[#4a4a4a] hover:border-[#a6193c]"
                        }`}
                      >
                        {formatarReal(valor)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="neo-inset flex flex-col justify-between p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#727c81]">
                      Economia Tributária Estimada
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[#2f9e44]">{formatarReal(beneficioEstimado)}</p>
                    <p className="mt-1 text-xs text-[#727c81]">
                      Base de dedução adicional no IRPJ/CSLL: {formatarReal(deducaoBaseCalculo)}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#ebebeb] pt-4">
                    <BotaoPrimario asChild className="w-full">
                      <Link href="/cadastrar">Submeter com este Potencial →</Link>
                    </BotaoPrimario>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jornada do Proponente */}
        <section id="jornada" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">
              Jornada do Proponente
            </span>
            <h2 className="font-display mt-1 text-3xl text-[#333333]">Como funciona a implementação?</h2>
            <p className="mt-2 text-base leading-relaxed text-[#727c81]">
              Entenda como seu projeto sai da ideia e passa pela esteira de validação técnica dos analistas.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS_IMPLEMENTACAO.map((etapa) => (
              <article key={etapa.numero} className="neo flex flex-col p-6">
                <span className="text-2xl font-bold text-[#f68b1f]">{etapa.numero}</span>
                <h3 className="mt-2 text-lg font-bold text-[#333333]">{etapa.titulo}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#727c81]">{etapa.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Requisitos de Elegibilidade */}
        <section className="bg-[#f7f8f9] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">
                Critérios de Enquadramento
              </span>
              <h2 className="font-display mt-1 text-2xl text-[#333333]">Quem pode se beneficiar?</h2>
              <p className="mt-1 text-sm text-[#727c81]">
                Para que o analista aprove o enquadramento preliminar, sua empresa deve atender aos seguintes
                critérios:
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REQUISITOS.map((req) => (
                <div key={req.titulo} className="neo p-4">
                  <span className="text-xs font-bold uppercase text-[#a6193c]">{req.titulo}</span>
                  <p className="mt-1 text-xs leading-relaxed text-[#727c81]">{req.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Últimas Notícias */}
        <section id="noticias" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#a6193c]">Institucional</span>
              <h2 className="font-display mt-1 text-3xl text-[#333333]">Últimas Notícias</h2>
            </div>
            <Link
              href="/#noticias"
              className="text-sm font-bold text-[#a6193c] transition-colors hover:text-[#8a1533]"
            >
              Ver mais →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {NOTICIAS.map((noticia) => (
              <article key={noticia.titulo} className="neo flex flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#f68b1f]">{noticia.data}</span>
                <h3 className="mt-2 text-base font-bold leading-snug text-[#333333]">{noticia.titulo}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#727c81]">{noticia.texto}</p>
                <Link
                  href="/#noticias"
                  className="mt-4 self-start text-sm font-bold text-[#a6193c] transition-colors hover:text-[#8a1533]"
                >
                  Saiba mais →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-[#a6193c] text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 lg:flex-row lg:text-left">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">Pronto para transformar inovação em benefício fiscal?</h2>
              <p className="mt-2 text-base text-white/90">
                Crie agora a sua conta de proponente e envie sua proposta para a esteira de análise.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
              <Link
                href="/cadastrar"
                className="inline-flex items-center rounded-md bg-[#f68b1f] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#d9751a]"
              >
                Cadastrar como Proponente
              </Link>
              <Link
                href="/entrar"
                className="inline-flex items-center rounded-md border border-white/70 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Acessar Minha Área
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
