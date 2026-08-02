import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
  const authToken = req.headers.authorization;
  console.log("Auth Header:", authToken);

  if (!authToken || !authToken.startsWith("Bearer ")) {
    console.log("No token or invalid format");
    return res.status(401).json({ success: false, message: "No token or invalid format" });
  }

  try {
    const token = authToken.split(" ")[1];
    console.log("Verifying token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", decoded);

    if (!decoded || !decoded.role) {
      console.log("Invalid token payload");
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    req.userId = decoded.id || null;
    req.role = decoded.role;
    console.log("Set role:", req.role);
    next();
  } catch (err) {
    console.error("Token verification error:", err.message, err.stack);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token", error: err.message });
  }
};

export const restrict = (roles) => (req, res, next) => {
  console.log("Restrict middleware - Role:", req.role, "Required:", roles);

  const userRole = req.role;
  if (!userRole || !roles.includes(userRole)) {
    console.log("Unauthorized role:", userRole, "not in", roles);
    return res.status(403).json({ success: false, message: "Unauthorized role" });
  }

  console.log("Role authorized:", userRole);
  next();
};