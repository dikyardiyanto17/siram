module.exports = {
	appName: "VMeet DB",
	url: "/vmeet-db",
	port: 9103,
	encodedLimit: "50mb",
	http: true,
	// baseUrl: "http://localhost:9103/vmeet-db",
	// googleRedirectApi: "http://localhost:9103/vmeet-db/api/google/auth",
	// videoConferenceUrl: "https://localhost:9102/vmeet",
	baseUrl: "https://modoto.net/vmeet-db",
	googleRedirectApi: "https://modoto.net/vmeet-db/api/google/auth",
	videoConferenceUrl: "https://modoto.net/vmeet",
	allowedCors: {
		origin: ["https://localhost:9102", "https://modoto.net/vmeet"],
		credentials: true,
	},
	googleOauthUrl: "https://www.googleapis.com/oauth2/v2",
	googleScope: ["https://www.googleapis.com/auth/calendar", "openid", "email", "profile"],
	cookieUser: 1000 * 60 * 60 * 24, // one day
	handsOffExp: 1000 * 60 * 60, // one Hour
	uploadFileChatPath: "uploads",
	uploadFileApi: "http://localhost:9103/vmeet-db/api/files",
	uploadFileApi: "https://modoto.net/vmeet-db/api/files",
}
