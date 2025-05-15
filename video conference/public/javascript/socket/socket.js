const { io } = require("socket.io-client")

const socket = io("https://modoto.net/telepati", { path: "/telepati/socket", autoConnect: false })
// const socket = io("https://localhost:9100", { path: "/telepati/socket", autoConnect: false })

module.exports = { socket }
