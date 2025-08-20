import api from "./client";

export const uploadResume = async (formData) => {
    return api.post(`/upload-resume`, formData);
};

export const getResumeAndJD = async () => {
    return api.get(`/get-resume-jd`);
};
