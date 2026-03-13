import "dotenv/config";
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import logger from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import BullQueue from "./libs/queue";
import { startQueueProcess } from "./queues";
import { startLidSyncJob } from "./jobs/LidSyncJob";
import { REDIS_URI_MSG_CONN } from "./config/redis";
import { ensureDatabase } from "./utils/ensureDatabase";
import "./emailQueues";

const preferredPort = Number(process.env.PORT) || 8080;

function startServer(portToUse: number) {
  const server = app.listen(portToUse, () => {
    logger.info(`Servidor iniciado na porta ${portToUse}`);
    initIO(server);
    gracefulShutdown(server);

    (async () => {
      try {
        await ensureDatabase();
        const companies = await Company.findAll({
          where: { status: true },
          attributes: ["id"],
        });

        const allPromises: any[] = [];
        companies.forEach((c) => {
          const p = StartAllWhatsAppsSessions(c.id);
          allPromises.push(p);
        });

        Promise.all(allPromises).then(async () => {
          logger.info("Fila de processamento iniciando após sessões do WhatsApp");
          await startQueueProcess();
        });

        if (REDIS_URI_MSG_CONN && REDIS_URI_MSG_CONN !== "") {
          BullQueue.process();
        }

        startLidSyncJob();
      } catch (err: any) {
        logger.error({ msg: "Erro na inicialização assíncrona", error: err?.message || String(err) });
      }
    })();
  });

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      const fallback = 8080;
      if (portToUse !== fallback) {
        logger.warn(`Porta ${portToUse} em uso. Tentando porta ${fallback}...`);
        try {
          server.close(() => startServer(fallback));
        } catch {
          startServer(fallback);
        }
      } else {
        const alt = 0; // aleatória
        logger.warn(`Porta ${portToUse} em uso. Tentando porta aleatória...`);
        try {
          server.close(() => startServer(alt));
        } catch {
          startServer(alt);
        }
      }
    } else {
      logger.error({ msg: "Erro ao iniciar o servidor", error: err?.message || String(err) });
      process.exit(1);
    }
  });
}

startServer(preferredPort);

process.on("uncaughtException", err => {
  logger.error({ msg: "uncaughtException", error: err.message, stack: err.stack?.split("\n")[0] });
  process.exit(1);
});

process.on("unhandledRejection", (reason: any, p: any) => {
  logger.error({ msg: "unhandledRejection", reason: String(reason), promise: String(p) });
});
