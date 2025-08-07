const mongoose = require("mongoose")
const { Schema } = mongoose

const userSchema = new Schema(
	{
		userId: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		authProvider: {
			type: String,
			default: "google",
		},
		googleId: {
			type: String,
			index: true,
			sparse: true,
			unique: false,
		},
		confirmed: {
			type: Boolean,
			required: true,
			default: true,
		},
		picture: String,
		refreshToken: String,
	},
	{ timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
