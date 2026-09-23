import { AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteProductModal({
  product,
  onClose,
  onConfirm,
  isPending,
}) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-800">{product.name}</strong>?
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
