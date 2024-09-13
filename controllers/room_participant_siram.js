const { Op } = require("sequelize")
const { createdDate } = require("../helper")
const { Room_Participant } = require("../models")

class RoomParticipantSiram {
	static async index(req, res, next) {
		try {
			await res.render("participant")
		} catch (error) {
			next(error)
		}
	}

	static async create(req, res, next) {
		try {
			const { no_perkara, participant_id, user_id, room_id, joined_at, left_at, status } = req.body

			if (!no_perkara || no_perkara.trim() == "") {
				throw { name: "Required", message: "Nomor Perkara kosong" }
			}

			if (!room_id || room_id.trim() == "") {
				throw { name: "Required", message: "ID ruangan kosong" }
			}

			if (!participant_id || participant_id.trim() == "") {
				throw { name: "Required", message: "ID peserta rapat kosong" }
			}

			if (!user_id || user_id.trim() == "") {
				throw { name: "Required", message: "ID user rapat kosong" }
			}

			if (!status) {
				throw { name: "Required", message: "ID user rapat kosong" }
			}

			await Room_Participant.create({ no_perkara, participant_id, user_id, room_id, joined_at, left_at, status, ...createdDate })
		} catch (error) {
			await next(error)
		}
	}
}

module.exports = { RoomParticipantSiram }
