import path from 'path';
import User from '../models/User.js';

/**
 * Upload resume and update user record
 */
export const uploadResume = async (userId, filePath) => {
  await User.findByIdAndUpdate(userId, { resume: filePath });

  return { resumePath: filePath };
};

/**
 * Get resume file path for download
 */
export const getResumeForDownload = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.resume) {
    const error = new Error('Resume not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    filePath: path.resolve(user.resume),
    fileName: `${user.name}-resume.pdf`,
  };
};
