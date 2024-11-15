const { io } = require("socket.io-client")

const url = window.location
const socket = io(`${url.origin}`, { path: "/socket", autoConnect: false })

module.exports = { socket }
