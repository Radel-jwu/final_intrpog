const jwt = require('jsonwebtoken');

// JWT secret key (should match the one used for signing)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const auth = (req, res, next) => {
  console.log('Auth middleware called');
  
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid Bearer token found');
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
  
  const token = authHeader.split(' ')[1];

  try {
    console.log('Verifying token');
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', decoded.email);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  console.log('Authorize middleware called for roles:', roles);
  
  // If roles is a string, convert to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    auth,
    (req, res, next) => {
      console.log('User role:', req.user.role);
      
      if (roles.length && !roles.includes(req.user.role)) {
        console.log('User role not authorized');
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }
      
      console.log('User authorized');
      next();
    }
  ];
};

module.exports = { auth, authorize }; 