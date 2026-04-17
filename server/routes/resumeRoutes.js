import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import User from '../models/User.js';
import path from 'path';

const router = express.Router();

// @desc    Upload resume
// @route   POST /api/resume/upload
router.post('/upload', protect, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    // Update user resume path
    await User.findByIdAndUpdate(req.user._id, { resume: req.file.path });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumePath: req.file.path,
      fileName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download resume
// @route   GET /api/resume/download/:userId
router.get('/download/:userId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const filePath = path.resolve(user.resume);
    res.download(filePath, `${user.name}-resume.pdf`);
  } catch (error) {
    next(error);
  }
});

export default router;
