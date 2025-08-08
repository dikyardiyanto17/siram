const { google } = require("googleapis")
const Meetings = require("../../schema/Meetings") // assuming your schema is named Meeting.js
const { googleRedirectApi } = require("../../config")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectApi)

class Meeting {
	static async post(req, res, next) {
		try {
			const { roomName, start_date, end_date, roomId, password, description, participants, link } = req.body

			if (!roomName || !start_date || !end_date || !roomId || !password || !description || !participants?.length || !link) {
				throw { name: "badrequest", message: "Please complete the form." }
			}

			const userId = req?.user?._id
			const accessToken = req?.googleUser?.token

			if (!userId || !accessToken) {
				throw { name: "forbidden", message: "User session is missing or invalid" }
			}

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
				throw { name: "forbidden", message: "Invalid token" }
			}

			const { st, et } = req.query

			const startDate = st ? new Date(st) : null
			const endDate = et ? new Date(et) : null

			if ((st && isNaN(startDate)) || (et && isNaN(endDate))) {
				throw { name: "badrequest", message: "Tanggal tidak valid" }
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
}

module.exports = Meeting
