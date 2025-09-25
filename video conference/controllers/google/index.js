const axios = require("axios")
const querystring = require("querystring")
const { Helpers } = require("../../helper")

class GoogleApi {
	static async post(req, res, next) {
		try {
			const { roomName, start_date, end_date, roomId, password, description, participants, link } = req.body

			if (!roomName || !start_date || !end_date || !roomId || !password || !description || !participants || !link) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			const data = { roomName, start_date, end_date, roomId, password, description, participants, link }

			const accessToken = req.session?.google?.token
			if (!accessToken) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}

			const request = await axios.post(`${res.locals.databaseUrl}/api/meeting`, data, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})

			if (request && request.status) {
				res.status(200).json({ status: true, message: "Successfully created google calendar!", data: { ...request.data } })
			}
		} catch (error) {
			next(error)
		}
	}

	static async get(req, res, next) {
		try {
			const accessToken = req.session?.google?.token
			if (!accessToken) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}

			const queryString = querystring.stringify(req.query)

			const request = await axios.get(`${res.locals.databaseUrl}/api/meeting?${queryString}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})

			if (request && request.status) {
				res.status(200).json({ status: true, message: request.data.message, data: [...request.data.data] })
			}
		} catch (error) {
			next(error)
		}
	}
}
module.exports = GoogleApi
