class Rooms_Server {
	#rooms = []
	#waitingList = []
	#videoParams = {}

	get rooms() {
		return this.#rooms
	}

	get waitingList() {
		return this.#waitingList
	}

	async addWaitingList({ userId, roomId, socketId }) {
		try {
			if (!this.#waitingList.some((member) => member.id == userId)) {
				this.#waitingList.push({ userId, roomId, socketId })
			}
		} catch (error) {
			console.log("- Error Add Waiting User : ", error)
		}
	}

	async addRoomMember({ userId, roomId }) {
		try {
			const room = this.#rooms.find((r) => r.id == roomId)
			if (!room) {
				throw { name: "Not Found", message: "Room is not found" }
			}
			room.members.push({ id: userId, admin: false })
		} catch (error) {
			console.log("- Error Add Room Member : ", error)
		}
	}

	async findRoom({ roomId, userId, socketId }) {
		try {
			let room = this.#rooms.find((room) => room.id == roomId)
			if (room) {
				let admin = room.members.find((member) => member.admin == true)
				await this.addWaitingList({ userId, roomId, socketId })
				return { status: true, userId, roomId: roomId, adminId: admin.id }
			} else {
				room = { id: roomId, members: [{ id: userId, admin: true }] }
				this.#rooms.push(room)
				return { status: false, userId, roomId: roomId, adminId: userId }
			}
		} catch (error) {
			console.log("- Error Find Room : ", error)
		}
	}

	async findRoomAdmin({ roomId }) {
		try {
			const room = this.#rooms.find((r) => r.id == roomId)
			if (!room) {
				throw { name: "Not Found", message: "Room is not found" }
			}
			const admin = room.members.find((user) => user.admin == true)
			return admin
		} catch (error) {
			console.log("- Error Find Room Admin : ", error)
		}
	}

	async findRoomUser({ roomId, userId }) {
		try {
			let room = this.#rooms.find((room) => room.id == roomId)
			if (!room) {
				return false
			}
			let user = room.members.find((member) => member.id == userId)
			if (!user) {
				return false
			}
			return true
		} catch (error) {
			console.log("- Error Find User In The Room : ", error)
		}
	}

	async findUser({ roomId, userId }) {
		try {
			let isRoom = this.#rooms.find((room) => room.id == roomId)
			if (!isRoom) {
				throw { name: "Not Found", message: "Room is not found" }
			}

			let isAdmin = isRoom.members.find((member) => member.id == userId)
			if (!isAdmin) {
				throw { name: "Not Found", message: "Room is not found" }
			}
			return isAdmin
		} catch (error) {
			console.log("- Error Find Admin Room : ", error)
		}
	}

	async findWaitingUser({ socketId }) {
		try {
			return this.#waitingList.find((user) => user.socketId == socketId)
		} catch (error) {
			console.log("- Error Find Waiting User : ", error)
		}
	}

	async checkWaitingList({ userId }) {
		try {
			const user = await this.#waitingList.find((member) => member.id == userId)
			if (!user) {
				return false
			}
			return true
		} catch (error) {
			console.log("- Error Check Waiting List : ", error)
		}
	}

	async findSocketInWaitingList({ userId }) {
		try {
			const user = this.#waitingList.find((member) => member.userId == userId)
			if (!user) {
				return false
			}

			return user
		} catch (error) {
			console.log("- Error Find Socket in Waiting List : ", error)
		}
	}

	async deleteWaitingList({ socketId }) {
		try {
			const user = this.#waitingList.find((member) => member.socketId == socketId)
			if (user) {
				this.#waitingList = this.#waitingList.filter((member) => member.socketId != socketId)
			}
		} catch (error) {
			console.log("- Error Delete User In Waiting List : ", error)
		}
	}

	async deleteUserInTheRoom({ userId }) {
		try {
			const roomId = await this.findRoomBasedUserId({ userId })

			if (!roomId) {
				throw { name: "Not Found", message: "Room is not found" }
			}
			// Find the room
			const room = this.#rooms.find((room) => room.id === roomId)
			if (!room) {
				throw { name: "Not Found", message: "Room does not exist" }
			}

			// Find the user
			const userIndex = room.members.findIndex((member) => member.id === userId)
			if (userIndex === -1) {
				throw { name: "Not Found", message: "User does not exist" }
			}

			// Remove the user from the room
			room.members.splice(userIndex, 1)

			// Remove the room if it has no members left
			if (room.members.length === 0) {
				this.#rooms = this.#rooms.filter((r) => r.id !== roomId)
			}
		} catch (error) {
			console.log("- Error deleting user from the room: ", error)
		}
	}

	async findRoomBasedUserId({ userId }) {
		try {
			// Find the room where the user exists
			const foundRoom = this.#rooms.find((room) => room.members.some((member) => member.id === userId))

			// Return the roomId if a room is found, otherwise return null
			return foundRoom ? foundRoom.id : null
		} catch (error) {
			console.log("- Error finding user room: ", error)
			return null // Return null in case of an error
		}
	}
}

module.exports = Rooms_Server