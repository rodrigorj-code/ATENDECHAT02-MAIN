import LeadSale from "../../models/LeadSale";
import LeadPipeline from "../../models/LeadPipeline";

interface Request {
  name: string;
  description?: string;
  status?: string;
  value?: number;
  pipelineId?: number;
  companyName?: string;
  phone?: string;
  site?: string;
  origin?: string;
  document?: string;
  birthDate?: string | Date;
  address?: any;
  tags?: string[];
  contactId?: number;
  responsibleId?: number;
  date?: string | Date;
  companyId: number;
}

const CreateService = async ({
  name,
  description,
  status = "novo",
  value = 0,
  companyName,
  phone,
  site,
  origin,
  document,
  birthDate,
  address,
  tags,
  contactId,
  responsibleId,
  date,
  pipelineId,
  companyId
}: Request): Promise<LeadSale> => {
  let finalPipelineId = pipelineId;
  if (finalPipelineId === undefined || finalPipelineId === null) {
    const first = await LeadPipeline.findOne({ where: { companyId }, order: [["id", "ASC"]] });
    if (first) finalPipelineId = first.id as any;
  }

  const record = await LeadSale.create({
    name,
    description,
    status,
    value,
    pipelineId: finalPipelineId as any,
    companyName,
    phone,
    site,
    origin,
    document,
    birthDate: birthDate ? new Date(birthDate as any) : null,
    address,
    tags,
    contactId,
    responsibleId,
    date: date ? new Date(date) : null,
    companyId
  } as any);
  return record;
};

export default CreateService;
