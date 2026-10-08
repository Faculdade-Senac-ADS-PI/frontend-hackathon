"use client";

import { NativeSelect } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { DecisaoAnalista } from "@/components/decisao-analista";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import { obterFilaAnalise, rotuloStatus, type ProjetoAnaliseResposta } from "@/lib/propostas-proponente";

export default function Analista() {
  const [propostas, setPropostas] = useState<ProjetoAnaliseResposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroSetor, setFiltroSetor] = useState("todas");
  const [caso, setCaso] = useState<ProjetoAnaliseResposta | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    void carregarFila();
  }, []);

  async function carregarFila() {
    setCarregando(true);
    try {
      setPropostas(await obterFilaAnalise());
    } catch {
      setPropostas([]);
    } finally {
      setCarregando(false);
    }
  }

  const metricas = useMemo(() => {
    return {
      total: propostas.length,
      aguardando: propostas.filter((item) => item.status === "AguardandoAnalista").length,
      aprovadas: propostas.filter((item) => item.status === "Aprovado").length,
      reanalises: propostas.filter((item) => item.status === "Reanalise").length,
      reprovadas: propostas.filter((item) => item.status === "Reprovado").length,
    };
  }, [propostas]);

  const setores = useMemo(
    () => Array.from(new Set(propostas.map((item) => item.setor).filter(Boolean))).sort(),
    [propostas]
  );

  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return propostas.filter((item) => {
      const texto = `${item.titulo} ${item.protocolo} ${item.setor} ${item.proponenteNome}`.toLowerCase();
      const statusOk = filtroStatus === "todas" || item.status === filtroStatus;
      const setorOk = filtroSetor === "todas" || item.setor === filtroSetor;
      return texto.includes(termo) && statusOk && setorOk;
    });
  }, [propostas, busca, filtroStatus, filtroSetor]);

  function registrar(atualizado: ProjetoAnaliseResposta) {
    setPropostas((lista) => lista.map((item) => (item.id === atualizado.id ? atualizado : item)));
    setCaso(atualizado);
    setAviso(`${atualizado.protocolo} registrado como ${rotuloStatus(atualizado.status)}. A recomendação da leitura permanece.`);
  }

  return (
    <Casca
      titulo="Fila de análise"
      descricao="A leitura recomenda. O analista decide. O registro original permanece."
      larguraMaxima="max-w-6xl"
      ocultarCardAcesso
      acoes={
        <BotaoSecundario type="button" onClick={() => void carregarFila()}>
          Atualizar fila
        </BotaoSecundario>
      }
    >
      {() =>
        caso ? (
          <DecisaoAnalista projeto={caso} onVoltar={() => setCaso(null)} onDeliberado={registrar} />
        ) : (
          <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden">
            {aviso ? <Aviso tipo="success" texto={aviso} /> : null}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Situação da fila">
              <Resumo valor={metricas.aguardando} rotulo="aguardando decisão" />
              <Resumo valor={metricas.aprovadas} rotulo="aprovadas" />
              <Resumo valor={metricas.reanalises} rotulo="em reanálise" />
              <Resumo valor={metricas.reprovadas} rotulo="reprovadas" />
              <Resumo valor={metricas.total} rotulo="propostas" />
            </section>

            <section className="neo flex flex-col gap-4 p-5">
              <label className="sr-only" htmlFor="busca-analista">
                Buscar proposta
              </label>
              <input
                id="busca-analista"
                type="search"
                placeholder="Título, protocolo, setor ou proponente"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                className="neo-inset px-4 py-2.5 text-sm"
              />
              <div className="flex flex-wrap gap-3">
                <div className="min-w-52 flex-1">
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field aria-label="Filtro por status" value={filtroStatus} onChange={(evento) => setFiltroStatus(evento.target.value)}>
                      <option value="todas">Todos os status</option>
                      <option value="AguardandoAnalista">Aguardando analista</option>
                      <option value="Aprovado">Aprovadas</option>
                      <option value="Reanalise">Reanálise</option>
                      <option value="Reprovado">Reprovadas</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </div>
                {setores.length > 0 ? (
                  <div className="min-w-52 flex-1">
                    <NativeSelect.Root size="sm" width="full">
                      <NativeSelect.Field aria-label="Filtro por setor" value={filtroSetor} onChange={(evento) => setFiltroSetor(evento.target.value)}>
                        <option value="todas">Todos os setores</option>
                        {setores.map((setor) => (
                          <option key={setor} value={setor}>
                            {setor}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </div>
                ) : null}
              </div>
            </section>

            {carregando ? (
              <EstadoCarregando texto="Carregando a fila…" />
            ) : filtradas.length === 0 ? (
              <EstadoVazio titulo="Nenhuma proposta nesta seleção" texto="Ajuste a busca ou o status para ver outros envios." />
            ) : (
              <div className="grid gap-3">
                {filtradas.map((item) => (
                  <article key={item.id} className="neo flex min-w-0 flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8E1218]">{item.protocolo}</p>
                      <h2 className="mt-1 font-display text-xl text-[#2C3138]">{item.titulo}</h2>
                      <p className="mt-1 text-sm text-[#5E6570]">
                        {item.proponenteNome} · {item.setor}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <p className="text-sm text-[#2C3138]">
                        <span className="text-[#5E6570]">Leitura </span>
                        {item.recomendacaoIa || "sem recomendação"}
                      </p>
                      <p className="text-sm text-[#2C3138]">
                        <span className="text-[#5E6570]">Decisão </span>
                        {item.status === "AguardandoAnalista" || item.status === "ProcessandoIa" ? "Pendente" : rotuloStatus(item.status)}
                      </p>
                      <button type="button" className="btn-red" onClick={() => setCaso(item)}>
                        Abrir leitura
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )
      }
    </Casca>
  );
}

function Resumo({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="neo min-w-0 p-4">
      <strong className="block font-display text-3xl text-[#2C3138]">{valor}</strong>
      <span className="text-sm text-[#5E6570]">{rotulo}</span>
    </div>
  );
}
