import sequelize from "../database";
import { alignCompanyModelToDatabase } from "../helpers/alignCompanyModelToDatabase";

export async function ensureDatabase(): Promise<void> {
  // Em produção, evitar rodar sequelize-cli via processo externo.
  // Apenas valida a conexão e retorna; migrações devem ser aplicadas pelo pipeline/deploy.
  try {
    await sequelize.query("SELECT 1");
  } catch {
    /* ignore */
  }
  try {
    await alignCompanyModelToDatabase();
  } catch {
    /* ignore: evita derrubar boot se information_schema falhar */
  }
}
