"use client";

import { useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Aviso } from "@/components/estados";
import {
  deliberarProjeto,
  formatarBytes,
  rotuloStatus,
  type ProjetoAnaliseResposta,
  type CriterioAvaliadoResposta,
} from "@/lib/propostas-proponente";

const ORDEM = ["Novidade", "Criatividade", "Incerteza", "Sistematico", "Transferibilidade"];

export function DecisaoAnalista({
  projeto,
  onVoltar,
  onDeliberado,
}: {
  projeto: ProjetoAnaliseResposta;
  onVoltar: () => void;
  onDeliberado: (atualizado: ProjetoAnaliseResposta) => void;
}) {
  const criterios = useMemo(() => ordenar(projeto.criterios ?? []), [projeto.criterios]);
  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [decisao, setDecisao] = useState<"Aprovado" | "Reprovado" | "Reanalise">("Aprovado");
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setIndice(foco(criterios));
    setAberta(false);
    setDecisao("Aprovado");
    setJustificativa("");
    setErro("");
  }, [projeto.id, criterios]);

  const selecionado = criterios[indice];
  const pendente = projeto.status === "AguardandoAnalista" || projeto.status === "ProcessandoIa";
  const podeDeliberar = projeto.status === "AguardandoAnalista";
  const justificativaObrigatoria = decisao !== "Aprovado";

  async function registrar() {
    setErro("");
    if (justificativaObrigatoria && justificativa.trim().length === 0) {
      setErro(
        decisao === "Reanalise"
          ? "Descreva o que o proponente precisa complementar no documento."
          : "Explique por que o projeto não é elegível à Lei do Bem."
      );
      return;
    }
    setSalvando(true);
    try {
      const atualizado = await deliberarProjeto(projeto.id, decisao, justificativa.trim() || undefined);
      onDeliberado(atualizado);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível registrar a decisão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden">
      <button type="button" className="btn-quiet w-fit px-0" onClick={onVoltar}>
        Voltar à fila
      </button>

      <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E1218]">{projeto.protocolo}</p>
        <h2 className="mt-1 font-display text-3xl text-balance text-[#2C3138]">{projeto.titulo}</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm text-[#5E6570]">
          <li className="neo-inset w-auto px-3 py-1">{projeto.setor}</li>
          <li className="neo-inset w-auto px-3 py-1">{projeto.proponenteNome}</li>
          <li className="neo-inset w-auto px-3 py-1">Versão {projeto.versaoEnvio}</li>
        </ul>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="neo min-w-0 border-l-4 border-[#8E1218] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E1218]">Recomendação da leitura</p>
          <h3 className="mt-2 font-display text-3xl text-[#2C3138]">{projeto.recomendacaoIa || "Sem recomendação"}</h3>
          {projeto.parecerIa ? <p className="mt-3 text-sm leading-relaxed text-[#4A515C]">{projeto.parecerIa}</p> : null}
        </section>
        <section className="neo min-w-0 border-l-4 border-[#5E6570] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6570]">
            {pendente ? "Decisão do analista" : "Decisão final"}
          </p>
          <h3 className="mt-2 font-display text-3xl text-[#2C3138]">{pendente ? "Pendente" : rotuloStatus(projeto.status)}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#4A515C]">
            A recomendação da leitura permanece ao lado e não é substituída.
          </p>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Resumo da leitura">
        <Resumo valor={String(criterios.length)} rotulo="critérios avaliados" />
        <Resumo valor={notaLeitura(projeto.notaIa)} rotulo="nota da leitura" />
        <Resumo valor={String(projeto.versaoEnvio)} rotulo="versão do envio" />
        <Resumo valor="1" rotulo="documento" />
        <Resumo valor={pendente ? "Pendente" : "Registrada"} rotulo="decisão humana" />
      </section>

      {projeto.resumoIa ? (
        <section className="neo min-w-0 p-5">
          <h3 className="font-display text-xl">Resumo</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#4A515C]">{projeto.resumoIa}</p>
        </section>
      ) : null}

      <section>
        <h3 className="font-display text-2xl">Critérios</h3>
        <div className="mt-3 grid gap-3">
          {criterios.map((criterio, item) => (
            <button
              key={criterio.chave}
              type="button"
              onClick={() => {
                setIndice(item);
                setAberta(false);
              }}
              className={`min-w-0 p-4 text-left ${item === indice ? "neo-inset" : "neo"}`}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <strong className="text-[#2C3138]">{titulo(criterio)}</strong>
                <span className="text-sm text-[#5E6570]">{notaCriterio(criterio)}</span>
              </span>
              <span className="mt-3 grid gap-3 sm:grid-cols-2">
                <Metrica rotulo="Nota" valor={notaCriterio(criterio)} />
                <Metrica rotulo="Leitura" valor={primeiraFrase(criterio.justificativa) || "Sem texto neste critério"} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {selecionado ? (
        <section className="neo min-w-0 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E1218]">{titulo(selecionado)}</p>
          <h3 className="mt-1 font-display text-2xl">{notaCriterio(selecionado)}</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#4A515C]">
            {primeiraFrase(selecionado.justificativa) || "A leitura não trouxe texto para este critério."}
          </p>
          <button type="button" className="btn-neo mt-4" onClick={() => setAberta((valor) => !valor)}>
            {aberta ? "Ocultar análise" : "Ver análise"}
          </button>
          {aberta ? (
            <div className="mt-4 space-y-3 border-t border-[#D9DCE3] pt-4 text-sm leading-relaxed text-[#4A515C]">
              <p>{selecionado.descricao}</p>
              {selecionado.justificativa ? <p className="whitespace-pre-wrap">{selecionado.justificativa}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="neo min-w-0 p-5">
        <h3 className="font-display text-xl">Documentos</h3>
        <p className="mt-2 text-sm text-[#5E6570]">Versão {projeto.versaoEnvio} · {formatarBytes(projeto.tamanhoBytes)} no total</p>
        <div className="mt-4 flex flex-col gap-2">
          {projeto.arquivos && projeto.arquivos.length > 0 ? (
            projeto.arquivos.map((arquivo) => (
              <a
                key={arquivo.id}
                className="btn-neo justify-start"
                href={`/api/projetos/${projeto.id}/arquivos/${arquivo.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {arquivo.nome} · {arquivo.extensao} · {formatarBytes(arquivo.tamanhoBytes)}
              </a>
            ))
          ) : (
            <a className="btn-neo justify-start" href={`/api/projetos/${projeto.id}/arquivo`} target="_blank" rel="noopener noreferrer">
              {projeto.nomeArquivo} · {formatarBytes(projeto.tamanhoBytes)}
            </a>
          )}
        </div>
      </section>

      <section className="neo min-w-0 p-5">
        <h3 className="font-display text-xl">Registro</h3>
        <p className="mt-2 text-sm text-[#5E6570]">
          Esta leitura não informa contradições, lacunas nem a cronologia do ensaio. As datas abaixo são as do envio e da decisão.
        </p>
        <ol className="mt-4 grid gap-3">
          <Registro quando={projeto.criadoEm} fato="Envio do documento" />
          {projeto.analisadoEm ? <Registro quando={projeto.analisadoEm} fato="Leitura registrada" /> : null}
          {projeto.decididoEm ? <Registro quando={projeto.decididoEm} fato="Decisão humana" /> : null}
        </ol>
      </section>

      <section className="neo min-w-0 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8E1218]">Decisão humana</p>
        {podeDeliberar ? (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-[#4A515C]">
              A recomendação da leitura permanece {projeto.recomendacaoIa || "sem texto"}. Aprovar, reprovar ou pedir reanálise não apaga esse registro.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Escolha atual={decisao} valor="Aprovado" onEscolher={setDecisao}>Aprovar</Escolha>
              <Escolha atual={decisao} valor="Reanalise" onEscolher={setDecisao}>Pedir reanálise</Escolha>
              <Escolha atual={decisao} valor="Reprovado" onEscolher={setDecisao}>Reprovar</Escolha>
            </div>
            <label className="block text-sm font-semibold text-[#2C3138]" htmlFor="justificativa-decisao">
              Justificativa{justificativaObrigatoria ? " obrigatória" : ""}
            </label>
            <textarea
              id="justificativa-decisao"
              rows={5}
              value={justificativa}
              onChange={(evento) => setJustificativa(evento.target.value)}
              placeholder={
                decisao === "Reanalise"
                  ? "O que o proponente precisa complementar no documento."
                  : decisao === "Reprovado"
                    ? "Por que o projeto não se enquadra."
                    : "Observação, se houver."
              }
              className="neo-inset p-3 text-sm leading-relaxed"
            />
            {erro ? <Aviso tipo="error" texto={erro} /> : null}
            <BotaoPrimario
              type="button"
              onClick={() => void registrar()}
              disabled={salvando || (justificativaObrigatoria && justificativa.trim().length === 0)}
            >
              {salvando ? "Registrando…" : "Registrar decisão"}
            </BotaoPrimario>
          </div>
        ) : projeto.status === "ProcessandoIa" ? (
          <p className="mt-3 text-sm text-[#4A515C]">A leitura ainda está em processamento. A decisão humana abre quando ela terminar.</p>
        ) : (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Recomendação original" valor={projeto.recomendacaoIa || "Sem recomendação"} />
            <Campo rotulo="Decisão final" valor={rotuloStatus(projeto.status)} />
            <Campo rotulo="Analista" valor={projeto.analistaNome || "Não informado"} />
            <Campo rotulo="Data e hora" valor={projeto.decididoEm ? formatarData(projeto.decididoEm) : "Não informada"} />
            <div className="sm:col-span-2">
              <Campo rotulo="Justificativa" valor={projeto.justificativaAnalista || "Sem justificativa registrada"} />
            </div>
          </dl>
        )}
      </section>

      <section className="neo min-w-0 p-5">
        <h3 className="font-display text-xl">Auditoria</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Quem decidiu?" valor={projeto.analistaNome || "Ainda ninguém"} />
          <Campo rotulo="Quando?" valor={projeto.decididoEm ? formatarData(projeto.decididoEm) : "Decisão pendente"} />
          <Campo rotulo="Recomendação da leitura" valor={projeto.recomendacaoIa || "Sem recomendação"} />
          <Campo rotulo="Decisão humana" valor={pendente ? "Pendente" : rotuloStatus(projeto.status)} />
          <Campo rotulo="Decisão registrada?" valor={projeto.decididoEm ? "Sim" : "Ainda não"} />
          <Campo rotulo="Justificativa" valor={projeto.justificativaAnalista || "Aguardando o analista"} />
        </dl>
        <p className="mt-4 text-sm text-[#5E6570]">
          Documentos que sustentaram a leitura:{" "}
          {projeto.arquivos && projeto.arquivos.length > 0
            ? projeto.arquivos.map((arquivo) => arquivo.nome).join(", ")
            : projeto.nomeArquivo}
          .
        </p>
        {projeto.origemAnaliseIa ? <p className="mt-1 text-sm text-[#5E6570]">Origem da leitura: {projeto.origemAnaliseIa}.</p> : null}
      </section>

      <BotaoSecundario type="button" onClick={onVoltar}>
        Voltar à fila
      </BotaoSecundario>
    </div>
  );
}

function Resumo({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="neo min-w-0 p-4">
      <strong className="block font-display text-2xl text-[#2C3138]">{valor}</strong>
      <span className="text-sm text-[#5E6570]">{rotulo}</span>
    </div>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-xs text-[#5E6570]">{rotulo}</span>
      <strong className="block text-sm font-semibold text-[#2C3138]">{valor}</strong>
    </span>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-[#5E6570]">{rotulo}</dt>
      <dd className="mt-1 font-semibold break-words text-[#2C3138]">{valor}</dd>
    </div>
  );
}

function Registro({ quando, fato }: { quando: string; fato: string }) {
  return (
    <li className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-t border-[#D9DCE3] py-2">
      <time className="font-semibold text-[#2C3138]">{formatarData(quando)}</time>
      <span>{fato}</span>
    </li>
  );
}

function Escolha({
  atual,
  valor,
  onEscolher,
  children,
}: {
  atual: string;
  valor: "Aprovado" | "Reprovado" | "Reanalise";
  onEscolher: (valor: "Aprovado" | "Reprovado" | "Reanalise") => void;
  children: string;
}) {
  const ativo = atual === valor;
  return (
    <button type="button" onClick={() => onEscolher(valor)} className={ativo ? "btn-red" : "btn-neo"}>
      {children}
    </button>
  );
}

function ordenar(criterios: CriterioAvaliadoResposta[]) {
  return [...criterios].sort((a, b) => ordemDe(a.chave) - ordemDe(b.chave));
}

function ordemDe(chave: string) {
  const indice = ORDEM.indexOf(chave);
  return indice === -1 ? ORDEM.length : indice;
}

function foco(criterios: CriterioAvaliadoResposta[]) {
  let escolhido = 0;
  let menor = Number.POSITIVE_INFINITY;
  criterios.forEach((criterio, indice) => {
    if (criterio.nota === null || criterio.nota === undefined) return;
    if (criterio.nota < menor) {
      menor = criterio.nota;
      escolhido = indice;
    }
  });
  return escolhido;
}

function titulo(criterio: CriterioAvaliadoResposta) {
  if (criterio.chave === "Transferibilidade") return "Transferibilidade/Reprodutibilidade";
  if (criterio.chave === "Sistematico") return "Sistematicidade";
  if (criterio.chave === "Incerteza") return "Incerteza tecnológica";
  return criterio.nome;
}

function notaCriterio(criterio: CriterioAvaliadoResposta) {
  if (criterio.nota === null || criterio.nota === undefined) return "Sem nota";
  return `${criterio.nota}/${criterio.notaMaxima}`;
}

function notaLeitura(nota: number | null | undefined) {
  if (nota === null || nota === undefined) return "—";
  return `${nota}/100`;
}

function primeiraFrase(texto: string | null | undefined) {
  if (!texto) return "";
  const bloco = texto.split("\n\n")[0]?.trim() ?? "";
  const corte = bloco.search(/[.!?](\s|$)/);
  if (corte === -1) return bloco.length > 180 ? `${bloco.slice(0, 180).trim()}…` : bloco;
  return bloco.slice(0, corte + 1);
}

function formatarData(valor: string) {
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
