import AppError from "../../errors/AppError";
import Activity from "../../models/Activity";
import Project from "../../models/Project";

interface Data {
  id: number | string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  date?: Date;
  owner?: string;
  userId?: number;
  projectId?: number | null;
}

const UpdateService = async (data: Data): Promise<Activity> => {
  const { id } = data;

  const record = await Activity.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_ACTIVITY_FOUND", 404);
  }

  await record.update(data);

  await record.reload({
    include: [{ model: Project, as: "project", attributes: ["id", "name"] }]
  });

  return record;
};

export default UpdateService;

