/**
 * Botões rápidos para preencher objetivo e tom por tipo de fluxo (proatividade).
 * Cada item: { label, text } — o texto é acrescentado ao campo existente.
 */

export const QUICK_OBJECTIVES = {
  follow_up: [
    { label: "Retomar sem pressão", text: "Conseguir uma resposta amigável, sem cobrar." },
    { label: "Confirmar interesse", text: "Validar se ainda faz sentido continuar a conversa." },
    { label: "Oferecer material", text: "Enviar ou relembrar PDF/link útil alinhado ao que já falaram." },
    { label: "Marcar próximo passo", text: "Combinar data para ligação breve ou demo." }
  ],
  hot_lead: [
    { label: "Fechar próximo passo", text: "Levar para proposta, demo ou pagamento conforme o caso." },
    { label: "Qualificar rápido", text: "Confirmar necessidade, orçamento e prazo em poucas perguntas." },
    { label: "Enviar valores", text: "Apresentar condições claras e pedir confirmação." },
    { label: "Agendar humano", text: "Transferir ou marcar falar com consultor/vendedor." }
  ],
  reengagement: [
    { label: "Novo gancho", text: "Trazer novidade (produto, case, campanha) sem culpar o silêncio." },
    { label: "Última tentativa", text: "Mensagem honesta perguntando se ainda há interesse." },
    { label: "Oferta leve", text: "Relembrar benefício e convidar a retomar em uma linha." }
  ],
  cold_outreach: [
    { label: "Abrir diálogo", text: "Só gerar curiosidade e uma pergunta — sem pitch longo." },
    { label: "Dor do segmento", text: "Mencionar desafio comum do ramo e convidar a trocar ideia." },
    { label: "Prova social", text: "Citar que atende empresas parecidas, sem exagero." }
  ],
  inbound: [
    { label: "Qualificar", text: "Entender necessidade, prazo e orçamento em poucas perguntas." },
    { label: "Agendar", text: "Conduzir para marcar reunião ou demo com data sugerida." },
    { label: "Enviar link", text: "Apresentar solução e convidar a pagar ou acessar link oficial." },
    { label: "Suporte + upsell", text: "Resolver dúvida e, se couber, sugerir upgrade ou add-on." }
  ]
};

export const QUICK_TONES = {
  follow_up: [
    { label: "Sem cobrança", text: "Nunca usar tom de cobrança, culpa ou urgência falsa." },
    { label: "Uma pergunta", text: "Terminar com uma pergunta aberta simples." },
    { label: "Sem repetir", text: "Não repetir a mesma frase do último envio." },
    { label: "Tom humano", text: "Linguagem natural; evitar jargões e textos longos." }
  ],
  hot_lead: [
    { label: "Claro e direto", text: "Ser objetivo em valor e próximo passo, sem enrolação." },
    { label: "Sem promessa vaga", text: "Evitar 'melhor solução do mercado' sem contexto." },
    { label: "Respeitar opt-out", text: "Se o cliente recusar, aceitar sem insistência extra." }
  ],
  reengagement: [
    { label: "Sem culpar", text: "Não dizer que o cliente 'sumiu' ou 'não respondeu'." },
    { label: "Ângulo novo", text: "Trazer informação diferente da última mensagem." }
  ],
  cold_outreach: [
    { label: "Sem venda na 1ª linha", text: "Não abrir com preço ou pedido de compra." },
    { label: "Curto", text: "Máximo de poucas linhas na primeira mensagem." },
    { label: "LGPD", text: "Não afirmar dados que não tem; permitir sair da lista se pedir." }
  ],
  inbound: [
    { label: "Alinhar ao Cargo", text: "Manter o tom da aba Cargo; não contradizer identidade do agente." },
    { label: "Uma pergunta por vez", text: "Evitar lista longa de perguntas na mesma mensagem." },
    { label: "CTA claro", text: "Encerrar com próximo passo único (link, horário ou confirmação)." }
  ]
};

export function appendToField(prevText, snippetText, sep = "\n") {
  const p = String(prevText || "").trim();
  const s = String(snippetText || "").trim();
  if (!s) return p;
  if (!p) return s;
  return `${p}${sep}${s}`;
}
