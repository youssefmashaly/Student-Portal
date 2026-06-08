import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { getUsers, loginUser, saveUser, seedDemoUsers } from '../../data/authStorage'

function RegisterInstructor() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    seedDemoUsers()

    const email = form.email.trim().toLowerCase()
    if (!email.endsWith('@guc.edu.eg')) {
      setError('Please use a valid GUC instructor email ending with @guc.edu.eg.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    const users = getUsers()
    if (users.some((u) => u.email.toLowerCase() === email)) {
      setError('An account with this email already exists.')
      return
    }

    // saveUser stores the Base64 image
    saveUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email,
      password: form.password,
      profilePicture: form.profilePicture,
      role: 'instructor',
    })

    loginUser(email, form.password)
    setSuccess('Account created successfully. Redirecting to your dashboard...')
    setTimeout(() => navigate('/instructor'), 900)
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Register as Instructor</h1>
      <p className="mt-1 text-sm text-slate-600">
        Create your course instructor account for BI X ENG V2 ProjectHub.
      </p>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          placeholder="First Name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          placeholder="Last Name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
          placeholder="Instructor GUC Email"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          required
          placeholder="Password"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          type="password"
          required
          placeholder="Confirm Password"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        
        {/* CLICKABLE PROFILE PICTURE BOX */}
        <div className="sm:col-span-2 pt-2 border-t border-slate-100">
          <label className={`cursor-pointer flex flex-col items-center justify-center border-2 rounded-xl p-6 transition-all shadow-sm ${form.profilePicture ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
            <span className="text-2xl mb-2">{form.profilePicture ? '✅' : '📸'}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-center">
              {form.profilePicture ? 'Picture Saved' : 'Upload Profile Picture'}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setForm(prev => ({ ...prev, profilePicture: reader.result }));
                reader.readAsDataURL(file);
              }} 
            />
          </label>
        </div>

        {error && <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}
        {success && (
          <p className="text-sm font-medium text-emerald-700 sm:col-span-2">{success}</p>
        )}
        <Button type="submit" className="sm:col-span-2">
          Create Instructor Account
        </Button>
      </form>
    </div>
  )
}

export default RegisterInstructor