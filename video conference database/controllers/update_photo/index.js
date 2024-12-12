const { Participant } = require("../../models")
const fs = require("fs")
const path = require("path")
const { encodeToken } = require("../../helper/jwt")

class Update_Photo {
	static async put(req, res, next) {
		try {
			const { photo } = req.body
			const { participant_id } = req.user

			if (photo && photo.startsWith("data:image")) {
				const user = await Participant.findOne({
					where: {
						participant_id: participant_id,
					},
					attributes: ["participant_id", "full_name", "user_id", "role", "exception", "status", "photo", "photo_path", "nik", "nrp", "authority", "id"],
				})

                console.log(user)

				if (!user.photo_path || user.photo_path == null) {
					await user.update({ photo_path: user.participant_id })
				}
				const base64Data = photo.replace(/^data:image\/\w+;base64,/, "")

				const uploadsDir = path.join(__dirname, "../../photo/")
				if (!fs.existsSync(uploadsDir)) {
					fs.mkdirSync(uploadsDir, { recursive: true })
				}

				const fileName = `${participant_id}.png`
				const filePath = path.join(uploadsDir, fileName)

				if (fs.existsSync(filePath)) {
					try {
						fs.unlinkSync(filePath)
						console.log(`Old image at ${filePath} was deleted successfully.`)
					} catch (unlinkErr) {
						console.error("Failed to delete existing image file:", unlinkErr)
						return res.status(500).json({ status: false, message: "Failed to delete existing image file" })
					}
				}

				const bufferData = Buffer.from(base64Data, "base64")

				fs.writeFile(filePath, bufferData, (err) => {
					if (err) {
						console.error("Failed to save the image file:", err)
						return res.status(500).json({ status: false, message: "Failed to save the image file" })
					}

					const token = encodeToken({ user })
					res.status(200).json({ status: true, message: "Foto berhasil diperbarui", newToken: token })

					// Participant.update({ photo: filePath }, { where: { participant_id: participant_id } })
					// 	.then(() => {
					// 		res.status(200).json({ status: true, message: "Photo updated successfully" })
					// 	})
					// 	.catch((updateError) => {
					// 		console.error("Failed to update participant photo:", updateError)
					// 		res.status(500).json({ status: false, message: "Failed to update participant photo" })
					// 	})
				})
			} else {
				res.status(400).json({ status: false, message: "Invalid or missing photo data" })
			}
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Update_Photo
