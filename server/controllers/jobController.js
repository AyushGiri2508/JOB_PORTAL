import Job from '../models/Job.js';

// @desc    Get all jobs (with search, filter, pagination)
// @route   GET /api/jobs
export const getJobs = async (req, res, next) => {
  try {
    const { search, type, category, location, experience, page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (experience) query.experience = experience;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company avatar')
      .populate('applications');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job
// @route   POST /api/jobs
export const createJob = async (req, res, next) => {
  try {
    req.body.postedBy = req.user._id;
    if (!req.body.company) {
      req.body.company = req.user.company || 'Unknown Company';
    }

    const job = await Job.create(req.body);
    const populatedJob = await Job.findById(job._id).populate('postedBy', 'name email company avatar');

    res.status(201).json({ success: true, job: populatedJob });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('postedBy', 'name email company avatar');

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/my-jobs
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email company avatar')
      .sort({ createdAt: -1 });

    // Get application counts for each job
    const Application = (await import('../models/Application.js')).default;
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount };
      })
    );

    res.json({ success: true, jobs: jobsWithCounts });
  } catch (error) {
    next(error);
  }
};
