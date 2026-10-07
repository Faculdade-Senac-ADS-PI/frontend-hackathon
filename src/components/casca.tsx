"use client";

import { Badge } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BotaoQuieto } from "@/components/botoes";
import { EstadoCarregando, EstadoErro } from "@/components/estados";
import { api, ErroApi } from "@/lib/api";
import { homeDoPapel, rotuloPapel } from "@/lib/papeis";
import { limparToken } from "@/lib/sessao";
import type { Usuario } from "@/lib/tipos";

type CascaProps = {
  titulo: string;
  descricao: string;
  acoes?: ReactNode;
  larguraMaxima?: string;
  ocultarCardAcesso?: boolean;
  children: (perfil: Usuario) => ReactNode;
};

export function Casca({
  titulo,
  descricao,
  acoes,
  larguraMaxima = "max-w-7xl",
  ocultarCardAcesso = false,
  children,
}: CascaProps) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const usuario = await api<Usuario>("/api/auth/eu");
      setPerfil(usuario);
    } catch (falha) {
      const mensagem = falha instanceof ErroApi ? falha.message : "Não foi possível carregar a sua conta.";
      if (falha instanceof ErroApi && (falha.status === 401 || falha.status === 403)) {
        limparToken();
        router.replace("/entrar");
        return;
      }
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function sair() {
    limparToken();
    router.replace("/entrar");
    router.refresh();
  }

  if (carregando) return <EstadoCarregando texto="Carregando sua área…" />;
  if (!perfil) return <EstadoErro texto={erro || "Não foi possível carregar a sua conta."} onTentar={carregar} />;

  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-[#C4161C]" />
      <header className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href={homeDoPapel(perfil.papel)} className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#C4161C] font-display text-lg text-white shadow-[4px_4px_10px_#c8cad1]">
            H
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl leading-none">Hackthon</span>
            <span className="text-xs tracking-wide text-[#5E6570]">Lei do Bem</span>
          </span>
        </Link>
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
          <div className="min-w-0 sm:text-right">
            <p className="truncate text-sm font-semibold">{perfil.nome}</p>
            <p className="truncate text-xs text-[#5E6570]">{perfil.email}</p>
          </div>
          <Badge colorPalette="red" variant="subtle" px="2" py="1" borderRadius="lg" className="shrink-0">
            {rotuloPapel(perfil.papel)}
          </Badge>
          <BotaoQuieto type="button" className="shrink-0" onClick={sair}>
            Sair
          </BotaoQuieto>
        </div>
      </header>
      <main className={`mx-auto flex w-full ${larguraMaxima} flex-col gap-6 px-4 pb-16 sm:px-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-balance text-[#2C3138] sm:text-4xl">{titulo}</h1>
            <p className="mt-2 max-w-3xl text-[#5E6570]">{descricao}</p>
          </div>
          {acoes ? <div className="flex shrink-0 items-center gap-3">{acoes}</div> : null}
        </div>
        {!ocultarCardAcesso ? (
          <section className="neo p-5 md:p-6">
            <h2 className="font-display text-xl">Seu acesso</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Item rotulo="Nome" valor={perfil.nome} />
              <Item rotulo="E-mail" valor={perfil.email} />
              <Item rotulo="Papel" valor={rotuloPapel(perfil.papel)} />
              <Item rotulo="Situação" valor={perfil.ativo ? "Ativa" : "Desativada"} />
            </dl>
          </section>
        ) : null}
        {children(perfil)}
      </main>
    </div>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#5E6570]">{rotulo}</dt>
      <dd className="mt-1 font-semibold break-words">{valor}</dd>
    </div>
  );
}
