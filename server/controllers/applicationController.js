import Application from '../models/Application.js';
import Job from '../models/Job.js';

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
export const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume || '',
      coverLetter: req.body.coverLetter || '',
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location type')
      .populate('applicant', 'name email skills experience');

    res.status(201).json({ success: true, application: populatedApplication });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications (jobseeker)
// @route   GET /api/applications/me
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title company location type salary status deadline',
        populate: { path: 'postedBy', select: 'name company avatar' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job (recruiter)
// @route   GET /api/applications/job/:jobId
export const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone skills experience resume avatar bio location')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    const updatedApplication = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone skills experience resume avatar')
      .populate('job', 'title company');

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter dashboard stats
// @route   GET /api/applications/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
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

    res.json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === 'active').length,
        totalApplications,
        pendingApplications,
        shortlistedApplications,
        hiredApplications,
        rejectedApplications,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};
