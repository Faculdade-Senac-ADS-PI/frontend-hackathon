"use client";

import { Badge, Dialog, NativeSelect, Table } from "@chakra-ui/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
      titulo="Pessoas e acessos"
      descricao="Analistas e administradores não se cadastram sozinhos. Crie a conta e atribua o papel."
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
      setAviso(`Papel de ${atualizado.nome} atualizado para ${rotuloPapel(atualizado.papel)}.`);
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
      setAviso(`${atualizado.nome} não consegue mais entrar.`);
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
      setAviso(`${atualizado.nome} pode entrar de novo.`);
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível reativar a conta.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BotaoPrimario asChild>
          <Link href="/adm/novo">Nova pessoa</Link>
        </BotaoPrimario>
        <BotaoSecundario type="button" onClick={() => void carregar()} disabled={carregando}>
          Atualizar lista
        </BotaoSecundario>
      </div>
      {aviso ? <Aviso tipo="success" texto={aviso} /> : null}
      {erro ? <Aviso tipo="error" texto={erro} /> : null}
      {carregando ? <EstadoCarregando texto="Carregando pessoas…" /> : null}
      {!carregando && !erro && usuarios.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma pessoa cadastrada"
          texto="Crie a primeira conta interna. O proponente também pode se cadastrar sozinho na tela pública."
        />
      ) : null}
      {!carregando && usuarios.length > 0 ? (
        <>
          <div className="neo hidden overflow-x-auto xl:block">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Nome</Table.ColumnHeader>
                  <Table.ColumnHeader>E-mail</Table.ColumnHeader>
                  <Table.ColumnHeader>Papel</Table.ColumnHeader>
                  <Table.ColumnHeader>Situação</Table.ColumnHeader>
                  <Table.ColumnHeader>Ações</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {usuarios.map((usuario) => (
                  <Table.Row key={usuario.id}>
                    <Table.Cell fontWeight="600">{usuario.nome}</Table.Cell>
                    <Table.Cell>{usuario.email}</Table.Cell>
                    <Table.Cell>
                      <SeletorPapel
                        nome={usuario.nome}
                        valor={rascunhos[usuario.id] ?? usuario.papel}
                        onChange={(papel) => setRascunhos((atual) => ({ ...atual, [usuario.id]: papel }))}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={usuario.ativo ? "green" : "gray"} variant="subtle">
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
          <div className="grid gap-4 xl:hidden">
            {usuarios.map((usuario) => (
              <article key={usuario.id} className="neo flex flex-col gap-3 p-4">
                <div>
                  <p className="font-semibold">{usuario.nome}</p>
                  <p className="text-sm break-words text-[#5E6570]">{usuario.email}</p>
                </div>
                <SeletorPapel
                  nome={usuario.nome}
                  valor={rascunhos[usuario.id] ?? usuario.papel}
                  onChange={(papel) => setRascunhos((atual) => ({ ...atual, [usuario.id]: papel }))}
                />
                <Badge colorPalette={usuario.ativo ? "green" : "gray"} variant="subtle" w="fit">
                  {usuario.ativo ? "Ativa" : "Desativada"}
                </Badge>
                <Acoes
                  usuario={usuario}
                  perfilId={perfilId}
                  ocupado={ocupado === usuario.id}
                  papelAlterado={(rascunhos[usuario.id] ?? usuario.papel) !== usuario.papel}
                  onSalvar={() => void salvarPapel(usuario)}
                  onDesativar={() => setConfirmacao(usuario)}
                  onReativar={() => void reativar(usuario)}
                />
              </article>
            ))}
          </div>
        </>
      ) : null}

      <Dialog.Root open={confirmacao !== null} onOpenChange={(detalhe) => !detalhe.open && setConfirmacao(null)}>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content className="neo" bg="#F3F4F7" w="full" maxW="lg">
            <Dialog.Header>
              <Dialog.Title className="font-display text-2xl">Desativar conta</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description>
                {confirmacao?.nome} deixa de entrar até alguém reativar a conta. O histórico de acesso permanece.
              </Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer className="flex flex-wrap gap-3">
              <BotaoSecundario type="button" onClick={() => setConfirmacao(null)}>
                Cancelar
              </BotaoSecundario>
              <BotaoPrimario type="button" loading={ocupado === confirmacao?.id} onClick={() => void desativar()}>
                Desativar
              </BotaoPrimario>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </section>
  );
}

function SeletorPapel({ nome, valor, onChange }: { nome: string; valor: string; onChange: (papel: string) => void }) {
  return (
    <NativeSelect.Root size="sm" width="full" minW="9rem">
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
    <div className="flex flex-wrap gap-2">
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
