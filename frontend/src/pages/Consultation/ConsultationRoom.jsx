// ConsultationRoom.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Peer } from "peerjs";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneMissed } from "react-icons/fi";

const ConsultationRoom = () => {
  const { bookingId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [remoteUserName, setRemoteUserName] = useState("Participant");
  const [remoteUserId, setRemoteUserId] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const socketInstance = useRef(null);
  const localStreamRef = useRef(null);

  const fetchBookingAndJoinRoom = async (peerId) => {
    try {
      if (!peerId) throw new Error("Peer ID is not available");
      console.log("Joining room with:", { bookingId, peerId, userId: user._id });
      const res = await fetch(`${BASE_URL}/consultation-rooms/${bookingId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, peerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join room");
      setRoom(data.data);

      const otherParticipant = data.data.participants.find(
        (p) => p.userId.toString() !== user._id.toString()
      );
      if (otherParticipant) {
        setRemoteUserId(otherParticipant.userId);
        const userRes = await fetch(`${BASE_URL}/users/${otherParticipant.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        if (userData.success) setRemoteUserName(userData.data.name || "Participant");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to join room. Please try again.");
      // Avoid redirecting to login; stay on page for retry
    }
  };

  useEffect(() => {
    // Connect to the correct Socket.IO server URL (root path, not /api/v1)
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketInstance.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      toast.error("Connection error. Please check your network.");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    // Configure PeerJS to connect to the local PeerServer
    const peer = new Peer(undefined, {
      host: "localhost",
      port: 5001,
      path: "/peerjs",
    });
    peerInstance.current = peer;

    peer.on("open", (peerId) => {
      console.log("PeerJS ID generated:", peerId);
      fetchBookingAndJoinRoom(peerId);
      socket.emit("join-consultation", { bookingId, userId: user._id });
    });

    peer.on("error", (err) => {
      console.error("PeerJS error:", err);
      toast.error("Failed to initialize video call. Please try again.");
    });

    const setupMedia = async () => {
      try {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Video/audio failed, trying audio only:", err);
        try {
          let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          localStreamRef.current = stream;
          setIsVideoOn(false);
          toast.warn("Video unavailable. Proceeding with audio only.");
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (audioErr) {
          console.warn("Audio failed, proceeding without media:", audioErr);
          toast.warn("Camera and microphone unavailable. Joining without media.");
        }
      }

      if (localStreamRef.current) {
        socket.on("user-joined", ({ userId, socketId }) => {
          const call = peer.call(socketId, localStreamRef.current);
          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
        });

        peer.on("call", (call) => {
          call.answer(localStreamRef.current);
          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
        });
      }
    };

    setupMedia();

    socket.on("signal", ({ userId, signal }) => peer.signal(signal));

    return () => {
      socket.disconnect();
      peer.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, [bookingId, user._id, token, navigate]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOn(!isVideoOn);
    }
  };

  const endCall = async () => {
    try {
      await fetch(`${BASE_URL}/consultation-rooms/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });

      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((track) => track.stop());
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = null;

      navigate("/doctors/profile/me");
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end call");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Consultation Room - Booking #{bookingId}</h1>
        <div className="flex gap-4">
          {remoteUserId && user.role === "doctor" && (
            <button
              onClick={() => navigate(`/doctors/medical-folder/${remoteUserId}`)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-200"
            >
              View Medical Folder
            </button>
          )}
          <button
            onClick={endCall}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            <FiPhoneMissed /> End Call
          </button>
        </div>
      </header>
      <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <video ref={localVideoRef} autoPlay muted className="w-full h-96 object-cover" />
          <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded-lg">
            {user.name} (You)
          </div>
          {!localStreamRef.current && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">Camera Off</div>
          )}
        </div>
        <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <video ref={remoteVideoRef} autoPlay className="w-full h-96 object-cover" />
          <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded-lg">
            {remoteUserName}
          </div>
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Waiting for participant...
            </div>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 p-4 flex justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition duration-200 ${
            isMicOn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isMicOn ? <FiMicOff /> : <FiMic />}
          {isMicOn ? "Mute" : "Unmute"}
        </button>
        <button
          onClick={toggleVideo}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition duration-200 ${
            isVideoOn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isVideoOn ? <FiVideoOff /> : <FiVideo />}
          {isVideoOn ? "Video Off" : "Video On"}
        </button>
      </footer>
    </div>
  );
};

export default ConsultationRoom;