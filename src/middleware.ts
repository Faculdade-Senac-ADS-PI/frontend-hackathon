import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { AUDIENCIA_JWT, EMISSOR_JWT, SEGREDO_JWT_DEV } from "@/lib/segredo-dev";

const PUBLICAS = new Set(["/", "/entrar", "/cadastrar"]);

function home(papel: string) {
  if (papel === "Analista") return "/analista";
  if (papel === "Adm") return "/adm";
  return "/proponente";
}

async function lerPapel(token: string) {
  try {
    const segredo = new TextEncoder().encode(process.env.JWT_SECRET || SEGREDO_JWT_DEV);
    const { payload } = await jwtVerify(token, segredo, {
      issuer: EMISSOR_JWT,
      audience: AUDIENCIA_JWT,
    });
    return typeof payload.papel === "string" ? payload.papel : null;
  } catch {
    return null;
  }
}

export async function middleware(requisicao: NextRequest) {
  const { pathname } = requisicao.nextUrl;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg"
  ) {
    return NextResponse.next();
  }

  const token = requisicao.cookies.get("hackthon_token")?.value;
  const papel = token ? await lerPapel(decodeURIComponent(token)) : null;
  const publica = PUBLICAS.has(pathname);

  if (!papel && !publica) {
    const url = requisicao.nextUrl.clone();
    url.pathname = "/entrar";
    return NextResponse.redirect(url);
  }

  if (papel && (pathname === "/" || pathname === "/entrar" || pathname === "/cadastrar")) {
    return NextResponse.redirect(new URL(home(papel), requisicao.url));
  }

  if (papel) {
    const permitido =
      (pathname.startsWith("/proponente") && papel === "Proponente") ||
      (pathname.startsWith("/analista") && papel === "Analista") ||
      (pathname.startsWith("/adm") && papel === "Adm");
    if (!permitido) {
      return NextResponse.redirect(new URL(home(papel), requisicao.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
