"use client";

import { Casca } from "@/components/casca";
import { EstadoVazio } from "@/components/estados";

export default function Proponente() {
  return (
    <Casca
      titulo="Meus projetos"
      descricao="Aqui fica o material que a equipe de P&D vai usar na análise de enquadramento."
    >
      {() => (
        <EstadoVazio
          titulo="Nenhum projeto enviado"
          texto="O envio ainda não faz parte desta versão. O próximo passo é cadastrar o projeto — o que se tentou resolver, onde está a incerteza técnica e o que já foi experimentado — para a equipe de P&D analisar o enquadramento na Lei do Bem. Quem decide é o analista. A ferramenta guarda o rastro."
        />
      )}
    </Casca>
  );
}
