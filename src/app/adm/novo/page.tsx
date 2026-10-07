"use client";

import { NativeSelect } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Casca } from "@/components/casca";
import { Aviso } from "@/components/estados";
import { api, ErroApi } from "@/lib/api";
import { papelValido } from "@/lib/papeis";

export default function NovaPessoa() {
  return (
    <Casca
      titulo="Nova pessoa"
      descricao="A senha inicial vale só para o primeiro acesso. A pessoa entra com o e-mail e a senha definidos aqui."
    >
      {() => <Formulario />}
    </Casca>
  );
}

function Formulario() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState("Analista");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!papelValido(papel)) {
      setErro("Escolha Proponente, Analista ou ADM.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await api("/api/usuarios", {
        method: "POST",
        body: JSON.stringify({ nome, email, senha, papel }),
      });
      sessionStorage.setItem("hackthon_aviso", `Conta de ${nome.trim()} criada como ${papel === "Adm" ? "ADM" : papel}.`);
      router.push("/adm");
      router.refresh();
    } catch (falha) {
      setErro(falha instanceof ErroApi ? falha.message : "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="neo grid max-w-xl gap-4 p-6" onSubmit={enviar}>
      {erro ? <Aviso tipo="error" texto={erro} /> : null}
      <Campo id="nome" rotulo="Nome completo" valor={nome} onChange={setNome} autoComplete="name" />
      <Campo id="email" rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} autoComplete="off" />
      <Campo id="senha" rotulo="Senha inicial" tipo="password" valor={senha} onChange={setSenha} autoComplete="new-password" />
      <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="papel">
        Papel
        <NativeSelect.Root>
          <NativeSelect.Field id="papel" value={papel} onChange={(evento) => setPapel(evento.target.value)}>
            <option value="Proponente">Proponente</option>
            <option value="Analista">Analista</option>
            <option value="Adm">ADM</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <BotaoPrimario type="submit" loading={enviando} loadingText="Criando…">
          Criar conta
        </BotaoPrimario>
        <BotaoSecundario type="button" onClick={() => router.push("/adm")}>
          Cancelar
        </BotaoSecundario>
      </div>
    </form>
  );
}
