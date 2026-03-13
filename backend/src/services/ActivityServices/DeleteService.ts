import Activity from "../../models/Activity";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number): Promise<void> => {
  const record = await Activity.findOne({
    where: { id }
  });

  if (!record) {
    throw new AppError("ERR_NO_ACTIVITY_FOUND", 404);
  }

  await record.destroy();
};

export default DeleteService;

