const mongoose = require("mongoose")
const { Helpers } = require("../helper")
const { cookieUser, videoConferenceUrl } = require("../config")
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
		fullname: {
			type: String,
			required: true,
		},
		password: String,
		email: {
			type: String,
			unique: true,
			sparse: true,
			index: true,
		},
		authProvider: {
			type: String,
			default: "vmeet",
			enum: ["google", "guest", "vmeet"],
		},
		googleId: {
			type: String,
			sparse: true,
			unique: false,
		},
		confirmed: {
			type: Boolean,
			default: false,
		},
		picture: {
			type: String,
			default: `${videoConferenceUrl}/photo/P_0000000.png`,
		},
		refreshToken: String,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		expiredAt: {
			type: Date,
		},
	},
	{ timestamps: true }
)

userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

userSchema.pre("save", async function (next) {
	try {
		if (!this.fullname) {
			this.fullname = this.username
		}

		// Case if login using google
		if (!this.password) return next()

		// if (!this.isModified("password")) return next()
		// this.password = await Helpers.hashPassword(this.password)
		next()
	} catch (error) {
		next(error)
	}
})

userSchema.methods.comparePassword = async function (candidatePassword) {
	return Helpers.comparePassword(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
