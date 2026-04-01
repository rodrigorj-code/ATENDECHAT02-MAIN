import { Op } from "sequelize";
import Plan from "../../models/Plan";

/**
 * @param listPublic legacy: "false" means only isPublic plans (public registration catalog)
 * @param paidOnly when true: isPublic and not trial (conversion / upgrade)
 */
const FindAllPlanService = async (
  listPublic?: string,
  paidOnly?: boolean
): Promise<Plan[]> => {
  if (paidOnly) {
    return Plan.findAll({
      where: {
        isPublic: true,
        [Op.or]: [{ trial: false }, { trial: null }]
      },
      order: [["name", "ASC"]]
    });
  }

  if (listPublic === "false") {
    return Plan.findAll({
      where: {
        isPublic: true
      },
      order: [["name", "ASC"]]
    });
  }

  return Plan.findAll({
    order: [["name", "ASC"]]
  });
};

export default FindAllPlanService;
