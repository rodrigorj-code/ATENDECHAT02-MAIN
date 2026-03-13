# Rodar o sistema localmente

Ambiente configurado para **desenvolvimento local** sem afetar o servidor no Railway (outros domínios).

## Portas

| Serviço  | URL local              | Porta |
|----------|------------------------|-------|
| Frontend | http://localhost:5174  | 5174  |
| Backend  | http://localhost:3000  | 3000  |

O backend local usa o **mesmo PostgreSQL do Railway** (apenas leitura/escrita de dados); o deploy no Railway continua servindo outros domínios normalmente.

## Como subir tudo

**Opção 1 – Pela raiz do projeto (recomendado)**

```bash
npm run dev
```

Isso sobe o backend e o frontend juntos (frontend na 5174, backend na 3000).

**Opção 2 – Pelo Cursor / VS Code**

1. `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
2. Digite: **Tasks: Run Task**
3. Escolha: **Dev: Frontend + Backend (local)**

**Opção 3 – Script PowerShell**

```powershell
.\scripts\start-local.ps1
```

**Opção 4 – Manual**

- Terminal 1 (backend):  
  `cd backend` → `npm run dev`
- Terminal 2 (frontend):  
  `cd frontend` → `npm run start`  
  (e defina `PORT=5174` no `.env.development`; já está configurado.)

## Configuração já feita

- **Backend** (`backend/.env`): `PORT=3000`, `DATABASE_URL` do Railway, `FRONTEND_URL=http://localhost:5174`, `BACKEND_URL=http://localhost`.
- **Frontend** (`frontend/.env.development`): `PORT=5174`, `REACT_APP_BACKEND_URL=http://localhost:3000`.

## Dependências

- Backend: na pasta `backend`, execute `npm install`.
- Frontend: na pasta `frontend`, execute `npm install`.

Depois disso, use um dos métodos acima para abrir frontend e backend.
