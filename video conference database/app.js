require("dotenv").config()
const mongoose = require("mongoose")
const connect = require("./config/mongodb")
const express = require("express")
const cors = require("cors")
const app = express()
const router = require("./routes/index.js")
const http = require("http")
const path = require("path")
const { encodedLimit, port, url } = require("./config/index.js")
const configuration = require("./middlewares/configuration.js")
const errorHandler = require("./middlewares/errorHandler.js")

connect()

app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ limit: encodedLimit, extended: true }))
app.use(express.json({ limit: encodedLimit }))

app.use(express.static("public"))
app.use(url, express.static(path.join(__dirname, "public")))

app.use(configuration)

const httpServer = http.createServer(app)
mongoose.connection.once("open", () => {
	httpServer.listen(port, () => {
		console.log("App On : " + port)
	})
})

app.use(url,router)
app.use(errorHandler)
