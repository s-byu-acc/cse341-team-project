import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Role } from '../models/schemas/roles.js';
import { User } from '../models/schemas/users.js';

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;

const normalize = (value) => (typeof value === 'string' ? value.trim() : '');

const safeReturnTo = (value) => (
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : '/'
);

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, passwordKeyLength);
  return `${salt}:${key.toString('hex')}`;
};

const verifyPassword = async (password, passwordHash) => {
  if (typeof passwordHash !== 'string') return false;
  const [salt, storedKey] = passwordHash.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(storedKey)) return false;

  const suppliedKey = await scrypt(password, salt, passwordKeyLength);
  const expectedKey = Buffer.from(storedKey, 'hex');
  return timingSafeEqual(suppliedKey, expectedKey);
};

const loginPage = (req, res) => {
  const returnTo = safeReturnTo(req.query.returnTo);
  if (req.user) return res.redirect(returnTo);

  return res.render('login', {
    title: 'Log in',
    error: null,
    identifier: '',
    returnTo
  });
};

const registerPage = (req, res) => {
  if (req.user) return res.redirect('/');

  return res.render('register', {
    title: 'Create account',
    error: null,
    form: { displayName: '', username: '', email: '' }
  });
};

const login = async (req, res) => {
  const body = req.body ?? {};
  const identifier = normalize(body.identifier).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const returnTo = safeReturnTo(body.returnTo);

  if (!identifier || !password) {
    return res.status(400).render('login', {
      title: 'Log in',
      error: 'Enter your username or email and password.',
      identifier,
      returnTo
    });
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }]
  }).populate('role').exec();

  if (!user?.role || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).render('login', {
      title: 'Log in',
      error: 'The username, email, or password is incorrect.',
      identifier,
      returnTo
    });
  }

  await req.startSession({
    id: user._id.toString(),
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    role: user.role.name
  });

  return res.redirect(returnTo);
};

const register = async (req, res) => {
  const body = req.body ?? {};
  const form = {
    displayName: normalize(body.displayName),
    username: normalize(body.username).toLowerCase(),
    email: normalize(body.email).toLowerCase()
  };
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmation = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  const renderError = (message, status = 400) => res.status(status).render('register', {
    title: 'Create account',
    error: message,
    form
  });

  if (!form.displayName || !form.username || !form.email || !password) {
    return renderError('Complete every field to create your account.');
  }
  if (form.displayName.length > 80) return renderError('Your display name must be 80 characters or fewer.');
  if (!/^[a-z0-9._-]{3,30}$/.test(form.username)) {
    return renderError('Use 3 to 30 characters for your username: letters, numbers, dots, underscores, or hyphens.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return renderError('Enter a valid email address.');
  if (password.length < 8 || password.length > 128) {
    return renderError('Choose a password between 8 and 128 characters.');
  }
  if (password !== confirmation) return renderError('The passwords do not match.');

  const existingUser = await User.findOne({
    $or: [{ username: form.username }, { email: form.email }]
  }).select('_id').lean().exec();

  if (existingUser) return renderError('That username or email is already registered.', 409);

  try {
    const role = await Role.findOneAndUpdate(
      { name: 'customer' },
      { $setOnInsert: { name: 'customer' } },
      { upsert: true, new: true }
    ).exec();

    const user = await User.create({
      ...form,
      passwordHash: await hashPassword(password),
      role: role._id
    });

    await req.startSession({
      id: user._id.toString(),
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      role: role.name
    });

    return res.redirect('/');
  } catch (error) {
    if (error.code === 11000) return renderError('That username or email is already registered.', 409);
    throw error;
  }
};

const logout = async (req, res) => {
  await req.endSession();
  return res.redirect('/');
};

export { login, loginPage, logout, register, registerPage };