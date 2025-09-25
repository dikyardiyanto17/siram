const mongoose = require("mongoose")
const { Helpers } = require("../helper")
const Schema = mongoose.Schema

const meetingSchema = new Schema({
	title: {
		type: String,
	},
	roomId: {
		type: String,
		required: true,
	},
	sourceMeeting: {
		type: String,
		enum: ["Instant", "Schedule"],
		default: "Instant",
	},
	hostId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	roomPassword: {
		type: String,
		required: true,
	},
	startMeeting: {
		type: Date,
		default: Date.now,
	},
	endMeeting: {
		type: Date,
	},
	description: {
		type: String,
	},
	link: {
		type: String,
		required: true,
	},
	participants: [
		{
			type: mongoose.Schema.Types.Mixed,
		},
	],
	enableWaitingRoom: {
		type: Boolean,
		required: true,
		default: false,
	},
	enableSharingScreen: {
		type: Boolean,
		required: true,
		default: false,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
})

meetingSchema.pre("save", async function (next) {
	try {
		if (!this.title) {
			this.title = await Helpers.generateUUIDv4()
		}
		next()
	} catch (error) {
		next(error)
	}
})

module.exports = mongoose.model("Meeting", meetingSchema)
