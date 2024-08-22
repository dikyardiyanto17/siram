class Users {
	#users = []

	get users() {
		return this.#users
	}

	async addUser({ userId, socketId, roomId, admin }) {
		try {
			if (!this.#users.some((user) => user.id == userId)) {
				this.#users.push({ id: userId, socketId: socketId, roomId: roomId, admin })
			}
		} catch (error) {
			console.log("- Error Adding User:", error)
		}
	}

	async findRoomAdmin({ userId }) {
		try {
			const admin = this.#users.find((user) => user.id == userId)
			if (admin) {
				return admin
			} else {
				return null
			}
		} catch (error) {
			console.log("- Error Finding Admin : ", error)
		}
	}

	async findUserBySocket({ userSocketId }) {
		try {
			const user = this.#users.find((user) => user.socketId == userSocketId)
			if (user) {
				return user
			} else {
				return false
			}
		} catch (error) {
			console.log("- Error Finding User By Socket Id : ", error)
		}
	}

	async informUser({ roomId, socket, userId, producerId }) {
		try {
			this.#users.forEach((user) => {
				if (userId != user.id && user.roomId == roomId) {
					socket.to(user.socketId).emit("new-producer", { producerId, userId, socketId: socket.id })
				}
			})
		} catch (error) {
			console.log("- Error Inform User : ", error)
		}
	}

	async checkTheRoom({ roomId, userId }) {
		try {
			const user = this.#users.find((u) => u.roomId == roomId && u.id != userId)
			if (user) {
				return true
			} else {
				return false
			}
		} catch (error) {
			console.log("- Error Check The Room : ", error)
		}
	}

	async deleteUser({ userId }) {
		try {
			const index = this.#users.findIndex((user) => user.id === userId)
			if (index !== -1) {
				this.#users.splice(index, 1)
			} else {
				console.log(`User with ID ${userId} not found.`)
			}
		} catch (error) {
			console.log("- Error Deleting User:", error)
		}
	}

	async deleteUserBySocket({ userSocketId }) {
		try {
			const index = this.#users.findIndex((user) => user.id === userSocketId)
			if (index !== -1) {
				this.#users.splice(index, 1)
			} else {
				console.log(`User with ID ${userId} not found.`)
			}
		} catch (error) {
			console.log("- Error Deleting User:", error)
		}
	}
}

module.exports = { Users }
