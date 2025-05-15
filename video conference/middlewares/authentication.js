const { decodeToken } = require("../helper/jwt")

const authenthication = async (req, res, next) => {
	try {
		const { token } = req.session
		const path = req.path

		if (path == "/" && !token) {
			const { rid, pw } = req.query
			if (rid && rid.trim() !== "" && pw && pw.trim() !== "") {
				await res.redirect(`/telepati/login?rid=${encodeURIComponent(rid)}&pw=${encodeURIComponent(pw)}`)
				return
			}
			await res.redirect("login")
			return
		}

		if (!token) throw { name: "Invalid_User", message: "User tidak valid" }

		const { user } = decodeToken(token)

		if (!user) {
			await res.redirect("login")
			return
		}

		req.user = { participant_id: user.participant_id, authority: user.authority, full_name: user.full_name, picture: user.photo_path }
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authenthication
