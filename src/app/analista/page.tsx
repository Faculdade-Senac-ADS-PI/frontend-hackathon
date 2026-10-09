"use client";

import { Dialog, NativeSelect } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import {
  CLASSES_ELEGIBILIDADE,
  consultarAgenteNormas,
  corBadgeStatus,
  deliberarProjeto,
  ehClassificacaoFinal,
  formatarBytes,
  gerarParecer,
  obterFilaAnalise,
  rotuloStatus,
  type ClasseElegibilidade,
  type ConsultaAgenteResposta,
  type ParecerResposta,
  type ProjetoAnaliseResposta,
  type StatusProjeto,
} from "@/lib/propostas-proponente";

/** Regra padrão citada na rastreabilidade da decisão (o analista pode ajustar). */
const REGRA_PADRAO =
  "Manual de Frascati (5 critérios) · Lei nº 11.196/2005 · Decreto nº 5.798/2006 · IN RFB nº 1.187/2011";

type Decisao = ClasseElegibilidade | "Reanalise";

const DESCRI_COES: Record<ClasseElegibilidade, { rotulo: string; dica: string; cores: string }> = {
  Elegivel: {
    rotulo: "✓ Elegível",
    dica: "P&D comprovado no escopo",
    cores: "bg-emerald-600 text-white border-emerald-700 shadow-inner",
  },
  ComRessalvas: {
    rotulo: "⚠ Com ressalvas",
    dica: "P&D com limitação pontual",
    cores: "bg-orange-500 text-white border-orange-600 shadow-inner",
  },
  NaoElegivel: {
    rotulo: "✕ Não elegível",
    dica: "Rotina, configuração ou integração",
    cores: "bg-red-600 text-white border-red-700 shadow-inner",
  },
  EvidenciaInsuficiente: {
    rotulo: "? Evidência insuficiente",
    dica: "Falta elo essencial no dossiê",
    cores: "bg-slate-600 text-white border-slate-700 shadow-inner",
  },
};

/** Escapa HTML para que textos do analista não injetem marcação. */
function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatarInlineHtml(texto: string): string {
  return escaparHtml(texto).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/**
 * Converte o Markdown simples do parecer (títulos, listas, negrito, citação, régua)
 * em HTML — usado no diálogo do navegador e na janela de impressão.
 */
function renderizarMarkdownHtml(md: string): string {
  const saida: string[] = [];
  let lista: string[] = [];
  let paragrafo: string[] = [];

  const fecharLista = () => {
    if (lista.length > 0) {
      saida.push(`<ul>${lista.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      lista = [];
    }
  };
  const fecharParagrafo = () => {
    if (paragrafo.length > 0) {
      saida.push(`<p>${paragrafo.join("<br/>")}</p>`);
      paragrafo = [];
    }
  };

  for (const linha of md.split("\n")) {
    const itemLista = linha.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (itemLista) {
      fecharParagrafo();
      lista.push(formatarInlineHtml(itemLista[1]));
      continue;
    }

    if (/^###\s+/.test(linha)) {
      fecharLista();
      fecharParagrafo();
      saida.push(`<h3>${formatarInlineHtml(linha.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(linha)) {
      fecharLista();
      fecharParagrafo();
      saida.push(`<h2>${formatarInlineHtml(linha.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s+/.test(linha)) {
      fecharLista();
      fecharParagrafo();
      saida.push(`<h1>${formatarInlineHtml(linha.replace(/^#\s+/, ""))}</h1>`);
    } else if (/^---+\s*$/.test(linha.trim())) {
      fecharLista();
      fecharParagrafo();
      saida.push("<hr/>");
    } else if (/^>\s?/.test(linha)) {
      fecharLista();
      fecharParagrafo();
      saida.push(`<blockquote>${formatarInlineHtml(linha.replace(/^>\s?/, ""))}</blockquote>`);
    } else if (linha.trim() === "") {
      fecharLista();
      fecharParagrafo();
    } else if (/\s{2}$/.test(linha)) {
      // Quebra forçada do Markdown (linha termina em dois espaços): mesmo parágrafo.
      fecharLista();
      paragrafo.push(formatarInlineHtml(linha.trimEnd()));
    } else {
      fecharLista();
      fecharParagrafo();
      saida.push(`<p>${formatarInlineHtml(linha)}</p>`);
    }
  }

  fecharLista();
  fecharParagrafo();
  return saida.join("\n");
}

/** Campo de texto (textarea) rotulado, no padrão visual do sistema. */
function CampoTexto({
  label,
  valor,
  onChange,
  placeholder,
  linhas = 2,
  obrigatorio = false,
}: {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  linhas?: number;
  obrigatorio?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#727c81]">
        {label}
        {obrigatorio ? <span className="text-[#a6193c]"> *</span> : null}
      </label>
      <textarea
        rows={linhas}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="neo-inset w-full p-2.5 text-xs leading-relaxed"
      />
    </div>
  );
}

export default function Analista() {
  const [propostas, setPropostas] = useState<ProjetoAnaliseResposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todas");

  // Dossiê selecionado para deliberação
  const [casoSelecionado, setCasoSelecionado] = useState<ProjetoAnaliseResposta | null>(null);
  const [decisao, setDecisao] = useState<Decisao>("Elegivel");
  const [justificativa, setJustificativa] = useState("");
  const [recorteSustentado, setRecorteSustentado] = useState("");
  const [limitacaoTecnica, setLimitacaoTecnica] = useState("");
  const [evidenciaNecessaria, setEvidenciaNecessaria] = useState("");
  const [eloAusente, setEloAusente] = useState("");
  const [evidenciasAdicionais, setEvidenciasAdicionais] = useState("");
  const [evidenciasUtilizadas, setEvidenciasUtilizadas] = useState("");
  const [evidenciasContrarias, setEvidenciasContrarias] = useState("");
  const [lacunas, setLacunas] = useState("");
  const [regraAplicada, setRegraAplicada] = useState(REGRA_PADRAO);
  const [salvandoDecisao, setSalvandoDecisao] = useState(false);
  const [avisoSucesso, setAvisoSucesso] = useState("");
  const [avisoErro, setAvisoErro] = useState("");
  const [erroDecisao, setErroDecisao] = useState("");

  // Parecer rastreável (documento gerado após a classificação)
  const [parecer, setParecer] = useState<ParecerResposta | null>(null);
  const [gerandoParecer, setGerandoParecer] = useState(false);

  // Consulta às normas (RAG) dentro do dossiê — apoio ao analista, nunca decide
  const [consultaPergunta, setConsultaPergunta] = useState("");
  const [consultaResposta, setConsultaResposta] = useState<ConsultaAgenteResposta | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [erroConsulta, setErroConsulta] = useState("");

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
    const contar = (s: StatusProjeto) => propostas.filter((p) => p.status === s).length;
    return {
      total: propostas.length,
      aguardando: contar("AguardandoAnalista"),
      elegiveis: contar("Elegivel"),
      comRessalvas: contar("ComRessalvas"),
      naoElegiveis: contar("NaoElegivel"),
      insuficientes: contar("EvidenciaInsuficiente"),
      reanalises: contar("Reanalise"),
    };
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
    setDecisao("Elegivel");
    setJustificativa(proposta.justificativaAnalista || "");
    setRecorteSustentado(proposta.recorteSustentado || "");
    setLimitacaoTecnica(proposta.limitacaoTecnica || "");
    setEvidenciaNecessaria(proposta.evidenciaNecessaria || "");
    setEloAusente(proposta.eloAusente || "");
    setEvidenciasAdicionais(proposta.evidenciasAdicionais || "");
    setEvidenciasUtilizadas(proposta.evidenciasUtilizadas || "");
    setEvidenciasContrarias(proposta.evidenciasContrarias || "");
    setLacunas(proposta.lacunas || "");
    setRegraAplicada(proposta.regraAplicada || REGRA_PADRAO);
    setErroDecisao("");
    setConsultaPergunta("");
    setConsultaResposta(null);
    setErroConsulta("");
  }

  /** Valida os campos obrigatórios da classe escolhida (espelha as regras do backend). */
  function validarDeliberacao(): string {
    if (!justificativa.trim())
      return "A fundamentação da conclusão é obrigatória: registre o motivo da decisão com as fontes que a sustentam.";
    if (decisao === "Reanalise") return "";

    if (!evidenciasUtilizadas.trim())
      return "Informe as evidências utilizadas na conclusão, identificadas por ID (ex.: PRJ21-EV05, metodo.md#2).";
    if (
      decisao === "ComRessalvas" &&
      (!recorteSustentado.trim() || !limitacaoTecnica.trim() || !evidenciaNecessaria.trim())
    )
      return '"Com ressalvas" exige o recorte sustentado, a limitação técnica específica e a evidência necessária para resolver a ressalva.';
    if (decisao === "EvidenciaInsuficiente" && (!eloAusente.trim() || !evidenciasAdicionais.trim()))
      return '"Evidência insuficiente" exige especificar o elo ausente e as evidências adicionais a solicitar.';
    return "";
  }

  async function executarDeliberacao() {
    if (!casoSelecionado) return;
    setErroDecisao("");

    const erroValidacao = validarDeliberacao();
    if (erroValidacao) {
      setErroDecisao(erroValidacao);
      return;
    }

    setSalvandoDecisao(true);
    try {
      const atualizado = await deliberarProjeto(casoSelecionado.id, {
        decisao,
        justificativa: justificativa.trim(),
        recorteSustentado: recorteSustentado.trim() || undefined,
        limitacaoTecnica: limitacaoTecnica.trim() || undefined,
        evidenciaNecessaria: evidenciaNecessaria.trim() || undefined,
        eloAusente: eloAusente.trim() || undefined,
        evidenciasAdicionais: evidenciasAdicionais.trim() || undefined,
        evidenciasUtilizadas: evidenciasUtilizadas.trim() || undefined,
        evidenciasContrarias: evidenciasContrarias.trim() || undefined,
        lacunas: lacunas.trim() || undefined,
        regraAplicada: regraAplicada.trim() || undefined,
      });
      setPropostas((antigas) => antigas.map((p) => (p.id === atualizado.id ? atualizado : p)));
      setAvisoSucesso(
        `Projeto ${atualizado.protocolo} classificado como "${rotuloStatus(atualizado.status)}".`
      );
      setCasoSelecionado(null);

      // Deliberação concluída: gera e apresenta o parecer rastreável (documento defendível).
      if (ehClassificacaoFinal(atualizado.status)) {
        await abrirParecer(atualizado.id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar a deliberação.";
      setErroDecisao(msg);
    } finally {
      setSalvandoDecisao(false);
    }
  }

  /** Gera o parecer em Markdown a partir da classificação registrada e abre o visualizador. */
  async function abrirParecer(projetoId: string) {
    setAvisoErro("");
    setGerandoParecer(true);
    try {
      const documento = await gerarParecer(projetoId);
      setParecer(documento);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar o parecer.";
      setAvisoErro(msg);
    } finally {
      setGerandoParecer(false);
    }
  }

  function baixarParecer(doc: ParecerResposta) {
    const blob = new Blob([doc.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `parecer-${doc.protocolo}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /** Abre o parecer em nova aba já formatado e dispara a impressão (salvar em PDF). */
  function imprimirParecer(doc: ParecerResposta) {
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Parecer ${doc.protocolo} — Lei do Bem</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; margin: 40px auto; max-width: 800px; line-height: 1.6; font-size: 13px; }
  h1 { font-size: 22px; color: #a6193c; border-bottom: 3px solid #a6193c; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #333; margin-top: 26px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3, h4 { font-size: 14px; color: #444; }
  ul { padding-left: 22px; } li { margin-bottom: 3px; }
  strong { color: #111; }
  blockquote { border-left: 3px solid #f68b1f; background: #fbf7f1; margin: 10px 0; padding: 8px 14px; font-style: italic; }
  hr { border: none; border-top: 1px solid #ccc; margin: 22px 0; }
  em { color: #666; }
</style></head><body>${renderizarMarkdownHtml(doc.markdown)}</body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 350);
  }

  /** Consulta as normas da base (RAG) sobre o dossiê em análise. A IA apoia; não decide. */
  async function executarConsulta() {
    if (!casoSelecionado || !consultaPergunta.trim()) return;
    setErroConsulta("");
    setConsultando(true);
    try {
      const resposta = await consultarAgenteNormas(casoSelecionado.id, consultaPergunta.trim());
      setConsultaResposta(resposta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível consultar as normas.";
      setErroConsulta(msg);
    } finally {
      setConsultando(false);
    }
  }

  return (
    <Casca
      titulo="Fila de Análise Técnica — Lei do Bem"
      descricao="Analise os dossiês de P&D submetidos pelos proponentes. Use o resumo e a pontuação nos 5 critérios de Frascati do Agente de IA como subsídio — a classificação final (Elegível, Com ressalvas, Não elegível ou Evidência insuficiente) é sempre do analista, com justificativa e evidências por ID."
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

          {avisoErro ? (
            <Aviso tipo="error" texto={avisoErro} />
          ) : null}

          {/* KPI Cards — 4 classes do desafio + estados de fluxo */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Métricas da Esteira">
            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Aguardando Análise</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-amber-700">{metricas.aguardando}</span>
                <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Fila</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Dossiês prontos para deliberação</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Elegíveis</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-emerald-700">{metricas.elegiveis}</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">P&D</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Caracterizam P&D no escopo</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Com ressalvas</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-orange-700">{metricas.comRessalvas}</span>
                <span className="text-xs font-medium text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">Limite</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">P&D com limitação concreta</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Não elegíveis</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-red-700">{metricas.naoElegiveis}</span>
                <span className="text-xs font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Rotina</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Aplicação de técnica conhecida</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Evidência insuficiente</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-slate-700">{metricas.insuficientes}</span>
                <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Elo ausente</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Falta informação essencial</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Reanálises</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-purple-700">{metricas.reanalises}</span>
                <span className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">Revisão</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Aguardando novo dossiê do proponente</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#727c81]">Total de Projetos</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#333333]">{metricas.total}</span>
                <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Todas</span>
              </div>
              <p className="mt-2 text-xs text-[#727c81]">Volume acumulado no sistema</p>
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
                  className="neo-inset w-full px-4 py-2.5 text-sm placeholder:text-[#828f95]"
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
                      <option value="Elegivel">Elegíveis</option>
                      <option value="ComRessalvas">Com ressalvas</option>
                      <option value="NaoElegivel">Não elegíveis</option>
                      <option value="EvidenciaInsuficiente">Evidência insuficiente</option>
                      <option value="Reanalise">Reanálise Solicitada</option>
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
            <div className="flex flex-wrap items-center gap-2 border-t border-[#ebebeb] pt-4">
              {(
                [
                  { valor: "todas", rotulo: "Todas", total: propostas.length },
                  { valor: "AguardandoAnalista", rotulo: "Aguardando", total: metricas.aguardando },
                  { valor: "Elegivel", rotulo: "Elegíveis", total: metricas.elegiveis },
                  { valor: "ComRessalvas", rotulo: "Com ressalvas", total: metricas.comRessalvas },
                  { valor: "NaoElegivel", rotulo: "Não elegíveis", total: metricas.naoElegiveis },
                  { valor: "EvidenciaInsuficiente", rotulo: "Insuficientes", total: metricas.insuficientes },
                  { valor: "Reanalise", rotulo: "Reanálises", total: metricas.reanalises },
                ] as const
              ).map((aba) => (
                <button
                  key={aba.valor}
                  type="button"
                  onClick={() => setFiltroStatus(aba.valor)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filtroStatus === aba.valor ? "btn-red text-white" : "btn-quiet text-[#727c81]"
                  }`}
                >
                  {aba.rotulo} ({aba.total})
                </button>
              ))}
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
                      className="neo flex flex-col justify-between gap-4 p-5 transition-shadow hover:shadow-[10px_10px_22px_#d3dadd,-10px_-10px_22px_#ffffff] md:p-6"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#a6193c] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {prop.protocolo}
                            </span>
                            <span className="text-xs text-[#727c81]">
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

                          <h3 className="font-display text-xl font-bold text-[#333333]">{prop.titulo}</h3>
                          <p className="text-xs text-[#727c81]">
                            Proponente: <strong>{prop.proponenteNome}</strong> ({prop.proponenteEmail}) · Versão {prop.versaoEnvio}
                          </p>
                        </div>

                        {/* Placar de Nota da IA */}
                        <div className="flex flex-row lg:flex-col items-end justify-between shrink-0 lg:text-right gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-gray-200">
                          <div>
                            <p className="text-[11px] text-[#727c81] uppercase font-bold">Nota Agente IA</p>
                            <div className="flex items-center gap-2">
                              <span className={`font-display text-2xl font-bold px-2 py-0.5 rounded border ${corNota}`}>
                                {nota !== null && nota !== undefined ? `${nota}/100` : "Pendente"}
                              </span>
                            </div>
                          </div>
                          {prop.recomendacaoIa ? (
                            <p className="text-xs font-semibold text-[#333333] mt-1">
                              {prop.recomendacaoIa}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Resumo da IA */}
                      {prop.resumoIa ? (
                        <div className="neo-inset p-3.5 text-xs text-[#4a4a4a] space-y-1">
                          <strong className="text-[#8a1533]">Resumo do Projeto (Elaborado pelo Agente de IA):</strong>
                          <p className="leading-relaxed line-clamp-3">{prop.resumoIa}</p>
                        </div>
                      ) : null}

                      {/* Critérios resumidos */}
                      {prop.criterios && prop.criterios.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                          {prop.criterios.map((c) => (
                            <div key={c.chave} className="neo-inset p-2 text-center">
                              <span className="text-[10px] text-[#727c81] block font-semibold truncate">{c.nome}</span>
                              <span className="font-mono text-xs font-bold text-[#333333]">
                                {c.nota !== null && c.nota !== undefined ? `${c.nota}/${c.notaMaxima}` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Ações */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ebebeb] pt-3">
                        <div className="flex items-center gap-2 text-xs text-[#727c81]">
                          <a
                            href={`/api/projetos/${prop.id}/arquivo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#8a1533] hover:underline inline-flex items-center gap-1"
                          >
                            📄 {prop.nomeArquivo} ({formatarBytes(prop.tamanhoBytes)})
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          {ehClassificacaoFinal(prop.status) ? (
                            <BotaoSecundario
                              type="button"
                              loading={gerandoParecer}
                              onClick={() => void abrirParecer(prop.id)}
                            >
                              📄 Ver Parecer
                            </BotaoSecundario>
                          ) : null}
                          <BotaoPrimario type="button" onClick={() => abrirDossie(prop)}>
                            {ehClassificacaoFinal(prop.status) ? "Abrir Dossiê →" : "Abrir Dossiê & Deliberar →"}
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
              <Dialog.Content className="neo" bg="#f7f8f9" w="full" maxW="3xl" maxH="90vh" overflowY="auto">
                <Dialog.Header>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-xs font-mono text-[#a6193c] font-bold">{casoSelecionado?.protocolo}</span>
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
                            <h4 className="font-bold text-base text-[#333333]">{casoSelecionado.titulo}</h4>
                            <p className="text-xs text-[#727c81] mt-0.5">
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

                        <div className="pt-2 border-t border-[#ebebeb] flex flex-col gap-2 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[#727c81]">
                              Documentos ({casoSelecionado.arquivos?.length || 1} anexo(s)): <strong className="font-mono">{casoSelecionado.nomeArquivo}</strong> (
                              {formatarBytes(casoSelecionado.tamanhoBytes)}) · {casoSelecionado.versaoEnvio}ª versão
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {casoSelecionado.arquivos && casoSelecionado.arquivos.length > 0 ? (
                              casoSelecionado.arquivos.map((arq) => {
                                const ehCsv = arq.extensao === ".csv";
                                return (
                                  <a
                                    key={arq.id}
                                    href={`/api/projetos/${casoSelecionado.id}/arquivos/${arq.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-neo text-xs px-2.5 py-1 text-[#333333] font-semibold hover:text-[#8a1533] inline-flex items-center gap-1.5"
                                  >
                                    <span>{ehCsv ? "📊" : "📄"}</span>
                                    <span className="font-mono">{arq.nome}</span>
                                    <span className="text-[10px] text-[#727c81]">({formatarBytes(arq.tamanhoBytes)})</span>
                                  </a>
                                );
                              })
                            ) : (
                              <a
                                href={`/api/projetos/${casoSelecionado.id}/arquivo`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-neo text-xs px-2.5 py-1 text-[#8a1533] font-bold"
                              >
                                📥 Baixar / Visualizar Arquivo Principal
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Avaliação do Agente de IA */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">
                            Avaliação pelo Agente de IA (5 Critérios do Manual de Frascati)
                          </h4>
                          {casoSelecionado.origemAnaliseIa ? (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              Origem: {casoSelecionado.origemAnaliseIa}
                            </span>
                          ) : null}
                        </div>

                        {/* Placar Geral */}
                        <div className="neo-inset p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div>
                              <span className="text-xs text-[#727c81] font-semibold uppercase">Nota Global de Elegibilidade</span>
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="font-display text-3xl font-bold text-[#333333]">
                                  {casoSelecionado.notaIa !== null && casoSelecionado.notaIa !== undefined
                                    ? casoSelecionado.notaIa
                                    : "—"}
                                </span>
                                <span className="text-sm text-[#727c81]">/ 100 pontos</span>
                              </div>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-xs text-[#727c81] font-semibold uppercase">Classe recomendada pela IA</span>
                              <p className="font-bold text-base text-emerald-800 mt-0.5">
                                {casoSelecionado.classeRecomendadaIa ||
                                  casoSelecionado.recomendacaoIa ||
                                  "Aguardando"}
                              </p>
                              <span
                                className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                                  casoSelecionado.usouRag
                                    ? "text-emerald-800 bg-emerald-100"
                                    : "text-slate-600 bg-slate-200"
                                }`}
                                title="Indica se a avaliação consultou a base de normas (RAG)"
                              >
                                {casoSelecionado.usouRag
                                  ? `RAG: ${casoSelecionado.trechosConsultadosIa ?? 0} trecho(s)`
                                  : "RAG: base não utilizada"}
                              </span>
                            </div>
                          </div>

                          {casoSelecionado.motivoClasseIa ? (
                            <p className="text-xs text-[#4a4a4a] leading-relaxed border-t border-[#ebebeb] pt-2">
                              <strong className="text-[#333333]">Motivo da classe: </strong>
                              {casoSelecionado.motivoClasseIa}
                            </p>
                          ) : null}
                        </div>

                        {/* Resumo da IA */}
                        {casoSelecionado.resumoIa ? (
                          <div className="neo-inset p-3.5 space-y-1 text-xs">
                            <strong className="text-[#333333]">Resumo Técnico da Proposta:</strong>
                            <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">{casoSelecionado.resumoIa}</p>
                          </div>
                        ) : null}

                        {/* Parecer Sintético da IA */}
                        {casoSelecionado.parecerIa ? (
                          <div className="neo-inset p-3.5 space-y-1 text-xs bg-slate-100/50">
                            <strong className="text-[#333333]">Parecer Sintético da IA:</strong>
                            <p className="text-[#4a4a4a] leading-relaxed">{casoSelecionado.parecerIa}</p>
                          </div>
                        ) : null}

                        {/* Os 5 Critérios Detalhados (0 a 20 cada) */}
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-[#333333] uppercase">Detalhamento por Critério:</span>
                          <div className="grid gap-3">
                            {casoSelecionado.criterios?.map((c, i) => (
                              <div key={c.chave} className="neo-inset p-3.5 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <strong className="text-[#8a1533]">
                                    {i + 1}. {c.nome}
                                  </strong>
                                  <span className="font-mono font-bold text-sm text-[#333333] bg-white px-2 py-0.5 rounded border border-[#ebebeb]">
                                    {c.nota !== null && c.nota !== undefined ? `${c.nota} / ${c.notaMaxima} pts` : "—"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#727c81] italic">{c.descricao}</p>
                                {c.justificativa ? (
                                  <div className="pt-1.5 border-t border-[#ebebeb]">
                                    <span className="font-semibold text-[#333333]">Análise da IA: </span>
                                    <span className="text-[#4a4a4a]">{c.justificativa}</span>
                                  </div>
                                ) : null}
                                {c.normasCitadas ? (
                                  <div className="pt-1.5 border-t border-[#ebebeb]">
                                    <span className="font-semibold text-[#8a1533]">Normas citadas: </span>
                                    <span className="text-[#4a4a4a]">{c.normasCitadas}</span>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Evidências, contradições e lacunas apontadas pela IA */}
                        {casoSelecionado.evidenciasDossieIa ||
                        casoSelecionado.contradicoesIa ||
                        casoSelecionado.lacunasIa ? (
                          <div className="grid gap-3 sm:grid-cols-3">
                            {casoSelecionado.evidenciasDossieIa ? (
                              <div className="neo-inset p-3.5 space-y-1 text-xs">
                                <strong className="text-emerald-800">Evidências do dossiê</strong>
                                <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                                  {casoSelecionado.evidenciasDossieIa}
                                </p>
                              </div>
                            ) : null}
                            {casoSelecionado.contradicoesIa ? (
                              <div className="neo-inset p-3.5 space-y-1 text-xs">
                                <strong className="text-red-700">Contradições / evidências contrárias</strong>
                                <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                                  {casoSelecionado.contradicoesIa}
                                </p>
                              </div>
                            ) : null}
                            {casoSelecionado.lacunasIa ? (
                              <div className="neo-inset p-3.5 space-y-1 text-xs">
                                <strong className="text-amber-700">Lacunas</strong>
                                <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                                  {casoSelecionado.lacunasIa}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      {/* Consulta às normas (RAG) — apoio do agente ao analista */}
                      <div className="space-y-3 pt-3 border-t border-[#ebebeb]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">
                          Consulta às normas (apoio do agente)
                        </h4>
                        <p className="text-[11px] text-[#727c81]">
                          Pergunte sobre o enquadramento e as normas da Lei do Bem. A resposta cita os trechos da base de
                          conhecimento e <strong>não substitui a decisão do analista</strong>.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={consultaPergunta}
                            onChange={(e) => setConsultaPergunta(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void executarConsulta();
                            }}
                            placeholder="Ex.: usar um recurso já existente da plataforma configura novidade tecnológica?"
                            className="neo-inset flex-1 px-3 py-2 text-xs"
                          />
                          <BotaoSecundario
                            type="button"
                            loading={consultando}
                            onClick={() => void executarConsulta()}
                          >
                            Consultar normas
                          </BotaoSecundario>
                        </div>
                        {erroConsulta ? <Aviso tipo="error" texto={erroConsulta} /> : null}
                        {consultaResposta ? (
                          <div className="space-y-2">
                            <div className="neo-inset p-3.5 text-xs space-y-1">
                              <strong className="text-[#8a1533]">Apoio do agente:</strong>
                              <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                                {consultaResposta.respostaApoio}
                              </p>
                            </div>
                            {consultaResposta.citacoes.length > 0 ? (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold uppercase text-[#727c81]">Fontes citadas</span>
                                {consultaResposta.citacoes.map((cit, i) => (
                                  <div key={i} className="neo-inset p-2.5 text-[11px] space-y-0.5">
                                    <span className="font-mono font-bold text-[#8a1533]">
                                      [{i + 1}] {cit.referencia}
                                    </span>
                                    <p className="text-[#4a4a4a] leading-relaxed">{cit.trecho}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      {/* Classificação do Analista Humano — 4 classes do desafio */}
                      <div className="space-y-4 pt-3 border-t border-[#ebebeb]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">
                          Classificação Técnica do Analista (4 classes)
                        </h4>

                        {casoSelecionado.status === "AguardandoAnalista" ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-[#727c81]">Classe de elegibilidade</label>
                              <div className="grid grid-cols-2 gap-2">
                                {CLASSES_ELEGIBILIDADE.map((classe) => {
                                  const info = DESCRI_COES[classe];
                                  const ativo = decisao === classe;
                                  return (
                                    <button
                                      key={classe}
                                      type="button"
                                      onClick={() => setDecisao(classe)}
                                      className={`p-3 rounded-lg text-left border transition-all ${
                                        ativo
                                          ? info.cores
                                          : "bg-white text-[#333333] border-[#e2e6e8] hover:bg-[#f2f4f5]"
                                      }`}
                                    >
                                      <span className="block text-xs font-bold">{info.rotulo}</span>
                                      <span
                                        className={`block text-[10px] mt-0.5 ${
                                          ativo ? "text-white/90" : "text-[#727c81]"
                                        }`}
                                      >
                                        {info.dica}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                type="button"
                                onClick={() => setDecisao("Reanalise")}
                                className={`w-full p-2.5 rounded-lg text-xs font-bold border transition-all ${
                                  decisao === "Reanalise"
                                    ? "bg-purple-600 text-white border-purple-700"
                                    : "bg-white text-purple-800 border-purple-200 hover:bg-purple-50"
                                }`}
                              >
                                🔄 Solicitar Reanálise (o proponente complementa o dossiê)
                              </button>
                            </div>

                            {decisao === "ComRessalvas" ? (
                              <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50/60 p-3">
                                <p className="text-[11px] text-orange-900">
                                  Documente o recorte: o que as evidências sustentam, onde está o limite e o que resolveria a ressalva.
                                </p>
                                <CampoTexto
                                  label="Recorte sustentado pelas evidências"
                                  obrigatorio
                                  valor={recorteSustentado}
                                  onChange={setRecorteSustentado}
                                  placeholder="Ex.: a incerteza de escalabilidade foi tratada até X, com as medições de Y..."
                                />
                                <CampoTexto
                                  label="Limitação técnica específica"
                                  obrigatorio
                                  valor={limitacaoTecnica}
                                  onChange={setLimitacaoTecnica}
                                  placeholder="Ex.: os testes ocorreram apenas em ambiente controlado, não em carga real..."
                                />
                                <CampoTexto
                                  label="Evidência necessária para resolver a ressalva"
                                  obrigatorio
                                  valor={evidenciaNecessaria}
                                  onChange={setEvidenciaNecessaria}
                                  placeholder="Ex.: relatório de medição em ambiente produtivo com volume real..."
                                />
                              </div>
                            ) : null}

                            {decisao === "EvidenciaInsuficiente" ? (
                              <div className="space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
                                <p className="text-[11px] text-slate-700">
                                  Aponte o elo que falta para caracterizar ou verificar o núcleo alegado do projeto.
                                </p>
                                <CampoTexto
                                  label="Elo ausente (o que impede a conclusão)"
                                  obrigatorio
                                  valor={eloAusente}
                                  onChange={setEloAusente}
                                  placeholder="Ex.: não há registro do método nem dos resultados da fase de incerteza..."
                                />
                                <CampoTexto
                                  label="Evidências adicionais a solicitar"
                                  obrigatorio
                                  valor={evidenciasAdicionais}
                                  onChange={setEvidenciasAdicionais}
                                  placeholder="Ex.: protocolo experimental, série de medições e revisão técnica do ciclo 2..."
                                />
                              </div>
                            ) : null}

                            <div className="space-y-1">
                              <label htmlFor="justificativa-analista" className="text-xs font-semibold text-[#727c81]">
                                Fundamentação da conclusão<span className="text-[#a6193c]"> *</span>
                              </label>
                              <textarea
                                id="justificativa-analista"
                                rows={4}
                                value={justificativa}
                                onChange={(e) => setJustificativa(e.target.value)}
                                placeholder={
                                  decisao === "Reanalise"
                                    ? "Indique claramente o que o proponente deve revisar ou complementar no novo dossiê..."
                                    : "Justifique a classificação com as fontes do dossiê: por que P&D, rotina, com ressalva ou insuficiente..."
                                }
                                className="neo-inset w-full p-3 text-xs leading-relaxed"
                              />
                            </div>

                            {decisao !== "Reanalise" ? (
                              <>
                                <CampoTexto
                                  label="Evidências utilizadas (por ID)"
                                  obrigatorio
                                  linhas={2}
                                  valor={evidenciasUtilizadas}
                                  onChange={setEvidenciasUtilizadas}
                                  placeholder="Ex.: PRJ21-EV05, PRJ21-EV06, metodo.md#3"
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <CampoTexto
                                    label="Evidências contrárias / divergências"
                                    valor={evidenciasContrarias}
                                    onChange={setEvidenciasContrarias}
                                    placeholder="Ex.: a entrevista afirma X, mas o registro técnico mostra Y..."
                                  />
                                  <CampoTexto
                                    label="Lacunas identificadas"
                                    valor={lacunas}
                                    onChange={setLacunas}
                                    placeholder="Ex.: ausência de medição em ambiente real..."
                                  />
                                </div>
                              </>
                            ) : null}

                            <div className="space-y-1">
                              <label htmlFor="regra-analista" className="text-xs font-semibold text-[#727c81]">
                                Regra / critério aplicado (rastreabilidade)
                              </label>
                              <input
                                id="regra-analista"
                                type="text"
                                value={regraAplicada}
                                onChange={(e) => setRegraAplicada(e.target.value)}
                                className="neo-inset w-full px-3 py-2 text-xs"
                              />
                            </div>
                          </>
                        ) : ehClassificacaoFinal(casoSelecionado.status) ? (
                          <div className="space-y-3">
                            <div className="neo-inset p-3.5 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[#727c81]">Classificação registrada</span>
                                <span
                                  className={`font-bold px-2.5 py-0.5 rounded-full border ${
                                    corBadgeStatus(casoSelecionado.status).bg
                                  } ${corBadgeStatus(casoSelecionado.status).text} ${
                                    corBadgeStatus(casoSelecionado.status).border
                                  }`}
                                >
                                  {rotuloStatus(casoSelecionado.status)}
                                </span>
                              </div>
                              <p className="text-[#4a4a4a] leading-relaxed whitespace-pre-wrap">
                                {casoSelecionado.justificativaAnalista || "—"}
                              </p>
                            </div>

                            {casoSelecionado.status === "ComRessalvas" ? (
                              <dl className="neo-inset p-3 text-xs space-y-1.5">
                                <div><dt className="font-semibold text-[#8a1533]">Recorte sustentado</dt><dd>{casoSelecionado.recorteSustentado || "—"}</dd></div>
                                <div><dt className="font-semibold text-[#8a1533]">Limitação</dt><dd>{casoSelecionado.limitacaoTecnica || "—"}</dd></div>
                                <div><dt className="font-semibold text-[#8a1533]">Evidência necessária</dt><dd>{casoSelecionado.evidenciaNecessaria || "—"}</dd></div>
                              </dl>
                            ) : null}

                            {casoSelecionado.status === "EvidenciaInsuficiente" ? (
                              <dl className="neo-inset p-3 text-xs space-y-1.5">
                                <div><dt className="font-semibold text-[#8a1533]">Elo ausente</dt><dd>{casoSelecionado.eloAusente || "—"}</dd></div>
                                <div><dt className="font-semibold text-[#8a1533]">Evidências adicionais</dt><dd>{casoSelecionado.evidenciasAdicionais || "—"}</dd></div>
                              </dl>
                            ) : null}

                            <dl className="neo-inset p-3 text-xs space-y-1.5">
                              <div><dt className="font-semibold text-[#8a1533]">Evidências utilizadas (por ID)</dt><dd className="whitespace-pre-wrap">{casoSelecionado.evidenciasUtilizadas || "—"}</dd></div>
                              {casoSelecionado.evidenciasContrarias ? <div><dt className="font-semibold text-[#8a1533]">Evidências contrárias / divergências</dt><dd>{casoSelecionado.evidenciasContrarias}</dd></div> : null}
                              {casoSelecionado.lacunas ? <div><dt className="font-semibold text-[#8a1533]">Lacunas</dt><dd>{casoSelecionado.lacunas}</dd></div> : null}
                              <div><dt className="font-semibold text-[#8a1533]">Regra aplicada</dt><dd>{casoSelecionado.regraAplicada || REGRA_PADRAO}</dd></div>
                              <div><dt className="font-semibold text-[#8a1533]">Decidido por</dt><dd>{casoSelecionado.analistaNome || "—"} {casoSelecionado.decididoEm ? `· ${new Date(casoSelecionado.decididoEm).toLocaleString("pt-BR")}` : ""}</dd></div>
                            </dl>
                          </div>
                        ) : (
                          <p className="text-xs text-[#727c81]">
                            O projeto está em fluxo ({rotuloStatus(casoSelecionado.status)}). A classificação ficará
                            disponível quando o dossiê estiver pronto para deliberação.
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                </Dialog.Body>

                <Dialog.Footer className="flex flex-wrap gap-2">
                  <BotaoSecundario type="button" onClick={() => setCasoSelecionado(null)}>
                    {casoSelecionado?.status === "AguardandoAnalista" ? "Cancelar" : "Fechar"}
                  </BotaoSecundario>
                  {casoSelecionado?.status === "AguardandoAnalista" ? (
                    <BotaoPrimario
                      type="button"
                      loading={salvandoDecisao}
                      loadingText="Gravando classificação..."
                      onClick={() => void executarDeliberacao()}
                    >
                      Confirmar Classificação →
                    </BotaoPrimario>
                  ) : casoSelecionado && ehClassificacaoFinal(casoSelecionado.status) ? (
                    <BotaoPrimario
                      type="button"
                      loading={gerandoParecer}
                      loadingText="Gerando parecer..."
                      onClick={() => {
                        const id = casoSelecionado.id;
                        setCasoSelecionado(null);
                        void abrirParecer(id);
                      }}
                    >
                      📄 Gerar Parecer Rastreável →
                    </BotaoPrimario>
                  ) : null}
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>

          {/* Visualizador do Parecer Rastreável (documento defendível) */}
          {parecer ? (
            <Dialog.Root open onOpenChange={(d) => !d.open && setParecer(null)}>
              <Dialog.Backdrop />
              <Dialog.Positioner p="4">
                <Dialog.Content className="neo" bg="#ffffff" w="full" maxW="3xl" maxH="90vh" overflowY="auto">
                  <Dialog.Header>
                    <span className="text-xs font-mono text-[#a6193c] font-bold">{parecer.protocolo}</span>
                    <Dialog.Title className="font-display text-2xl mt-1">
                      Parecer Preliminar de Enquadramento — Lei do Bem
                    </Dialog.Title>
                    <p className="text-xs text-[#727c81] mt-1">
                      Gerado em {new Date(parecer.geradoEm).toLocaleString("pt-BR")} · classificação:{" "}
                      <strong>{parecer.classificacao}</strong> · documento rastreável e defendível
                    </p>
                  </Dialog.Header>
                  <Dialog.Body>
                    <div
                      className="parecer-doc"
                      dangerouslySetInnerHTML={{ __html: renderizarMarkdownHtml(parecer.markdown) }}
                    />
                  </Dialog.Body>
                  <Dialog.Footer className="flex flex-wrap gap-2">
                    <BotaoSecundario type="button" onClick={() => baixarParecer(parecer)}>
                      ⬇ Baixar .md
                    </BotaoSecundario>
                    <BotaoPrimario type="button" onClick={() => imprimirParecer(parecer)}>
                      🖨 Imprimir / Salvar PDF
                    </BotaoPrimario>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Root>
          ) : null}
        </div>
      )}
    </Casca>
  );
}
