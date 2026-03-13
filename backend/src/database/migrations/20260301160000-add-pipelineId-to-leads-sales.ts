import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("leads_sales", "pipelineId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "LeadPipelines", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addIndex("leads_sales", ["companyId", "pipelineId"], {
      name: "idx_leads_sales_company_pipeline"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("leads_sales", "idx_leads_sales_company_pipeline");
    await queryInterface.removeColumn("leads_sales", "pipelineId");
  }
};

