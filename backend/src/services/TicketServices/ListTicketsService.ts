import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";

import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";
import ContactWallet from "../../models/ContactWallet";

import removeAccents from "remove-accents";

import FindCompanySettingOneService from "../CompaniesSettings/FindCompanySettingOneService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId: number;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  contacts?: number[];
  updatedStart?: string;
  updatedEnd?: string;
  connections?: string[];
  whatsappIds?: number[];
  statusFilters?: string[];
  queuesFilter?: string[];
  isGroup?: string;
  companyId: number;
  allTicket?: string;
  sortTickets?: string;
  searchOnMessages?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  contacts = [],
  status,
  date,
  dateStart,
  dateEnd,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages = "false",
  whatsappIds,
  statusFilters,
  companyId,
  sortTickets = "DESC",
  searchOnMessages = "false"
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId, companyId);

  const showTicketAllQueues = user.allHistoric === "enabled";
  const showTicketWithoutQueue = user.allTicket === "enable";
  const showGroups = user.allowGroup === true;
  const showPendingNotification = await FindCompanySettingOneService({ companyId, column: "showNotificationPending" });
  const showNotificationPendingValue =
    Array.isArray(showPendingNotification) && showPendingNotification.length > 0
      ? Boolean((showPendingNotification as any)[0]?.showNotificationPending)
      : false;
    let whereCondition: Filterable["where"];

  // Regra: A aba Aguardando deve sempre listar todas as conversas pendentes,
  // independente de filtros de fila/usuário. Para os demais status, mantém filtros.
  if (status === "pending") {
    whereCondition = {
      status: "pending",
      companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }
    };
  } else {
    // Manter lógica: mostrar tickets atendidos pelo usuário OU pendentes
    // Regra adicional: quando filtrando "open", exibir também tickets em open que estejam sob atendimento do Agente IA (isBot=true),
    // mesmo sem userId atribuído — assim a conversa permanece visível em "Atendendo" após resposta do agente.
    const baseOr: any = [{ userId }, { status: "pending" }];
    if (status === "open") {
      // Incluir tickets abertos do Agente IA (isBot) ou com integração ativa (useIntegration)
      baseOr.push({ status: "open", isBot: true });
      baseOr.push({ status: "open", useIntegration: true });
    }
    whereCondition = {
      [Op.or]: baseOr,
      queueId:
        status === "open"
          ? { [Op.or]: [queueIds, null] } // Em "Atendendo", permitir null para tickets do Agente IA
          : showTicketWithoutQueue
            ? { [Op.or]: [queueIds, null] }
            : { [Op.or]: [queueIds] },
      companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }
    };
  }


  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId", "isGroup", "remoteJid"],
      include: ["extraInfo", "tags",
        {
          model: ContactWallet,
          include: [
            {
              model: User,
              attributes: ["id", "name"]
            },
            {
              model: Queue,
              attributes: ["id", "name"]
            }
          ]
        }]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "expiresTicket", "groupAsTicket", "color"]
    },
  ];

  const userQueueIds = user.queues.map(queue => queue.id);

  if (status === "open") {
    whereCondition = {
      companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
      status: "open",
      [Op.or]: [
        { userId },                         // tickets atribuídos ao usuário atual
        { userId: null },                   // tickets abertos ainda sem atendente
        { isBot: true },                    // tickets sob Agente IA
        { useIntegration: true }            // tickets em integração ativa
      ],
      queueId: { [Op.or]: [queueIds, null] } // Atendendo deve exibir SEM FILA também
    };
  } else
    if (status === "group" && user.allowGroup && user.whatsappId) {
      whereCondition = {
        companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
        queueId: { [Op.or]: [queueIds, null] },
        whatsappId: user.whatsappId
      };
    }
    else
      if (status === "group" && (user.allowGroup) && !user.whatsappId) {
        whereCondition = {
          companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
          queueId: { [Op.or]: [queueIds, null] },
        };
      }
      else
        // NOVA LÓGICA PARA STATUS CHATBOT
        if (status === "chatbot") {
          // Para status chatbot, mostrar tickets que estão sendo processados pelo flowbuilder
          // Admins podem ver todos, usuários comuns só os seus ou os sem responsável
          if (user.profile === "admin" || showAll === "true" || user.super) {
            whereCondition = {
              companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
              status: "chatbot",
              queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : { [Op.or]: [queueIds] }
            };
          } else {
            whereCondition = {
              companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
              status: "chatbot",
              [Op.or]: [{ userId }, { userId: null }],
              queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : { [Op.or]: [queueIds] }
            };
          }
        }
        else
          if (user.profile === "user" && status === "pending" && showTicketWithoutQueue) {
            const TicketsUserFilter: any[] | null = [];

            let ticketsIds = [];

            if (!showTicketAllQueues) {
              ticketsIds = await Ticket.findAll({
                where: {
                  userId: { [Op.or]: [user.id, null] },
                  queueId: { [Op.or]: [queueIds, null] },
                  status: "pending",
                  companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }
                },
              });
            } else {
              ticketsIds = await Ticket.findAll({
                where: {
                  userId: { [Op.or]: [user.id, null] },
                  status: "pending",
                  companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }
                },
              });
            }

            if (ticketsIds) {
              TicketsUserFilter.push(ticketsIds.map(t => t.id));
            }

            const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

            whereCondition = {
              ...whereCondition,
              id: ticketsIntersection
            };
          }
          else
            if (user.profile === "user" && status === "pending" && !showTicketWithoutQueue) {
              const TicketsUserFilter: any[] | null = [];

              let ticketsIds = [];

              if (!showTicketAllQueues) {
                ticketsIds = await Ticket.findAll({
                  where: {
                    companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
                    userId:
                      { [Op.or]: [user.id, null] },
                    status: "pending",
                    queueId: { [Op.in]: queueIds }
                  },
                });
              } else {
                ticketsIds = await Ticket.findAll({
                  where: {
                    companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
                    [Op.or]:
                      [{
                        userId:
                          { [Op.or]: [user.id, null] }
                      },
                      {
                        status: "pending"
                      }
                      ],
                    status: "pending"
                  },
                });
              }
              if (ticketsIds) {
                TicketsUserFilter.push(ticketsIds.map(t => t.id));
              }

              const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

              whereCondition = {
                ...whereCondition,
                id: ticketsIntersection
              };
            }

  // Para Aguardando não restringir por userId; para Atendendo também não restringir,
  // pois tickets em open podem estar sob Agente IA/Integração ou ainda sem atendente.
  if (user.profile === "user" && !user.super && status !== "pending" && status !== "open") {
    whereCondition = {
      ...whereCondition,
      userId
    };
  }

  // Se for admin ou super, pode ver tudo se quiser
  if (showAll === "true" && (user.profile === "admin" || user.allUserChat === "enabled" || user.super) && status !== "search") {
     if (user.allHistoric === "enabled" && showTicketWithoutQueue) {
       whereCondition = { companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] } };
     } else if (user.allHistoric === "enabled" && !showTicketWithoutQueue) {
       whereCondition = { companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }, queueId: { [Op.ne]: null } };
     } else if (user.allHistoric === "disabled" && showTicketWithoutQueue) {
       whereCondition = { companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }, queueId: { [Op.or]: [queueIds, null] } };
     } else if (user.allHistoric === "disabled" && !showTicketWithoutQueue) {
       whereCondition = { companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] }, queueId: queueIds };
     }
  }


  if (status && status !== "search") {
    whereCondition = {
      ...whereCondition,
      status: showAll === "true" && status === "pending" ? { [Op.or]: [status, "lgpd"] } : status
    };
  }


  if (status === "closed") {
    let latestTickets;

    if (!showTicketAllQueues) {
      let whereCondition2: Filterable["where"] = {
        companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
        status: "closed",
      }

      // Se showAll === "true" E usuário tem permissão (admin ou allUserChat), mostrar todos
      if (showAll === "true" && (user.profile === "admin" || user.allUserChat === "enabled" || user.super)) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      } else {
        // Caso contrário, filtrar apenas os tickets do próprio usuário
        whereCondition2 = {
          ...whereCondition2,
          queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
          userId
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    } else {
      let whereCondition2: Filterable["where"] = {
        companyId: !user.super ? companyId : { [Op.or]: [companyId, { [Op.ne]: null }] },
        status: "closed",
      }

      // Se showAll === "true" E usuário tem permissão (admin ou allUserChat), mostrar todos
      if (showAll === "true" && (user.profile === "admin" || user.allUserChat === "enabled" || user.super)) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      } else {
        // Caso contrário, filtrar apenas os tickets do próprio usuário
        whereCondition2 = {
          ...whereCondition2,
          queueId: showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
          userId
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    }

    const ticketIds = latestTickets.map((t) => t.id);

    whereCondition = {
      id: ticketIds

    };
  }
  else
    if (status === "search") {
      whereCondition = {
        companyId
      }
      // Quando queueIds vem vazio (ex.: modal do lead), usar filas do usuário para não restringir demais
      const effectiveQueueIds = queueIds.length > 0 ? queueIds : userQueueIds;
      const searchBaseWhere: Filterable["where"] = {
        companyId,
        [Op.or]: [{ userId }, { status: ["pending", "closed", "group", "chatbot"] }],
        ...(Array.isArray(contacts) && contacts.length > 0 ? { contactId: { [Op.in]: contacts } } : {})
      };
      let latestTickets;
      if (!showTicketAllQueues && user.profile === "user") {
        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: {
            ...searchBaseWhere,
            queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [effectiveQueueIds, null] } : effectiveQueueIds
          },
          group: ['companyId', 'contactId', 'whatsappId'],
        });
      } else {
        let whereCondition2: Filterable["where"] = {
          ...searchBaseWhere
        }

        if (showAll === "false" && user.profile === "admin") {
          whereCondition2 = {
            ...whereCondition2,
            queueId: effectiveQueueIds,
          }

        } else if (showAll === "true" && user.profile === "admin") {
          whereCondition2 = {
            ...whereCondition2,
            companyId,
            queueId: { [Op.or]: [effectiveQueueIds, null] },
          }
        }

        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: whereCondition2,
          group: ['companyId', 'contactId', 'whatsappId'],
        });

      }

      const ticketIds = latestTickets.map((t) => t.id);

      whereCondition = {
        ...whereCondition,
        id: ticketIds
      };

      if (searchParam) {
        const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
        if (searchOnMessages === "true") {
          includeCondition = [
            ...includeCondition,
            {
              model: Message,
              as: "messages",
              attributes: ["id", "body"],
              where: {
                body: where(
                  fn("LOWER", fn('unaccent', col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                ),
              },
              required: false,
              duplicating: false
            }
          ];
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
              {
                "$message.body$": where(
                  fn("LOWER", fn("unaccent", col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              }
            ]
          };
        } else {
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
            ]
          };
        }

      }

      if (Array.isArray(tags) && tags.length > 0) {
        const contactTagFilter: any[] | null = [];
        const contactTags = await ContactTag.findAll({
          where: { tagId: tags }
        });
        if (contactTags) {
          contactTagFilter.push(contactTags.map(t => t.contactId));
        }

        const contactsIntersection: number[] = intersection(...contactTagFilter);

        whereCondition = {
          ...whereCondition,
          contactId: contactsIntersection
        };
      }

      if (Array.isArray(users) && users.length > 0) {
        whereCondition = {
          ...whereCondition,
          userId: users
        };
      }


      if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
        whereCondition = {
          ...whereCondition,
          whatsappId: whatsappIds
        };
      }

      if (Array.isArray(statusFilters) && statusFilters.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { [Op.in]: statusFilters }
        };
      }

    } else
      if (withUnreadMessages === "true") {
        whereCondition = {
          [Op.or]: [
            {
              userId,
              status: showNotificationPendingValue ? { [Op.notIn]: ["closed", "lgpd", "nps"] } : { [Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
              queueId: { [Op.in]: userQueueIds },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            },
            {
              status: showNotificationPendingValue ? { [Op.in]: ["pending", "group", "chatbot"] } : { [Op.in]: ["group", "chatbot"] }, // INCLUINDO CHATBOT
              queueId: showTicketWithoutQueue ? { [Op.or]: [userQueueIds, null] } : { [Op.or]: [userQueueIds] },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            }
          ]
        };

        if (status === "group" && (user.allowGroup || showAll === "true")) {
          whereCondition = {
            ...whereCondition,
            queueId: { [Op.or]: [userQueueIds, null] },
          };
        }
      }

  whereCondition = {
    ...whereCondition,
    companyId
  };

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    attributes: ["id", "uuid", "userId", "queueId", "isGroup", "channel", "status", "contactId", "useIntegration", "isBot", "lastMessage", "updatedAt", "unreadMessages"],
    distinct: true,
    limit,
    offset,
    order: [["updatedAt", sortTickets]],
    subQuery: false
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
