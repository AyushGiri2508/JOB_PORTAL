import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import Job from '../models/Job.js';

/**
 * Get Gemini AI instance
 */
const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Clean JSON response from AI (strip markdown code blocks)
 */
const cleanJsonResponse = (text) => {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
};

/**
 * Ensure Gemini is configured, throw if not
 */
const ensureGenAI = () => {
  const genAI = getGenAI();
  if (!genAI) {
    const error = new Error('Gemini API key not configured. Please add your GEMINI_API_KEY to the server .env file.');
    error.statusCode = 400;
    throw error;
  }
  return genAI;
};

/**
 * Analyze resume with AI
 */
export const analyzeResume = async (filePath) => {
  const genAI = ensureGenAI();

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

  let analysis;
  try {
    analysis = JSON.parse(cleanJsonResponse(response));
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

  return analysis;
};

/**
 * AI Job Matching - match user skills to jobs
 */
export const matchJobs = async (userSkills, userExperience, preferences) => {
  const genAI = ensureGenAI();

  // Get active jobs
  const jobs = await Job.find({ status: 'active' })
    .populate('postedBy', 'name company')
    .limit(50);

  if (jobs.length === 0) {
    return [];
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
    matchResults = JSON.parse(cleanJsonResponse(response));
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

  return matches;
};

/**
 * Generate cover letter with AI
 */
export const generateCoverLetter = async ({ jobTitle, company, jobDescription, userName, userSkills, userExperience }) => {
  const genAI = ensureGenAI();

  if (!jobTitle || !company) {
    const error = new Error('Job title and company are required');
    error.statusCode = 400;
    throw error;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Write a professional, compelling cover letter for the following job application:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription || 'Not provided'}

Applicant Details:
- Name: ${userName}
- Skills: ${(userSkills || []).join(', ')}
- Experience: ${userExperience || 'Not specified'}

Requirements:
1. Keep it professional but personable
2. Highlight relevant skills and experience
3. Show enthusiasm for the role
4. Keep it concise (250-350 words)
5. Use a modern, professional tone

Return the cover letter as plain text, not JSON.`;

  const result = await model.generateContent(prompt);
  const coverLetter = result.response.text();

  return coverLetter;
};

/**
 * Generate job description with AI (for recruiters)
 */
export const generateJobDescription = async ({ title, company, skills, type, experience }) => {
  const genAI = ensureGenAI();

  if (!title) {
    const error = new Error('Job title is required');
    error.statusCode = 400;
    throw error;
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
    jobDescription = JSON.parse(cleanJsonResponse(response));
  } catch (e) {
    jobDescription = { description: response, responsibilities: [], requirements: [], niceToHave: [], benefits: [] };
  }

  return jobDescription;
};

/**
 * AI Interview preparation tips
 */
export const interviewPrep = async ({ jobTitle, company, jobDescription, skills }) => {
  const genAI = ensureGenAI();

  if (!jobTitle) {
    const error = new Error('Job title is required');
    error.statusCode = 400;
    throw error;
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
    prepMaterial = JSON.parse(cleanJsonResponse(response));
  } catch (e) {
    prepMaterial = {
      technicalQuestions: [],
      behavioralQuestions: [],
      companyResearchTips: [],
      dosAndDonts: { dos: [], donts: [] },
      preparationChecklist: [],
    };
  }

  return prepMaterial;
};
