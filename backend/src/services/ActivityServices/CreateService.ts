import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Activity from "../../models/Activity";

interface Data {
  title: string;
  description?: string;
  type?: string;
  status?: string;
  date: Date;
  owner?: string;
  companyId: number;
  userId?: number;
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

  const record = await Activity.create(payload);

  return record;
};

export default CreateService;

