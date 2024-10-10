const { decodeToken, encodeToken } = require("../../helper/jwt")
const { Participant } = require("../../models")

class Login {
	static async index(req, res, next) {
		try {
			const { token } = req.session

			const { rid, pw } = req.query

			if (!token) {
				await res.render("pages/login/index")
				return
			}

			const decodedUser = await decodeToken(token)

			if (!decodedUser) {
				await res.render("pages/login/index")
				return
			}

			res.redirect(`/${rid && rid.trim() != "" && pw && pw.trim() != "" ? `rid=${rid}&pw=${pw}` : ""}`)
		} catch (error) {
			next(error)
		}
	}

	static async postLogin(req, res, next) {
		try {
			const { full_name, participant_id } = req.body
			const { rid, pw } = req.query

			if (!full_name || full_name.trim() == "") {
				throw { name: "Required", message: "Nama lengkap kosong" }
			}

			if (!participant_id || participant_id.trim() == "") {
				throw { name: "Required", message: "ID Peserta kosong" }
			}

			const user = await Participant.findOne({
				where: {
					participant_id,
					full_name,
				},
			})
			if (!user) {
				throw { name: "Not_Found", message: "User Is Not Found" }
			}

			const token = await encodeToken({ participant_id: user.participant_id, full_name: user.full_name })

			req.session.token = token
			await req.session.save()
			await res.status(200).json({ status: true, authority: user.authority })
		} catch (error) {
			next(error)
		}
	}

	static async logout(req, res, next) {
		try {
			await req.session.destroy()
			await res.status(200).json({ message: "Successfully log out", status: true })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Login
