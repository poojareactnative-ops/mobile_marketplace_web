import { Sparkles, ShieldCheck } from 'lucide-react'

export default function PublicProductGallery({
  images,
  currentImage,
  selectedImgIndex,
  setSelectedImgIndex,
  product,
}) {
  return (
    <div className="sticky top-24 space-y-4">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <img
          src={currentImage}
          alt={product.name}
          className="h-full w-full object-contain transition duration-300 hover:scale-105"
        />
        {product.discountPercent > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-black uppercase text-white shadow-md">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isSuperSellerOrAdmin && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm shadow-md">
            <Sparkles className="h-3 w-3" />
            Super Seller
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImgIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                selectedImgIndex === idx
                  ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-indigo-950">Verified Hyperlocal Guarantee</h4>
            <p className="mt-0.5 text-xs text-indigo-800/80">
              Physically inspect and test before payment. 100% genuine local inventory.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
