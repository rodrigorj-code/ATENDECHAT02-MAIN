import Ticket from "../../models/Ticket";
import { AgentProactiveTicketState } from "../../types/agentProactiveSettings";

export function getAgentProactiveState(ticket: Ticket): AgentProactiveTicketState {
  const dw = ticket.dataWebhook as Record<string, unknown> | null;
  const ap = dw?.agentProactive as AgentProactiveTicketState | undefined;
  return ap && typeof ap === "object" ? { ...ap } : {};
}

export function mergeAgentProactiveState(
  ticket: Ticket,
  patch: Partial<AgentProactiveTicketState>
): Record<string, unknown> {
  const dw = (ticket.dataWebhook || {}) as Record<string, unknown>;
  const prev = getAgentProactiveState(ticket);
  return {
    ...dw,
    agentProactive: {
      ...prev,
      ...patch
    }
  };
}
