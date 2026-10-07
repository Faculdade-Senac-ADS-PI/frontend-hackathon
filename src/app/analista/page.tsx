"use client";

import { Badge, Dialog, NativeSelect } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoVazio } from "@/components/estados";
import { api, ErroApi } from "@/lib/api";

export type StatusProposta = "nova" | "em_analise" | "elegivel" | "diligencia" | "inelegivel";
export type AreaTecnologica = "Software & IA" | "Biotecnologia" | "Engenharia & Automação" | "Agrotech" | "Química";

export type PropostaCRM = {
  id: string;
  protocolo: string;
  empresa: string;
  cnpj: string;
  proponenteNome: string;
  proponenteEmail: string;
  tituloProjeto: string;
  area: AreaTecnologica;
  dispendioPrevisto: number;
  incertezaDescricao: string;
  metodologia: string;
  status: StatusProposta;
  dataSubmissao: string;
  lucroReal: boolean;
  cndAtiva: boolean;
  parecerAnalista?: string;
};

const PROPOSTAS_INICIAIS: PropostaCRM[] = [
  {
    id: "prop-1",
    protocolo: "PROP-2026-0101",
    empresa: "LogiTech Nordeste Inovações S.A.",
    cnpj: "14.283.910/0001-44",
    proponenteNome: "Marina Costa",
    proponenteEmail: "marina.costa@hackthon.dev",
    tituloProjeto: "Algoritmo Heurístico de Otimização Termodinâmica para Cargas Perecíveis",
    area: "Software & IA",
    dispendioPrevisto: 850000,
    incertezaDescricao: "Incerteza sobre a viabilidade de convergência matemática em tempo hábil para rotas com múltiplas variações térmicas locais sem suporte de modelos pré-existentes na literatura.",
    metodologia: "Desenvolvimento experimental comparativo com 4 formulações matemáticas proprietárias e testes em câmara de vácuo simulada.",
    status: "nova",
    dataSubmissao: "06/10/2026",
    lucroReal: true,
    cndAtiva: true,
  },
  {
    id: "prop-2",
    protocolo: "PROP-2026-0102",
    empresa: "BioPolímeros do Sertão Ltda",
    cnpj: "08.771.204/0001-89",
    proponenteNome: "Carlos Eduardo Mendes",
    proponenteEmail: "carlos.mendes@biopolimeros.com.br",
    tituloProjeto: "Síntese de Filme Biodegradável a partir do Mesocarpo do Caju",
    area: "Biotecnologia",
    dispendioPrevisto: 1420000,
    incertezaDescricao: "Ausência de rotas químicas conhecidas para garantir elasticidade tênsil superior a 45 MPa mantendo biodegradação completa em menos de 90 dias em solo tropical.",
    metodologia: "Delineamento composto central rotacional (DCCR) avaliando proporção de glicerol, pH e tempo de esterificação catalítica.",
    status: "em_analise",
    dataSubmissao: "04/10/2026",
    lucroReal: true,
    cndAtiva: true,
    parecerAnalista: "Incerteza técnica inicial demonstrada. Aguardando laudos de tração em laboratório certificado.",
  },
  {
    id: "prop-3",
    protocolo: "PROP-2026-0103",
    empresa: "Soluções AgroSolar Tech",
    cnpj: "31.450.812/0001-02",
    proponenteNome: "Beatriz Nogueira",
    proponenteEmail: "beatriz@agrosolar.com.br",
    tituloProjeto: "Módulo Fotovoltaico Bifacial com Revestimento Hidrofóbico Antirreflexo",
    area: "Engenharia & Automação",
    dispendioPrevisto: 680000,
    incertezaDescricao: "Degradação fotoquímica precoce do polímero em ambiente de alta salinidade e incidência UV no litoral nordestino.",
    metodologia: "Ensaios de envelhecimento acelerado em câmara de névoa salina ASTM B117 e espectroscopia Raman.",
    status: "elegivel",
    dataSubmissao: "01/10/2026",
    lucroReal: true,
    cndAtiva: true,
    parecerAnalista: "Enquadrado no Art. 17 da Lei 11.196/05 como Desenvolvimento Experimental com superação de barreira técnica não trivial.",
  },
  {
    id: "prop-4",
    protocolo: "PROP-2026-0104",
    empresa: "Varejo Express Nordeste S.A.",
    cnpj: "22.901.340/0001-19",
    proponenteNome: "Luciano Farias",
    proponenteEmail: "luciano@varejoexpress.com.br",
    tituloProjeto: "Migração de Sistema de Caixa Legado para Arquitetura de Microsserviços em Nuvem",
    area: "Software & IA",
    dispendioPrevisto: 390000,
    incertezaDescricao: "Adaptação de banco de dados relacional legado e integração de mensageria com latência reduzida.",
    metodologia: "Refatoração de código com framework comercial e parametrização de infraestrutura em nuvem.",
    status: "inelegivel",
    dataSubmissao: "28/09/2026",
    lucroReal: true,
    cndAtiva: true,
    parecerAnalista: "Trabalho de engenharia e parametrização rotineira. Não há incerteza científica ou tecnológica nos termos do Manual de Frascati.",
  },
  {
    id: "prop-5",
    protocolo: "PROP-2026-0105",
    empresa: "AgroSense Semiárido Sensores",
    cnpj: "18.332.901/0001-71",
    proponenteNome: "Fernanda Silveira",
    proponenteEmail: "fernanda@agrosense.tech",
    tituloProjeto: "Rede Mesh Subterrânea de Sensores de Umidade de Solo com Alimentação Piezoelétrica",
    area: "Agrotech",
    dispendioPrevisto: 940000,
    incertezaDescricao: "Atenuação severa do sinal eletromagnético em solos argilosos compactados com teor de umidade variável.",
    metodologia: "Modelagem eletromagnética tridimensional e testes de propagação de RF em faixas ISM sub-GHz.",
    status: "nova",
    dataSubmissao: "05/10/2026",
    lucroReal: true,
    cndAtiva: true,
  },
];

export default function Analista() {
  const [propostas, setPropostas] = useState<PropostaCRM[]>(PROPOSTAS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroArea, setFiltroArea] = useState<string>("todas");
  const [casoSelecionado, setCasoSelecionado] = useState<PropostaCRM | null>(null);
  const [parecerTexto, setParecerTexto] = useState("");
  const [novoStatus, setNovoStatus] = useState<StatusProposta>("em_analise");

  // Consulta IA / Agente
  const [perguntaAgente, setPerguntaAgente] = useState("");
  const [respostaAgente, setRespostaAgente] = useState("");
  const [statusAgente, setStatusAgente] = useState<number | null>(null);
  const [consultandoAgente, setConsultandoAgente] = useState(false);
  const [avisoSucesso, setAvisoSucesso] = useState("");

  const metricas = useMemo(() => {
    const total = propostas.length;
    const novas = propostas.filter((p) => p.status === "nova").length;
    const emAnalise = propostas.filter((p) => p.status === "em_analise").length;
    const elegiveis = propostas.filter((p) => p.status === "elegivel").length;
    const diligencias = propostas.filter((p) => p.status === "diligencia" || p.status === "inelegivel").length;
    const dispendioTotal = propostas.reduce((acc, cur) => acc + cur.dispendioPrevisto, 0);
    const deducaoPotencial = dispendioTotal * 0.34; // 34% IRPJ/CSLL estimado no Lucro Real
    return { total, novas, emAnalise, elegiveis, diligencias, dispendioTotal, deducaoPotencial };
  }, [propostas]);

  const propostasFiltradas = useMemo(() => {
    return propostas.filter((p) => {
      const matchBusca =
        p.empresa.toLowerCase().includes(busca.toLowerCase()) ||
        p.tituloProjeto.toLowerCase().includes(busca.toLowerCase()) ||
        p.proponenteNome.toLowerCase().includes(busca.toLowerCase()) ||
        p.protocolo.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "todas" ? true : p.status === filtroStatus;
      const matchArea = filtroArea === "todas" ? true : p.area === filtroArea;
      return matchBusca && matchStatus && matchArea;
    });
  }, [propostas, busca, filtroStatus, filtroArea]);

  function abrirDossie(proposta: PropostaCRM) {
    setCasoSelecionado(proposta);
    setParecerTexto(proposta.parecerAnalista || "");
    setNovoStatus(proposta.status);
  }

  function salvarParecer() {
    if (!casoSelecionado) return;
    setPropostas((antigas) =>
      antigas.map((p) =>
        p.id === casoSelecionado.id
          ? { ...p, status: novoStatus, parecerAnalista: parecerTexto }
          : p
      )
    );
    setAvisoSucesso(`Parecer da proposta ${casoSelecionado.protocolo} atualizado para status "${rotuloStatus(novoStatus)}".`);
    setCasoSelecionado(null);
  }

  async function testarAgente() {
    if (!perguntaAgente.trim()) return;
    setConsultandoAgente(true);
    setRespostaAgente("");
    setStatusAgente(null);
    try {
      const resp = await api<{ resposta?: string }>("/api/agente/consulta", {
        method: "POST",
        body: JSON.stringify({ pergunta: perguntaAgente }),
      });
      setRespostaAgente(resp?.resposta || "Resposta recebida com sucesso.");
      setStatusAgente(200);
    } catch (err) {
      if (err instanceof ErroApi) {
        setStatusAgente(err.status);
        setRespostaAgente(
          err.status === 501
            ? "HTTP 501 (Not Implemented): O contrato do agente está ativo e protegido, aguardando conexão com pgvector e provedor de LLM na camada de infraestrutura."
            : err.message
        );
      } else {
        setRespostaAgente("Erro ao conectar com o serviço do agente.");
      }
    } finally {
      setConsultandoAgente(false);
    }
  }

  return (
    <Casca
      titulo="CRM do Analista — Esteira Lei do Bem"
      descricao="Gestão e análise preliminar de elegibilidade dos projetos submetidos pela equipe de P&D e proponentes."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoSecundario type="button" onClick={() => setAvisoSucesso("Fila de propostas sincronizada com sucesso.")}>
          Sincronizar Fila
        </BotaoSecundario>
      }
    >
      {() => (
        <div className="flex flex-col gap-6">
          {avisoSucesso ? (
            <Aviso tipo="success" texto={avisoSucesso} />
          ) : null}

          {/* KPI Summary Cards no estilo CRM Neumorphic */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Métricas do Pipeline">
            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Fila de Triagem</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.novas}</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Aguardando</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Casos sem parecer inicial</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Em Análise Técnica</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#8E1218]">{metricas.emAnalise}</span>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Em revisão</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Verificação de não-rotina</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Pré-Enquadrados</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-emerald-700">{metricas.elegiveis}</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Elegíveis</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Incerteza comprovada</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Diligências / Inelegíveis</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-[#5E6570]">{metricas.diligencias}</span>
                <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">Rotina/Dúvida</span>
              </div>
              <p className="mt-2 text-xs text-[#5E6570]">Ajuste ou rejeição</p>
            </div>

            <div className="neo flex flex-col justify-between p-4 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Volume P&D na Fila</span>
              <div className="mt-2">
                <span className="font-display text-2xl font-bold text-[#2C3138]">
                  {formatarMoeda(metricas.dispendioTotal)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Economia est.: {formatarMoeda(metricas.deducaoPotencial)}
              </p>
            </div>
          </section>

          {/* CRM Toolbar: Busca e Filtros Neumorphic */}
          <section className="neo flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <label htmlFor="busca-crm" className="sr-only">Buscar no CRM</label>
                <input
                  id="busca-crm"
                  type="text"
                  placeholder="Pesquisar por empresa, proponente, projeto ou protocolo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="neo-inset w-full px-4 py-2.5 text-sm placeholder:text-[#8E95A2]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="w-44">
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field
                      aria-label="Filtro por status da proposta"
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                      <option value="todas">Todos os Status</option>
                      <option value="nova">Fila Nova</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="elegivel">Elegíveis</option>
                      <option value="diligencia">Diligências</option>
                      <option value="inelegivel">Inelegíveis</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </div>

                <div className="w-48">
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field
                      aria-label="Filtro por área tecnológica"
                      value={filtroArea}
                      onChange={(e) => setFiltroArea(e.target.value)}
                    >
                      <option value="todas">Todas as Áreas</option>
                      <option value="Software & IA">Software & IA</option>
                      <option value="Biotecnologia">Biotecnologia</option>
                      <option value="Engenharia & Automação">Engenharia & Automação</option>
                      <option value="Agrotech">Agrotech</option>
                      <option value="Química">Química</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </div>
              </div>
            </div>

            {/* Abas Rápidas estilo CRM Pipeline */}
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
                onClick={() => setFiltroStatus("nova")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "nova" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Novas ({metricas.novas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("em_analise")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "em_analise" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Em Análise ({metricas.emAnalise})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("elegivel")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "elegivel" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Elegíveis ({metricas.elegiveis})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus("inelegivel")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filtroStatus === "inelegivel" ? "btn-red text-white" : "btn-quiet text-[#5E6570]"
                }`}
              >
                Inelegíveis ({metricas.diligencias})
              </button>
            </div>
          </section>

          {/* Lista de Casos do Pipeline CRM */}
          <section className="flex flex-col gap-4">
            {propostasFiltradas.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum caso encontrado com os filtros atuais"
                texto="Altere os termos de pesquisa ou redefina os filtros para visualizar outras propostas de inovação."
              />
            ) : (
              <div className="grid gap-4">
                {propostasFiltradas.map((proposta) => (
                  <article
                    key={proposta.id}
                    className="neo flex flex-col justify-between gap-4 p-5 transition-shadow hover:shadow-[10px_10px_22px_#c2c5ce,-10px_-10px_22px_#ffffff] md:p-6"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {proposta.protocolo}
                          </span>
                          <span className="text-xs text-[#5E6570]">Submetido em {proposta.dataSubmissao}</span>
                          <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                            {proposta.area}
                          </span>
                          <Badge
                            colorPalette={statusCor(proposta.status)}
                            variant="subtle"
                            px="2.5"
                            py="0.5"
                            borderRadius="md"
                          >
                            {rotuloStatus(proposta.status)}
                          </Badge>
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#2C3138]">{proposta.tituloProjeto}</h3>
                        <p className="text-sm font-semibold text-[#5E6570]">
                          {proposta.empresa} <span className="font-normal text-xs text-[#8E95A2]">({proposta.cnpj})</span>
                          {" · "}
                          <span className="font-normal text-xs">Resp: {proposta.proponenteNome}</span>
                        </p>
                      </div>

                      <div className="flex flex-row lg:flex-col items-end justify-between shrink-0 lg:text-right gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-gray-200">
                        <div>
                          <p className="text-xs text-[#5E6570]">Dispêndio Estimado P&D</p>
                          <p className="font-display text-lg font-bold text-[#2C3138]">
                            {formatarMoeda(proposta.dispendioPrevisto)}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-emerald-700">
                          Benefício est.: {formatarMoeda(proposta.dispendioPrevisto * 0.34)}
                        </p>
                      </div>
                    </div>

                    <div className="neo-inset p-3.5 text-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">
                        Incerteza Tecnológica (Não-Rotina):
                      </p>
                      <p className="mt-1 line-clamp-2 text-[#4A515C] leading-relaxed">
                        {proposta.incertezaDescricao}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9DCE3] pt-3">
                      <div className="flex items-center gap-2 text-xs text-[#5E6570]">
                        <span className={`inline-block w-2 h-2 rounded-full ${proposta.lucroReal ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>Lucro Real: {proposta.lucroReal ? "Confirmado" : "Não"}</span>
                        {" · "}
                        <span className={`inline-block w-2 h-2 rounded-full ${proposta.cndAtiva ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>CND: {proposta.cndAtiva ? "Válida" : "Pendente"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <BotaoPrimario type="button" onClick={() => abrirDossie(proposta)}>
                          Abrir Dossiê 360°
                        </BotaoPrimario>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Assistente de Normas e IA (RAG) */}
          <section className="neo p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl text-[#2C3138]">Consulta às Normas com IA (RAG)</h2>
                <p className="text-sm text-[#5E6570]">
                  Consulte os parâmetros do Manual de Frascati e Lei 11.196/05 integrados à API da aplicação.
                </p>
              </div>
              <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded">
                API: /api/agente/consulta
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Ex: Qual o critério para considerar software como desenvolvimento experimental?"
                  value={perguntaAgente}
                  onChange={(e) => setPerguntaAgente(e.target.value)}
                  className="neo-inset flex-1 px-4 py-2.5 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void testarAgente();
                  }}
                />
                <BotaoPrimario
                  type="button"
                  loading={consultandoAgente}
                  loadingText="Consultando..."
                  onClick={() => void testarAgente()}
                  disabled={!perguntaAgente.trim()}
                >
                  Consultar Agente
                </BotaoPrimario>
              </div>

              {respostaAgente ? (
                <div className="neo-inset p-4 text-sm mt-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D9DCE3]">
                    <span className="font-semibold text-xs uppercase tracking-wide text-[#2C3138]">
                      Retorno do Agente
                    </span>
                    {statusAgente !== null ? (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${statusAgente === 200 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        HTTP {statusAgente}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[#2C3138] leading-relaxed whitespace-pre-wrap">{respostaAgente}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Modal / Painel 360° do Dossiê do Caso */}
          <Dialog.Root open={casoSelecionado !== null} onOpenChange={(d) => !d.open && setCasoSelecionado(null)}>
            <Dialog.Backdrop />
            <Dialog.Positioner p="4">
              <Dialog.Content className="neo" bg="#F3F4F7" w="full" maxW="2xl" maxH="90vh" overflowY="auto">
                <Dialog.Header>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-xs font-mono text-[#C4161C] font-bold">{casoSelecionado?.protocolo}</span>
                      <Dialog.Title className="font-display text-2xl mt-1">Dossiê de Avaliação Preliminar</Dialog.Title>
                    </div>
                  </div>
                </Dialog.Header>

                <Dialog.Body className="space-y-5">
                  {casoSelecionado ? (
                    <>
                      <div className="neo-inset p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-base text-[#2C3138]">{casoSelecionado.empresa}</h4>
                            <p className="text-xs text-[#5E6570]">CNPJ: {casoSelecionado.cnpj} · Resp: {casoSelecionado.proponenteNome} ({casoSelecionado.proponenteEmail})</p>
                          </div>
                          <Badge colorPalette={statusCor(casoSelecionado.status)} variant="subtle">
                            {rotuloStatus(casoSelecionado.status)}
                          </Badge>
                        </div>
                        <div className="pt-2 border-t border-[#D9DCE3] flex justify-between text-xs text-[#5E6570]">
                          <span>Dispêndio: <strong>{formatarMoeda(casoSelecionado.dispendioPrevisto)}</strong></span>
                          <span>Economia IRPJ/CSLL: <strong>{formatarMoeda(casoSelecionado.dispendioPrevisto * 0.34)}</strong></span>
                          <span>Regime: <strong>Lucro Real</strong></span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Projeto de Inovação</h4>
                        <p className="text-sm font-semibold text-[#2C3138] mt-1">{casoSelecionado.tituloProjeto}</p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Critérios do Manual de Frascati</h4>
                        <div className="neo-inset p-3.5 space-y-2 text-xs">
                          <div>
                            <strong className="text-[#2C3138]">1. Incerteza Científica/Tecnológica:</strong>
                            <p className="text-[#4A515C] mt-0.5">{casoSelecionado.incertezaDescricao}</p>
                          </div>
                          <div className="pt-2 border-t border-[#D9DCE3]">
                            <strong className="text-[#2C3138]">2. Metodologia Sistemática & Rastro:</strong>
                            <p className="text-[#4A515C] mt-0.5">{casoSelecionado.metodologia}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E1218]">Parecer do Analista</h4>
                        <div className="space-y-2">
                          <label className="text-xs text-[#5E6570]">Status da Avaliação</label>
                          <NativeSelect.Root size="sm" width="full">
                            <NativeSelect.Field
                              value={novoStatus}
                              onChange={(e) => setNovoStatus(e.target.value as StatusProposta)}
                            >
                              <option value="nova">Fila Nova (Aguardando)</option>
                              <option value="em_analise">Em Análise Técnica</option>
                              <option value="elegivel">Classificar como Elegível</option>
                              <option value="diligencia">Solicitar Diligência / Documentos</option>
                              <option value="inelegivel">Classificar como Inelegível (Rotina)</option>
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                          </NativeSelect.Root>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-[#5E6570]">Justificativa Técnica e Fundamentação</label>
                          <textarea
                            rows={3}
                            value={parecerTexto}
                            onChange={(e) => setParecerTexto(e.target.value)}
                            placeholder="Descreva a fundamentação técnica conforme o Art. 17 da Lei 11.196/05 ou aponte se enquadra em mero trabalho de rotina..."
                            className="neo-inset w-full p-3 text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </Dialog.Body>

                <Dialog.Footer className="flex flex-wrap gap-2">
                  <BotaoSecundario type="button" onClick={() => setCasoSelecionado(null)}>
                    Fechar
                  </BotaoSecundario>
                  <BotaoPrimario type="button" onClick={salvarParecer}>
                    Gravar Decisão no CRM
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

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function rotuloStatus(status: StatusProposta) {
  switch (status) {
    case "nova":
      return "Nova Proposta";
    case "em_analise":
      return "Em Análise";
    case "elegivel":
      return "Elegível";
    case "diligencia":
      return "Diligência";
    case "inelegivel":
      return "Inelegível (Rotina)";
    default:
      return status;
  }
}

function statusCor(status: StatusProposta) {
  switch (status) {
    case "nova":
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
