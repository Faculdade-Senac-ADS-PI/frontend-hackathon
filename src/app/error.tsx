"use client";

import { EstadoErro } from "@/components/estados";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <EstadoErro
      texto="A tela não carregou. Se a API estiver no ar, tente de novo."
      onTentar={reset}
    />
  );
}
