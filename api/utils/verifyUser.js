import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(errorHandler(401, 'Please log in to access this resource'));
  }

  jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    if (err) {
      res.clearCookie('access_token');

      if (err.name === 'TokenExpiredError') {
        return next(errorHandler(401, 'Token expired. Please log in again'));
      }

      if (err.name === 'JsonWebTokenError') {
        return next(errorHandler(401, 'Invalid token. Please log in again'));
      }

      return next(errorHandler(401, 'Authentication failed. Please log in again'));
    }

    req.user = user;
    next();
  });
};