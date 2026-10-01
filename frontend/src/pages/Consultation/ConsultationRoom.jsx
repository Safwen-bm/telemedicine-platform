// Telemedecine\frontend\src\pages\Consultation\ConsultationRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Peer } from "peerjs";
import { toast } from "react-toastify";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneMissed, FiFolder } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL, SERVER_URL } from "../../config";

// PeerJS signaling runs on the same server as the API (see backend index.js).
const serverUrl = new URL(SERVER_URL);
const PEER_OPTIONS = {
  host: serverUrl.hostname,
  port: Number(serverUrl.port) || (serverUrl.protocol === "https:" ? 443 : 80),
  path: "/peerjs",
  secure: serverUrl.protocol === "https:",
};

try {
  const ice = JSON.parse(import.meta.env.VITE_ICE_SERVERS || "null");
  if (Array.isArray(ice)) PEER_OPTIONS.config = { iceServers: ice };
} catch {
  // ignore a malformed value and use PeerJS defaults
}

const getLocalStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return { stream, video: true };
  } catch {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      return { stream, video: false };
    } catch {
      return { stream: null, video: false };
    }
  }
};

const STATUS_LABEL = {
  connecting: "Connecting...",
  waiting: "Waiting for the other participant",
  connected: "Connected",
};

const ConsultationRoom = () => {
  const { bookingId } = useParams();
  const { user, token, role } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUser, setRemoteUser] = useState({ id: null, name: "Participant" });
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (!user?._id || !token) return undefined;

    let cancelled = false;
    let socket = null;
    let peer = null;
    let peerId = null;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const fail = (message) => {
      if (cancelled) return;
      setErrorMessage(message);
      setStatus("error");
    };

    const announce = () => {
      if (socket?.connected && peerId) {
        socket.emit("join-consultation", { bookingId, userId: user._id, peerId });
      }
    };

    const handleCall = (call) => {
      callRef.current = call;
      call.on("stream", (remote) => {
        if (cancelled) return;
        setRemoteStream(remote);
        setStatus("connected");
      });
      call.on("close", () => {
        if (cancelled) return;
        setRemoteStream(null);
        setStatus("waiting");
      });
      call.on("error", () => toast.error("The call was interrupted."));
    };

    const init = async () => {
      // 1. Is this user allowed here, and who is on the other side?
      try {
        const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, { headers });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "You do not have access to this consultation");
        const other = role === "doctor" ? data.data.user : data.data.doctor;
        if (!cancelled) setRemoteUser({ id: other?._id || null, name: other?.name || "Participant" });
      } catch (err) {
        fail(err.message);
        return;
      }
      if (cancelled) return;

      // 2. Camera and microphone BEFORE the peer exists, so an incoming call
      //    can be answered the moment it arrives.
      const { stream, video } = await getLocalStream();
      if (cancelled) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOn(video);
      if (!stream) {
        toast.warn("Camera and microphone are unavailable. The other person will not see or hear you.");
      } else if (!video) {
        toast.warn("Video unavailable. Continuing with audio only.");
      }
      const outgoing = stream || new MediaStream();

      // 3. Realtime connection and PeerJS.
      socket = io(SERVER_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      socket.on("connect", announce);
      socket.on("connect_error", () => toast.error("Connection error. Please check your network."));
      socket.on("join-error", ({ message }) => fail(message));
      socket.on("user-joined", ({ peerId: remotePeerId }) => {
        if (peer && remotePeerId) handleCall(peer.call(remotePeerId, outgoing));
      });

      peer = new Peer(undefined, PEER_OPTIONS);
      peer.on("call", (call) => {
        call.answer(outgoing);
        handleCall(call);
      });
      peer.on("error", (err) => {
        console.error("PeerJS error:", err);
        toast.error("Video connection problem. Please refresh the page.");
      });
      peer.on("open", async (id) => {
        peerId = id;
        try {
          const res = await fetch(`${BASE_URL}/consultation-rooms/${bookingId}/join`, {
            method: "POST",
            headers,
            body: JSON.stringify({ bookingId, peerId: id }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to join the room");
        } catch (err) {
          fail(err.message);
          return;
        }
        if (cancelled) return;
        setStatus("waiting");
        announce();
      });
    };

    init();

    return () => {
      cancelled = true;
      callRef.current?.close();
      socket?.disconnect();
      peer?.destroy();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
  }, [bookingId, user?._id, token, role]);

  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    if (!tracks.length) return;
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setIsMicOn((on) => !on);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    if (!tracks.length) return;
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setIsVideoOn((on) => !on);
  };

  const leave = () => navigate(role === "doctor" ? "/doctors/profile/me" : "/users/profile/me");

    const endCall = async () => {
      if (
        role === "doctor" &&
        !window.confirm("End the consultation? The appointment will be marked as completed.")
      ) {
        return;
      }
    try {
      await fetch(`${BASE_URL}/consultation-rooms/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Could not close the room on the server");
    }
    leave();
  };

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <h1 className="font-heading text-[32px] font-semibold text-paper">Cannot open this consultation</h1>
        <p className="mt-3 max-w-md text-[16px] text-paper/70">{errorMessage}</p>
        <button
          type="button"
          onClick={leave}
          className="mt-8 rounded-[8px] bg-coral px-6 py-3 font-semibold text-white hover:bg-paper hover:text-ink"
        >
          Back to my account
        </button>
      </div>
    );
  }

  const controlBase =
    "flex h-12 w-12 items-center justify-center rounded-full text-[20px] transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const hasAudio = !!localStream?.getAudioTracks().length;
  const hasVideo = !!localStream?.getVideoTracks().length;

  return (
    <div className="flex h-screen flex-col bg-ink text-paper">
      <header className="flex items-center justify-between gap-4 border-b border-paper/10 px-5 py-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-[20px] font-semibold text-paper">
            Consultation with {remoteUser.name}
          </p>
          <p className="text-[12px] text-paper/50">Booking #{bookingId.slice(-6)}</p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold ${
            status === "connected" ? "bg-emerald-500/20 text-emerald-300" : "bg-paper/10 text-paper/70"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              status === "connected" ? "bg-emerald-400" : "animate-blink bg-yellowColor"
            }`}
          />
          {STATUS_LABEL[status]}
        </span>
      </header>

      <main className="relative flex-1 overflow-hidden p-4">
        <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />

          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-paper/70">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-paper/10 font-heading text-[32px]">
                {remoteUser.name.charAt(0).toUpperCase()}
              </span>
              <p className="text-[16px]">
                {status === "connecting" ? "Setting up the room..." : `Waiting for ${remoteUser.name}...`}
              </p>
            </div>
          )}

          <div className="absolute bottom-4 right-4 h-36 w-52 overflow-hidden rounded-[10px] border border-paper/20 bg-ink shadow-panelShadow sm:h-44 sm:w-64">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
            {(!hasVideo || !isVideoOn) && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink text-[13px] text-paper/60">
                Camera off
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-2 py-0.5 text-[12px]">
              You
            </span>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-4 border-t border-paper/10 px-5 py-4">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!hasAudio}
          aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
          className={`${controlBase} ${isMicOn ? "bg-paper/10 hover:bg-paper/20" : "bg-coral"}`}
        >
          {isMicOn ? <FiMic /> : <FiMicOff />}
        </button>
        <button
          type="button"
          onClick={toggleVideo}
          disabled={!hasVideo}
          aria-label={isVideoOn ? "Turn camera off" : "Turn camera on"}
          className={`${controlBase} ${isVideoOn ? "bg-paper/10 hover:bg-paper/20" : "bg-coral"}`}
        >
          {isVideoOn ? <FiVideo /> : <FiVideoOff />}
        </button>

        {remoteUser.id && role === "doctor" && (
          <button
            type="button"
            onClick={() =>
              window.open(`/doctors/medical-folder/${remoteUser.id}`, "_blank", "noopener")
            }
            className="flex h-12 items-center gap-2 rounded-full bg-paper/10 px-5 text-[14px] font-semibold hover:bg-paper/20"
          >
            <FiFolder /> Medical folder
          </button>
        )}

        <button
          type="button"
          onClick={endCall}
          className="flex h-12 items-center gap-2 rounded-full bg-red-600 px-6 text-[14px] font-semibold hover:bg-red-700"
        >
          <FiPhoneMissed /> {role === "doctor" ? "End consultation" : "Leave"}
        </button>
      </footer>
    </div>
  );
};

export default ConsultationRoom;