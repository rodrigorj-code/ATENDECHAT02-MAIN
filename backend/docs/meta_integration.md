# Integração Meta (Facebook e Instagram)

Esta documentação descreve como a integração com Facebook Messenger e Instagram Direct está configurada e como operar.

## Endpoints de Webhook

- `GET /webhook`: endpoint de verificação. Usa `VERIFY_TOKEN` para confirmar a assinatura do webhook no Facebook.
- `POST /webhook`: recebe eventos de mensagens. Suporta `body.object = "page"` (Facebook) e `body.object = "instagram"` (Instagram). Os eventos são processados via `facebookMessageListener.handleMessage`.

## Verificação de Assinatura

- O cabeçalho `X-Hub-Signature-256` é verificado quando `FACEBOOK_APP_SECRET` está configurado.
- A verificação usa HMAC SHA256 do corpo bruto da requisição comparado com o cabeçalho.

## Fluxo de Mensagens

Entrada:
- Meta envia evento ao `POST /webhook`.
- O backend identifica o canal via `body.object` e localiza o `Whatsapp` correspondente pelo `facebookPageUserId`.
- Facebook: o evento `entry.messaging[]` é repassado para `handleMessage`.
- Instagram: o evento vem via `entry.changes[]` com `field="messages"`; o backend normaliza para o mesmo formato e repassa para `handleMessage`.
  
`handleMessage`:
  - Garante/atualiza `Contact` e `Ticket`.
  - Registra a mensagem (`Message`) e aciona filas/fluxos (Chatbot/FlowBuilder) quando aplicável.

Saída:
- Operadores enviam mensagens pelo controller `MessageController.store`:
  - Facebook/Instagram texto: `sendFacebookMessage` (usa `graphAPI.sendText`).
  - Facebook/Instagram mídia: `sendFacebookMessageMedia` (usa `graphAPI.sendAttachmentFromUrl`).
- Políticas: para Facebook, fora da janela de 24h é aplicado tag `ACCOUNT_UPDATE` quando possível; Instagram não suporta tags.

## Variáveis de Ambiente

- `VERIFY_TOKEN`: token de verificação do webhook (GET /webhook).
- `FACEBOOK_APP_ID`: App ID da aplicação Meta.
- `FACEBOOK_APP_SECRET`: App Secret para verificação de assinatura.
- `BACKEND_URL`: base pública para servir mídias (ex.: `https://sua-api.com`).

### Deploy no Railway

- Essas variáveis são **só de runtime** (não são usadas no build). Se o build falhar com `secret FACEBOOK_APP_SECRET not found`, configure no Railway:
  1. **Variables**: adicione `VERIFY_TOKEN`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `BACKEND_URL` como variáveis normais do serviço (não como "Build" secrets).
  2. O `nixpacks.toml` na raiz do backend define o build **sem** exigir secrets na fase de build; o Railway usará essas variáveis apenas ao rodar o container.

## Assinatura de Eventos

- A assinatura é realizada em `WhatsAppController.storeFacebook` via `subscribeApp(pageId, accessTokenDaPágina)`.
- Quando o Instagram Business está conectado, a assinatura da página cobre os eventos de mensagens Instagram associados.

## Rotas e Montagem

- O router é montado em `/webhook` via `routes/index.ts`.
- Montagem duplicada na raiz foi removida para evitar conflito.

## Boas Práticas e Validações

- Verificação de assinatura habilitada por padrão se o `FACEBOOK_APP_SECRET` estiver presente.
- Validação de payload para existência de `entry.messaging` (arrays vazios são ignorados).
- Para envios fora de 24h no Facebook, utilizar templates/tags conforme políticas Meta.

## Testes e Observações

- Certifique-se que os Tokens das páginas (`facebookUserToken`) estão válidos e sincronizados.
- Em `storeFacebook`, o sistema cria/atualiza conexões para páginas e Instagram quando habilitado (`addInstagram`).
- O envio de mídia usa URLs públicas servidas por `BACKEND_URL`.

## Logs e diagnóstico de falha no login/conexão

Quando o login/conexão do Facebook ou Instagram falha, use os logs abaixo para identificar o ponto de falha.

### Onde olhar

- **Backend:** logs do servidor (stdout no desenvolvimento; no Railway: **Deploy → View logs** do serviço backend).
- **Frontend:** console do navegador (F12 → Console), ao clicar em Facebook ou Instagram na tela de Conexões.

### Mapa de logs (backend)

| Log | Significado | O que fazer |
|-----|-------------|-------------|
| `[storeFacebook] Início` com `companyId`, `facebookUserId`, `addInstagram`, `tokenLength` | Requisição POST /facebook chegou. | Se `tokenLength` for 0, o front não enviou token (popup não retornou token). |
| `[getPageProfile] Chamando Graph API` | Backend está pedindo a lista de páginas à Meta. | — |
| `[getPageProfile] Graph API retornou erro` com `code`, `message`, `type` | A Meta respondeu com erro (token inválido, permissão negada, etc.). | Ver `message` e `code`. Ex.: 190 = token expirado/inválido; 10 = permissão; 100 = parâmetro. |
| `[getPageProfile] Resposta sem array data` | A resposta não veio no formato esperado. | Pode ser mudança de API ou resposta inesperada. |
| `[getPageProfile] Páginas encontradas` com `count` | Sucesso ao listar páginas. | Se `count` for 0, a conta não tem Páginas do Facebook. |
| `[getPageProfile] Falha na requisição` com `status`, `apiError` | Erro de rede ou HTTP (ex.: 400, 401). | `status` 401 = token inválido; 400 = ver `apiError`. |
| `[storeFacebook] Nenhuma página retornada` | getPageProfile retornou vazio ou sem lista. | Usuário precisa ter pelo menos uma Página em facebook.com/pages. |
| `[getAccessTokenFromPage] Troca de token` com `hasAppId`, `hasSecret` | Início da troca do token de página por token de longa duração. | Se `hasAppId` ou `hasSecret` for false, faltam variáveis de ambiente. |
| `[getAccessTokenFromPage] Falha na troca de token` com `status`, `apiError` | Meta recusou a troca de token. | Verificar FACEBOOK_APP_ID e FACEBOOK_APP_SECRET; 401 = app/secret errados. |
| `[storeFacebook] Erro ao conectar Facebook/Instagram` com `message`, `responseStatus`, `responseData` | Exceção no fluxo (getPageProfile, getAccessTokenFromPage ou subscribeApp). | `message` indica qual etapa (ex.: ERR_FETCHING_FB_PAGES, ERR_FETCHING_FB_USER_TOKEN). |
| `[storeFacebook] Conexão(ões) criada(s) com sucesso` | Fluxo concluído. | — |

### Mapa de logs (frontend)

| Log | Significado | O que fazer |
|-----|-------------|-------------|
| `[Connections] Facebook/Instagram Login callback status unknown` | O SDK do Facebook chamou o callback com `status === "unknown"` (popup cancelado ou erro no OAuth). | Verificar URIs de redirecionamento e domínios no app da Meta; testar em aba anônima ou outra conta. |
| `[Connections] POST /facebook falhou (Facebook/Instagram)` com `status`, `data` | O backend respondeu com erro (ex.: 400). | O campo `data` traz a mensagem do backend (ex.: "Nenhuma página do Facebook encontrada..."). Cruzar com os logs do backend acima. |

### Erros comuns

1. **Popup abre e fecha sem sucesso / status unknown**  
   - URIs de redirecionamento no app Meta não incluem a URL exata do front (incluindo porta em dev).  
   - App em modo Desenvolvimento e usuário não é testador.

2. **POST /facebook retorna 400 "Nenhuma página do Facebook encontrada"**  
   - Conta do Facebook não tem nenhuma Página (fan page), ou  
   - Token sem permissão `pages_show_list` (usuário não aceitou ou app não pediu).  
   - Ver no backend: `[getPageProfile] Páginas encontradas` com `count: 0` ou `[getPageProfile] Graph API retornou erro`.

3. **POST /facebook retorna 400 "Não foi possível validar o token"**  
   - FACEBOOK_APP_ID ou FACEBOOK_APP_SECRET incorretos ou ausentes no ambiente do backend.  
   - Ver no backend: `[getAccessTokenFromPage] Falha na troca de token` e `hasAppId`/`hasSecret`.

4. **"Malformed URL" / "unsafe domain specified: dominio,https" / "for url https:///"**  
   - O SDK do Facebook está recebendo domínio ou URL inválida. O frontend agora envia `redirectUri={window.location.origin}` (ex.: `https://vbsolution.vercel.app`) nos componentes FacebookLogin.  
   - No app da Meta, em **Configurações → Básicas → Domínios do app**: use **um domínio por vez**, só o host, sem protocolo e sem vírgulas (ex.: `vbsolution.vercel.app`). Não coloque `https` nem vários domínios na mesma linha.  
   - Em **Facebook Login → Configurações → URIs de redirecionamento OAuth válidos**: use a URL completa, uma por linha (ex.: `https://vbsolution.vercel.app`).  
   - Os erros `net::ERR_BLOCKED_BY_CLIENT` em `impression.php` costumam ser bloqueador de anúncios/privacidade no navegador; não impedem o login, mas podem ser ignorados ou testar em aba anônima sem extensões.
