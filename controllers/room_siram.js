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

			const room_id = await RoomSiram.generateRoomId()
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

	static async todayMeeting() {
		try {
			const startOfToday = new Date()
			startOfToday.setHours(0, 0, 0, 0)
			const endOfToday = new Date()
			endOfToday.setHours(23, 59, 59, 999)

			const meetings = await Room.findAll({
				where: {
					[Op.and]: [{ start_date: { [Op.between]: [startOfToday, endOfToday] } }, { end_date: { [Op.between]: [startOfToday, endOfToday] } }],
				},
				order: [["room_id", "ASC"]],
			})

			return meetings
		} catch (error) {
			console.log("- Error Get Today Meeting : ", error)
		}
	}

	static async generateRoomId() {
		try {
			const today = new Date()
			const year = today.getFullYear().toString().slice(2)
			const month = (today.getMonth() + 1).toString().padStart(2, "0")
			const day = today.getDate().toString().padStart(2, "0")

			const dateString = `${year}${month}${day}`

			const lastRoom = await Room.findOne({
				where: {
					room_id: {
						[Op.like]: `R_${dateString}%`,
					},
				},
				order: [["room_id", "DESC"]],
			})

			let nextSequence = "0001"

			if (lastRoom) {
				const lastRoomId = lastRoom.room_id
				const lastSequence = lastRoomId.split("_").pop()
				nextSequence = (parseInt(lastSequence, 10) + 1).toString().padStart(4, "0")
			}

			const newRoomId = `R_${dateString}_${nextSequence}`
			return newRoomId
		} catch (error) {
			console.log("- Error Generate Room Id: ", error)
		}
	}
}

module.exports = RoomSiram
