import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import {
  getUsers,
  loginUser,
  saveEmployerProfile,
  saveUser,
  seedDemoUsers,
} from '../../data/authStorage'

function RegisterEmployer() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    address: '',
    website: '',
    phone: '',
    companyLogo: '',
    taxCertificate: '',
    taxCertificateName: '',
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

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }

    if (form.phone && form.phone.length !== 11) {
      setError('Phone number must be exactly 11 digits.')
      return
    }

    const email = form.email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const users = getUsers()
    if (users.some((u) => u.email.toLowerCase() === email)) {
      setError('An account with this email already exists.')
      return
    }

    // 1. Save the basic user credentials for Authentication
    saveUser({
      companyName: form.companyName.trim(),
      email,
      password: form.password,
      role: 'employer',
      status: 'pending verification',
    })

    // 2. Save the full profile data so it instantly appears on the Dashboard
    saveEmployerProfile(email, {
      bio: form.bio.trim(),
      address: form.address.trim(),
      website: form.website.trim(),
      phone: form.phone,
      logo: form.companyLogo, // Map registration 'companyLogo' to dashboard 'logo'
      taxCertificate: form.taxCertificate,
      taxCertificateName: form.taxCertificateName,
      isVerified: false
    })

    // Log them in and redirect
    loginUser(email, form.password)
    setSuccess('Your company account is created! Redirecting...')
    setTimeout(() => navigate('/employer'), 900)
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm mb-20 mt-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register as Employer</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Join ProjectHub to discover top GUC talent.
      </p>

      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <input
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          required
          placeholder="Company Name"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
          placeholder="Company email"
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
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          required
          placeholder="Company Biography"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2 min-h-[80px]"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          placeholder="Company Address"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          required
          placeholder="Company Website (e.g. https://...)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        
        {/* Phone Input: Exactly 11 Digits restriction */}
        <input 
          type="tel"
          required
          pattern="\d{11}"
          title="Phone number must be exactly 11 digits"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm" 
          placeholder="Phone (11 digits)" 
          value={form.phone}
          maxLength={11}
          minLength={11}
          onChange={e => {
            const numericVal = e.target.value.replace(/\D/g, ''); // Remove non-digits
            setForm({...form, phone: numericVal});
          }} 
        />

        {/* CLICKABLE FILE UPLOAD BOXES */}
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 pt-4 border-t border-slate-100 mt-2">
          <label className={`cursor-pointer flex flex-col items-center justify-center border-2 rounded-xl p-6 transition-all shadow-sm ${form.companyLogo ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
            <span className="text-2xl mb-2">{form.companyLogo ? '✅' : '🖼️'}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-center">
              {form.companyLogo ? 'Logo Saved' : 'Upload Logo'}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setForm(prev => ({ ...prev, companyLogo: reader.result }));
                reader.readAsDataURL(file);
              }} 
            />
          </label>
          
          <label className={`cursor-pointer flex flex-col items-center justify-center border-2 rounded-xl p-6 transition-all shadow-sm ${form.taxCertificate ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
            <span className="text-2xl mb-2">{form.taxCertificate ? '✅' : '📄'}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-center">
              {form.taxCertificate ? 'Tax Cert Saved' : 'Upload Tax Cert'}
            </span>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setForm(prev => ({ ...prev, taxCertificate: reader.result, taxCertificateName: file.name }));
                reader.readAsDataURL(file);
              }} 
            />
          </label>
        </div>

        {error && <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}
        {success && (
          <p className="text-sm font-medium text-emerald-700 sm:col-span-2">{success}</p>
        )}
        <Button type="submit" className="sm:col-span-2 py-3 mt-2">
          Create Employer Account
        </Button>
      </form>
    </div>
  )
}

export default RegisterEmployer