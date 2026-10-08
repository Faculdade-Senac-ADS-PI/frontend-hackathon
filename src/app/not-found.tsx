import Link from "next/link";
import { BotaoPrimario } from "@/components/botoes";

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#8a1533]">404</p>
      <h1 className="font-display text-4xl">Essa página não existe</h1>
      <p className="text-[#727c81]">O caminho não faz parte do acesso do Banco do Nordeste.</p>
      <BotaoPrimario asChild className="w-fit">
        <Link href="/">Voltar ao início</Link>
      </BotaoPrimario>
    </main>
  );
}
