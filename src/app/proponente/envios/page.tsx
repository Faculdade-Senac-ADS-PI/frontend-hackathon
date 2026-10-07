"use client";

import { NativeSelect } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Casca } from "@/components/casca";
import { NavegacaoProponente } from "@/components/navegacao-proponente";
import { obterPropostas, salvarNovaProposta, type PropostaProponente } from "@/lib/propostas-proponente";

export default function EnviosPage() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<PropostaProponente[]>(() => obterPropostas());
  const [avisoSucesso, setAvisoSucesso] = useState("");
  const [protocoloCriado, setProtocoloCriado] = useState("");

  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("Software & IA");
  const [anoBase, setAnoBase] = useState("2026");
  const [incertezaTecnica, setIncertezaTecnica] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [equipe, setEquipe] = useState("450000");
  const [materiais, setMateriais] = useState("80000");
  const [terceiros, setTerceiros] = useState("70000");
  const [lucroReal, setLucroReal] = useState(true);
  const [cnd, setCnd] = useState(true);
  const [arquivos, setArquivos] = useState<string[]>([
    "especificacao_tecnica_v1.pdf",
    "cnd_federal_2026.pdf",
  ]);

  const totais = useMemo(() => {
    const eq = parseFloat(equipe) || 0;
    const mat = parseFloat(materiais) || 0;
    const terc = parseFloat(terceiros) || 0;
    const total = eq + mat + terc;
    const beneficio = total * 0.34;
    return { total, beneficio };
  }, [equipe, materiais, terceiros]);

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !incertezaTecnica.trim() || totais.total <= 0) {
      return;
    }

    const criada = salvarNovaProposta({
      titulo,
      area,
      anoBase,
      dispendioTotal: totais.total,
      dispendioEquipe: parseFloat(equipe) || 0,
      dispendioMateriais: parseFloat(materiais) || 0,
      dispendioTerceiros: parseFloat(terceiros) || 0,
      beneficioEstimado: totais.beneficio,
      incertezaTecnica,
      metodologia: metodologia.trim() || "Delineamento experimental e prototipagem em bancada de ensaios.",
    });

    setPropostas(obterPropostas());
    setProtocoloCriado(criada.protocolo);
    setAvisoSucesso(
      `Proposta "${criada.titulo}" submetida com sucesso! Protocolo ${criada.protocolo} enviado para a fila do analista.`
    );

    // Limpa formulário
    setTitulo("");
    setIncertezaTecnica("");
    setMetodologia("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Casca
      titulo="Envios de Projetos de Inovação"
      descricao="Submeta novas propostas técnicas para avaliação da equipe de P&D e enquadramento preliminar na Lei do Bem."
      larguraMaxima="max-w-7xl"
    >
      {() => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {avisoSucesso ? (
            <div className="neo flex flex-col gap-3 p-5 border-l-4 border-emerald-600 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <p className="font-bold text-emerald-900">{avisoSucesso}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <BotaoPrimario asChild>
                  <Link href={`/proponente/acompanhamento?caso=${protocoloCriado}`}>
                    Acompanhar este Projeto na Esteira →
                  </Link>
                </BotaoPrimario>
                <BotaoSecundario type="button" onClick={() => setAvisoSucesso("")}>
                  Submeter Outro Projeto
                </BotaoSecundario>
              </div>
            </div>
          ) : null}

          {/* Formulário Estruturado Neumorphic */}
          <section className="neo p-6 sm:p-8">
            <div className="max-w-3xl space-y-2 mb-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8E1218] bg-red-100 px-2.5 py-0.5 rounded-full">
                Formulário de Submissão Técnica
              </span>
              <h2 className="font-display text-2xl text-[#2C3138]">
                Cadastrar Nova Proposta para Análise de P&D
              </h2>
              <p className="text-sm text-[#5E6570]">
                Preencha as informações do projeto conforme as diretrizes do Manual de Frascati. Todos os campos são
                auditáveis e compõem o futuro dossiê de comprovação fiscal.
              </p>
            </div>

            <form onSubmit={submeter} className="flex flex-col gap-6">
              {/* Etapa 1: Dados do Projeto */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E1218] border-b border-[#D9DCE3] pb-2">
                  1. Identificação do Projeto de Inovação
                </h3>

                <Campo
                  id="titulo-projeto"
                  rotulo="Título Descritivo do Projeto"
                  valor={titulo}
                  onChange={setTitulo}
                  placeholder="Ex: Desenvolvimento de Algoritmo Preditivo de Visão Computacional para Classificação de Grãos"
                  obrigatorio
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5E6570]">Área Tecnológica Principal</label>
                    <NativeSelect.Root size="sm" width="full">
                      <NativeSelect.Field value={area} onChange={(e) => setArea(e.target.value)}>
                        <option value="Software & IA">Software & IA</option>
                        <option value="Biotecnologia">Biotecnologia</option>
                        <option value="Engenharia & Automação">Engenharia & Automação</option>
                        <option value="Agrotech">Agrotech</option>
                        <option value="Química & Materiais">Química & Materiais</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5E6570]">Ano-Base do Exercício Fiscal</label>
                    <NativeSelect.Root size="sm" width="full">
                      <NativeSelect.Field value={anoBase} onChange={(e) => setAnoBase(e.target.value)}>
                        <option value="2026">2026 (Exercício Corrente)</option>
                        <option value="2025">2025 (Exercício Anterior)</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </div>
                </div>
              </div>

              {/* Etapa 2: Incerteza Tecnológica (Frascati) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E1218] border-b border-[#D9DCE3] pb-2">
                  2. Demonstração de Incerteza Tecnológica e Não-Rotina (Manual de Frascati)
                </h3>

                <div className="neo-inset p-3.5 text-xs text-[#5E6570] space-y-1">
                  <strong className="text-[#8E1218]">Importante para Aprovação:</strong>
                  <p>
                    A Lei do Bem veda projetos de engenharia ou desenvolvimento de rotina (ex: migrações convencionais,
                    layouts ou integrações padrão de APIs). Explique claramente qual barreira técnica o time precisou
                    investigar e testar.
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="incerteza" className="text-xs font-semibold text-[#5E6570]">
                    Incerteza Científica ou Tecnológica Enfrentada <span className="text-[#C4161C]">*</span>
                  </label>
                  <textarea
                    id="incerteza"
                    rows={4}
                    required
                    value={incertezaTecnica}
                    onChange={(e) => setIncertezaTecnica(e.target.value)}
                    placeholder="Descreva o obstáculo técnico: por que as soluções e conhecimentos disponíveis no mercado/literatura não eram suficientes? O que tornou o resultado incerto?"
                    className="neo-inset w-full p-3.5 text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="metodologia" className="text-xs font-semibold text-[#5E6570]">
                    Metodologia Experimental, Hipóteses e Testes
                  </label>
                  <textarea
                    id="metodologia"
                    rows={3}
                    value={metodologia}
                    onChange={(e) => setMetodologia(e.target.value)}
                    placeholder="Como os experimentos foram planejados? Houve protótipos, ensaios de laboratório, provas de conceito (PoCs) e coleta sistemática de dados?"
                    className="neo-inset w-full p-3.5 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Etapa 3: Dispêndios em P&D com cálculo em tempo real */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E1218] border-b border-[#D9DCE3] pb-2">
                  3. Dispêndios Estimados em P&D e Cálculo de Benefício
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Campo
                    id="equipe"
                    rotulo="Equipe Própria P&D (R$)"
                    tipo="number"
                    valor={equipe}
                    onChange={setEquipe}
                    placeholder="Ex: 450000"
                  />
                  <Campo
                    id="materiais"
                    rotulo="Materiais e Consumo (R$)"
                    tipo="number"
                    valor={materiais}
                    onChange={setMateriais}
                    placeholder="Ex: 80000"
                  />
                  <Campo
                    id="terceiros"
                    rotulo="Serviços Técnicos Terceiros (R$)"
                    tipo="number"
                    valor={terceiros}
                    onChange={setTerceiros}
                    placeholder="Ex: 70000"
                  />
                </div>

                {/* Card Neumorphic com Totais Calculados */}
                <div className="neo-inset flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                  <div>
                    <span className="text-xs text-[#5E6570] uppercase font-bold">Investimento Total Orçado em P&D</span>
                    <p className="font-display text-2xl font-bold text-[#2C3138] mt-0.5">
                      {formatarMoeda(totais.total)}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-emerald-800 uppercase font-bold">Economia Estimada no IRPJ/CSLL</span>
                    <p className="font-display text-2xl font-bold text-emerald-700 mt-0.5">
                      {formatarMoeda(totais.beneficio)}
                    </p>
                    <span className="text-[11px] text-[#5E6570]">(34% sobre o dispêndio no Lucro Real)</span>
                  </div>
                </div>
              </div>

              {/* Etapa 4: Anexos e Documentação */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E1218] border-b border-[#D9DCE3] pb-2">
                  4. Anexos e Documentos Comprobatórios
                </h3>

                <div className="neo-inset flex flex-col items-center justify-center p-6 border border-dashed border-[#B8BAC2] text-center gap-2">
                  <span className="text-3xl">📁</span>
                  <p className="text-xs font-semibold text-[#2C3138]">
                    Documentação técnica, cronograma físico-financeiro ou relatórios de testes
                  </p>
                  <p className="text-[11px] text-[#5E6570]">
                    Formatos aceitos: PDF, DOCX, XLSX ou ZIP (máx. 25MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => setArquivos([...arquivos, `anexo_tecnico_${Date.now().toString().slice(-4)}.pdf`])}
                    className="btn-neo text-xs px-3 py-1.5 mt-2"
                  >
                    + Simular Anexar Arquivo
                  </button>
                </div>

                {arquivos.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#5E6570]">Arquivos anexados:</span>
                    <div className="flex flex-wrap gap-2">
                      {arquivos.map((arq, idx) => (
                        <span
                          key={idx}
                          className="neo-inset inline-flex items-center gap-2 px-3 py-1 text-xs text-[#2C3138]"
                        >
                          📄 {arq}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Etapa 5: Requisitos e Envio */}
              <div className="neo-inset p-4 space-y-3">
                <span className="text-xs font-bold text-[#8E1218] uppercase">Declaração de Conformidade:</span>
                <div className="flex flex-col sm:flex-row gap-4 text-xs text-[#5E6570]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lucroReal}
                      onChange={(e) => setLucroReal(e.target.checked)}
                      className="accent-[#C4161C]"
                      required
                    />
                    Declaro que a empresa opera em regime de Lucro Real
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cnd}
                      onChange={(e) => setCnd(e.target.checked)}
                      className="accent-[#C4161C]"
                      required
                    />
                    Declaro possuir Certidão Negativa de Débitos (CND) ativa
                  </label>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#D9DCE3]">
                <BotaoSecundario type="button" onClick={() => router.push("/proponente")}>
                  Cancelar
                </BotaoSecundario>
                <BotaoPrimario type="submit" disabled={!titulo.trim() || !incertezaTecnica.trim() || totais.total <= 0}>
                  Submeter Proposta para a Fila do Analista →
                </BotaoPrimario>
              </div>
            </form>
          </section>

          {/* Lista de Envios Realizados */}
          <section className="flex flex-col gap-4">
            <h3 className="font-display text-xl text-[#2C3138]">Histórico de Envios Anteriores</h3>

            <div className="grid gap-4">
              {propostas.map((prop) => (
                <article key={prop.id} className="neo flex flex-col justify-between gap-3 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {prop.protocolo}
                        </span>
                        <span className="text-xs text-[#5E6570]">Submetido em {prop.dataEnvio}</span>
                        <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                          {prop.area}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-[#2C3138] mt-1">{prop.titulo}</h4>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-xs text-[#5E6570]">Dispêndio Total</p>
                      <p className="font-display text-base font-bold text-[#2C3138]">
                        {formatarMoeda(prop.dispendioTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D9DCE3] text-xs">
                    <span className="text-emerald-700 font-medium">
                      Benefício: {formatarMoeda(prop.beneficioEstimado)}
                    </span>
                    <Link
                      href={`/proponente/acompanhamento?caso=${prop.id}`}
                      className="font-semibold text-[#8E1218] hover:underline"
                    >
                      Ver na Esteira de Acompanhamento →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </Casca>
  );
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
