require("dotenv").config()

const ejs = require("ejs")
ejs.delimiter = "/"
ejs.openDelimiter = "["
ejs.closeDelimiter = "]"

const express = require("express")
const cors = require("cors")
const session = require("express-session")
const router = require("./routes/index.js")
const app = express()
const port = 9101
const { options } = require("./certif")
const path = require("path")
const http = require("http")
const https = require("httpolyglot")
const errorHandler = require("./middlewares/errorHandler.js")

app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(express.json({ limit: "50mb" }))

app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "public")))

const sessionMiddleware = session({
	secret: process.env.EXPRESS_SESSION_SECRET || "ISULOSTNEMUCODSDRTPSESSIONDASH",
	resave: false,
	saveUninitialized: false,
	cookie: {
		// secure: false,
		secure: true,
		sameSite: true,
	},
})

app.set("trust proxy", 1)

app.use(sessionMiddleware)

// const httpsServer = https.createServer(options, app)
// httpsServer.listen(port, async () => {
// 	console.log("App On : " + port)
// })

const httpServer = http.createServer(app)
httpServer.listen(port, async () => {
	console.log("App On : " + port)
})

app.use(router)

app.use(errorHandler)
