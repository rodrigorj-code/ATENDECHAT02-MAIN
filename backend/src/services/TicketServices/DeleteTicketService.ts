import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import CreateLogTicketService from "./CreateLogTicketService";
import User from "../../models/User";

const DeleteTicketService = async (id: string, userId: string, companyId: number, requestUserId?: number): Promise<Ticket> => {
  let requestUser: User | null = null;
  if (requestUserId) {
    requestUser = await User.findByPk(requestUserId);
  }

  const whereCondition: any = { id };

  if (!requestUser?.super) {
    whereCondition.companyId = companyId;
  }

  const ticket = await Ticket.findOne({
    where: whereCondition
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await ticket.destroy();

  return ticket;
};

export default DeleteTicketService;
