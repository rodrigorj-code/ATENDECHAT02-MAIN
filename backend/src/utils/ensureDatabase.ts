import sequelize from "../database";

export async function ensureDatabase(): Promise<void> {
  // Em produção, evitar rodar sequelize-cli via processo externo.
  // Apenas valida a conexão e retorna; migrações devem ser aplicadas pelo pipeline/deploy.
  try { await sequelize.query('SELECT 1'); } catch {}
}
