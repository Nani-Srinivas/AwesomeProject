import jwt from "jsonwebtoken";

export const verifyToken = async (req, reply) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Incoming Authorization Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization token missing or malformed.');
      return reply.status(401).send({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('Decoded token:', decoded);

    req.user = {
      id: decoded.id,
      roles: decoded.roles,
      storeId: decoded.storeId
    };

    return true;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return reply.status(403).send({ message: 'Invalid or expired token' });
  }
};

export const authorizeStoreManager = (req, reply, done) => {
  if (req.user.role !== 'StoreManager') {
    return reply.status(403).send({ message: 'Forbidden' });
  }
  done();
};