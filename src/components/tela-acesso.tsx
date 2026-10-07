import type { ReactNode } from "react";

export function TelaAcesso({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="h-1.5 bg-[#C4161C]" />
      <main className="mx-auto grid min-h-[calc(100vh-6px)] w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#8E1218]">Hackthon</p>
          <h1 className="font-display mt-2 text-3xl text-balance sm:text-4xl">{titulo}</h1>
          <p className="mt-3 max-w-md text-[#5E6570]">{texto}</p>
        </div>
        <section className="neo flex min-w-0 flex-col gap-5 p-5 sm:p-8">{children}</section>
      </main>
    </div>
  );
}
