const Participants = require("../participants")
const Rooms = require("../room")
const axios = require("axios")

class Ollama {
	static async post(req, res, next) {
		try {
			const { prompt } = req.body
			const OLLAMA_API_URL = `http://127.0.0.1:11434/api/generate`
			// const meetings = await Rooms.todayMeeting()
			const users = await Participants.findAll()
			// console.log("meetings", meetings)
			console.log(users)
			const fullPrompt = `the prompt for user is : ${prompt}\n\n  This is the Information:\n${JSON.stringify(
				users,
				null,
				2
			)}\n\n Check if the question related to my application`
			console.log(fullPrompt)
			const response = await axios.post(
				OLLAMA_API_URL,
				{
					model: "llama3.1",
					prompt: fullPrompt,
					stream: false,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			)

			res.json({ response: response.data })
		} catch (error) {
			console.log(error)
			res.json({ error })
		}
	}
}
module.exports = Ollama
