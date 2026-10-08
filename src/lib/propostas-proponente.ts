import { api } from "@/lib/api";

export type StatusProjeto =
  | "ProcessandoIa"
  | "AguardandoAnalista"
  | "Elegivel"
  | "ComRessalvas"
  | "NaoElegivel"
  | "EvidenciaInsuficiente"
  | "Aprovado"
  | "Reprovado"
  | "Reanalise";

/** As quatro classes oficiais do desafio, na ordem do Guia do Participante. */
export const CLASSES_ELEGIBILIDADE = [
  "Elegivel",
  "ComRessalvas",
  "NaoElegivel",
  "EvidenciaInsuficiente",
] as const;

export type ClasseElegibilidade = (typeof CLASSES_ELEGIBILIDADE)[number];

/** Estado de fluxo: o analista pediu complementação (não é classificação). */
export const ehFluxo = (status: StatusProjeto) =>
  status === "ProcessandoIa" || status === "AguardandoAnalista" || status === "Reanalise";

export const ehClassificacaoFinal = (status: StatusProjeto): status is ClasseElegibilidade =>
  (CLASSES_ELEGIBILIDADE as readonly string[]).includes(status);

/** Payload completo da deliberação: classe + fundamentação + rastreabilidade. */
export type DeliberacaoPayload = {
  decisao: StatusProjeto;
  justificativa?: string;
  recorteSustentado?: string;
  limitacaoTecnica?: string;
  evidenciaNecessaria?: string;
  eloAusente?: string;
  evidenciasAdicionais?: string;
  evidenciasUtilizadas?: string;
  evidenciasContrarias?: string;
  lacunas?: string;
  regraAplicada?: string;
};

/** Parecer rastreável gerado pelo backend (Markdown pronto para exibir/imprimir). */
export type ParecerResposta = {
  projetoId: string;
  protocolo: string;
  titulo: string;
  classificacao: string;
  markdown: string;
  geradoEm: string;
};

export type ArquivoItemResposta = {
  id: string;
  nome: string;
  tamanhoBytes: number;
  extensao: string;
  criadoEm: string;
};

/** Visão limpa do proponente: status, resultado e histórico de versões. Não exibe nota interna da IA. */
export type ProjetoProponenteResposta = {
  id: string;
  protocolo: string;
  titulo: string;
  setor: string;
  nomeArquivo: string;
  arquivos?: ArquivoItemResposta[];
  versaoEnvio: number;
  status: StatusProjeto;
  justificativaAnalista?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  decididoEm?: string | null;
};

/** Cada um dos 5 critérios Frascati avaliados pela IA (0 a 20 pontos). */
export type CriterioAvaliadoResposta = {
  chave: string;
  nome: string;
  descricao: string;
  nota?: number | null;
  notaMaxima: number;
  justificativa?: string | null;
};

/** Visão completa do analista: notas da IA, resumo, justificativas por critério e anexos PDF/CSV. */
export type ProjetoAnaliseResposta = {
  id: string;
  protocolo: string;
  titulo: string;
  setor: string;
  status: StatusProjeto;
  versaoEnvio: number;
  proponenteId: string;
  proponenteNome: string;
  proponenteEmail: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  arquivos?: ArquivoItemResposta[];
  notaIa?: number | null;
  recomendacaoIa?: string | null;
  resumoIa?: string | null;
  parecerIa?: string | null;
  origemAnaliseIa?: string | null;
  analisadoEm?: string | null;
  criterios: CriterioAvaliadoResposta[];
  justificativaAnalista?: string | null;
  analistaNome?: string | null;
  decididoEm?: string | null;
  recorteSustentado?: string | null;
  limitacaoTecnica?: string | null;
  evidenciaNecessaria?: string | null;
  eloAusente?: string | null;
  evidenciasAdicionais?: string | null;
  evidenciasUtilizadas?: string | null;
  evidenciasContrarias?: string | null;
  lacunas?: string | null;
  regraAplicada?: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export const SETORES_PADRAO = [
  "Engenharia de Operações",
  "Tecnologia da Informação & Software",
  "Pesquisa e Desenvolvimento (P&D)",
  "Logística & Cadeia de Suprimentos",
  "Produção & Manufatura",
  "Qualidade & Processos",
  "Marketing & Comercial",
  "Recursos Humanos",
  "Finanças & Controladoria",
  "Sustentabilidade & ESG",
] as const;

export function rotuloStatus(status: StatusProjeto): string {
  switch (status) {
    case "ProcessandoIa":
      return "Processando Análise de IA";
    case "AguardandoAnalista":
      return "Aguardando Analista";
    case "Elegivel":
      return "Elegível";
    case "Aprovado":
      return "Aprovado";
    case "ComRessalvas":
      return "Com ressalvas";
    case "NaoElegivel":
      return "Não elegível";
    case "Reprovado":
      return "Reprovado";
    case "EvidenciaInsuficiente":
      return "Evidência insuficiente";
    case "Reanalise":
      return "Reanálise Solicitada";
    default:
      return status;
  }
}

export function corBadgeStatus(status: StatusProjeto): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "ProcessandoIa":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "AguardandoAnalista":
      return { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
    case "Elegivel":
    case "Aprovado":
      return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
    case "ComRessalvas":
      return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" };
    case "NaoElegivel":
    case "Reprovado":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    case "EvidenciaInsuficiente":
      return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" };
    case "Reanalise":
      return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  }
}

// -------------------------------------------------------------
// Chamadas de API ao Backend
// -------------------------------------------------------------

/** Envia nova proposta com múltiplos arquivos (PDF e CSV). */
export async function enviarPropostaArquivos(
  titulo: string,
  setor: string,
  arquivos: File[]
): Promise<ProjetoProponenteResposta> {
  const form = new FormData();
  form.append("Titulo", titulo);
  form.append("Setor", setor);
  for (const arquivo of arquivos) {
    form.append("Arquivos", arquivo);
  }

  return await api<ProjetoProponenteResposta>("/api/projetos/upload", {
    method: "POST",
    body: form,
  });
}

/** Compatibilidade: envia com um único PDF. */
export async function enviarPropostaPdf(
  titulo: string,
  setor: string,
  arquivo: File
): Promise<ProjetoProponenteResposta> {
  return await enviarPropostaArquivos(titulo, setor, [arquivo]);
}

/** Reenvia múltiplos arquivos de proposta quando em Reanálise. */
export async function reenviarPropostaArquivos(
  projetoId: string,
  arquivos: File[]
): Promise<ProjetoProponenteResposta> {
  const form = new FormData();
  for (const arquivo of arquivos) {
    form.append("Arquivos", arquivo);
  }

  return await api<ProjetoProponenteResposta>(`/api/projetos/${projetoId}/reenviar`, {
    method: "POST",
    body: form,
  });
}

/** Compatibilidade: reenvia único arquivo. */
export async function reenviarPropostaPdf(
  projetoId: string,
  arquivo: File
): Promise<ProjetoProponenteResposta> {
  return await reenviarPropostaArquivos(projetoId, [arquivo]);
}

/** Lista as propostas submetidas pelo proponente logado. */
export async function obterMinhasPropostas(): Promise<ProjetoProponenteResposta[]> {
  return await api<ProjetoProponenteResposta[]>("/api/projetos/meus");
}

/** Fila técnica do analista. */
export async function obterFilaAnalise(status?: string): Promise<ProjetoAnaliseResposta[]> {
  const query = status && status !== "todas" ? `?status=${encodeURIComponent(status)}` : "";
  return await api<ProjetoAnaliseResposta[]>(`/api/projetos/fila${query}`);
}

/** Consulta de dossiê específico. */
export async function obterProjetoPorId<T = ProjetoAnaliseResposta | ProjetoProponenteResposta>(
  id: string
): Promise<T> {
  return await api<T>(`/api/projetos/${id}`);
}

/** Delibera a classificação do analista (4 classes do desafio ou Reanalise), com rastreabilidade. */
export async function deliberarProjeto(
  projetoId: string,
  payloadOuDecisao: DeliberacaoPayload | StatusProjeto,
  justificativaLegada?: string
): Promise<ProjetoAnaliseResposta> {
  const corpo =
    typeof payloadOuDecisao === "string"
      ? { decisao: payloadOuDecisao, justificativa: justificativaLegada }
      : payloadOuDecisao;

  return await api<ProjetoAnaliseResposta>(`/api/projetos/${projetoId}/deliberar`, {
    method: "POST",
    body: JSON.stringify(corpo),
  });
}

/** Gera o parecer rastreável (Markdown) da classificação registrada. */
export async function gerarParecer(projetoId: string): Promise<ParecerResposta> {
  return await api<ParecerResposta>(`/api/projetos/${projetoId}/parecer`);
}

export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
