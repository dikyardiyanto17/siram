"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		await queryInterface.addColumn("Participants", "full_name", {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn("Participants", "nik", {
			type: Sequelize.STRING,
			allowNull: true,
		})

		await queryInterface.addColumn("Participants", "nrp", {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("Participants", "full_name")
		await queryInterface.removeColumn("Participants", "nik")
		await queryInterface.removeColumn("Participants", "nrp")
	},
}
