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
  reenviarPropostaArquivos,
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

  // Reenvio de arquivos em caso de Reanálise
  const [arquivosReenvio, setArquivosReenvio] = useState<File[]>([]);
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

  function aoSelecionarArquivosReenvio(e: React.ChangeEvent<HTMLInputElement>) {
    setErroReenvio("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novos: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nomeMin = file.name.toLowerCase();
      if (!nomeMin.endsWith(".pdf") && !nomeMin.endsWith(".csv")) {
        setErroReenvio(`O arquivo "${file.name}" não é suportado. Use apenas PDF e CSV.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErroReenvio(`O arquivo "${file.name}" excede 15 MB.`);
        return;
      }
      novos.push(file);
    }

    setArquivosReenvio((atuais) => {
      const nomes = new Set(atuais.map((a) => a.name));
      const filtrados = novos.filter((a) => !nomes.has(a.name));
      return [...atuais, ...filtrados];
    });

    e.target.value = "";
  }

  function removerArquivoReenvio(index: number) {
    setArquivosReenvio((atuais) => atuais.filter((_, i) => i !== index));
  }

  async function reenviar(e: React.FormEvent) {
    e.preventDefault();
    if (!propostaAtual || arquivosReenvio.length === 0) return;

    setReenviando(true);
    setErroReenvio("");
    setAvisoReenvio("");
    try {
      const atualizada = await reenviarPropostaArquivos(propostaAtual.id, arquivosReenvio);
      setAvisoReenvio(`Nova versão (v${atualizada.versaoEnvio}) enviada com sucesso! A proposta retornou para a esteira.`);
      setArquivosReenvio([]);
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
              texto="Você ainda não enviou propostas de inovação. Acesse o formulário de envio para submeter seus arquivos."
            >
              <BotaoPrimario asChild>
                <Link href="/proponente/envios">Submeter Nova Proposta (PDF / CSV) →</Link>
              </BotaoPrimario>
            </EstadoVazio>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Barra Lateral com a Lista de Propostas */}
              <aside className="lg:col-span-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-[#2C3138]">
                    Minhas Propostas ({propostas.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => void recarregar()}
                    className="text-xs text-[#8E1218] hover:underline font-semibold"
                  >
                    ↻ Atualizar
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[750px] overflow-y-auto pr-1">
                  {propostas.map((prop) => {
                    const ativa = prop.id === (propostaAtual?.id ?? "");
                    const badge = corBadgeStatus(prop.status);

                    return (
                      <button
                        key={prop.id}
                        type="button"
                        onClick={() => setSelecionadaId(prop.id)}
                        className={`text-left p-3.5 rounded-lg border transition-all ${
                          ativa
                            ? "bg-white border-[#8E1218] shadow-md ring-1 ring-[#8E1218]"
                            : "neo hover:border-[#8E1218]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#8E1218]">
                            {prop.protocolo}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {rotuloStatus(prop.status)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#2C3138] line-clamp-2 mb-1">
                          {prop.titulo}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-[#5E6570]">
                          <span>{prop.setor}</span>
                          <span>v{prop.versaoEnvio}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <BotaoPrimario asChild width="full">
                    <Link href="/proponente/envios">+ Nova Proposta</Link>
                  </BotaoPrimario>
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
                        </div>
                      </div>

                      {/* Download dos Arquivos Anexados */}
                      <div className="pt-2 space-y-2">
                        <span className="text-xs font-bold text-[#5E6570] uppercase tracking-wider">
                          Arquivos Anexados ({propostaAtual.arquivos?.length || 1}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {propostaAtual.arquivos && propostaAtual.arquivos.length > 0 ? (
                            propostaAtual.arquivos.map((arq) => {
                              const ehCsv = arq.extensao === ".csv";
                              return (
                                <a
                                  key={arq.id}
                                  href={`/api/projetos/${propostaAtual.id}/arquivos/${arq.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-neo text-xs px-3 py-1.5 inline-flex items-center gap-1.5 text-[#2C3138] font-semibold hover:text-[#8E1218]"
                                >
                                  <span>{ehCsv ? "📊" : "📄"}</span>
                                  <span className="max-w-xs truncate">{arq.nome}</span>
                                  <span className="text-[10px] text-[#5E6570]">({formatarBytes(arq.tamanhoBytes)})</span>
                                </a>
                              );
                            })
                          ) : (
                            <a
                              href={`/api/projetos/${propostaAtual.id}/arquivo`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-neo text-xs px-3.5 py-2 inline-flex items-center gap-2 text-[#8E1218] font-semibold"
                            >
                              📥 Baixar Documento Original ({propostaAtual.nomeArquivo})
                            </a>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Bloco de Status da Análise */}
                    <section className="neo p-6 space-y-4">
                      <h3 className="font-display text-lg font-bold text-[#2C3138]">
                        Status da Deliberação Técnica
                      </h3>

                      {propostaAtual.status === "ProcessandoIa" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-blue-500 bg-blue-50/50">
                          <div className="flex items-center gap-2">
                            <span className="animate-spin text-lg">⏳</span>
                            <strong className="text-blue-900 text-sm">Processando Avaliação com Agente de IA</strong>
                          </div>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            O agente de IA está extraindo os dados e avaliando a proposta com base nos critérios de novidade,
                            criatividade, sistemático, transferibilidade e incerteza do Manual de Frascati.
                          </p>
                        </div>
                      ) : null}

                      {propostaAtual.status === "AguardandoAnalista" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-amber-500 bg-amber-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            <strong className="text-amber-900 text-sm">Na Fila de Deliberação Técnica</strong>
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed">
                            A pré-análise do sistema foi concluída com sucesso. Sua proposta está aguardando a decisão
                            de um analista técnico do comitê de inovação. Você receberá o resultado em breve.
                          </p>
                        </div>
                      ) : null}

                      {propostaAtual.status === "Aprovado" ? (
                        <div className="neo-inset p-4 space-y-2 border-l-4 border-emerald-600 bg-emerald-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎉</span>
                            <strong className="text-emerald-900 text-sm">Proposta Aprovada para a Lei do Bem!</strong>
                          </div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            Parabéns! Sua proposta foi chancelada tecnicamente como elegível aos incentivos fiscais de P&D
                            da Lei do Bem pelo analista responsável.
                          </p>
                          {propostaAtual.justificativaAnalista ? (
                            <div className="mt-2 pt-2 border-t border-emerald-200">
                              <span className="text-[11px] font-bold uppercase text-emerald-900">Parecer do Analista:</span>
                              <p className="text-xs text-emerald-800 mt-0.5 whitespace-pre-wrap">{propostaAtual.justificativaAnalista}</p>
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
                            O analista técnico revisou os documentos e concluiu que o projeto não atende aos requisitos necessários para enquadramento na Lei do Bem.
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

                          {/* Formulário de Reenvio de Arquivos */}
                          <div className="neo p-5 space-y-3">
                            <h4 className="font-display text-base font-bold text-[#2C3138]">
                              Submeter Versão Revisada da Proposta (v{propostaAtual.versaoEnvio + 1})
                            </h4>
                            <p className="text-xs text-[#5E6570]">
                              Faça os ajustes apontados pelo analista nos seus documentos e envie os arquivos atualizados (PDF e/ou CSV) abaixo.
                            </p>

                            {avisoReenvio ? <Aviso tipo="success" texto={avisoReenvio} /> : null}
                            {erroReenvio ? <Aviso tipo="error" texto={erroReenvio} /> : null}

                            <form onSubmit={reenviar} className="flex flex-col gap-3">
                              <div className="neo-inset flex flex-col items-center justify-center p-5 border border-dashed border-[#B8BAC2] text-center gap-2">
                                <input
                                  id="input-reenvio-arquivos"
                                  type="file"
                                  multiple
                                  accept=".pdf,.csv,application/pdf,text/csv"
                                  onChange={aoSelecionarArquivosReenvio}
                                  className="hidden"
                                />

                                <label
                                  htmlFor="input-reenvio-arquivos"
                                  className="btn-neo text-xs px-3 py-1.5 cursor-pointer font-semibold hover:text-[#8E1218]"
                                >
                                  + Selecionar Arquivos Revisados (PDF / CSV)
                                </label>

                                {arquivosReenvio.length > 0 ? (
                                  <div className="w-full mt-2 space-y-1.5 text-left">
                                    {arquivosReenvio.map((arq, idx) => (
                                      <div
                                        key={`${arq.name}-${idx}`}
                                        className="flex items-center justify-between p-2 bg-white rounded border text-xs"
                                      >
                                        <span className="font-medium truncate max-w-xs">{arq.name} ({formatarBytes(arq.size)})</span>
                                        <button
                                          type="button"
                                          onClick={() => removerArquivoReenvio(idx)}
                                          className="text-red-600 font-bold hover:underline"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex justify-end">
                                <BotaoPrimario
                                  type="submit"
                                  loading={reenviando}
                                  loadingText="Reenviando..."
                                  disabled={arquivosReenvio.length === 0 || reenviando}
                                >
                                  Enviar Nova Versão ({arquivosReenvio.length} anexo(s)) →
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
