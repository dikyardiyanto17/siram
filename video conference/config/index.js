const portToOpen = [1040] // for mediasoup tcp/udp binding,
const privateIp = "0.0.0.0"
// const publicIp = "192.168.18.35" // RDS Harmoni Lantai 1 2.4G
// const publicIp = "203.175.10.29" // VPS
const publicIp = "93.127.199.123" // VPS TERBARU PAK Indra
module.exports = {
	appName: "Telepati",
	baseUrl: "https://localhost:9100/telepati",
	// baseUrl: "https://modoto.net/telepati",
	socketBaseUrl: "https://localhost:9100",
	// socketBaseUrl: "https://modoto.net",
	url: "/telepati",
	socketPath: "/telepati/socket",
	port: 9100,
	isHttps: false,
	maxCores: 2, // How many core you want to provide to mediasoup
	incomingMinBitRate: 1500000,
	incomingMaxBitRate: 1500000,
	listenInfos: portToOpen.flatMap((port) => [
		{
			protocol: "udp",
			ip: privateIp,
			announcedIp: publicIp,
			port,
		},
		{
			protocol: "tcp",
			ip: privateIp,
			announcedIp: publicIp,
			port,
		},
	]),
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
		{
			kind: "audio",
			mimeType: "audio/opus",
			clockRate: 48000,
			channels: 2,
		},
		{
			kind: "video",
			mimeType: "video/VP8",
			clockRate: 90000,
			parameters: {
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/VP9",
			clockRate: 90000,
			parameters: {
				"profile-id": 2,
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "4d0032",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "42e01f",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 1000,
			},
		},
	],
	encodedLimit: "50mb",
	// reminder note for session, use redis instead
	expressSessionConfiguration: {
		resave: false,
		saveUninitialized: false,
		cookie: {
			// secure: true,
			secure: false, // it should be true for production
			sameSite: true,
			maxAge: 2 * 60 * 60 * 1000, // 2 hour in milliseconds
		},
	},
	viewerEnabled: true,
	initialSetting: true,
}
