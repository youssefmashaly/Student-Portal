import { useEffect, useState } from 'react'
import Button from '../../components/Button'

function displayValue(value) {
  const v = typeof value === 'string' ? value.trim() : value
  if (v === undefined || v === null || v === '') {
    return <span className="text-slate-400 italic">Not set</span>
  }
  return v
}

function EmployerProfile({ employer, onSaved }) {
  const phoneInitial = employer.phone ?? employer.contactInfo ?? ''
  const [bio, setBio] = useState(employer.bio ?? '')
  const [address, setAddress] = useState(employer.address ?? '')
  const [phone, setPhone] = useState(phoneInitial)
  const [website, setWebsite] = useState(employer.website ?? '')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setBio(employer.bio ?? '')
    setAddress(employer.address ?? '')
    setPhone(employer.phone ?? employer.contactInfo ?? '')
    setWebsite(employer.website ?? '')
  }, [employer])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSuccess('')
    let normalizedSite = website.trim()
    if (normalizedSite && !/^https?:\/\//i.test(normalizedSite)) {
      normalizedSite = `https://${normalizedSite}`
    }
    onSaved({
      bio: bio.trim(),
      address: address.trim(),
      phone: phone.trim(),
      contactInfo: phone.trim(),
      website: normalizedSite,
    })
    setSuccess('Company profile saved successfully.')
    window.setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Company Profile</h2>
        <p className="mt-1 text-sm text-slate-600">
          Update how your company appears to students and administrators. Empty fields show as{' '}
          <span className="font-medium text-slate-700">Not set</span> in the summary.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Current values</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Bio</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{displayValue(bio)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Address</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{displayValue(address)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Phone</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{displayValue(phone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Website</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{displayValue(website)}</dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">Edit profile</h3>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Brief description of your company"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, country"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+20 …"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Website</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="text"
              inputMode="url"
              placeholder="https://yourcompany.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </label>
        </div>
        {success && (
          <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
            {success}
          </p>
        )}
        <div className="mt-6">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </div>
  )
}

export default EmployerProfile
