"use client";

import { Badge, Dialog, NativeSelect } from "@chakra-ui/react";
import { useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Casca } from "@/components/casca";
import { Aviso, EstadoVazio } from "@/components/estados";

type PropostaProponente = {
  id: string;
  protocolo: string;
  titulo: string;
  area: string;
  dispendio: number;
  incerteza: string;
  status: "triagem" | "em_analise" | "elegivel" | "diligencia";
  dataEnvio: string;
};

const PROPOSTAS_EXEMPLO: PropostaProponente[] = [
  {
    id: "p1",
    protocolo: "PROP-2026-0101",
    titulo: "Algoritmo Heurístico de Otimização Termodinâmica para Cargas Perecíveis",
    area: "Software & IA",
    dispendio: 850000,
    incerteza: "Viabilidade de convergência matemática em tempo real com variações térmicas contínuas.",
    status: "triagem",
    dataEnvio: "06/10/2026",
  },
];

export default function Proponente() {
  const [propostas, setPropostas] = useState<PropostaProponente[]>(PROPOSTAS_EXEMPLO);
  const [modalAberto, setModalAberto] = useState(false);
  const [aviso, setAviso] = useState("");

  // Formulário de Nova Proposta
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState("Software & IA");
  const [dispendio, setDispendio] = useState("");
  const [incerteza, setIncerteza] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [lucroReal, setLucroReal] = useState(true);
  const [cnd, setCnd] = useState(true);

  function submeterProposta(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !dispendio || !incerteza.trim()) {
      return;
    }

    const novoProtocolo = `PROP-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const nova: PropostaProponente = {
      id: String(Date.now()),
      protocolo: novoProtocolo,
      titulo,
      area,
      dispendio: parseFloat(dispendio) || 500000,
      incerteza,
      status: "triagem",
      dataEnvio: new Date().toLocaleDateString("pt-BR"),
    };

    setPropostas([nova, ...propostas]);
    setAviso(`Proposta ${novoProtocolo} enviada com sucesso para a fila de triagem do analista!`);
    setModalAberto(false);

    // Reset formulário
    setTitulo("");
    setDispendio("");
    setIncerteza("");
    setMetodologia("");
  }

  return (
    <Casca
      titulo="Central do Proponente — Lei do Bem"
      descricao="Gerencie suas propostas de inovação tecnológica e acompanhe o parecer da equipe de analistas de P&D."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoPrimario type="button" onClick={() => setModalAberto(true)}>
          + Nova Proposta ao Analista
        </BotaoPrimario>
      }
    >
      {(perfil) => (
        <div className="flex flex-col gap-6">
          {aviso ? <Aviso tipo="success" texto={aviso} /> : null}

          {/* Banner Educativo da Lei do Bem */}
          <section className="neo p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-2">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8E1218] bg-red-100 px-2.5 py-0.5 rounded-full">
                  Guia do Proponente
                </span>
                <h2 className="font-display text-2xl text-[#2C3138]">
                  Como preparar sua proposta para aprovação do analista
                </h2>
                <p className="text-sm leading-relaxed text-[#5E6570]">
                  O analista da equipe técnica avaliará seu projeto com base no <strong>Manual de Frascati</strong> e na{" "}
                  <strong>Lei 11.196/05</strong>. Para garantir elegibilidade, seu projeto deve conter:
                </p>
              </div>

              <div className="shrink-0">
                <BotaoPrimario type="button" onClick={() => setModalAberto(true)}>
                  Enviar Proposta de Projeto
                </BotaoPrimario>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="neo-inset p-4">
                <span className="text-xs font-bold text-[#8E1218]">1. Incerteza Tecnológica</span>
                <p className="text-xs text-[#5E6570] mt-1">
                  O resultado não deve ser óbvio para um técnico no assunto. Deve haver uma barreira científica.
                </p>
              </div>

              <div className="neo-inset p-4">
                <span className="text-xs font-bold text-[#8E1218]">2. Elemento de Novidade</span>
                <p className="text-xs text-[#5E6570] mt-1">
                  Criação de novos produtos, processos ou agregação de novas funcionalidades substantivas.
                </p>
              </div>

              <div className="neo-inset p-4">
                <span className="text-xs font-bold text-[#8E1218]">3. Sistematicidade e Rastro</span>
                <p className="text-xs text-[#5E6570] mt-1">
                  Pesquisa estruturada, com horas de equipe dedicadas, cronograma e relatórios de experimentos.
                </p>
              </div>

              <div className="neo-inset p-4">
                <span className="text-xs font-bold text-[#8E1218]">4. Não-Rotina</span>
                <p className="text-xs text-[#5E6570] mt-1">
                  Customizações convencionais de software, suporte ou manutenções periódicas são inelegíveis.
                </p>
              </div>
            </div>
          </section>

          {/* Seção Minhas Propostas */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl text-[#2C3138]">Minhas Propostas Submetidas</h3>
                <p className="text-xs text-[#5E6570]">Acompanhe o status de avaliação técnica de cada projeto.</p>
              </div>
              <span className="text-xs font-semibold text-[#5E6570]">
                {propostas.length} proposta(s) cadastrada(s)
              </span>
            </div>

            {propostas.length === 0 ? (
              <EstadoVazio
                titulo="Nenhuma proposta enviada ainda"
                texto="Clique no botão '+ Nova Proposta ao Analista' para cadastrar seu primeiro projeto de P&D e receber a análise preliminar de enquadramento na Lei do Bem."
              />
            ) : (
              <div className="grid gap-4">
                {propostas.map((prop) => (
                  <article key={prop.id} className="neo flex flex-col justify-between gap-4 p-5 md:p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#C4161C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {prop.protocolo}
                          </span>
                          <span className="text-xs text-[#5E6570]">Submetido em {prop.dataEnvio}</span>
                          <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                            {prop.area}
                          </span>
                          <Badge
                            colorPalette={
                              prop.status === "elegivel"
                                ? "green"
                                : prop.status === "em_analise"
                                ? "yellow"
                                : "blue"
                            }
                            variant="subtle"
                          >
                            {prop.status === "elegivel"
                              ? "Elegível (Aprovado)"
                              : prop.status === "em_analise"
                              ? "Em Análise Técnica"
                              : "Na Fila do Analista"}
                          </Badge>
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#2C3138]">{prop.titulo}</h4>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#5E6570]">Dispêndio Previsto</p>
                        <p className="font-display text-lg font-bold text-[#2C3138]">
                          {prop.dispendio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-xs font-medium text-emerald-700">
                          Benefício est.: {(prop.dispendio * 0.34).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    </div>

                    <div className="neo-inset p-3.5 text-xs">
                      <span className="font-bold text-[#8E1218] uppercase">Incerteza Declarada:</span>
                      <p className="text-[#4A515C] mt-0.5 leading-relaxed">{prop.incerteza}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5E6570] pt-2 border-t border-[#D9DCE3]">
                      <span>Proponente: <strong>{perfil.nome}</strong> ({perfil.email})</span>
                      <span className="font-medium text-[#8E1218]">Aguardando deliberação da esteira de P&D</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Modal Neumorphic para Submissão de Proposta */}
          <Dialog.Root open={modalAberto} onOpenChange={(d) => !d.open && setModalAberto(false)}>
            <Dialog.Backdrop />
            <Dialog.Positioner p="4">
              <Dialog.Content className="neo" bg="#F3F4F7" w="full" maxW="2xl" maxH="90vh" overflowY="auto">
                <form onSubmit={submeterProposta}>
                  <Dialog.Header>
                    <Dialog.Title className="font-display text-2xl text-[#2C3138]">
                      Submeter Proposta de Inovação ao Analista
                    </Dialog.Title>
                  </Dialog.Header>

                  <Dialog.Body className="space-y-4">
                    <p className="text-xs text-[#5E6570]">
                      Preencha os dados técnicos do seu projeto. O analista receberá esta proposta em seu CRM para
                      avaliação dos critérios da Lei do Bem.
                    </p>

                    <Campo
                      id="titulo"
                      rotulo="Título do Projeto de Inovação"
                      valor={titulo}
                      onChange={setTitulo}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#5E6570]">Área Tecnológica</label>
                        <NativeSelect.Root size="sm" width="full">
                          <NativeSelect.Field value={area} onChange={(e) => setArea(e.target.value)}>
                            <option value="Software & IA">Software & IA</option>
                            <option value="Biotecnologia">Biotecnologia</option>
                            <option value="Engenharia & Automação">Engenharia & Automação</option>
                            <option value="Agrotech">Agrotech</option>
                            <option value="Química">Química</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </div>

                      <Campo
                        id="dispendio"
                        rotulo="Dispêndio Estimado em P&D (R$)"
                        tipo="number"
                        valor={dispendio}
                        onChange={setDispendio}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#5E6570]">
                        Incerteza Científica ou Tecnológica (Critério Central Frascati)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={incerteza}
                        onChange={(e) => setIncerteza(e.target.value)}
                        placeholder="Descreva o obstáculo que o estado da arte e conhecimentos convencionais não conseguiam solucionar..."
                        className="neo-inset w-full p-3 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#5E6570]">
                        Metodologia Experimental e Rastro
                      </label>
                      <textarea
                        rows={2}
                        value={metodologia}
                        onChange={(e) => setMetodologia(e.target.value)}
                        placeholder="Como os testes, hipóteses e dados experimentais foram/serão conduzidos..."
                        className="neo-inset w-full p-3 text-xs leading-relaxed"
                      />
                    </div>

                    <div className="neo-inset p-3.5 space-y-2 text-xs">
                      <span className="font-bold text-[#8E1218]">Pré-requisitos Fiscais:</span>
                      <div className="flex items-center gap-4 text-[#5E6570]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lucroReal}
                            onChange={(e) => setLucroReal(e.target.checked)}
                            className="accent-[#C4161C]"
                          />
                          Empresa opera no Lucro Real
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cnd}
                            onChange={(e) => setCnd(e.target.checked)}
                            className="accent-[#C4161C]"
                          />
                          Certidão Negativa (CND) Ativa
                        </label>
                      </div>
                    </div>
                  </Dialog.Body>

                  <Dialog.Footer className="flex flex-wrap gap-2">
                    <BotaoSecundario type="button" onClick={() => setModalAberto(false)}>
                      Cancelar
                    </BotaoSecundario>
                    <BotaoPrimario type="submit" disabled={!titulo.trim() || !dispendio || !incerteza.trim()}>
                      Enviar para a Fila do Analista
                    </BotaoPrimario>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Root>
        </div>
      )}
    </Casca>
  );
}
