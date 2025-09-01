const portToOpen = [1042, 1043] // for mediasoup tcp/udp binding,
const privateIp = "0.0.0.0"
// const publicIp = "192.168.18.35" // RDS Harmoni Lantai 1 2.4G
// const publicIp = "192.168.20.209" // Kosan
// const publicIp = "192.167.61.8"
// const publicIp = "203.175.10.29" // VPS
const publicIp = "31.97.67.18" // VPS TERBARU PAK Indra
module.exports = {
	appName: "VMeet",
	// baseUrl: "https://localhost:9102/vmeet",
	// socketBaseUrl: "https://localhost:9102",
	// databaseUrl: "http://localhost:9103/vmeet-db",
	// isHttps: true,
	baseUrl: "https://modoto.net/vmeet",
	socketBaseUrl: "https://modoto.net",
	databaseUrl: "https://modoto.net/vmeet-db",
	isHttps: false,
	url: "/vmeet",
	socketPath: "/vmeet/socket",
	port: 9102,
	maxCores: 2, // How many core you want to provide to mediasoup
	incomingMinBitRate: 2_500_000,
	incomingMaxBitRate: 2_500_000,
	outcomingMinBitRate: 1_500_000,
	outcomingMaxBitRate: 1_500_000,
	// listenInfos: portToOpen.flatMap((port) => [
	// 	{
	// 		protocol: "udp",
	// 		ip: privateIp,
	// 		announcedIp: publicIp,
	// 		port,
	// 	},
	// 	{
	// 		protocol: "tcp",
	// 		ip: privateIp,
	// 		announcedIp: publicIp,
	// 		port,
	// 	},
	// ]),
	listenInfos: [
		{
			protocol: "udp",
			ip: privateIp,
			announcedAddress: publicIp,
			portRange: { min: portToOpen[0], max: portToOpen[portToOpen.length - 1] },
		},
		{
			protocol: "tcp",
			ip: privateIp,
			announcedAddress: publicIp,
			portRange: { min: portToOpen[0], max: portToOpen[portToOpen.length - 1] },
		},
	],
	turnServer: [
		// {
		// 	urls: "stun:92.127.199.123:3478",
		// },
		// {
		// 	urls: "turn:92.127.199.123:3478",
		// 	username: "RDS2025",
		// 	credential: "P@sswordRds12@jakarta",
		// },
		{
			urls: "stun:203.175.10.29:3478",
		},
		{
			urls: "turn:203.175.10.29:3478",
			username: "siram2024",
			credential: "P@sswordSiram12@jakarta",
		},
	],
	mediaCodecs: [
		// Audio - OPUS is best for WebRTC
		{
			kind: "audio",
			mimeType: "audio/opus",
			clockRate: 48000,
			channels: 2,
		},

		// VP8 - Primary video codec (broad compatibility)
		{
			kind: "video",
			mimeType: "video/VP8",
			clockRate: 90000,
			parameters: {
				"x-google-start-bitrate": 800,
				"x-google-min-bitrate": 300,
				"x-google-max-bitrate": 1500,
			},
		},

		// H264 Baseline - Mobile compatibility (fallback or preferred on mobile)
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "42e01f",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 800,
				"x-google-min-bitrate": 300,
				"x-google-max-bitrate": 1500,
			},
		},

		// VP9 - For future SVC or desktop performance (optional)
		{
			kind: "video",
			mimeType: "video/VP9",
			clockRate: 90000,
			parameters: {
				"profile-id": 2,
				"x-google-start-bitrate": 1000,
				"x-google-min-bitrate": 300,
				"x-google-max-bitrate": 2500,
			},
		},

		// H264 High Profile - High-quality fallback (desktop with hardware support)
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "4d0032",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 1000,
				"x-google-min-bitrate": 300,
				"x-google-max-bitrate": 2500,
			},
		},
	],
	encodedLimit: "50mb",
	expressSessionConfiguration: {
		resave: true,
		saveUninitialized: false,
		cookie: {
			// secure: true,
			secure: false, // it should be true for production
			// sameSite: true,
			maxAge: 2 * 60 * 60 * 1000, // 2 hour in milliseconds
		},
	},
	viewerEnabled: true,
	initialSetting: true,
	allowedCors: ["https://localhost:9100", "http://localhost:9101"],
	googleOauthUrl: "https://www.googleapis.com/oauth2/v2",
}
