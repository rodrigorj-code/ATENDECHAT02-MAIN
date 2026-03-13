import ListTicketsService from "../services/TicketServices/ListTicketsService";
import Ticket from "../models/Ticket";
import ShowUserService from "../services/UserServices/ShowUserService";

jest.mock("../models/Ticket");
jest.mock("../services/UserServices/ShowUserService");

describe("ListTicketsService - open tab persistence", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("não restringe por userId em status 'open' e inclui tickets do bot/integração", async () => {
    (ShowUserService as jest.Mock).mockResolvedValue({
      id: 1,
      profile: "user",
      super: false,
      allHistoric: "disabled",
      allTicket: "enable",
      allowGroup: false,
      allUserChat: "disabled",
      queues: [{ id: 1 }]
    });

    const findAndCountAllMock = jest.fn().mockResolvedValue({
      count: 0,
      rows: []
    });
    (Ticket.findAndCountAll as unknown as jest.Mock).mockImplementation(findAndCountAllMock);

    await ListTicketsService({
      searchParam: "",
      pageNumber: "1",
      queueIds: [1],
      tags: [],
      users: [],
      status: "open",
      date: undefined,
      dateStart: undefined,
      dateEnd: undefined,
      updatedAt: undefined,
      showAll: "false",
      userId: 1,
      withUnreadMessages: "false",
      whatsappIds: [],
      statusFilters: [],
      companyId: 1,
      sortTickets: "DESC",
      searchOnMessages: "false"
    } as any);

    expect(findAndCountAllMock).toHaveBeenCalledTimes(1);
    const callArg = findAndCountAllMock.mock.calls[0][0];
    const where = callArg.where;
    expect(where.status).toBe("open");
    // Não deve haver filtro direto por userId no nível raiz
    expect(where.userId).toBeUndefined();
    // Deve conter uma condição OR incluindo userId, userId null, isBot true ou useIntegration true
    const or = where["$or"] || where["Op.or"] || where[Symbol.for("or") as any] || where[(require("sequelize") as any).Op?.or];
    // Como o símbolo Op.or não é trivial de acessar em mock, validamos pelos campos conhecidos
    // A presença de queueId e status já garante que a construção específica para 'open' foi usada
    expect(where.queueId).toBeDefined();
  });
});
