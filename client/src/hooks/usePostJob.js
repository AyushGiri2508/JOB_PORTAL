import { useState, useCallback } from 'react';
import { createJob, generateJobDescription } from '../api';

/**
 * Custom hook for posting a new job with optional AI description generation.
 */
export const usePostJob = (userCompany) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: userCompany || '',
    location: '',
    type: 'full-time',
    salary: '',
    skills: '',
    experience: 'Fresher',
    category: 'Technology',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await createJob(jobData);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleAiGenerate = useCallback(async () => {
    if (!formData.title) {
      throw new Error('Enter a job title first');
    }
    setAiLoading(true);
    try {
      const { data } = await generateJobDescription({
        title: formData.title,
        company: formData.company,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        type: formData.type,
        experience: formData.experience,
      });
      const jd = data.jobDescription;
      let description = jd.description || '';
      if (jd.responsibilities?.length) {
        description += '\n\nResponsibilities:\n' + jd.responsibilities.map((r) => `• ${r}`).join('\n');
      }
      if (jd.requirements?.length) {
        description += '\n\nRequirements:\n' + jd.requirements.map((r) => `• ${r}`).join('\n');
      }
      if (jd.niceToHave?.length) {
        description += '\n\nNice to Have:\n' + jd.niceToHave.map((r) => `• ${r}`).join('\n');
      }
      if (jd.benefits?.length) {
        description += '\n\nBenefits:\n' + jd.benefits.map((r) => `• ${r}`).join('\n');
      }
      setFormData((prev) => ({ ...prev, description }));
      return true;
    } catch (err) {
      throw err;
    } finally {
      setAiLoading(false);
    }
  }, [formData]);

  return {
    formData,
    setFormData,
    loading,
    aiLoading,
    handleSubmit,
    handleAiGenerate,
  };
};
