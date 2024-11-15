const { Message } = require("../../models")
const { createdDate } = require("../../helper")
class Messages {
	static async create(req, res, next) {
		try {
			const { participant_id, message_text, sent_at, status, room_id } = req.body
			const message = await Message.create({ ...createdDate, status, participant_id, message_text, sent_at, room_id })
			await res.status(201).json({ status: true, message: "Sukses menyimpan pesan" })
		} catch (error) {
			next(error)
		}
	}

	static async findMessage(req, res, next) {
		try {
			const { room_id } = req.params
			const messages = await Message.findAll({
				where: {
					room_id,
				},
				order: [["createdAt", "ASC"]],
			})

			await res.status(200).json({ status: true, messages: "Sukses mengambil pesan" })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Messages
