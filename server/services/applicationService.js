import Application from '../models/Application.js';
import Job from '../models/Job.js';

/**
 * Apply to a job
 */
export const applyToJob = async (jobId, userId, userResume, coverLetter) => {
  const job = await Job.findById(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.status === 'closed') {
    const error = new Error('This job is no longer accepting applications');
    error.statusCode = 400;
    throw error;
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: userId,
  });

  if (existingApplication) {
    const error = new Error('You have already applied for this job');
    error.statusCode = 400;
    throw error;
  }

  const application = await Application.create({
    job: jobId,
    applicant: userId,
    resume: userResume || '',
    coverLetter: coverLetter || '',
  });

  const populatedApplication = await Application.findById(application._id)
    .populate('job', 'title company location type')
    .populate('applicant', 'name email skills experience');

  return populatedApplication;
};

/**
 * Get jobseeker's applications
 */
export const getMyApplications = async (userId) => {
  const applications = await Application.find({ applicant: userId })
    .populate({
      path: 'job',
      select: 'title company location type salary status deadline',
      populate: { path: 'postedBy', select: 'name company avatar' },
    })
    .sort({ createdAt: -1 });

  return applications;
};

/**
 * Get applications for a specific job (recruiter)
 */
export const getJobApplications = async (jobId, userId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.postedBy.toString() !== userId.toString()) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }

  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email phone skills experience resume avatar bio location')
    .sort({ createdAt: -1 });

  return { applications, job };
};

/**
 * Update application status (recruiter)
 */
export const updateApplicationStatus = async (appId, userId, status) => {
  if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  const application = await Application.findById(appId).populate('job');

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (application.job.postedBy.toString() !== userId.toString()) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }

  application.status = status;
  await application.save();

  const updatedApplication = await Application.findById(appId)
    .populate('applicant', 'name email phone skills experience resume avatar')
    .populate('job', 'title company');

  return updatedApplication;
};

/**
 * Get recruiter dashboard stats
 */
export const getDashboardStats = async (userId) => {
  const jobs = await Job.find({ postedBy: userId });
  const jobIds = jobs.map((j) => j._id);

  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
  const pendingApplications = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'pending',
  });
  const shortlistedApplications = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'shortlisted',
  });
  const hiredApplications = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'hired',
  });
  const rejectedApplications = await Application.countDocuments({
    job: { $in: jobIds },
    status: 'rejected',
  });

  // Recent applications
  const recentApplications = await Application.find({ job: { $in: jobIds } })
    .populate('applicant', 'name email avatar')
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === 'active').length,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    hiredApplications,
    rejectedApplications,
    recentApplications,
  };
};
