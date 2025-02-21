const Participants = require("../participants")

let llm // Store the initialized Langchain model

async function setupLangchain() {
	if (!llm) {
		try {
			const { ChatOllama } = await import("@langchain/ollama") // Dynamic import
			llm = new ChatOllama({
				baseUrl: "http://127.0.0.1:11434", // Ollama API URL
				model: "mistral", // Use Mistral model
				temperature: 0,
				maxRetries: 2,
			})
			console.log("✅ Langchain initialized successfully.")
		} catch (error) {
			console.error("❌ Error initializing Langchain:", error)
		}
	}
	return llm
}

class OllamaService {
	static async post(req, res, next) {
		try {
			const { prompt } = req.body
			if (!prompt) {
				return res.status(400).json({ error: "Missing prompt in request body" })
			}

			// Fetch users from the database
			const users = await Participants.findAll()

			// Ensure Langchain is initialized
			const llm = await setupLangchain()
			if (!llm) {
				return res.status(500).json({ error: "Failed to initialize Langchain" })
			}

			const messages = [
				["system", "You are an AI assistant that analyzes user data and answers questions accordingly."],
				["human", `Here is the data: ${JSON.stringify(users, null, 2)}\n\nUser question: ${prompt}`],
			]

			const response = await llm.invoke(messages)

			res.json({ response })
		} catch (error) {
			console.error("❌ Error processing request:", error)
			res.status(500).json({ error: "Internal Server Error" })
		}
	}
}

// Initialize Langchain on startup
setupLangchain()

module.exports = OllamaService
