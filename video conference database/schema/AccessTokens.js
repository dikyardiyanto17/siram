const mongoose = require("mongoose")
const { Schema } = mongoose

const accessTokenSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	token: { type: String, required: true, unique: true },
	expiresAt: {
		type: Date,
		default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
		index: { expires: 0 },
	},
	createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("AccessToken", accessTokenSchema)
