// In production, set VITE_API_URL on your host. Locally it falls back to localhost.
export const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Server root without /api/v1, for the socket.io connection in the video room.
export const SERVER_URL = BASE_URL.replace(/\/api\/v1\/?$/, "");