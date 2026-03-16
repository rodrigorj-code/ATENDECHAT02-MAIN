# Abrir o sistema pelo terminal

Abra a pasta **vbsolutionn** no Cursor. O terminal já abre na raiz do projeto.

## Primeira vez (instalar dependências)

```bash
npm run i
```

Se der erro **ENOTEMPTY** ou **Acesso negado**: feche o Cursor e execute **`instalar-e-abrir.bat`** pelo Explorador de Arquivos. Depois abra o Cursor de novo.

## Subir o sistema (todo dia)

```bash
npm run dev
```

Isso sobe o **backend** (porta 3000) e o **frontend** (porta 5174). Abra no navegador: **http://localhost:5174**

---

### Comandos úteis (na raiz)

| Comando | O que faz |
|---------|-----------|
| `npm run i` | Instala dependências do backend e frontend |
| `npm run dev` | Sobe backend + frontend (um comando só) |
| `npm run dev:backend` | Só o backend |
| `npm run dev:frontend` | Só o frontend |

Não precisa fazer `cd frontend` nem `cd backend`: tudo é pela raiz.
