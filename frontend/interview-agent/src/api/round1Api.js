import api from './client';

const unwrap = (res) => res.data;
const onError = (err) => {
  const status = err?.response?.status;
  const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Request failed";
  if (status === 401) {
    // Auth invalid → send user to login
    if (typeof window !== 'undefined') window.location.assign('/login');
  }
  throw new Error(msg);
};

export const round1Api = {
  start: () => api.post("/round1/start").then(unwrap).catch(onError),
  getQuestionAudio: () => api.get("/round1/get-question-audio").then(unwrap).catch(onError),
  submitAnswer: (questionId, audioBlob) => {
    const form = new FormData();
    form.append("audio", audioBlob, "answer.webm");
    return api.post(`/round1/submit-answer/${questionId}`, form).then(unwrap).catch(onError);
  },
  endInterview: () => api.post("/round1/end-interview").then(unwrap).catch(onError),
  getSummary: () => api.get("/round1/summary").then(unwrap).catch(onError),
  getInterviewStatus: () => api.get("/round1/get-interview-status").then(unwrap).catch(onError),
};
