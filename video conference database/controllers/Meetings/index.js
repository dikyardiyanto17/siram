const { google } = require("googleapis")
const Meetings = require("../../schema/Meetings")
const { googleRedirectApi, cookieUser } = require("../../config")
const Users = require("../../schema/Users")
const { Helpers } = require("../../helper")
const Chats = require("../../schema/Chats")
const { Types } = require("mongoose")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectApi)

class Meeting {
	static async post_google_calender(req, res, next) {
		try {
			const { roomName, start_date, end_date, roomId, password, description, participants, link } = req.body

			if (!roomName || !start_date || !end_date || !roomId || !password || !description || !link) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			const userId = req?.user?._id
			const accessToken = req?.googleUser?.token

			if (!userId || !accessToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			oauth2Client.setCredentials({ access_token: accessToken })

			const calendar = google.calendar({ version: "v3", auth: oauth2Client })

			const calendarEvent = {
				summary: roomName,
				description: `${description}\n\nJoin the meeting: ${link}`,
				start: {
					dateTime: new Date(start_date).toISOString(),
					timeZone: "Asia/Jakarta",
				},
				end: {
					dateTime: new Date(end_date).toISOString(),
					timeZone: "Asia/Jakarta",
				},
				attendees: participants.map((email) => ({ email })),
				location: link,
			}

			const calendarResponse = await calendar.events.insert({
				calendarId: "primary",
				resource: calendarEvent,
				conferenceDataVersion: 1,
				sendUpdates: "all",
			})

			const newMeeting = await Meetings.create({
				title: roomName,
				roomId,
				roomPassword: password,
				startMeeting: new Date(start_date),
				endMeeting: new Date(end_date),
				description,
				participants: [req.user.email, ...participants],
				link,
				createdBy: userId,
			})

			res.status(200).json({
				status: true,
				message: "Successfully created meeting and Google Calendar event!",
				data: {
					meeting: newMeeting,
					googleEvent: calendarResponse.data,
				},
			})
		} catch (error) {
			if (error.response?.data) {
				console.error("Google Calendar API error:", error.response.data)
			}
			next(error)
		}
	}

	static async get(req, res, next) {
		try {
			const userId = req?.user?._id
			const userEmail = req?.googleUser?.email

			if (!userId) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const { st, et } = req.query

			const startDate = st ? new Date(st) : null
			const endDate = et ? new Date(et) : null

			if ((st && isNaN(startDate)) || (et && isNaN(endDate))) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: "Tanggal tidak valid" }
			}

			if (startDate) startDate.setHours(0, 0, 0, 0)
			if (endDate) endDate.setHours(23, 59, 59, 999)

			let dateFilter = {}
			if (startDate && endDate) {
				dateFilter = {
					$and: [{ startMeeting: { $lte: endDate } }, { endMeeting: { $gte: startDate } }],
				}
			}

			const filter = {
				...dateFilter,
				$or: [{ createdBy: userId }, { participants: userEmail }],
			}

			const meetings = await Meetings.find(filter)

			res.status(200).json({
				status: true,
				message: "Successfully retrieved meetings",
				data: meetings,
			})
		} catch (error) {
			next(error)
		}
	}

	static async detail(req, res, next) {
		try {
			const { roomId, roomPassword: password, roomMongoDBId } = req.room
			const { _id } = req.user

			const roomIdMongo = new Types.ObjectId(roomMongoDBId)

			if (!roomId) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			const meeting = await Meetings.findOne({ roomId: roomId, roomPassword: password })
			if (!meeting) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			const isAuthorized = await meeting.participants.find((x) => x._id == req.user._id.toString() || req.user._id)

			if (!isAuthorized) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const { hostId, ...meetingData } = await meeting.toObject()

			const allMessages = await Chats.aggregate([
				{
					$match: {
						roomId: roomIdMongo,
						$or: [{ isPrivate: false }, { isPrivate: true, $or: [{ from: _id.toString() }, { to: _id.toString() }] }],
					},
				},
				{
					$lookup: {
						from: "meetings",
						localField: "roomId",
						foreignField: "_id",
						as: "meeting",
					},
				},
				{ $unwind: "$meeting" },
				{
					$addFields: {
						fromUser: {
							$cond: [
								"$isPrivate",
								{
									$first: {
										$filter: {
											input: "$meeting.participants",
											as: "p",
											cond: { $eq: [{ $toString: "$$p._id" }, "$from"] },
										},
									},
								},
								"$$REMOVE", // for public
							],
						},
						toUser: {
							$cond: [
								"$isPrivate",
								{
									$first: {
										$filter: {
											input: "$meeting.participants",
											as: "p",
											cond: { $eq: [{ $toString: "$$p._id" }, "$to"] },
										},
									},
								},
								"$$REMOVE",
							],
						},
					},
				},
				{
					$project: {
						_id: 1,
						chatId: 1,
						roomId: 1,
						from: 1,
						to: 1,
						username: 1,
						isPrivate: 1,
						type: 1,
						path: 1,
						api: 1,
						fileName: 1,
						fileSize: 1,
						content: 1,
						messageDate: 1,
						"fromUser._id": 1,
						"fromUser.username": 1,
						"toUser._id": 1,
						"toUser.username": 1,
					},
				},
			])

			await res.status(200).json({
				status: true,
				message: "Successfully post meetings",
				data: [
					{
						...req.user,
						...meetingData,
						userIds: req.user._id,
						authority: (await hostId.toString()) == (await req.user._id.toString()) ? true : false,
						allMessages,
					},
				],
			})
		} catch (error) {
			next(error)
		}
	}

	static async post(req, res, next) {
		try {
			const { roomId, password, link, username } = req.body
			if (!roomId || !password || !link || !username) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			let meeting = await Meetings.findOne({ roomId })

			if (!meeting && req.user.authProvider == "guest") {
				throw { name: Helpers.RESPONSEERROR.GUESTUSERERROR.name, message: Helpers.RESPONSEERROR.GUESTUSERERROR.message }
			}

			if (meeting && meeting.roomPassword != password) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			if (!meeting) {
				meeting = await Meetings.create({
					roomId,
					roomPassword: password,
					link,
					startMeeting: new Date(),
					createdBy: req.user._id,
					hostId: req.user._id,
				})
			}

			res.cookie("roomId", roomId, {
				expires: new Date(Date.now() + cookieUser),
				...Helpers.cookieSetting,
			})

			res.cookie("password", password, {
				expires: new Date(Date.now() + cookieUser),
				...Helpers.cookieSetting,
			})

			let participants = [...meeting.participants]
			const { authProvider } = req.user

			if (authProvider === "guest") {
				const alreadyExists = participants.some((p) => p._id?.toString?.() == req.user._id?.toString?.())

				if (!alreadyExists) {
					participants.push({ ...req.user, joinedAt: new Date() })
				}
			} else {
				const alreadyExists = participants.some((p) => p.email == req.user.email)

				if (!alreadyExists) {
					participants.push({ email: req.user.email, joinedAt: new Date(), _id: req.user._id?.toString?.() })
				}
			}

			Object.assign(meeting, { participants: participants })

			await meeting.save()

			const token = await Helpers.encodeToken({
				hostId: meeting.hostId,
				roomId: meeting.roomId,
				roomPassword: meeting.roomPassword,
				...req.user,
				roomMongoDBId: meeting._id,
			})

			res.cookie("roomToken", token, {
				expires: new Date(Date.now() + cookieUser),
				...Helpers.cookieSetting,
			})

			const { hostId, ...meetingData } = await meeting.toObject()

			await res.status(200).json({
				status: true,
				message: "Successfully post meetings",
				data: [
					{
						...meetingData,
						userIds: req.user._id,
						username: req.user.username,
						authority: (await hostId.toString()) == (await req.user._id.toString()) ? true : false,
					},
				],
			})
		} catch (error) {
			if (error.response?.data) {
				console.error("Google Calendar API error:", error.response.data)
			}
			next(error)
		}
	}

	static async put(req, res, next) {
		try {
			const meeting = await Meetings.findOne({ roomId: req.room.roomId })
			if (!meeting) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.NOTFOUND.message }
			}

			Object.assign(meeting, req.body)
			await meeting.save()

			res.json({ status: true, message: "Room updated successfully", data: meeting })
		} catch (error) {
			next(error)
		}
	}

	static async check(req, res, next) {
		try {
			const { roomid, password } = req.query
			if (!roomid || !password) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			const meeting = await Meetings.findOne({ roomId: roomid })
			if (!meeting) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.NOTFOUND.message }
			}

			if (meeting.roomPassword != password) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			await res.status(200).json({ status: true, message: "Meeting is found", data: [] })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Meeting
