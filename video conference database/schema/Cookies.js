const mongoose = require("mongoose")
const { cookieUser, appName } = require("../config")
const { Schema } = mongoose

const cookieSchema = new Schema(
	{
		cookieId: {
			type: String,
			required: true,
		},
		loginPlatform: {
			type: String,
			required: true,
			default: "Vmeet",
			enum: ["Vmeet", "Google"],
		},
		token: {
			type: String,
		},
		createdBy: {
			type: String,
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
		expiresAt: {
			type: Date,
			default: () => Date.now() + cookieUser,
			index: { expires: "0s" },
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model("Cookie", cookieSchema)
