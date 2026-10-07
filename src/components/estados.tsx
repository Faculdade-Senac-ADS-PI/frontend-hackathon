"use client";

import { Alert, Center, EmptyState, Spinner, Text } from "@chakra-ui/react";
import { BotaoSecundario } from "@/components/botoes";

export function EstadoCarregando({ texto }: { texto: string }) {
  return (
    <Center minH="50vh" flexDirection="column" gap="3">
      <Spinner color="#C4161C" size="lg" borderWidth="3px" />
      <Text color="#5E6570">{texto}</Text>
    </Center>
  );
}

export function EstadoErro({ texto, onTentar }: { texto: string; onTentar?: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Alert.Root status="error" className="neo items-start">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="font-display text-xl">Algo saiu do lugar</Alert.Title>
          <Alert.Description className="mt-1 text-[#2C3138]">{texto}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      {onTentar ? (
        <div className="mt-4">
          <BotaoSecundario type="button" onClick={onTentar}>
            Tentar de novo
          </BotaoSecundario>
        </div>
      ) : null}
    </div>
  );
}

export function EstadoVazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <EmptyState.Root className="neo-inset px-4 py-8 sm:px-6 sm:py-10">
      <EmptyState.Content>
        <EmptyState.Title className="font-display text-2xl text-[#2C3138]">{titulo}</EmptyState.Title>
        <EmptyState.Description className="mt-3 max-w-2xl text-base leading-relaxed text-[#5E6570]">
          {texto}
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

export function Aviso({ tipo, texto }: { tipo: "error" | "success" | "info"; texto: string }) {
  return (
    <Alert.Root status={tipo} className="rounded-2xl">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{texto}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
