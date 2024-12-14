const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  // Check for the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Please login to continue." });
  }

  try {
    // Extract token from the Authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database without the password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Attach user to the request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Token validation error:", error);

    // Send an appropriate error message based on the type of error
    return res.status(401).json({
      message: "Not authorized. Invalid or expired token."
    });
  }
};

module.exports = { protect };