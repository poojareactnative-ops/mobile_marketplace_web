import { supabase } from '../lib/supabase';

const PRIMARY_BUCKET = 'product-images';
const FALLBACK_BUCKET = 'products';

/**
 * Upload a single product image file to Supabase Storage
 * Returns the permanent public CDN URL
 */
export async function uploadProductImageFile(file, options = {}) {
  if (!file) throw new Error('No image file selected.');

  // Validate image type
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error(`Invalid file type "${file.type}". Please upload an image (PNG, JPG, WEBP, GIF).`);
  }

  // Max 10MB limit
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 10MB.`);
  }

  const folder = options.folder || 'products';
  const requestedBucket = options.bucket || PRIMARY_BUCKET;

  const rawExt = file.name ? file.name.split('.').pop() : 'jpg';
  const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const baseName = file.name
    ? file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
    : 'item';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filePath = `${folder}/${timestamp}_${randomSuffix}_${baseName}.${cleanExt}`;

  let targetBucket = requestedBucket;

  if (!supabase || !supabase.storage) {
    throw new Error('Supabase storage client is initializing. Please try again.');
  }

  let uploadResult = await supabase.storage
    .from(targetBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  // If primary bucket failed (e.g. Bucket not found), try fallback bucket
  if (uploadResult.error) {
    console.warn(`[Supabase Storage] Upload to bucket "${targetBucket}" failed:`, uploadResult.error.message);

    if (targetBucket !== FALLBACK_BUCKET) {
      targetBucket = FALLBACK_BUCKET;
      uploadResult = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });
    }
  }

  if (uploadResult.error) {
    const msg = uploadResult.error.message || 'Storage upload error';
    if (msg.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Supabase storage bucket "${requestedBucket}" was not found. Please create the public bucket "${PRIMARY_BUCKET}" in your Supabase Dashboard or run the provided SQL.`
      );
    }
    throw new Error(`Upload failed: ${msg}`);
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
    name: file.name,
    bucket: targetBucket,
  };
}

/**
 * Upload multiple product images in parallel or sequential with progress reporting
 * Returns array of public URLs
 */
export async function uploadMultipleProductImages(fileList, options = {}, onProgress = null) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (files.length === 0) return [];

  const results = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        percentage: Math.round(((i) / files.length) * 100),
      });
    }

    try {
      const uploaded = await uploadProductImageFile(file, options);
      results.push(uploaded);
    } catch (err) {
      console.error(`Failed uploading file ${file.name}:`, err);
      errors.push({ fileName: file.name, error: err.message });
    }
  }

  if (onProgress) {
    onProgress({
      current: files.length,
      total: files.length,
      fileName: 'Complete',
      percentage: 100,
    });
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0].error);
  }

  return results;
}

/**
 * Fallback helper: Convert File to base64 Data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
