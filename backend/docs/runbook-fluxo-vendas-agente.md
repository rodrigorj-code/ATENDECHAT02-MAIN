# Runbook: fluxo campanha → tratativa → material → reunião → recontato

Este guia liga o **agente reativo** (WhatsApp em tempo real) às **automações proativas** (`agent_proactive`). Use junto com o preset **“Campanha → venda”** na página Prompts (aba Proatividade).

## 1. Camada reativa: Cargo (`agent_role`)

Enquanto o cliente responde, o comportamento vem principalmente do **Cargo**, não do cron.

Configure na UI de Prompts (Cargo):

- **Objetivo do agente**: ex. qualificar necessidade, explicar o produto, conduzir para demo ou fechamento.
- **Personalidade e instruções**: perguntas cruciais antes de empurrar preço; confirmar entendimento; oferecer material só quando fizer sentido.
- **Próximo passo explícito**: instruir a encerrar mensagens com uma pergunta ou CTA claro (horários, confirmação de interesse).

**Reunião**: habilite a ação **Agendamento** em `agent_actions` para o modelo criar compromissos no fluxo reativo. A proatividade **não** substitui essa ação; ela só **recontata** depois do silêncio.

## 2. Camada reativa: Cérebro (`agent_brain`)

Inclua no cérebro:

- Funcionalidades do serviço e diferenciais objetivos.
- Respostas a objeções frequentes.
- Referência a materiais (nomes dos PDFs/vídeos que você anexa na aba **Mídias** ou que o agente pode citar).

Assim o modelo **entende o produto** antes de prometer o que não existe.

## 3. Campanha e prospecção fria (`cold_outreach`)

1. Ajuste **playbook** (ex.: `prospeccao` ou `consultivo`) e **tom da mensagem** no fluxo Prospecção fria.
2. Use **disparo manual** (lista e/ou IDs) ou a API `POST /agent-proactive/cold-outreach`.
3. **Sequência pós-prospecção** (accordion Avançado): toques em +24h / +48h com *hints* do tipo retomar sem pressão e lembrar convite à conversa ou demo.

`coldOutreachBlendMode` controla se lista, IDs ou união dos dois entram no disparo.

## 4. Silêncio após conversa: follow-up

Quando o cliente para de responder **depois** da tratativa (material, proposta de reunião, etc.):

- **Dias sem resposta** (`followUpAfterDays`): use `1` se o job diário deve considerar “ontem” (validar na prática com o horário do cron).
- **Mín. horas entre follow-ups** (`minHoursBetweenFollowUps`): ex. `24` para espaçar tentativas em dias.
- **Máx. tentativas** (`maxFollowUpAttempts`): teto antes de marcar inativo.
- **Missão** `sales` + **objetivos / tom** do fluxo Follow-up: retomar reunião, novo horário, referência ao material já enviado.

### Público (tags / listas)

- **`applySegmentFilters: true`**: cada fluxo respeita tags/listas preenchidas; vazio no fluxo = qualquer contato elegível.
- **`applySegmentFilters: false`**: ignora segmentos por fluxo (útil para contatos só no WhatsApp, fora de listas).

## 5. Mídias no recontato (follow-up e outros contextos)

Na aba **Mídias**:

1. Configure anexos no contexto **Follow-up** (PDF, imagens, vídeo).
2. Preencha **Contexto antes dos anexos (para a IA)** (`beforeMediaContext`): o modelo anuncia o que será enviado antes dos arquivos subirem.

O job de follow-up chama `sendProactiveContextMediaAfterText` com contexto `follow_up` após o texto — já integrado no backend.

**Hot lead**: opcionalmente repita mídias + contexto se quiser reforço quando o cliente usar palavras-chave fortes.

## 6. Lead quente (`hot_lead`)

Amplie `hotLeadKeywords` com termos como: material, pdf, demo, reunião, agendar — para mensagens mais diretas quando a intenção aparecer no texto do cliente (complementa o reativo).

## 7. Limites e reengajamento

- **Máx. proativas por ticket/dia** reduz risco de spam.
- Após esgotar follow-ups, o ticket pode ir a inativo; **reengajamento** (semanas depois) tenta retomar, com **`maxReengagementAttempts`** opcional como teto.

## 8. Texto fixo vs IA

`customProactiveText` por contexto **substitui** a OpenAI naquele fluxo (Mustache: `{{nome}}`, `{{primeiro_nome}}`, `{{numero}}`, `{{ticket_id}}`). Use para mensagens legais/compliance ou piloto controlado.

## 9. Validação sugerida

1. Conversa reativa até pedido de material + proposta de reunião (sem esperar cron).
2. Parar de responder; no dia seguinte (ou após `followUpAfterDays`), conferir texto + anexos do follow-up.
3. Ajustar dias/horas e textos até o ritmo comercial desejado.

## 10. Roadmap: estágio explícito do funil (opcional)

Hoje o funil é inferido pelo **histórico** + instruções. Para regras diferentes pós-material vs pós-reunião seria necessário:

- estágio persistido (ex. tag CRM, campo customizado ou extensão futura em `dataWebhook.agentProactive`), e
- jobs que leem esse estágio.

O tipo `proactiveSalesStage` em `AgentProactiveTicketState` (ver `agentProactiveSettings.ts`) está reservado para integrações ou evoluções futuras; **nenhum job preenche automaticamente** este campo nesta versão.

---

**Arquivos úteis**

- Tipos: `backend/src/types/agentProactiveSettings.ts`
- Jobs: `backend/src/services/AgentProactiveServices/runProactiveJobs.ts`
- Geração de texto: `backend/src/services/AgentProactiveServices/proactiveOpenAi.ts`
- Envio de mídia: `backend/src/services/AgentProactiveServices/proactiveSendContextMedia.ts`
- Guards: `backend/src/services/AgentProactiveServices/proactiveTicketGuards.ts`
