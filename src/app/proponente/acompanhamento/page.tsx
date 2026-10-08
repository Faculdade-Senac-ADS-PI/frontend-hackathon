"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BotaoPrimario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import {
  corBadgeStatus,
  formatarBytes,
  obterMinhasPropostas,
  reenviarPropostaPdf,
  rotuloStatus,
  type ProjetoProponenteResposta,
} from "@/lib/propostas-proponente";

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

  const [propostas, setPropostas] = useState<ProjetoProponenteResposta[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<string>("");
  const [carregando, setCarregando] = useState(true);

  // Reenvio de PDF em caso de Reanálise
  const [arquivoReenvio, setArquivoReenvio] = useState<File | null>(null);
  const [reenviando, setReenviando] = useState(false);
  const [avisoReenvio, setAvisoReenvio] = useState("");
  const [erroReenvio, setErroReenvio] = useState("");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const lista = await obterMinhasPropostas();
        setPropostas(lista);
        if (lista.length > 0) {
          if (casoUrl && (lista.some((p) => p.id === casoUrl) || lista.some((p) => p.protocolo === casoUrl))) {
            const achada = lista.find((p) => p.id === casoUrl || p.protocolo === casoUrl);
            if (achada) setSelecionadaId(achada.id);
          } else {
            setSelecionadaId((antiga) => (antiga && lista.some((p) => p.id === antiga) ? antiga : lista[0].id));
          }
        }
      } catch {
        // Ignora erro
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [casoUrl]);

  async function recarregar() {
    try {
      const lista = await obterMinhasPropostas();
      setPropostas(lista);
    } catch {
      // Ignora erro
    }
  }

  const propostaAtual = propostas.find((p) => p.id === selecionadaId) || propostas[0];

  function aoSelecionarArquivoReenvio(e: React.ChangeEvent<HTMLInputElement>) {
    setErroReenvio("");
    const file = e.target.files?.[0];
    if (!file) {
      setArquivoReenvio(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErroReenvio("O arquivo deve ser um documento PDF.");
      setArquivoReenvio(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErroReenvio("O arquivo não pode exceder 10 MB.");
      setArquivoReenvio(null);
      return;
    }

    setArquivoReenvio(file);
  }

  async function reenviar(e: React.FormEvent) {
    e.preventDefault();
    if (!propostaAtual || !arquivoReenvio) return;

    setReenviando(true);
    setErroReenvio("");
    setAvisoReenvio("");
    try {
      const atualizada = await reenviarPropostaPdf(propostaAtual.id, arquivoReenvio);
      setAvisoReenvio(`Nova versão (v${atualizada.versaoEnvio}) enviada com sucesso! A proposta retornou para a esteira.`);
      setArquivoReenvio(null);
      await recarregar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao reenviar proposta.";
      setErroReenvio(msg);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <Casca
      titulo="Acompanhamento da Proposta"
      descricao="Consulte o status do envio da sua proposta de inovação e o resultado da deliberação da equipe técnica."
      larguraMaxima="max-w-7xl"
    >
      {() => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {carregando ? (
            <EstadoCarregando texto="Buscando suas propostas no sistema..." />
          ) : propostas.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma proposta enviada até o momento"
              texto="Você ainda não enviou propostas de inovação. Acesse o formulário de envio para submeter seu PDF."
            >
              <BotaoPrimario asChild>
                <Link href="/proponente/envios">Submeter Nova Proposta em PDF →</Link>
              </BotaoPrimario>
            </EstadoVazio>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Barra lateral com lista de protocolos */}
              <aside className="lg:col-span-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-[#2C3138]">Suas Propostas</h2>
                  <span className="text-xs text-[#5E6570] font-semibold">{propostas.length} submissão(ões)</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
                  {propostas.map((prop) => {
                    const ativa = prop.id === propostaAtual?.id;
                    const badge = corBadgeStatus(prop.status);

                    return (
                      <button
                        key={prop.id}
                        type="button"
                        onClick={() => {
                          setSelecionadaId(prop.id);
                          setAvisoReenvio("");
                          setErroReenvio("");
                          setArquivoReenvio(null);
                        }}
                        className={`text-left p-4 rounded-xl transition-all ${
                          ativa
                            ? "neo-inset border-l-4 border-[#C4161C] bg-[#ECEEF2]"
                            : "neo hover:bg-white/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-[#C4161C]">{prop.protocolo}</span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {rotuloStatus(prop.status)}
                          </span>
                        </div>

                        <p className="font-bold text-sm text-[#2C3138] mt-1 line-clamp-1">{prop.titulo}</p>
                        <div className="flex items-center justify-between text-xs text-[#5E6570] mt-2">
                          <span>{prop.setor}</span>
                          <span>v{prop.versaoEnvio}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* Dossiê de Acompanhamento do Projeto Selecionado */}
              <main className="lg:col-span-8 flex flex-col gap-5">
                {propostaAtual ? (
                  <>
                    {/* Cabeçalho do Projeto */}
                    <section className="neo p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9DCE3] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#C4161C] bg-red-50 px-2.5 py-1 rounded border border-red-200">
                            {propostaAtual.protocolo}
                          </span>
                          <span className="text-xs text-[#5E6570]">
                            Enviado em {new Date(propostaAtual.criadoEm).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              corBadgeStatus(propostaAtual.status).bg
                            } ${corBadgeStatus(propostaAtual.status).text} ${
                              corBadgeStatus(propostaAtual.status).border
                            }`}
                          >
                            {rotuloStatus(propostaAtual.status)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h2 className="font-display text-2xl font-bold text-[#2C3138]">{propostaAtual.titulo}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5E6570]">
                          <span>
                            Setor: <strong>{propostaAtual.setor}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Versão: <strong>{propostaAtual.versaoEnvio}ª submissão</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Arquivo: <strong className="font-mono">{propostaAtual.nomeArquivo}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Download do PDF */}
                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={`/api/projetos/${propostaAtual.id}/arquivo`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-neo text-xs px-3.5 py-2 inline-flex items-center gap-2 text-[#8E1218] font-semibold"
                        >
                          📥 Baixar Documento PDF Original ({propostaAtual.nomeArquivo})
                        </a>
                      </div>
                    </section>

                    {/* Bloco de Status da Análise */}
                    <section className="neo p-6 space-y-4">
                      <h3 className="font-display text-lg text-[#2C3138]">Status da Análise</h3>

                      {propostaAtual.status === "ProcessandoIa" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-blue-500 bg-blue-50/40">
                          <div className="flex items-center gap-2">
                            <span className="text-xl animate-spin">⏳</span>
                            <strong className="text-blue-900 text-sm">Processamento em Andamento</strong>
                          </div>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            O documento PDF está sendo processado pelo sistema e o agente de IA está extraindo o texto
                            para verificar o enquadramento preliminar nos preceitos do Manual de Frascati. Assim que concluído,
                            o projeto será direcionado para o analista responsável.
                          </p>
                        </div>
                      ) : null}

                      {propostaAtual.status === "AguardandoAnalista" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-amber-500 bg-amber-50/40">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            <strong className="text-amber-900 text-sm">Aguardando Deliberação do Analista</strong>
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            O documento foi recebido com sucesso e a triagem inicial foi concluída. A proposta está na fila
                            do analista técnico, que avaliará o parecer para deliberar sobre a aprovação, reprovação ou solicitação de complementações.
                          </p>
                        </div>
                      ) : null}

                      {propostaAtual.status === "Aprovado" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-emerald-600 bg-emerald-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎉</span>
                            <strong className="text-emerald-900 text-sm">Proposta Aprovada!</strong>
                          </div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            Parabéns! Sua proposta foi deliberada e considerada apta pelo analista técnico para o programa de inovação da empresa.
                          </p>
                          {propostaAtual.justificativaAnalista ? (
                            <div className="mt-2 pt-2 border-t border-emerald-200">
                              <span className="text-[11px] font-bold uppercase text-emerald-900">Parecer do Analista:</span>
                              <p className="text-xs text-emerald-800 mt-0.5">{propostaAtual.justificativaAnalista}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {propostaAtual.status === "Reprovado" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-red-600 bg-red-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">❌</span>
                            <strong className="text-red-900 text-sm">Proposta Não Aprovada</strong>
                          </div>
                          <p className="text-xs text-red-800 leading-relaxed">
                            O analista técnico revisou o documento e concluiu que o projeto não atende aos requisitos necessários para enquadramento na Lei do Bem.
                          </p>
                          {propostaAtual.justificativaAnalista ? (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <span className="text-[11px] font-bold uppercase text-red-900">Motivo da Decisão:</span>
                              <p className="text-xs text-red-800 mt-0.5 whitespace-pre-wrap">{propostaAtual.justificativaAnalista}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {propostaAtual.status === "Reanalise" ? (
                        <div className="space-y-4">
                          <div className="neo-inset p-4 space-y-2 border-l-4 border-purple-600 bg-purple-50/50">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🔄</span>
                              <strong className="text-purple-900 text-sm">Reanálise Solicitada pelo Analista</strong>
                            </div>
                            <p className="text-xs text-purple-800 leading-relaxed">
                              O analista técnico analisou a proposta e identificou pontos que precisam de complementação ou revisão técnica.
                            </p>
                            {propostaAtual.justificativaAnalista ? (
                              <div className="mt-2 pt-2 border-t border-purple-200">
                                <span className="text-[11px] font-bold uppercase text-purple-900">Orientações do Analista:</span>
                                <p className="text-xs text-purple-800 mt-0.5 whitespace-pre-wrap font-medium">
                                  {propostaAtual.justificativaAnalista}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          {/* Formulário de Reenvio de PDF */}
                          <div className="neo p-5 space-y-3">
                            <h4 className="font-display text-base font-bold text-[#2C3138]">
                              Submeter Versão Revisada da Proposta (v{propostaAtual.versaoEnvio + 1})
                            </h4>
                            <p className="text-xs text-[#5E6570]">
                              Faça os ajustes apontados pelo analista no seu documento PDF e envie o arquivo atualizado abaixo.
                            </p>

                            {avisoReenvio ? <Aviso tipo="success" texto={avisoReenvio} /> : null}
                            {erroReenvio ? <Aviso tipo="error" texto={erroReenvio} /> : null}

                            <form onSubmit={reenviar} className="flex flex-col gap-3">
                              <div className="neo-inset flex flex-col items-center justify-center p-5 border border-dashed border-[#B8BAC2] text-center gap-2">
                                <input
                                  id="input-reenvio-pdf"
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={aoSelecionarArquivoReenvio}
                                  className="hidden"
                                />

                                <label
                                  htmlFor="input-reenvio-pdf"
                                  className="btn-neo text-xs px-3 py-1.5 cursor-pointer font-semibold hover:text-[#8E1218]"
                                >
                                  {arquivoReenvio ? "Trocar Arquivo" : "Selecionar Novo PDF Revisado"}
                                </label>

                                {arquivoReenvio ? (
                                  <span className="text-xs text-emerald-800 font-medium">
                                    ✓ {arquivoReenvio.name} ({formatarBytes(arquivoReenvio.size)})
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex justify-end">
                                <BotaoPrimario
                                  type="submit"
                                  loading={reenviando}
                                  loadingText="Reenviando..."
                                  disabled={!arquivoReenvio || reenviando}
                                >
                                  Reenviar Proposta Atualizada →
                                </BotaoPrimario>
                              </div>
                            </form>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  </>
                ) : null}
              </main>
            </div>
          )}
        </div>
      )}
    </Casca>
  );
}
