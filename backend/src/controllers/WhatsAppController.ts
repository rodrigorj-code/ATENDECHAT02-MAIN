import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import cacheLayer from "../libs/cache";
import { removeWbot, restartWbot } from "../libs/wbot";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import {
  getAccessTokenFromPage,
  getPageProfile,
  subscribeApp,
  getInstagramBusinessAccountFromPage
} from "../services/FacebookServices/graphAPI";
import ShowPlanService from "../services/PlanService/ShowPlanService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { closeTicketsImported } from "../services/WhatsappService/ImportWhatsAppMessageService";
import ShowWhatsAppServiceAdmin from "../services/WhatsappService/ShowWhatsAppServiceAdmin";
import UpdateWhatsAppServiceAdmin from "../services/WhatsappService/UpdateWhatsAppServiceAdmin";
import ListAllWhatsAppsService from "../services/WhatsappService/ListAllWhatsAppService";
import ListFilterWhatsAppsService from "../services/WhatsappService/ListFilterWhatsAppsService";
import User from "../models/User";
import logger from "../utils/logger";
import {
  CreateCompanyConnectionOficial,
  DeleteConnectionWhatsAppOficial,
  getTemplatesWhatsAppOficial,
  UpdateConnectionWhatsAppOficial
} from "../libs/whatsAppOficial/whatsAppOficial.service";
import {
  ICreateConnectionWhatsAppOficialCompany,
  ICreateConnectionWhatsAppOficialWhatsApp,
  IUpdateonnectionWhatsAppOficialWhatsApp
} from "../libs/whatsAppOficial/IWhatsAppOficial.interfaces";
import QuickMessageComponent from "../models/QuickMessageComponent";
import CreateService from "../services/QuickMessageService/CreateService";
import QuickMessage from "../models/QuickMessage";

interface WhatsappData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
  maxUseBotQueues?: string;
  timeUseBotQueues?: string;
  expiresTicket?: number;
  allowGroup?: false;
  sendIdQueue?: number;
  timeSendQueue?: number;
  timeInactiveMessage?: string;
  inactiveMessage?: string;
  ratingMessage?: string;
  maxUseBotQueuesNPS?: number;
  expiresTicketNPS?: number;
  whenExpiresTicket?: string;
  expiresInactiveMessage?: string;
  importOldMessages?: string;
  importRecentMessages?: string;
  importOldMessagesGroups?: boolean;
  closedTicketsPostImported?: boolean;
  groupAsTicket?: string;
  timeCreateNewTicket?: number;
  schedules?: any[];
  promptId?: number;
  collectiveVacationMessage?: string;
  collectiveVacationStart?: string;
  collectiveVacationEnd?: string;
  queueIdImportMessages?: number;
  phone_number_id?: string;
  waba_id?: string;
  send_token?: string;
  business_id?: string;
  phone_number?: string;
  waba_webhook?: string;
  channel?: string;
  triggerIntegrationOnClose?: boolean;
  color?: string;
  agentDisabled?: boolean;
}

interface QueryParams {
  session?: number | string;
  channel?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, super: isSuper } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session, isSuper });

  return res.status(200).json(whatsapps);
};

export const indexFilter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { session, channel } = req.query as QueryParams;

  const whatsapps = await ListFilterWhatsAppsService({
    companyId,
    session,
    channel
  });

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, super: isSuper } = req.user;
  const data = req.body;
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    business_id,
    phone_number,
    color,
    waba_webhook,
    channel,
    agentDisabled
  }: WhatsappData = data;

  // Sanitização de dados críticos para evitar espaços em branco acidentais
  const token = data.token ? data.token.trim() : null;
  const phone_number_id = data.phone_number_id ? data.phone_number_id.trim() : null;
  const waba_id = data.waba_id ? data.waba_id.trim() : null;
  const send_token = data.send_token ? data.send_token.trim() : null;

  const targetCompanyId = isSuper && data.companyId ? data.companyId : companyId;

  const company = await ShowCompanyService(targetCompanyId);
  const plan = await ShowPlanService(company.planId);

  if (!plan.useWhatsapp) {
    return res.status(400).json({
      error: "Você não possui permissão para acessar este recurso!"
    });
  }

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    companyId: targetCompanyId,
    token,
    maxUseBotQueues,
    timeUseBotQueues,
    expiresTicket,
    allowGroup,
    timeSendQueue,
    sendIdQueue,
    timeInactiveMessage,
    inactiveMessage,
    ratingMessage,
    maxUseBotQueuesNPS,
    expiresTicketNPS,
    whenExpiresTicket,
    expiresInactiveMessage,
    importOldMessages,
    importRecentMessages,
    closedTicketsPostImported,
    importOldMessagesGroups,
    groupAsTicket,
    timeCreateNewTicket,
    schedules,
    promptId,
    collectiveVacationEnd,
    collectiveVacationMessage,
    collectiveVacationStart,
    queueIdImportMessages,
    phone_number_id,
    waba_id,
    send_token,
    business_id,
    phone_number,
    waba_webhook,
    channel,
    color,
    agentDisabled
  });

  if (["whatsapp_oficial"].includes(whatsapp.channel)) {
    try {
      // Se tiver URL da API externa configurada, usa o fluxo antigo
      if (process.env.URL_API_OFICIAL) {
        const companyData: ICreateConnectionWhatsAppOficialCompany = {
          companyId: String(whatsapp.companyId),
          companyName: whatsapp.company.name
        };
        const whatsappOficial: ICreateConnectionWhatsAppOficialWhatsApp = {
          token_mult100: whatsapp.token,
          phone_number_id: whatsapp.phone_number_id,
          waba_id: whatsapp.waba_id,
          send_token: whatsapp.send_token,
          business_id: whatsapp.business_id,
          phone_number: whatsapp.phone_number,
          idEmpresaMult100: whatsapp.companyId
        };

        const data = {
          email: whatsapp.company.email,
          company: companyData,
          whatsApp: whatsappOficial
        };

        const { webhookLink, connectionId } =
          await CreateCompanyConnectionOficial(data);

        if (webhookLink) {
          whatsapp.waba_webhook = webhookLink;
          whatsapp.waba_webhook_id = connectionId;
          whatsapp.status = "CONNECTED";
          await whatsapp.save();
        }
      } else {
        // Fluxo DIRETO (Sem API Intermediária)
        // O webhook será o próprio backend
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
        const webhookLink = `${backendUrl}/v1/webhook/${whatsapp.companyId}/${whatsapp.id}`;
        
        whatsapp.waba_webhook = webhookLink;
        whatsapp.waba_webhook_id = whatsapp.id; // Usa o próprio ID como ID de conexão externa
        whatsapp.status = "CONNECTED";
        await whatsapp.save();
      }
    } catch (error) {
      logger.info("ERROR", error);
    }
  }

  if (["whatsapp"].includes(whatsapp.channel)) {
    // Não aguardar o início da sessão para não bloquear a resposta da API
    StartWhatsAppSession(whatsapp, targetCompanyId).catch(err => {
      logger.error(`Error starting WhatsApp session: ${err}`);
    });
  }

  const io = getIO();
  io.of("/" + String(whatsapp.companyId)).emit(`company-${whatsapp.companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.of("/" + String(oldDefaultWhatsapp.companyId)).emit(`company-${oldDefaultWhatsapp.companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const storeFacebook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      facebookUserId,
      facebookUserToken,
      addInstagram
    }: {
      facebookUserId: string;
      facebookUserToken: string;
      addInstagram: boolean;
    } = req.body;
    const { companyId } = req.user;

    logger.info("[storeFacebook] Início", {
      companyId,
      facebookUserId,
      addInstagram: !!addInstagram,
      tokenLength: facebookUserToken?.length ?? 0
    });

    const rawPages = await getPageProfile(facebookUserId, facebookUserToken);
    const data = rawPages?.data;

    if (!data || data.length === 0) {
      logger.warn("[storeFacebook] Nenhuma página retornada", {
        facebookUserId,
        hasRawPages: !!rawPages,
        rawKeys: rawPages ? Object.keys(rawPages) : []
      });
      return res.status(400).json({
        error: "Nenhuma página do Facebook encontrada para esta conta. Vincule uma página em facebook.com/pages."
      });
    }
    const io = getIO();

    const pages = [];
    for await (const page of data) {
      const { name, access_token, id, instagram_business_account } = page;

      logger.info("[storeFacebook][Page]", {
        companyId,
        pageId: id,
        pageName: name,
        addInstagram,
        hasInstagramBusinessAccountInList: !!instagram_business_account,
        instagramBusinessAccountIdInList: instagram_business_account?.id || null
      });

      // A troca de token para "long-lived" pode falhar se o app credentials estiverem
      // divergentes/incompletos. Para não bloquear a conexão (e permitir webhooks/tickets),
      // fazemos fallback para o token original retornado pela Graph API.
      let acessTokenPage = access_token;
      try {
        acessTokenPage = await getAccessTokenFromPage(access_token);
      } catch (err: any) {
        logger.warn("[storeFacebook] Falha ao trocar token da página. Usando token original.", {
          facebookUserId,
          facebookPageId: id,
          hasInstagramBusinessAccount: !!instagram_business_account,
          error: err?.message
        });
      }

      // Se o list endpoint não retornar instagram_business_account, tentamos recuperar via endpoint do próprio Page.
      // IMPORTANTE: para não depender de um formato/endpoint específico do Graph,
      // quando `addInstagram` estiver ativo tentamos resolver novamente via Page token.
      let instagramBusinessAccount = instagram_business_account;
      if (addInstagram) {
        // 1) Tenta com o token da página (long-lived, se possível)
        const resolvedWithPageToken = await getInstagramBusinessAccountFromPage(id, acessTokenPage);
        if (resolvedWithPageToken?.id) instagramBusinessAccount = resolvedWithPageToken;
        else {
          // 2) Fallback: tenta com o token original do usuário
          // (alguns apps/escopos deixam a leitura do vínculo IG apenas no token do usuário)
          const resolvedWithUserToken = await getInstagramBusinessAccountFromPage(id, facebookUserToken);
          if (resolvedWithUserToken?.id) instagramBusinessAccount = resolvedWithUserToken;
        }
      }

      if (addInstagram) {
        logger.info("[storeFacebook][InstagramResolve]", {
          companyId,
          pageId: id,
          addInstagram,
          instagramResolved: !!instagramBusinessAccount,
          instagramBusinessAccountId: instagramBusinessAccount?.id || null,
          instagramResolvedUsername: instagramBusinessAccount?.username || null
        });
      }

      // Sempre garante a conexão do Page no canal "facebook".
      // Isso evita o bug onde a conexão do facebook não é criada quando o Graph já traz o IG linked.
      pages.push({
        companyId,
        name,
        facebookUserId: facebookUserId,
        facebookPageUserId: id,
        facebookUserToken: acessTokenPage,
        tokenMeta: facebookUserToken,
        isDefault: false,
        channel: "facebook",
        status: "CONNECTED",
        greetingMessage: "",
        farewellMessage: "",
        queueIds: [],
        isMultidevice: false
      });

      // Inscreve webhook na Página do Facebook (necessário para receber eventos do canal "facebook").
      try {
        await subscribeApp(id, acessTokenPage);
      } catch (err: any) {
        logger.warn("[storeFacebook] Falha ao inscrever webhook na Página do Facebook.", {
          facebookPageId: id,
          error: err?.message
        });
      }

      // Se conseguir resolver o IG business account, cria também a conexão "instagram" e subscreve webhooks nela.
      if (addInstagram) {
        if (instagramBusinessAccount) {
          const { id: instagramId, username, name: instagramName } = instagramBusinessAccount;

          pages.push({
            companyId,
            name: `Insta ${username || instagramName}`,
            facebookUserId: facebookUserId,
            facebookPageUserId: instagramId,
            facebookUserToken: acessTokenPage,
            tokenMeta: facebookUserToken,
            isDefault: false,
            channel: "instagram",
            status: "CONNECTED",
            greetingMessage: "",
            farewellMessage: "",
            queueIds: [],
            isMultidevice: false
          });

          try {
            await subscribeApp(instagramId, acessTokenPage);
          } catch (err: any) {
            logger.warn("[storeFacebook] Falha ao inscrever webhook na conta do Instagram.", {
              instagramBusinessAccountId: instagramId,
              error: err?.message
            });
          }
        } else {
          // Placeholder para garantir o ícone "Instagram" na lista de conexões
          // quando o Graph não retorna o `instagram_business_account`.
          pages.push({
            companyId,
            name: "Instagram",
            facebookUserId: facebookUserId,
            // sem o IG business account id, reaproveitamos o id da Page
            facebookPageUserId: id,
            facebookUserToken: acessTokenPage,
            tokenMeta: facebookUserToken,
            isDefault: false,
            channel: "instagram",
            status: "CONNECTED",
            greetingMessage: "",
            farewellMessage: "",
            queueIds: [],
            isMultidevice: false
          });
        }
      }
    }

    for await (const pageConection of pages) {
      const exist = await Whatsapp.findOne({
        where: {
          facebookPageUserId: pageConection.facebookPageUserId,
          channel: pageConection.channel,
          companyId
        }
      });

      let whatsapp;
      if (exist) {
        await exist.update({
          ...pageConection
        });
        whatsapp = exist;
      } else {
        const created = await CreateWhatsAppService(pageConection);
        whatsapp = created.whatsapp;
      }

      io.of("/" + String(companyId)).emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      });
    }
    logger.info("[storeFacebook] Conexão(ões) criada(s) com sucesso", { companyId, pagesCount: pages.length });
    return res.status(200).json({ ok: true, count: pages.length });
  } catch (error: any) {
    logger.error("[storeFacebook] Erro ao conectar Facebook/Instagram", {
      message: error?.message,
      stack: error?.stack,
      responseStatus: error?.response?.status,
      responseData: error?.response?.data
    });

    const message = error?.message;
    if (message === "ERR_FETCHING_FB_PAGES") {
      return res.status(400).json({
        error: "Nenhuma página do Facebook encontrada para esta conta ou token expirado. Tente fazer login novamente."
      });
    }
    if (message === "ERR_FETCHING_FB_USER_TOKEN") {
      return res.status(400).json({
        error: "Não foi possível validar o token. Verifique FACEBOOK_APP_ID e FACEBOOK_APP_SECRET no servidor."
      });
    }
    if (message === "ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS") {
      return res.status(400).json({
        error: "Erro ao inscrever a página no webhook. Verifique as permissões do app na Meta."
      });
    }

    return res.status(400).json({
      error: "Erro ao conectar ao Facebook. Tente novamente ou verifique as permissões do app."
    });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId, id: userId } = req.user;
  const { session } = req.query as QueryParams;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session, +userId);

  return res.status(200).json(whatsapp);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId, id: userId } = req.user;

  // Sanitização de dados críticos no update também
  if (whatsappData.token) whatsappData.token = whatsappData.token.trim();
  if (whatsappData.phone_number_id) whatsappData.phone_number_id = whatsappData.phone_number_id.trim();
  if (whatsappData.waba_id) whatsappData.waba_id = whatsappData.waba_id.trim();
  if (whatsappData.send_token) whatsappData.send_token = whatsappData.send_token.trim();

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId,
    requestUserId: +userId
  });

  const io = getIO();
  io.of(String(whatsapp.companyId)).emit(`company-${whatsapp.companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.of(String(oldDefaultWhatsapp.companyId)).emit(`company-${oldDefaultWhatsapp.companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const closedTickets = async (req: Request, res: Response) => {
  const { whatsappId } = req.params;

  closeTicketsImported(whatsappId);

  return res.status(200).json("whatsapp");
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId, profile, id: userId } = req.user;
  const io = getIO();

  if (profile !== "admin" && !req.user.super) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, undefined, +userId);

  if (whatsapp.channel === "whatsapp") {
    await DeleteBaileysService(whatsappId);
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
    removeWbot(+whatsappId);

    io.of(String(whatsapp.companyId)).emit(`company-${whatsapp.companyId}-whatsapp`, {
      action: "delete",
      whatsappId: +whatsappId
    });
  }

  if (whatsapp.channel === "whatsapp_oficial") {
    await Whatsapp.destroy({
      where: {
        id: +whatsappId
      }
    });

    try {
      await DeleteConnectionWhatsAppOficial(whatsapp.waba_webhook_id);
    } catch (error) {
      logger.info("ERROR", error);
    }

    io.of(String(whatsapp.companyId)).emit(`company-${whatsapp.companyId}-whatsapp`, {
      action: "delete",
      whatsappId: +whatsappId
    });
  }

  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({
      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    for await (const whatsapp of getAllSameToken) {
      io.of(String(whatsapp.companyId)).emit(`company-${whatsapp.companyId}-whatsapp`, {
        action: "delete",
        whatsappId: whatsapp.id
      });
    }
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id } = req.user;

  const user = await User.findByPk(id);
  const { allowConnections } = user;

  if (profile !== "admin" && allowConnections === "disabled") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await restartWbot(companyId);

  return res.status(200).json({ message: "Whatsapp restart." });
};

export const listAll = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListAllWhatsAppsService({ session });
  return res.status(200).json(whatsapps);
};

export const updateAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppServiceAdmin({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`admin-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.of(String(companyId)).emit(`admin-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const removeAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const io = getIO();
  console.log("REMOVING WHATSAPP ADMIN", whatsappId);
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (whatsapp.channel === "whatsapp") {
    await DeleteBaileysService(whatsappId);
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
    removeWbot(+whatsappId);

    io.of(String(companyId)).emit(`admin-whatsapp`, {
      action: "delete",
      whatsappId: +whatsappId
    });
  }

  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({
      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    for await (const whatsapp of getAllSameToken) {
      io.of(String(companyId)).emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: whatsapp.id
      });
    }
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export const showAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  // console.log("SHOWING WHATSAPP ADMIN", whatsappId)
  const whatsapp = await ShowWhatsAppServiceAdmin(whatsappId);

  return res.status(200).json(whatsapp);
};

export const syncTemplatesOficial = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { whatsappId } = req.params;

  const whatsapp = await Whatsapp.findByPk(whatsappId);

  if (whatsapp.companyId !== companyId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const data = await getTemplatesWhatsAppOficial(whatsapp.token);
  // console.log("CHEGOU NO SYNC", data)
  if (data.data.length > 0) {
    await Promise.all(
      data.data.map(async template => {
        const quickMessage = await QuickMessage.findOne({
          where: {
            metaID: template.id
          },
          include: [
            {
              model: QuickMessageComponent,
              as: "components"
            }
          ]
        });

        if (quickMessage) {
          await quickMessage.update({
            message: template.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || template.name,
            category: template.category,
            status: template.status,
            language: template.language
          });

          if (template?.components?.length > 0) {
            if (quickMessage?.components?.length > 0) {
              try {
                await QuickMessageComponent.destroy({
                  where: {
                    quickMessageId: quickMessage.id
                  }
                });
              } catch (error) {
                console.error(
                  "Error destroying QuickMessageComponents:",
                  error
                );
              }
            } else {
            }

            await Promise.all(
              template.components.map(async component => {
                await QuickMessageComponent.create({
                  quickMessageId: quickMessage.id,
                  type: component.type,
                  text: component.text,
                  buttons: JSON.stringify(component?.buttons),
                  format: component?.format,
                  example: JSON.stringify(component?.example)
                });
              })
            );
          }
        } else {
          const templateData = {
            shortcode: template.name,
            message: template.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || template.name,
            companyId: companyId,
            userId: userId,
            geral: true,
            isMedia: false,
            mediaPath: null,
            visao: true,
            isOficial: true,
            language: template.language,
            status: template.status,
            category: template.category,
            metaID: template.id,
            whatsappId: whatsapp.id
          };
          const qm = await CreateService(templateData);

          await Promise.all(
            template.components.map(async component => {
              await QuickMessageComponent.create({
                quickMessageId: qm.id,
                type: component.type,
                text: component.text,
                buttons: JSON.stringify(component?.buttons),
                format: component?.format,
                example: JSON.stringify(component?.example)
              });
            })
          );
        }
      })
    );
  }

  return res.status(200).json(data);
};