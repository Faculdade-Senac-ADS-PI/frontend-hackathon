"use client";

import { Casca } from "@/components/casca";
import { EstadoVazio } from "@/components/estados";

export default function Analista() {
  return (
    <Casca
      titulo="Fila de análise"
      descricao="Os projetos submetidos chegam aqui para o enquadramento preliminar na Lei do Bem."
    >
      {() => (
        <EstadoVazio
          titulo="Nenhuma análise na fila"
          texto="Quando um proponente enviar o material, ele aparece aqui para você separar pesquisa de rotina, montar a prova de não rotina e registrar a decisão: qual regra, qual trecho do projeto e quem decidiu. O agente que consulta as normas ainda não está ligado. O contrato da API já existe em /api/agente/contrato: a resposta traz citações e não fecha o enquadramento sozinha."
        />
      )}
    </Casca>
  );
}
