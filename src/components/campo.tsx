"use client";

import { Field, Input } from "@chakra-ui/react";

type CampoProps = {
  id: string;
  rotulo: string;
  tipo?: string;
  valor: string;
  onChange: (valor: string) => void;
  autoComplete?: string;
  erro?: string;
};

export function Campo({ id, rotulo, tipo = "text", valor, onChange, autoComplete, erro }: CampoProps) {
  return (
    <Field.Root invalid={Boolean(erro)} required>
      <Field.Label htmlFor={id} className="text-sm font-semibold text-[#2C3138]">
        {rotulo}
      </Field.Label>
      <Input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        autoComplete={autoComplete}
        unstyled
        className="neo-inset mt-1 h-12 px-4 text-base"
        onChange={(evento) => onChange(evento.target.value)}
      />
      {erro ? <Field.ErrorText className="mt-1 text-sm text-[#8E1218]">{erro}</Field.ErrorText> : null}
    </Field.Root>
  );
}
