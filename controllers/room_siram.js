const { Op } = require("sequelize")
const { createdDate, generateRandomId, formatDate } = require("../helper")
const { Room } = require("../models")

class RoomSiram {
	static async index(req, res, next) {
		try {
			const meetings = await Room.findAll()
			const sortedMeeting = meetings.map((m) => {
				m.dataValues.start_date = formatDate(m.dataValues.start_date)
				m.dataValues.end_date = formatDate(m.dataValues.end_date)
				return m.dataValues
			})
			await res.render("room_siram", { backButton: true, meetings: sortedMeeting })
		} catch (error) {
			next(error)
		}
	}

	static async create(req, res, next) {
		try {
			const { no_perkara, meeting_type, room_name, reference_room_id, start_date, end_date, participants, location } = req.body

			const room_id = await generateRandomId()
			const status = 1
			const max_participants = 100

			if (!meeting_type) {
				throw { name: "Required", message: "Tipe meeting kosong" }
			}

			if (!room_name || room_name.trim() == "") {
				throw { name: "Required", message: "Nama room kosong" }
			}

			if (!start_date) {
				throw { name: "Required", message: "Tanggal mulai kosong" }
			}

			if (!end_date) {
				throw { name: "Required", message: "Tanggal berakhir kosong" }
			}

			if (meeting_type == 1) {
				if (!no_perkara || no_perkara.trim() == "") {
					throw { name: "Required", message: "Nomor Perkara kosong" }
				}

				if (participants.length == 0 || !participants) {
					throw { name: "Required", message: "Minimal peserta rapat adalah 1" }
				}

				const roomCreated = await Room.create({
					no_perkara,
					meeting_type,
					room_id,
					room_name,
					reference_room_id,
					max_participants,
					start_date,
					end_date,
					status,
					location,
					...createdDate,
				})
				await res.status(201).json({ roomCreated, message: "Successfully create room", status: true })
			} else if (meeting_type == 2) {
				const roomCreated = await Room.create({
					no_perkara,
					meeting_type,
					room_id,
					room_name,
					reference_room_id,
					max_participants,
					start_date,
					end_date,
					status,
					location,
					...createdDate,
				})
				await res.status(201).json({ roomCreated, message: "Successfully create room", status: true })
			} else {
				throw { name: "Required", message: "Tipe rapat invalid" }
			}
		} catch (error) {
			await next(error)
		}
	}

	static async todayMeeting(req, res, next) {
		try {
			const startOfToday = new Date()
			startOfToday.setHours(0, 0, 0, 0)
			const endOfToday = new Date()
			endOfToday.setHours(23, 59, 59, 999)

			const meetings = await Room.findAll({
				where: {
					[Op.and]: [{ start_date: { [Op.between]: [startOfToday, endOfToday] } }, { end_date: { [Op.between]: [startOfToday, endOfToday] } }],
				},
			})

			return meetings
		} catch (error) {
			next(error)
		}
	}
}

module.exports = RoomSiram
