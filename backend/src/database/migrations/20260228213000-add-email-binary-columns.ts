import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adiciona coluna binária para assinatura diretamente no template
    await queryInterface.addColumn("EmailTemplates", "signatureImageData", {
      type: DataTypes.BLOB,
      allowNull: true
    });

    // Adiciona coluna binária para armazenar o conteúdo dos anexos
    await queryInterface.addColumn("EmailTemplateAttachments", "data", {
      type: DataTypes.BLOB,
      allowNull: true
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("EmailTemplates", "signatureImageData");
    await queryInterface.removeColumn("EmailTemplateAttachments", "data");
  }
};
