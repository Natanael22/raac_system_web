# RAAC System Web

Interface web do **RAAC System**, uma aplicação multi-clínica para gestão administrativa e clínica. O frontend oferece acesso a pacientes, prontuários, agenda, sala de espera, autorizações, faturamento e configurações da clínica.

## Funcionalidades

- **Autenticação multi-tenant:** login por e-mail, senha e Tenant ID opcional
- **Dashboard:** visão diária das consultas, sala de espera e indicadores de atendimento
- **Pacientes:** listagem paginada, cadastro, consulta de dados e acesso aos prontuários
- **Consultas:** calendário e formulário de novos agendamentos
- **Sala de espera:** acompanhamento dos atendimentos em andamento
- **Prontuários:** registro e consulta de evoluções clínicas por paciente
- **Autorizações:** criação de solicitações de autorização
- **Faturamento:** guias, lotes e área reservada para relatórios
- **Configurações:** operadoras, usuários e médicos
- **Perfis e permissões:** suporte a administrador, atendente e médico

## Stack

- React 19
- TypeScript 5.9
- Vite 7
- React Router 6
- TanStack Query 5
- TanStack Table 8
- Zustand 4
- Axios
- React Hook Form + Zod
- Tailwind CSS 3
- Radix UI e componentes estilo shadcn/ui
- FullCalendar
- Recharts
- Socket.IO Client
- Sonner
- Lucide React

## Estrutura

```text
src/
├── app/
│   ├── providers.tsx       # Query Client e notificações
│   └── router.tsx          # Rotas da aplicação
├── components/
│   ├── shared/             # Layout, tabelas e componentes compartilhados
│   └── ui/                 # Componentes visuais baseados em Radix UI
├── lib/
│   ├── axios.ts            # Cliente HTTP, token e Tenant ID
│   ├── query-client.ts     # Configuração do TanStack Query
│   └── utils.ts            # Utilidades
├── pages/
│   ├── auth/               # Login
│   ├── dashboard/          # Indicadores e agenda do dia
│   ├── patients/           # Cadastro e gestão de pacientes
│   ├── appointments/       # Agendamentos
│   ├── waiting-room/       # Sala de espera
│   ├── medical-records/    # Evoluções clínicas
│   ├── authorizations/     # Autorizações médicas
│   ├── billing/            # Guias e lotes
│   └── settings/           # Operadoras, usuários e médicos
├── services/               # Chamadas à API organizadas por domínio
├── store/
│   ├── authStore.ts        # Sessão, usuário e permissões
│   ├── uiStore.ts          # Estado da interface e notificações
│   └── appointmentStore.ts # Estado de consultas
└── types/                  # Contratos TypeScript das respostas da API
```

## Fluxo da aplicação

O ponto de entrada em `src/main.tsx` monta os providers globais e o `RouterProvider`. O roteador principal está em `src/app/router.tsx` e organiza as páginas dentro do `AppShell`, que contém a navegação lateral e o cabeçalho.

Os dados remotos são obtidos pelos módulos em `src/services` com o cliente Axios configurado em `src/lib/axios.ts`. Esse cliente envia automaticamente:

- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant>`

A autenticação é persistida no `localStorage` pela chave `raac-auth`. O cliente também tenta renovar o token por meio de `/api/v1/auth/refresh`, limpa a sessão em caso de falha e trata respostas HTTP 403 e demais erros.

## Requisitos

- Node.js 20 ou superior
- npm
- API backend disponível em `http://localhost:8080`

## Como executar

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

A aplicação ficará disponível no endereço informado pelo Vite, normalmente em `http://localhost:5173`.

O desenvolvimento usa o proxy configurado em `vite.config.ts`: requisições para `/api` são encaminhadas para `http://localhost:8080/api`.

## Scripts

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # executa a compilação TypeScript e gera dist/
npm run lint     # executa o ESLint
npm run preview  # serve localmente a build de produção
```

## API local

Para o frontend funcionar por completo, o backend deve expor os serviços esperados pela API e aceitar a autenticação por Bearer token e multi-tenancy por `X-Tenant-ID`.

O proxy do Vite permite executar o frontend sem CORS durante o desenvolvimento. Em produção, configure o servidor web ou a implantação para encaminhar `/api` ao backend.

## Alias de importação

O projeto usa `@` como alias para `src`, definido no Vite:

```typescript
import { patientService } from '@/services/patientService'
```
