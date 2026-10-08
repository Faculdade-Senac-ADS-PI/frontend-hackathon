"use client";

import { Dialog, NativeSelect } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import {
  corBadgeStatus,
  deliberarProjeto,
  formatarBytes,
  obterFilaAnalise,
  rotuloStatus,
  type ProjetoAnaliseResposta,
} from "@/lib/propostas-proponente";

export default function Analista() {
  const [propostas, setPropostas] = useState<ProjetoAnaliseResposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todas");

  // Dossiê selecionado para deliberação
  const [casoSelecionado, setCasoSelecionado] = useState<ProjetoAnaliseResposta | null>(null);
  const [decisao, setDecisao] = useState<"Aprovado" | "Reprovado" | "Reanalise">("Aprovado");
  const [justificativa, setJustificativa] = useState("");
  const [salvandoDecisao, setSalvandoDecisao] = useState(false);
  const [avisoSucesso, setAvisoSucesso] = useState("");
  const [erroDecisao, setErroDecisao] = useState("");

  useEffect(() => {
    void carregarFila();
  }, []);

  async function carregarFila() {
    setCarregando(true);
    try {
      const dados = await obterFilaAnalise();
      setPropostas(dados);
    } catch {
      // Ignora falha inicial
    } finally {
      setCarregando(false);
    }
  }

  const metricas = useMemo(() => {
    const total = propostas.length;
    const aguardando = propostas.filter((p) => p.status === "AguardandoAnalista").length;
    const aprovadas = propostas.filter((p) => p.status === "Aprovado").length;
    const reanalises = propostas.filter((p) => p.status === "Reanalise").length;
    const reprovadas = propostas.filter((p) => p.status === "Reprovado").length;
    return { total, aguardando, aprovadas, reanalises, reprovadas };
  }, [propostas]);

  const setoresDisponiveis = useMemo(() => {
    const lista = Array.from(new Set(propostas.map((p) => p.setor).filter(Boolean)));
    return lista.sort();
  }, [propostas]);

  const propostasFiltradas = useMemo(() => {
    return propostas.filter((p) => {
      const matchBusca =
        p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        p.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
        p.setor.toLowerCase().includes(busca.toLowerCase()) ||
        p.proponenteNome.toLowerCase().includes(busca.toLowerCase());

      const matchStatus = filtroStatus === "todas" ? true : p.status === filtroStatus;
      const matchSetor = filtroSetor === "todas" ? true : p.setor === filtroSetor;

      return matchBusca && matchStatus && matchSetor;
    });
  }, [propostas, busca, filtroStatus, filtroSetor]);

  function abrirDossie(proposta: ProjetoAnaliseResposta) {
    setCasoSelecionado(proposta);
    setDecisao("Aprovado");
    setJustificativa(proposta.justificativaAnalista || "");
    setErroDecisao("");
  }

  async function executarDeliberacao() {
    if (!casoSelecionado) return;
    setErroDecisao("");

    if (decisao !== "Aprovado" && !justificativa.trim()) {
      setErroDecisao("Explique o motivo da reprovação ou o que o proponente deve revisar para a reanálise.");
      return;
    }

    setSalvandoDecisao(true);
    try {
      const atualizado = await deliberarProjeto(casoSelecionado.id, decisao, justificativa.trim() || undefined);
      setPropostas((antigas) =>
        antigas.map((p) => (p.id === atualizado.id ? atualizado : p))
      );
      setAvisoSucesso(
        `Proposta ${atualizado.protocolo} deliberada com sucesso como "${rotuloStatus(atualizado.status)}".`
      );
      setCasoSelecionado(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar a deliberação.";
      setErroDecisao(msg);
    } finally {
      setSalvandoDecisao(false);
    }
  }

  return (
    <Casca
      titulo="Fila de Análise Técnica — Lei do Bem"
      descricao="Avalie as propostas de inovação submetidas pelos proponentes. Consulte o resumo e a pontuação nos 5 critérios de Frascati gerados pelo Agente de IA para aprovar, reprovar ou solicitar reanálise."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoSecundario type="button" onClick={() => void carregarFila()}>
          Atualizar Fila
        </BotaoSecundario>
      }
    >
      {() => (
        <div className="flex flex-col gap-6">
          {avisoSucesso ? (
            <Aviso tipo="success" texto={avisoSucesso} />
          ) : null}

          {/* KPI Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Métricas da Esteira">
            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Aguardando Análise</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-amber-700">{metricas.aguardando}</span>
                <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Fila</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Propostas prontas para deliberação</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Aprovadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-emerald-700">{metricas.aprovadas}</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Elegíveis</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Atendem aos 5 critérios Frascati</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Reanálises</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-purple-700">{metricas.reanalises}</span>
                <span className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">Revisão</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Aguardando novo PDF do proponente</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Reprovadas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-red-700">{metricas.reprovadas}</span>
                <span className="text-xs font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Inaptas</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Projetos fora do escopo da lei</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Total de Propostas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.total}</span>
                <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Todas</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Volume acumulado no sistema</p>
            </div>
          </section>

          {/* Busca e Filtros */}
          <section className="neo flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <label htmlFor="busca-analista" className="sr-only">Buscar proposta</label>
                <input
                  id="busca-analista"
                  type="text"
                  placeholder="Pesquisar por título, protocolo, setor ou proponente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="neo-inset w-full px-4 py-2.5 text-sm placeholder:text-[#8E95A2]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="w-52">
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field
                      aria-label="Filtro por status"
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                      <option value="todas">Todos os Status</option>
                      <option value="AguardandoAnalista">Aguardando Analista</option>
                      <option value="Aprovado">Aprovadas</option>
                      <option value="Reanalise">Reanálise Solicitada</option>
                      <option value="Reprovado">Reprovadas</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </div>

                {setoresDisponiveis.length > 0 ? (
                  <div className="w-56">
                    <NativeSelect.Root size="sm" width="full">
                      <NativeSelect.Field
                        aria-label="Filtro por setor"
                        value={filtroSetor}
                        onChange={(e) => setFiltroSetor(e.target.value)}
                      >
                        <option value="todas">Todos os Setores</option>
                        {setoresDisponiveis.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Abas Rápidas */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#D9DCE3] pt-4">
              <button
                type="button"
                onClick={() => setFiltroStatus("todas")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "todas" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Todas ({propostas.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("AguardandoAnalista")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "AguardandoAnalista" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Aguardando ({metricas.aguardando})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("Aprovado")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "Aprovado" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Aprovadas ({metricas.aprovadas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("Reanalise")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "Reanalise" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Reanálises ({metricas.reanalises})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("Reprovado")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "Reprovado" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Reprovadas ({metricas.reprovadas})
              </button>
            </div>
          </section>

          {/* Lista de Propostas da Fila */}
          <section className="flex flex-col gap-4">
            {carregando ? (
              <EstadoCarregando texto="Carregando fila de propostas..." />
            ) : propostasFiltradas.length === 0 ? (
              <EstadoVazio
                titulo="Nenhuma proposta encontrada na fila"
                texto="Não há propostas cadastradas com os filtros selecionados."
              />
            ) : (
              <div className="grid gap-4">
                {propostasFiltradas.map((prop) => {
                  const badge = corBadgeStatus(prop.status);
                  const nota = prop.notaIa;
                  const corNota =
                    nota !== null && nota !== undefined
                      ? nota >= 75
                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                        : nota >= 50
                        ? "text-amber-700 bg-amber-50 border-amber-300"
                        : "text-red-700 bg-red-50 border-red-300"
                      : "text-gray-600 bg-gray-50 border-gray-200";

                  return (
                    <article
                      key={prop.id}
                      className="neo flex flex-col justify-between gap-4 p-5 transition-shadow hover:shadow-[10px_10px_22px_#c2c5ce,-10px_-10px_22px_#ffffff] md:p-6"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {prop.protocolo}
                            </span>
                            <span className="text-xs text-[#5E6570]">
                              Submetido em {new Date(prop.criadoEm).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                              {prop.setor}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {rotuloStatus(prop.status)}
                            </span>
                          </div>

                          <h3 className="font-display text-xl font-bold text-[#2C3138]">{prop.titulo}</h3>
                          <p className="text-xs text-[#5E6570]">
                            Proponente: <strong>{prop.proponenteNome}</strong> ({prop.proponenteEmail}) · Versão {prop.versaoEnvio}
                          </p>
                        </div>

                        {/* Placar de Nota da IA */}
                        <div className="flex flex-row lg:flex-col items-end justify-between shrink-0 lg:text-right gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-gray-200">
                          <div>
                            <p className="text-[11px] text-[#5E6570] uppercase font-bold">Nota Agente IA</p>
                            <div className="flex items-center gap-2">
                              <span className={`font-display text-2xl font-bold px-2 py-0.5 rounded border ${corNota}`}>
                                {nota !== null && nota !== undefined ? `${nota}/100` : "Pendente"}
                              </span>
                            </div>
                          </div>
                          {prop.recomendacaoIa ? (
                            <p className="text-xs font-semibold text-[#2C3138] mt-1">
                              {prop.recomendacaoIa}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Resumo da IA */}
                      {prop.resumoIa ? (
                        <div className="neo-inset p-3.5 text-xs text-[#4A515C] space-y-1">
                          <strong className="text-[#8E1218]">Resumo do Projeto (Elaborado pelo Agente de IA):</strong>
                          <p className="leading-relaxed line-clamp-3">{prop.resumoIa}</p>
                        </div>
                      ) : null}

                      {/* Critérios resumidos */}
                      {prop.criterios && prop.criterios.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                          {prop.criterios.map((c) => (
                            <div key={c.chave} className="neo-inset p-2 text-center">
                              <span className="text-[10px] text-[#5E6570] block font-semibold truncate">{c.nome}</span>
                              <span className="font-mono text-xs font-bold text-[#2C3138]">
                                {c.nota !== null && c.nota !== undefined ? `${c.nota}/${c.notaMaxima}` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Ações */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9DCE3] pt-3">
                        <div className="flex items-center gap-2 text-xs text-[#5E6570]">
                          <a
                            href={`/api/projetos/${prop.id}/arquivo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#8E1218] hover:underline inline-flex items-center gap-1"
                          >
                            📄 {prop.nomeArquivo} ({formatarBytes(prop.tamanhoBytes)})
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <BotaoPrimario type="button" onClick={() => abrirDossie(prop)}>
                            Abrir Dossiê & Deliberar →
                          </BotaoPrimario>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Modal / Painel do Dossiê Completo e Deliberação */}
          <Dialog.Root open={casoSelecionado !== null} onOpenChange={(d) => !d.open && setCasoSelecionado(null)}>
            <Dialog.Backdrop />
            <Dialog.Positioner p="4">
              <Dialog.Content className="neo" bg="#F3F4F7" w="full" maxW="3xl" maxH="90vh" overflowY="auto">
                <Dialog.Header>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-xs font-mono text-[#C4161C] font-bold">{casoSelecionado?.protocolo}</span>
                      <Dialog.Title className="font-display text-2xl mt-1">
                        Dossiê de Avaliação de P&D (Lei do Bem)
                      </Dialog.Title>
                    </div>
                  </div>
                </Dialog.Header>

                <Dialog.Body className="space-y-6">
                  {casoSelecionado ? (
                    <>
                      {erroDecisao ? <Aviso tipo="error" texto={erroDecisao} /> : null}

                      {/* Identificação */}
                      <div className="neo-inset p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-base text-[#2C3138]">{casoSelecionado.titulo}</h4>
                            <p className="text-xs text-[#5E6570] mt-0.5">
                              Setor: <strong>{casoSelecionado.setor}</strong> · Proponente:{" "}
                              <strong>{casoSelecionado.proponenteNome}</strong> ({casoSelecionado.proponenteEmail})
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              corBadgeStatus(casoSelecionado.status).bg
                            } ${corBadgeStatus(casoSelecionado.status).text} ${
                              corBadgeStatus(casoSelecionado.status).border
                            }`}
                          >
                            {rotuloStatus(casoSelecionado.status)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#D9DCE3] flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-[#5E6570]">
                            Arquivo: <strong className="font-mono">{casoSelecionado.nomeArquivo}</strong> (
                            {formatarBytes(casoSelecionado.tamanhoBytes)}) · {casoSelecionado.versaoEnvio}ª versão
                          </span>
                          <a
                            href={`/api/projetos/${casoSelecionado.id}/arquivo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-neo text-xs px-2.5 py-1 text-[#8E1218] font-bold"
                          >
                            📥 Baixar / Visualizar PDF
                          </a>
                        </div>
                      </div>

                      {/* Avaliação do Agente de IA */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">
                            Avaliação pelo Agente de IA (5 Critérios do Manual de Frascati)
                          </h4>
                          {casoSelecionado.origemAnaliseIa ? (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              Origem: {casoSelecionado.origemAnaliseIa}
                            </span>
                          ) : null}
                        </div>

                        {/* Placar Geral */}
                        <div className="neo-inset p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-[#5E6570] font-semibold uppercase">Nota Global de Elegibilidade</span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="font-display text-3xl font-bold text-[#2C3138]">
                                {casoSelecionado.notaIa !== null && casoSelecionado.notaIa !== undefined
                                  ? casoSelecionado.notaIa
                                  : "—"}
                              </span>
                              <span className="text-sm text-[#5E6570]">/ 100 pontos</span>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-xs text-[#5E6570] font-semibold uppercase">Recomendação da IA</span>
                            <p className="font-bold text-base text-emerald-800 mt-0.5">
                              {casoSelecionado.recomendacaoIa || "Aguardando"}
                            </p>
                          </div>
                        </div>

                        {/* Resumo da IA */}
                        {casoSelecionado.resumoIa ? (
                          <div className="neo-inset p-3.5 space-y-1 text-xs">
                            <strong className="text-[#2C3138]">Resumo Técnico da Proposta:</strong>
                            <p className="text-[#4A515C] leading-relaxed whitespace-pre-wrap">{casoSelecionado.resumoIa}</p>
                          </div>
                        ) : null}

                        {/* Parecer Sintético da IA */}
                        {casoSelecionado.parecerIa ? (
                          <div className="neo-inset p-3.5 space-y-1 text-xs bg-slate-100/50">
                            <strong className="text-[#2C3138]">Parecer Sintético da IA:</strong>
                            <p className="text-[#4A515C] leading-relaxed">{casoSelecionado.parecerIa}</p>
                          </div>
                        ) : null}

                        {/* Os 5 Critérios Detalhados (0 a 20 cada) */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-[#2C3138] uppercase">Detalhamento por Critério:</span>
                          <div className="grid gap-3">
                            {casoSelecionado.criterios?.map((c, i) => (
                              <div key={c.chave} className="neo-inset p-3.5 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <strong className="text-[#8E1218]">
                                    {i + 1}. {c.nome}
                                  </strong>
                                  <span className="font-mono font-bold text-sm text-[#2C3138] bg-white px-2 py-0.5 rounded border border-[#D9DCE3]">
                                    {c.nota !== null && c.nota !== undefined ? `${c.nota} / ${c.notaMaxima} pts` : "—"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#5E6570] italic">{c.descricao}</p>
                                {c.justificativa ? (
                                  <div className="pt-1.5 border-t border-[#D9DCE3]">
                                    <span className="font-semibold text-[#2C3138]">Análise da IA: </span>
                                    <span className="text-[#4A515C]">{c.justificativa}</span>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Deliberação do Analista Humano */}
                      <div className="space-y-4 pt-3 border-t border-[#D9DCE3]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">
                          Deliberação Técnica do Analista
                        </h4>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-[#5E6570]">Decisão da Avaliação</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setDecisao("Aprovado")}
                              className={`p-3 rounded-lg text-xs font-bold text-center border transition-all ${
                                decisao === "Aprovado"
                                  ? "bg-emerald-600 text-white border-emerald-700 shadow-inner"
                                  : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                              }`}
                            >
                              ✓ Aprovar Projeto
                            </button>
                            <button
                              type="button"
                              onClick={() => setDecisao("Reanalise")}
                              className={`p-3 rounded-lg text-xs font-bold text-center border transition-all ${
                                decisao === "Reanalise"
                                  ? "bg-purple-600 text-white border-purple-700 shadow-inner"
                                  : "bg-white text-purple-800 border-purple-200 hover:bg-purple-50"
                              }`}
                            >
                              🔄 Solicitar Reanálise
                            </button>
                            <button
                              type="button"
                              onClick={() => setDecisao("Reprovado")}
                              className={`p-3 rounded-lg text-xs font-bold text-center border transition-all ${
                                decisao === "Reprovado"
                                  ? "bg-red-600 text-white border-red-700 shadow-inner"
                                  : "bg-white text-red-800 border-red-200 hover:bg-red-50"
                              }`}
                            >
                              ✕ Reprovar Projeto
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="justificativa-analista" className="text-xs font-semibold text-[#5E6570]">
                            Parecer / Justificativa do Analista{" "}
                            {decisao !== "Aprovado" ? <span className="text-[#C4161C]">* (obrigatório)</span> : null}
                          </label>
                          <textarea
                            id="justificativa-analista"
                            rows={4}
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            placeholder={
                              decisao === "Aprovado"
                                ? "Observações ou comentários adicionais sobre o enquadramento do projeto..."
                                : decisao === "Reanalise"
                                ? "Indique claramente o que o proponente deve revisar ou complementar no novo PDF..."
                                : "Indique a fundamentação técnica para a reprovação da proposta..."
                            }
                            className="neo-inset w-full p-3 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </Dialog.Body>

                <Dialog.Footer className="flex flex-wrap gap-2">
                  <BotaoSecundario type="button" onClick={() => setCasoSelecionado(null)}>
                    Cancelar
                  </BotaoSecundario>
                  <BotaoPrimario
                    type="button"
                    loading={salvandoDecisao}
                    loadingText="Gravando Deliberação..."
                    onClick={() => void executarDeliberacao()}
                  >
                    Confirmar Decisão no Sistema →
                  </BotaoPrimario>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </div>
      )}
    </Casca>
  );
}
