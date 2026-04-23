import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * Get all jobs with search, filter, pagination
 */
export const getJobs = async ({ search, type, category, location, experience, page = 1, limit = 12 }) => {
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

  return {
    jobs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get single job by ID
 */
export const getJobById = async (id) => {
  const job = await Job.findById(id)
    .populate('postedBy', 'name email company avatar')
    .populate('applications');

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  return job;
};

/**
 * Create a new job
 */
export const createJob = async (jobData, userId, userCompany) => {
  jobData.postedBy = userId;
  if (!jobData.company) {
    jobData.company = userCompany || 'Unknown Company';
  }

  const job = await Job.create(jobData);
  const populatedJob = await Job.findById(job._id).populate('postedBy', 'name email company avatar');

  return populatedJob;
};

/**
 * Update a job
 */
export const updateJob = async (id, userId, updates) => {
  let job = await Job.findById(id);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.postedBy.toString() !== userId.toString()) {
    const error = new Error('Not authorized to update this job');
    error.statusCode = 403;
    throw error;
  }

  job = await Job.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('postedBy', 'name email company avatar');

  return job;
};

/**
 * Delete a job
 */
export const deleteJob = async (id, userId) => {
  const job = await Job.findById(id);

  if (!job) {
    const error = new Error('Job not found');
    error.statusCode = 404;
    throw error;
  }

  if (job.postedBy.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this job');
    error.statusCode = 403;
    throw error;
  }

  await Job.findByIdAndDelete(id);
};

/**
 * Get recruiter's jobs with application counts
 */
export const getJobsByRecruiter = async (userId) => {
  const jobs = await Job.find({ postedBy: userId })
    .populate('postedBy', 'name email company avatar')
    .sort({ createdAt: -1 });

  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const applicationCount = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicationCount };
    })
  );

  return jobsWithCounts;
};
