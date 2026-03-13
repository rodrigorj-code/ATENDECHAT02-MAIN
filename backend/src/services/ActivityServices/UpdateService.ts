import AppError from "../../errors/AppError";
import Activity from "../../models/Activity";

interface Data {
  id: number | string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  date?: Date;
  owner?: string;
  userId?: number;
}

const UpdateService = async (data: Data): Promise<Activity> => {
  const { id } = data;

  const record = await Activity.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_ACTIVITY_FOUND", 404);
  }

  await record.update(data);

  return record;
};

export default UpdateService;

