const { url, appName, baseUrl, socketPath, socketBaseUrl, viewerEnabled, initialSetting, databaseUrl, googleOauthUrl } = require("../config")
const { Helpers } = require("../helper")

class Middlewares {
	static async configuration(req, res, next) {
		try {
			res.locals.appName = appName
			res.locals.baseUrl = baseUrl
			res.locals.databaseUrl = databaseUrl
			res.locals.socketPath = socketPath
			res.locals.socketBaseUrl = socketBaseUrl
			res.locals.viewerEnabled = viewerEnabled
			res.locals.initialSetting = initialSetting
			res.locals.googleOauthUrl = googleOauthUrl
			next()
		} catch (error) {
			next(error)
		}
	}

	static async authenthication(req, res, next) {
		try {
			if (!req.cookies.userCookie) throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			next()
		} catch (error) {
			next(error)
		}
	}

	static async authenthication_2(req, res, next) {
		try {
			const { token, roomToken, meeting } = req.session
			const path = req.path

			console.log(req.cookies)
			if ((path.startsWith("/room/") && !token) || !roomToken || !meeting) {
				const { rid, pw } = req.query
				if (rid && rid.trim() != "" && pw && pw.trim() != "") {
					await res.redirect(`${url}/?rid=${encodeURIComponent(rid)}&pw=${encodeURIComponent(pw)}`)
					return
				}
				await res.redirect(`${url}`)
				return
			}

			if (!token) throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }

			const { user } = Helpers.decodeToken(token)

			if (!user) {
				await res.redirect("lobby")
				return
			}

			req.user = {
				participant_id: user.participant_id,
				authority: user.authority,
				full_name: user.full_name,
				picture: user.photo_path,
				isViewer: user.isViewer,
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	static async authorization(req, res, next) {
		try {
			const { token } = req.session

			if (!token) throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }

			const payload = Helpers.decodeToken(token)

			if (!payload) {
				await res.redirect("login")
				return
			}
		} catch (error) {
			next(error)
		}
	}

	static async cookie(req, res, next) {
		try {
			req.cookieSession = req.session || {}
			delete req.session
			next()
		} catch (error) {
			next(error)
		}
	}

	static async errorHandler(err, req, res, next) {
		console.log("- ErrorName : ", err.name)
		console.log("- ErrorMessage : ", err.message)
		console.log("- Error : ", err)

		let statusCode = 500
		let name = "Internal Server Error"
		let message = err.message

		switch (true) {
			case err.name === Helpers.RESPONSEERROR.BADREQUEST.name:
			case err.name === Helpers.RESPONSEERROR.VALIDATIONERROR.name:
				statusCode = 400
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.INVALIDUSER.name:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.FORBIDDEN.name:
			case err.name === Helpers.RESPONSEERROR.GUESTUSERERROR.name:
				statusCode = 403
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.DUPLICATED.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUND.name:
				statusCode = 404
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.JSONWEBTOKEN:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.CASTERROR.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUNDPAGE.name:
				statusCode = 401
				name = err.name
				break
		}

		if (err.name === Helpers.RESPONSEERROR.NOTFOUNDPAGE.name) {
			return res.render("pages/not_found/index")
		}

		res.status(statusCode).json({ status: false, name, message })
	}
}

module.exports = { Middlewares }
