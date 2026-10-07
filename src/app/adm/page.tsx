"use client";

import { Badge, Dialog, NativeSelect, Table } from "@chakra-ui/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BotaoPrimario, BotaoQuieto, BotaoSecundario } from "@/components/botoes";
import { Casca } from "@/components/casca";
import { Aviso, EstadoCarregando, EstadoVazio } from "@/components/estados";
import { api, ErroApi } from "@/lib/api";
import { rotuloPapel } from "@/lib/papeis";
import type { Usuario } from "@/lib/tipos";

const AVISO = "hackthon_aviso";

export default function Adm() {
  return (
    <Casca
      titulo="CRM do Administrador — Gestão de Acessos"
      descricao="Controle operacional e governança da equipe técnica de analistas, administradores e proponentes da Lei do Bem."
      larguraMaxima="max-w-7xl"
      acoes={
        <BotaoPrimario asChild>
          <Link href="/adm/novo">+ Nova Pessoa</Link>
        </BotaoPrimario>
      }
    >
      {(perfil) => <Painel perfilId={perfil.id} />}
    </Casca>
  );
}

function Painel({ perfilId }: { perfilId: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Usuario | null>(null);

  // Filtros CRM
  const [busca, setBusca] = useState("");
  const [filtroPapel, setFiltroPapel] = useState("todos");
  const [filtroSituacao, setFiltroSituacao] = useState("todas");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await api<Usuario[]>("/api/usuarios");
      setUsuarios(lista);
      setRascunhos(Object.fromEntries(lista.map((usuario) => [usuario.id, usuario.papel])));
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível listar as pessoas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const recado = sessionStorage.getItem(AVISO);
    if (recado) {
      setAviso(recado);
      sessionStorage.removeItem(AVISO);
    }
    void carregar();
  }, [carregar]);

  const metricas = useMemo(() => {
    const total = usuarios.length;
    const proponentes = usuarios.filter((u) => u.papel === "Proponente" && u.ativo).length;
    const analistas = usuarios.filter((u) => u.papel === "Analista" && u.ativo).length;
    const adms = usuarios.filter((u) => u.papel === "Adm" && u.ativo).length;
    const desativados = usuarios.filter((u) => !u.ativo).length;
    return { total, proponentes, analistas, adms, desativados };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const termo = busca.toLowerCase();
      const matchBusca = u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo);
      const matchPapel = filtroPapel === "todos" ? true : u.papel === filtroPapel;
      const matchSituacao =
        filtroSituacao === "todas" ? true : filtroSituacao === "ativas" ? u.ativo : !u.ativo;
      return matchBusca && matchPapel && matchSituacao;
    });
  }, [usuarios, busca, filtroPapel, filtroSituacao]);

  async function salvarPapel(usuario: Usuario) {
    const papel = rascunhos[usuario.id];
    setOcupado(usuario.id);
    setErro("");
    setAviso("");
    try {
      const atualizado = await api<Usuario>(`/api/usuarios/${usuario.id}/papel`, {
        method: "PATCH",
        body: JSON.stringify({ papel }),
      });
      setUsuarios((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setAviso(`Papel de ${atualizado.nome} atualizado para ${rotuloPapel(atualizado.papel)} com registro de auditoria gravado.`);
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível alterar o papel.");
      setRascunhos((atual) => ({ ...atual, [usuario.id]: usuario.papel }));
    } finally {
      setOcupado(null);
    }
  }

  async function desativar() {
    if (!confirmacao) return;
    setOcupado(confirmacao.id);
    setErro("");
    try {
      const atualizado = await api<Usuario>(`/api/usuarios/${confirmacao.id}/desativar`, { method: "POST" });
      setUsuarios((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setAviso(`${atualizado.nome} foi desativado. Histórico de auditoria preservado.`);
      setConfirmacao(null);
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível desativar a conta.");
    } finally {
      setOcupado(null);
    }
  }

  async function reativar(usuario: Usuario) {
    setOcupado(usuario.id);
    setErro("");
    try {
      const atualizado = await api<Usuario>(`/api/usuarios/${usuario.id}/reativar`, { method: "POST" });
      setUsuarios((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)));
      setAviso(`${atualizado.nome} foi reativado e pode acessar o sistema novamente.`);
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível reativar a conta.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Alertas */}
      {aviso ? <Aviso tipo="success" texto={aviso} /> : null}
      {erro ? <Aviso tipo="error" texto={erro} /> : null}

      {/* KPI Operacional Cards CRM */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="KPIs Operacionais do ADM">
        <div className="neo flex flex-col justify-between p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Total de Contas</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.total}</span>
            <span className="text-xs font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">Base Geral</span>
          </div>
          <p className="mt-2 text-xs text-[#5E6570]">Usuários na plataforma</p>
        </div>

        <div className="neo flex flex-col justify-between p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Proponentes Ativos</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-blue-700">{metricas.proponentes}</span>
            <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">Empresas</span>
          </div>
          <p className="mt-2 text-xs text-[#5E6570]">Demandantes Lei do Bem</p>
        </div>

        <div className="neo flex flex-col justify-between p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Analistas Técnicos</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#8E1218]">{metricas.analistas}</span>
            <span className="text-xs font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded-full">Equipe P&D</span>
          </div>
          <p className="mt-2 text-xs text-[#5E6570]">Capacidade de esteira</p>
        </div>

        <div className="neo flex flex-col justify-between p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Administradores</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#2C3138]">{metricas.adms}</span>
            <span className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">Governança</span>
          </div>
          <p className="mt-2 text-xs text-[#5E6570]">Gestão do sistema</p>
        </div>

        <div className="neo flex flex-col justify-between p-4 sm:p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5E6570]">Desativados</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-gray-600">{metricas.desativados}</span>
            <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">Bloqueados</span>
          </div>
          <p className="mt-2 text-xs text-[#5E6570]">Sem permissão de login</p>
        </div>
      </div>

      {/* CRM Toolbar: Busca, Filtros e Ações */}
      <div className="neo flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <label htmlFor="busca-usuario" className="sr-only">Buscar usuário</label>
            <input
              id="busca-usuario"
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="neo-inset w-full px-4 py-2.5 text-sm placeholder:text-[#8E95A2]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <NativeSelect.Root size="sm" width="full">
                <NativeSelect.Field
                  aria-label="Filtro por papel"
                  value={filtroPapel}
                  onChange={(e) => setFiltroPapel(e.target.value)}
                >
                  <option value="todos">Todos os Papéis</option>
                  <option value="Proponente">Proponentes</option>
                  <option value="Analista">Analistas</option>
                  <option value="Adm">Administradores</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </div>

            <div className="w-36">
              <NativeSelect.Root size="sm" width="full">
                <NativeSelect.Field
                  aria-label="Filtro por situação"
                  value={filtroSituacao}
                  onChange={(e) => setFiltroSituacao(e.target.value)}
                >
                  <option value="todas">Todas Situações</option>
                  <option value="ativas">Ativas</option>
                  <option value="desativadas">Desativadas</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </div>

            <BotaoSecundario type="button" onClick={() => void carregar()} disabled={carregando}>
              Atualizar
            </BotaoSecundario>
          </div>
        </div>
      </div>

      {/* Tabela CRM e Lista */}
      {carregando ? <EstadoCarregando texto="Carregando pessoas no CRM..." /> : null}

      {!carregando && usuariosFiltrados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma pessoa encontrada"
          texto="Tente ajustar a busca ou os filtros para encontrar as contas correspondentes."
        />
      ) : null}

      {!carregando && usuariosFiltrados.length > 0 ? (
        <>
          <div className="neo hidden overflow-x-auto xl:block p-2">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Usuário</Table.ColumnHeader>
                  <Table.ColumnHeader>E-mail</Table.ColumnHeader>
                  <Table.ColumnHeader>Papel no CRM</Table.ColumnHeader>
                  <Table.ColumnHeader>Situação</Table.ColumnHeader>
                  <Table.ColumnHeader>Ações Rápidas</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {usuariosFiltrados.map((usuario) => (
                  <Table.Row key={usuario.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#E7E9EE] text-xs font-bold text-[#8E1218] shadow-[2px_2px_5px_#c8cad1,-2px_-2px_5px_#ffffff]">
                          {obterIniciais(usuario.nome)}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-[#2C3138]">{usuario.nome}</p>
                          <p className="text-xs text-[#5E6570]">ID: {usuario.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-sm text-[#5E6570]">{usuario.email}</Table.Cell>
                    <Table.Cell>
                      <SeletorPapel
                        nome={usuario.nome}
                        valor={rascunhos[usuario.id] ?? usuario.papel}
                        onChange={(papel) => setRascunhos((atual) => ({ ...atual, [usuario.id]: papel }))}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={usuario.ativo ? "green" : "gray"} variant="subtle" px="2" py="0.5" borderRadius="md">
                        {usuario.ativo ? "Ativa" : "Desativada"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Acoes
                        usuario={usuario}
                        perfilId={perfilId}
                        ocupado={ocupado === usuario.id}
                        papelAlterado={(rascunhos[usuario.id] ?? usuario.papel) !== usuario.papel}
                        onSalvar={() => void salvarPapel(usuario)}
                        onDesativar={() => setConfirmacao(usuario)}
                        onReativar={() => void reativar(usuario)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          {/* Versão Card para telas menores */}
          <div className="grid gap-4 xl:hidden">
            {usuariosFiltrados.map((usuario) => (
              <article key={usuario.id} className="neo flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E7E9EE] text-sm font-bold text-[#8E1218] shadow-[2px_2px_5px_#c8cad1,-2px_-2px_5px_#ffffff]">
                      {obterIniciais(usuario.nome)}
                    </span>
                    <div>
                      <p className="font-semibold text-[#2C3138]">{usuario.nome}</p>
                      <p className="text-xs break-words text-[#5E6570]">{usuario.email}</p>
                    </div>
                  </div>
                  <Badge colorPalette={usuario.ativo ? "green" : "gray"} variant="subtle">
                    {usuario.ativo ? "Ativa" : "Desativada"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#5E6570]">Papel no Sistema</label>
                  <SeletorPapel
                    nome={usuario.nome}
                    valor={rascunhos[usuario.id] ?? usuario.papel}
                    onChange={(papel) => setRascunhos((atual) => ({ ...atual, [usuario.id]: papel }))}
                  />
                </div>

                <div className="border-t border-[#D9DCE3] pt-3">
                  <Acoes
                    usuario={usuario}
                    perfilId={perfilId}
                    ocupado={ocupado === usuario.id}
                    papelAlterado={(rascunhos[usuario.id] ?? usuario.papel) !== usuario.papel}
                    onSalvar={() => void salvarPapel(usuario)}
                    onDesativar={() => setConfirmacao(usuario)}
                    onReativar={() => void reativar(usuario)}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {/* Modal Neumorphic de Confirmação de Desativação */}
      <Dialog.Root open={confirmacao !== null} onOpenChange={(detalhe) => !detalhe.open && setConfirmacao(null)}>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content className="neo" bg="#F3F4F7" w="full" maxW="lg">
            <Dialog.Header>
              <Dialog.Title className="font-display text-2xl text-[#2C3138]">Desativar Conta no CRM</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description className="text-sm leading-relaxed text-[#5E6570]">
                {confirmacao?.nome} perderá imediatamente a capacidade de entrar na plataforma.
                O histórico completo de auditoria e registro de alterações será preservado no banco de dados.
              </Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer className="flex flex-wrap gap-3">
              <BotaoSecundario type="button" onClick={() => setConfirmacao(null)}>
                Cancelar
              </BotaoSecundario>
              <BotaoPrimario type="button" loading={ocupado === confirmacao?.id} onClick={() => void desativar()}>
                Confirmar Desativação
              </BotaoPrimario>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </section>
  );
}

function obterIniciais(nome: string) {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function SeletorPapel({ nome, valor, onChange }: { nome: string; valor: string; onChange: (papel: string) => void }) {
  return (
    <NativeSelect.Root size="sm" width="full" minW="9.5rem">
      <NativeSelect.Field
        aria-label={`Papel de ${nome}`}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
      >
        <option value="Proponente">Proponente</option>
        <option value="Analista">Analista</option>
        <option value="Adm">ADM</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

function Acoes({
  usuario,
  perfilId,
  ocupado,
  papelAlterado,
  onSalvar,
  onDesativar,
  onReativar,
}: {
  usuario: Usuario;
  perfilId: string;
  ocupado: boolean;
  papelAlterado: boolean;
  onSalvar: () => void;
  onDesativar: () => void;
  onReativar: () => void;
}) {
  const propria = usuario.id === perfilId;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <BotaoSecundario type="button" disabled={!papelAlterado || ocupado} onClick={onSalvar}>
        Salvar papel
      </BotaoSecundario>
      {usuario.ativo ? (
        <BotaoQuieto type="button" disabled={propria || ocupado} onClick={onDesativar}>
          {propria ? "Sua conta" : "Desativar"}
        </BotaoQuieto>
      ) : (
        <BotaoQuieto type="button" disabled={ocupado} onClick={onReativar}>
          Reativar
        </BotaoQuieto>
      )}
    </div>
  );
}
