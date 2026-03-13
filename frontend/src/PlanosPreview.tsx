import React, { useMemo, useState } from "react";
import { Code } from "lucide-react";

type Cycle = "mensal" | "semestral" | "anual";

const priceParts = (v: number) => ({
  main: `R$${v}`,
  suffix: "/por mês",
});

const emphasize = (text: string) => {
  const regex =
    /(\b(?:ilimitad[oa]s?|usuários?|membros?|conexões?|leads?)\b|\d+\s?mil|\d+)/gi;
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part && regex.test(part) ? (
      <span key={i} className="font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

export default function PlanosPreview() {
  const [cycle, setCycle] = useState<Cycle>("anual");

  const prices = useMemo(() => {
    return {
      starter: cycle === "mensal" ? 147 : cycle === "semestral" ? 112 : 91,
      essencial: cycle === "mensal" ? 460 : cycle === "semestral" ? 402 : 344,
      pro: cycle === "mensal" ? 807 : cycle === "semestral" ? 750 : 692,
    };
  }, [cycle]);

  return (
    <div className="w-full bg-transparent">
      <main className="pt-10 pb-10">
        <section
          className="text-black"
          style={{ fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif' }}
        >
          <div className="max-w-6xl mx-auto rounded-3xl py-4 md:py-6 px-4 md:px-8">
            <div className="text-center space-y-3">
              <h2
                className="text-[32px] md:text-[42px] leading-[1.1] font-normal tracking-tight text-white"
                style={{ fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif' }}
              >
                Plano para todo tipo
                <br />
                de crescimento
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-neutral-500 leading-6">
                Tudo que você precisa pra vender com precisão, escala e
                <br />
                estrutura. Com o melhor custo-benefício do mercado.
              </p>
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center">
              <div className="relative bg-white rounded-full px-1 py-1 w-[280px] h-11 flex items-center border border-neutral-300">
                <div
                  className={`absolute left-3 top-1.5 h-8 w-24 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-out will-change-transform ${
                    cycle === "anual"
                      ? "translate-x-0"
                      : cycle === "semestral"
                      ? "translate-x-[84px]"
                      : "translate-x-[168px]"
                  }`}
                />
                <button
                  onClick={() => setCycle("anual")}
                  className={`relative z-10 w-28 h-9 rounded-full text-sm transition-colors duration-200 ease-out ${
                    cycle === "anual" ? "text-[#0b2a7e] font-semibold bg-neutral-200" : "text-neutral-600"
                  }`}
                >
                  Anual
                </button>
                <button
                  onClick={() => setCycle("semestral")}
                  className={`relative z-10 w-28 h-9 rounded-full text-sm transition-colors duration-200 ease-out ${
                    cycle === "semestral" ? "text-[#0b2a7e] font-semibold bg-neutral-200" : "text-neutral-600"
                  }`}
                >
                  Semestral
                </button>
                <button
                  onClick={() => setCycle("mensal")}
                  className={`relative z-10 w-28 h-9 rounded-full text-sm transition-colors duration-200 ease-out ${
                    cycle === "mensal" ? "text-[#0b2a7e] font-semibold bg-neutral-200" : "text-neutral-600"
                  }`}
                >
                  Mensal
                </button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="rounded-2xl border border-neutral-200 bg-white min-h-[560px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] transition-shadow transform-gpu will-change-transform hover:-translate-y-0.5 !text-[#0F172A]">
                <div className="px-6 pt-5">
                  <h3 className="text-xl font-semibold tracking-tight !text-[#0F172A]">Starter</h3>
                  <p className="mt-1 text-[15px] leading-6 !text-[#475569]">
                    Para quem está começando, com recursos essenciais e limites
                    ideais para pequenas equipes.
                  </p>
                </div>
                <div className="px-6 pt-4">
                  <div className="text-xs text-black line-through">
                    <span>{priceParts(Math.round(prices.starter * 1.25)).main}</span>
                    <span className="ml-1 align-baseline">{priceParts(prices.starter).suffix}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="text-[32px] font-bold text-[#0B1220] tracking-tight">
                      <span>{priceParts(prices.starter).main}</span>
                      <span className="ml-1 align-baseline text-sm text-black">
                        {priceParts(prices.starter).suffix}
                      </span>
                    </div>
                  </div>
                  <button className="mt-3 w-full h-10 rounded-md bg-zinc-100 text-[#0B1220] text-sm font-semibold hover:bg-zinc-200 transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2a7e] focus-visible:ring-offset-2 focus-visible:ring-offset-white border border-neutral-300">
                    COMECE AGORA
                  </button>
                </div>
                <ul className="px-6 py-5 space-y-0 text-sm">
                  {[
                    "Criação e gerenciamento de negócios e produtos.",
                    "Gerenciamento de até 10 mil leads com controle de tags.",
                    "Cadastro de até 3 membros da sua empresa.",
                    "Automação para interagir com leads ilimitado.",
                    "Multiatendimento com até 2 conexões (WhatsApp).",
                    "2 integrações com Webhooks para conectar outras ferramentas.",
                    "Dashboards de negócios das pipelines.",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 border-t border-black/10 first:border-t-0 py-3 first:pt-0">
                      <Code className="w-4 h-4 mt-[2px] text-slate-500" />
                      <span className="text-black">{emphasize(t)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border-2 border-[#1e3a8a] bg-white shadow-[0_10px_40px_rgba(30,58,138,0.12)] hover:shadow-[0_16px_56px_rgba(30,58,138,0.16)] transition-shadow transform-gpu will-change-transform hover:-translate-y-0.5 min-h-[560px] !text-[#0F172A]">
                <div className="px-6 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold tracking-tight !text-[#0F172A]">Essencial</h3>
                    <span className="text-xs px-2 py-1 rounded-md border-2 border-[#0f2b8f] text-[#0f2b8f] bg-transparent font-semibold">
                      Melhor preço
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] leading-6 !text-[#475569]">
                    Funcionalidades avançadas e limites ampliados para empresas em
                    crescimento constante.
                  </p>
                </div>
                <div className="px-6 pt-4">
                  <div className="text-xs text-black line-through">
                    <span>{priceParts(Math.round(prices.essencial * 1.25)).main}</span>
                    <span className="ml-1 align-baseline">{priceParts(prices.essencial).suffix}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="text-[34px] font-bold text-[#0B1220] tracking-tight">
                      <span>{priceParts(prices.essencial).main}</span>
                      <span className="ml-1 align-baseline text-sm text-black">
                        {priceParts(prices.essencial).suffix}
                      </span>
                    </div>
                  </div>
                  <button className="mt-3 w-full h-10 rounded-md bg-zinc-100 text-[#0B1220] text-sm font-semibold hover:bg-zinc-200 transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white border border-neutral-300">
                    COMECE AGORA
                  </button>
                </div>
                <ul className="px-6 py-5 space-y-0 text-sm">
                  {[
                    "Criação e gerenciamento de pipeline ilimitado.",
                    "Criação e gerenciamento de negócios e produtos.",
                    "Gerenciamento de até 100 mil leads com controle de tags.",
                    "Cadastro de 15 membros na empresa.",
                    "Automação para interagir com leads ilimitado.",
                    "Multiatendimento com até 10 conexões (WhatsApp).",
                    "15 integrações com Webhooks para conectar outras ferramentas.",
                    "Dashboards de negócios das pipelines.",
                    "Acesso à API para integração com outras ferramentas.",
                  ].map((t, i) => (
                    <li
                      key={t}
                      className={`flex items-start gap-3 border-t border-black/10 first:border-t-0 py-3 first:pt-0 ${
                        i >= 7 ? "bg-[#0b2a7e]/10 rounded-md px-3 py-2 mt-2" : ""
                      }`}
                    >
                      <Code className="w-4 h-4 mt-[2px] text-slate-500" />
                      <span className="text-black">
                        {emphasize(t)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#1b1f2f] bg-[#0c0f1a] min-h-[560px] shadow-[0_8px_24px_rgba(0,0,0,0.30)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.40)] transition-shadow transform-gpu will-change-transform hover:-translate-y-0.5">
                <div className="px-6 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Pro</h3>
                    <span className="text-xs px-2 py-1 rounded-md border-2 border-[#0f2b8f] text-white bg-transparent font-semibold">
                      Mais vendido
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] leading-6 text-neutral-300/90">
                    Para operações de alta escala com automações avançadas, integrações ilimitadas
                    e suporte enterprise.
                  </p>
                </div>
                <div className="px-6 pt-4">
                  <div className="text-xs text-white line-through">
                    <span>{priceParts(Math.round(prices.pro * 1.25)).main}</span>
                    <span className="ml-1 align-baseline text-white/80">{priceParts(prices.pro).suffix}</span>
                    <span className="ml-2 text-white/80">Economize R${Math.round(Math.round(prices.pro * 1.25) - prices.pro)}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="text-[34px] font-bold text-white tracking-tight">
                      <span>{priceParts(prices.pro).main}</span>
                      <span className="ml-1 align-baseline text-sm text-white/60">
                        {priceParts(prices.pro).suffix}
                      </span>
                    </div>
                  </div>
                  <button className="mt-3 w-full h-10 rounded-md bg-[#0b2a7e] text-white text-sm font-semibold hover:bg-[#0a256a] transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2a7e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f1a] border border-[#0b2a7e]">
                    COMECE AGORA
                  </button>
                </div>
                <ul className="px-6 py-5 space-y-0 text-sm">
                  {[
                    "Criação e gerenciamento de pipelines ilimitadas.",
                    "Gerenciamento ilimitado de leads com controle de tags.",
                    "Criação e gerenciamento de negócios e produtos.",
                    "Cadastro ilimitado de membros na empresa.",
                    "Automações ilimitadas para otimizar interações com leads.",
                    "Multiatendimento com conexões ilimitadas (WhatsApp).",
                    "Integrações com Webhooks ilimitadas para conectar outras ferramentas.",
                    "Dashboards de negócios das pipelines.",
                    "Acesso à API para integração com outras ferramentas.",
                  ].map((t, i) => (
                    <li
                      key={t}
                      className={`flex items-start gap-3 border-t border-white/15 first:border-t-0 py-3 first:pt-0 ${
                        i >= 6 ? "bg-white/10 border border-white/20 rounded-md px-3 py-2 mt-2" : ""
                      }`}
                    >
                      <Code className="w-4 h-4 mt-[2px] text-white/70" />
                      <span className="text-neutral-200">{emphasize(t)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
