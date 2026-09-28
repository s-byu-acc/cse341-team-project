import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';

const cookieName = 'kizuna.sid';
const sessionDuration = 7 * 24 * 60 * 60 * 1000;
let sessionIndexPromise;

const getSessionCollection = async () => {
  const collection = mongoose.connection.db?.collection('sessions');
  if (!collection) {
    throw new Error('MongoDB must be connected before accessing sessions.');
  }

  if (!sessionIndexPromise) {
    sessionIndexPromise = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }

  try {
    await sessionIndexPromise;
  } catch (error) {
    sessionIndexPromise = null;
    throw error;
  }

  return collection;
};

const setSessionCookie = (req, res, sessionId) => {
  const attributes = [
    `${cookieName}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(sessionDuration / 1000)}`
  ];

  if (req.secure) attributes.push('Secure');
  res.append('Set-Cookie', attributes.join('; '));
};

const clearSessionCookie = (req, res) => {
  const attributes = [`${cookieName}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (req.secure) attributes.push('Secure');
  res.append('Set-Cookie', attributes.join('; '));
};

const sessionMiddleware = async (req, res, next) => {
  req.sessionId = null;
  req.session = null;
  req.user = null;
  res.locals.currentUser = null;

  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  const sessionId = cookie?.slice(cookieName.length + 1);

  try {
    if (sessionId && /^[a-f0-9]{64}$/.test(sessionId)) {
      const sessions = await getSessionCollection();
      const session = await sessions.findOne({ _id: sessionId, expiresAt: { $gt: new Date() } });

      if (session) {
        req.sessionId = sessionId;
        req.session = { user: session.user };
        req.user = session.user;
        res.locals.currentUser = session.user;

        const expiresAt = new Date(Date.now() + sessionDuration);
        await sessions.updateOne({ _id: sessionId }, { $set: { expiresAt } });
        setSessionCookie(req, res, sessionId);
      } else {
        clearSessionCookie(req, res);
      }
    }

    req.startSession = async (user) => {
      const sessions = await getSessionCollection();
      if (req.sessionId) await sessions.deleteOne({ _id: req.sessionId });

      const newSessionId = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + sessionDuration);
      await sessions.insertOne({ _id: newSessionId, user, expiresAt });

      req.sessionId = newSessionId;
      req.session = { user };
      req.user = user;
      res.locals.currentUser = user;
      setSessionCookie(req, res, newSessionId);
    };

    req.endSession = async () => {
      if (req.sessionId) {
        const sessions = await getSessionCollection();
        await sessions.deleteOne({ _id: req.sessionId });
      }

      req.sessionId = null;
      req.session = null;
      req.user = null;
      res.locals.currentUser = null;
      clearSessionCookie(req, res);
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default sessionMiddleware;