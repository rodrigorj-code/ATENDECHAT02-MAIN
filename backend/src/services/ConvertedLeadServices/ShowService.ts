import ConvertedLead from "../../models/ConvertedLead";

const ShowService = async (id: number | string): Promise<ConvertedLead> => {
  const record = await ConvertedLead.findByPk(id as any);
  if (!record) {
    throw new Error("Converted lead not found");
  }
  return record;
};

export default ShowService;
