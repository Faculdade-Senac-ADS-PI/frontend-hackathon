# Hackthon Web (Frontend)

Interface web do sistema de apoio à análise preliminar de elegibilidade da **Lei do Bem**, desenvolvido no contexto do Hackathon STS 2026 (Banco do Nordeste).

A aplicação opera no padrão visual de **Neumorfismo** com a identidade institucional do Banco do Nordeste, integrando um **CRM completo para Analistas e Administradores** e uma jornada didática de alta conversão para **Proponentes**.

---

## 🛠️ Tecnologias e Ferramentas

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server e Client Components)
* **Gerenciador de Pacotes:** [Yarn](https://yarnpkg.com/)
* **Linguagem:** [TypeScript 5](https://www.typescriptlang.org/)
* **Biblioteca de UI:** [Chakra UI v3](https://chakra-ui.com/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com design system customizado (Neumorfismo: `.neo`, `.neo-inset`, paleta institucional `#C4161C` / `#8E1218`)
* **Autenticação:** [jose](https://github.com/panva/jose) (verificação de JWT no Edge Middleware com cookies HTTP)
* **Comunicação com a API:** Fetch wrapper tipado com mapeamento de Problem Details (RFC 7807) e proxy reverso interno

---

## 👥 Módulos e Padrões por Papel

### 1. CRM do Analista (`/analista`)
* **Dashboard de KPIs:** Fila de triagem, casos em análise técnica, pré-enquadrados elegíveis, diligências e volume total de dispêndios em P&D sob análise.
* **Pipeline de Casos:** Filtros instantâneos por status, área tecnológica (Software, Biotecnologia, Automação, Agrotech) e pesquisa textual por proponente/empresa.
* **Dossiê 360° do Projeto:** Modal de avaliação baseado nos 5 critérios do **Manual de Frascati** (Incerteza Tecnológica, Novidade, Criatividade, Sistematicidade e Rastro experimental) com emissão de parecer e alteração de status.
* **Assistente de Normas com IA:** Ponto de conexão ao endpoint de RAG `/api/agente/consulta`.

### 2. CRM do Administrador (`/adm`)
* **KPIs Operacionais:** Indicadores em tempo real de total de contas, proponentes ativos, capacidade de analistas da equipe e contas bloqueadas.
* **Gestão de Pessoas & RBAC:** Busca rápida, filtros por papel e situação, alteração ágil de permissões com gravação em transação e histórico de auditoria.
* **Governança:** Desativação e reativação segura de contas com modal Neumorphic de confirmação.

### 3. Jornada e Conversão do Proponente (`/` e `/proponente`)
* **Landing Page Educativa (`/`):** Explicação da **Lei nº 11.196/2005**, dedução de até 34% em tributos federais (IRPJ/CSLL), jornada em 4 etapas e simulador interativo de economia fiscal para incentivar o autocadastro.
* **Central do Proponente (`/proponente`):** Guia técnico com os critérios avaliados pela equipe de P&D, checklist de requisitos e submissão interativa de propostas de inovação direto para a esteira do analista.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

* **Node.js**: v20 ou superior
* **Yarn**: v1.22 ou superior
* **API do Backend:** Executando na porta `5088` (veja o repositório do backend)

### Instalação

Na raiz do projeto frontend:

```bash
yarn install
```

### Variáveis de Ambiente

Copie o arquivo de exemplo para configurar o ambiente:

```bash
cp .env.example .env.local
```

Variáveis suportadas:
* `API_INTERNA`: URL da API backend (padrão: `http://127.0.0.1:5088`).
* `JWT_SECRET`: Chave secreta de 32+ caracteres para validação do JWT no middleware (em desenvolvimento local há um fallback seguro pré-configurado).

### Executando em Desenvolvimento

```bash
yarn dev
```

A aplicação estará acessível em: **http://127.0.0.1:43123**

### Scripts Disponíveis com Yarn

* `yarn dev`: Inicia o servidor de desenvolvimento na porta `43123`.
* `yarn build`: Executa a compilação e otimização de produção do Next.js.
* `yarn start`: Inicia o servidor de produção na porta `43123`.
* `yarn lint`: Executa a validação estática de código e types com ESLint.

---

## 📂 Estrutura de Pastas

```text
frontend/
├── docs/                 # Documentação técnica de arquitetura
│   └── arquitetura.md
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── adm/          # CRM de Gestão de Acessos e Pessoas
│   │   ├── analista/     # CRM de Pipeline e Dossiês da Lei do Bem
│   │   ├── proponente/   # Central de Propostas e Guia do Proponente
│   │   ├── cadastrar/    # Cadastro público para proponentes
│   │   ├── entrar/       # Autenticação unificada
│   │   ├── layout.tsx    # Layout raiz com Provedor de Temas
│   │   └── page.tsx      # Landing page de indução à Lei do Bem
│   ├── components/       # Componentes Neumorphic reutilizáveis
│   │   ├── casca.tsx     # Shell autenticada com suporte a ações CRM
│   │   ├── tela-acesso.tsx# Shell de páginas de autenticação
│   │   ├── botoes.tsx    # Botões primários, secundários e quieto
│   │   ├── campo.tsx     # Inputs e labels padronizados
│   │   └── estados.tsx   # Feedbacks de loading, erro e empty state
│   ├── lib/              # Infraestrutura cliente
│   │   ├── api.ts        # Cliente fetch com tratamento RFC 7807
│   │   ├── sessao.ts     # Gerenciamento de cookies (hackthon_token)
│   │   ├── papeis.ts     # Helpers de rotas e labels RBAC
│   │   └── tipos.ts      # Contratos de tipos TypeScript
│   ├── middleware.ts     # Proteção de rotas RBAC no Edge Runtime
│   └── theme.ts          # Configuração de tokens do Chakra UI
├── next.config.ts        # Rewrites de proxy para a API .NET
└── package.json
```

Para detalhes adicionais de ciclo de vida e extensão, veja [docs/arquitetura.md](docs/arquitetura.md).
