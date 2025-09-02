import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Timer } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export default function AnswerRecorder({ disabled, onSubmit, maxSeconds = 90 }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunksRef = useRef([]);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onSubmit && onSubmit(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      // start timer
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) {
            // auto stop at cap
            stopRecording();
            return maxSeconds;
          }
          return s + 1;
        });
      }, 1000);
      setMediaRecorder(mr);
      setRecording(true);
  } catch {
  // Show a user-friendly error without logging to console
  toast.error('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Answer</h3>
        
        {/* Recording Controls */}
        <div className="text-center space-y-4">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
            recording ? 'bg-red-500 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'
          }`}>
            {recording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Timer className="w-4 h-4 mr-1" /> {seconds}s {maxSeconds ? <span className="ml-1 text-xs text-gray-400">/ {maxSeconds}s</span> : null}
          </div>
          
          <div className="space-y-2">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition"
              >
                {disabled ? 'Processing...' : 'Start Recording'}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Stop & Submit
              </button>
            )}
            
            <p className="text-xs text-gray-500">
              {recording ? 'Recording your answer...' : 'Click to start recording'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
