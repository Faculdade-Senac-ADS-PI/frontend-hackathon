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
  enviarPropostaPdf,
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
  const [arquivo, setArquivo] = useState<File | null>(null);

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

  function aoSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    setErro("");
    const file = e.target.files?.[0];
    if (!file) {
      setArquivo(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErro("O arquivo deve ser obrigatoriamente um documento PDF.");
      setArquivo(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErro("O tamanho do arquivo não pode ultrapassar 10 MB.");
      setArquivo(null);
      return;
    }

    setArquivo(file);
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

    if (!arquivo) {
      setErro("Selecione o arquivo PDF contendo a proposta técnica.");
      return;
    }

    setEnviando(true);
    try {
      const criada = await enviarPropostaPdf(titulo.trim(), setorFinal, arquivo);
      setSucesso(criada);
      setTitulo("");
      setArquivo(null);
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
      descricao="Submeta o documento PDF da proposta do seu setor. O sistema processará o arquivo e direcionará para análise preliminar de elegibilidade à Lei do Bem."
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
                    O documento &quot;{sucesso.nomeArquivo}&quot; foi processado e registrado no banco de dados.
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
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8E1218] bg-red-100 px-2.5 py-0.5 rounded-full">
                Submissão via PDF
              </span>
              <h2 className="font-display text-2xl text-[#2C3138]">
                Cadastrar Proposta de Inovação
              </h2>
              <p className="text-sm text-[#5E6570]">
                Envie o documento técnico da proposta em PDF. O agente de IA extrairá o conteúdo para avaliar
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
                  <label htmlFor="setor-select" className="text-xs font-semibold text-[#5E6570]">
                    Setor / Área da Empresa Solicitante <span className="text-[#C4161C]">*</span>
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

              {/* Upload de Arquivo PDF */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#5E6570]">
                  Arquivo PDF da Proposta Técnica <span className="text-[#C4161C]">*</span>
                </label>

                <div className="neo-inset flex flex-col items-center justify-center p-8 border border-dashed border-[#B8BAC2] text-center gap-3">
                  <span className="text-4xl">📄</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#2C3138]">
                      Selecione o arquivo PDF contendo a descrição completa do projeto
                    </p>
                    <p className="text-xs text-[#5E6570]">
                      Formatos aceitos: <strong>PDF</strong> (máximo de 10 MB).
                      O documento deve conter contextualização, metodologia, incertezas técnicas e resultados esperados.
                    </p>
                  </div>

                  <input
                    id="input-arquivo-pdf"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={aoSelecionarArquivo}
                    className="hidden"
                  />

                  <label
                    htmlFor="input-arquivo-pdf"
                    className="btn-neo text-xs px-4 py-2 cursor-pointer font-semibold hover:text-[#8E1218]"
                  >
                    {arquivo ? "Trocar Arquivo Selecionado" : "Escolher Arquivo PDF"}
                  </label>

                  {arquivo ? (
                    <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium">
                      <span>✓ {arquivo.name}</span>
                      <span className="text-emerald-700">({formatarBytes(arquivo.size)})</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Orientações sobre a Lei do Bem */}
              <div className="neo-inset p-4 text-xs text-[#5E6570] space-y-1.5">
                <strong className="text-[#8E1218]">Critérios de Elegibilidade (Lei do Bem / Manual de Frascati):</strong>
                <p>
                  O agente de IA avaliará a proposta nos 5 pontos principais: <strong>Novidade</strong> (avanço em relação ao estado do conhecimento),
                  <strong> Criatividade</strong> (geração de ganhos e abordagens não triviais), <strong>Sistemático</strong> (planejamento, testes e registros estruturados),
                  <strong> Transferibilidade</strong> (capacidade de replicação do conhecimento) e <strong>Incerteza</strong> (superação de desafios e riscos tecnológicos).
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#D9DCE3]">
                <BotaoSecundario type="button" onClick={() => router.push("/proponente")}>
                  Cancelar
                </BotaoSecundario>
                <BotaoPrimario
                  type="submit"
                  loading={enviando}
                  loadingText="Enviando e Processando..."
                  disabled={!titulo.trim() || !arquivo || enviando}
                >
                  Enviar Proposta de Inovação →
                </BotaoPrimario>
              </div>
            </form>
          </section>

          {/* Lista de Envios Anteriores do Proponente */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display text-xl text-[#2C3138]">Suas Propostas Submetidas</h3>

            {carregandoLista ? (
              <p className="text-sm text-[#5E6570]">Carregando histórico de propostas...</p>
            ) : propostas.length === 0 ? (
              <div className="neo p-6 text-center text-sm text-[#5E6570]">
                Você ainda não submeteu propostas de inovação. Preencha o formulário acima para enviar seu primeiro PDF.
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
                          <h4 className="font-display text-base font-bold text-[#2C3138]">{prop.titulo}</h4>
                          <p className="text-xs text-[#5E6570]">
                            Arquivo: <span className="font-mono">{prop.nomeArquivo}</span> (versão {prop.versaoEnvio})
                          </p>
                        </div>
                      </div>

                      {prop.justificativaAnalista ? (
                        <div className="neo-inset p-3 text-xs text-[#4A515C]">
                          <strong className="text-[#8E1218]">Retorno do Analista:</strong>
                          <p className="mt-0.5">{prop.justificativaAnalista}</p>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between pt-2 border-t border-[#D9DCE3] text-xs">
                        <span className="text-[#5E6570]">
                          Status: <strong>{rotuloStatus(prop.status)}</strong>
                        </span>
                        <Link
                          href={`/proponente/acompanhamento?caso=${prop.id}`}
                          className="font-semibold text-[#8E1218] hover:underline"
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
