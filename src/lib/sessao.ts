const COOKIE = "hackthon_token";
const OITO_HORAS = 8 * 60 * 60;

export function guardarToken(token: string) {
  document.cookie = `${COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${OITO_HORAS}`;
}

export function limparToken() {
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function lerToken() {
  if (typeof document === "undefined") return null;
  const partes = document.cookie.split("; ");
  const item = partes.find((parte) => parte.startsWith(`${COOKIE}=`));
  if (!item) return null;
  return decodeURIComponent(item.slice(COOKIE.length + 1));
}
