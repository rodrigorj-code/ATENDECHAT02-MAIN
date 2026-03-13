import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Chatbot from "../../models/Chatbot";
import { FindOptions } from "sequelize/types";
import Prompt from "../../models/Prompt";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import User from "../../models/User";
import ListSettingsServiceOne from "../SettingServices/ListSettingsServiceOne";

const ShowWhatsAppService = async (
  id: string | number,
  companyId: number,
  session?: any,
  requestUserId?: number
): Promise<Whatsapp> => {
  const findOptions: FindOptions = {
    include: [
      {
        model: FlowBuilderModel,
      },
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage", "integrationId", "fileListId", "closeTicket"],
        include: [
          {
            model: Chatbot,
            as: "chatbots",
            attributes: ["id", "name", "greetingMessage", "closeTicket"]
          }
        ]
      },
      {
        model: Prompt,
        as: "prompt",
      }
    ],
    order: [
      ["queues", "orderQueue", "ASC"],
      ["queues", "chatbots", "id", "ASC"]
    ]
  };

  if (session !== undefined && session == 0) {
    findOptions.attributes = { exclude: ["session"] };
  }

  const whatsapp = await Whatsapp.findByPk(id, findOptions);

  let requestUser: User | null = null;
  if (requestUserId) {
    requestUser = await User.findByPk(requestUserId);
  }

  if (!requestUser?.super && whatsapp?.companyId !== companyId) {
    throw new AppError("Não é possível acessar registros de outra empresa");
  }

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  // Computar campo virtual useAgentSettings: quando não há Prompt, existe configuração global de agente
  // e a conexão NÃO está com agente desabilitado explicitamente
  try {
    if (whatsapp && !whatsapp.getDataValue("promptId") && (whatsapp as any).getDataValue("agentDisabled") !== true) {
      const agentIntegration = await ListSettingsServiceOne({ companyId: whatsapp.companyId, key: "agent_integration" });
      const hasKey = !!agentIntegration?.value && (() => {
        try {
          const v = typeof agentIntegration.value === "string" ? JSON.parse(agentIntegration.value as any) : agentIntegration.value;
          return !!v?.apiKey;
        } catch {
          return false;
        }
      })();
      (whatsapp as any).setDataValue("useAgentSettings", hasKey);
    } else if ((whatsapp as any).getDataValue("agentDisabled") === true) {
      (whatsapp as any).setDataValue("useAgentSettings", false);
    }
  } catch {}

  return whatsapp;
};

export default ShowWhatsAppService;
