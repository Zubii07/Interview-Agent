import { uploadResume, getResumeAndJD } from "../api/resumeApi";

export const ResumeService = {
  upload: async (formData) => {
    try {
      const res = await uploadResume(formData);
      return res.data;
    } catch (err) {
      throw err.response?.data || "Error uploading resume";
    }
  },
  fetch: async () => {
    try {
      const res = await getResumeAndJD();
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.error || err?.response?.data?.message;
      // Treat missing upload as a non-error so the UI doesn't flash errors on first visit
      if (status === 400 && typeof message === 'string' && message.toLowerCase().includes('not uploaded')) {
        return null;
      }
      throw err.response?.data || "Error fetching resume and JD";
    }
  },
};
