"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BotaoPrimario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Aviso } from "@/components/estados";
import { TelaAcesso } from "@/components/tela-acesso";
import { api, ErroApi } from "@/lib/api";
import { homeDoPapel } from "@/lib/papeis";
import { guardarToken } from "@/lib/sessao";
import type { Sessao } from "@/lib/tipos";

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const sessao = await api<Sessao>("/api/auth/entrar", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      guardarToken(sessao.token);
      router.replace(homeDoPapel(sessao.usuario.papel));
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaAcesso
      titulo="Entrar"
      texto="Use o e-mail da sua conta. Analista e ADM entram com a senha definida pela administração."
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        {erro ? <Aviso tipo="error" texto={erro} /> : null}
        <Campo id="email" rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} autoComplete="username" />
        <Campo id="senha" rotulo="Senha" tipo="password" valor={senha} onChange={setSenha} autoComplete="current-password" />
        <BotaoPrimario type="submit" loading={enviando} loadingText="Entrando…" className="w-full">
          Entrar
        </BotaoPrimario>
      </form>
      <p className="text-sm text-[#5E6570]">
        Vai enviar um projeto?{" "}
        <Link href="/cadastrar" className="font-semibold text-[#8E1218]">
          Cadastre-se como proponente
        </Link>
        .
      </p>
    </TelaAcesso>
  );
}
