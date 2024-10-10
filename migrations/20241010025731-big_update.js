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
		await queryInterface.renameColumn("Notifications", "createdAt", "created_at")
		await queryInterface.renameColumn("Notifications", "updatedAt", "updated_at")
    
		await queryInterface.renameColumn("Messages", "createdAt", "created_at")
		await queryInterface.renameColumn("Messages", "updatedAt", "updated_at")
    
    await queryInterface.renameColumn("Recordings", "createdAt", "created_at")
		await queryInterface.renameColumn("Recordings", "updatedAt", "updated_at")
    
    await queryInterface.renameColumn("Room_Participants", "createdAt", "created_at")
		await queryInterface.renameColumn("Room_Participants", "updatedAt", "updated_at")
    
    await queryInterface.renameColumn("Participants", "createdAt", "created_at")
		await queryInterface.renameColumn("Participants", "updatedAt", "updated_at")
    
    await queryInterface.renameColumn("Rooms", "createdAt", "created_at")
		await queryInterface.renameColumn("Rooms", "updatedAt", "updated_at")



		await queryInterface.renameTable("Notifications", "notifications")
		await queryInterface.renameTable("Messages", "messages")
		await queryInterface.renameTable("Recordings", "recordings")
		await queryInterface.renameTable("Room_Participants", "room_participants")
		await queryInterface.renameTable("Participants", "participants")
		await queryInterface.renameTable("Rooms", "rooms")
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.renameTable("notifications", "Notifications")
		await queryInterface.renameTable("messages", "Messages")
		await queryInterface.renameTable("recordings", "Recordings")
		await queryInterface.renameTable("room_participants", "Room_Participants")
    await queryInterface.renameTable("participants", "Participants")
		await queryInterface.renameTable("rooms", "Rooms")

		await queryInterface.renameColumn("Notifications", "created_at", "createdAt")
		await queryInterface.renameColumn("Notifications", "updated_at", "updatedAt")

		await queryInterface.renameColumn("Messages", "created_at", "createdAt")
		await queryInterface.renameColumn("Messages", "updated_at", "updatedAt")

    await queryInterface.renameColumn("Recordings", "created_at", "createdAt")
		await queryInterface.renameColumn("Recordings", "updated_at", "updatedAt")

    await queryInterface.renameColumn("Room_participants", "created_at", "createdAt")
		await queryInterface.renameColumn("Room_participants", "updated_at", "updatedAt")

    await queryInterface.renameColumn("Participants", "created_at", "createdAt")
		await queryInterface.renameColumn("Participants", "updated_at", "updatedAt")

    await queryInterface.renameColumn("Rooms", "created_at", "createdAt")
		await queryInterface.renameColumn("Rooms", "updated_at", "updatedAt")
	},
}
