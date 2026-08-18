function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="max-w-[240px] text-right font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

export default DetailRow