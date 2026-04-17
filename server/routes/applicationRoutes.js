import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getDashboardStats,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:jobId', protect, authorize('jobseeker'), applyToJob);
router.get('/me', protect, authorize('jobseeker'), getMyApplications);
router.get('/stats', protect, authorize('recruiter'), getDashboardStats);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

export default router;
