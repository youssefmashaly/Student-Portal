function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border border-blue-700 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700',
    muted: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600',
  }

  return (
    <button
      type={type}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
