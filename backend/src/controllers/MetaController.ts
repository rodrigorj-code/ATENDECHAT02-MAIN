import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import { ReceibedWhatsAppService } from "../services/WhatsAppOficial/ReceivedWhatsApp";
import logger from "../utils/logger";
import axios from "axios";
import Message from "../models/Message";
import { getIO } from "../libs/socket";

export const verify = async (req: Request, res: Response): Promise<Response> => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const { connectionId } = req.params;

  const whatsapp = await Whatsapp.findByPk(connectionId);

  if (!whatsapp) {
    return res.status(404).json({ message: "Connection not found" });
  }

  // O token de verificação deve ser o mesmo salvo na conexão (token) ou um valor fixo definido por você
  // Aqui assumimos que o token salvo no whatsapp.token é o token da API (Bearer), 
  // então vamos usar o ID da conexão ou um valor específico para validação do webhook se necessário.
  // Mas geralmente, o 'verify_token' é configurado na Meta e deve bater com o esperado aqui.
  // Vamos usar o 'token' da conexão como validador ou aceitar se bater com o ID.
  
  // Validação Simplificada para Debug
  // Aceita se o token bater OU se o token enviado for o padrão "vbzappy-token-bypass"
  if (mode === "subscribe" && (token === whatsapp.token || token === "vbzappy-token-bypass")) {
    console.log("WEBHOOK VALIDADO COM SUCESSO!");
    return res.status(200).send(challenge);
  } else {
    console.log("===================================");
    console.log("FALHA NA VALIDAÇÃO DO WEBHOOK");
    console.log("Mode:", mode);
    console.log("Token recebido:", token);
    console.log("Token esperado (DB):", whatsapp.token);
    console.log("===================================");
  }

  return res.status(403).json({ message: "Forbidden" });
};

export const handleMessage = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, connectionId } = req.params;
  const body = req.body;

  // LOG COMPLETO DO PAYLOAD (Para debug de envio/recebimento)
  console.log(`[Meta Webhook] Payload recebido na Company ${companyId}:`, JSON.stringify(body, null, 2));

  try {
    if (body.object === "whatsapp_business_account") {
      if (!body.entry || body.entry.length === 0) {
        return res.status(200).send("EVENT_RECEIVED");
      }

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          const whatsapp = await Whatsapp.findByPk(connectionId);
          if (!whatsapp) continue;

          const receivedService = new ReceibedWhatsAppService();

          // 1. STATUS DE MENSAGENS (SENT, DELIVERED, READ)
          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              console.log(`[Meta Webhook] Status Update: ${status.status} para msg ${status.id}`);
              
              try {
                const message = await Message.findOne({
                  where: { wid: status.id, companyId }
                });

                if (message) {
                  let ack = 0;
                  if (status.status === 'sent') ack = 1;
                  if (status.status === 'delivered') ack = 2;
                  if (status.status === 'read') ack = 3;
                  if (status.status === 'failed') ack = -1;

                  if (ack !== 0 && (ack > message.ack || ack === -1)) {
                    await message.update({ ack });

                    const io = getIO();
                    io.to(`tenant:${companyId}:status`).emit(`company-${companyId}-appMessage`, {
                      action: "update",
                      message
                    });
                    
                    console.log(`[Meta Webhook] Mensagem ${status.id} atualizada para ACK: ${ack}`);
                  }
                }
              } catch (err) {
                console.error(`[Meta Webhook] Erro ao atualizar status:`, err);
              }
            }
          }

          // 2. MENSAGENS RECEBIDAS
          if (value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const contact = value.contacts ? value.contacts[0] : null;

            const messageType = message.type;
            let convertedMessage: any = {
              type: messageType,
              timestamp: message.timestamp,
              idMessage: message.id,
            };

            if (messageType === "text") {
              convertedMessage.text = message.text.body;
            } else if (
              messageType === "image" || 
              messageType === "video" || 
              messageType === "audio" || 
              messageType === "document" || 
              messageType === "sticker"
            ) {
              const mediaId = message[messageType].id;
              const mimeType = message[messageType].mime_type;
              
              convertedMessage.idFile = mediaId;
              convertedMessage.mimeType = mimeType;

              try {
                const response = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
                  headers: {
                    Authorization: `Bearer ${whatsapp.token}`
                  }
                });
                
                if (response.data && response.data.url) {
                  convertedMessage.fileUrl = response.data.url;
                  convertedMessage.fileSize = response.data.file_size; // Meta retorna file_size aqui? Sim, geralmente.
                }
              } catch (err) {
                logger.error(`[META CONTROLLER] Falha ao buscar URL da mídia ${mediaId}: ${err}`);
              }
            } else if (messageType === "interactive") {
              convertedMessage.text = message.interactive.button_reply ? message.interactive.button_reply.id : (message.interactive.list_reply ? message.interactive.list_reply.id : "");
            }

            // Tratamento básico para texto
            await receivedService.getMessage({
              token: whatsapp.token,
              fromNumber: message.from,
              nameContact: contact ? contact.profile.name : message.from,
              companyId: parseInt(companyId),
              message: convertedMessage
            });
          }
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
