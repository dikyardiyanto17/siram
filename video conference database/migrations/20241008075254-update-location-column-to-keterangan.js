'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.renameColumn('Rooms', 'location', 'note');
    await queryInterface.addColumn('Messages', 'room_id', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if it shouldn't allow null values
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn('Rooms', 'note', 'location');
    await queryInterface.removeColumn('Messages', 'room_id');
  }
};
