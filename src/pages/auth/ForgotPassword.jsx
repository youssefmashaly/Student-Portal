import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import { getUsers } from '../../data/authStorage'

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const normalizedEmail = email.trim().toLowerCase()

  const handleEmailStep = (event) => {
    event.preventDefault()
    setError('')
    const users = getUsers()
    const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail)

    if (!user) {
      setError('No account found with this email.')
      return
    }

    setStep(2)
    setSuccess('A fake OTP has been sent to your email. Use 123456 to continue.')
  }

  const handleOtpStep = (event) => {
    event.preventDefault()
    setError('')
    if (otp !== '123456') {
      setError('Invalid OTP. For this simulation, use 123456.')
      return
    }
    setStep(3)
    setSuccess('')
  }

  const handleResetStep = (event) => {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    const users = getUsers()
    const updatedUsers = users.map((entry) =>
      entry.email.toLowerCase() === normalizedEmail
        ? { ...entry, password: newPassword }
        : entry,
    )
    localStorage.setItem('guc_projecthub_users', JSON.stringify(updatedUsers))
    setSuccess('Password updated successfully.')
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Frontend-only recovery simulation for Milestone 2.
      </p>

      {step === 1 && (
        <form className="mt-5 space-y-4" onSubmit={handleEmailStep}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your account email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
          />
          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="mt-5 space-y-4" onSubmit={handleOtpStep}>
          <input
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
          />
          <Button type="submit" className="w-full">
            Verify OTP
          </Button>
        </form>
      )}

      {step === 3 && (
        <form className="mt-5 space-y-4" onSubmit={handleResetStep}>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm New Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
          />
          <Button type="submit" className="w-full">
            Update Password
          </Button>
        </form>
      )}

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      {success && <p className="mt-4 text-sm font-medium text-emerald-700">{success}</p>}

      <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
        Back to Login
      </Link>
    </div>
  )
}

export default ForgotPassword
