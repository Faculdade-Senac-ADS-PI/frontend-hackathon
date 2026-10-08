"use client";

import { NativeSelect } from "@chakra-ui/react";
import { useState } from "react";
import { BotaoPrimario, BotaoSecundario } from "@/components/botoes";
import { Campo } from "@/components/campo";
import { Casca } from "@/components/casca";
import { Aviso } from "@/components/estados";
import { NavegacaoProponente } from "@/components/navegacao-proponente";

export default function ConfiguracoesPage() {
  const [razaoSocial, setRazaoSocial] = useState("LogiTech Nordeste Inovações S.A.");
  const [nomeFantasia, setNomeFantasia] = useState("LogiTech Nordeste");
  const [cnpj, setCnpj] = useState("14.283.910/0001-44");
  const [cnae, setCnae] = useState("62.01-5-01 — Desenvolvimento de programas sob encomenda");
  const [cidade, setCidade] = useState("Fortaleza");
  const [uf, setUf] = useState("CE");

  // Perfil Tributário
  const [regime] = useState("Lucro Real");
  const [cndStatus] = useState("Regular (Válida até 31/12/2026)");
  const [respTecnico, setRespTecnico] = useState("Marina Costa");
  const [emailTecnico, setEmailTecnico] = useState("marina.costa@hackthon.dev");
  const [respContabil, setRespContabil] = useState("Geraldo Medeiros");
  const [crc, setCrc] = useState("CRC-CE 045129/O");

  // Notificações
  const [notifAnalise, setNotifAnalise] = useState(true);
  const [notifParecer, setNotifParecer] = useState(true);
  const [notifDiligencia, setNotifDiligencia] = useState(true);

  const [aviso, setAviso] = useState("");

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setAviso("Configurações e dados cadastrais da empresa salvos com sucesso.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Casca
      titulo="Configurações da Empresa e Perfil Fiscal"
      descricao="Gerencie o cadastro institucional, enquadramento no Lucro Real, dados dos responsáveis e preferências da plataforma."
      larguraMaxima="max-w-7xl"
    >
      {() => (
        <div className="flex flex-col gap-6">
          <NavegacaoProponente />

          {aviso ? <Aviso tipo="success" texto={aviso} /> : null}

          <form onSubmit={salvar} className="flex flex-col gap-6">
            {/* Bloco 1: Dados Institucionais da Empresa */}
            <section className="neo p-6 sm:p-8 space-y-5">
              <div className="border-b border-[#ebebeb] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">Identificação</span>
                <h2 className="font-display text-2xl text-[#333333] mt-1">Dados Cadastrais da Empresa</h2>
                <p className="text-xs text-[#727c81]">
                  Informações jurídicas da pessoa jurídica proponente perante a Receita Federal do Brasil.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  id="razao-social"
                  rotulo="Razão Social"
                  valor={razaoSocial}
                  onChange={setRazaoSocial}
                  obrigatorio
                />
                <Campo
                  id="nome-fantasia"
                  rotulo="Nome Fantasia"
                  valor={nomeFantasia}
                  onChange={setNomeFantasia}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Campo
                  id="cnpj"
                  rotulo="CNPJ"
                  valor={cnpj}
                  onChange={setCnpj}
                  obrigatorio
                />
                <Campo
                  id="cidade"
                  rotulo="Cidade"
                  valor={cidade}
                  onChange={setCidade}
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#727c81]">UF</label>
                  <NativeSelect.Root size="sm" width="full">
                    <NativeSelect.Field value={uf} onChange={(e) => setUf(e.target.value)}>
                      <option value="CE">Ceará (CE)</option>
                      <option value="PE">Pernambuco (PE)</option>
                      <option value="BA">Bahia (BA)</option>
                      <option value="RN">Rio Grande do Norte (RN)</option>
                      <option value="PB">Paraíba (PB)</option>
                      <option value="MA">Maranhão (MA)</option>
                      <option value="PI">Piauí (PI)</option>
                      <option value="AL">Alagoas (AL)</option>
                      <option value="SE">Sergipe (SE)</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </div>
              </div>

              <Campo
                id="cnae"
                rotulo="CNAE Principal de Atividade"
                valor={cnae}
                onChange={setCnae}
              />
            </section>

            {/* Bloco 2: Perfil Fiscal da Lei do Bem */}
            <section className="neo p-6 sm:p-8 space-y-5">
              <div className="border-b border-[#ebebeb] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">Tributário</span>
                <h2 className="font-display text-2xl text-[#333333] mt-1">Enquadramento Fiscal (Lei 11.196/05)</h2>
                <p className="text-xs text-[#727c81]">
                  Requisitos legais exigidos pela Receita Federal e MCTI para fruição dos incentivos à inovação.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="neo-inset p-4 space-y-1">
                  <span className="text-xs font-bold text-[#8a1533] uppercase">Regime Tributário</span>
                  <p className="font-display text-lg font-bold text-[#333333]">{regime}</p>
                  <p className="text-[11px] text-[#727c81]">
                    Exigência legal: Somente empresas tributadas pelo Lucro Real podem usufruir da dedução de P&D.
                  </p>
                </div>

                <div className="neo-inset p-4 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 uppercase">Certidão Negativa (CND)</span>
                  <p className="font-display text-lg font-bold text-emerald-700">{cndStatus}</p>
                  <p className="text-[11px] text-[#727c81]">
                    Regularidade fiscal federal ativa junto à Receita Federal e Procuradoria-Geral da Fazenda Nacional.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  id="resp-tecnico"
                  rotulo="Responsável Técnico pela Inovação / P&D"
                  valor={respTecnico}
                  onChange={setRespTecnico}
                />
                <Campo
                  id="email-tecnico"
                  rotulo="E-mail do Responsável Técnico"
                  tipo="email"
                  valor={emailTecnico}
                  onChange={setEmailTecnico}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  id="resp-contabil"
                  rotulo="Responsável Contábil / Fiscal"
                  valor={respContabil}
                  onChange={setRespContabil}
                />
                <Campo
                  id="crc"
                  rotulo="Registro Profissional (CRC)"
                  valor={crc}
                  onChange={setCrc}
                />
              </div>
            </section>

            {/* Bloco 3: Notificações e Comunicação */}
            <section className="neo p-6 sm:p-8 space-y-4">
              <div className="border-b border-[#ebebeb] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a1533]">Comunicação</span>
                <h2 className="font-display text-2xl text-[#333333] mt-1">Notificações da Esteira</h2>
                <p className="text-xs text-[#727c81]">
                  Configure os alertas por e-mail para acompanhar a deliberação dos analistas técnicos.
                </p>
              </div>

              <div className="space-y-3">
                <label className="neo-inset flex items-center justify-between p-3.5 text-xs text-[#333333] cursor-pointer">
                  <div>
                    <span className="font-bold block">Início da Análise Técnica</span>
                    <span className="text-[#727c81]">Receber aviso quando o analista assumir o projeto na fila.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifAnalise}
                    onChange={(e) => setNotifAnalise(e.target.checked)}
                    className="accent-[#a6193c] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="neo-inset flex items-center justify-between p-3.5 text-xs text-[#333333] cursor-pointer">
                  <div>
                    <span className="font-bold block">Emissão do Parecer Preliminar</span>
                    <span className="text-[#727c81]">Receber comunicado imediato quando a decisão for registrada.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifParecer}
                    onChange={(e) => setNotifParecer(e.target.checked)}
                    className="accent-[#a6193c] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="neo-inset flex items-center justify-between p-3.5 text-xs text-[#333333] cursor-pointer">
                  <div>
                    <span className="font-bold block">Abertura de Diligências / Dúvidas</span>
                    <span className="text-[#727c81]">Alerta prioritário caso o analista solicite documentos adicionais.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifDiligencia}
                    onChange={(e) => setNotifDiligencia(e.target.checked)}
                    className="accent-[#a6193c] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </section>

            {/* Ações de Salvar */}
            <div className="flex justify-end gap-3 pt-2">
              <BotaoSecundario type="button" onClick={() => setAviso("Alterações descartadas.")}>
                Descartar
              </BotaoSecundario>
              <BotaoPrimario type="submit">
                Salvar Configurações da Empresa
              </BotaoPrimario>
            </div>
          </form>
        </div>
      )}
    </Casca>
  );
}
