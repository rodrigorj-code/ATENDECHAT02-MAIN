import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { config as dotenvConfig } from "dotenv";
import bodyParser from 'body-parser';

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import logger from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import BullQueue from "./libs/queue"
import BullBoard from 'bull-board';
import basicAuth from 'basic-auth';
import "./emailQueues";

// Função de middleware para autenticação básica
export const isBullAuth = (req, res, next) => {
  const user = basicAuth(req);

  if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Carregar variáveis de ambiente
dotenvConfig();

// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Configuração de filas
app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

const buildAllowed = () => {
  const raws = [
    process.env.FRONTEND_URL,
    process.env.WEB_ORIGIN,
    process.env.APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:5174"
  ]
    .filter(Boolean)
    .join(",");
  const all = raws
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const withHttp = all.flatMap(o => {
    if (o.startsWith("http")) return [o];
    return [`https://${o}`, `http://${o}`];
  });
  return Array.from(new Set(withHttp));
};
const allowedOrigins = buildAllowed();

// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use('/admin/queues', isBullAuth, BullBoard.UI);
}

// Middlewares
// Helmet desativado por CSP customizada; reativar quando necessário

app.use(compression()); // Compressão HTTP
// Captura o corpo bruto para validação de assinatura de webhooks (Meta)
app.use(
  bodyParser.json({
    limit: '5mb',
    verify: (req: any, _res, buf) => {
      try {
        req.rawBody = buf?.toString?.('utf8');
      } catch {
        // ignora caso não consiga converter
        req.rawBody = undefined;
      }
    }
  })
); // Aumentar o limite de carga para 5 MB
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Permitir domínios explicitados e plataformas usuais
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".railway.app")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback permissivo para garantir funcionamento (ajustar para produção se necessário)
      }
    }
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());

// Servir arquivos estáticos em /public SEM auth (logo, foto de perfil, etc.)
app.use("/public", (req, res, next) => {
  express.static(uploadConfig.directory)(req, res, () => {
    // Se static não enviou resposta (arquivo não encontrado), devolve 404 em vez de passar às rotas (evita 401)
    if (!res.headersSent) {
      res.status(404).send("Not found");
    }
  });
});

app.get("/", (_req, res) => res.json({ ok: true }));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Rotas
app.use(routes);

// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());

// Middleware de tratamento de erros
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
