import { Op, Sequelize } from "sequelize";
import moment from "moment";
import sequelize from "../../database";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";

export type ListCompaniesFilters = {
  nature?: "all" | "freemium" | "cadastro_gratis";
  dateFrom?: string;
  dateTo?: string;
  uf?: string;
};

const cadastroGratisOr = [
  { recurrence: "freemium" },
  Sequelize.literal(
    `(COALESCE("Company"."signupMetadata"->>'signupSource','') = 'freemium')`
  ),
  Sequelize.literal(
    `EXISTS (SELECT 1 FROM "Subscriptions" s WHERE s."companyId" = "Company"."id" AND s."providerSubscriptionId" = 'freemium_starter')`
  )
];

const FindAllCompaniesService = async (
  filters?: ListCompaniesFilters
): Promise<Company[]> => {
  const f = filters || {};
  const conditions: any[] = [];

  if (f.dateFrom || f.dateTo) {
    const createdAt: any = {};
    if (f.dateFrom) {
      createdAt[Op.gte] = moment(f.dateFrom).startOf("day").toDate();
    }
    if (f.dateTo) {
      createdAt[Op.lte] = moment(f.dateTo).endOf("day").toDate();
    }
    conditions.push({ createdAt });
  }

  if (f.uf && /^[A-Za-z]{2}$/.test(String(f.uf).trim())) {
    const uf = String(f.uf).trim().toUpperCase();
    conditions.push(
      Sequelize.literal(
        `(COALESCE("Company"."signupMetadata"#>>'{address,uf}','') = ${sequelize.escape(
          uf
        )})`
      )
    );
  }

  if (f.nature === "freemium") {
    conditions.push({ recurrence: "freemium" });
  } else if (f.nature === "cadastro_gratis") {
    conditions.push({ [Op.or]: cadastroGratisOr });
  }

  const where =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { [Op.and]: conditions };

  const companies = await Company.findAll({
    where,
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "planId",
      "status",
      "dueDate",
      "recurrence",
      "document",
      "paymentMethod",
      "generateInvoice",
      "createdAt",
      "lastLogin",
      "signupMetadata",
      "whiteLabelHostDomain"
    ],
    order: [["name", "ASC"]],
    include: [
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] },
      { model: Setting, as: "settings" }
    ]
  });
  return companies;
};

export default FindAllCompaniesService;
