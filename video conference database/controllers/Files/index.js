const path = require("path")
const fs = require("fs")
const multer = require("multer")
const { uploadFileChatPath, baseUrl } = require("../../config")
const Chats = require("../../schema/Chats")
const { Helpers } = require("../../helper")

class File {
	static storage() {
		return multer.diskStorage({
			destination: (req, file, cb) => {
				console.log(req.user)
				console.log(req.room)
				const today = new Date()
				const dateFolder = today.toLocaleDateString("en-GB").replace(/\//g, "-")

				const { roomId: roomName } = req.room || "general"
				const { _id: from } = req.user || "unknown"
				const to = req.body.to || "everyone"

				const subPath = to == "everyone" ? `${roomName}/everyone` : `${roomName}/${from}-to-${to}`

				const uploadPath = path.join(__dirname, "..", "..", uploadFileChatPath, dateFolder, subPath)
				fs.mkdirSync(uploadPath, { recursive: true })

				console.log("- Upload Full Path : ", uploadPath)

				cb(null, uploadPath)
			},
			filename: (req, file, cb) => {
				const uniqueName = Date.now() + path.extname(file.originalname)
				cb(null, uniqueName)
			},
		})
	}

	static async post(req, res, next) {
		try {
			const upload = multer({ storage: File.storage() }).single("file")
			const { roomMongoDBId } = req.room
			const { username, _id } = req.user

			upload(req, res, async (err) => {
				if (err) return next(err)

				const { to, isPrivate, messageDate, type } = req.body

				const mimeType = req.file.mimetype

				let detectType = "file"
				if (mimeType.startsWith("image/")) {
					detectType = "image"
				} else if (mimeType.startsWith("video/")) {
					detectType = "video"
				} else {
					detectType = "file"
				}

				const fullPath = req.file.path
				const relativePath = path.relative(path.join(__dirname, "..", "..", uploadFileChatPath), fullPath)
				const publicUrl = relativePath.replace(/\\/g, "/")
				const api = `${baseUrl}/api/file/files/${publicUrl}`

				console.log("- Upload Path : ", req.file.path)
				console.log("- Relative Path : ", relativePath)
				console.log("- Public Api Path : ", publicUrl)
				console.log("- Body : ", { to, isPrivate, messageDate, type })

				const chat = await Chats.create({
					chatId: await Helpers.generateUUIDv4(),
					roomId: roomMongoDBId,
					username,
					from: _id,
					to,
					isPrivate: isPrivate === "true",
					type: detectType,
					path: fullPath,
					api,
					fileName: req.file.originalname,
					fileSize: req.file.size, // bytes
					messageDate,
					createdBy: _id,
				})

				return res.json({
					status: true,
					message: "Successfully upload the file",
					data: [{ ...(await chat.toObject()) }],
				})
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = { File }
