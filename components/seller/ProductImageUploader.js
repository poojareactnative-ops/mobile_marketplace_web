import { useState } from 'react'
import {
  UploadCloud,
  Link as LinkIcon,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from 'lucide-react'
import apiClient from '../../src/lib/api/client'

/**
 * Optimizes and compresses images in the browser before uploading.
 * Resizes large camera photos (e.g. 4000x3000 down to max 1600px)
 * and compresses to JPEG, shrinking file size by 90%+ (e.g. 8MB -> ~250KB).
 */
async function optimizeImageForUpload(file, maxDimension = 1600, quality = 0.85) {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve({
            dataUrl: reader.result,
            mimeType: file.type,
            fileSize: file.size,
            filename: file.name,
          })
        } else {
          reject(new Error('Failed to read file.'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file.'))
      reader.readAsDataURL(file)
    })
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve({
            dataUrl: e.target.result,
            mimeType: file.type || 'image/jpeg',
            fileSize: file.size,
            filename: file.name,
          })
        }

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const outputMime = 'image/jpeg'
        const dataUrl = canvas.toDataURL(outputMime, quality)
        const approxSize = Math.round((dataUrl.length * 3) / 4)
        const baseName = file.name.replace(/\.[^.]+$/, '')

        resolve({
          dataUrl,
          mimeType: outputMime,
          fileSize: approxSize,
          filename: `${baseName}.jpg`,
        })
      }
      img.onerror = () => reject(new Error('Failed to process image file.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })
}

export default function ProductImageUploader({
  images = [],
  setImages,
  setErrorMsg,
}) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageTab, setImageTab] = useState('upload')
  const [imageUrlInput, setImageUrlInput] = useState('')

  async function handleFiles(event) {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    setUploadingImage(true)
    setErrorMsg('')

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setErrorMsg(`"${file.name}" is not a supported image format.`)
          continue
        }

        // Compress and optimize image to ensure ultra-fast upload & no 413 body size errors
        const optimized = await optimizeImageForUpload(file)

        let uploadedUrl = null
        try {
          // Try /uploads/presign as specified in docs/NODE_BACKEND_DYNAMIC_PAGES.md
          const presignRes = await apiClient.post('/uploads/presign', {
            filename: optimized.filename,
            contentType: optimized.mimeType,
            fileSize: optimized.fileSize,
          })
          const { uploadUrl, fileUrl, publicUrl } = presignRes.data?.data || {}
          if (uploadUrl) {
            const blob = await fetch(optimized.dataUrl).then((r) => r.blob())
            await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': optimized.mimeType },
              body: blob,
            })
            uploadedUrl = publicUrl || fileUrl || uploadUrl.split('?')[0]
          }
        } catch (presignErr) {
          // Fallback to direct /uploads endpoint
          const uploadRes = await apiClient.post('/uploads', {
            file: optimized.dataUrl,
            filename: optimized.filename,
            contentType: optimized.mimeType,
            fileSize: optimized.fileSize,
          })
          uploadedUrl =
            uploadRes.data?.data?.url ||
            uploadRes.data?.data?.publicUrl
        }

        if (uploadedUrl && typeof uploadedUrl === 'string') {
          setImages((currentImages) => [
            ...currentImages,
            uploadedUrl,
          ])

          setErrorMsg('')
        } else {
          setErrorMsg(`Upload failed for "${file.name}". No image URL returned.`)
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred.'

      const responseMessage =
        error?.response?.data?.error?.message

      setErrorMsg(
        'Image upload failed: ' + (responseMessage || message)
      )
    } finally {
      setUploadingImage(false)

      if (event.target) {
        event.target.value = ''
      }
    }
  }

  function handleAddImageUrl(event) {
    event?.preventDefault?.()

    const trimmed = imageUrlInput.trim()

    if (!trimmed) {
      return
    }

    const isValidUrl =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/')

    if (!isValidUrl) {
      setErrorMsg(
        'Please enter a valid image URL starting with http://, https:// or /'
      )
      return
    }

    setImages((currentImages) => [
      ...currentImages,
      trimmed,
    ])

    setImageUrlInput('')
    setErrorMsg('')
  }

  function handleImageUrlKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddImageUrl(event)
    }
  }

  function setAsCoverImage(index) {
    if (index === 0) {
      return
    }

    setImages((currentImages) => {
      const copy = [...currentImages]
      const [chosen] = copy.splice(index, 1)

      if (chosen) {
        copy.unshift(chosen)
      }

      return copy
    })
  }

  function removeImage(index) {
    setImages((currentImages) =>
      currentImages.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setImageTab('upload')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition ${
            imageTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          Upload Photo
        </button>

        <button
          type="button"
          onClick={() => setImageTab('url')}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition ${
            imageTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Paste Image URL
        </button>
      </div>

      {/* Upload */}
      {imageTab === 'upload' && (
        <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            {uploadingImage ? (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            {uploadingImage
              ? 'Uploading…'
              : 'Click to select product photos'}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PNG, JPG, WEBP or GIF · Auto-compressed & optimized for high speed
          </p>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
            disabled={uploadingImage}
          />
        </label>
      )}

      {/* URL */}
      {imageTab === 'url' && (
        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Direct Image URL
          </p>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(event) =>
                setImageUrlInput(event.target.value)
              }
              onBlur={() => {
                if (imageUrlInput.trim()) {
                  handleAddImageUrl()
                }
              }}
              onKeyDown={handleImageUrlKeyDown}
              placeholder="https://example.com/photos/case.jpg"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />

            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={!imageUrlInput.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Images */}
      {images.length > 0 ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {images.length} photo
              {images.length > 1 ? 's' : ''} attached
            </span>

            <span className="text-[11px] text-slate-400">
              First photo = storefront cover
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => {
              const src =
                typeof image === 'string'
                  ? image
                  : image.url

              const isCover = index === 0

              return (
                <div
                  key={`${src}-${index}`}
                  className={`group relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 ${
                    isCover
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  <img
                    src={src}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.opacity = '0.4'
                    }}
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition group-hover:opacity-100">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setAsCoverImage(index)}
                        className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-800 shadow-sm hover:bg-white"
                      >
                        Set Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg bg-rose-600/90 p-1.5 text-white shadow-sm hover:bg-rose-600"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3.5 text-center text-xs font-medium text-slate-500">
          📷 Optional: Upload product photos or paste an image URL above. A clean placeholder icon will be used if none is uploaded.
        </div>
      )}
    </div>
  )
}