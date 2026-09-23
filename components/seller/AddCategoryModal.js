import { Tag, X, Plus, Loader2 } from 'lucide-react'

export default function AddCategoryModal({
  isOpen,
  onClose,
  newCategoryName,
  setNewCategoryName,
  newCategoryType,
  setNewCategoryType,
  newCategoryError,
  setNewCategoryError,
  onSubmit,
  isPending,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Category</h3>
              <p className="text-xs text-slate-500">Super Seller / Admin catalog tool</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {newCategoryError && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {newCategoryError}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value)
                setNewCategoryError('')
              }}
              placeholder="e.g. Wireless Chargers, Screen Protectors..."
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Type</label>
            <select
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="ACCESSORY">Mobile Accessories</option>
              <option value="REPAIR">Repair Parts &amp; Tools</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !newCategoryName.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create &amp; Select
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
