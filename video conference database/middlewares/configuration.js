const { appName, baseUrl, videoConferenceUrl, googleOauthUrl } = require("../config")

const configuration = async (req, res, next) => {
	try {
		res.locals.appName = appName
		res.locals.baseUrl = baseUrl
		res.locals.videoConferenceUrl = videoConferenceUrl
		res.locals.googleOauthUrl = googleOauthUrl
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = configuration
