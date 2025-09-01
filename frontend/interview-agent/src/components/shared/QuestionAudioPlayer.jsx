
import React, { useEffect, useRef } from "react";
import { Volume2 } from 'lucide-react';

export default function QuestionAudioPlayer({ src, text }) {
  if (!src && !text) return null;

  const audioRef = useRef(null);

  // Auto-play whenever a new question audio URL arrives
  useEffect(() => {
    if (audioRef.current && src) {
      const play = async () => {
        try {
          await audioRef.current.play();
        } catch (_) {
          // Autoplay might be blocked by the browser until the user interacts.
          // We silently ignore the error; the user can press play manually.
        }
      };
      // Reset the currentTime to ensure restart on same element when src changes
      audioRef.current.currentTime = 0;
      play();
    }
  }, [src]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="bg-purple-100 rounded-full p-2 mr-3">
          <Volume2 className="w-4 h-4 text-purple-600" />
        </div>
        Current Question
      </h3>
      
      <div className="mb-4">
        {/* Hide the text content of the question from the UI */}
        {/* <div className="text-sm text-gray-600 mb-2">Question:</div>
        <div className="p-3 rounded bg-gray-50 border text-gray-700">{text}</div> */}
        {src ? (
          <audio
            ref={audioRef}
            src={src}
            key={src}
            controls
            autoPlay
            preload="auto"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full"
          />
        ) : (
          <div className="text-xs text-gray-400 mt-2">No audio available</div>
        )}
      </div>
    </div>
  );
}
