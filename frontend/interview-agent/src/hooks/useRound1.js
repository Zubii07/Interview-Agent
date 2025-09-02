import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { round1Service } from '../services/round1Service';

export function useRound1() {
  const [phase, setPhase] = useState("idle"); // idle | starting | asking | recording | submitting | finished | error
  const [currentQuestion, setCurrentQuestion] = useState(null); // {questionId, text, audioUrl}
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [history, setHistory] = useState([]); // {questionId, question, transcript, evaluation}
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const startedRef = useRef(false);

  const start = useCallback(async () => {
    try {
      setPhase("starting");
      const info = await round1Service.startRound();
      const status = (info?.status || '').toLowerCase();
      // If backend indicates complete, go to summary explicitly
      if (status === 'complete' || status === 'completed') {
        try {
          const sum = await round1Service.getSummary();
          setSummary(sum?.result || sum || null);
        } catch (e) {
        }
        setPhase('finished');
        return;
      }

      const total = Number(info?.totalQuestions ?? 0) || 0;
      setHistory([]);
      setSummary(null);
      setProgress({ current: 0, total });
  if (total <= 0) {
        setError('No questions generated. Please retry.');
        setPhase('error');
        return;
      }
      setPhase("asking");
      await nextQuestion(); // kick off first question
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  
  }, []);

  const nextQuestion = useCallback(async () => {
    try {
      const q = await round1Service.getNextQuestion();
      if (q.done) {
        // If done immediately and nothing answered yet, treat as generation issue
        if ((progress.current || 0) === 0 && (progress.total || 0) > 0 && history.length === 0) {
          setError('No questions available right now. Please retry.');
          setPhase('error');
          return;
        }
        // No more questions → end the interview to compute summary
        const result = await round1Service.endInterview();
        setSummary(result?.result || result || null);
        setPhase("finished");
        return;
      }
      setCurrentQuestion(q);
      setPhase("asking");
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }, [history.length, progress.current, progress.total]);

  const submit = useCallback(
    async (audioBlob) => {
      if (!currentQuestion) return;
      try {
        setPhase("submitting");
        const { transcript, evaluation, completed, summary: finalSummary } =
          await round1Service.submitAnswer(currentQuestion.questionId, audioBlob);

        setHistory((h) => [
          ...h,
          {
            questionId: currentQuestion.questionId,
            question: currentQuestion.text,
            transcript,
            evaluation,
          },
        ]);

        setProgress((p) => ({ ...p, current: Math.min(p.current + 1, p.total) }));

        if (completed) {
          setSummary(finalSummary || (await round1Service.getSummary()));
          setPhase("finished");
        } else {
          await nextQuestion();
        }
      } catch (e) {
        setError(e.message);
        setPhase("error");
      }
    },
    [currentQuestion, nextQuestion]
  );

  // Retry: start a new round and reset state; backend should ensure uniqueness
  const retry = useCallback(async () => {
    setHistory([]);
    setSummary(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
    await start();
  }, [start]);

  // Rehydrate on refresh
  const rehydrate = useCallback(async () => {
    try {
      const status = await round1Service.getStatus();
      const rStatus = (status?.round_status || status?.status || '').toLowerCase();
      if (rStatus === 'complete' || rStatus === 'completed') {
        const sum = await round1Service.getSummary().catch(() => null);
        if (sum) {
          setSummary(sum);
        }
        setPhase('finished');
        return;
      }
      if (rStatus === 'in_progress') {
        setPhase('asking');
        await nextQuestion();
        return;
      }
      // not_started or unknown -> show idle (user must click Start)
      setPhase('idle');
    } catch {
      // not started yet
      setPhase("idle");
    }
  }, [nextQuestion]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      rehydrate();
    }
  }, [rehydrate]);

  const value = useMemo(
    () => ({
      phase,
      currentQuestion,
      progress,
      history,
      summary,
      error,
      start,
      retry,
      nextQuestion,
      submit,
    }),
    [phase, currentQuestion, progress, history, summary, error, start, retry, nextQuestion, submit]
  );

  return value;
}
