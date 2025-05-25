const jwt = require("jsonwebtoken");

// Middleware to authenticate the token
const authenticate = (req, res, next) => {
  console.log("Authorization header:", req.headers.authorization); // Debugging log
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("Decoded token:", decoded); // Debugging log
    req.user = { ...decoded, _id: decoded.id };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(400).json({ error: "Invalid token" });
  }
};

// Middleware to authorize specific roles
const roleAuthorization = (roles) => (req, res, next) => {
  console.log("User role:", req.user?.role); // Debugging log

  if (!req.user || !roles.includes(req.user.role)) {
    console.error("Insufficient permissions or missing user role");
    return res.status(403).json({ error: "Access denied. Insufficient permissions." });
  }

  next();
};

module.exports = { authenticate, roleAuthorization };
