/** URLs Cakto (checkout) — mesmo mapa em Payment e FreemiumTrialBar. */
export function resolveCaktoBaseUrl(cycle, tier) {
  const map = {
    mensal: {
      starter: "https://pay.cakto.com.br/yfsvcpc",
      essencial: "https://pay.cakto.com.br/dm2p96b",
      pro: "https://pay.cakto.com.br/3ecov2x"
    },
    semestral: {
      starter: "https://pay.cakto.com.br/3wkepst",
      essencial: "https://pay.cakto.com.br/rasnk6e",
      pro: "https://pay.cakto.com.br/ecosrjo"
    },
    anual: {
      starter: "https://pay.cakto.com.br/8jcckd5",
      essencial: "https://pay.cakto.com.br/h8woa7d",
      pro: "https://pay.cakto.com.br/me8p4x3"
    }
  };
  const c = String(cycle || "").toLowerCase();
  const t = String(tier || "").toLowerCase();
  return map[c]?.[t] || null;
}

/** Base Cakto + e-mail opcional (webhook / pré-preenchimento). */
export function buildCaktoCheckoutUrl(cycle, tier, email) {
  const base = resolveCaktoBaseUrl(cycle, tier);
  if (!base) return null;
  if (email && String(email).trim()) {
    const join = base.includes("?") ? "&" : "?";
    return `${base}${join}email=${encodeURIComponent(String(email).trim())}`;
  }
  return base;
}
