'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
    );
  }

  const getActiveIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (theme === 'dark') {
      return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
    return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  };

  const options = [
    {
      id: 'system',
      label: 'System',
      sublabel: 'Auto OS sync',
      icon: Monitor,
      color: 'text-amber-500',
    },
    {
      id: 'light',
      label: 'Light',
      sublabel: 'Crisp studio',
      icon: Sun,
      color: 'text-amber-500',
    },
    {
      id: 'dark',
      label: 'Dark',
      sublabel: 'Deep slate',
      icon: Moon,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition text-xs font-semibold shadow-xs"
        title={`Current Theme: ${theme.toUpperCase()} (${resolvedTheme} active)`}
        aria-label="Toggle Theme"
      >
        {getActiveIcon()}
        <span className="hidden xl:inline text-[11px] font-mono capitalize">
          {theme === 'system' ? 'System' : theme}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 opacity-70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Appearance
          </div>

          <div className="space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition font-medium ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                    <div className="text-left">
                      <div className="leading-tight">{opt.label}</div>
                      <div className="text-[9px] text-slate-400 leading-none pt-0.5">
                        {opt.sublabel}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
