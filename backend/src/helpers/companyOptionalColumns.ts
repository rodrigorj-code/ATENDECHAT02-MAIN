import sequelize from "../database";

export type CompanyOptionalColumns = {
  signupMetadata: boolean;
  whiteLabelHostDomain: boolean;
};

let cache: CompanyOptionalColumns | null = null;

/**
 * Colunas opcionais (migration 20260407000000). Se ainda não rodou no banco,
 * evita SELECT/WHERE em colunas inexistentes.
 */
export async function getCompanyOptionalColumns(): Promise<CompanyOptionalColumns> {
  if (cache) return cache;

  try {
    const dialect = sequelize.getDialect();
    if (dialect !== "postgres") {
      cache = { signupMetadata: true, whiteLabelHostDomain: true };
      return cache;
    }

    const [rows] = (await sequelize.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (table_name = 'Companies' OR table_name = 'companies')
        AND column_name IN ('signupMetadata', 'whiteLabelHostDomain')
      `
    )) as [Array<{ column_name: string }>, unknown];

    const names = new Set(rows.map((r) => r.column_name));
    cache = {
      signupMetadata: names.has("signupMetadata"),
      whiteLabelHostDomain: names.has("whiteLabelHostDomain")
    };
    return cache;
  } catch {
    cache = { signupMetadata: false, whiteLabelHostDomain: false };
    return cache;
  }
}

/** Para testes ou após migrations manuais */
export function resetCompanyOptionalColumnsCache(): void {
  cache = null;
}
