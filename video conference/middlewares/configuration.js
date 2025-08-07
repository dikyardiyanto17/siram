const { appName, baseUrl, socketPath, socketBaseUrl, viewerEnabled, initialSetting, databaseUrl, googleOauthUrl } = require("../config/index.js")

const configuration = async (req, res, next) => {
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

module.exports = configuration
