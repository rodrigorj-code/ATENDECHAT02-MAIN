import LeadSale from "../../models/LeadSale";

const DeleteService = async (id: number | string): Promise<void> => {
  const record = await LeadSale.findByPk(id as any);
  if (!record) {
    throw new Error("Lead sale not found");
  }
  await record.destroy();
};

export default DeleteService;

