const { Op, where } = require("sequelize")
const { createdDate } = require("../../helper")
const { Participant } = require("../../models")

class Participants {
	static async index(req, res) {
		try {
			const participants = await Participant.findAll()
			await res.render("pages/participant/index", { backButton: true, participants })
		} catch (error) {
			console.log(error)
		}
	}

	static async findAll() {
		try {
			const participants = await Participant.findAll()
			return participants
		} catch (error) {
			console.log("- Error")
		}
	}

	static async findAllWithParticipants() {
		try {
			const participants = await Participant.findAll()
			return participants
		} catch (error) {
			console.log("- Error Find All With Parents : ", error)
		}
	}

	static async create(req, res, next) {
		try {
			const { participant_id, user_id, role, exception, status, photo, full_name, nik, nrp } = req.body
			if (!full_name || full_name.trim() == "") {
				throw { name: "Required", message: "Nama lengkap kosong" }
			}

			if (!nik || nik.trim() == "") {
				throw { name: "Required", message: "NIK kosong" }
			}

			if (!participant_id || participant_id.trim() == "") {
				throw { name: "Required", message: "ID Peserta kosong" }
			}

			if (!user_id || user_id.trim() == "") {
				throw { name: "Required", message: "ID User kosong" }
			}

			if (!role || role.trim() == "") {
				throw { name: "Required", message: "Role kosong" }
			}

			if (!exception) {
				throw { name: "Required", message: "Pengecualian kosong" }
			}

			if (!status) {
				throw { name: "Required", message: "Status kosong" }
			}

			// if (!photo) {
			// 	throw { name: "Required", message: "Photo kosong" }
			// }

			const checkParticipant = await Participant.findOne({
				where: {
					participant_id,
				},
			})
			if (checkParticipant) {
				throw { name: "Exist", message: "Participant sudah terdaftar" }
			}
			const participantCreated = await Participant.create({
				full_name,
				nik,
				nrp,
				participant_id,
				user_id,
				role,
				exception,
				photo,
				status,
				...createdDate,
			})
			await res.status(201).json({ success: true, message: "Participant is created" })
		} catch (error) {
			await next(error)
		}
	}

	static async findUser({ participant_id, full_name }) {
		try {
			const user = await Participant.findOne({
				where: {
					participant_id,
					full_name,
				},
			})
			if (!user) {
				return false
			}
			return user.dataValues
		} catch (error) {
			console.log("- Error Find User : ", error)
		}
	}
}

module.exports = Participants
