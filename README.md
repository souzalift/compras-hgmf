# Dashboard Compras 2026 — Next.js

Dashboard em tempo real para controle de processos de aquisição,
lendo diretamente a planilha Excel no OneDrive / SharePoint via Microsoft Graph API.

## Stack

- **Next.js 14** — App Router + Server Components
- **TypeScript** — tipagem completa
- **Tailwind CSS** — estilização utilitária
- **Chart.js + react-chartjs-2** — gráficos
- **Vercel** — deploy + serverless functions

## Estrutura

```
src/
├── app/
│   ├── api/planilha/route.ts   ← API Route (server-side, credenciais seguras)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Dashboard.tsx           ← componente principal (client)
│   ├── Charts.tsx              ← gráficos Chart.js
│   ├── KpiCard.tsx
│   ├── SituacaoBars.tsx
│   ├── StatusBadge.tsx
│   └── ErrorPanel.tsx
├── lib/
│   ├── graph.ts                ← Microsoft Graph API (auth + leitura)
│   └── utils.ts                ← formatação e constantes
└── types/
    └── index.ts
```

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env.local
# Preencha com seus dados (veja instruções abaixo)

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Variáveis de ambiente

| Variável        | Descrição                                          |
|-----------------|----------------------------------------------------|
| `TENANT_ID`     | ID do diretório no Azure AD                        |
| `CLIENT_ID`     | ID do aplicativo registrado no Azure AD            |
| `CLIENT_SECRET` | Segredo do aplicativo (Client Secret)              |
| `WORKBOOK_ID`   | ID da planilha no OneDrive                         |
| `SITE_ID`       | (opcional) ID do site SharePoint                   |
| `DRIVE_ID`      | (opcional) ID do drive SharePoint                  |

## Como obter as credenciais (Azure AD)

### 1. Registrar o app (5 minutos)

1. Acesse [portal.azure.com](https://portal.azure.com)
2. **Azure Active Directory → Registros de aplicativo → Novo registro**
3. Preencha:
   - Nome: `Dashboard Compras`
   - Tipo: **Contas nesta organização somente**
   - Redirect URI: **deixe em branco**
4. Salve o **Client ID** e o **Tenant ID**

### 2. Criar o Client Secret

1. No app registrado: **Certificados e segredos → Novo segredo**
2. Copie o **Valor** imediatamente (aparece só uma vez)

### 3. Adicionar permissões de aplicativo

1. **Permissões de API → Adicionar → Microsoft Graph → Permissões de aplicativo**
2. Adicione: `Files.Read.All` e `Sites.Read.All`
3. Clique em **Conceder consentimento do administrador** ← obrigatório

### 4. Obter o Workbook ID

No [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer):

```
GET https://graph.microsoft.com/v1.0/me/drive/root/search(q='COMPRAS_2026')?$select=id,name
```

O campo `id` no resultado é o `WORKBOOK_ID`.

## Deploy na Vercel

```bash
# Via CLI
npm i -g vercel
vercel

# Ou via interface: importe o repositório em vercel.com
```

Após o deploy, adicione as variáveis em **Settings → Environment Variables** e clique em **Redeploy**.

## Adicionando novos meses

Nenhuma alteração no código necessária. Crie uma nova aba na planilha com o nome do mês
(ex: `ABR`, `MAI`, `JUN`) e o dashboard detecta automaticamente na próxima atualização.

## Atualização automática

O dashboard recarrega os dados a cada **5 minutos** automaticamente.
A API Route usa cache de 3 minutos no CDN da Vercel (`s-maxage=180`).
