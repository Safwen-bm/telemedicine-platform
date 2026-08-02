import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = "admin@teleconsult.com"; 
    const ADMIN_PASSWORD = "admin123"; 

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET_KEY); 
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login error" });
  }
};