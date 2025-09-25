require("dotenv").config()
const mongoose = require("mongoose")
const connect = require("./config/mongodb")
const express = require("express")
const cors = require("cors")
const app = express()
const cookieParser = require("cookie-parser")
const router = require("./routes/index.js")
const http = require("http")
const path = require("path")
const { port, url, allowedCors } = require("./config/index.js")
const bodyParser = require("body-parser")
const { Middlewares } = require("./middlewares/index.js")

connect()

app.use(cookieParser())
app.use(cors({ ...allowedCors }))
app.set("view engine", "ejs")
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true,
		parameterLimit: 1000000,
	})
)
app.use(
	bodyParser.json({
		limit: "50mb",
	})
)
app.use(express.static(path.join(__dirname, "views")))
app.set("strict routing", true);


app.use(express.static("public"))
app.use(url, express.static(path.join(__dirname, "public")))

app.use(Middlewares.configuration)

const httpServer = http.createServer(app)
mongoose.connection.once("open", () => {
	httpServer.listen(port, () => {
		console.log("App On : " + port)
	})
})

app.use(url, router)
app.use(Middlewares.errorHandlers)
