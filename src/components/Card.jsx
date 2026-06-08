function Card({ title, subtitle, children, className = '' }) {
  return (
    <article
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition hover:shadow-md ${className}`}
    >
      {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </article>
  )
}

export default Card