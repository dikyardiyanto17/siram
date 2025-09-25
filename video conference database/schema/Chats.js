const mongoose = require("mongoose")
const { Schema } = mongoose

const chatSchema = new Schema(
	{
		chatId: {
			type: String,
			required: true,
		},
		roomId: {
			type: Schema.Types.ObjectId,
			ref: "Meeting",
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		from: {
			type: String,
			required: true,
		},
		to: {
			type: String,
			default: "",
		},
		isPrivate: {
			type: Boolean,
			required: true,
			default: false,
		},
		type: {
			type: String,
			required: true,
			default: "message",
			enum: ["file", "message", "html", "image", "video"],
		},
		path: {
			type: String,
		},
		api: {
			type: String,
			default: "",
		},
		fileName: {
			type: String,
		},
		fileSize: {
			type: String,
		},
		content: {
			type: String,
			default: "",
		},
		createdBy: {
			type: String,
			required: true,
		},
		messageDate: {
			type: Date,
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
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Chat", chatSchema)
