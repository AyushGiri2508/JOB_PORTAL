import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import Job from '../models/Job.js';

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// @desc    Analyze resume with AI
// @route   POST /api/ai/analyze-resume
export const analyzeResume = async (req, res, next) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured. Please add your GEMINI_API_KEY to the server .env file.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume PDF' });
    }

    // Read filename for context
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Try to extract text from PDF
    let resumeText = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(fileBuffer);
      resumeText = pdfData.text;
    } catch (e) {
      resumeText = 'Unable to parse PDF content';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
console.log(model);
    const prompt = `You are an expert career advisor and resume analyst. Analyze the following resume text and provide a detailed JSON response with the following structure:
{
  "overallScore": <number 0-100>,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "extractedSkills": ["skill1", "skill2", ...],
  "experienceLevel": "fresher|junior|mid|senior|expert",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "atsScore": <number 0-100>,
  "atsTips": ["tip1", "tip2", ...],
  "careerSuggestions": ["career1", "career2", ...],
  "summary": "Brief professional summary of the candidate"
}

Resume text:
${resumeText}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the JSON response
    let analysis;
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      analysis = {
        overallScore: 0,
        strengths: [],
        weaknesses: [],
        extractedSkills: [],
        experienceLevel: 'unknown',
        suggestions: ['Unable to parse resume analysis'],
        atsScore: 0,
        atsTips: [],
        careerSuggestions: [],
        summary: response,
      };
    }

    // Clean up temp file if needed  
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Job Matching - match user skills to jobs
// @route   POST /api/ai/match-jobs
export const matchJobs = async (req, res, next) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured.',
      });
    }

    const { skills, experience, preferences } = req.body;
    const userSkills = skills || req.user.skills || [];
    const userExperience = experience || req.user.experience || 'Fresher';

    // Get active jobs
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name company')
      .limit(50);

    if (jobs.length === 0) {
      return res.json({ success: true, matches: [], message: 'No active jobs available' });
    }

    const jobListText = jobs
      .map(
        (j, i) =>
          `Job ${i + 1}: Title: ${j.title}, Company: ${j.company}, Skills: ${j.skills.join(', ')}, Experience: ${j.experience}, Type: ${j.type}, Location: ${j.location}`
      )
      .join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a job matching expert. Based on the candidate's profile, rank and match them to the most suitable jobs.

Candidate Profile:
- Skills: ${userSkills.join(', ')}
- Experience: ${userExperience}
- Preferences: ${preferences || 'None specified'}

Available Jobs:
${jobListText}

Return a JSON array of matched jobs with this structure:
[
  {
    "jobIndex": <0-based index>,
    "matchScore": <0-100>,
    "matchReasons": ["reason1", "reason2"],
    "missingSkills": ["skill1", "skill2"],
    "recommendation": "brief recommendation"
  }
]

Only include jobs with matchScore >= 30. Sort by matchScore descending. Return at most 10 matches.
IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let matchResults;
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      matchResults = JSON.parse(cleaned);
    } catch (e) {
      matchResults = [];
    }

    // Map back to actual job data
    const matches = matchResults
      .filter((m) => m.jobIndex >= 0 && m.jobIndex < jobs.length)
      .map((m) => ({
        job: jobs[m.jobIndex],
        matchScore: m.matchScore,
        matchReasons: m.matchReasons,
        missingSkills: m.missingSkills,
        recommendation: m.recommendation,
      }));

    res.json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate cover letter with AI
// @route   POST /api/ai/generate-cover-letter
export const generateCoverLetter = async (req, res, next) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured.',
      });
    }

    const { jobTitle, company, jobDescription, userName, userSkills, userExperience } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({ success: false, message: 'Job title and company are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Write a professional, compelling cover letter for the following job application:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription || 'Not provided'}

Applicant Details:
- Name: ${userName || req.user.name}
- Skills: ${(userSkills || req.user.skills || []).join(', ')}
- Experience: ${userExperience || req.user.experience || 'Not specified'}

Requirements:
1. Keep it professional but personable
2. Highlight relevant skills and experience
3. Show enthusiasm for the role
4. Keep it concise (250-350 words)
5. Use a modern, professional tone

Return the cover letter as plain text, not JSON.`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text();

    res.json({ success: true, coverLetter });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate job description with AI (for recruiters)
// @route   POST /api/ai/generate-job-description
export const generateJobDescription = async (req, res, next) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured.',
      });
    }

    const { title, company, skills, type, experience } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Job title is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Write a compelling, detailed job description for the following position:

Job Title: ${title}
Company: ${company || 'Not specified'}
Required Skills: ${(skills || []).join(', ') || 'Not specified'}
Job Type: ${type || 'Full-time'}
Experience Required: ${experience || 'Not specified'}

Requirements:
1. Include an engaging job overview/summary
2. List key responsibilities (5-8 bullet points)
3. List required qualifications (5-8 bullet points)
4. List nice-to-have qualifications (3-5 bullet points)
5. Include benefits/perks section
6. Use professional, inclusive language
7. Make it SEO-friendly

Return ONLY valid JSON with this structure:
{
  "description": "full job description in plain text with line breaks",
  "responsibilities": ["resp1", "resp2", ...],
  "requirements": ["req1", "req2", ...],
  "niceToHave": ["item1", "item2", ...],
  "benefits": ["benefit1", "benefit2", ...]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let jobDescription;
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jobDescription = JSON.parse(cleaned);
    } catch (e) {
      jobDescription = { description: response, responsibilities: [], requirements: [], niceToHave: [], benefits: [] };
    }

    res.json({ success: true, jobDescription });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Interview preparation tips
// @route   POST /api/ai/interview-prep
export const interviewPrep = async (req, res, next) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured.',
      });
    }

    const { jobTitle, company, jobDescription, skills } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ success: false, message: 'Job title is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert interview coach. Prepare comprehensive interview preparation material for:

Job Title: ${jobTitle}
Company: ${company || 'Not specified'}
Job Description: ${jobDescription || 'Not provided'}
Required Skills: ${(skills || []).join(', ') || 'Not specified'}

Return ONLY valid JSON with this structure:
{
  "technicalQuestions": [
    { "question": "...", "tip": "brief answer tip", "difficulty": "easy|medium|hard" }
  ],
  "behavioralQuestions": [
    { "question": "...", "tip": "brief answer tip using STAR method" }
  ],
  "companyResearchTips": ["tip1", "tip2", ...],
  "dosAndDonts": {
    "dos": ["do1", "do2", ...],
    "donts": ["dont1", "dont2", ...]
  },
  "preparationChecklist": ["item1", "item2", ...]
}

Include 5-7 technical questions, 4-5 behavioral questions. Make them specific to the role.
IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let prepMaterial;
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      prepMaterial = JSON.parse(cleaned);
    } catch (e) {
      prepMaterial = {
        technicalQuestions: [],
        behavioralQuestions: [],
        companyResearchTips: [],
        dosAndDonts: { dos: [], donts: [] },
        preparationChecklist: [],
      };
    }

    res.json({ success: true, prepMaterial });
  } catch (error) {
    next(error);
  }
};
