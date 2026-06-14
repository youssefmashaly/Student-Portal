import { Link } from 'react-router-dom'
import Button from '../components/Button'

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-10 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-700 dark:text-blue-400">404 Error</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400 sm:text-base">
        The page you requested does not exist or may have been moved. Return to the home page to continue exploring ProjectHub.
      </p>
      <Link to="/" className="mt-7">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
