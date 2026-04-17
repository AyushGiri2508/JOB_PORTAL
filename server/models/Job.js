import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    salary: {
      type: String,
      default: 'Not disclosed',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: 'Fresher',
    },
    category: {
      type: String,
      enum: [
        'Technology',
        'Marketing',
        'Finance',
        'Design',
        'Sales',
        'HR',
        'Engineering',
        'Healthcare',
        'Education',
        'Other',
      ],
      default: 'Other',
    },
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
});

// Text index for search
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });

const Job = mongoose.model('Job', jobSchema);
export default Job;
