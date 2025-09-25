const mongoose = require("mongoose")
const { handsOffExp } = require("../config")
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
	},
	password: {
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
		default: () => Date.now() + handsOffExp,
		index: { expires: "0s" },
	},
})

module.exports = mongoose.model("Handoff", handoffSchema)
