import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import { FindOptions, Op, Sequelize } from "sequelize";
import User from "../../models/User";
import FindCompanySettingsService from "../CompaniesSettings/FindCompanySettingsService";

export interface SearchContactParams {
  companyId: string | number;
  name?: string;
  userId?: number;
  tagId?: number;
}

const SimpleListService = async ({ name, companyId, userId, tagId }: SearchContactParams): Promise<Contact[]> => {

  let options: FindOptions = {
    order: [
      ['name', 'ASC']
    ],
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name"],
        through: { attributes: [] }
      }
    ]
  };

  // Verificar configurações da empresa e perfil do usuário para regra de carteira
  const userProfile = userId ? await User.findOne({ where: { id: userId }, attributes: ["profile"] }) : null;
  const settings = await FindCompanySettingsService({ companyId: Number(companyId) });
  const DirectTicketsToWallets = settings.DirectTicketsToWallets;

  let whereCondition: any = { companyId };

  if (tagId) {
    whereCondition[Op.and] = [
      ...(Array.isArray(whereCondition[Op.and]) ? whereCondition[Op.and] : []),
      Sequelize.literal(`id IN (SELECT "contactId" FROM "ContactTags" WHERE "tagId" = ${Number(tagId)})`)
    ];
  }

  if (name && name.trim()) {
    const term = `%${name.trim()}%`;
    const digits = name.trim().replace(/\D/g, "");
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: term } },
      ...(digits.length > 0 ? [{ number: { [Op.iLike]: `%${digits}%` } }] : [])
    ];
  }

  // Aplicar regra de carteira se o usuário tem perfil "user" e a configuração está ativa
  if (DirectTicketsToWallets && userProfile && userProfile.profile === "user" && userId) {
    whereCondition = {
      ...whereCondition,
      [Op.and]: [
        whereCondition,
        {
          id: {
            [Op.in]: Sequelize.literal(`(SELECT "contactId" FROM "ContactWallets" WHERE "walletId" = ${userId} AND "companyId" = ${companyId})`)
          }
        }
      ]
    };
  }

  options.where = whereCondition;

  const contacts = await Contact.findAll(options);

  if (!contacts) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contacts;
};

export default SimpleListService;
