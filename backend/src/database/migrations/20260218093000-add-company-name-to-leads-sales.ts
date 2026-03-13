import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("leads_sales", "companyName", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("leads_sales", "phone", {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("leads_sales", "phone");
    await queryInterface.removeColumn("leads_sales", "companyName");
  }
};

