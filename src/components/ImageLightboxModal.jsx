'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from 'lucide-react';

export default function ImageLightboxModal({ isOpen, onClose, images = [], title = 'Device Photos' }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [isOpen, images]);

  if (!isOpen || !images || images.length === 0) return null;

  const validImages = Array.isArray(images) ? images.filter(Boolean) : [images];
  if (validImages.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const currentImage = validImages[currentIndex] || validImages[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        className="w-full max-w-4xl flex items-center justify-between pb-3 px-2 border-b border-white/10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-black">{title}</span>
          <span className="text-xs text-slate-400 ml-2 font-mono">
            ({currentIndex + 1} of {validImages.length})
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative w-full max-w-4xl flex-1 flex items-center justify-center p-2 sm:p-4 my-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Device condition inspection ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200"
        />

        {/* Prev / Next controls */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur shadow-xl transition transform hover:scale-110"
              title="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur shadow-xl transition transform hover:scale-110"
              title="Next Photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {validImages.length > 1 && (
        <div 
          className="flex items-center gap-2 max-w-full overflow-x-auto p-2 rounded-2xl bg-slate-900/80 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                currentIndex === idx
                  ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
