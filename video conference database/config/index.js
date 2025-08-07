module.exports = {
	appName: "Video Conference Database",
	// baseUrl: "https://diary.dikyardiyanto.cloud",
	baseUrl: "http://localhost:9101",
	port: 9101,
	encodedLimit: "50mb",
	http: true,
	googleRedirectApi: "http://localhost:9101/api/google/auth",
	videoConferenceUrl: "https://localhost:9100/telepati",
	googleOauthUrl: "https://www.googleapis.com/oauth2/v2",
	// googleRedirectApi: "https://localhost:9100/telepati",
	googleScope: ["https://www.googleapis.com/auth/calendar", "openid", "email", "profile"],
}
