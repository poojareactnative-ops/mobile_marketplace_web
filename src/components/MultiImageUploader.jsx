'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud, Image as ImageIcon, Trash2, Star, Plus,
  CheckCircle2, AlertCircle, Loader2, Link2, Sparkles, X
} from 'lucide-react';
import { uploadMultipleProductImages, fileToDataUrl } from '../services/storageService';
import { POPULAR_PRESET_IMAGES } from '../utils/productImages';

export default function MultiImageUploader({
  images = [],
  onChange,
  maxImages = 6,
  className = '',
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('UPLOAD'); // 'UPLOAD' | 'URL' | 'PRESETS'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const currentList = Array.isArray(images) ? images.filter(Boolean) : [];

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const availableSlots = maxImages - currentList.length;

    if (availableSlots <= 0) {
      setErrorMessage(`You have reached the maximum limit of ${maxImages} images.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setErrorMessage('');
    setIsUploading(true);

    try {
      // 1. Attempt uploading directly to Supabase Storage bucket 'product-images'
      const uploadedItems = await uploadMultipleProductImages(
        filesToUpload,
        { bucket: 'product-images', folder: 'products' },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const newUrls = uploadedItems.map((item) => item.url);
      if (onChange) {
        onChange([...currentList, ...newUrls]);
      }
    } catch (err) {
      console.warn('[MultiImageUploader] Supabase storage upload warning:', err.message);

      // If bucket is not yet created, offer fallback to local Data URLs so user isn't blocked
      try {
        const fallbackUrls = [];
        for (const file of filesToUpload) {
          const dataUrl = await fileToDataUrl(file);
          fallbackUrls.push(dataUrl);
        }
        if (onChange) {
          onChange([...currentList, ...fallbackUrls]);
        }
        setErrorMessage(
          'Note: Supabase bucket "product-images" is not set to public yet; images were loaded directly in preview mode.'
        );
      } catch (fallbackErr) {
        setErrorMessage(err.message || 'Failed to upload images.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    if (onChange) onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary) => {
    if (indexToPrimary === 0) return;
    const item = currentList[indexToPrimary];
    const rest = currentList.filter((_, idx) => idx !== indexToPrimary);
    if (onChange) onChange([item, ...rest]);
  };

  const handleAddCustomUrl = (e) => {
    e?.preventDefault();
    if (!customUrlInput || !customUrlInput.trim().startsWith('http')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }
    if (currentList.length >= maxImages) {
      setErrorMessage(`Max ${maxImages} images allowed.`);
      return;
    }
    setErrorMessage('');
    if (onChange) onChange([...currentList, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  const handleAddPreset = (presetUrl) => {
    if (currentList.length >= maxImages) {
      setErrorMessage(`Max ${maxImages} images allowed.`);
      return;
    }
    if (currentList.includes(presetUrl)) return;
    setErrorMessage('');
    if (onChange) onChange([...currentList, presetUrl]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header & Sub-Tabs */}
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-300 text-xs flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Product Images ({currentList.length}/{maxImages})</span>
          <span className="text-[10px] text-slate-500 font-normal">(Multiple photos supported)</span>
        </label>

        {/* Source switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('UPLOAD')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'UPLOAD' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload Files</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PRESETS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'PRESETS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('URL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeTab === 'URL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FILE UPLOADER (DRAG & DROP TO SUPABASE STORAGE) */}
      {activeTab === 'UPLOAD' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="multi-image-file-input"
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!isUploading && currentList.length < maxImages && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            } ${currentList.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <div className="space-y-2 py-2">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                <div className="text-xs font-bold text-white">
                  Uploading to Supabase Storage... {uploadProgress?.current}/{uploadProgress?.total}
                </div>
                <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mx-auto">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress?.percentage || 30}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    <span className="text-amber-400 underline">Click to choose images</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select multiple JPG, PNG, or WEBP photos (up to {maxImages - currentList.length} more)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRESET IMAGES PICKER */}
      {activeTab === 'PRESETS' && (
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-400">Click a high-resolution preset photo to add it to your product:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POPULAR_PRESET_IMAGES.map((preset) => {
              const isSelected = currentList.includes(preset.url);
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPreset(preset.url)}
                  disabled={isSelected || currentList.length >= maxImages}
                  className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/10 opacity-70 cursor-default'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-slate-200 truncate">{preset.name}</div>
                    <div className="text-[9px] text-slate-500">{preset.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM IMAGE URL INPUT */}
      {activeTab === 'URL' && (
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-400">Paste any public image link (Unsplash, Imgur, Supabase CDN, etc.):</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://example.com/product-photo.jpg"
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="button"
              onClick={handleAddCustomUrl}
              disabled={currentList.length >= maxImages}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shrink-0"
            >
              Add Photo
            </button>
          </div>
        </div>
      )}

      {/* Error message alert */}
      {errorMessage && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="leading-snug">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="ml-auto text-amber-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CURRENT IMAGES GALLERY / REORDER / DELETE */}
      {currentList.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>Uploaded Photos ({currentList.length})</span>
            <span className="text-[10px] text-slate-500">First image is the main cover photo</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {currentList.map((url, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={`${url}-${idx}`}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border bg-slate-900 shadow-md transition ${
                    isCover
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Top Cover Pill */}
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] shadow uppercase tracking-wider flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Main</span>
                    </span>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition shadow"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="w-full py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[9px] shadow transition"
                        title="Set as main cover image"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick "+ Add More" slot */}
            {currentList.length < maxImages && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab !== 'UPLOAD') setActiveTab('UPLOAD');
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950/40 text-slate-500 hover:text-amber-400 transition flex flex-col items-center justify-center gap-1"
                title="Add another photo"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Add</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
