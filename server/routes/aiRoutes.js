import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  analyzeResume,
  matchJobs,
  generateCoverLetter,
  generateJobDescription,
  interviewPrep,
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze-resume', protect, upload.single('resume'), analyzeResume);
router.post('/match-jobs', protect, authorize('jobseeker'), matchJobs);
router.post('/generate-cover-letter', protect, generateCoverLetter);
router.post('/generate-job-description', protect, authorize('recruiter'), generateJobDescription);
router.post('/interview-prep', protect, interviewPrep);

export default router;
