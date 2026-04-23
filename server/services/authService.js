import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Format user object for response
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  avatar: user.avatar,
  skills: user.skills,
  experience: user.experience,
  bio: user.bio,
  location: user.location,
  phone: user.phone,
  resume: user.resume,
});

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, role, company }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const userData = { name, email, password, role };
  if (role === 'recruiter' && company) {
    userData.company = company;
  }

  const user = await User.create(userData);
  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
    },
  };
};

/**
 * Login user with email/password
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return { token, user: formatUser(user) };
};

/**
 * Google OAuth login/register
 */
export const googleAuth = async (credential) => {
  if (!credential) {
    const error = new Error('Google credential is required');
    error.statusCode = 400;
    throw error;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error('Google Client ID not configured on server');
    error.statusCode = 500;
    throw error;
  }

  const client = new OAuth2Client(clientId);
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (verifyError) {
    const error = new Error('Invalid Google token');
    error.statusCode = 401;
    throw error;
  }

  const { email, name, picture, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    user = await User.create({
      name,
      email,
      password: randomPassword,
      avatar: picture || '',
      role: 'jobseeker',
    });
  } else if (picture && !user.avatar) {
    user.avatar = picture;
    await user.save();
  }

  const token = generateToken(user._id);

  return { token, user: formatUser(user) };
};

/**
 * Get user by ID
 */
export const getUser = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, body) => {
  const allowedFields = ['name', 'phone', 'skills', 'experience', 'bio', 'company', 'location', 'avatar'];
  const updates = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  return user;
};
