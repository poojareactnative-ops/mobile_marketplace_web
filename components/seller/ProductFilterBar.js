import { Search, ChevronDown } from 'lucide-react'

export function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export default function ProductFilterBar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  categories,
  productsCount,
  totalCount,
}) {
  const isFiltered = search || categoryFilter !== 'All' || stockFilter !== 'All'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, brand, SKU..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </div>
        <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <FilterSelect
          value={stockFilter}
          onChange={setStockFilter}
          options={['All', 'In Stock', 'Low Stock', 'Out of Stock']}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{productsCount}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalCount}</span> products
        </p>
        {isFiltered && (
          <button
            onClick={() => {
              setSearch('')
              setCategoryFilter('All')
              setStockFilter('All')
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
