export type StatusEtapa = "concluido" | "em_andamento" | "pendente" | "atencao";

export type HistoricoEvento = {
  data: string;
  autor: string;
  descricao: string;
  tipo: "envio" | "triagem" | "analise" | "parecer" | "diligencia";
};

export type PropostaProponente = {
  id: string;
  protocolo: string;
  titulo: string;
  area: string;
  anoBase: string;
  dispendioTotal: number;
  dispendioEquipe: number;
  dispendioMateriais: number;
  dispendioTerceiros: number;
  beneficioEstimado: number;
  incertezaTecnica: string;
  metodologia: string;
  status: "triagem" | "em_analise" | "elegivel" | "diligencia" | "inelegivel";
  dataEnvio: string;
  parecerAnalista?: string;
  etapas: {
    submissao: StatusEtapa;
    triagem: StatusEtapa;
    analiseFrascati: StatusEtapa;
    parecerFinal: StatusEtapa;
  };
  historico: HistoricoEvento[];
};

export const PROPOSTAS_PADRAO: PropostaProponente[] = [
  {
    id: "prop-01",
    protocolo: "PROP-2026-0101",
    titulo: "Algoritmo Heurístico de Otimização Termodinâmica para Cargas Perecíveis",
    area: "Software & IA",
    anoBase: "2026",
    dispendioTotal: 850000,
    dispendioEquipe: 600000,
    dispendioMateriais: 100000,
    dispendioTerceiros: 150000,
    beneficioEstimado: 289000,
    incertezaTecnica:
      "Incerteza sobre a viabilidade de convergência matemática em tempo hábil para rotas com múltiplas variações térmicas locais sem suporte de modelos pré-existentes na literatura.",
    metodologia:
      "Delineamento experimental comparativo com formulações proprietárias e simulações em câmara de vácuo virtual.",
    status: "em_analise",
    dataEnvio: "06/10/2026",
    parecerAnalista:
      "Incerteza técnica comprovada. Em fase de verificação de não-rotina nos testes laboratoriais.",
    etapas: {
      submissao: "concluido",
      triagem: "concluido",
      analiseFrascati: "em_andamento",
      parecerFinal: "pendente",
    },
    historico: [
      {
        data: "06/10/2026 14:32",
        autor: "Proponente (Marina Costa)",
        descricao: "Proposta submetida com sucesso para a esteira técnica.",
        tipo: "envio",
      },
      {
        data: "06/10/2026 16:10",
        autor: "Sistema",
        descricao: "Protocolo PROP-2026-0101 gerado e direcionado para triagem.",
        tipo: "triagem",
      },
      {
        data: "07/10/2026 09:15",
        autor: "Analista de P&D (Rafael Duarte)",
        descricao: "Iniciada análise dos critérios de Frascati e enquadramento no Art. 17 da Lei 11.196/05.",
        tipo: "analise",
      },
    ],
  },
  {
    id: "prop-02",
    protocolo: "PROP-2026-0089",
    titulo: "Sensor IOT de Baixo Consumo para Telemetria em Solo Compactado",
    area: "Engenharia & Automação",
    anoBase: "2026",
    dispendioTotal: 680000,
    dispendioEquipe: 450000,
    dispendioMateriais: 180000,
    dispendioTerceiros: 50000,
    beneficioEstimado: 231200,
    incertezaTecnica:
      "Superação de atenuação severa de radiofrequência em faixas sub-GHz com consumo restrito a captação piezoelétrica.",
    metodologia:
      "Desenvolvimento de antena integrada e ensaios de propagação com banco de ensaios padronizado.",
    status: "elegivel",
    dataEnvio: "22/09/2026",
    parecerAnalista:
      "Projeto 100% elegível nos termos do Manual de Frascati. Atende aos critérios de novidade, incerteza e sistematicidade. Rastro documental regular.",
    etapas: {
      submissao: "concluido",
      triagem: "concluido",
      analiseFrascati: "concluido",
      parecerFinal: "concluido",
    },
    historico: [
      {
        data: "22/09/2026 10:00",
        autor: "Proponente",
        descricao: "Proposta submetida com projeto executivo anexado.",
        tipo: "envio",
      },
      {
        data: "24/09/2026 15:40",
        autor: "Analista de P&D",
        descricao: "Enquadramento favorável emitido com nota técnica.",
        tipo: "parecer",
      },
    ],
  },
];

const CHAVE_STORAGE = "hackthon_propostas_proponente";

export function obterPropostas(): PropostaProponente[] {
  if (typeof window === "undefined") return PROPOSTAS_PADRAO;
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (!salvo) {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(PROPOSTAS_PADRAO));
      return PROPOSTAS_PADRAO;
    }
    return JSON.parse(salvo) as PropostaProponente[];
  } catch {
    return PROPOSTAS_PADRAO;
  }
}

export function salvarNovaProposta(nova: Omit<PropostaProponente, "id" | "protocolo" | "dataEnvio" | "status" | "etapas" | "historico">): PropostaProponente {
  const lista = obterPropostas();
  const protocolo = `PROP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  const propostaCriada: PropostaProponente = {
    ...nova,
    id: `prop-${Date.now()}`,
    protocolo,
    status: "triagem",
    dataEnvio: dataHoje,
    etapas: {
      submissao: "concluido",
      triagem: "em_andamento",
      analiseFrascati: "pendente",
      parecerFinal: "pendente",
    },
    historico: [
      {
        data: `${dataHoje} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        autor: "Proponente",
        descricao: `Projeto submetido com protocolo ${protocolo} gerado.`,
        tipo: "envio",
      },
    ],
  };

  const atualizada = [propostaCriada, ...lista];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizada));
    } catch {
      // Ignora erro de storage
    }
  }
  return propostaCriada;
}
