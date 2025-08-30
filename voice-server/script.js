const socket = io('http://localhost:3000');
let localStream;
let peerConnection;
let roomName = '';

async function joinVoice() {
  roomName = document.getElementById('room').value.trim();
  if (!roomName) return alert("Oda adı gir knk");

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = e => {
      if (e.candidate) {
        socket.emit('ice-candidate', { room: roomName, candidate: e.candidate });
      }
    };

    peerConnection.ontrack = e => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = e.streams[0];
      remoteAudio.play();
    };

    socket.emit('join-room', roomName);
  } catch (err) {
    console.error("Mikrofon hatası:", err);
    alert("Mikrofon izni vermen gerekiyor knk.");
  }
}

socket.on('user-connected', async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', { room: roomName, offer });
});

socket.on('offer', async data => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', { room: roomName, answer });
});

socket.on('answer', async data => {
  await peerConnection.setRemoteDescription(data.answer);
});

socket.on('ice-candidate', async data => {
  await peerConnection.addIceCandidate(data.candidate);
});

function leaveVoice() {
  if (localStream) localStream.getTracks().forEach(track => track.stop());
  if (peerConnection) peerConnection.close();
  socket.emit('leave-room', roomName);
  console.log("Sohbetten çıkıldı.");
}
