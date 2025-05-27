const { url } = require("../config")
const { decodeToken } = require("../helper/jwt")

const authenthication = async (req, res, next) => {
	try {
		const { token, roomToken, meeting } = req.session
		const path = req.path

		console.log(path)

		if ((path.startsWith("/room/") && !token) || !roomToken || !meeting) {
			const { rid, pw } = req.query
			if (rid && rid.trim() !== "" && pw && pw.trim() !== "") {
				await res.redirect(`${url}/?rid=${encodeURIComponent(rid)}&pw=${encodeURIComponent(pw)}`)
				return
			}
			await res.redirect(`${url}`)
			return
		}

		if (!token) throw { name: "Invalid_User", message: "User tidak valid" }

		const { user } = decodeToken(token)

		if (!user) {
			await res.redirect("lobby")
			return
		}

		req.user = {
			participant_id: user.participant_id,
			authority: user.authority,
			full_name: user.full_name,
			picture: user.photo_path,
			isViewer: user.isViewer,
		}
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authenthication
