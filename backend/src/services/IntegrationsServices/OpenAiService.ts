import { MessageUpsertType, proto, WASocket } from "baileys";
import {
  convertTextToSpeechAndSaveToFile,
  getBodyMessage,
  keepOnlySpecifiedChars,
  transferQueue,
  verifyMediaMessage,
  verifyMessage,
} from "../WbotServices/wbotMessageListener";
import { isNil } from "lodash";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { IConnections, INodes } from "../WebhookService/DispatchWebHookService";
import logger from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import { getJidOf } from "../WbotServices/getJidOf";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";
import CreateScheduleService from "../ScheduleServices/CreateService";
import { getIO } from "../../libs/socket";
import { format } from "date-fns";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import axios from "axios";
import { getMessageOptions } from "../WbotServices/SendWhatsAppMedia";
import { onAgentUserInboundText } from "../AgentProactiveServices/onUserInboundAgent";

type Session = WASocket & {
  id?: number;
};

interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  queueId: number;
  maxMessages: number;
  model: string;
  provider?: "openai" | "gemini";

  // Campos para controle de fluxo
  flowMode?: "permanent" | "temporary";
  maxInteractions?: number;
  continueKeywords?: string[];
  completionTimeout?: number;
  objective?: string;
  autoCompleteOnObjective?: boolean;

  // Parâmetros avançados
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stop?: string[] | string;
}

interface SessionOpenAi extends OpenAI {
  id?: number;
}

interface SessionGemini extends GoogleGenerativeAI {
  id?: number;
}

const sessionsOpenAi: SessionOpenAi[] = [];
const sessionsGemini: SessionGemini[] = [];

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

async function loadAgentActionsSetting(companyId: number): Promise<Record<string, any>> {
  try {
    const row = await ListSettingsServiceOne({ companyId, key: "agent_actions" });
    if (!row?.value) return {};
    return typeof row.value === "string" ? JSON.parse(row.value as string) : (row.value as any) || {};
  } catch {
    return {};
  }
}

/** Fila (e opcionalmente usuário) para transferência: prioriza Ações > fila do prompt de integração */
function resolveAgentTransferTarget(
  aiSettings: IOpenAi,
  agentActions: Record<string, any>
): { queueId: number | null; userId?: number } {
  const enabled = Array.isArray(agentActions?.enabled) ? agentActions.enabled : [];
  const transferActionOn = enabled.includes("Transferir Chamado");
  const tc = agentActions?.transferChamado;
  const cfgQueue = tc != null ? Number(tc.queueId) : NaN;
  const cfgUser = tc != null ? Number(tc.userId) : NaN;

  if (transferActionOn && Number.isFinite(cfgQueue) && cfgQueue > 0) {
    return {
      queueId: cfgQueue,
      ...(Number.isFinite(cfgUser) && cfgUser > 0 ? { userId: cfgUser } : {})
    };
  }

  if (aiSettings.queueId && aiSettings.queueId > 0) {
    return { queueId: aiSettings.queueId };
  }
  return { queueId: null };
}

async function loadProactiveMediaFlags(
  companyId: number
): Promise<{ vision: boolean; ack: boolean }> {
  try {
    const row = await ListSettingsServiceOne({ companyId, key: "agent_proactive" });
    const v = row?.value
      ? typeof row.value === "string"
        ? JSON.parse(row.value as string)
        : row.value
      : {};
    return {
      vision: v.openAiVisionInbound === true,
      ack: v.acknowledgeMedia !== false
    };
  } catch {
    return { vision: false, ack: true };
  }
}

function pickVisionModel(model: string): string {
  const m = (model || "").toLowerCase();
  if (m.includes("gpt-4o")) return model || "gpt-4o-mini";
  return "gpt-4o-mini";
}

// Função para detectar solicitação de transferência para atendente
const detectTransferRequest = (message: string): boolean => {
  const transferKeywords = [
    'falar com atendente',
    'quero um atendente',
    'atendente humano',
    'pessoa real',
    'sair do bot',
    'parar bot',
    'atendimento humano',
    'falar com alguém',
    'não estou conseguindo',
    'isso não funciona',
    'não entendi',
    'preciso de ajuda real',
    'quero falar com uma pessoa',
    'me transfere',
    'atendente por favor'
  ];

  const lowerMessage = message.toLowerCase();
  return transferKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Função para detectar solicitação de continuação do fluxo
const detectFlowContinuation = (message: string, continueKeywords: string[]): boolean => {
  if (!continueKeywords || continueKeywords.length === 0) {
    return false;
  }

  const lowerMessage = message.toLowerCase().trim();
  return continueKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
};

// Função para detectar se o objetivo foi completado (usando IA)
const checkObjectiveCompletion = async (
  objective: string,
  conversation: Message[],
  openai: SessionOpenAi
): Promise<boolean> => {
  if (!objective || !openai) return false;

  try {
    // Preparar histórico da conversa para análise
    const conversationText = conversation
      .slice(-5) // Últimas 5 mensagens
      .map(msg => `${msg.fromMe ? 'Bot' : 'User'}: ${msg.body}`)
      .join('\n');

    const analysisPrompt = `
Objetivo: ${objective}

Conversa:
${conversationText}

Pergunta: O objetivo foi completado com sucesso? Responda apenas "SIM" ou "NÃO".
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: analysisPrompt }],
      max_tokens: 10,
      temperature: 0
    });

    const result = response.choices[0]?.message?.content?.trim().toUpperCase();
    return result === "SIM";

  } catch (error) {
    logger.error("[AI SERVICE] Erro ao verificar completude do objetivo:", error);
    return false;
  }
};

// Função para retornar ao fluxo
const returnToFlow = async (ticket: Ticket, reason: string): Promise<void> => {
  try {
    const flowContinuation = (ticket.dataWebhook && typeof ticket.dataWebhook === "object" && "flowContinuation" in ticket.dataWebhook)
      ? (ticket.dataWebhook as any).flowContinuation
      : undefined;

    if (!flowContinuation || !flowContinuation.nextNodeId) {
      logger.warn(`[FLOW CONTINUATION] Informações de continuação não encontradas - ticket ${ticket.id}`);
      await ticket.update({
        useIntegration: false,
        isBot: false,
        dataWebhook: null
      });
      return;
    }

    logger.info(`[FLOW CONTINUATION] Retornando ao fluxo - ticket ${ticket.id}, razão: ${reason}`);

    // Enviar mensagem de transição
    const transitionMessages = {
      user_requested: "Perfeito! Vou prosseguir com o atendimento.",
      max_interactions: "Obrigado pelas informações! Vou continuar com o próximo passo.",
      timeout: "Vou prosseguir com o atendimento.",
      objective_completed: "Ótimo! Completamos essa etapa. Vamos continuar!"
    };

    const transitionMessage = transitionMessages[reason] || "Continuando...";

    // Enviar mensagem de transição
    const wbot = await getWbot(ticket.whatsappId);
    const sentMessage = await wbot.sendMessage(getJidOf(ticket.contact), {
      text: transitionMessage
    });
    await verifyMessage(sentMessage!, ticket, ticket.contact, undefined, true);

    // Restaurar estado do fluxo
    await ticket.update({
      useIntegration: false,
      isBot: false,
      dataWebhook: flowContinuation.originalDataWebhook
    });

    // Continuar fluxo no próximo nó
    if (flowContinuation.nextNodeId) {
      logger.info(`[FLOW CONTINUATION] Continuando fluxo no nó ${flowContinuation.nextNodeId} - ticket ${ticket.id}`);

      const { ActionsWebhookService } = await import("../WebhookService/ActionsWebhookService");

      const flow = await FlowBuilderModel.findOne({
        where: { id: ticket.flowStopped }
      });

      if (flow) {
        const nodes: INodes[] = flow.flow["nodes"];
        const connections: IConnections[] = flow.flow["connections"];

        await ActionsWebhookService(
          ticket.whatsappId,
          parseInt(ticket.flowStopped),
          ticket.companyId,
          nodes,
          connections,
          flowContinuation.nextNodeId,
          flowContinuation.originalDataWebhook,
          "",
          ticket.hashFlowId || "",
          null,
          ticket.id,
          {
            number: ticket.contact.number,
            name: ticket.contact.name,
            email: ticket.contact.email || ""
          }
        );
      }
    }

  } catch (error) {
    logger.error(`[FLOW CONTINUATION] Erro ao retornar ao fluxo:`, error);

    await ticket.update({
      useIntegration: false,
      isBot: false,
      dataWebhook: null
    });
  }
};

// Prepara as mensagens de IA a partir das mensagens passadas
const prepareMessagesAI = (pastMessages: Message[], isGeminiModel: boolean, promptSystem: string): any[] => {
  const messagesAI: any[] = [];

  // Para OpenAI, incluir o prompt do sistema como 'system' role
  // Para Gemini, passamos o prompt do sistema separadamente
  if (!isGeminiModel) {
    messagesAI.push({ role: "system", content: promptSystem });
  }

  for (const message of pastMessages) {
    const content = (message.body || "").trim();
    if (!content) continue;
    if (message.fromMe) {
      messagesAI.push({ role: "assistant", content });
    } else {
      messagesAI.push({ role: "user", content });
    }
  }

  return messagesAI;
};

// Processa a resposta da IA (texto ou áudio)
const processResponse = async (
  responseText: string,
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  aiSettings: IOpenAi,
  ticketTraking?: TicketTraking
): Promise<void> => {
  let response = responseText;

  const raw = typeof response === "string" ? response.trim() : "";
  const onlyPunctuation = raw.length > 0 && /^[\.\!\?\-\_\(\)\[\]\{\}"'`~…·•]+$/.test(raw);
  const hasAlphaNum = /[A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(raw);
  const cleaned = raw.replace(/[^\p{L}\p{N}]+/gu, "").trim();
  if (!raw || raw.length < 3 || onlyPunctuation || !hasAlphaNum || cleaned.length < 2) {
    response = "Desculpe, não consegui entender sua mensagem. Pode reformular?";
  }

  // Verificar se o usuário pediu para falar com atendente
  const userMessage = getBodyMessage(msg) || "";
  const userRequestedTransfer = detectTransferRequest(userMessage);
  const agentActions = await loadAgentActionsSetting(ticket.companyId);
  const { queueId: transferQueueId, userId: transferUserId } = resolveAgentTransferTarget(
    aiSettings,
    agentActions
  );

  if (userRequestedTransfer) {
    logger.info(`[AI SERVICE] Usuário solicitou transferência para atendente - ticket ${ticket.id}`);

    // Desabilitar modo IA
    await ticket.update({
      useIntegration: false,
      isBot: false,
      dataWebhook: null,
      status: "pending"
    });

    const transferMessage = "Entendi que você gostaria de falar com um atendente humano. Estou transferindo você agora. Aguarde um momento!";

    const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
      text: `\u200e ${transferMessage}`,
    });
    await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);

    if (transferQueueId && transferQueueId > 0) {
      await transferQueue(transferQueueId, ticket, contact, transferUserId);
    }

    logger.info(`[AI SERVICE] Ticket ${ticket.id} transferido para atendimento humano`);
    return;
  }

  // Verificar ação de transferência da IA
  if (response?.toLowerCase().includes("ação: transferir para o setor de atendimento")) {
    logger.info(`[AI SERVICE] IA solicitou transferência para atendente - ticket ${ticket.id}`);

    await ticket.update({
      useIntegration: false,
      isBot: false,
      dataWebhook: null,
      status: "pending"
    });

    if (transferQueueId && transferQueueId > 0) {
      await transferQueue(transferQueueId, ticket, contact, transferUserId);
    }

    response = response.replace(/ação: transferir para o setor de atendimento/i, "").trim();

    logger.info(`[AI SERVICE] Ticket ${ticket.id} transferido por solicitação da IA`);
  }

  if (!response && !userRequestedTransfer) {
    return;
  }

  const publicFolder: string = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);

  // Enviar resposta baseada no formato preferido (texto ou voz)
  // IMPORTANTE: Gemini sempre responde em texto, OpenAI pode usar voz
  const useVoice = aiSettings.provider === "openai" && aiSettings.voice !== "texto";

  if (!useVoice) {
    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatches = (response.match(urlRegex) || []) as string[];
      const urls: string[] = Array.from(
        new Set<string>(urlMatches.map((u: string) => u.replace(/[)\]\.,;]+$/, "")))
      );
      if (urls.length) {
        const allowed = /\.(png|jpe?g|gif|webp|mp4|mov|avi|mkv|mp3|wav|ogg|webm|pdf|docx?|xlsx?|pptx?|zip|7z|rar)$/i;
        const basePublic = path.resolve(__dirname, "..", "..", "..", "public");
        const companyFolder = path.join(basePublic, `company${ticket.companyId}`, "ai-attachments");
        if (!fs.existsSync(companyFolder)) fs.mkdirSync(companyFolder, { recursive: true });
        for (const u of urls) {
          if (!allowed.test(String(u))) continue;
          try {
            const urlObj = new URL(String(u));
            const baseName = decodeURIComponent(urlObj.pathname.split("/").filter(Boolean).pop() || `file_${Date.now()}`);
            const safeName = baseName.replace(/[^\w\.\-]+/g, "_");
            const target = path.join(companyFolder, `${Date.now()}_${safeName}`);
            const res = await axios.get(String(u), { responseType: "arraybuffer", timeout: 15000 });
            fs.writeFileSync(target, Buffer.from(res.data));
            const opts = await getMessageOptions(safeName, target, String(ticket.companyId), "");
            if (opts && Object.keys(opts).length) {
              const mediaMsg = await wbot.sendMessage(msg.key.remoteJid!, { ...opts });
              await verifyMediaMessage(mediaMsg!, ticket, contact, ticketTraking, false, false, wbot);
              await new Promise(r => setTimeout(r, 200));
            }
          } catch (e) {
            try { logger.warn(`[AI SERVICE] Falha ao baixar/enviar mídia: ${String(u)}`); } catch {}
          }
        }
      }
    } catch {}
    const blocks: string[] = [];
    const paragraphs = response.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    for (const p of paragraphs.length ? paragraphs : [response]) {
      if (p.length <= 600) {
        blocks.push(p);
      } else {
        let start = 0;
        while (start < p.length) {
          const end = Math.min(start + 600, p.length);
          blocks.push(p.slice(start, end).trim());
          start = end;
        }
      }
    }
    const finalBlocks = blocks.slice(0, 4);
    for (const b of finalBlocks) {
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${b}` });
      await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
      await new Promise(r => setTimeout(r, 250));
    }
    await ticket.update({ status: "open", isBot: true });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Contact, as: "contact" },
        { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "color"] }
      ]
    } as any);
    const io = getIO();
    io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
  } else {
    // Apenas OpenAI pode usar voz
    const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
    try {
      await convertTextToSpeechAndSaveToFile(
        keepOnlySpecifiedChars(response),
        `${publicFolder}/${fileNameWithOutExtension}`,
        aiSettings.voiceKey,
        aiSettings.voiceRegion,
        aiSettings.voice,
        "mp3"
      );
      const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
        mimetype: "audio/mpeg",
        ptt: true,
      });
      await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false, false, wbot);
      await ticket.update({ status: "open", isBot: true });
      await ticket.reload({
        include: [
          { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
          { model: User, as: "user", attributes: ["id", "name"] },
          { model: Contact, as: "contact" },
          { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "color"] }
        ]
      } as any);
      const io = getIO();
      io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
      deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
      deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
    } catch (error) {
      console.error(`Erro para responder com audio: ${error}`);
      // Fallback para texto
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: `\u200e ${response}`,
      });
      await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
      await ticket.update({ status: "open", isBot: true });
      await ticket.reload({
        include: [
          { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
          { model: User, as: "user", attributes: ["id", "name"] },
          { model: Contact, as: "contact" },
          { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "color"] }
        ]
      } as any);
      const io = getIO();
      io.of(String(ticket.companyId)).emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
    }
  }
};

const parseDateTimeFromText = (text: string): { date: Date | null; matched: boolean } => {
  const t = text.toLowerCase();
  const hasIntent = /(agendar|agenda|marcar|marque|remarcar|remarque).*(reuni|reunião|reuniao)|\b(reuni|reunião|reuniao)\b/.test(t);
  const dateMatch = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (!hasIntent || !dateMatch) return { date: null, matched: false };
  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  // Assumir SEMPRE o ano atual quando não informado
  let year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
  if (year < 100) year += 2000;
  let hours = 9;
  let minutes = 0;
  // Suportar variações: "às 19h", "as 19h", "19h", "19:30", "19.30"
  const timeMatch = t.match(/(?:às|as)?\s*(\d{1,2})(?::|\.|h|hs)?(\d{2})?\s*(?:h|hs|horas)?/);
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  }
  const dt = new Date(year, month - 1, day, hours, minutes, 0);
  return { date: isNaN(dt.getTime()) ? null : dt, matched: true };
};

const tryScheduleMeeting = async (
  bodyMessage: string,
  ticket: Ticket,
  contact: Contact
): Promise<{ handled: boolean; when?: Date }> => {
  const parsed = parseDateTimeFromText(bodyMessage);
  if (!parsed.matched || !parsed.date) return { handled: false };
  const when = parsed.date;
  const schedule = await CreateScheduleService({
    body: "Reunião com " + (contact.name || "contato"),
    sendAt: when.toISOString(),
    contactId: contact.id,
    companyId: ticket.companyId,
    userId: ticket.userId || undefined,
    ticketUserId: ticket.userId || undefined,
    queueId: ticket.queueId || undefined,
    openTicket: "disabled",
    statusTicket: "closed",
    whatsappId: ticket.whatsappId || undefined
  });
  const io = getIO();
  io.of(String(ticket.companyId)).emit(`company${ticket.companyId}-schedule`, {
    action: "create",
    schedule
  });
  return { handled: true, when };
};

// Manipula requisição OpenAI
const handleOpenAIRequest = async (openai: SessionOpenAi, messagesAI: any[], aiSettings: IOpenAi): Promise<string> => {
  try {
    const payload: any = {
      model: aiSettings.model,
      messages: messagesAI as any,
      max_tokens: aiSettings.maxTokens,
      temperature: aiSettings.temperature,
    };
    payload.top_p = (typeof aiSettings.topP === "number") ? aiSettings.topP : 1;
    payload.presence_penalty = (typeof aiSettings.presencePenalty === "number") ? aiSettings.presencePenalty : 0;
    payload.frequency_penalty = (typeof aiSettings.frequencyPenalty === "number") ? aiSettings.frequencyPenalty : 0;
    if (Array.isArray(aiSettings.stop)) {
      payload.stop = aiSettings.stop;
    } else if (typeof aiSettings.stop === "string" && aiSettings.stop.trim()) {
      payload.stop = aiSettings.stop.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      payload.stop = ["###", "FIM"];
    }
    const chat = await openai.chat.completions.create(payload);
    return chat.choices[0].message?.content || "";
  } catch (error) {
    console.error("OpenAI request error:", error);
    throw error;
  }
};

// Manipula requisição Gemini
const handleGeminiRequest = async (
  gemini: SessionGemini,
  messagesAI: any[],
  aiSettings: IOpenAi,
  newMessage: string,
  promptSystem: string
): Promise<string> => {
  try {
    const model = gemini.getGenerativeModel({
      model: aiSettings.model,
      systemInstruction: promptSystem,
    });

    // Converte o histórico para o formato do Gemini
    const geminiHistory: Content[] = messagesAI.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini request error:", error);
    throw error;
  }
};

// Função principal para manipular interações de IA
export const handleOpenAiFlow = async (
  aiSettings: IOpenAi,
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  mediaSent?: Message | undefined,
  ticketTraking?: TicketTraking
): Promise<void> => {
  try {
    if (!aiSettings) {
      logger.error("[AI SERVICE] Configurações da IA não fornecidas");
      return;
    }

    if (contact.disableBot) {
      logger.info("[AI SERVICE] Bot desabilitado para este contato");
      return;
    }

    // Verificar modo temporário e continuação de fluxo
    const isTemporaryMode = aiSettings.flowMode === "temporary";
    const flowContinuation = (ticket.dataWebhook && typeof ticket.dataWebhook === "object" && "flowContinuation" in ticket.dataWebhook)
      ? (ticket.dataWebhook as any).flowContinuation
      : undefined;

    // Verificações para voltar ao fluxo (apenas no modo temporário)
    if (isTemporaryMode && flowContinuation) {
      const bodyMessage = getBodyMessage(msg) || "";

      // 1. Verificar palavras-chave de continuação
      if (detectFlowContinuation(bodyMessage, aiSettings.continueKeywords || [])) {
        logger.info(`[AI SERVICE] Usuário solicitou continuação do fluxo - ticket ${ticket.id}`);
        return await returnToFlow(ticket, "user_requested");
      }

      // 2. Verificar limite de interações
      if (aiSettings.maxInteractions && flowContinuation.interactionCount >= aiSettings.maxInteractions) {
        logger.info(`[AI SERVICE] Limite de interações atingido - ticket ${ticket.id}`);
        return await returnToFlow(ticket, "max_interactions");
      }

      // 3. Verificar timeout
      if (aiSettings.completionTimeout) {
        const startTime = new Date(flowContinuation.startTime);
        const now = new Date();
        const minutesElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60);

if (minutesElapsed >= aiSettings.completionTimeout) {
          logger.info(`[AI SERVICE] Timeout atingido - ticket ${ticket.id}`);
          return await returnToFlow(ticket, "timeout");
        }
      }

      // Incrementar contador de interações
      await ticket.update({
        dataWebhook: {
          ...ticket.dataWebhook,
          flowContinuation: {
            ...flowContinuation,
            interactionCount: flowContinuation.interactionCount + 1
          }
        }
      });
    }

    // Validação da estrutura da mensagem
    let bodyMessage = "";

    try {
      if (msg && msg.message) {
        bodyMessage = getBodyMessage(msg) || "";
      } else if (msg && msg.key) {
        const messageFromDB = await Message.findOne({
          where: { wid: msg.key.id },
          order: [['createdAt', 'DESC']]
        });

        if (messageFromDB) {
          bodyMessage = messageFromDB.body || "";
          logger.info(`[AI SERVICE] Usando mensagem do banco: "${bodyMessage}"`);
        }
      }
    } catch (error) {
      logger.warn("[AI SERVICE] Erro ao extrair bodyMessage, tentando buscar última mensagem:", error);

      const lastMessage = await Message.findOne({
        where: {
          ticketId: ticket.id,
          fromMe: false
        },
        order: [['createdAt', 'DESC']]
      });

      if (lastMessage) {
        bodyMessage = lastMessage.body || "";
        logger.info(`[AI SERVICE] Usando última mensagem como fallback: "${bodyMessage}"`);
      }
    }

    const hasInboundMedia = !!(
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message?.stickerMessage
    );

    if (!bodyMessage.trim() && !hasInboundMedia) {
      logger.warn("[AI SERVICE] Nenhum conteúdo de texto ou mídia encontrado");
      return;
    }

    if (!aiSettings.model) {
      logger.error("[AI SERVICE] Modelo não definido nas configurações");
      return;
    }

    if (msg.messageStubType) {
      logger.info("[AI SERVICE] Ignorando evento de grupo (messageStubType)");
      return;
    }

    const publicFolder: string = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);

    // Definir se é OpenAI ou Gemini baseado no provider
    const provider = aiSettings.provider || (aiSettings.model.startsWith('gpt-') ? 'openai' : 'gemini');
    const isOpenAIModel = provider === 'openai';
    const isGeminiModel = provider === 'gemini';

    if (!isOpenAIModel && !isGeminiModel) {
      logger.error(`[AI SERVICE] Provider não suportado: ${provider}`);
      await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, o modelo de IA configurado não é suportado."
      });
      return;
    }

    let openai: SessionOpenAi | null = null;
    let gemini: SessionGemini | null = null;

    // Inicializar provedor de IA
    if (isOpenAIModel) {
      const openAiIndex = sessionsOpenAi.findIndex(s => s.id === ticket.id);
      if (openAiIndex === -1) {
        openai = new OpenAI({ apiKey: aiSettings.apiKey }) as SessionOpenAi;
        openai.id = ticket.id;
        sessionsOpenAi.push(openai);
      } else {
        openai = sessionsOpenAi[openAiIndex];
      }
    } else if (isGeminiModel) {
      const geminiIndex = sessionsGemini.findIndex(s => s.id === ticket.id);
      if (geminiIndex === -1) {
        gemini = new GoogleGenerativeAI(aiSettings.apiKey) as SessionGemini;
        gemini.id = ticket.id;
        sessionsGemini.push(gemini);
      } else {
        gemini = sessionsGemini[geminiIndex];
      }
    }

    // Buscar mensagens passadas para contexto
    const messages = await Message.findAll({
      where: { ticketId: ticket.id },
      order: [["createdAt", "ASC"]],
      limit: aiSettings.maxMessages > 0 ? aiSettings.maxMessages : undefined
    });

    // Formatar prompt do sistema
    const clientName = sanitizeName(contact.name || "Amigo(a)");
    let roleValue = null as any;
    let brainValue = null as any;
    try {
      const role = await ListSettingsServiceOne({ companyId: ticket.companyId, key: "agent_role" });
      roleValue = role?.value ? JSON.parse(role.value as any) : null;
    } catch {}
    try {
      const brain = await ListSettingsServiceOne({ companyId: ticket.companyId, key: "agent_brain" });
      brainValue = brain?.value ? JSON.parse(brain.value as any) : null;
    } catch {}
    const roleFunc = roleValue?.funcao ? `Função: ${roleValue.funcao}` : "";
    const rolePers = roleValue?.personalidade ? `Personalidade: ${roleValue.personalidade}` : "";
    const roleInstr = roleValue?.instrucoes ? `Instruções: ${roleValue.instrucoes}` : "";
    const roleForm = roleValue?.formalidade ? `Tom: ${roleValue.formalidade}` : "";
    const roleLang = roleValue?.idioma ? `Responda em ${roleValue.idioma}.` : "";
    const roleGreet = roleValue?.saudacao ? `Saudação padrão: ${roleValue.saudacao}` : "";
    const roleBye = roleValue?.despedida ? `Despedida padrão: ${roleValue.despedida}` : "";
    const roleEmoji = roleValue?.emojis ? `Uso de emojis: ${roleValue.emojis}` : "";
    const websites = Array.isArray(brainValue?.websites) && brainValue.websites.length > 0 ? `Referências:\n${brainValue.websites.map((u: string) => `- ${u}`).join("\n")}` : "";
    const promptSystem = `Instruções do Sistema:
- Use o nome ${clientName} nas respostas.
- Máximo de ${aiSettings.maxTokens} tokens.
- Inicie com 'Ação: Transferir para o setor de atendimento' quando necessário.
- Responda em blocos curtos (1 a 4), separados por uma linha em branco; cada bloco com até 3–4 frases; evite texto muito longo.
- Se a solicitação for ambígua, peça esclarecimentos de forma breve.
- Quando não entender a mensagem, responda de forma curta: "Desculpe, não consegui entender sua mensagem. Pode reformular?"
${roleLang ? `\n${roleLang}` : ""}${roleForm ? `\n${roleForm}` : ""}${roleFunc ? `\n${roleFunc}` : ""}${rolePers ? `\n${rolePers}` : ""}${roleEmoji ? `\n${roleEmoji}` : ""}${roleGreet ? `\n${roleGreet}` : ""}${roleBye ? `\n${roleBye}` : ""}${websites ? `\n${websites}` : ""}

${aiSettings.prompt}`;

    // Processar mensagem de texto
    if (bodyMessage.trim()) {
      await onAgentUserInboundText(ticket, bodyMessage);
      const scheduleAttempt = await tryScheduleMeeting(bodyMessage, ticket, contact);
      if (scheduleAttempt.handled) {
        const when = scheduleAttempt.when!;
        const text = `Reunião agendada com sucesso para ${format(when, "dd/MM/yyyy")} às ${format(when, "HH:mm")}.`;
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: text
        });
        await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
        return;
      }
      const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);

      try {
        let responseText: string | null = null;

        if (isOpenAIModel && openai) {
          messagesAI.push({ role: "user", content: bodyMessage });
          responseText = await handleOpenAIRequest(openai, messagesAI, aiSettings);
        } else if (isGeminiModel && gemini) {
          responseText = await handleGeminiRequest(gemini, messagesAI, aiSettings, bodyMessage, promptSystem);
        }

        if (!responseText) {
          logger.error("[AI SERVICE] Nenhuma resposta do provedor de IA");
          return;
        }

        await processResponse(responseText, wbot, msg, ticket, contact, aiSettings, ticketTraking);

        logger.info(`[AI SERVICE] Resposta processada com sucesso para ticket ${ticket.id}`);

        // APÓS RESPOSTA: Verificar se deve continuar fluxo por objetivo completado
        if (isTemporaryMode && aiSettings.autoCompleteOnObjective && aiSettings.objective && openai) {
          const recentMessages = await Message.findAll({
            where: { ticketId: ticket.id },
            order: [["createdAt", "DESC"]],
            limit: 10
          });

          const objectiveCompleted = await checkObjectiveCompletion(
            aiSettings.objective,
            recentMessages,
            openai
          );

          if (objectiveCompleted) {
            logger.info(`[AI SERVICE] Objetivo completado automaticamente - ticket ${ticket.id}`);
            return await returnToFlow(ticket, "objective_completed");
          }
        }

      } catch (error: any) {
        logger.error("[AI SERVICE] Falha na requisição para IA:", error);

        const errorMessage = "Desculpe, estou com dificuldades técnicas para processar sua solicitação no momento. Por favor, tente novamente mais tarde.";

        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: errorMessage
        });

        await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
      }
    }
    // Processar áudio (apenas para OpenAI)
    else if (msg.message?.audioMessage && mediaSent && isOpenAIModel) {
      if (!openai) {
        logger.error("[AI SERVICE] Sessão OpenAI necessária para transcrição mas não inicializada");
      await wbot.sendMessage(msg.key.remoteJid!, {
          text: "Desculpe, a transcrição de áudio não está configurada corretamente."
        });
        return;
      }

      try {
        const mediaUrl = mediaSent.mediaUrl!.split("/").pop();
        const audioFilePath = `${publicFolder}/${mediaUrl}`;

        if (!fs.existsSync(audioFilePath)) {
          logger.error(`[AI SERVICE] Arquivo de áudio não encontrado: ${audioFilePath}`);
          await wbot.sendMessage(msg.key.remoteJid!, {
            text: "Desculpe, não foi possível processar seu áudio. Por favor, tente novamente."
          });
          return;
        }

        const file = fs.createReadStream(audioFilePath);
        const transcriptionResult = await openai.audio.transcriptions.create({
          model: "whisper-1",
          file: file,
        });

        const transcription = transcriptionResult.text;

        if (!transcription) {
          logger.warn("[AI SERVICE] Transcrição vazia recebida");
          await wbot.sendMessage(msg.key.remoteJid!, {
            text: "Desculpe, não consegui entender o áudio. Tente novamente ou envie uma mensagem de texto."
          });
          return;
        }

        // Enviar transcrição para o usuário
        const sentTranscriptMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `🎤 *Sua mensagem de voz:* ${transcription}`,
        });
        await verifyMessage(sentTranscriptMessage!, ticket, contact, ticketTraking, true);

        // Obter resposta da IA para a transcrição
        const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);
        let responseText: string | null = null;

        if (isOpenAIModel) {
          messagesAI.push({ role: "user", content: transcription });
          responseText = await handleOpenAIRequest(openai, messagesAI, aiSettings);
        } else if (isGeminiModel && gemini) {
          responseText = await handleGeminiRequest(gemini, messagesAI, aiSettings, transcription, promptSystem);
        }

        if (responseText) {
          await processResponse(responseText, wbot, msg, ticket, contact, aiSettings, ticketTraking);
        }

      } catch (error: any) {
        logger.error("[AI SERVICE] Erro no processamento de áudio:", error);
        const errorMessage = error?.response?.error?.message || error.message || "Erro desconhecido";
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `Desculpe, houve um erro ao processar seu áudio: ${errorMessage}`,
        });
        await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
      }
    } else if ((msg.message?.imageMessage || msg.message?.stickerMessage) && mediaSent) {
      try {
        const { vision, ack } = await loadProactiveMediaFlags(ticket.companyId);
        const fileName = typeof mediaSent.mediaUrl === "string" ? mediaSent.mediaUrl.split("/").pop() : null;
        const publicFolderLocal: string = path.resolve(
          __dirname,
          "..",
          "..",
          "..",
          "public",
          `company${ticket.companyId}`
        );
        const filePath = fileName ? path.join(publicFolderLocal, fileName) : null;

        if (isGeminiModel && gemini) {
          const model = gemini.getGenerativeModel({
            model: aiSettings.model,
            systemInstruction: promptSystem,
          });

          const geminiHistory: Content[] = (prepareMessagesAI(messages, isGeminiModel, promptSystem)).map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          if (!filePath || !fs.existsSync(filePath)) {
            const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              text: "Recebi uma imagem, mas não consegui acessá-la para análise. Por favor, tente reenviar."
            });
            await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
            return;
          }

          const fileBuffer = fs.readFileSync(filePath);
          const imagePart: Part = {
            inlineData: {
              data: fileBuffer.toString("base64"),
              mimeType: "image/jpeg"
            }
          };

          const chat = model.startChat({ history: geminiHistory });
          const promptText = "Descreva a imagem e responda ao usuário considerando o contexto da conversa.";
          const result = await chat.sendMessage([{ text: promptText }, imagePart]);
          const responseText = result.response.text();

          if (responseText) {
            const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${responseText}` });
            await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
          }
        } else if (isOpenAIModel && openai && vision && filePath && fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath);
          const mimeGuess = msg.message?.stickerMessage ? "image/webp" : "image/jpeg";
          const b64 = buf.toString("base64");
          const dataUrl = `data:${mimeGuess};base64,${b64}`;
          const messagesAI = prepareMessagesAI(messages, false, promptSystem);
          const userLine =
            "O cliente enviou uma imagem ou figurinho. Descreva o que for relevante e responda de forma breve e útil.";
          messagesAI.push({
            role: "user",
            content: [
              { type: "text", text: userLine },
              { type: "image_url", image_url: { url: dataUrl } }
            ] as any
          });
          const visionModel = pickVisionModel(aiSettings.model);
          const chat = await openai.chat.completions.create({
            model: visionModel,
            messages: messagesAI as any,
            max_tokens: Math.min(aiSettings.maxTokens || 500, 800),
            temperature: aiSettings.temperature
          });
          const responseText = (chat.choices[0]?.message?.content || "").trim();
          if (responseText) {
            const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${responseText}` });
            await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
          }
        } else if (ack) {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "\u200e Recebi sua imagem! Se quiser que eu analise com mais detalhe, ative OpenAI Vision em Proativo & mídia ou descreva em texto o que precisa."
          });
          await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
        } else {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "\u200e Ainda não consigo analisar imagens com esta configuração. Por favor, descreva em texto."
          });
          await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
        }
      } catch (error: any) {
        logger.error("[AI SERVICE] Erro ao processar imagem:", error);
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: "Houve um erro ao analisar sua imagem. Por favor, tente novamente."
        });
        await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
      }
    } else if (msg.message?.videoMessage && mediaSent) {
      try {
        const { ack } = await loadProactiveMediaFlags(ticket.companyId);
        const cap = bodyMessage?.trim() || "";
        const synthetic = `[Mídia recebida: vídeo]${cap ? ` Legenda: ${cap}` : ""} Reconheça o envio e responda de forma breve; se precisar de análise detalhada, peça que descrevam em texto.`;
        const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);
        let responseText: string | null = null;
        if (isOpenAIModel && openai) {
          messagesAI.push({ role: "user", content: synthetic });
          responseText = await handleOpenAIRequest(openai, messagesAI, aiSettings);
        } else if (isGeminiModel && gemini) {
          responseText = await handleGeminiRequest(gemini, messagesAI, aiSettings, synthetic, promptSystem);
        }
        if (responseText) {
          await processResponse(responseText, wbot, msg, ticket, contact, aiSettings, ticketTraking);
        } else if (ack) {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "\u200e Recebi seu vídeo! Se precisar de algo específico, conte em texto que eu te ajudo."
          });
          await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
        }
      } catch (error: any) {
        logger.error("[AI SERVICE] Erro ao processar vídeo:", error);
      }
    } else if (msg.message?.documentMessage && mediaSent) {
      try {
        const { ack } = await loadProactiveMediaFlags(ticket.companyId);
        const fn = msg.message.documentMessage?.fileName || "documento";
        const synthetic = `[Mídia recebida: documento: ${fn}] Reconheça o envio e ofereça ajuda; para análise profunda, peça um resumo em texto do que precisa.`;
        const messagesAI = prepareMessagesAI(messages, isGeminiModel, promptSystem);
        let responseText: string | null = null;
        if (isOpenAIModel && openai) {
          messagesAI.push({ role: "user", content: synthetic });
          responseText = await handleOpenAIRequest(openai, messagesAI, aiSettings);
        } else if (isGeminiModel && gemini) {
          responseText = await handleGeminiRequest(gemini, messagesAI, aiSettings, synthetic, promptSystem);
        }
        if (responseText) {
          await processResponse(responseText, wbot, msg, ticket, contact, aiSettings, ticketTraking);
        } else if (ack) {
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "\u200e Recebi seu arquivo! Diga em poucas palavras o que você precisa que eu faça com ele."
          });
          await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
        }
      } catch (error: any) {
        logger.error("[AI SERVICE] Erro ao processar documento:", error);
      }
    } else if (msg.message?.audioMessage && isGeminiModel) {
      // Gemini não suporta áudio, apenas texto
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, no momento só posso processar mensagens de texto. Por favor, envie sua pergunta por escrito.",
      });
      await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
    }

  } catch (error) {
    logger.error("[AI SERVICE] Erro geral no serviço:", error);

    try {
      const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.",
      });
      await verifyMessage(sentMessage!, ticket, contact, ticketTraking, true);
    } catch (sendError) {
      logger.error("[AI SERVICE] Erro ao enviar mensagem de erro:", sendError);
    }
  }
};

export default handleOpenAiFlow;
