import { useState, useCallback } from 'react';
import { updateProfile, uploadResume } from '../api';

/**
 * Custom hook for user profile management - edit profile and resume upload.
 */
export const useProfile = (user, updateUser) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    company: user?.company || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { data } = await updateProfile(updates);
      updateUser(data.user);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, [formData, updateUser]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await uploadResume(fd);
      updateUser({ ...user, resume: data.resumePath });
      return true;
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  }, [user, updateUser]);

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return {
    formData,
    setFormData,
    saving,
    uploading,
    handleSave,
    onDrop,
    getInitials,
  };
};
