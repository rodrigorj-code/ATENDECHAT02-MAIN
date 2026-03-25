import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Typography
} from "@material-ui/core";

const mono = { fontFamily: "ui-monospace, Consolas, monospace", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" };

export default function ProactivityHelpDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <DialogTitle>Manual da proatividade — como funciona</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8 }}>
          1. O que é
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          A <b>proatividade</b> faz o agente de IA <b>enviar mensagens sozinho</b> em momentos definidos (follow-up,
          detecção de interesse, reengajamento ou prospecção fria). Isso é diferente da resposta quando o cliente manda
          mensagem — aqui o sistema <b>inicia</b> ou <b>retoma</b> o contato.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          2. Interruptor geral (obrigatório para rodar)
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          Tudo o que você preenche fica salvo no servidor, mas <b>só executa</b> se <b>“Ativar automações proativas”</b>{" "}
          estiver <b>ligado</b> e você clicar em <b>Salvar proatividade</b>. Sem isso, nenhum job automático nem disparo
          de prospecção fria roda.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          3. Três números no topo (limites globais)
        </Typography>
        <Box component="ul" style={{ margin: "0 0 8px 1.1em", padding: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <b>Quantas vezes insistir antes de parar (follow-up)</b> — conta só as tentativas automáticas de follow-up
            quando o cliente não responde. Entre <b>1 e 15</b>. Ao atingir o limite, o sistema pode marcar a conversa como
            inativa e <b>parar de insistir</b>.
          </li>
          <li style={{ marginBottom: 8 }}>
            <b>Intervalo mínimo entre um follow-up e outro (horas)</b> — opcional. <b>Vazio ou 0</b> significa usar
            principalmente a regra de <b>“dias sem resposta”</b> em cada fluxo. Se você colocar (ex.: 24), o sistema
            exige essa espera entre uma tentativa e a próxima, além do horário do job (que roda em janela diária).
          </li>
          <li>
            <b>Máximo de reengajamentos por conversa</b> — cada vez que o job de reengajamento manda mensagem para um
            ticket já inativo, conta uma tentativa. <b>Vazio</b> = sem teto extra (só o intervalo em semanas). Útil para
            não ficar para sempre “cutucando” o mesmo lead.
          </li>
        </Box>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          4. Missão e playbook (cartões)
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          <b>Missão</b> define o tom geral (vendas, suporte, nutrir lead, foco em agenda…). <b>Playbook</b> adiciona um
          estilo de estratégia (consultivo, SDR, fechamento…). Os dois orientam o texto que a IA gera, junto com o{" "}
          <b>Cargo</b> do agente (outra aba).
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          5. Fluxo mental (resumo)
        </Typography>
        <Paper elevation={0} style={{ padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <Typography component="div" style={mono}>
            {`[Interruptor geral LIGADO + Salvar]
        │
        ├─► Follow-up: cliente parou de responder há X dias
        │         → job (~1x/dia, manhã SP) pode enviar mensagem
        │         → até atingir "máx. tentativas" → pode marcar inativo
        │
        ├─► Lead quente: mensagem do cliente bate nas palavras-chave
        │         → job (~a cada 30 min) pode enviar proposta/CTA
        │
        ├─► Reengajamento: ticket já inativo há X semanas
        │         → job (janela semanal) pode tentar retomar
        │
        └─► Prospecção fria: você dispara manual/API
                  → mensagem gerada + regras de horário/segmento`}
          </Typography>
        </Paper>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          6. Campos em cada bloco de fluxo
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          <b>Objetivo comercial</b> — uma frase do que você quer com <b>este</b> tipo de envio (ex.: marcar demo). Ajuda a
          IA a não divagar. Use os botões <b>“Objetivo: …”</b> para colar ideias prontas.
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          <b>Instruções de tom / limites</b> — o que a IA deve ou <b>não</b> fazer (ex.: sem urgência falsa). Use{" "}
          <b>“Tom: …”</b> para atalhos.
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          <b>Texto fixo</b> — se preencher, <b>substitui a IA</b> neste fluxo. Pode usar variáveis{" "}
          <code>{"{{nome}} {{primeiro_nome}} {{numero}} {{ticket_id}}"}</code>. Vazio = a OpenAI gera o texto (precisa de
          API key na aba Integração).
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          <b>Tags e lista</b> — só vale se o interruptor <b>“Restringir por tag ou lista”</b> estiver ligado. Aí, em cada
          fluxo, quem não tiver a tag ou não estiver na lista <b>não recebe</b> aquele tipo de mensagem automática.
        </Typography>

        <Divider style={{ margin: "16px 0" }} />

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8 }}>
          7. Lead quente — palavras-chave
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          Separe por vírgula. Quando o <b>cliente</b> envia uma mensagem contendo algo parecido com essas palavras, o
          sistema pode marcar e, no job seguinte, enviar a resposta “quente”. <b>Botões rápidos</b> (se ligado) tentam
          colocar atalhos no WhatsApp na mensagem de proposta.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          8. Chat ao vivo (cliente manda mensagem)
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          O bloco <b>Chat ao vivo</b> na aba Proatividade envia um <b>roteiro curto</b> e o <b>objetivo no chat</b> para o
          mesmo prompt da IA que responde quando o cliente escreve (junto com Cargo e Cérebro). Na aba <b>Mídias</b>, o
          contexto <b>Resposta no chat</b> define anexos após o <b>texto</b> gerado pela IA; use pausa, “não enviar se já
          mandei mídia” e, se quiser, “só na 1ª resposta” para não repetir PDF/vídeo.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          9. Prospecção fria e botão “Configurar disparo”
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          Escolhe lista e/ou IDs de contatos e enfileira envios. Respeita o mesmo interruptor geral, horário comercial
          (se ativo em Avançado), segmentos e limites.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          10. Aba Mídias
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          Anexos por contexto (depois do texto). Inclui <b>Resposta no chat</b> para mídia após a IA responder ao
          cliente. Salvar grava em <code>agent_proactive</code> — use <b>Salvar mídias e timing</b>.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          11. Campanhas (WhatsApp) e tag de origem
        </Typography>
        <Typography variant="body2" paragraph style={{ lineHeight: 1.65 }}>
          Se a campanha abre ticket (<b>open ticket</b>), após o envio o contato pode receber a tag{" "}
          <code>Campanha #&lt;id&gt;</code> e o ticket guarda <code>sourceCampaignId</code> em metadados — útil para
          segmentar regras de proatividade por tag.
        </Typography>

        <Typography variant="subtitle2" style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          12. Checklist rápido
        </Typography>
        <Box component="ol" style={{ margin: "0 0 0 1.1em", padding: 0 }}>
          <li style={{ marginBottom: 4 }}>WhatsApp conectado e IA com API key (se não usar só texto fixo).</li>
          <li style={{ marginBottom: 4 }}>Interruptor geral ligado + Salvar proatividade.</li>
          <li style={{ marginBottom: 4 }}>Fluxos desejados ligados (follow-up, lead quente, etc.).</li>
          <li>Se usar filtro: tags/listas coerentes; senão, desligar restrição global.</li>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
