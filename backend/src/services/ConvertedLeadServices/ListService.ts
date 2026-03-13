import { Op, Sequelize } from "sequelize";
import ConvertedLead from "../../models/ConvertedLead";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  sector?: string;
  responsibleId?: number | string;
  contactId?: number | string;
  dateStart?: string;
  dateEnd?: string;
  companyId: number;
}

interface Response {
  leads: ConvertedLead[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = 1,
  sector,
  responsibleId,
  contactId,
  dateStart,
  dateEnd,
  companyId
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const where: any = {
    companyId
  };

  if (searchParam) {
    const likeSearch = `%${searchParam}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: likeSearch } },
      { description: { [Op.iLike]: likeSearch } },
      { email: { [Op.iLike]: likeSearch } },
      { address: { [Op.iLike]: likeSearch } }
    ];
  }

  if (sector) {
    where.sector = sector;
  }
  if (responsibleId) {
    where.responsibleId = responsibleId;
  }
  if (contactId) {
    where.contactId = contactId;
  }
  if (dateStart && dateEnd) {
    where.date = {
      [Op.between]: [new Date(dateStart), new Date(dateEnd)]
    };
  }

  const { count, rows } = await ConvertedLead.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + rows.length;

  return {
    leads: rows,
    count,
    hasMore
  };
};

export default ListService;
