const { Op, QueryTypes, where } = require("sequelize")
const { createdDate, generateRandomId, formatDate, formatedDate, formatedTime } = require("../helper")
const { Room, Room_Participant, sequelize, Sequelize, Participant } = require("../models")

class RoomSiram {
	static async index(req, res, next) {
		try {
			const meetings = await Room.findAll()
			const sortedMeeting = meetings.map((m) => {
				m.dataValues.start_date = formatDate(m.dataValues.start_date)
				m.dataValues.end_date = formatDate(m.dataValues.end_date)
				return m.dataValues
			})

			const meetingsWithParticipants = await Promise.all(
				sortedMeeting.map(async (meeting) => {
					const participants = await Room_Participant.findAll({
						where: {
							no_perkara: meeting.no_perkara,
						},
					})

					meeting.participants = participants?.length
				})
			)
			await res.render("room_siram", { backButton: true, meetings: sortedMeeting })
		} catch (error) {
			next(error)
		}
	}

	static async detail(req, res, next) {
		try {
			const { room_id } = req.params
			const room = await Room.findOne({
				where: {
					room_id: room_id,
				},
			})
			if (!room) {
				await res.render("not_found")
				return
			}

			const sortedMeeting = {
				...room.dataValues,
				startDate: await formatedDate(room.dataValues.start_date),
				startTime: await formatedTime(room.dataValues.start_date),
				endDate: await formatedDate(room.dataValues.end_date),
				endTime: await formatedTime(room.dataValues.end_date),
			}

			const meetingsWithParticipants = await Room_Participant.findAll({
				where: {
					no_perkara: room.no_perkara,
					room_id: room.room_id,
				},
			})

			const participantWithRole = await Promise.all(
				meetingsWithParticipants.map(async (participant) => {
					const role = await Participant.findOne({
						where: {
							participant_id: participant.participant_id,
						},
					})

					participant.dataValues.role = role ? role.role : null
					participant.dataValues.full_name = role ? role.full_name : null
					return participant.dataValues
				})
			)

			sortedMeeting.participants = participantWithRole
			console.log(sortedMeeting.participants)

			await res.render("room_siram_detail", { backButton: true, ...sortedMeeting })
		} catch (error) {
			next(error)
		}
	}

	static async create(req, res, next) {
		try {
			const { no_perkara, meeting_type, room_name, reference_room_id, start_date, end_date, participants, location, password, face_recognition } =
				req.body

			const room_id = await RoomSiram.createRoomId()
			const status = 1
			const max_participants = 100

			const existingId = await Room.findOne({
				where: {
					room_id,
				},
			})

			if (existingId) {
			}

			if (!meeting_type) {
				throw { name: "Required", message: "Tipe meeting kosong" }
			}

			if (!room_name || room_name.trim() == "") {
				throw { name: "Required", message: "Nama room kosong" }
			}

			if (!password || password.trim() == "") {
				throw { name: "Required", message: "Nama room kosong" }
			}

			if (!start_date) {
				throw { name: "Required", message: "Tanggal mulai kosong" }
			}

			if (!end_date) {
				throw { name: "Required", message: "Tanggal berakhir kosong" }
			}

			// Rapat Perkara
			if (meeting_type == 1) {
				if (!no_perkara || no_perkara.trim() == "") {
					throw { name: "Required", message: "Nomor Perkara kosong" }
				}

				if (participants.length == 0 || !participants) {
					throw { name: "Required", message: "Minimal peserta rapat adalah 1" }
				}

				const transaction = await sequelize.transaction()

				const roomCreated = await Room.create(
					{
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
						password,
						face_recognition,
						...createdDate,
					},
					{ transaction }
				)

				const promises = participants.map(async (participant) => {
					try {
						const newParticipant = { participant_id: participant, no_perkara, room_id, status: 1, ...createdDate }
						await Room_Participant.create(newParticipant, { transaction })
					} catch (error) {
						console.log("- Error Creating Room Participants : ", error)
					}
				})
				await Promise.all(promises)

				await transaction.commit()

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
					password,
					location,
					face_recognition,
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

			const meetingsWithParticipants = await Promise.all(
				meetings.map(async (meeting) => {
					const participants = await Room_Participant.findAll({
						where: {
							no_perkara: meeting.no_perkara,
							room_id: meeting.room_id,
						},
					})

					const participantWithRole = await Promise.all(
						participants.map(async (participant) => {
							const role = await Participant.findOne({
								attributes: ["role", "full_name"],
								where: {
									participant_id: participant.participant_id,
								},
							})

							participant.dataValues.role = role ? role.role : null
							participant.dataValues.full_name = role ? role.full_name : null
							return participant
						})
					)

					meeting.dataValues.participants = participantWithRole
					return meeting
				})
			)

			return meetingsWithParticipants
		} catch (error) {
			console.log("- Error Get Today Meeting : ", error)
		}
	}

	static async filterMeeting(req, res, next) {
		try {
			const { st, et } = req.query
			console.log("++++++++++", st, et)
			const startDay = new Date(st)
			startDay.setHours(0, 0, 0, 0)
			const endDay = new Date(et)
			endDay.setHours(23, 59, 59, 999)

			const meetings = await Room.findAll({
				where: {
					[Op.and]: [{ start_date: { [Op.between]: [startDay, endDay] } }, { end_date: { [Op.between]: [startDay, endDay] } }],
				},
				order: [["room_id", "ASC"]],
			})

			const meetingsWithParticipants = await Promise.all(
				meetings.map(async (meeting) => {
					const participants = await Room_Participant.findAll({
						where: {
							no_perkara: meeting.no_perkara,
							room_id: meeting.room_id,
						},
					})

					const participantWithRole = await Promise.all(
						participants.map(async (participant) => {
							const role = await Participant.findOne({
								attributes: ["role", "full_name"],
								where: {
									participant_id: participant.participant_id,
								},
							})

							participant.dataValues.role = role ? role.role : null
							participant.dataValues.full_name = role ? role.full_name : null
							return participant
						})
					)

					meeting.dataValues.participants = participantWithRole
					return meeting
				})
			)

			await res.status(200).json({ data: meetingsWithParticipants })
		} catch (error) {
			next(error)
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

	static async find({ roomId }) {
		try {
			const room = await Room.findOne({
				where: {
					room_id: roomId,
				},
			})
			if (!room) {
				return null
			}
			return room.dataValues
		} catch (error) {
			console.log("- Error Find Room : ", error)
		}
	}

	static async findRoom({ room_id, password }) {
		try {
			const room = await Room.findOne({
				where: {
					room_id: room_id,
					password: password,
				},
			})
			if (!room) {
				return null
			}
			return room.dataValues
		} catch (error) {
			console.log("- Error Find Room : ", error)
		}
	}

	static async findMeetingsWithParticipants(req, res, next) {
		try {
			const meetings = await Room.findAll()

			const meetingsWithParticipants = await Promise.all(
				meetings.map(async (meeting) => {
					const participants = await Room_Participant.findAll({
						where: {
							no_perkara: meeting.no_perkara,
							room_id: meeting.room_id,
						},
					})

					const participantWithRole = await Promise.all(
						participants.map(async (participant) => {
							const role = await Participant.findOne({
								attributes: ["role"],
								where: {
									participant_id: participant.participant_id,
								},
							})

							participant.dataValues.role = role ? role.role : null // Handle case where no role found
							return participant
						})
					)

					meeting.dataValues.participants = participantWithRole
					return meeting
				})
			)

			res.status(200).json(meetingsWithParticipants)
		} catch (error) {
			next(error)
		}
	}

	static async createRoomId() {
		try {
			const room_id = await generateRandomId(12, "_")
			const room = await Room.findOne({
				where: {
					room_id,
				},
			})

			if (!room) {
				return room_id
			}

			return await RoomSiram.createRoomId()
		} catch (error) {
			console.log("- Error Check Room Id : ", error)
		}
	}
}

module.exports = RoomSiram
