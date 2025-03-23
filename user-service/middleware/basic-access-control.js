import jwt from 'jsonwebtoken';
import { findUserById as _findUserById } from '../model/repository.js';

// When the user logs in, an access token is created (see auth-controller.js handleLogin function).
// This access token can then be verified since we have the JWT_SECRET.
// This token can also then be further decoded to view its contents.
// What this all means is that we can verify the token then decode it.
// If it passes the verification then we can be sure that the token is not tempered with
// which means we now have some basic authentication system.
// As for why is it like that, see nginx README.md.

export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // request auth header: `Authorization: Bearer + <access_token>`
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // load latest user info from DB
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    req.user = { id: dbUser.id, username: dbUser.username, email: dbUser.email, isAdmin: dbUser.isAdmin };
    next();
  });
}

function decodeToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw new Error('No token provided');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function verifyIsAdmin(req, res, next) {
  try {
    req.user = decodeToken(req);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized to access this resource' });
  }
}

export function verifyIsOwnerOrAdmin(req, res, next) {
  try {
    req.user = decodeToken(req);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (req.user.isAdmin) {
    return next();
  }

  const userIdFromReqParams = req.params.id;
  const userIdFromToken = req.user.id;
  if (userIdFromReqParams === userIdFromToken) {
    return next();
  }

  return res.status(403).json({ message: 'Not authorized to access this resource' });
}
