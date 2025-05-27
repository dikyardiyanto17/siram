const { appName, baseUrl, socketPath, socketBaseUrl, viewerEnabled, initialSetting } = require("../config")

const configuration = async (req, res, next) => {
	try {
		res.locals.appName = appName
		res.locals.baseUrl = baseUrl
		res.locals.socketPath = socketPath
		res.locals.socketBaseUrl = socketBaseUrl
		res.locals.viewerEnabled = viewerEnabled
		res.locals.initialSetting = initialSetting
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = configuration
