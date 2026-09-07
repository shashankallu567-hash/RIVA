'use client';

import React from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening }) => {
  if (!isListening) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900/90 border border-emerald-500/40 rounded-xl my-2 animate-fadeIn">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2" />
        <span className="text-xs font-semibold text-emerald-400 mr-3">RIVA Voice Engine Listening...</span>
      </div>
      <div className="flex items-center gap-1 h-6">
        {[40, 75, 100, 60, 90, 45, 80, 50, 70, 30].map((height, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-emerald-600 to-teal-300 rounded-full animate-wave"
            style={{
              height: `${height}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
