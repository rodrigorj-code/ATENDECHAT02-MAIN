import Activity from "../../models/Activity";
import AppError from "../../errors/AppError";

const ShowService = async (id: string | number): Promise<Activity> => {
  const record = await Activity.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_ACTIVITY_FOUND", 404);
  }

  return record;
};

export default ShowService;

