# ============================================================
# Frontend Hackathon — Next.js 15 (modo produção)
# ============================================================

# ---- Stage 1: build ----
FROM node:20-alpine AS build

WORKDIR /app

# Compatibilidade de bibliotecas nativas usadas pelo Next no Alpine
RUN apk add --no-cache libc6-compat

# Instalação de dependências com cache de camada
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Fonte e build
COPY . .

# URL interna da API usada no rewrite /api/* (fica gravada no routes-manifest)
ARG API_INTERNA=http://api:5088
ENV API_INTERNA=${API_INTERNA}
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    API_INTERNA=http://api:5088

# Mesma variável do backend (Jwt:Secret) para o middleware validar os tokens
ENV JWT_SECRET=dev-only-hackthon-sts-2026-chave-com-32-bytes-min

COPY --from=build --chown=node:node /app/package.json /app/yarn.lock ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/next.config.ts ./
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next

USER node

EXPOSE 43123

CMD ["yarn", "start"]
