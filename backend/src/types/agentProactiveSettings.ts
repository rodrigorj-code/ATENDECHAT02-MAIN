export type ProactiveContextType =
  | "follow_up"
  | "hot_lead"
  | "reengagement"
  | "cold_outreach";

export type AgentProactivePlaybook =
  | "consultivo"
  | "prospeccao"
  | "suporte_upsell"
  | "";

/** Direção da conversa quando a proatividade está ligada */
export type ProactiveMissionMode = "balanced" | "sales" | "support";

export interface ProactiveSegmentRule {
  /** Contato deve ter pelo menos uma destas tags */
  tagIds?: number[];
  /** Contato deve existir na lista (match por número normalizado) */
  contactListId?: number | null;
}

export interface ProactiveBusinessHours {
  enabled?: boolean;
  /** 0–23, horário America/Sao_Paulo */
  startHour?: number;
  endHour?: number;
}

export interface ProactiveMediaPack {
  imageUrls?: string[];
  documentUrls?: string[];
  videoUrls?: string[];
  /** Pausa em segundos após o texto antes de enviar anexos (0–180) */
  delayAfterTextSec?: number;
  /** Não enviar anexos se já houve mídia sua neste ticket nas últimas 48h */
  skipIfRecentOutboundMedia?: boolean;
  /**
   * O que o modelo deve deixar claro no texto antes dos anexos (tom, promessa, o que vem a seguir).
   * Ex.: "mencionar que segue o PDF com valores" ou "avisar que enviará vídeo demo".
   */
  beforeMediaContext?: string;
}

export interface ProactiveSequenceStep {
  delayHours: number;
  hint?: string;
}

/**
 * Reservado para funil comercial explícito (integrações / evolução futura).
 * Nenhum job do core preenche este campo automaticamente hoje.
 */
export type ProactiveSalesFunnelStage =
  | "discovery"
  | "material_sent"
  | "meeting_proposed"
  | "chase"
  | "closed_won"
  | "closed_lost";

export interface AgentProactiveTicketState {
  followUpAttempts?: number;
  lastFollowUpAt?: string;
  lastUserInboundAt?: string;
  hotPending?: boolean;
  hotProposalSent?: boolean;
  automationInactive?: boolean;
  inactiveMarkedAt?: string;
  lastReengagementAt?: string;
  /** Total de mensagens de reengajamento já enviadas neste ticket */
  reengagementAttempts?: number;
  /** YYYY-MM-DD (America/Sao_Paulo) para limite diário */
  proactiveSentDay?: string;
  proactiveSentCount?: number;
  /** Opcional: estágio do funil (preenchimento manual ou automação futura) */
  proactiveSalesStage?: ProactiveSalesFunnelStage | string;
}

/** Persistido em Settings (key: agent_proactive) */
export interface AgentProactiveSettings {
  enabled?: boolean;
  followUpEnabled?: boolean;
  hotLeadEnabled?: boolean;
  reengagementEnabled?: boolean;
  /** Dias após última mensagem do usuário para 1ª / próxima tentativa de follow-up */
  followUpAfterDays?: number;
  /** Semanas após marcar inativo para tentar reengajamento */
  reengageAfterWeeks?: number;
  hotLeadKeywords?: string[];
  /** Textos opcionais por contexto (guia para o modelo) */
  hints?: Partial<Record<ProactiveContextType, string>>;
  /** Objetivo comercial explícito por contexto (orienta o LLM) */
  objectives?: Partial<Record<ProactiveContextType, string>>;
  /** Preset de estratégia (UI pode mesclar em hints ao salvar) */
  playbook?: AgentProactivePlaybook;
  /** Público-alvo por contexto (tags e/ou lista de contatos) */
  segments?: Partial<Record<ProactiveContextType, ProactiveSegmentRule>>;
  businessHours?: ProactiveBusinessHours;
  /** Mídias enviadas após o texto proativo, por contexto */
  mediaByContext?: Partial<Record<ProactiveContextType, ProactiveMediaPack>>;
  defaultOutbound?: { allowAgentToSuggestUrls?: boolean };
  /** Máximo de mensagens proativas (texto) por contato/ticket por dia; 0 ou ausente = sem limite extra */
  maxProactivePerContactPerDay?: number;
  /** Toques adicionais após cold outreach inicial (delay + hint opcional) */
  sequences?: { cold_outreach?: ProactiveSequenceStep[] };
  /** Disparo manual/API: merge | list_only | ids_only */
  coldOutreachBlendMode?: string;
  /**
   * Se true (padrão quando omitido), aplica tags/listas por fluxo.
   * Se false, toda conversa elegível recebe proatividade — inclusive contato “só WhatsApp” fora de listas.
   */
  applySegmentFilters?: boolean;
  /** Máximo de follow-ups sem resposta antes de marcar inativo (padrão 3) */
  maxFollowUpAttempts?: number;
  /** Mínimo de horas entre um follow-up e o próximo (0 = só regra de dias) */
  minHoursBetweenFollowUps?: number;
  /** Máximo total de reengajamentos por ticket (omitido = só intervalo de 7 dias, sem teto extra) */
  maxReengagementAttempts?: number;
  /** Texto fixo por contexto; substitui a IA se preenchido. Mustache: {{nome}} {{primeiro_nome}} {{numero}} {{ticket_id}} */
  customProactiveText?: Partial<Record<ProactiveContextType, string>>;
  /** Como o agente deve “conduzir” a conversa proativa */
  proactiveMission?: ProactiveMissionMode;
  /** Incluir botões rápidos em proposta (Baileys templateButtons) */
  useHotLeadButtons?: boolean;
  /** Analisar imagens recebidas com OpenAI Vision (fluxo integração) */
  openAiVisionInbound?: boolean;
  /** Resposta curta ao receber mídia sem análise */
  acknowledgeMedia?: boolean;
}

export const defaultHotLeadKeywords = [
  "preço",
  "preco",
  "proposta",
  "orçamento",
  "orcamento",
  "quero",
  "contratar",
  "fechar",
  "valor",
  "plano",
  "comprar"
];

export function parseAgentProactiveSettings(raw: unknown): AgentProactiveSettings {
  if (!raw || typeof raw !== "object") return {};
  return { ...(raw as AgentProactiveSettings) };
}
