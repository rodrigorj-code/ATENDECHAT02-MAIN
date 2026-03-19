import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import Prompt from "../../models/Prompt";

interface Request {
  companyId: number;
  session?: number | string;
  isSuper?: boolean;
}

const backfillInstagramPlaceholders = async (companyId: number): Promise<void> => {
  // Para cada conexão `facebook` garantir uma conexão `instagram`.
  // Ajuda quando o Graph não retorna o `instagram_business_account` e o UI não mostra o ícone.
  const facebookWhatsapps = await Whatsapp.findAll({
    where: { companyId, channel: "facebook" },
    attributes: [
      "facebookPageUserId",
      "facebookUserId",
      "facebookUserToken",
      "tokenMeta"
    ],
    raw: true
  });

  if (!facebookWhatsapps.length) return;

  const pageIds = facebookWhatsapps
    .map((w: any) => w.facebookPageUserId)
    .filter((id: any) => !!id);

  if (!pageIds.length) return;

  const existingInsta = await Whatsapp.findAll({
    where: { companyId, channel: "instagram", facebookPageUserId: pageIds },
    attributes: ["facebookPageUserId"],
    raw: true
  });

  const existingSet = new Set(
    existingInsta.map((w: any) => String(w.facebookPageUserId))
  );

  const missing = facebookWhatsapps.filter(
    (w: any) => !existingSet.has(String(w.facebookPageUserId))
  );

  if (!missing.length) return;

  await Promise.all(
    missing.map((w: any) =>
      Whatsapp.create({
        name: `Instagram_${companyId}_${w.facebookPageUserId}`,
        status: "CONNECTED",
        companyId,
        channel: "instagram",
        facebookUserId: w.facebookUserId,
        facebookUserToken: w.facebookUserToken,
        facebookPageUserId: w.facebookPageUserId,
        tokenMeta: w.tokenMeta || null,
        greetingMessage: "",
        farewellMessage: "",
        isDefault: false,
        plugged: false,
        battery: "",
        retries: 0,
        groupAsTicket: "disabled",
        agentDisabled: true
      } as any)
    )
  );
};

const ListWhatsAppsService = async ({
  session,
  companyId,
  isSuper
}: Request): Promise<Whatsapp[]> => {
  const whereCondition: any = {};
  
  if (!isSuper) {
    whereCondition.companyId = companyId;
  }

  const options: FindOptions = {
    where: whereCondition,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      },
      {
        model: Prompt,
        as: "prompt",
      }
    ]
  };

  if (session !== undefined && session == 0) {
    options.attributes = { exclude: ["session"] };
  }

  if (!isSuper) {
    await backfillInstagramPlaceholders(companyId);
  }

  let whatsapps = await Whatsapp.findAll(options);

  if (!isSuper && whatsapps?.length) {
    // Quando existir conexão "instagram" para uma mesma Page (facebookPageUserId),
    // mostramos apenas a conexão instagram na lista para o usuário,
    // evitando parecer que "duplicou".
    const instagramPageIds = new Set(
      whatsapps
        .filter((w: any) => w.channel === "instagram" && w.facebookPageUserId)
        .map((w: any) => String(w.facebookPageUserId))
    );

    if (instagramPageIds.size > 0) {
      whatsapps = whatsapps.filter((w: any) => {
        if (w.channel !== "facebook") return true;
        if (!w.facebookPageUserId) return true;
        return !instagramPageIds.has(String(w.facebookPageUserId));
      });
    }
  }

  return whatsapps;
};



export default ListWhatsAppsService;
