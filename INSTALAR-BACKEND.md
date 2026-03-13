# Instalar o backend no Windows (ENOTEMPTY / EPERM / baileys)

Se `npm install` no backend der **ENOTEMPTY**, **EPERM** (operation not permitted) ou **ENOENT em baileys**, faça o seguinte.

---

## Importante: feche o Cursor antes

Os erros **EPERM** (operation not permitted) acontecem quando o Cursor ou outro programa está usando arquivos dentro de `node_modules`. **Feche o Cursor por completo** antes de limpar e instalar.

---

## Opção 1: Script de limpeza (recomendado)

1. **Feche o Cursor** (e todos os terminais do projeto).
2. Abra **PowerShell** (clicando com botão direito em “Abrir como administrador” se quiser).
3. Vá na raiz do projeto e rode o script:

```powershell
cd "C:\Users\DAVI RESENDE\Downloads\VBSOLUTIONN\vbsolutionnn"
.\scripts\limpar-e-instalar-backend.ps1
```

O script **renomeia** `node_modules` (em vez de apagar) e roda `npm install` de novo. Assim não precisa apagar pastas travadas.

---

## Opção 2: Projeto em pasta curta (recomendado)

O Windows tem limite de ~260 caracteres no caminho. Sua pasta está em  
`C:\Users\DAVI RESENDE\Downloads\VBSOLUTIONN\vbsolutionnn` — bem longa.

1. Copie a pasta do projeto para um caminho curto, por exemplo:
   - `C:\vb`
2. Abra o Cursor na pasta **C:\vb** (e não mais na pasta em Downloads).
3. Abra o terminal e rode:
   ```powershell
   cd backend
   npm install
   ```
4. Depois, na raiz ou no frontend:
   ```powershell
   npm run dev
   ```

---

## Opção 3: Limpar manualmente e instalar

1. Feche o Cursor (e qualquer terminal usando o projeto).
2. Abra **PowerShell como Administrador** ou **CMD**.
3. Vá até a pasta do backend:
   ```powershell
   cd "C:\Users\DAVI RESENDE\Downloads\VBSOLUTIONN\vbsolutionnn\backend"
   ```
4. Renomeie a pasta (em vez de apagar):
   ```powershell
   Rename-Item node_modules node_modules.old
   ```
   Se der erro, tente apagar depois de fechar tudo:
   ```powershell
   Remove-Item node_modules -Recurse -Force
   ```
5. Instale de novo:
   ```powershell
   npm install
   ```

---

Depois que o `npm install` do backend terminar sem erro, **abra o Cursor de novo**, vá na pasta do frontend ou na raiz e rode:

```powershell
npm run dev
```

Frontend: http://localhost:5174  
Backend: http://localhost:3000  

---

## Se der "Cannot cd into baileys" (ENOENT)

O pacote `baileys` vem do GitHub. Às vezes a instalação falha na primeira vez.

1. Com o Cursor **fechado**, na pasta `backend` rode de novo:  
   `npm install`
2. Se continuar falhando, limpe o cache e instale de novo:  
   `npm cache clean --force`  
   `npm install`  
