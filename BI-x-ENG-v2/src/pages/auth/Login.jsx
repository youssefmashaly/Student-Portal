import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { loginUser, seedDemoUsers } from '../../data/authStorage'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    seedDemoUsers()
  }, [])

  const dashboardPaths = {
    student: '/student',
    instructor: '/instructor',
    employer: '/employer',
    admin: '/admin',
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const normalizedEmail = email.trim().toLowerCase()

    const user = loginUser(normalizedEmail, password)

    if (!user) {
      setError('Invalid email or password.')
      return
    }

    const route = dashboardPaths[user.role]
    if (!route) {
      setError('This account type is not supported. Please contact support.')
      return
    }

    setSuccess('Login successful. Redirecting to your dashboard...')
    navigate(route)
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">
        Sign in with your email and password. You will be taken to the dashboard for your account type.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
            placeholder="name@guc.edu.eg"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
            placeholder="••••••••"
          />
        </label>

        <Button type="submit" className="w-full">
          Login
        </Button>
        {/* MS2 Req 4.0: Update (change) my forgotten password using an OTP */}
        <div className="text-center">
          <Link to="/forgot-password" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}
      </form>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <p className="mt-4 text-sm font-medium text-slate-700">New to BI X ENG V2 ProjectHub?</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <Link
            to="/register-student"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Create Student Account
          </Link>
          <Link
            to="/register-instructor"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Create Instructor Account
          </Link>
          <Link
            to="/register-employer"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Register Company
          </Link>
          {/* Note: No admin registration link provided as per MS2 Requirement 2 ("Admin will NOT REGISTER") */}
        </div>
      </div>
    </div>
  )
}

export default Login
