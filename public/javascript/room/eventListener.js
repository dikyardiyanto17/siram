class EventListener {
	#roomId
	// Block
	#blockContainer
	#blockStatus

	// Microphone
	#microphoneButton
	#microphoneStatus

	// Camera
	#cameraButton
	#cameraStatus

	// User List
	#userListButton
	#userListStatus

	// Chat
	#chatButton
	#chatStatus

	// Raise Hand
	#raiseHandButton
	#raiseHandStatus

	// CC
	#ccButton
	#ccStatus
	#ccContainer

	// Option
	#optionButton
	#optionStatus
	#optionContainer

	// Mute All
	#muteAllButton
	#muteAllStatus

	// Video Container
	#videoContainer
	#videoContainerNormalView = "video-container-normal-view"
	#videoContainerSideBarView = "video-container-side-bar-view"

	// Side Bar Container
	#sideBarContainer
	#sideBarStatus
	#sideBarDisplay = "side-bar-container"
	#sideBarHide = "side-bar-container-hide"
	#chatContainer
	#chatContent
	#userListContainer
	// #usersListContainer
	#userListWaitingContainer
	#userListWaiting

	// Modal Video Container
	#modalVideoLayoutButton
	#modalVideoLayoutContainer
	#modalVideoLayoutClose
	#modalVideoLayoutStatus
	#layoutVideoOptions
	#layoutVideo
	#layoutCountContainer
	#layoutCount
	#alertVideoLayout

	// Record
	#recordStatus
	#recordContainer
	#recordButton
	#timerSpan
	#timerCounter
	#timerFunction
	#pauseRecordButton
	#resumeRecordButton
	#startTime
	#elapsedTime
	#timerTitle

	constructor({ micStatus = true, cameraStatus = true, roomId = "" }) {
		this.#roomId = roomId
		// Block
		this.#blockContainer = document.getElementById("block-container")
		this.#blockStatus = false

		// Microphone
		this.#microphoneButton = document.getElementById("mic-icon")
		this.#microphoneStatus = micStatus

		// Camera
		this.#cameraButton = document.getElementById("camera-icon")
		this.#cameraStatus = cameraStatus

		// User List
		this.#userListButton = document.getElementById("user-list-button")
		this.#userListStatus = false

		// User List
		this.#chatButton = document.getElementById("chat-button")
		this.#chatStatus = false

		// Raise Hand
		this.#raiseHandButton = document.getElementById("raise-hand-button")
		this.#raiseHandStatus = false

		// CC
		this.#ccButton = document.getElementById("cc-button")
		this.#ccContainer = document.getElementById("cc-container")
		this.#ccStatus = false

		// Option
		this.#optionButton = document.getElementById("option-button")
		this.#optionStatus = false
		this.#optionContainer = document.getElementById("option-container")

		// Video Container
		this.#videoContainer = document.getElementById("video-container")

		// Side Bar Container
		this.#sideBarContainer = document.getElementById("side-bar-container")
		this.#sideBarStatus = false
		this.#chatContainer = document.getElementById("chat-container")
		this.#chatContent = document.getElementById("chat-content")
		this.#userListContainer = document.getElementById("user-list-container")
		// this.#usersListContainer = document.getElementById("users-list-container")
		this.#userListWaitingContainer = document.getElementById("waiting-list-container")
		this.#userListWaiting = document.getElementById("waiting-list-users")

		// Mute All
		this.#muteAllButton = document.getElementById("mute-all-button")
		this.#muteAllStatus = false

		// Modal Video Container
		this.#modalVideoLayoutButton = document.getElementById("video-layout-button")
		this.#modalVideoLayoutContainer = document.getElementById("layout-modal")
		this.#modalVideoLayoutClose = document.getElementById("close-button-layout")
		this.#layoutVideoOptions = document.querySelectorAll(".layout-option-container")
		this.#layoutCountContainer = document.querySelectorAll(".layout-option")
		this.#layoutVideo = "1"
		this.#layoutCount = "6"
		this.#alertVideoLayout = document.getElementById("alert-video-layout")

		// Record
		this.#recordStatus = false
		this.#recordContainer = document.getElementById("record-container")
		this.#recordButton = document.getElementById("record-button")
		this.#timerSpan = document.getElementById("timer-span")
		this.#timerCounter = "00:00:00"
		this.#pauseRecordButton = document.getElementById("pause-record")
		this.#resumeRecordButton = document.getElementById("resume-record")
		this.#elapsedTime = 0
		this.#timerTitle = document.getElementById("timer-title")
	}

	get microphoneStatus() {
		return this.#microphoneStatus
	}

	async changeMicButton({ id }) {
		try {
			const myUserLicMic = document.getElementById(`mic-ul-${id}`)
			if (this.#microphoneStatus) {
				myUserLicMic.src = "/assets/icons/user_list_mic.svg"
				this.#microphoneButton.src = "/assets/icons/mic_muted.svg"
			} else {
				myUserLicMic.src = "/assets/icons/user_list_mic_active.svg"
				this.#microphoneButton.src = "/assets/icons/mic.svg"
			}
			this.#microphoneStatus = !this.#microphoneStatus
		} catch (error) {
			console.log("- Error Change Mic Button : ", error)
		}
	}

	async changeCameraButton() {
		try {
			if (this.#cameraStatus) {
				this.#cameraButton.src = "/assets/icons/camera_off.svg"
			} else {
				this.#cameraButton.src = "/assets/icons/camera.svg"
			}
			this.#cameraStatus = !this.#cameraStatus
		} catch (error) {
			console.log("- Error Change Camera Button : ", error)
		}
	}

	async changeUserListButton() {
		try {
			this.disablingButton({ element: this.#chatButton })
			this.disablingButton({ element: this.#userListButton })
			if (this.#chatStatus && !this.#userListStatus) {
				this.hideAndDisplay({ element: this.#chatContainer, status: false })
				this.changeChatButton()
			}
			if (this.#userListStatus) {
				this.#userListButton.firstElementChild.src = "/assets/icons/people.svg"
				this.#userListButton.classList.remove("active")
				this.#sideBarStatus = false
				this.hideAndDisplay({ element: this.#userListContainer, status: false })
			} else {
				this.#userListButton.firstElementChild.src = "/assets/icons/people_active.svg"
				this.#userListButton.classList.add("active")
				this.#sideBarStatus = true
				this.hideAndDisplay({ element: this.#userListContainer, status: true })
			}

			await this.changeSideBarContainer()
			this.#userListStatus = !this.#userListStatus
		} catch (error) {
			console.log("- Error Change User List Button : ", error)
		}
	}

	async changeChatButton() {
		try {
			this.disablingButton({ element: this.#userListButton })
			this.disablingButton({ element: this.#chatButton })
			if (this.#userListStatus && !this.#chatStatus) {
				this.hideAndDisplay({ element: this.#userListContainer, status: false })
				this.changeUserListButton()
			}
			if (this.#chatStatus) {
				this.#chatButton.firstElementChild.src = "/assets/icons/chat.svg"
				this.#chatButton.classList.remove("active")
				this.#sideBarStatus = false
				this.hideAndDisplay({ element: this.#chatContainer, status: false })
			} else {
				this.#chatButton.firstElementChild.src = "/assets/icons/chat_active.svg"
				this.#chatButton.classList.add("active")
				this.#sideBarStatus = true
				this.hideAndDisplay({ element: this.#chatContainer, status: true })
			}
			await this.changeSideBarContainer()
			this.#chatStatus = !this.#chatStatus
		} catch (error) {
			console.log("- Error Change Chat Button : ", error)
		}
	}

	async changeRaiseHandButton() {
		try {
			if (this.#raiseHandStatus) {
				this.#raiseHandButton.firstElementChild.src = "/assets/icons/raise_hand.svg"
				this.#raiseHandButton.classList.remove("active")
			} else {
				this.#raiseHandButton.firstElementChild.src = "/assets/icons/raise_hand_active.svg"
				this.#raiseHandButton.classList.add("active")
			}
			this.#raiseHandStatus = !this.#raiseHandStatus
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeCCButton() {
		try {
			if (this.#ccStatus) {
				this.#ccButton.firstElementChild.src = "/assets/icons/cc.svg"
				this.#ccButton.classList.remove("active")
			} else {
				this.#ccButton.firstElementChild.src = "/assets/icons/cc_active.svg"
				this.#ccButton.classList.add("active")
			}
			this.#ccStatus = !this.#ccStatus
			await this.normalHideAndDisplay({ element: this.#ccContainer, status: this.#ccStatus })
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeOptionButton() {
		try {
			if (this.#optionStatus) {
				this.#optionButton.classList.remove("active")
			} else {
				this.#optionButton.classList.add("active")
			}
			this.#optionStatus = !this.#optionStatus
			await this.normalHideAndDisplay({ element: this.#optionContainer, status: this.#optionStatus })
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeMuteAllButton() {
		try {
			if (this.#muteAllStatus) {
				this.#muteAllButton.classList.remove("active")
			} else {
				this.#muteAllButton.classList.add("active")
			}
			this.#muteAllStatus = !this.#muteAllStatus
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async hideUserOptionButtion() {
		try {
			const allOptionUserList = document.querySelectorAll(".user-list-icons-option")
			allOptionUserList.forEach((e) => {
				try {
					if (!e.classList.contains("d-none")) {
						e.classList.add("d-none")
					}
				} catch (error) {
					console.log("- Error Hide It : ", error)
				}
			})
		} catch (error) {
			console.log("- Error Hide User Option Button : ", error)
		}
	}

	async changeSideBarContainer() {
		try {
			if (this.#sideBarStatus) {
				this.#videoContainer.className = this.#videoContainerSideBarView
				this.#sideBarContainer.classList.remove(this.#sideBarHide)
			} else {
				this.#videoContainer.className = this.#videoContainerNormalView
				this.#sideBarContainer.classList.add(this.#sideBarHide)
			}
		} catch (error) {
			console.log("- Error Change Side Bar Containe : ", error)
		}
	}

	async hideAndDisplay({ element, status }) {
		try {
			if (status) {
				element.classList.remove("d-none")
			} else {
				if (!element.classList.contains("d-none")) {
					if (this.#sideBarStatus && (this.#chatStatus || this.#userListStatus)) {
						element.classList.add("d-none")
						return
					}
					setTimeout(() => {
						if (!this.#sideBarStatus && !this.#chatStatus && !this.#userListStatus) {
							element.classList.add("d-none")
						}
					}, 1000)
				}
			}
		} catch (error) {
			console.log("- Error Hiding/Display Element : ", error)
		}
	}

	async normalHideAndDisplay({ element, status }) {
		try {
			if (status) {
				element.classList.remove("d-none")
			} else {
				if (!element.classList.contains("d-none")) {
					element.classList.add("d-none")
				}
			}
		} catch (error) {
			console.log("- Error Normal Hide/Display : ", error)
		}
	}

	async disablingButton({ element }) {
		try {
			element.setAttribute("disabled", true)
			setTimeout(() => {
				element.removeAttribute("disabled")
			}, 1100)
		} catch (error) {
			console.log("- Error Disabling Button : ", error)
		}
	}

	async hideButton() {
		try {
			if (!this.#optionContainer.classList.contains("d-none")) {
				if (this.#optionStatus) {
					this.changeOptionButton()
				}
			}
		} catch (error) {
			console.log("- Error Hiding Menu : ", error)
		}
	}

	async changeVideoLayout() {
		try {
			if (this.#modalVideoLayoutStatus) {
				this.#modalVideoLayoutContainer.classList.remove("layout-modal-show")
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: false })
				this.#blockStatus = false
			} else {
				this.#modalVideoLayoutContainer.classList.add("layout-modal-show")
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: true })
				this.#blockStatus = true
			}
			this.#modalVideoLayoutStatus = !this.#modalVideoLayoutStatus
		} catch (error) {
			console.log("- Error Show Video Layout Class : ", error)
		}
	}

	async selectVideoLayout({ container }) {
		try {
			this.#layoutVideoOptions.forEach((c) => {
				const radio = c.querySelector(".radio")
				if (c === container) {
					radio.src = "/assets/icons/radio_button_active.svg"
					this.#layoutVideo = c.dataset.option
				} else {
					radio.src = "/assets/icons/radio_button.svg"
				}
			})
			await this.statusLayoutCount()
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async selectLayoutCount({ container }) {
		try {
			if (this.#layoutVideo != 1) {
				return
			}
			this.#layoutCountContainer.forEach((c) => {
				const radio = c.querySelector(".mini-radio")
				if (c === container) {
					radio.src = "/assets/icons/mini_radio_active.svg"
					this.#layoutCount = c.dataset.option
				} else {
					radio.src = "/assets/icons/mini_radio.svg"
				}
			})
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async statusLayoutCount() {
		try {
			if (this.#layoutVideo == "1") {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.remove("custom-disable")
						container.removeAttribute("pointer-events")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				this.#alertVideoLayout.classList.add("hide-alert")
			} else {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.add("custom-disable")
						container.setAttribute("pointer-events", "none")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				this.#alertVideoLayout.classList.remove("hide-alert")
			}
		} catch (error) {
			console.log("- Error Status Layout Count : ", error)
		}
	}

	async recordMeeting({ from }) {
		try {
			if (!from && this.#recordStatus) {
				return
			}
			if (this.#recordStatus) {
				await this.normalHideAndDisplay({ element: this.#recordContainer, status: false })
				this.#recordButton.firstElementChild.src = "/assets/icons/record.svg"
				this.#recordButton.lastElementChild.innerHTML = "Mulai Merekam"
				this.#recordButton.removeAttribute("pointer-events")
			} else {
				await this.normalHideAndDisplay({ element: this.#recordContainer, status: true })
				this.#recordButton.firstElementChild.src = "/assets/icons/record_active.svg"
				this.#recordButton.lastElementChild.innerHTML = "Berhenti Merekam"
				this.#recordButton.setAttribute("pointer-events", "none")
			}
			this.#recordStatus = !this.#recordStatus
			await this.timer()
		} catch (error) {
			console.log("- Error Record Meeting : ", error)
		}
	}

	async timer() {
		try {
			if (!this.#elapsedTime) {
				this.#elapsedTime = 0
			}
			if (this.#recordStatus) {
				this.#startTime = Date.now() - this.#elapsedTime // Adjust startTime by the elapsed time

				this.#timerFunction = setInterval(() => {
					let currentTime = Date.now()
					this.#elapsedTime = currentTime - this.#startTime // Update elapsed time
					let hours = Math.floor(this.#elapsedTime / 3600000)
					let minutes = Math.floor((this.#elapsedTime % 3600000) / 60000)
					let seconds = Math.floor((this.#elapsedTime % 60000) / 1000)

					this.#timerCounter = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds

					this.#timerSpan.innerHTML = this.#timerCounter
				}, 1000)
			} else {
				this.#elapsedTime = undefined
				clearInterval(this.#timerFunction)
				this.#timerTitle.innerHTML = "Merekam :"
				await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: false })
				await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: true })
				this.#timerCounter = "00:00:00"
				this.#timerSpan.innerHTML = this.#timerCounter
			}
		} catch (error) {
			console.log("- Error Start Timer : ", error)
		}
	}

	async pauseRecord() {
		try {
			clearInterval(this.#timerFunction)
			this.#timerTitle.innerHTML = "Dijeda :"
			await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: false })
			await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: true })
		} catch (error) {
			console.log("- Error Pause Timer : ", error)
		}
	}

	async resumeRecord() {
		try {
			if (this.#recordStatus) {
				this.#timerTitle.innerHTML = "Merekam :"
				this.timer()
				await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: true })
				await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: false })
			}
		} catch (error) {
			console.log("- Error Resume Timer : ", error)
		}
	}

	async waitingUserHover({ element, picture }) {
		try {
			element.src = picture
		} catch (error) {
			console.log("- Error Waiting User Hover: ", error)
		}
	}

	// Method Join
	async methodAddWaitingUser({ id, username, socket }) {
		try {
			let userWaitingListElement = document.createElement("div")
			userWaitingListElement.className = "user-list-content"
			userWaitingListElement.id = `wait-${id}`
			userWaitingListElement.innerHTML = `
									<div class="user-list-profile">
										<img  src="/assets/icons/example_user.svg" alt="user-list-picture"
											class="user-list-picture" />
										<span class="user-list-username">${username}</span>
									</div>
									<div class="user-list-icons">
										<img style="cursor: pointer;" src="/assets/icons/accept.svg"
											alt="user-list-icon" class="user-list-icon" id="accept-${id}" />
										<img style="cursor: pointer;" src="/assets/icons/reject.svg" alt="user-list-icon" class="user-list-icon" 
										id="reject-${id}" />
									</div>
								`
			this.#userListWaiting.appendChild(userWaitingListElement)
			const currentUserWaitingAcceptElement = document.getElementById(`accept-${id}`)
			const acceptMouseOver = () => {
				try {
					currentUserWaitingAcceptElement.src = `/assets/icons/accept_active.svg`
				} catch (error) {
					console.log("- Error Mouse Over Accept : ", error)
				}
			}
			const acceptMouseLeave = () => {
				try {
					currentUserWaitingAcceptElement.src = `/assets/icons/accept.svg`
				} catch (error) {
					console.log("- Error Mouse Over Accept : ", error)
				}
			}

			const rejectMouseOver = () => {
				try {
					currentUserWaitingRejectElement.src = `/assets/icons/reject_active.svg`
				} catch (error) {
					console.log("- Error Mouse Over Reject : ", error)
				}
			}
			const rejectMouseLeave = () => {
				try {
					currentUserWaitingRejectElement.src = `/assets/icons/reject.svg`
				} catch (error) {
					console.log("- Error Mouse Over Accept : ", error)
				}
			}
			currentUserWaitingAcceptElement.addEventListener("mouseover", acceptMouseOver)
			currentUserWaitingAcceptElement.addEventListener("mouseleave", acceptMouseLeave)
			const currentUserWaitingRejectElement = document.getElementById(`reject-${id}`)
			currentUserWaitingRejectElement.addEventListener("mouseover", rejectMouseOver)
			currentUserWaitingRejectElement.addEventListener("mouseleave", rejectMouseLeave)

			const acceptEvent = () => {
				try {
					socket.emit("response-member-waiting", { response: true, id: id, roomId: this.#roomId })
					removeEventListener()
					this.checkWaitingList()
				} catch (error) {
					console.log("- Error Accept Waiting User : ", error)
				}
			}

			const rejectEvent = () => {
				try {
					socket.emit("response-member-waiting", { response: false, id: id, roomId: this.#roomId })
					removeEventListener()
					this.checkWaitingList()
				} catch (error) {
					console.log("- Error Accept Waiting User : ", error)
				}
			}

			currentUserWaitingAcceptElement.addEventListener("click", acceptEvent)

			currentUserWaitingRejectElement.addEventListener("click", rejectEvent)
			const removeEventListener = () => {
				try {
					currentUserWaitingAcceptElement.removeEventListener("mouseover", acceptMouseOver)
					currentUserWaitingAcceptElement.removeEventListener("mouseleave", acceptMouseLeave)
					currentUserWaitingRejectElement.removeEventListener("mouseover", rejectMouseOver)
					currentUserWaitingRejectElement.removeEventListener("mouseleave", rejectMouseLeave)
					currentUserWaitingAcceptElement.removeEventListener("click", acceptEvent)
					currentUserWaitingRejectElement.removeEventListener("click", rejectEvent)
					userWaitingListElement.remove()
				} catch (error) {
					console.log("- Error Remove Listener : ", error)
				}
			}
			await this.checkWaitingList()
		} catch (error) {
			console.log("- Error Add Waiting List User : ", error)
		}
	}

	async deleteWaitingUser({ id }) {
		try {
			const waitingUserList = document.getElementById(`wait-${id}`)
			if (waitingUserList) {
				await waitingUserList.remove()
			}

			await this.checkWaitingList()
		} catch (error) {
			console.log("- Error Delete Waiting User : ", error)
		}
	}

	// Method Check
	async checkWaitingList() {
		try {
			this.#userListWaiting = document.getElementById("waiting-list-users")
			if (this.#userListWaiting.firstElementChild) {
				await this.normalHideAndDisplay({ element: this.#userListWaitingContainer, status: true })
			} else {
				if (!this.#userListWaitingContainer.classList.contains("d-none")) {
					await this.normalHideAndDisplay({ element: this.#userListWaitingContainer, status: false })
				}
			}
		} catch (error) {
			console.log("- Error Check Waiting List : ", error)
		}
	}

	async deleteUserList({ id }) {
		try {
			const userListElement = document.getElementById(`ul-${id}`)
			if (userListElement) {
				userListElement.remove()
			}
		} catch (error) {
			console.log("- Error Delete User List : ", error)
		}
	}

	// Method Send Message
	async messageTemplate({ isSender, username, messageDate, message }) {
		try {
			const chatContent = document.getElementById("chat-content")
			if (isSender) {
				if (chatContent.children.length > 0) {
					const usernameLastMessage = chatContent?.lastElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.innerHTML
					const dateLastMessage = chatContent?.lastElementChild?.firstElementChild?.firstElementChild?.lastElementChild?.innerHTML
					if (usernameLastMessage == username && messageDate == dateLastMessage) {
						return `
						<div class="message-content">
							<div class="message-header d-none">
								<span>${username}</span>
								<span>${messageDate}</span>
							</div>
							<div class="user-message-container">
								<div class="message">
									<span>${message}</span>
								</div>
							</div>
						</div>
						<div class="message-profile">
							<img class="message-profile-photo d-none" src="/assets/icons/example_user.svg"
								alt="profile-picture" />
						</div>
					`
					}
				}
				return `
					<div class="message-content">
						<div class="message-header">
							<span>${username}</span>
							<span>${messageDate}</span>
						</div>
						<div class="user-message-container">
							<div class="message">
								<span>${message}</span>
							</div>
						</div>
					</div>
					<div class="message-profile">
						<img class="message-profile-photo" src="/assets/icons/example_user.svg"
							alt="profile-picture" />
					</div>
				`
			} else {
				if (chatContent.children.length > 0) {
					const usernameLastMessage = chatContent?.lastElementChild?.lastElementChild?.firstElementChild?.firstElementChild?.innerHTML
					const dateLastMessage = chatContent?.lastElementChild?.lastElementChild?.firstElementChild?.lastElementChild?.innerHTML
					if (usernameLastMessage == username && messageDate == dateLastMessage) {
						console.log(usernameLastMessage, "<><><><>", dateLastMessage)
						return `
						<div class="message-profile">
							<img class="message-profile-photo d-none" src="/assets/icons/example_user.svg"
								alt="profile-picture" />
						</div>
						<div class="message-content">
							<div class="message-header d-none">
								<span>${username}</span>
								<span>${messageDate}</span>
							</div>
							<div class="user-message-container">
								<div class="message">
									<span>${message}</span>
								</div>
							</div>
						</div>
					`
					}
				}
				return `
					<div class="message-profile">
						<img class="message-profile-photo" src="/assets/icons/example_user.svg"
							alt="profile-picture" />
					</div>
					<div class="message-content">
						<div class="message-header">
							<span>${username}</span>
							<span>${messageDate}</span>
						</div>
						<div class="user-message-container">
							<div class="message">
								<span>${message}</span>
							</div>
						</div>
					</div>
				`
			}
		} catch (error) {
			console.log("- Error Getting Message Template : ", error)
		}
	}

	async appendMessage({ message }) {
		try {
			const messageElement = document.createElement("div")
			messageElement.className = "message-container"
			messageElement.innerHTML = message
			this.#chatContent.appendChild(messageElement)
		} catch (error) {
			console.log("- Error Append Message : ", error)
		}
	}
}

module.exports = {
	EventListener,
}
