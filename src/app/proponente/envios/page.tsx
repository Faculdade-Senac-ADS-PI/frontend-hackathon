"use client";

import { NativeSelect } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Casca } from "@/components/casca";
import { Aviso } from "@/components/estados";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import {
  corBadgeStatus,
  enviarPropostaArquivos,
  formatarBytes,
  obterMinhasPropostas,
  rotuloStatus,
  SETORES_PADRAO,
  type ProjetoProponenteResposta,
} from "@/lib/propostas-proponente";

export default function EnviosPage() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<ProjetoProponenteResposta[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Campos do envio
  const [titulo, setTitulo] = useState("");
  const [setor, setSetor] = useState<string>(SETORES_PADRAO[0]);
  const [outroSetor, setOutroSetor] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);

  // Estados de envio
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState<ProjetoProponenteResposta | null>(null);

  useEffect(() => {
    carregarPropostas();
  }, []);

  async function carregarPropostas() {
    setCarregandoLista(true);
    try {
      const dados = await obterMinhasPropostas();
      setPropostas(dados);
    } catch {
      // Lista vazia se backend estiver recém-iniciado
    } finally {
      setCarregandoLista(false);
    }
  }

  function aoSelecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    setErro("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novosArquivos: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nomeMin = file.name.toLowerCase();
      if (!nomeMin.endsWith(".pdf") && !nomeMin.endsWith(".csv")) {
        setErro(`O arquivo "${file.name}" não é suportado. Apenas extensões .pdf e .csv são permitidas.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErro(`O arquivo "${file.name}" ultrapassa o limite individual de 15 MB.`);
        return;
      }
      novosArquivos.push(file);
    }

    setArquivos((atuais) => {
      // Evita duplicatas pelo nome
      const nomesExistentes = new Set(atuais.map((a) => a.name));
      const filtrados = novosArquivos.filter((a) => !nomesExistentes.has(a.name));
      return [...atuais, ...filtrados];
    });

    // Limpa o input para permitir selecionar novos arquivos
    e.target.value = "";
  }

  function removerArquivo(index: number) {
    setArquivos((atuais) => atuais.filter((_, i) => i !== index));
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(null);

    const setorFinal = setor === "outro" ? outroSetor.trim() : setor;

    if (!titulo.trim()) {
      setErro("Informe o título do projeto de inovação.");
      return;
    }

    if (!setorFinal) {
      setErro("Informe o setor determinado para a proposta.");
      return;
    }

    if (arquivos.length === 0) {
      setErro("Selecione pelo menos um arquivo PDF ou CSV com a proposta técnica.");
      return;
    }

    const tamanhoTotal = arquivos.reduce((acc, a) => acc + a.size, 0);
    if (tamanhoTotal > 30 * 1024 * 1024) {
      setErro("O tamanho somado de todos os arquivos não pode ultrapassar 30 MB.");
      return;
    }

    setEnviando(true);
    try {
      const criada = await enviarPropostaArquivos(titulo.trim(), setorFinal, arquivos);
      setSucesso(criada);
      setTitulo("");
      setArquivos([]);
      setOutroSetor("");
      // Recarrega lista
      void carregarPropostas();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar a proposta.";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Casca
      titulo="Envio de Proposta de Inovação"
      descricao="Submeta arquivos em PDF e/ou CSV da proposta do seu setor. O sistema processará todos os anexos e direcionará para análise de elegibilidade à Lei do Bem pelo Agente de IA."
      larguraMaxima="max-w-7xl"
    >
      {() => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {erro ? <Aviso tipo="error" texto={erro} /> : null}

          {sucesso ? (
            <div className="neo flex flex-col gap-3 p-5 border-l-4 border-emerald-600 bg-emerald-50/50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="space-y-1">
                  <h3 className="font-bold text-emerald-900">
                    Proposta enviada com sucesso! Protocolo: {sucesso.protocolo}
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Os documentos ({sucesso.arquivos?.length || 1} anexo(s)) foram processados e registrados no banco de dados.
                    A proposta já está na esteira técnica e você pode acompanhar o status da análise.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <BotaoPrimario asChild>
                  <Link href={`/proponente/acompanhamento?caso=${sucesso.id}`}>
                    Acompanhar Status da Proposta →
                  </Link>
                </BotaoPrimario>
                <BotaoSecundario type="button" onClick={() => setSucesso(null)}>
                  Enviar Outra Proposta
                </BotaoSecundario>
              </div>
            </div>
          ) : null}

          {/* Formulário de Envio Neumorphic */}
          <section className="neo p-6 sm:p-8">
            <div className="max-w-3xl space-y-2 mb-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8a1533] bg-red-100 px-2.5 py-0.5 rounded-full">
                Submissão Multi-arquivo (PDF e CSV)
              </span>
              <h2 className="font-display text-2xl text-[#333333]">
                Cadastrar Proposta de Inovação
              </h2>
              <p className="text-sm text-[#727c81]">
                Envie um ou mais documentos técnicos em PDF e planilhas de dados em CSV. O agente de IA extrairá os dados combinados para avaliar
                os 5 critérios do Manual de Frascati (Novidade, Criatividade, Sistemático, Transferibilidade e Incerteza)
                e submeter à decisão do analista técnico.
              </p>
            </div>

            <form onSubmit={submeter} className="flex flex-col gap-6">
              {/* Identificação */}
              <div className="space-y-4">
                <Campo
                  id="titulo-projeto"
                  rotulo="Título da Proposta de Inovação"
                  valor={titulo}
                  onChange={setTitulo}
                  placeholder="Ex: Novo Algoritmo de Otimização Térmica para Cadeia de Distribuição"
                  obrigatorio
                />

                <div className="space-y-1">
                  <label htmlFor="setor-select" className="text-xs font-semibold text-[#727c81]">
                    Setor / Área da Empresa Solicitante <span className="text-[#a6193c]">*</span>
                  </label>
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field
                      id="setor-select"
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                    >
                      {SETORES_PADRAO.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="outro">Outro setor (especificar)...</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>

                  {setor === "outro" ? (
                    <div className="pt-2">
                      <Campo
                        id="outro-setor"
                        rotulo="Nome do Setor"
                        valor={outroSetor}
                        onChange={setOutroSetor}
                        placeholder="Ex: Manutenção Mecânica de Alto-Forno"
                        obrigatorio
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Upload de Múltiplos Arquivos PDF e CSV */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#727c81]">
                    Arquivos da Proposta Técnica e Dados (PDF e/ou CSV) <span className="text-[#a6193c]">*</span>
                  </label>
                  <span className="text-[11px] text-[#727c81]">
                    {arquivos.length} arquivo(s) selecionado(s) · Total: {formatarBytes(arquivos.reduce((acc, a) => acc + a.size, 0))}
                  </span>
                </div>

                <div className="neo-inset flex flex-col items-center justify-center p-8 border border-dashed border-[#c8c9ca] text-center gap-3">
                  <span className="text-4xl">📁</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#333333]">
                      Selecione um ou mais arquivos PDF e planilhas CSV
                    </p>
                    <p className="text-xs text-[#727c81]">
                      Formatos aceitos: <strong>PDF</strong> e <strong>CSV</strong> (até 15 MB por arquivo, limite de 30 MB total).
                      Você pode selecionar múltiplos arquivos simultaneamente ou adicionar gradualmente.
                    </p>
                  </div>

                  <input
                    id="input-arquivos-multiplos"
                    type="file"
                    multiple
                    accept=".pdf,.csv,application/pdf,text/csv"
                    onChange={aoSelecionarArquivos}
                    className="hidden"
                  />

                  <label
                    htmlFor="input-arquivos-multiplos"
                    className="btn-neo text-xs px-4 py-2 cursor-pointer font-semibold hover:text-[#8a1533]"
                  >
                    + Adicionar Arquivos (PDF / CSV)
                  </label>

                  {/* Lista de Arquivos Selecionados */}
                  {arquivos.length > 0 ? (
                    <div className="w-full mt-4 space-y-2 text-left">
                      <div className="text-xs font-bold text-[#727c81] uppercase tracking-wider">
                        Arquivos a serem enviados:
                      </div>
                      <div className="grid gap-2">
                        {arquivos.map((file, idx) => {
                          const ehCsv = file.name.toLowerCase().endsWith(".csv");
                          return (
                            <div
                              key={`${file.name}-${idx}`}
                              className="flex items-center justify-between p-2.5 bg-white border border-[#ebebeb] rounded-md text-xs shadow-xs"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    ehCsv
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-red-100 text-[#8a1533] border border-red-300"
                                  }`}
                                >
                                  {ehCsv ? "CSV" : "PDF"}
                                </span>
                                <span className="font-medium text-[#333333] truncate max-w-xs sm:max-w-md">
                                  {file.name}
                                </span>
                                <span className="text-[#727c81]">
                                  ({formatarBytes(file.size)})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removerArquivo(idx)}
                                className="text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded hover:bg-red-50 text-xs transition-colors"
                                title="Remover este arquivo"
                              >
                                ✕ Remover
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Orientações sobre a Lei do Bem */}
              <div className="neo-inset p-4 text-xs text-[#727c81] space-y-1.5">
                <strong className="text-[#8a1533]">Critérios de Elegibilidade (Lei do Bem / Manual de Frascati):</strong>
                <p>
                  O agente de IA avaliará todo o conteúdo somado dos PDFs e planilhas CSV nos 5 critérios: <strong>Novidade</strong> (avanço em relação ao estado da técnica),
                  <strong> Criatividade</strong> (abordagens não triviais), <strong>Sistemático</strong> (planejamento, testes, métricas e rastreabilidade),
                  <strong> Transferibilidade</strong> (capacidade de replicação) e <strong>Incerteza</strong> (riscos tecnológicos e hipóteses científicas).
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <BotaoSecundario type="button" onClick={() => router.push("/proponente")}>
                  Cancelar
                </BotaoSecundario>
                <BotaoPrimario
                  type="submit"
                  loading={enviando}
                  loadingText="Enviando e Processando com IA..."
                  disabled={!titulo.trim() || arquivos.length === 0 || enviando}
                >
                  Enviar Proposta de Inovação ({arquivos.length} anexo(s)) →
                </BotaoPrimario>
              </div>
            </form>
          </section>

          {/* Lista de Envios Anteriores do Proponente */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display text-xl text-[#333333]">Suas Propostas Submetidas</h3>

            {carregandoLista ? (
              <p className="text-sm text-[#727c81]">Carregando histórico de propostas...</p>
            ) : propostas.length === 0 ? (
              <div className="neo p-6 text-center text-sm text-[#727c81]">
                Você ainda não submeteu propostas de inovação. Preencha o formulário acima para enviar seus arquivos.
              </div>
            ) : (
              <div className="grid gap-4">
                {propostas.map((prop) => {
                  const badge = corBadgeStatus(prop.status);
                  const dataEnvioFormatada = new Date(prop.criadoEm).toLocaleDateString("pt-BR");

                  return (
                    <article key={prop.id} className="neo flex flex-col justify-between gap-3 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#a6193c] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {prop.protocolo}
                            </span>
                            <span className="text-xs text-[#727c81]">Enviado em {dataEnvioFormatada}</span>
                            <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                              {prop.setor}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {rotuloStatus(prop.status)}
                            </span>
                          </div>
                          <h4 className="font-display text-base font-bold text-[#333333]">{prop.titulo}</h4>
                          <p className="text-xs text-[#727c81]">
                            Arquivos: <span className="font-mono">{prop.nomeArquivo}</span> ({prop.arquivos?.length || 1} anexo(s) · versão {prop.versaoEnvio})
                          </p>
                        </div>
                      </div>

                      {prop.justificativaAnalista ? (
                        <div className="neo-inset p-3 text-xs text-[#4a4a4a]">
                          <strong className="text-[#8a1533]">Retorno do Analista:</strong>
                          <p className="mt-0.5">{prop.justificativaAnalista}</p>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between pt-2 border-t border-[#ebebeb] text-xs">
                        <span className="text-[#727c81]">
                          Status: <strong>{rotuloStatus(prop.status)}</strong>
                        </span>
                        <Link
                          href={`/proponente/acompanhamento?caso=${prop.id}`}
                          className="font-semibold text-[#8a1533] hover:underline"
                        >
                          Ver Acompanhamento Completo →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </Casca>
  );
}
