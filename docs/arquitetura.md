# Arquitetura

Leitura curta para quem vai acrescentar a análise de elegibilidade em cima do acesso.

## Camadas

A dependência aponta para dentro. Domain não enxerga Application. Application não enxerga EF, HTTP nem JWT. Infrastructure e Api são detalhes.

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Domain | `backend/src/Hackthon.Domain` | `Usuario` e `RegistroAcesso`. Regras que protegem o estado da conta (ativar, trocar papel). |
| Application | `backend/src/Hackthon.Application` | Um serviço por caso de uso. Portas de repositório, transação, senha, token e agente. |
| Infrastructure | `backend/src/Hackthon.Infrastructure` | Npgsql/EF Core, hash, emissão do JWT, semente e o agente substituto. |
| Api | `backend/src/Hackthon.Api` | Controllers finos, JWT bearer, policies e Problem Details em português. |

A interface (`frontend/`) não fala com o banco. Ela só conhece o contrato HTTP.

## SOLID neste corte

- **S** — `CriarUsuarioServico` cria conta. `AlterarPapelServico` só troca papel. Nenhum dos dois autentica.
- **O** — um papel novo, se um dia existir, entra no enum e nos casos que já recebem `Papel`. O login não precisa mudar.
- **L** — `IAgenteElegibilidade` pode ser trocada sem o controller saber se há RAG ou não. Hoje a implementação devolve 501.
- **I** — `IUsuarioRepositorio` e `IRegistroAcessoRepositorio` são portas separadas. Quem só lista pessoas não depende do diário de auditoria.
- **D** — o caso de uso pede `IUnidadeDeTrabalho`, não `HackthonDbContext`. O `Program.cs` é a composição que liga a interface à classe.

## Por que transação

Criar uma conta escreve duas linhas: `usuarios` e `registros_acesso`. O mesmo vale para troca de papel, desativação, reativação e autocadastro. Se a auditoria falha, a conta não pode ficar sem rastro — o desafio pede rastreabilidade. `UnidadeDeTrabalho.ExecutarEmTransacaoAsync` abre uma transação do EF Core, grava o usuário, grava o registro e só então confirma. Uma falha desfaz os dois.

O login grava uma linha só (o registro de entrada). Não precisa da mesma transação de duas tabelas.

A restrição única de e-mail vira HTTP 409. A regra “pelo menos um ADM ativo” e “não desativar a si mesmo” são exceções de negócio dentro da transação, antes do commit.

## Como adicionar um endpoint

Exemplo: listar o diário de acesso de uma pessoa, só para o ADM.

1. **Domain** — se a informação já existe em `RegistroAcesso`, não crie outra entidade.
2. **Application** — porta `IRegistroAcessoRepositorio.ListarPorUsuarioAsync` e um `ListarRegistrosServico` que devolve um DTO, sem tipo do EF.
3. **Infrastructure** — implemente a consulta em `Repositorios.cs` e registre no DI se for uma porta nova. Se a porta já existe, só o método novo.
4. **Api** — `GET /api/usuarios/{id}/registros` com `[Authorize(Policy = Politicas.SomenteAdm)]`. O controller chama o serviço e traduz `Resultado<T>` com `ResultadoHttp.Problema`.
5. **Interface** — um estado de carregamento, um estado de erro com “Tentar de novo” e a lista. Sem dados, um vazio que diga o que aparecer ali.

Suba a API em Development: a migration nova roda no boot (`BancoInicial`). Gere a migration com:

```bash
cd backend
dotnet ef migrations add NomeDaMudanca \
  --project src/Hackthon.Infrastructure \
  --output-dir Persistencia/Migrations
```

## Agente (API + RAG + pgvector)

`IAgenteElegibilidade` é o único ponto que o restante do sistema deve chamar. `GET /api/agente/contrato` descreve a entrada e a saída previstas. `POST /api/agente/consulta` hoje recusa com 501.

A implementação real fica em `Hackthon.Infrastructure/Agente` e substitui `AgenteElegibilidadeNaoConfigurado` em `Dependencias.cs`. Ela deve:

- receber o projeto (quando existir) e a pergunta do analista;
- buscar trechos no Postgres com a extensão `vector` (já criada no init do container, sem índice);
- responder com citações (`documento`, `trecho`, `referencia`);
- manter `decisaoAutomatica` em `false`.

Não coloque a chave do provedor no código. Se ela faltar, o acesso dos papéis continua de pé: o agente é assistência, não porta de entrada.
