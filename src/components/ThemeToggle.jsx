'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="w-14 sm:w-16 h-7 sm:h-8 rounded-full bg-slate-800 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      className={`relative inline-flex items-center w-14 sm:w-16 h-7 sm:h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md ${
        isDark
          ? 'bg-black border border-slate-800'
          : 'bg-slate-900 border border-slate-700'
      }`}
      title={isDark ? 'Dark Mode Active • Click for Light Mode' : 'Light Mode Active • Click for Dark Mode'}
      aria-label="Toggle dark and light theme"
    >
      {/* Sun Icon (Right Side when in Dark Mode) */}
      <div
        className={`absolute right-2 sm:right-2.5 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          isDark ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-amber-500 stroke-[2.5]"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
      </div>

      {/* Moon Icon (Left Side when in Light Mode) */}
      <div
        className={`absolute left-2 sm:left-2.5 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          !isDark ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5] fill-indigo-400/20" />
      </div>

      {/* Sliding White Circular Knob */}
      <span
        className={`inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out shrink-0 ${
          isDark ? 'translate-x-0' : 'translate-x-7 sm:translate-x-8'
        }`}
      />
    </button>
  );
}