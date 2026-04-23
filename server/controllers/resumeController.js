import * as resumeService from '../services/resumeService.js';

// @desc    Upload resume
// @route   POST /api/resume/upload
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const result = await resumeService.uploadResume(req.user._id, req.file.path);

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumePath: result.resumePath,
      fileName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download resume
// @route   GET /api/resume/download/:userId
export const downloadResume = async (req, res, next) => {
  try {
    const { filePath, fileName } = await resumeService.getResumeForDownload(req.params.userId);
    res.download(filePath, fileName);
  } catch (error) {
    next(error);
  }
};
