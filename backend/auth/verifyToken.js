import jwt from "jsonwebtoken";

// Shared by the HTTP middleware and the socket.io handshake.
export const verifyJwt = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ["HS256"] });
  if (!decoded?.id || !decoded?.role) {
    throw new Error("Invalid token payload");
  }
  return decoded;
};

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token or invalid format" });
  }

  try {
    const decoded = verifyJwt(header.split(" ")[1]);
    req.userId = String(decoded.id);
    req.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const restrict = (roles) => (req, res, next) => {
  if (!req.role || !roles.includes(req.role)) {
    return res.status(403).json({ success: false, message: "Unauthorized role" });
  }
  next();
};