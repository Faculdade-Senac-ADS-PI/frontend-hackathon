import { limparToken, lerToken } from "@/lib/sessao";

export class ErroApi extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

export async function api<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = lerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let resposta: Response;
  try {
    resposta = await fetch(caminho, { ...init, headers, cache: "no-store" });
  } catch {
    throw new ErroApi("Não foi possível falar com o servidor. Confira se a API está no ar.", 0);
  }

  const texto = await resposta.text();
  let corpo: { detail?: string; title?: string } | null = null;
  if (texto) {
    try {
      corpo = JSON.parse(texto) as { detail?: string; title?: string };
    } catch {
      corpo = null;
    }
  }

  if (!resposta.ok) {
    const detalhe = corpo?.detail || corpo?.title || "A operação não foi concluída.";
    const entrada = caminho.startsWith("/api/auth/entrar") || caminho.startsWith("/api/auth/registrar");
    if (resposta.status === 401 && !entrada && caminho !== "/api/auth/eu") {
      limparToken();
    }
    throw new ErroApi(detalhe, resposta.status);
  }

  return corpo as T;
}
