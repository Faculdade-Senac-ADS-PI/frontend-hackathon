export type Papel = "Proponente" | "Analista" | "Adm";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  ativo: boolean;
};

export type Sessao = {
  token: string;
  expiraEm: string;
  usuario: Usuario;
};
