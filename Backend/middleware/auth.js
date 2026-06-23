const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('Authorization');

  // 2. Check if no token exists
  if (!token) {
    return res.status(401).json({ error: "No token provided, authorization denied." });
  }

  try {
    // 3. If token format is "Bearer <token>", extract just the token part
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    // 4. Verify token validity using secret key from .env
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    
    // 5. Attach the decoded user payload to the request object
    req.user = decoded;
    
    // 6. Pass control to the next route handler function
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is invalid or expired." });
  }
};
