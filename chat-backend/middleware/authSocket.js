const jwt = require('jsonwebtoken');

const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    socket.user = decoded; 
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

module.exports = verifySocketToken;
