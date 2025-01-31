const { encodeToken } = require("../../helper/jwt")

class Custom_Api {
	static async customApiLogin(req, res, next) {
		try {
			const { full_name, participant_id } = req.body
			if (!full_name || full_name.trim() == "" || !participant_id || participant_id.trim() == "") {
				throw { name: "Invalid_User", message: "Invalid User" }
			}

			const user = {
				participant_id: participant_id,
				full_name: full_name,
				user_id: participant_id,
				role: "Participants",
				exception: 1,
				status: 1,
				photo: null,
				photo_path: "P_0000000",
				nik: "2222222",
				nrp: "2222222",
				authority: 1,
			}
			if (!user) {
				throw { name: "Invalid_User", message: "Invalid User" }
			}
			const token = encodeToken({ user })
			// req.session.token = token
			await res.status(200).json({ status: true, message: "User is valid", token })
		} catch (error) {
			next(error)
		}
	}

	static async get_room_id(req, res, next) {
		try {
			const { rid, pw } = req.query

			const roomData = {
				id: null,
				no_perkara: null,
				meeting_type: 2,
				room_id: rid,
				password: pw,
				room_name: rid,
				reference_room_id: null,
				max_participants: 22,
				start_date: new Date(),
				end_date: new Date(),
				status: 1,
				last_updated_at: new Date(),
				deleted_at: null,
				created_by: null,
				created_at: new Date(),
				updated_at: new Date(),
				note: "-",
				face_recognition: false,
				video_type: "vp8",
			}
			await res.status(200).json({ ...roomData, token: encodeToken({ ...roomData }), status: 1 })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Custom_Api
