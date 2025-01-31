(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Promise.all([
	faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/plugins/face-api/models"),
])
	.then((_) => {
		return navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		})
	})
	.then((stream) => {
		startFRSecondMethod({ picture: `${window.location.origin}/photo/${userPhoto}.png`, id: "DIKY", name: "Diky", track: stream })
	})

const getLabeledFaceDescriptions = async ({ picture, name }) => {
	const descriptions = []
	for (let i = 1; i <= 2; i++) {
		const img = await faceapi.fetchImage(picture, name)
		const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
		if (detections) {
			descriptions.push(detections.descriptor)
		}
	}
	return new faceapi.LabeledFaceDescriptors(name, descriptions)
}

const startFRSecondMethod2 = async ({ picture, name, id, track }) => {
	try {
		const videoWrapper = document.getElementById("video-wrapper")
		const video = document.createElement("video")
		video.id = `temporary-video-fr-${id}`
		video.srcObject = new MediaStream([track.getVideoTracks()[0]])
		video.muted = true // Mute to prevent audio feedback
		video.autoplay = true // Ensure the video plays automatically
		video.style.width = "100%" // Set width for visibility
		video.style.height = "100%" // Set height for visibility
		video.style.border = "2px solid green" // Add a border to make sure the video is visible
		videoWrapper.appendChild(video) // Add to the DOM

		// Wait for the video to load metadata
		await new Promise((resolve, reject) => {
			video.onloadedmetadata = () => resolve()
			video.onerror = (err) => reject(err)
		})

		// Prepare face recognition
		const labeledFaceDescriptors = await getLabeledFaceDescriptions({ picture, name })
		const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45)

		// Create a canvas for face recognition overlays
		const canvas = faceapi.createCanvasFromMedia(video)
		canvas.style.position = "absolute" // Overlay on the video
		canvas.style.left = `0` // Align with the video
		canvas.style.top = `0` // Align with the video
		canvas.style.width = `100%` // Align with the video
		canvas.style.height = `100%` // Align with the video
		canvas.style.border = "2px solid red" // Add a border to see the canvas clearly
		videoWrapper.appendChild(canvas) // Add canvas to DOM

		const displaySize = { width: video.videoWidth, height: video.videoHeight }
		faceapi.matchDimensions(canvas, displaySize)

		// Start face recognition interval
		const frInterval = setInterval(async () => {
			const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
			const resizedDetections = faceapi.resizeResults(detections, displaySize)

			// Draw overlays on canvas
			const ctx = canvas.getContext("2d")
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			resizedDetections.forEach((detection) => {
				const result = faceMatcher.findBestMatch(detection.descriptor)
				const box = detection.detection.box
				const drawBox = new faceapi.draw.DrawBox(box, {
					label: result.toString(),
					boxColor: result._distance <= 0.45 ? "blue" : "red",
					drawLabelOptions: { fontSize: 8 },
					lineWidth: 0.2,
				})
				drawBox.draw(canvas)
			})
		}, 100)

		// Capture the video stream and canvas stream
		const annotatedStream = canvas.captureStream()
		const videoTrack = track.getVideoTracks()[0]
		const audioTrack = track.getAudioTracks()[0]

		// Create a combined stream that includes both the original video and the annotated stream
		const combinedStream = new MediaStream()

		// // Add both the original video track and the canvas (annotated) video track to the combined stream
		// combinedStream.addTrack(videoTrack) // Add original video track
		// combinedStream.addTrack(annotatedStream.getVideoTracks()[0]) // Add annotated video (canvas) track
        combinedStream.addTrack(annotatedStream.getVideoTracks()[0]) // Add original video track
		combinedStream.addTrack(videoTrack)
		if (audioTrack) {
			combinedStream.addTrack(audioTrack) // Add audio track if present
		}

		// Create a new video element to play the combined annotated stream
		const annotatedVideo = document.createElement("video")
		annotatedVideo.id = `annotated-video-${id}`
		annotatedVideo.srcObject = combinedStream
		annotatedVideo.autoplay = true
		annotatedVideo.style.width = "320px" // Set width for visibility
		annotatedVideo.style.height = "240px" // Set height for visibility
		annotatedVideo.style.border = "2px solid blue" // Add a border to make sure the video is visible
		document.getElementById("full-container").appendChild(annotatedVideo) // Add to the DOM

		// Create a new video element for the face recognition (FR) stream separately (for checking FR video independently)
		const newCanva = document.createElement("video")
		newCanva.id = `fr-video-${id}` // Set an id for the FR video element
		newCanva.srcObject = annotatedStream // Point to the annotated stream (canvas)
		newCanva.autoplay = true // Autoplay the FR video
		newCanva.style.width = "320px" // Set width for visibility
		newCanva.style.height = "240px" // Set height for visibility
		newCanva.style.border = "2px solid orange" // Border for the FR video
		document.getElementById("full-container").appendChild(newCanva) // Add FR video to the DOM

		// Play the combined annotated stream
		annotatedVideo.play()
		newCanva.play() // Also play the FR video

		// Return the combined annotated stream (if needed for further processing)
		return combinedStream
	} catch (error) {
		console.error("- Error Starting Face Recognition with Track: ", error)
		throw error
	}
}

const startFRSecondMethod = async ({ picture, name, id, track }) => {
	try {
		const videoWrapper = document.getElementById("video-wrapper");
		const video = document.createElement("video");
		video.id = `temporary-video-fr-${id}`;
		video.srcObject = new MediaStream([track.getVideoTracks()[0]]);
		video.muted = true; // Mute to prevent audio feedback
		video.autoplay = true; // Ensure the video plays automatically
		video.style.width = "100%"; // Set width for visibility
		video.style.height = "100%"; // Set height for visibility
		video.style.border = "2px solid green"; // Add a border to make sure the video is visible
		videoWrapper.appendChild(video); // Add to the DOM

		// Wait for the video to load metadata
		await new Promise((resolve, reject) => {
			video.onloadedmetadata = () => resolve();
			video.onerror = (err) => reject(err);
		});

		// Prepare face recognition
		const labeledFaceDescriptors = await getLabeledFaceDescriptions({ picture, name });
		const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45);

		// Create a canvas to render both video and face recognition overlays
		const canvas = faceapi.createCanvasFromMedia(video);
		canvas.style.position = "absolute"; // Overlay on the video
		canvas.style.left = `0`; // Align with the video
		canvas.style.top = `0`; // Align with the video
		canvas.style.border = "2px solid red"; // Add a border to see the canvas clearly
		canvas.style.display = "none"; // Add a border to see the canvas clearly
		videoWrapper.appendChild(canvas); // Add canvas to DOM

		// Use the video width and height for the canvas
		const displaySize = { width: video.videoWidth, height: video.videoHeight };
		faceapi.matchDimensions(canvas, displaySize);

		const ctx = canvas.getContext("2d");

		// Start face recognition interval using requestAnimationFrame for smooth rendering
		const frInterval = setInterval(async () => {
			// Draw the original video frame to the canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each draw
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Scale the video to fit the canvas

			// Perform face recognition
			const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
			const resizedDetections = faceapi.resizeResults(detections, displaySize);

			// Draw face recognition overlays
			resizedDetections.forEach((detection) => {
				const result = faceMatcher.findBestMatch(detection.descriptor);
				const box = detection.detection.box;
				const drawBox = new faceapi.draw.DrawBox(box, {
					label: result.toString(),
					boxColor: result._distance <= 0.45 ? "blue" : "red",
					drawLabelOptions: { fontSize: 8 },
					lineWidth: 0.2,
				});
				drawBox.draw(canvas);
			});
		}, 100);

		// Capture the canvas as a video stream (this combines both video and face recognition annotations)
		const combinedStream = canvas.captureStream();

		// Add the audio track if present
		const audioTrack = track.getAudioTracks()[0];

		// Create a new MediaStream to combine video, face recognition canvas, and audio
		const finalStream = new MediaStream();
		finalStream.addTrack(combinedStream.getVideoTracks()[0]); // Use the canvas as the video track
		if (audioTrack) {
			finalStream.addTrack(audioTrack); // Add audio track if present
		}

		// Create a new video element to display the final combined stream
		const finalVideo = document.createElement("video");
		finalVideo.id = `final-video-${id}`;
		finalVideo.srcObject = finalStream;
		finalVideo.autoplay = true;
		finalVideo.style.width = "320px"; // Set width for visibility
		finalVideo.style.height = "240px"; // Set height for visibility
		finalVideo.style.border = "2px solid blue"; // Border for the video
		document.getElementById("full-container").appendChild(finalVideo); // Add final video to the DOM

		// Play the final video stream
		finalVideo.play();

		// Return the combined stream
		return finalStream;
	} catch (error) {
		console.error("- Error Starting Face Recognition with Track: ", error);
		throw error;
	}
};

},{}]},{},[1]);
