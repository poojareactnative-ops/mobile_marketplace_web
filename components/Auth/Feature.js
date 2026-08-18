function Feature({ icon, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-indigo-100">
          {description}
        </p>
      </div>
    </div>
  )
}

export default Feature