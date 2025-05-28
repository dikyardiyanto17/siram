const { saveSession } = require("../helper")

class LiveMeeting {
	#users = []
	#broadcastUsers = []

	get users() {
		return this.#users
	}

	set users(newUser) {
		this.#users = newUser
	}

	async addUser({ participantId, roomId, socketId, authority, verified = false, joined = false, waiting = true, username, picture, meetingType }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (!user) {
				this.#users.push({
					participantId,
					roomId,
					socketId,
					verified,
					joined,
					authority,
					waiting,
					username,
					processDeleteUser: false,
					picture,
					meetingType,
				})
			}
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	async changeWaitingList({ participantId, roomId, status }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				user.waiting = status
			}
		} catch (error) {
			console.log("- Error Change Waiting List : ", error)
		}
	}

	async changeVerifiedList({ participantId, roomId, status }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				user.verified = status
			}
		} catch (error) {
			console.log("- Error Change Verified List : ", error)
		}
	}

	async changeJoinedList({ participantId, roomId, status, socketId }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				user.joined = status
				user.socketId = socketId
			}
		} catch (error) {
			console.log("- Error Change Joined List : ", error)
		}
	}

	async changeSocketList({ participantId, roomId, socketId }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				user.socketId = socketId
			}
		} catch (error) {
			console.log("- Error Change Socket List : ", error)
		}
	}

	async changeProcessDeleteUserList({ participantId, roomId, status }) {
		try {
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				user.processDeleteUser = status
			}
		} catch (error) {
			console.log("- Error Change Socket List : ", error)
		}
	}

	async checkUser({ participantId, roomId }) {
		try {
			console.log(this.#users)
			const user = this.#users.find((u) => u.participantId == participantId && u.roomId == roomId)
			if (user) {
				return true
			}
			return false
		} catch (error) {
			console.log("- Error Check User : ", error)
			return false
		}
	}

	async getWaitingList({ roomId }) {
		try {
			const users = await this.#users.filter((u) => u.roomId == roomId && u.waiting)
			return users
		} catch (error) {
			console.log("- Error Get Waiting List : ", error)
			return null
		}
	}

	async informUser({ roomId, producerId, socket, userId, producerPaused }) {
		try {
			this.#users.forEach((u) => {
				if (u.participantId != userId && u.roomId == roomId && u.joined && u.verified && !u.waiting) {
					socket.to(u.socketId).emit("new-producer", { producerId, userId, socketId: socket.id, producerPaused })
				}
			})
		} catch (error) {
			console.log("- Error Informing User : ", error)
		}
	}

	async checkTheRoom({ roomId, userId }) {
		try {
			const user = this.#users.find((u) => u.roomId == roomId && u.participantId != userId)
			if (user) {
				return true
			} else {
				return false
			}
		} catch (error) {
			console.log("- Error Checking The Room : ", error)
		}
	}

	async findUser({ roomId, userId }) {
		try {
			const user = await this.#users.find((u) => u.participantId == userId && u.roomId == roomId)
			if (user) {
				return user
			}
			return null
		} catch (error) {
			console.log("- Error Find User : ", error)
		}
	}

	async findRoom({ roomId }) {
		try {
			const room = await this.#users.find((u) => u.roomId == roomId)
			if (room) {
				return room
			}
			return null
		} catch (error) {
			console.log("- Error Find User : ", error)
		}
	}

	async findUserBySocket({ socketId }) {
		try {
			const user = await this.#users.find((u) => u.socketId == socketId)
			if (user) {
				return user
			}
		} catch (error) {
			console.log("- Error Find User : ", error)
		}
	}

	async findAdmin({ roomId }) {
		try {
			const admins = await this.#users.filter((u) => u.roomId == roomId && (u.authority == 1 || u.authority == 2))
			return admins
		} catch (error) {
			console.log("- Error Find Room Admin : ", error)
			return null
		}
	}

	async deleteUser({ socket, userSession }) {
		try {
			const user = this.#users.find((u) => u.socketId == socket.id)
			if (user.joined && user) {
				userSession.roomId = null
				userSession.roomName = null
				userSession.password = null
				userSession.meetingType = null
				await saveSession(userSession)
				this.#users.forEach((u) => {
					try {
						if (u.participantId != user.participantId && u.roomId == user.roomId && u.joined) {
							socket.to(u.socketId).emit("user-logout", { userId: user.participantId })
						}
					} catch (error) {
						console.log("- Error End User in Looping : ", error)
					}
				})
				user.processDeleteUser = true
				user.socketId = null
				user.joined = false
				setTimeout(() => {
					if (user.processDeleteUser) {
						this.#users = this.#users.filter((u) => u.participantId != user.participantId && u.roomId != user.roomId)
					}
				}, 1000 * 60 * 60)
				return
			}
			if (!user.joined && user.waiting) {
				this.#users = this.#users.filter((u) => u.participantId != user.participantId && u.roomId != user.roomId)
			}
		} catch (error) {
			console.log("- Error Delete User : ", error)
		}
	}

	async deleteUserRejected({ userId, roomId, userSession }) {
		try {
			const user = this.#users.find((u) => u.participantId == userId && u.roomId == roomId)
			if (user) {
				userSession.roomId = null
				userSession.roomName = null
				userSession.password = null
				userSession.meetingType = null
				await saveSession(userSession)
				this.#users = this.#users.filter((u) => u.participantId != userId)
			}
		} catch (error) {
			console.log("- Error Deleted User : ", error)
		}
	}

	async informViewer({ roomId, userId, socket, username }) {
		try {
			this.#users.forEach((u) => {
				if (u.roomId == roomId && u.participantId != userId) {
					socket.to(u.socketId).emit("viewer-joined-feedback", { id: userId, socketId: socket.id, username })
				}
			})
		} catch (error) {
			console.log("- Error get user room : ", error)
		}
	}

	async checkMeetType({ roomId }) {
		try {
			const user = this.#users.find((u) => u.roomId == roomId)
			if (user) {
				return user.meetingType
			}
			return 2
		} catch (error) {
			console.log("- Error Check Meet Type : ", error)
		}
	}

	async changeMeetType({ roomId, meetingType }) {
		try {
			this.#users.forEach((u) => {
				if (u.roomId == roomId) {
					u.meetingType = meetingType
				}
			})
		} catch (error) {
			console.log("- Error Change Meet Type : ", roomId)
		}
	}
}

module.exports = { LiveMeeting }
