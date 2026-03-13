import { Op } from "sequelize";
import Activity from "../../models/Activity";
import Company from "../../models/Company";
import Project from "../../models/Project";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  dateStart?: string;
  dateEnd?: string;
  companyId: number;
}

interface Response {
  activities: Activity[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  dateStart,
  dateEnd,
  companyId
}: Request): Promise<Response> => {
  const where: any = {
    companyId
  };

  if (searchParam) {
    const like = `%${searchParam}%`;
    where[Op.or] = [
      {
        title: {
          [Op.like]: like
        }
      },
      {
        description: {
          [Op.like]: like
        }
      }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (dateStart || dateEnd) {
    const range: any = {};

    if (dateStart) {
      range[Op.gte] = new Date(dateStart);
    }

    if (dateEnd) {
      range[Op.lte] = new Date(dateEnd);
    }

    where.date = range;
  }

  const limit = 20;
  const page = Number(pageNumber) || 1;
  const offset = limit * (page - 1);

  try {
    const { count, rows } = await Activity.findAndCountAll({
      where,
      limit,
      offset,
      order: [
        ["date", "DESC"],
        ["id", "DESC"]
      ],
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Project, as: "project", attributes: ["id", "name"] }
      ]
    });

    const hasMore = count > offset + rows.length;

    return {
      activities: rows,
      count,
      hasMore
    };
  } catch (err: any) {
    const code = err?.original?.code;
    const message = String(err?.message || "").toLowerCase();

    if (
      code === "42P01" ||
      message.includes("no such table") &&
      message.includes("activities")
    ) {
      return {
        activities: [],
        count: 0,
        hasMore: false
      };
    }

    throw err;
  }
};

export default ListService;
