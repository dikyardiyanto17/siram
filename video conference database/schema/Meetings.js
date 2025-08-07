const mongoose = require("mongoose")
const Schema = mongoose.Schema

const meetingSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	roomId: {
		type: String,
		required: true,
	},
	roomPassword: {
		type: String,
		required: true,
	},
	startMeeting: {
		type: Date,
		required: true,
	},
	endMeeting: {
		type: Date,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	link: {
		type: String,
		required: true,
	},
	participants: [
		{
			type: String,
			required: true,
		},
	],
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model("Meeting", meetingSchema)
