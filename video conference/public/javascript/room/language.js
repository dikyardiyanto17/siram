if (!localStorage.getItem("language")) {
	localStorage.setItem("language", "en")
} else {
	const language = localStorage.getItem("language")
	if (language !== "en" && language !== "id") {
		localStorage.setItem("language", "en")
	}
}

const changeLanguage = ({ language }) => {
	try {
		const changeLayout = document.getElementById("change-layout")
		const tiled = document.getElementById("tiled")
		const spotlight = document.getElementById("spotlight")
		const sidebarLayout = document.getElementById("sidebar-layout")
		const tiles = document.getElementById("tiles")
		const alertVideoLayout = document.getElementById("alert-video-layout")
		const videoQualityTitle = document.getElementById("video-quality-title")
		const participantTitle = document.getElementById("participants-title")
		const participantIconsTitle = document.getElementById("participants-icons-title")
		const chatIconsTitle = document.getElementById("chat-icons-title")
		const participantsInput = document.getElementById("search-participant")
		const raiseHandBox = document.getElementById("raise-hand-box")
		const waitingListBox = document.getElementById("waiting-list-box")
		const copied = document.getElementById("copied")
		const shareLinkTitle = document.getElementById("share-link-title")
		const muteAllButton = document.getElementById("mute-all-button")
		const chatTitle = document.getElementById("chat-title")
		const chatInput = document.getElementById("message-input")
		const microphoneTooltip = document.getElementById("microphone-tooltip")
		const microphoneOptionTitle = document.getElementById("microphone-option-title")
		const cameraTooltip = document.getElementById("camera-tooltip")
		const cameraOptionTitle = document.getElementById("camera-option-title")
		const shareLinkTooltip = document.getElementById("share-link-tooltip-title")
		const timerTitle = document.getElementById("timer-title")
		const participantsTooltipTitle = document.getElementById("participants-tooltip-title")
		const chatTooltipTitle = document.getElementById("chat-tooltip-title")
		const raiseHandTooltipTitle = document.getElementById("raise-hand-tooltip-title")
		const screenSharingTooltipTitle = document.getElementById("screen-sharing-tooltip-title")
		const startRecord = document.getElementById("start-record")
		const videoQualityMenu = document.getElementById("video-quality-menu")
		const layoutMenu = document.getElementById("layout-menu")
		const settingMenu = document.getElementById("setting-menu")

		if (language == "en") {
			changeLayout.innerHTML = "Layout"
			tiled.innerHTML = "Tiled"
			spotlight.innerHTML = "Spotlight"
			sidebarLayout.innerHTML = "Sidebar"
			tiles.innerHTML = "Tiles"
			alertVideoLayout.innerHTML = "Cannot change tiles in this layout"
			videoQualityTitle.innerHTML = "Video Quality"
			participantTitle.innerHTML = `Participants (<span id="user-list-total">1</span>)`
			participantsInput.placeholder = "Search Participants"
			raiseHandBox.innerHTML = "Raise Hands"
			waitingListBox.innerHTML = "Waiting List"
			copied.innerHTML = "Copied"
			shareLinkTitle.innerHTML = "Share Link"
			muteAllButton.innerHTML = "Mute All"
			chatTitle.innerHTML = "Chat"
			chatInput.placeholder = "Type Message..."
			microphoneTooltip.innerHTML = "Microphone"
			microphoneOptionTitle.innerHTML = "Microphone"
			cameraTooltip.innerHTML = "Camera"
			cameraOptionTitle.innerHTML = "Camera"
			timerTitle.innerHTML = "Recording"
			participantsTooltipTitle.innerHTML = "Participants"
			chatTooltipTitle.innerHTML = "Chat"
			raiseHandTooltipTitle.innerHTML = "Raise Hand"
			screenSharingTooltipTitle.innerHTML = "Screen Share"
			startRecord.innerHTML = "Start Record"
			videoQualityMenu.innerHTML = "Video Quality"
			layoutMenu.innerHTML = "Layout"
			settingMenu.innerHTML = "Setting"
			shareLinkTooltip.innerHTML = "Share Link"
			participantIconsTitle.innerHTML = "Participants"
			chatIconsTitle.innerHTML = "Chat"
		} else if (language == "id") {
			changeLayout.innerHTML = "Ubah Susunan"
			tiled.innerHTML = "Petak"
			spotlight.innerHTML = "Pembicara"
			sidebarLayout.innerHTML = "Petak Samping"
			tiles.innerHTML = "Jumlah Petak"
			alertVideoLayout.innerHTML = "Tidak bisa mengubah jumlah tampilan petak di tampilan ini"
			videoQualityTitle.innerHTML = "Kualitas Video"
			participantTitle.innerHTML = `Anggota (<span id="user-list-total">1</span>)`
			participantsInput.placeholder = "Cari Anggota"
			raiseHandBox.innerHTML = "Angkat Tangan"
			waitingListBox.innerHTML = "Ruang Tunggu"
			copied.innerHTML = "Tersalin"
			shareLinkTitle.innerHTML = "Bagikan Link"
			muteAllButton.innerHTML = "Bisukan Semua"
			chatInput.placeholder = "Tulis pesan..."
			chatTitle.innerHTML = "Pesan"
			microphoneTooltip.innerHTML = "Mikrofon"
			microphoneOptionTitle.innerHTML = "Mikrofon"
			cameraTooltip.innerHTML = "Kamera"
			cameraOptionTitle.innerHTML = "Kamera"
			timerTitle.innerHTML = "Merekam"
			participantsTooltipTitle.innerHTML = "Peserta"
			chatTooltipTitle.innerHTML = "Pesan"
			raiseHandTooltipTitle.innerHTML = "Angkat Tangan"
			screenSharingTooltipTitle.innerHTML = "Berbagi Layar"
			startRecord.innerHTML = "Mulai Merekam"
			videoQualityMenu.innerHTML = "Kualitas Video"
			layoutMenu.innerHTML = "Ubah Susunan"
			settingMenu.innerHTML = "Pengaturan"
			shareLinkTooltip.innerHTML = "Bagikan Link"
			participantIconsTitle.innerHTML = "Peserta"
			chatIconsTitle.innerHTML = "Pesan"
		} else {
			throw { name: "error", message: "language id is not valid" }
		}
	} catch (error) {
		console.log("- Error Change Languange")
	}
}

changeLanguage({ language: localStorage.getItem("language") })
