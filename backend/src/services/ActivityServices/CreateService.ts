import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Activity from "../../models/Activity";
import Project from "../../models/Project";

interface Data {
  title: string;
  description?: string;
  type?: string;
  status?: string;
  date: Date;
  owner?: string;
  companyId: number;
  userId?: number;
  projectId?: number | null;
}

const CreateService = async (data: Data): Promise<Activity> => {
  const schema = Yup.object().shape({
    title: Yup.string()
      .min(3, "ERR_ACTIVITY_INVALID_TITLE")
      .required("ERR_ACTIVITY_REQUIRED_TITLE"),
    date: Yup.date().required("ERR_ACTIVITY_REQUIRED_DATE"),
    status: Yup.string()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const payload: any = {
    title: data.title,
    description: data.description,
    type: data.type,
    status: data.status || "pending",
    date: data.date,
    owner: data.owner,
    companyId: data.companyId
  };
  if (typeof data.userId !== "undefined") {
    payload.userId = data.userId;
  }
  if (data.projectId !== undefined) {
    payload.projectId = data.projectId;
  }

  const record = await Activity.create(payload);

  await record.reload({
    include: [{ model: Project, as: "project", attributes: ["id", "name"] }]
  });

  return record;
};

export default CreateService;

