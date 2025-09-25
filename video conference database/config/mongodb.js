// db.js
const mongoose = require("mongoose")

const uri = process.env.MONGODB_MY_DATABASE

async function connect() {
	try {
		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 5000,
			autoIndex: true,
		})
		console.log("✅ MongoDB connected")
	} catch (err) {
		console.error("❌ MongoDB connection error:", err.message)
		// Optional: retry after delay if first connect fails
		setTimeout(connect, 5000)
	}
}

// Listeners (for debugging/monitoring)
mongoose.connection.on("disconnected", () => {
	console.warn("⚠️ MongoDB disconnected")
})

mongoose.connection.on("reconnected", () => {
	console.log("🔄 MongoDB reconnected")
})

mongoose.connection.on("error", (err) => {
	console.error("❌ MongoDB error:", err.message)
})

module.exports = connect
