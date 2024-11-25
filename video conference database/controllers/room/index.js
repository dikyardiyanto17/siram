const { Op } = require("sequelize")
const { encodeToken } = require("../../../video conference/helper/jwt")
const { formatDate } = require("../../../video conference/helper/index")
const { Room, Room_Participant } = require("../../models")

class Rooms {
	static async index(req, res, next) {
		try {
			const meetings = await Room.findAll({
				order: [["created_at", "DESC"]],
			})
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
							room_id: meeting.room_id,
						},
					})
					meeting.participants = participants?.length
				})
			)
			await res.render("pages/room/index", { backButton: true, meetings: sortedMeeting })
		} catch (error) {
			next(error)
		}
	}

	static async get_room_id(req, res, next) {
		try {
			const { rid, pw } = req.query
			const room = await Room.findOne({
				where: {
					room_id: rid,
					password: pw,
				},
			})
			if (!room) {
				throw { name: "Not_Found", message: "Room is not found" }
			}
			if (room.dataValues.meeting_type == 1) {
				const roomPerkara = await Room_Participant.findOne({
					where: {
						room_id: rid,
						participant_id: req.user.participant_id,
					},
				})
				if (!roomPerkara) {
					throw { name: "Not_Found", message: "User is not valid to enter the room" }
				}
				await res.status(200).json({ ...room.dataValues, token: encodeToken({ ...room.dataValues }), status: true })
			} else {
				await res.status(200).json({ ...room.dataValues, token: encodeToken({ ...room.dataValues }), status: true })
			}
		} catch (error) {
			next(error)
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
}

module.exports = Rooms
