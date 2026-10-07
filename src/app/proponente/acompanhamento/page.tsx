"use client";

import { Badge } from "@chakra-ui/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import { obterPropostas, type PropostaProponente, type StatusEtapa } from "@/lib/propostas-proponente";

export default function AcompanhamentoPage() {
  return (
    <Suspense fallback={<EstadoCarregando texto="Carregando esteira de acompanhamento..." />}>
      <ConteudoAcompanhamento />
    </Suspense>
  );
}

function ConteudoAcompanhamento() {
  const searchParams = useSearchParams();
  const casoUrl = searchParams.get("caso");

  const [propostas, setPropostas] = useState<PropostaProponente[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<string>("");
  const [respostaDiligencia, setRespostaDiligencia] = useState("");
  const [avisoDiligencia, setAvisoDiligencia] = useState("");
  const [downloadConcluido, setDownloadConcluido] = useState(false);

  useEffect(() => {
    const lista = obterPropostas();
    setPropostas(lista);
    if (lista.length > 0) {
      if (casoUrl && lista.some((p) => p.id === casoUrl)) {
        setSelecionadaId(casoUrl);
      } else {
        setSelecionadaId(lista[0].id);
      }
    }
  }, [casoUrl]);

  const propostaAtual = propostas.find((p) => p.id === selecionadaId) || propostas[0];

  function enviarRespostaDiligencia(e: React.FormEvent) {
    e.preventDefault();
    if (!respostaDiligencia.trim() || !propostaAtual) return;

    const novoHistorico = [
      ...propostaAtual.historico,
      {
        data: `${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        autor: "Proponente (Esclarecimento)",
        descricao: respostaDiligencia,
        tipo: "diligencia" as const,
      },
    ];

    const atualizadas = propostas.map((p) =>
      p.id === propostaAtual.id ? { ...p, historico: novoHistorico } : p
    );

    setPropostas(atualizadas);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hackthon_propostas_proponente", JSON.stringify(atualizadas));
      } catch {
        // Ignora erro
      }
    }

    setAvisoDiligencia("Esclarecimento técnico enviado com sucesso para a esteira do analista!");
    setRespostaDiligencia("");
  }

  return (
    <Casca
      titulo="Acompanhamento de Esteira e Pareceres"
      descricao="Acompanhe em tempo real o ciclo de avaliação das suas propostas de P&D, consulte notas técnicas e responda a diligências."
      larguraMaxima="max-w-7xl"
    >
      {() => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {propostas.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma proposta em acompanhamento"
              texto="Você ainda não enviou projetos para análise. Acesse a subpágina de Envios para submeter sua primeira proposta."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Barra Seletora de Propostas */}
              <div className="neo flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5E6570]">
                    Projeto Selecionado:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {propostas.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelecionadaId(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          p.id === propostaAtual?.id
                            ? "btn-red text-white"
                            : "neo-inset text-[#2C3138] hover:text-[#8E1218]"
                        }`}
                      >
                        {p.protocolo} — {p.titulo.slice(0, 28)}...
                      </button>
                    ))}
                  </div>
                </div>

                <BotaoSecundario asChild className="text-xs">
                  <Link href="/proponente/envios">+ Submeter Outro Projeto</Link>
                </BotaoSecundario>
              </div>

              {propostaAtual ? (
                <>
                  {/* Cabeçalho do Projeto Selecionado */}
                  <section className="neo flex flex-col gap-4 p-6 sm:p-8">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#C4161C] bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                            {propostaAtual.protocolo}
                          </span>
                          <span className="text-xs text-[#5E6570]">Submetido em {propostaAtual.dataEnvio}</span>
                          <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                            {propostaAtual.area}
                          </span>
                          <Badge colorPalette={statusCor(propostaAtual.status)} variant="subtle" px="3" py="1">
                            {rotuloStatus(propostaAtual.status)}
                          </Badge>
                        </div>
                        <h2 className="font-display text-2xl font-bold text-[#2C3138] sm:text-3xl">
                          {propostaAtual.titulo}
                        </h2>
                      </div>

                      <div className="neo-inset p-4 sm:text-right shrink-0">
                        <span className="text-xs text-[#5E6570] uppercase font-bold">Investimento Aprovado P&D</span>
                        <p className="font-display text-2xl font-bold text-[#2C3138]">
                          {formatarMoeda(propostaAtual.dispendioTotal)}
                        </p>
                        <p className="text-xs font-medium text-emerald-700 mt-0.5">
                          Economia Fiscal: {formatarMoeda(propostaAtual.beneficioEstimado)}
                        </p>
                      </div>
                    </div>

                    {/* Stepper / Timeline Visual da Esteira de P&D */}
                    <div className="mt-4 pt-6 border-t border-[#D9DCE3]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E1218] mb-4">
                        Esteira de Avaliação da Proposta
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-4">
                        <PassoEtapa
                          numero="1"
                          titulo="Submissão"
                          descricao="Dados e orçamento enviados"
                          status={propostaAtual.etapas.submissao}
                        />
                        <PassoEtapa
                          numero="2"
                          titulo="Triagem Inicial"
                          descricao="Verificação de CND e Lucro Real"
                          status={propostaAtual.etapas.triagem}
                        />
                        <PassoEtapa
                          numero="3"
                          titulo="Análise de Incerteza"
                          descricao="Manual de Frascati + IA"
                          status={propostaAtual.etapas.analiseFrascati}
                        />
                        <PassoEtapa
                          numero="4"
                          titulo="Parecer Preliminar"
                          descricao="Enquadramento conclusivo"
                          status={propostaAtual.etapas.parecerFinal}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Parecer Técnico do Analista e Dossiê */}
                  <section className="neo p-6 sm:p-8 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">
                          Deliberação Técnica
                        </span>
                        <h3 className="font-display text-2xl text-[#2C3138]">
                          Parecer do Analista de P&D
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDownloadConcluido(true)}
                        className="btn-neo text-xs px-3.5 py-2 inline-flex items-center gap-2"
                      >
                        📄 Baixar Declaração Preliminar (PDF)
                      </button>
                    </div>

                    {downloadConcluido ? (
                      <Aviso
                        tipo="success"
                        texto="Download simulado: Relatório técnico com carimbo do Banco do Nordeste gerado com sucesso."
                      />
                    ) : null}

                    <div className="neo-inset p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#D9DCE3]">
                        <span className="text-xs font-bold uppercase text-[#2C3138]">
                          Fundamentação de Elegibilidade (Lei 11.196/05)
                        </span>
                        <span className="text-xs text-[#5E6570]">
                          Avaliador: <strong>Equipe de P&D</strong>
                        </span>
                      </div>

                      <p className="text-sm text-[#2C3138] leading-relaxed">
                        {propostaAtual.parecerAnalista ||
                          "A proposta encontra-se na fase de análise dos parâmetros de incerteza técnica pela equipe de analistas. Assim que a deliberação for concluída, o parecer completo aparecerá aqui com fundamentação legal."}
                      </p>

                      <div className="pt-3 border-t border-[#D9DCE3] grid gap-3 sm:grid-cols-3 text-xs text-[#5E6570]">
                        <div>
                          <strong>Critério de Incerteza:</strong>{" "}
                          <span className="text-emerald-700 font-semibold">Atendido (Não-rotina)</span>
                        </div>
                        <div>
                          <strong>Metodologia Experimental:</strong>{" "}
                          <span className="text-emerald-700 font-semibold">Documentada</span>
                        </div>
                        <div>
                          <strong>Segregação de Custos:</strong>{" "}
                          <span className="text-emerald-700 font-semibold">Regular</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Resposta a Diligências (se necessário) */}
                  <section className="neo p-6 sm:p-8 space-y-4">
                    <h3 className="font-display text-xl text-[#2C3138]">
                      Canal de Esclarecimentos e Diligências
                    </h3>
                    <p className="text-xs text-[#5E6570]">
                      Caso o analista necessite de informações complementares sobre a incerteza tecnológica ou
                      metodologia de testes, envie sua manifestação abaixo.
                    </p>

                    {avisoDiligencia ? <Aviso tipo="success" texto={avisoDiligencia} /> : null}

                    <form onSubmit={enviarRespostaDiligencia} className="space-y-3">
                      <textarea
                        rows={3}
                        value={respostaDiligencia}
                        onChange={(e) => setRespostaDiligencia(e.target.value)}
                        placeholder="Adicione notas de esclarecimento, referências de testes laboratoriais ou atualizações sobre o projeto..."
                        className="neo-inset w-full p-3.5 text-xs leading-relaxed"
                      />
                      <div className="flex justify-end">
                        <BotaoPrimario type="submit" disabled={!respostaDiligencia.trim()}>
                          Enviar Esclarecimento ao Analista
                        </BotaoPrimario>
                      </div>
                    </form>
                  </section>

                  {/* Histórico e Linha do Tempo de Rastro Auditável */}
                  <section className="neo p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Auditoria</span>
                        <h3 className="font-display text-xl text-[#2C3138]">Rastro de Eventos do Projeto</h3>
                      </div>
                      <span className="text-xs text-[#5E6570] font-mono">
                        {propostaAtual.historico.length} evento(s) registrados
                      </span>
                    </div>

                    <div className="space-y-3">
                      {propostaAtual.historico.map((ev, index) => (
                        <div key={index} className="neo-inset p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#2C3138]">{ev.autor}</span>
                              <span className="text-[11px] text-[#8E95A2]">({ev.data})</span>
                            </div>
                            <p className="text-[#4A515C]">{ev.descricao}</p>
                          </div>
                          <span className="text-[11px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                            {ev.tipo.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}
    </Casca>
  );
}

function PassoEtapa({
  numero,
  titulo,
  descricao,
  status,
}: {
  numero: string;
  titulo: string;
  descricao: string;
  status: StatusEtapa;
}) {
  const cores = {
    concluido: {
      borda: "border-emerald-600 bg-emerald-50",
      badge: "bg-emerald-600 text-white",
      texto: "Concluído",
    },
    em_andamento: {
      borda: "border-amber-500 bg-amber-50",
      badge: "bg-amber-500 text-white",
      texto: "Em Andamento",
    },
    pendente: {
      borda: "border-gray-300 bg-transparent opacity-60",
      badge: "bg-gray-400 text-white",
      texto: "Pendente",
    },
    atencao: {
      borda: "border-red-500 bg-red-50",
      badge: "bg-red-500 text-white",
      texto: "Atenção",
    },
  }[status];

  return (
    <div className={`neo-inset p-3.5 rounded-xl border ${cores.borda} flex flex-col justify-between gap-2`}>
      <div className="flex items-center justify-between">
        <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold bg-[#E7E9EE] text-[#8E1218]">
          {numero}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cores.badge}`}>
          {cores.texto}
        </span>
      </div>
      <div>
        <h4 className="font-bold text-xs text-[#2C3138]">{titulo}</h4>
        <p className="text-[11px] text-[#5E6570] mt-0.5">{descricao}</p>
      </div>
    </div>
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
