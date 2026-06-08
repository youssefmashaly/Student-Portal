import { useEffect, useState } from 'react'
import Button from '../../components/Button'

function buildMapEmbedSrc(query) {
  const q = encodeURIComponent(query.trim())
  return `https://www.google.com/maps?q=${q}&output=embed`
}

function EmployerLocation({ employer, onSaved }) {
  const [address, setAddress] = useState(employer.mapLocationAddress ?? '')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setAddress(employer.mapLocationAddress ?? '')
  }, [employer])

  const hasLocation = Boolean(employer.mapLocationAddress?.trim())

  const handleSave = (event) => {
    event.preventDefault()
    const next = address.trim()
    if (!next) {
      return
    }
    onSaved({ mapLocationAddress: next })
    setSuccess('Location saved. The map will update below.')
    window.setTimeout(() => setSuccess(''), 4000)
  }

  const handleRemove = () => {
    setAddress('')
    onSaved({ mapLocationAddress: '' })
    setSuccess('Location removed.')
    window.setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Company Location</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pin your office or headquarters on the map. This is stored locally with your employer
          account.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Map address</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. German University in Cairo, New Cairo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </label>
        {success && (
          <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
            {success}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit">Save location</Button>
          <Button type="button" variant="muted" onClick={handleRemove} disabled={!hasLocation}>
            Remove location
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Map preview</h3>
        {!hasLocation ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            No location on file. Enter an address above and save to show an embedded map.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 shadow-inner">
            <iframe
              title="Company location map"
              className="h-72 w-full min-h-[280px] bg-slate-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={buildMapEmbedSrc(employer.mapLocationAddress)}
            />
            <p className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Showing: {employer.mapLocationAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployerLocation
