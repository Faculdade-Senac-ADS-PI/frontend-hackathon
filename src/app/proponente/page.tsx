"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import {
  corBadgeStatus,
  obterMinhasPropostas,
  rotuloStatus,
  type ProjetoProponenteResposta,
} from "@/lib/propostas-proponente";

export default function ProponenteDashboard() {
  const [propostas, setPropostas] = useState<ProjetoProponenteResposta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterMinhasPropostas()
      .then((dados) => {
        if (dados) setPropostas(dados);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const metricas = useMemo(() => {
    const total = propostas.length;
    const aguardando = propostas.filter(
      (p) => p.status === "AguardandoAnalista" || p.status === "ProcessandoIa"
    ).length;
    const aprovadas = propostas.filter((p) => p.status === "Aprovado").length;
    const reanalises = propostas.filter((p) => p.status === "Reanalise").length;
    const reprovadas = propostas.filter((p) => p.status === "Reprovado").length;
    return { total, aguardando, aprovadas, reanalises, reprovadas };
  }, [propostas]);

  return (
    <Casca
      titulo="Painel do Proponente — Lei do Bem"
      descricao="Visão geral dos seus projetos de inovação submetidos para enquadramento na Lei do Bem."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoPrimario asChild>
          <Link href="/proponente/envios">+ Nova Proposta em PDF</Link>
        </BotaoPrimario>
      }
    >
      {(perfil) => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {/* Cards de Métricas e KPIs do Proponente */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="KPIs do Proponente">
            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Propostas Enviadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.total}</span>
                <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Total</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Projetos cadastrados</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Em Análise Técnica</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-amber-700">{metricas.aguardando}</span>
                <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Na esteira</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Com a equipe de analistas</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Propostas Aprovadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-emerald-700">{metricas.aprovadas}</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Aprovadas</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Consideradas aptas na Lei do Bem</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Reanálises</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-purple-700">{metricas.reanalises}</span>
                <span className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">Ajustes</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Aguardando revisão do PDF</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Não Aprovadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-red-700">{metricas.reprovadas}</span>
                <span className="text-xs font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Fora da lei</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Rotina ou inelegíveis</p>
            </div>
          </section>

          {/* Banner de Boas-Vindas */}
          <section className="neo flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8E1218] bg-red-100 px-2.5 py-0.5 rounded-full">
                Inovação Corporativa & Lei do Bem
              </span>
              <h2 className="font-display text-2xl text-[#2C3138]">
                Olá, {perfil.nome}! Envie a proposta técnica do seu setor.
              </h2>
              <p className="text-sm leading-relaxed text-[#5E6570]">
                Funcionários de qualquer departamento podem cadastrar projetos inovadores submetendo um arquivo PDF.
                Nosso agente de IA avalia a proposta preliminarmente nos 5 critérios de Frascati e a equipe técnica
                delibera a aprovação do incentivo fiscal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <BotaoPrimario asChild>
                <Link href="/proponente/envios">Submeter Proposta em PDF →</Link>
              </BotaoPrimario>
              <BotaoSecundario asChild>
                <Link href="/proponente/acompanhamento">Acompanhar Esteira</Link>
              </BotaoSecundario>
            </div>
          </section>

          {/* Grid: Últimos Envios + Orientações */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,24rem)]">
            {/* Lista dos Últimos Envios */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-[#2C3138]">Envios Recentes</h3>
                  <p className="text-xs text-[#5E6570]">Status das propostas mais recentes submetidas pelo seu usuário.</p>
                </div>
                <Link href="/proponente/acompanhamento" className="text-xs font-semibold text-[#8E1218] hover:underline">
                  Ver todas na esteira →
                </Link>
              </div>

              {carregando ? (
                <p className="text-xs text-[#5E6570]">Carregando histórico...</p>
              ) : propostas.length === 0 ? (
                <div className="neo p-6 text-center text-sm text-[#5E6570]">
                  Nenhuma proposta encontrada. Submeta sua primeira proposta técnica em PDF!
                </div>
              ) : (
                <div className="grid gap-4">
                  {propostas.slice(0, 4).map((prop) => {
                    const badge = corBadgeStatus(prop.status);
                    const dataEnvioFormatada = new Date(prop.criadoEm).toLocaleDateString("pt-BR");

                    return (
                      <article key={prop.id} className="neo flex flex-col justify-between gap-3 p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                {prop.protocolo}
                              </span>
                              <span className="text-xs text-[#5E6570]">Enviado em {dataEnvioFormatada}</span>
                              <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                                {prop.setor}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {rotuloStatus(prop.status)}
                              </span>
                            </div>
                            <h4 className="font-display text-base font-bold text-[#2C3138] mt-1">{prop.titulo}</h4>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <p className="text-xs text-[#5E6570]">Versão</p>
                            <p className="font-display text-sm font-bold text-[#2C3138]">v{prop.versaoEnvio}</p>
                          </div>
                        </div>

                        {prop.justificativaAnalista ? (
                          <p className="text-xs text-[#4A515C] line-clamp-2 leading-relaxed bg-[#E7E9EE] p-2.5 rounded-lg">
                            <strong className="text-[#8E1218]">Retorno do Analista:</strong> {prop.justificativaAnalista}
                          </p>
                        ) : null}

                        <div className="flex items-center justify-between pt-2 border-t border-[#D9DCE3] text-xs">
                          <span className="text-[#5E6570]">
                            Arquivo: <span className="font-mono">{prop.nomeArquivo}</span>
                          </span>
                          <Link
                            href={`/proponente/acompanhamento?caso=${prop.id}`}
                            className="font-semibold text-[#8E1218] hover:underline"
                          >
                            Acompanhar Status →
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Checklist dos 5 Critérios de Frascati */}
            <aside className="neo flex flex-col justify-between gap-5 p-5 sm:p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Guia de Elaboração</span>
                <h3 className="font-display text-xl text-[#2C3138] mt-1">Os 5 Critérios de Frascati</h3>
                <p className="text-xs text-[#5E6570] mt-1">
                  Certifique-se de que seu PDF aborda os 5 pontos avaliados pelo nosso sistema:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="neo-inset p-3 space-y-1">
                  <strong className="text-[#8E1218]">1. Novidade</strong>
                  <p className="text-[#5E6570]">Desenvolver o que não é dominado, significando avanço em relação ao conhecimento existente.</p>
                </div>

                <div className="neo-inset p-3 space-y-1">
                  <strong className="text-[#8E1218]">2. Criatividade</strong>
                  <p className="text-[#5E6570]">Relevância criativa capaz de produzir ganhos substanciais para a empresa ou setor.</p>
                </div>

                <div className="neo-inset p-3 space-y-1">
                  <strong className="text-[#8E1218]">3. Sistemático</strong>
                  <p className="text-[#5E6570]">P&D organizado com métodos, cronograma, hipóteses, testes e registros de processos.</p>
                </div>

                <div className="neo-inset p-3 space-y-1">
                  <strong className="text-[#8E1218]">4. Transferibilidade</strong>
                  <p className="text-[#5E6570]">Capacidade de reprodução e difusão do conhecimento para outras áreas e organizações.</p>
                </div>

                <div className="neo-inset p-3 space-y-1">
                  <strong className="text-[#8E1218]">5. Incerteza</strong>
                  <p className="text-[#5E6570]">Superação de barreiras científicas ou tecnológicas onde o desfecho não é previsível.</p>
                </div>
              </div>

              <BotaoSecundario asChild className="w-full text-xs">
                <Link href="/proponente/envios">Submeter Nova Proposta Agora</Link>
              </BotaoSecundario>
            </aside>
          </div>
        </div>
      )}
    </Casca>
  );
}
