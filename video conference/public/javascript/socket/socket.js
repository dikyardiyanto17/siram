const { io } = require("socket.io-client")

// const socket = io("https://modoto.net", { path: "/telepati/socket", autoConnect: false })
// const socket = io("https://localhost:9100", { path: "/telepati/socket", autoConnect: false })
const getSocket = (baseUrl, path) => {
	return io(baseUrl, { path: path, autoConnect: false })
}

module.exports = { getSocket }
