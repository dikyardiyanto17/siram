const mongoose = require("mongoose")
const Schema = mongoose.Schema

const liveMeetingSchema = new Schema({
	roomId: {
		type: String,
		required: true,
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

module.exports = mongoose.model("LiveMeeting", liveMeetingSchema)
