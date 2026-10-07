import type { Papel } from "@/lib/tipos";

export function rotuloPapel(papel: string) {
  return papel === "Adm" ? "ADM" : papel;
}

export function homeDoPapel(papel: string) {
  if (papel === "Analista") return "/analista";
  if (papel === "Adm") return "/adm";
  return "/proponente";
}

export function papelValido(valor: string): valor is Papel {
  return valor === "Proponente" || valor === "Analista" || valor === "Adm";
}
