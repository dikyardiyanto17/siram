const { Types } = require("mongoose")
const { Helpers } = require("../../helper")
const Chats = require("../../schema/Chats")
const Meetings = require("../../schema/Meetings")
const Users = require("../../schema/Users")

class Chat {
	static async post(req, res, next) {
		try {
			const { roomMongoDBId } = req.room
			const { username, _id } = req.user
			const { to, isPrivate, content, messageDate, type } = req.body

			if (!content || !typeof isPrivate == "undefined" || !messageDate || isNaN(new Date(messageDate).getTime())) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			let insert = {
				isPrivate,
				messageDate,
				roomId: roomMongoDBId,
				username,
				to,
				content,
				type,
				chatId: await Helpers.generateUUIDv4(),
				from: _id,
				createdBy: _id,
			}

			console.log("- Req Body : ", req.body)
			console.log("- Req User : ", req.user)
			console.log("- Req Room : ", req.room)

			await Chats.create(insert)

			await res.status(200).json({
				status: true,
				message: "Successfully saved messages",
				data: [],
			})
		} catch (error) {
			next(error)
		}
	}

	static async get(req, res, next) {
		try {
			const { _id } = req.user
			const { roomMongoDBId } = req.room

			const roomId = new Types.ObjectId(roomMongoDBId)

			const publicMessages = await Chats.find({
				roomId: roomId,
				isPrivate: false,
			}).lean()

			const privateMessages = await Chats.aggregate([
				{
					$match: {
						roomId: roomId,
						isPrivate: true,
						$or: [{ from: _id }, { to: _id }],
					},
				},
				{
					$addFields: {
						otherUser: {
							$cond: [{ $eq: ["$from", _id] }, "$to", "$from"],
						},
					},
				},
				{
					$group: {
						_id: "$otherUser",
						messages: { $push: "$$ROOT" },
					},
				},
				{
					$project: {
						_id: 0,
						userId: "$_id",
						messages: 1,
					},
				},
			])

			console.log("- Private ", privateMessages)

			await res.status(200).json({
				status: true,
				message: "Successfully retrieved chat",
				data: [
					{
						publicMessages,
						privateMessages,
					},
				],
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = { Chat }
