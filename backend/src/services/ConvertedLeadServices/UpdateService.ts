import ConvertedLead from "../../models/ConvertedLead";

interface Request {
  id: number | string;
  name?: string;
  description?: string;
  email?: string;
  address?: string;
  sector?: string;
  contactId?: number | null;
  responsibleId?: number | null;
  date?: Date | string | null;
}

const UpdateService = async (data: Request): Promise<ConvertedLead> => {
  const record = await ConvertedLead.findByPk(data.id as any);
  if (!record) {
    throw new Error("Converted lead not found");
  }

  const payload: any = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.email !== undefined) payload.email = data.email;
  if (data.address !== undefined) payload.address = data.address;
  if (data.sector !== undefined) payload.sector = data.sector;
  if (data.contactId !== undefined) payload.contactId = data.contactId;
  if (data.responsibleId !== undefined) payload.responsibleId = data.responsibleId;
  if (data.date !== undefined) payload.date = data.date ? new Date(data.date) : null;

  await record.update(payload);
  return record;
};

export default UpdateService;
