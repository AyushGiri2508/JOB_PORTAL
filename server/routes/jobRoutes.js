import express from 'express';
import { getJobs, getJob, createJob, updateJob, deleteJob, getMyJobs } from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

export default router;
