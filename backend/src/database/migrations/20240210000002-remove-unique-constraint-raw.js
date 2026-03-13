'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('ALTER TABLE "Companies" DROP CONSTRAINT IF EXISTS "Companies_name_key";')
      .catch(err => {
        // If constraint doesn't exist, ignore
        console.log('Constraint might not exist or already removed:', err.message);
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('Companies', ['name'], {
      type: 'unique',
      name: 'Companies_name_key'
    });
  }
};
