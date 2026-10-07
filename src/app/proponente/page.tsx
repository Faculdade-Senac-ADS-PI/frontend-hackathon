"use client";

import { Badge } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import { obterPropostas, type PropostaProponente } from "@/lib/propostas-proponente";

export default function ProponenteDashboard() {
  const [propostas, setPropostas] = useState<PropostaProponente[]>([]);

  useEffect(() => {
    setPropostas(obterPropostas());
  }, []);

  const metricas = useMemo(() => {
    const total = propostas.length;
    const emAnalise = propostas.filter((p) => p.status === "em_analise" || p.status === "triagem").length;
    const elegiveis = propostas.filter((p) => p.status === "elegivel").length;
    const dispendioTotal = propostas.reduce((acc, cur) => acc + cur.dispendioTotal, 0);
    const beneficioTotal = propostas.reduce((acc, cur) => acc + cur.beneficioEstimado, 0);
    return { total, emAnalise, elegiveis, dispendioTotal, beneficioTotal };
  }, [propostas]);

  return (
    <Casca
      titulo="Painel do Proponente — Lei do Bem"
      descricao="Visão geral do portfólio de projetos de inovação, métricas fiscais estimadas e status na esteira de análise."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoPrimario asChild>
          <Link href="/proponente/envios">+ Novo Envio de Projeto</Link>
        </BotaoPrimario>
      }
    >
      {(perfil) => (
        <div className="flex flex-col gap-6">
          {/* Barra de Subpáginas */}
          <NavegacaoProponente />

          {/* Cards de Métricas e KPIs do Proponente */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="KPIs do Proponente">
            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Propostas Enviadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.total}</span>
                <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Portfólio</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Projetos cadastrados</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Em Análise Técnica</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#8E1218]">{metricas.emAnalise}</span>
                <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Na esteira</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Com a equipe de P&D</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Projetos Elegíveis</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-emerald-700">{metricas.elegiveis}</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Aprovados</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Parecer favorável emitido</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Dispêndio Total P&D</span>
              <div className="mt-2">
                <span className="font-display text-2xl font-bold text-[#2C3138]">
                  {formatarMoeda(metricas.dispendioTotal)}
                </span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Gasto em desenvolvimento</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Economia Fiscal Est.</span>
              <div className="mt-2">
                <span className="font-display text-2xl font-bold text-emerald-700">
                  {formatarMoeda(metricas.beneficioTotal)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-emerald-700">~34% de dedução no Lucro Real</p>
            </div>
          </section>

          {/* Banner de Boas-Vindas e Ação Rápida */}
          <section className="neo flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8E1218] bg-red-100 px-2.5 py-0.5 rounded-full">
                Jornada de Incentivo Fiscal
              </span>
              <h2 className="font-display text-2xl text-[#2C3138]">
                Olá, {perfil.nome}! Pronto para cadastrar um novo projeto de P&D?
              </h2>
              <p className="text-sm leading-relaxed text-[#5E6570]">
                A Lei do Bem recompensa empresas que enfrentam incertezas tecnológicas na criação de novos produtos ou
                processos. Cadastre seu projeto na subpágina de <strong>Envios</strong> e acompanhe o parecer técnico na subpágina
                de <strong>Acompanhamento</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <BotaoPrimario asChild>
                <Link href="/proponente/envios">Submeter Projeto →</Link>
              </BotaoPrimario>
              <BotaoSecundario asChild>
                <Link href="/proponente/acompanhamento">Acompanhar Esteira</Link>
              </BotaoSecundario>
            </div>
          </section>

          {/* Grid: Últimos Envios + Checklist de Conformidade */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,24rem)]">
            {/* Lista dos Últimos Envios */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-[#2C3138]">Envios Recentes</h3>
                  <p className="text-xs text-[#5E6570]">Status das propostas mais recentes na esteira técnica.</p>
                </div>
                <Link href="/proponente/acompanhamento" className="text-xs font-semibold text-[#8E1218] hover:underline">
                  Ver todos na esteira →
                </Link>
              </div>

              <div className="grid gap-4">
                {propostas.slice(0, 3).map((prop) => (
                  <article key={prop.id} className="neo flex flex-col justify-between gap-3 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {prop.protocolo}
                          </span>
                          <span className="text-xs text-[#5E6570]">Enviado em {prop.dataEnvio}</span>
                          <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                            {prop.area}
                          </span>
                          <Badge colorPalette={statusCor(prop.status)} variant="subtle">
                            {rotuloStatus(prop.status)}
                          </Badge>
                        </div>
                        <h4 className="font-display text-base font-bold text-[#2C3138] mt-1">{prop.titulo}</h4>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <p className="text-xs text-[#5E6570]">Dispêndio Previsto</p>
                        <p className="font-display text-base font-bold text-[#2C3138]">
                          {formatarMoeda(prop.dispendioTotal)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#4A515C] line-clamp-2 leading-relaxed bg-[#E7E9EE] p-2.5 rounded-lg">
                      <strong className="text-[#8E1218]">Incerteza:</strong> {prop.incertezaTecnica}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D9DCE3] text-xs">
                      <span className="text-emerald-700 font-medium">
                        Economia est.: {formatarMoeda(prop.beneficioEstimado)}
                      </span>
                      <Link
                        href={`/proponente/acompanhamento?caso=${prop.id}`}
                        className="font-semibold text-[#8E1218] hover:underline"
                      >
                        Acompanhar Parecer →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Checklist de Conformidade da Empresa Proponente */}
            <aside className="neo flex flex-col justify-between gap-5 p-5 sm:p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Diagnóstico</span>
                <h3 className="font-display text-xl text-[#2C3138] mt-1">Prontidão da Empresa</h3>
                <p className="text-xs text-[#5E6570] mt-1">
                  Requisitos essenciais para usufruir da Lei do Bem sem risco de glosa fiscal:
                </p>
              </div>

              <div className="space-y-3">
                <div className="neo-inset flex items-start gap-3 p-3 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#2C3138]">Regime de Lucro Real</strong>
                    <p className="text-[#5E6570] mt-0.5">Empresa optante no ano-base 2026.</p>
                  </div>
                </div>

                <div className="neo-inset flex items-start gap-3 p-3 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#2C3138]">Certidão Negativa (CND)</strong>
                    <p className="text-[#5E6570] mt-0.5">Regularidade fiscal federal ativa.</p>
                  </div>
                </div>

                <div className="neo-inset flex items-start gap-3 p-3 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#2C3138]">Controle Contábil de P&D</strong>
                    <p className="text-[#5E6570] mt-0.5">Centro de custos segregado para inovação.</p>
                  </div>
                </div>

                <div className="neo-inset flex items-start gap-3 p-3 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-[#2C3138]">Rastro e Dossiê Comprobatório</strong>
                    <p className="text-[#5E6570] mt-0.5">Manter relatórios técnicos e atas de teste arquivados por 5 anos.</p>
                  </div>
                </div>
              </div>

              <BotaoSecundario asChild className="w-full text-xs">
                <Link href="/proponente/configuracoes">Revisar Perfil Fiscal da Empresa</Link>
              </BotaoSecundario>
            </aside>
          </div>
        </div>
      )}
    </Casca>
  );
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function rotuloStatus(status: PropostaProponente["status"]) {
  switch (status) {
    case "triagem":
      return "Fila de Triagem";
    case "em_analise":
      return "Em Análise Técnica";
    case "elegivel":
      return "Elegível (Aprovado)";
    case "diligencia":
      return "Diligência Pendente";
    case "inelegivel":
      return "Inelegível (Rotina)";
    default:
      return status;
  }
}

function statusCor(status: PropostaProponente["status"]) {
  switch (status) {
    case "triagem":
      return "blue";
    case "em_analise":
      return "yellow";
    case "elegivel":
      return "green";
    case "diligencia":
      return "orange";
    case "inelegivel":
      return "gray";
    default:
      return "gray";
  }
}
