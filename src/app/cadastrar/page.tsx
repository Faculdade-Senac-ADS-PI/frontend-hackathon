"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TelaAcesso } from "@/components/tela-acesso";
import { BotaoPrimario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Aviso } from "@/components/estados";
import { api, ErroApi } from "@/lib/api";
import { guardarToken } from "@/lib/sessao";
import type { Sessao } from "@/lib/tipos";

export default function Cadastrar() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (senha !== confirmacao) {
      setErro("As senhas não conferem.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const sessao = await api<Sessao>("/api/auth/registrar", {
        method: "POST",
        body: JSON.stringify({ nome, email, senha }),
      });
      guardarToken(sessao.token);
      router.replace("/proponente");
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <TelaAcesso
      titulo="Cadastro de Proponente — Lei do Bem"
      texto="Cadastre sua empresa para submeter projetos de inovação tecnológica diretamente à esteira dos analistas de P&D e usufruir de até 34% de redução em tributos federais."
    >
      <form className="flex flex-col gap-4" onSubmit={enviar}>
        {erro ? <Aviso tipo="error" texto={erro} /> : null}
        <Campo id="nome" rotulo="Nome completo" valor={nome} onChange={setNome} autoComplete="name" />
        <Campo id="email" rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} autoComplete="email" />
        <Campo id="senha" rotulo="Senha" tipo="password" valor={senha} onChange={setSenha} autoComplete="new-password" />
        <Campo
          id="confirmacao"
          rotulo="Confirmar senha"
          tipo="password"
          valor={confirmacao}
          onChange={setConfirmacao}
          autoComplete="new-password"
        />
        <BotaoPrimario type="submit" loading={enviando} loadingText="Criando conta…" className="w-full">
          Criar conta
        </BotaoPrimario>
      </form>
      <p className="text-sm text-[#5E6570]">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-[#8E1218]">
          Entrar
        </Link>
        .
      </p>
    </TelaAcesso>
  );
}
