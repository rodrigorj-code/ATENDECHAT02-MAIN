import { QueryInterface } from "sequelize";

/**
 * Mantém criação pública de organização alinhada ao padrão: userCreation = enabled.
 * Bancos antigos que tinham "disabled" passam a "enabled".
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE "Settings"
      SET value = 'enabled', "updatedAt" = NOW()
      WHERE key = 'userCreation' AND value = 'disabled';
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE "Settings"
      SET value = 'disabled', "updatedAt" = NOW()
      WHERE key = 'userCreation' AND value = 'enabled';
    `);
  }
};
