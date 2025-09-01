import { round1Api } from '../api/round1Api';
const resolveAudioUrl = (audioUrl) => {
  if (!audioUrl) return null;
  try {
    // If audioUrl is absolute, URL(...) returns as-is; if relative, base with VITE_API_BASE_URL
    return new URL(audioUrl, import.meta.env.VITE_API_BASE_URL).toString();
  } catch {
    return audioUrl; // fallback
  }
};

export const round1Service = {
  async startRound() {
    // Ensures interview & round exist and questions generated
  const data = await round1Api.start();
    const totalQuestions =
      data.total_questions ??
      data.questions_count ??
      data.totalQuestions ??
      (Array.isArray(data.questions) ? data.questions.length : undefined) ??
      0;
    const status = data.status ?? data.round_status ?? data.round?.status;
    return {
      interviewId: data.interview_id,
      roundId: data.round_id,
      totalQuestions,
      status,
    };
  },

  async getNextQuestion() {
    const data = await round1Api.getQuestionAudio();
    if (data?.message === "No more questions") return { done: true };
    // Sample response: {"question_id": 10, "text": "...", "audio_url": "/static/audio/q_10.mp3"}
    const { question_id, text, audio_url } = data;
    return {
      done: false,
      questionId: question_id,
      text,
      audioUrl: resolveAudioUrl(audio_url),
    };
  },

  async submitAnswer(questionId, audioBlob) {
  const data = await round1Api.submitAnswer(questionId, audioBlob);
    const { transcript, evaluation, completed, summary } = data;
    return { transcript, evaluation, completed, summary: summary || null };
  },

  async endInterview() {
  const data = await round1Api.endInterview();
    return data; // { final_result, status, round, message } OR Round-1 result json
  },

  async getSummary() {
  const data = await round1Api.getSummary();
  return data;
  },

  async getStatus() {
  const data = await round1Api.getInterviewStatus();
  return data;
  },
};
