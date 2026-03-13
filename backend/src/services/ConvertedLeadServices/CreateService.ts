import ConvertedLead from "../../models/ConvertedLead";

interface Request {
  name: string;
  description?: string;
  email?: string;
  address?: string;
  sector?: string;
  contactId?: number | null;
  responsibleId?: number | null;
  date?: Date | string | null;
  companyId: number;
}

const CreateService = async (data: Request): Promise<ConvertedLead> => {
  const payload: any = {
    name: data.name,
    description: data.description || null,
    email: data.email || null,
    address: data.address || null,
    sector: data.sector || null,
    contactId: data.contactId || null,
    responsibleId: data.responsibleId || null,
    date: data.date ? new Date(data.date) : new Date(),
    companyId: data.companyId
  };

  const record = await ConvertedLead.create(payload);
  return record;
};

export default CreateService;
