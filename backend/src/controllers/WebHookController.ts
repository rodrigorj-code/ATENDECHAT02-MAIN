// Ajustes de tipagem e dependências para evitar erros de compilação
declare const process: any;
declare module "crypto";
const cryptoMod: any = (() => {
  try {
    // carrega crypto de forma dinâmica, evitando erro de tipagem em ambientes sem @types/node
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("crypto");
  } catch {
    return null;
  }
})();
import Whatsapp from "../models/Whatsapp";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";

export const index = async (req: any, res: any): Promise<any> => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    // Debug forte: confirmar se o endpoint está sendo atingido pelo Meta
    try {
      console.log("[MetaWebhook][ENTRY]", {
        method: req.method,
        path: req.path,
        hasBody: !!req.body,
        bodyObject: req?.body?.object,
        sigHeaderPresent: !!req.headers?.["x-hub-signature-256"],
        rawBodyType: typeof (req as any).rawBody,
        hasAppSecret: !!process.env.FACEBOOK_APP_SECRET
      });
    } catch {
      // ignore
    }

    // Verificação opcional de assinatura do webhook (X-Hub-Signature-256)
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const signatureHeader = (req.headers["x-hub-signature-256"] || "") as string;
    // Debug: em ambiente de desenvolvimento, ignorar assinatura para descobrir se o webhook está chegando.
    // (Em produção, mantemos a validação para segurança.)
    if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
      if (cryptoMod && appSecret && signatureHeader && typeof (req as any).rawBody === "string") {
        const expected =
          "sha256=" + cryptoMod.createHmac("sha256", appSecret).update((req as any).rawBody).digest("hex");
        if (expected !== signatureHeader) {
          try {
            console.log("[MetaWebhook][SIG_MISMATCH]", {
              expectedPrefix: expected?.slice(0, 16),
              receivedPrefix: signatureHeader?.slice(0, 16),
            });
          } catch {
            // ignore
          }
          return res.status(403).json({ message: "Invalid signature" });
        }
      }
    } else {
      try {
        if (signatureHeader) {
          console.log("[MetaWebhook][SIG_SKIP]", { nodeEnv: process.env.NODE_ENV, sigPrefix: signatureHeader.slice(0, 16) });
        } else {
          console.log("[MetaWebhook][SIG_SKIP]", { nodeEnv: process.env.NODE_ENV, sigHeaderPresent: false });
        }
      } catch {
        // ignore
      }
    }

    const { body } = req;
    // Debug básico para confirmar se o webhook Meta está chegando
    try {
      const obj = body?.object;
      const entryIds = Array.isArray(body?.entry) ? body.entry.map((e: any) => e?.id).slice(0, 5) : [];
      console.log("[MetaWebhook]", { object: obj, entryIds });
    } catch {
      // ignore
    }
    if (body.object === "page" || body.object === "instagram") {
      let channel: string;

      if (body.object === "page") {
        channel = "facebook";
      } else {
        channel = "instagram";
      }

      body.entry?.forEach(async (entry: any) => {
        const getTokenPage = await (Whatsapp as any).findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        if (Array.isArray(entry.messaging)) {
          // Facebook (page) envia eventos em entry.messaging
          if (!getTokenPage) return;
          entry.messaging.forEach((data: any) => {
            handleMessage(getTokenPage, data, channel, getTokenPage.companyId);
          });
        }

        // Suporte a Instagram: eventos vêm em entry.changes[].value
        if (channel === "instagram" && Array.isArray(entry.changes)) {
          const findTokenByIds = async (candidateId: string | undefined) => {
            if (!candidateId) return null;

            // 1) Tenta como instagram
            const tokenInstagram = await (Whatsapp as any).findOne({
              where: { facebookPageUserId: candidateId, channel: "instagram" }
            });
            if (tokenInstagram) return tokenInstagram;

            // 2) Fallback: às vezes o id do payload bate com a conexão facebook,
            // mas ainda queremos criar ticket com channel="instagram".
            const tokenFacebook = await (Whatsapp as any).findOne({
              where: { facebookPageUserId: candidateId, channel: "facebook" }
            });
            if (tokenFacebook) return tokenFacebook;

            return null;
          };

          entry.changes.forEach((chg: any) => {
            if (chg?.field !== "messages" || !chg?.value) return;

            const v = chg.value;

            // Alguns payloads vêm como "value" (objeto único) ou como "value.messages" (array).
            const messageItems: any[] = Array.isArray(v?.messages)
              ? v.messages
              : [v];

            messageItems.forEach((item: any) => {
              const senderId = item?.sender?.id || item?.from?.id;
              const recipientId = item?.recipient?.id || item?.to?.id;
              const timestamp = item?.timestamp;
              const messageObj = item?.message || item?.messages || item;

              // Resolve a conexão/token para cada mensagem (fallback por recipientId).
              // Se não existir conexão, ignora o evento.
              (async () => {
                const token =
                  getTokenPage ||
                  (await findTokenByIds(recipientId)) ||
                  (await findTokenByIds(entry?.id));

                if (!token) return;

                const normalized = {
                  sender: { id: senderId },
                  recipient: { id: recipientId },
                  timestamp,
                  message: messageObj
                };

                // Log leve para debug de payload Instagram
                try {
                  const textPreview =
                    typeof messageObj?.text === "string" ? messageObj.text.slice(0, 60) : null;
                  console.log("[InstagramWebhook]", {
                    entryId: entry?.id,
                    channel,
                    senderId,
                    recipientId,
                    tokenFacebookPageUserId: token?.facebookPageUserId,
                    tokenChannel: token?.channel,
                    messageHasText: !!textPreview,
                    messageTextPreview: textPreview
                  });
                } catch {
                  // ignore log errors
                }

                handleMessage(token, normalized, channel, token.companyId);
              })();
            });
          });
        }
      });

      return res.status(200).json({
        message: "EVENT_RECEIVED"
      });
    }

    return res.status(404).json({
      message: body
    });
  } catch (error) {
    return res.status(500).json({
      message: error
    });
  }
};
