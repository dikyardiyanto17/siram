const mongoose = require("mongoose")
const Schema = mongoose.Schema

const handoffSchema = new Schema({
	code: {
		type: String,
		required: true,
		unique: true,
	},
	accessToken: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
	},
	expiresAt: {
		type: Date,
		default: () => Date.now() + 60 * 1000,
		index: { expires: "0s" },
	},
})

module.exports = mongoose.model("Handoff", handoffSchema)
