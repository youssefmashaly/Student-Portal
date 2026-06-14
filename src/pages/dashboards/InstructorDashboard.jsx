import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../data/authStorage'
import { seedAcademicPlatformDemoData } from '../../data/academicPlatformSeed'
import { useTheme } from '../../context/ThemeContext'

const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}
function useLS(key, initial) {
  const [val, setVal] = useState(() => LS.get(key, initial))
  const save = (v) => { const next = typeof v === 'function' ? v(val) : v; LS.set(key, next); setVal(next) }
  return [val, save]
}

const ALL_COURSES = ['CSEN 401','CSEN 402','CSEN 501','CSEN 502','DMET 502','DMET 305','CSEN 603','CSEN 701','Bachelor Project']

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)
const IC = {
  home:     'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  book:     'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
  folder:   'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  chat:     'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  flag:     'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  chart:    'M18 20V10M12 20V4M6 20v-6',
  logout:   'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  plus:     'M12 5v14M5 12h14',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:    'M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 6V4h4v2',
  x:        'M18 6L6 18M6 6l12 12',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z',
  check:    'M20 6L9 17l-5-5',
  link:     'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  unlink:   'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71M1 1l22 22',
  upload:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  menu:     'M3 12h18M3 6h18M3 18h18',
  eye:      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6',
  fileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  heart:    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  moon:     'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  sun:      'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  download:    'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  calendar:    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  activity:    'M22 12h-4l-3 9L9 3l-3 9H2',
  trendUp:     'M23 6l-9.5 9.5-5-5L1 18',
  alertCircle: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01',
  clock:       'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  target:      'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  megaphone:   'M3 11l19-9-9 19-2-8-8-2zM11 13l3-3',
  userCheck:   'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M16 11l2 2 4-4',
  layers:      'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  arrowRight:  'M5 12h14M12 5l7 7-7 7',
  info:        'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  bookOpen:    'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  paperclip:   'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
  video:       'M23 7l-7 5 7 5V7zM1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1V5z',
  externalLink:'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
  download2:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  filter:      'M22 3H2l8 9.46V19l4 2V12.46L22 3z',
  inbox:       'M22 12h-6l-2 3H10l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z',
}

// ── Shared primitives (identical to StudentDashboard) ─────────────────────────
const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue:   'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    green:  'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    red:    'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    slate:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[color] ?? map.slate}`}>{children}</span>
}

const Btn = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }) => {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-medium transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary:   'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
    success:   'bg-green-600 text-white hover:bg-green-700',
    warning:   'bg-yellow-500 text-white hover:bg-yellow-600',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input className={`rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500'}`} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const Textarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <textarea className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3} {...props} />
  </div>
)

const Sel = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <select className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" {...props}>{children}</select>
  </div>
)

const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm ${className}`}>{children}</div>
)

const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-xl bg-white dark:bg-slate-800 shadow-xl flex flex-col max-h-[90vh]`}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><Icon d={IC.x} /></button>
      </div>
      <div className="overflow-y-auto px-6 py-4">{children}</div>
    </div>
  </div>
)

const EmptyState = ({ message }) => <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">{message}</p>

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 min-w-48">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14} /></span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
  </div>
)

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange && onChange(n)}
        className={`text-xl transition ${n <= value ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600 hover:text-yellow-300'}`}>★</button>
    ))}
  </div>
)

const getSharedProjects = () => LS.get('student_projects', [])
const setSharedProjects = (v) => LS.set('student_projects', typeof v === 'function' ? v(getSharedProjects()) : v)
const unreadCount = (notifs) => notifs.filter(n => !n.read).length

// ── Supervision Analytics helpers ─────────────────────────────────────────────

function buildSupervisionStats(user, projects) {
  const assigned = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'accepted'))
  const ownerEmails = [...new Set(assigned.map(p => p.owner))]
  const completed = assigned.filter(p => (p.tasks || []).length > 0 && (p.tasks || []).every(t => t.status === 'completed'))
  const active = assigned.filter(p => (p.tasks || []).some(t => t.status !== 'completed'))
  const withFeedback = assigned.filter(p => (p.instructorComments || []).length > 0)
  const avgProgress = assigned.length > 0 ? Math.round(
    assigned.reduce((sum, p) => {
      const tasks = p.tasks || []
      if (tasks.length === 0) return sum + 50
      const done = tasks.filter(t => t.status === 'completed').length
      return sum + Math.round((done / tasks.length) * 100)
    }, 0) / assigned.length
  ) : 0

  const atRisk = assigned.filter(p => {
    const tasks = p.tasks || []
    const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')
    const pct = tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='completed').length/tasks.length)*100) : 50
    return overdue.length > 0 || pct < 30
  })

  const pendingReviews = assigned.filter(p =>
    (p.thesisDrafts || []).some(d => d.isFinal) ||
    (p.tasks || []).some(t => t.status === 'completed' && !t.instructorComment) ||
    !(p.instructorComments || []).length
  )

  return { assigned, ownerEmails, completed, active, withFeedback, avgProgress, atRisk, pendingReviews }
}

// ── Quick Actions Panel ───────────────────────────────────────────────────────
function InstructorQuickActions({ setTab, openFeedbackCenter, openMeetingModal, openAnnouncementModal }) {
  const actions = [
    { label:'Review Submissions', icon:IC.folder,     fn:() => setTab('projects'),   color:'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
    { label:'Manage Students',    icon:IC.users,      fn:() => setTab('portfolios'), color:'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
    { label:'Schedule Meeting',   icon:IC.calendar,   fn:openMeetingModal,           color:'bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900' },
    { label:'Post Announcement',  icon:IC.megaphone,  fn:openAnnouncementModal,      color:'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
    { label:'Quick Feedback',     icon:IC.edit,       fn:openFeedbackCenter,         color:'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900' },
    { label:'View Analytics',     icon:IC.target,     fn:() => setTab('analytics'),  color:'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
    { label:'Review Queue',       icon:IC.inbox,      fn:() => setTab('review-queue'),color:'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900' },
    { label:'Resources',          icon:IC.bookOpen,   fn:() => setTab('resources'),   color:'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-900' },
    { label:'Export Report',      icon:IC.download2,  fn:() => {
        const assigned = window.__instructor_projects || []
        const blob = new Blob([JSON.stringify(assigned.map(p=>({title:p.title,course:p.course,owner:p.owner,rating:p.rating,tasks:(p.tasks||[]).length,feedback:(p.instructorComments||[]).length})), null, 2)], {type:'application/json'})
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'instructor-report.json'; a.click()
      }, color:'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900' },
  ]
  return (
    <Card>
      <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map(a => (
          <button key={a.label} onClick={a.fn}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.color}`}>
            <Icon d={a.icon} size={18}/>
            <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

// ── Student Performance Overview ──────────────────────────────────────────────
function StudentPerformanceWidget({ stats, setTab }) {
  const { assigned, ownerEmails, completed, active, atRisk, avgProgress } = stats
  const items = [
    { label:'Supervised Students', value:ownerEmails.length, color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40',   tab:'projects' },
    { label:'Active Projects',     value:active.length,      color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40',tab:'projects' },
    { label:'Completed Projects',  value:completed.length,   color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40', tab:'projects' },
    { label:'Need Attention',      value:atRisk.length,      color:'text-red-700 dark:text-red-400',     bg:'bg-red-50 dark:bg-red-950/40',     tab:'projects' },
  ]
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.target} size={16}/>
          <h3 className="font-semibold">Student Performance</h3>
        </div>
        <button onClick={() => setTab('analytics')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Analytics →</button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {items.map(s => (
          <button key={s.label} onClick={() => setTab(s.tab)} className={`rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
          </button>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg. Student Progress</span>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{avgProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className={`h-2 rounded-full transition-all duration-700 ${avgProgress >= 70 ? 'bg-green-500' : avgProgress >= 40 ? 'bg-blue-600' : 'bg-amber-500'}`} style={{width:`${avgProgress}%`}}/>
        </div>
      </div>
    </Card>
  )
}

// ── At-Risk Students Panel ────────────────────────────────────────────────────
function AtRiskPanel({ stats, setTab }) {
  const { atRisk } = stats
  if (atRisk.length === 0) return (
    <Card>
      <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
        <Icon d={IC.alertCircle} size={16}/>
        <h3 className="font-semibold">At-Risk Students</h3>
      </div>
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40 text-green-500"><Icon d={IC.check} size={20}/></div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">All students on track</p>
      </div>
    </Card>
  )
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.alertCircle} size={16}/>
          <h3 className="font-semibold">At-Risk Students</h3>
          <Badge color="red">{atRisk.length}</Badge>
        </div>
        <button onClick={() => setTab('projects')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
      </div>
      <div className="space-y-2">
        {atRisk.slice(0,4).map(p => {
          const tasks = p.tasks || []
          const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed')
          const pct = tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='completed').length/tasks.length)*100) : 0
          const reasons = []
          if (overdue.length > 0) reasons.push(`${overdue.length} overdue task${overdue.length>1?'s':''}`)
          if (pct < 30) reasons.push(`low progress (${pct}%)`)
          if (reasons.length === 0) reasons.push('needs review')
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-sm font-bold text-red-600 dark:text-red-400">
                {p.owner?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.owner}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.title} · <span className="text-red-600 dark:text-red-400">{reasons.join(', ')}</span></p>
              </div>
              <button onClick={() => setTab('projects')} className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors">Review</button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Pending Reviews ───────────────────────────────────────────────────────────
function PendingReviewsWidget({ stats, setTab }) {
  const { pendingReviews } = stats
  const now = new Date()

  const reviewItems = pendingReviews.slice(0, 5).map(p => {
    const hasFinalThesis = (p.thesisDrafts || []).some(d => d.isFinal)
    const completedUncommented = (p.tasks || []).filter(t => t.status === 'completed' && !t.instructorComment)
    const hasNoFeedback = !(p.instructorComments || []).length
    const type = hasFinalThesis ? 'Thesis Review' : completedUncommented.length ? 'Task Review' : 'Project Review'
    const priority = hasFinalThesis ? 'red' : completedUncommented.length >= 2 ? 'yellow' : 'slate'
    const priorityLabel = hasFinalThesis ? 'High' : completedUncommented.length >= 2 ? 'Medium' : 'Low'
    return { p, type, priority, priorityLabel, owner: p.owner, date: p.createdAt }
  })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.clock} size={16}/>
          <h3 className="font-semibold">Pending Reviews</h3>
          {reviewItems.length > 0 && <Badge color="yellow">{reviewItems.length}</Badge>}
        </div>
        <button onClick={() => setTab('projects')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
      </div>
      {reviewItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40 text-green-500"><Icon d={IC.check} size={20}/></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No pending reviews</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviewItems.map(({ p, type, priority, priorityLabel, owner, date }) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5 hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"><Icon d={IC.fileText} size={14}/></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{owner}</span>
                  <Badge color="blue">{p.course}</Badge>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{type}</span>
                </div>
              </div>
              <Badge color={priority}>{priorityLabel}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Student Progress Tracker ──────────────────────────────────────────────────
function StudentProgressTracker({ stats }) {
  const { assigned } = stats
  if (assigned.length === 0) return (
    <Card>
      <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
        <Icon d={IC.layers} size={16}/>
        <h3 className="font-semibold">Student Progress</h3>
      </div>
      <EmptyState message="No assigned projects yet." />
    </Card>
  )
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <Icon d={IC.layers} size={16}/>
        <h3 className="font-semibold">Student Progress Tracker</h3>
      </div>
      <div className="space-y-3">
        {assigned.slice(0, 6).map(p => {
          const tasks = p.tasks || []
          const done = tasks.filter(t => t.status === 'completed').length
          const total = tasks.length
          const pct = total > 0 ? Math.round((done / total) * 100) : 50
          const remaining = total - done
          const status = pct >= 80 ? 'green' : pct >= 40 ? 'blue' : 'red'
          const statusLabel = pct >= 80 ? 'On Track' : pct >= 40 ? 'In Progress' : 'Needs Help'
          const barColor = pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-blue-600' : 'bg-red-500'
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {p.owner?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{p.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {total > 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500">{done}/{total} tasks</span>}
                  <Badge color={status}>{statusLabel}</Badge>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${barColor}`} style={{width:`${pct}%`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Recent Activity Feed ──────────────────────────────────────────────────────
function InstructorActivityFeed({ user, projects, notifications }) {
  const events = []

  projects.filter(p => (p.collaborators||[]).some(c=>c.email===user.email&&c.status==='accepted')).forEach(p => {
    if (p.createdAt) events.push({ id:'proj_'+p.id, label:`New project: "${p.title}"`, sub:p.owner, date:p.createdAt, icon:IC.folder, color:'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' });
    (p.instructorComments||[]).forEach(c => events.push({ id:'fb_'+c.id, label:`You reviewed "${p.title}"`, sub:p.owner, date:c.at||p.createdAt, icon:IC.edit, color:'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' }));
    (p.tasks||[]).filter(t=>t.status==='completed').forEach(t => events.push({ id:'task_'+t.id, label:`Task completed: "${t.title}"`, sub:p.title, date:t.deadline||p.createdAt, icon:IC.check, color:'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' }));
    if (p.flagged) events.push({ id:'flag_'+p.id, label:`You flagged "${p.title}"`, sub:p.owner, date:p.createdAt, icon:IC.flag, color:'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' });
  });

  notifications.slice().reverse().slice(0,3).forEach(n => events.push({ id:'notif_'+n.id, label:n.message, sub:'', date:n.createdAt, icon:IC.bell, color:'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' }))
  events.sort((a,b) => new Date(b.date)-new Date(a.date))
  const shown = events.slice(0,7)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2"><Icon d={IC.activity} size={16}/><h3 className="font-semibold">Recent Activity</h3></div>
      </div>
      {shown.length === 0 ? <EmptyState message="No activity yet." /> : (
        <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-5 space-y-4">
          {shown.map(ev => (
            <li key={ev.id} className="relative">
              <span className={`absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-800 ${ev.color}`}>
                <Icon d={ev.icon} size={9}/>
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{ev.label}</p>
              {ev.sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ev.sub}</p>}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(ev.date).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

// ── Supervision Analytics ─────────────────────────────────────────────────────
function SupervisionAnalyticsSection({ user, projects }) {
  const stats = buildSupervisionStats(user, projects)
  const { assigned, ownerEmails, completed, active, withFeedback, avgProgress, atRisk } = stats

  const completionRate = assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 0
  const feedbackRate = assigned.length > 0 ? Math.round((withFeedback.length / assigned.length) * 100) : 0
  const atRiskRate = assigned.length > 0 ? Math.round((atRisk.length / assigned.length) * 100) : 0

  const kpis = [
    { label:'Active Supervisees',   value:ownerEmails.length, color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40',   icon:IC.users },
    { label:'Completed Projects',   value:completed.length,   color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40', icon:IC.check },
    { label:'Avg. Completion Rate', value:`${completionRate}%`,color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40',icon:IC.target },
    { label:'Feedback Coverage',    value:`${feedbackRate}%`, color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40', icon:IC.edit },
  ]

  const metrics = [
    { label:'Avg. Student Progress', pct:avgProgress,      color: avgProgress>=70?'bg-green-500':avgProgress>=40?'bg-blue-600':'bg-amber-500' },
    { label:'Completion Rate',        pct:completionRate,   color:'bg-blue-600' },
    { label:'Feedback Rate',          pct:feedbackRate,     color:'bg-purple-600' },
    { label:'At-Risk Rate',           pct:atRiskRate,       color:'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supervision Analytics</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Performance metrics across your supervised projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-xl p-5 shadow-sm ${k.bg} hover:-translate-y-0.5 hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-2"><Icon d={k.icon} size={14}/></div>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Progress Metrics</h3>
        <div className="space-y-4">
          {metrics.map(m => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.label}</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{m.pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className={`h-2.5 rounded-full transition-all duration-700 ${m.color}`} style={{width:`${m.pct}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Per-Project Breakdown</h3>
        {assigned.length === 0 ? <EmptyState message="No assigned projects yet." /> : (
          <div className="space-y-3">
            {assigned.map(p => {
              const tasks = p.tasks || []
              const done = tasks.filter(t=>t.status==='completed').length
              const total = tasks.length
              const pct = total>0 ? Math.round((done/total)*100) : 50
              const hasFeedback = (p.instructorComments||[]).length>0
              const isAtRisk = atRisk.find(r=>r.id===p.id)
              const barColor = pct>=70?'bg-green-500':pct>=40?'bg-blue-600':'bg-red-500'
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Owner: {p.owner} · <Badge color="blue">{p.course}</Badge></p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAtRisk && <Badge color="red">At Risk</Badge>}
                      {hasFeedback && <Badge color="green">Reviewed</Badge>}
                      {p.rating>0 && <Badge color="yellow">★ {p.rating}/5</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-10 text-right">{pct}%</span>
                    {total>0 && <span className="text-xs text-slate-400 dark:text-slate-500">{done}/{total} tasks</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Quick Feedback Center ─────────────────────────────────────────────────────
function QuickFeedbackCenter({ user, projects, setProjects, pushNotif, onClose }) {
  const assigned = projects.filter(p => (p.collaborators||[]).some(c=>c.email===user.email&&c.status==='accepted'))
  const [selectedId, setSelectedId] = useState(assigned[0]?.id || '')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [saved, setSaved] = useState(false)

  const selectedProject = projects.find(p => p.id === selectedId)
  const recentFeedback = assigned.flatMap(p => (p.instructorComments||[]).map(c => ({ ...c, projectTitle:p.title }))).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,4)

  const submit = () => {
    if (!comment.trim() && rating === 0) return
    if (comment.trim()) {
      const fb = { id:Date.now().toString(), text:comment.trim(), author:user.email, at:new Date().toISOString() }
      setProjects(p => p.map(x => x.id === selectedId ? { ...x, instructorComments:[...(x.instructorComments||[]),fb] } : x))
      pushNotif(`Feedback posted on "${selectedProject?.title}".`)
    }
    if (rating > 0) {
      setProjects(p => p.map(x => x.id === selectedId ? { ...x, rating } : x))
    }
    setComment(''); setRating(0); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Modal title="Quick Feedback Center" onClose={onClose} wide>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Sel label="Select Project" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {assigned.map(p => <option key={p.id} value={p.id}>{p.title} ({p.course})</option>)}
            </Sel>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</p>
            <StarRating value={rating} onChange={setRating}/>
          </div>
        </div>
        <Textarea label="Feedback Comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Leave feedback for this project…" rows={3}/>
        <div className="flex items-center gap-3">
          <Btn onClick={submit} disabled={!comment.trim() && rating===0}><Icon d={IC.send} size={13}/>Post Feedback</Btn>
          {saved && <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1"><Icon d={IC.check} size={13}/>Saved!</span>}
        </div>

        {recentFeedback.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Recent Feedback</p>
            <div className="space-y-2">
              {recentFeedback.map(fb => (
                <div key={fb.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">{fb.projectTitle}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{new Date(fb.at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">"{fb.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Upcoming Meetings ─────────────────────────────────────────────────────────
function MeetingsWidget({ meetings, onAdd, onRemove }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.calendar} size={16}/>
          <h3 className="font-semibold">Upcoming Meetings</h3>
        </div>
        <button onClick={onAdd} className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"><Icon d={IC.plus} size={12}/></button>
      </div>
      {meetings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"><Icon d={IC.calendar} size={20}/></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No meetings scheduled</p>
          <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"><Icon d={IC.plus} size={12}/>Schedule Meeting</button>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.slice(0,4).map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5 group hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Icon d={IC.users} size={14}/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{m.student}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{m.date} · {m.time} · {m.topic}</p>
              </div>
              <button onClick={() => onRemove(m.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Icon d={IC.x} size={13}/></button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Announcements Management ──────────────────────────────────────────────────
function AnnouncementsManagement({ announcements, onAdd, onRemove }) {
  const stats = {
    total: announcements.length,
    recent: announcements.filter(a => { const d = new Date(a.date||Date.now()); const w = new Date(); w.setDate(w.getDate()-7); return d>=w }).length,
    scheduled: announcements.filter(a => a.scheduled).length,
  }
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200"><Icon d={IC.megaphone} size={16}/><h3 className="font-semibold">Announcements</h3></div>
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"><Icon d={IC.plus} size={12}/>Post</button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label:'Total', value:stats.total, color:'text-blue-700 dark:text-blue-400', bg:'bg-blue-50 dark:bg-blue-950/40' },
          { label:'This Week', value:stats.recent, color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40' },
          { label:'Scheduled', value:stats.scheduled, color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.bg}`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {announcements.length === 0 ? <EmptyState message="No announcements yet." /> : (
        <div className="space-y-2">
          {announcements.slice(0,4).map(a => {
            const typeStyle = {
              info:    { bg:'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',   text:'text-blue-700 dark:text-blue-300' },
              warning: { bg:'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',text:'text-amber-700 dark:text-amber-300' },
              success: { bg:'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800', text:'text-green-700 dark:text-green-300' },
            }
            const s = typeStyle[a.type] || typeStyle.info
            return (
              <div key={a.id} className={`rounded-lg border px-3 py-2.5 group ${s.bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold ${s.text}`}>{a.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">{a.message}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{a.date}{a.scheduled?' · Scheduled':''}</p>
                  </div>
                  <button onClick={() => onRemove(a.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shrink-0"><Icon d={IC.x} size={12}/></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ── Review Queue ──────────────────────────────────────────────────────────────
function ReviewQueueSection({ user, projects, setProjects, pushNotif }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)

  const assigned = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'accepted'))

  const queue = assigned.flatMap(p => {
    const items = []
    const hasFinalThesis = (p.thesisDrafts || []).some(d => d.isFinal)
    const completedUnreviewed = (p.tasks || []).filter(t => t.status === 'completed' && !t.instructorComment)
    const noProjectFeedback = !(p.instructorComments || []).length

    if (hasFinalThesis) items.push({ id:'thesis_'+p.id, project:p, type:'Thesis Review', priority:'red', priorityLabel:'High', desc:`Final thesis draft ready for review`, course:p.course })
    completedUnreviewed.forEach(t => items.push({ id:'task_'+t.id+'_'+p.id, project:p, type:'Task Review', priority:'yellow', priorityLabel:'Medium', desc:`"${t.title}" completed — awaiting comment`, course:p.course, task:t }))
    if (noProjectFeedback && !hasFinalThesis) items.push({ id:'proj_'+p.id, project:p, type:'Project Evaluation', priority:'slate', priorityLabel:'Low', desc:`No feedback given yet`, course:p.course })

    return items
  }).sort((a,b) => { const o = {red:0,yellow:1,slate:2}; return (o[a.priority]||2)-(o[b.priority]||2) })

  const filtered = filter === 'all' ? queue : queue.filter(i => i.priorityLabel.toLowerCase() === filter)

  const counts = {
    all: queue.length,
    high: queue.filter(i=>i.priority==='red').length,
    medium: queue.filter(i=>i.priority==='yellow').length,
    low: queue.filter(i=>i.priority==='slate').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Queue</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{queue.length} item{queue.length!==1?'s':''} awaiting your review.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id:'all',    label:`All (${counts.all})` },
          { id:'high',   label:`High (${counts.high})` },
          { id:'medium', label:`Medium (${counts.medium})` },
          { id:'low',    label:`Low (${counts.low})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filter===f.id ? 'bg-blue-700 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40 text-green-500"><Icon d={IC.check} size={24}/></div>
            <p className="font-medium text-slate-600 dark:text-slate-400">No pending reviews</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">You're all caught up!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id} className="hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.priority==='red'?'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400':item.priority==='yellow'?'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400':'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Icon d={item.type==='Thesis Review'?IC.fileText:item.type==='Task Review'?IC.check:IC.folder} size={18}/>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{item.project.title}</p>
                      <Badge color="blue">{item.course}</Badge>
                      <Badge color={item.priority}>{item.priorityLabel} Priority</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.type} · {item.desc}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Owner: {item.project.owner}</p>
                  </div>
                </div>
                <Btn size="sm" onClick={() => { setSelected(item.project); setModal('view') }}>
                  <Icon d={IC.eye} size={13}/>Review
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal === 'view' && selected && (
        <ProjectFeedbackModal project={projects.find(p => p.id === selected.id) || selected} user={user} setProjects={setProjects} pushNotif={pushNotif} onClose={() => setModal(null)}/>
      )}
    </div>
  )
}

// ── Course Analytics ──────────────────────────────────────────────────────────
function CourseAnalyticsSection({ user, projects, linkedCourses }) {
  const assigned = projects.filter(p => (p.collaborators||[]).some(c=>c.email===user.email&&c.status==='accepted'))

  const byCourse = linkedCourses.map(course => {
    const courseProjects = assigned.filter(p => p.course === course)
    const students = [...new Set(courseProjects.map(p=>p.owner))]
    const completed = courseProjects.filter(p=>(p.tasks||[]).length>0&&(p.tasks||[]).every(t=>t.status==='completed'))
    const avgProgress = courseProjects.length > 0 ? Math.round(
      courseProjects.reduce((sum, p) => {
        const tasks = p.tasks||[]
        if (tasks.length===0) return sum+50
        return sum+Math.round((tasks.filter(t=>t.status==='completed').length/tasks.length)*100)
      }, 0) / courseProjects.length
    ) : 0
    const avgRating = courseProjects.filter(p=>p.rating>0).length > 0
      ? Math.round((courseProjects.reduce((s,p)=>s+(p.rating||0),0)/courseProjects.filter(p=>p.rating>0).length)*10)/10
      : 0
    const withFeedback = courseProjects.filter(p=>(p.instructorComments||[]).length>0)
    return { course, projects:courseProjects, students, completed, avgProgress, avgRating, withFeedback }
  }).filter(c => c.projects.length > 0)

  const totals = {
    students: [...new Set(assigned.map(p=>p.owner))].length,
    projects: assigned.length,
    completed: assigned.filter(p=>(p.tasks||[]).length>0&&(p.tasks||[]).every(t=>t.status==='completed')).length,
    avgProgress: assigned.length > 0 ? Math.round(assigned.reduce((sum,p)=>{
      const tasks=p.tasks||[]; if(tasks.length===0) return sum+50
      return sum+Math.round((tasks.filter(t=>t.status==='completed').length/tasks.length)*100)
    },0)/assigned.length) : 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course Analytics</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Performance across all your linked courses.</p>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label:'Students Supervised', value:totals.students,     color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40',   icon:IC.users },
          { label:'Active Projects',     value:totals.projects,     color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40',icon:IC.folder },
          { label:'Completed Projects',  value:totals.completed,    color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40', icon:IC.check },
          { label:'Avg. Progress',       value:`${totals.avgProgress}%`,color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40', icon:IC.target },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-5 shadow-sm ${k.bg} hover:-translate-y-0.5 hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-2"><Icon d={k.icon} size={14}/></div>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Per-course breakdown */}
      {byCourse.length === 0 ? (
        <Card><EmptyState message="No assigned projects found for your linked courses." /></Card>
      ) : (
        <div className="space-y-4">
          {byCourse.map(c => {
            const completionRate = c.projects.length > 0 ? Math.round((c.completed.length/c.projects.length)*100) : 0
            const feedbackRate = c.projects.length > 0 ? Math.round((c.withFeedback.length/c.projects.length)*100) : 0
            const barColor = c.avgProgress>=70?'bg-green-500':c.avgProgress>=40?'bg-blue-600':'bg-amber-500'
            return (
              <Card key={c.course}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{c.course}</h3>
                      <Badge color="blue">{c.projects.length} project{c.projects.length!==1?'s':''}</Badge>
                      <Badge color="slate">{c.students.length} student{c.students.length!==1?'s':''}</Badge>
                    </div>
                    {c.avgRating > 0 && <p className="text-xs text-slate-400 dark:text-slate-500">Avg. rating: ★ {c.avgRating}/5</p>}
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${c.avgProgress>=70?'text-green-700 dark:text-green-400':c.avgProgress>=40?'text-blue-700 dark:text-blue-400':'text-amber-700 dark:text-amber-400'}`}>{c.avgProgress}%</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">avg progress</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-500 dark:text-slate-400">Average Progress</span><span className="text-xs font-bold text-slate-600 dark:text-slate-400">{c.avgProgress}%</span></div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{width:`${c.avgProgress}%`}}/></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-500 dark:text-slate-400">Completion Rate</span><span className="text-xs font-bold text-slate-600 dark:text-slate-400">{completionRate}%</span></div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-2 rounded-full bg-green-500 transition-all duration-700" style={{width:`${completionRate}%`}}/></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-500 dark:text-slate-400">Feedback Coverage</span><span className="text-xs font-bold text-slate-600 dark:text-slate-400">{feedbackRate}%</span></div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-2 rounded-full bg-purple-600 transition-all duration-700" style={{width:`${feedbackRate}%`}}/></div>
                  </div>
                </div>
                {c.students.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Students</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.students.slice(0,6).map(s => (
                        <span key={s} className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">{s}</span>
                      ))}
                      {c.students.length > 6 && <span className="text-xs text-slate-400 dark:text-slate-500">+{c.students.length-6} more</span>}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Resource Management ───────────────────────────────────────────────────────
function ResourceManagementSection({ user }) {
  const [resources, setResources] = useLS('instructor_resources_' + user.email, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', type:'lecture', course:'Bachelor Project', description:'', url:'' })
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const typeConfig = {
    lecture:    { label:'Lecture',    icon:IC.bookOpen,  color:'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',   badge:'blue' },
    tutorial:   { label:'Tutorial',   icon:IC.book,      color:'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',badge:'purple' },
    assignment: { label:'Assignment', icon:IC.inbox,     color:'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', badge:'yellow' },
    reference:  { label:'Reference',  icon:IC.paperclip, color:'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400', badge:'green' },
    video:      { label:'Video',      icon:IC.video,     color:'bg-slate-800 dark:bg-slate-700 text-white',                          badge:'slate' },
    link:       { label:'Link',       icon:IC.externalLink,color:'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',  badge:'red' },
  }

  const types = Object.keys(typeConfig)
  const displayed = resources
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.course.toLowerCase().includes(search.toLowerCase()))
    .filter(r => !filterType || r.type === filterType)
    .sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0))

  const counts = types.reduce((acc, t) => ({ ...acc, [t]: resources.filter(r=>r.type===t).length }), {})

  const save = () => {
    if (!form.title.trim()) return alert('Title is required.')
    setResources(p => [...p, { ...form, id:Date.now().toString(), uploadedAt:new Date().toISOString() }])
    setForm({ title:'', type:'lecture', course:'Bachelor Project', description:'', url:'' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resource Management</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your uploaded materials and references.</p>
        </div>
        <Btn onClick={() => setShowForm(p=>!p)}><Icon d={IC.plus} size={13}/>{showForm?'Cancel':'Add Resource'}</Btn>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {types.map(t => {
          const tc = typeConfig[t]
          return (
            <button key={t} onClick={() => setFilterType(filterType===t?'':t)}
              className={`rounded-xl p-3 text-center transition-all border hover:-translate-y-0.5 hover:shadow-sm ${filterType===t?'border-blue-500 ring-1 ring-blue-500':tc.color.includes('bg-slate-8')?'border-slate-700 dark:border-slate-600':'border-slate-100 dark:border-slate-700'} ${tc.color}`}>
              <Icon d={tc.icon} size={16}/>
              <p className="text-lg font-bold mt-1">{counts[t]||0}</p>
              <p className="text-[10px] font-semibold leading-tight mt-0.5">{tc.label}</p>
            </button>
          )
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Add New Resource</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Title *" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Week 1 Lecture Slides"/>
            <Sel label="Type" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
              {types.map(t => <option key={t} value={t}>{typeConfig[t].label}</option>)}
            </Sel>
            <Sel label="Course" value={form.course} onChange={e => setForm(p=>({...p,course:e.target.value}))}>
              {ALL_COURSES.map(c => <option key={c}>{c}</option>)}
            </Sel>
            <Input label="URL / Link (optional)" value={form.url} onChange={e => setForm(p=>({...p,url:e.target.value}))} placeholder="https://…"/>
          </div>
          <Textarea label="Description (optional)" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Brief description…" rows={2} />
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <Btn onClick={save}><Icon d={IC.check} size={13}/>Save Resource</Btn>
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search resources…"/>
        {filterType && (
          <button onClick={() => setFilterType('')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <Icon d={IC.x} size={11}/>Clear filter: {typeConfig[filterType]?.label}
          </button>
        )}
      </div>

      {/* Resources list */}
      {displayed.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"><Icon d={IC.paperclip} size={24}/></div>
            <p className="font-medium text-slate-600 dark:text-slate-400">{resources.length===0?'No resources yet':'No resources match your filter'}</p>
            {resources.length===0 && <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"><Icon d={IC.plus} size={12}/>Add your first resource</button>}
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayed.map(r => {
            const tc = typeConfig[r.type] || typeConfig.reference
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 hover:border-blue-200 dark:hover:border-blue-700 transition-all group shadow-sm">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc.color}`}><Icon d={tc.icon} size={15}/></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{r.title}</p>
                    <Badge color={tc.badge}>{tc.label}</Badge>
                    <Badge color="blue">{r.course}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{r.description}</p>}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Added {new Date(r.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer"><Btn size="sm" variant="secondary"><Icon d={IC.externalLink} size={12}/>Open</Btn></a>}
                  <button onClick={() => setResources(p=>p.filter(x=>x.id!==r.id))} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Icon d={IC.trash} size={13}/></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ user, profile, linkedCourses, notifications, projects, setTab, openFeedbackCenter, openMeetingModal, openAnnouncementModal }) {


  const assigned = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'accepted'))
  const unread = unreadCount(notifications)
  const invites = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'pending')).length
  const supervisionStats = buildSupervisionStats(user, projects)

  const stats = [
    { label: 'Linked Courses',    value: linkedCourses.length, color: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/40',   tab: 'courses' },
    { label: 'Assigned Projects', value: assigned.length,      color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', tab: 'projects' },
    { label: 'Unread Alerts',     value: unread,               color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', tab: 'notifications' },
    { label: 'Pending Invites',   value: invites,              color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/40',  tab: 'invitations' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}


      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 sm:px-12 sm:py-14 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Welcome back, {profile.firstName || user.firstName || 'Instructor'} 👋
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Manage your courses, review student projects, and provide meaningful academic feedback — all in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button onClick={() => setTab('projects')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50 hover:shadow-lg active:scale-95 transition-all duration-150 w-full sm:w-auto justify-center">
              <Icon d={IC.folder} size={15} />View Projects
            </button>
            <button onClick={() => setTab('portfolios')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 hover:border-white/50 active:scale-95 transition-all duration-150 w-full sm:w-auto justify-center">
              <Icon d={IC.users} size={15} />Student Portfolios
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => setTab(s.tab)}
            className={`group rounded-xl border-0 p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${s.bg}`}>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">My Courses</h3>
            <button onClick={() => setTab('courses')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Manage</button>
          </div>
          {linkedCourses.length === 0 ? <EmptyState message="No courses linked yet." /> :
            <div className="flex flex-wrap gap-2">
              {linkedCourses.map(c => <Badge key={c} color="blue">{c}</Badge>)}
            </div>
          }
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Notifications</h3>
            <button onClick={() => setTab('notifications')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
          </div>
          {notifications.length === 0 ? <EmptyState message="No notifications yet." /> :
            <ul className="space-y-2.5">
              {notifications.slice().reverse().slice(0, 5).map(n => (
                <li key={n.id} className="flex items-start gap-2.5 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'}`} />
                  <div>
                    <p className={n.read ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}>{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          }
        </Card>
      </div>

     <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Assigned Projects</h3>
          <button onClick={() => setTab('projects')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
        </div>
        {assigned.length === 0 ? <EmptyState message="No projects assigned to you yet." /> :
          <div className="space-y-2">
            {assigned.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color="blue">{p.course}</Badge>
                    {p.rating > 0 && <Badge color="yellow">★ {p.rating}/5</Badge>}
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        }
      </Card>

      {/* ── Quick Actions ── */}
      <InstructorQuickActions setTab={setTab} openFeedbackCenter={openFeedbackCenter} openMeetingModal={openMeetingModal} openAnnouncementModal={openAnnouncementModal}/>

      {/* ── Student Performance + At-Risk ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StudentPerformanceWidget stats={supervisionStats} setTab={setTab}/>
        <AtRiskPanel stats={supervisionStats} setTab={setTab}/>
      </div>

      {/* ── Pending Reviews + Progress ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PendingReviewsWidget stats={supervisionStats} setTab={setTab}/>
        <StudentProgressTracker stats={supervisionStats}/>
      </div>

      {/* ── Recent Activity ── */}
      <InstructorActivityFeed user={user} projects={projects} notifications={notifications}/>
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileSection({ user, profile, setProfile }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(profile)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const save = () => { setProfile(form); setEditing(false) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        {!editing && <Btn onClick={() => { setForm(profile); setEditing(true) }}><Icon d={IC.edit} />Edit Profile</Btn>}
      </div>
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            {profile.photo
              ? <img src={profile.photo} alt="avatar" className="h-24 w-24 rounded-full object-cover border-2 border-blue-200" />
              : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {(profile.firstName?.[0] || user.firstName?.[0] || 'I').toUpperCase()}
                </div>
            }
            <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600">
              <Icon d={IC.upload} size={12} /> {profile.photo ? 'Change Photo' : 'Upload Photo'}
              <input type="file" className="hidden" accept="image/*" onChange={e => {
                const file = e.target.files?.[0]; if (!file) return
                const reader = new FileReader()
                reader.onload = ev => { setProfile(prev => ({ ...prev, photo: ev.target.result })); setForm(prev => ({ ...prev, photo: ev.target.result })) }
                reader.readAsDataURL(file)
              }} />
            </label>
          </div>
          <div className="flex-1 space-y-4">
            {editing ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="First Name" value={form.firstName || ''} onChange={f('firstName')} />
                  <Input label="Last Name" value={form.lastName || ''} onChange={f('lastName')} />
                </div>
                <Input label="GUC Email (read-only)" value={user.email || ''} disabled />
                <Textarea label="Short Biography" value={form.bio || ''} onChange={f('bio')} placeholder="Tell students about yourself…" rows={3} />
                <Textarea label="Research Interests" value={form.research || ''} onChange={f('research')} placeholder="e.g. Machine Learning, Computer Vision…" rows={2} />
                <Textarea label="Education Background" value={form.education || ''} onChange={f('education')} placeholder="e.g. PhD Computer Science, GUC 2015…" rows={2} />
                <div className="flex gap-2 pt-1">
                  <Btn onClick={save}><Icon d={IC.check} />Save Changes</Btn>
                  <Btn variant="secondary" onClick={() => setEditing(false)}>Cancel</Btn>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">{profile.firstName || user.firstName} {profile.lastName || user.lastName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  <Badge color="blue">Course Instructor</Badge>
                </div>
                {profile.bio && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Biography</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.bio}</p></div>}
                {profile.research && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Research Interests</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.research}</p></div>}
                {profile.education && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Education</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{profile.education}</p></div>}
                {!profile.bio && !profile.research && !profile.education && <p className="text-sm text-slate-400 dark:text-slate-500">No profile details yet. Click Edit Profile to get started.</p>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Courses ───────────────────────────────────────────────────────────────────
function CoursesSection({ linkedCourses, setLinkedCourses, pushNotif }) {
  const [search, setSearch] = useState('')
  const ensureBachelor = list => list.includes('Bachelor Project') ? list : [...list, 'Bachelor Project']
  const toggle = course => {
    if (course === 'Bachelor Project') return
    const type = linkedCourses.includes(course) ? 'unlink' : 'link'
    if (type === 'unlink') {
      setLinkedCourses(ensureBachelor(linkedCourses.filter(c => c !== course)))
    } else {
      setLinkedCourses(ensureBachelor([...linkedCourses, course]))
    }
    pushNotif(`${type === 'link' ? 'Link' : 'Unlink'} request sent for "${course}". Awaiting admin approval.`)
    // Write to shared bridge key so AdminDashboard picks it up
    try {
      const existing = LS.get('guc_link_requests', [])
      const alreadyPending = existing.some(
        r => r.instructorEmail === rawUser.email && r.courseCode === course && r.status === 'pending'
      )
      if (!alreadyPending) {
        const newRequest = {
          id: `lr_${Date.now()}`,
          instructorName: `${profile.firstName || rawUser.firstName || ''} ${profile.lastName || rawUser.lastName || ''}`.trim() || rawUser.email,
          instructorEmail: rawUser.email,
          courseCode: course,
          type,
          status: 'pending',
          createdAt: new Date().toISOString().slice(0, 10),
        }
        LS.set('guc_link_requests', [...existing, newRequest])
      }
    } catch (e) { console.warn('Link request bridge failed', e) }
  }
  const filtered = ALL_COURSES.filter(c => c.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Automatically linked to <strong>Bachelor Project</strong>. Other course links require admin approval.
        </p>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Currently Linked</h3>
        {linkedCourses.length === 0 ? <EmptyState message="No courses linked." /> :
          <div className="flex flex-wrap gap-2">
            {linkedCourses.map(c => (
              <div key={c} className="flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-1">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{c}</span>
                {c !== 'Bachelor Project' && (
                  <button onClick={() => toggle(c)} className="text-blue-400 hover:text-red-500 transition ml-1"><Icon d={IC.x} size={12} /></button>
                )}
                {c === 'Bachelor Project' && <span className="text-xs text-blue-400 dark:text-blue-500 ml-1">(always)</span>}
              </div>
            ))}
          </div>
        }
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Available Courses</h3>
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses…" />
        </div>
        <div className="space-y-2">
          {filtered.map(c => {
            const linked = linkedCourses.includes(c)
            const always = c === 'Bachelor Project'
            return (
              <div key={c} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Icon d={IC.book} size={14} />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{c}</span>
                </div>
                <div className="flex items-center gap-2">
                  {linked && <Badge color="green">Linked</Badge>}
                  {always ? <Badge color="slate">Auto-linked</Badge> :
                    <Btn size="sm" variant={linked ? 'danger' : 'secondary'} onClick={() => toggle(c)}>
                      <Icon d={linked ? IC.unlink : IC.link} size={12} />
                      {linked ? 'Unlink' : 'Link'}
                    </Btn>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// ── Project Feedback Modal ────────────────────────────────────────────────────
function ProjectFeedbackModal({ project, user, setProjects, pushNotif, onClose }) {
  const [rating, setRating] = useState(project.rating || 0)
  const [projectComment, setProjectComment] = useState('')
  const [taskComments, setTaskComments] = useState(
    Object.fromEntries((project.tasks || []).map(t => [t.id, t.instructorComment || '']))
  )
  const saveProjectComment = () => {
    if (!projectComment.trim()) return
    const comment = { id: Date.now().toString(), text: projectComment.trim(), author: user.email, at: new Date().toISOString() }
    setProjects(p => p.map(x => x.id === project.id ? { ...x, instructorComments: [...(x.instructorComments || []), comment] } : x))
    pushNotif(`You left feedback on "${project.title}".`)
    setProjectComment('')
  }
  const deleteProjectComment = id => setProjects(p => p.map(x => x.id === project.id ? { ...x, instructorComments: (x.instructorComments || []).filter(c => c.id !== id) } : x))
  const saveRating = () => {
    setProjects(p => p.map(x => x.id === project.id ? { ...x, rating } : x))
    pushNotif(`You rated "${project.title}" ${rating}/5.`)
  }
  const saveTaskComment = taskId => {
    const text = taskComments[taskId] || ''
    setProjects(p => p.map(x => x.id === project.id ? { ...x, tasks: (x.tasks || []).map(t => t.id === taskId ? { ...t, instructorComment: text } : t) } : x))
    pushNotif(`You left task feedback on "${project.title}".`)
  }
  const deleteTaskComment = taskId => {
    setTaskComments(p => ({ ...p, [taskId]: '' }))
    setProjects(p => p.map(x => x.id === project.id ? { ...x, tasks: (x.tasks || []).map(t => t.id === taskId ? { ...t, instructorComment: '' } : t) } : x))
  }
  const projectComments = project.instructorComments || []

  return (
    <Modal title={`Project: ${project.title}`} onClose={onClose} wide>
      <div className="space-y-6">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 p-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge color="blue">{project.course}</Badge>
            <Badge color={project.visibility === 'public' ? 'green' : 'slate'}>{project.visibility}</Badge>
          </div>
          {project.description && <p className="text-sm text-slate-700 dark:text-slate-300">{project.description}</p>}
          {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={12} />GitHub</a>}
          {project.demoVideo && <a href={project.demoVideo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><Icon d={IC.eye} size={12} />Demo Video</a>}
          <div className="flex flex-wrap gap-1">{(project.languages || []).map(l => <Badge key={l} color="slate">{l}</Badge>)}</div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Rate this Project</p>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} />
            <span className="text-sm text-slate-500 dark:text-slate-400">{rating > 0 ? `${rating}/5` : 'Not rated'}</span>
            <Btn size="sm" onClick={saveRating} disabled={rating === 0}><Icon d={IC.check} size={12} />Save Rating</Btn>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Project Feedback / Comments</p>
          <div className="space-y-2 mb-3">
            {projectComments.length === 0
              ? <p className="text-xs text-slate-400 dark:text-slate-500">No comments yet.</p>
              : projectComments.map(c => (
                <div key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2">
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">"{c.text}"</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.author} · {new Date(c.at).toLocaleDateString()}</p>
                  </div>
                  {c.author === user.email && (
                    <button onClick={() => deleteProjectComment(c.id)} className="shrink-0 text-slate-300 hover:text-red-500 transition">
                      <Icon d={IC.trash} size={13} />
                    </button>
                  )}
                </div>
              ))
            }
          </div>
          <div className="flex gap-2">
            <textarea value={projectComment} onChange={e => setProjectComment(e.target.value)}
              placeholder="Leave feedback on this project…" rows={2}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <Btn onClick={saveProjectComment} disabled={!projectComment.trim()}><Icon d={IC.send} size={13} />Post</Btn>
          </div>
        </div>

        {project.course === 'Bachelor Project' && (project.thesisDrafts || []).filter(d => d.isFinal).length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Thesis Drafts</p>
            <div className="space-y-2">
              {project.thesisDrafts.filter(d => d.isFinal).map(d => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-2">
                  <Icon d={IC.fileText} size={14} />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.name}</p>
                    <Badge color="blue">Final Draft</Badge>
                  </div>
                  {d.fileData && (
                    <a href={d.fileData} download={d.fileName || d.name}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                      <Icon d={IC.download} size={12} />Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(project.tasks || []).length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Task Feedback</p>
            <div className="space-y-3">
              {project.tasks.map(t => (
                <div key={t.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{t.title}</p>
                    <Badge color={t.status === 'completed' ? 'green' : t.status === 'postponed' ? 'slate' : 'yellow'}>{t.status}</Badge>
                  </div>
                  {t.description && <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>}
                  <div className="flex gap-2">
                    <input value={taskComments[t.id] || ''} onChange={e => setTaskComments(p => ({ ...p, [t.id]: e.target.value }))}
                      placeholder="Add comment on this task…"
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none" />
                    <Btn size="sm" onClick={() => saveTaskComment(t.id)}><Icon d={IC.check} size={11} />Save</Btn>
                    {t.instructorComment && <Btn size="sm" variant="danger" onClick={() => deleteTaskComment(t.id)}><Icon d={IC.trash} size={11} /></Btn>}
                  </div>
                  {t.instructorComment && (
                    <p className="rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-1 text-xs text-blue-800 dark:text-blue-300">💬 Current: "{t.instructorComment}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Flag Modal ────────────────────────────────────────────────────────────────
function FlagModal({ project, setProjects, pushNotif, onClose }) {
  const [reason, setReason] = useState(project.flagReason || '')
  const submit = () => {
    if (!reason.trim()) return alert('Please provide a reason for flagging.')
    setProjects(p => p.map(x => x.id === project.id ? { ...x, flagged: true, flagReason: reason.trim() } : x))
    const key = 'student_notifs_' + project.owner
    LS.set(key, [...LS.get(key, []), { id: Date.now().toString(), read: false, message: `⚑ Your project "${project.title}" has been flagged. Reason: ${reason.trim()}`, createdAt: new Date().toISOString() }])
    pushNotif(`Project "${project.title}" has been flagged.`)
    onClose()
  }
  const unflag = () => {
    setProjects(p => p.map(x => x.id === project.id ? { ...x, flagged: false, flagReason: '' } : x))
    pushNotif(`Project "${project.title}" has been unflagged.`)
    onClose()
  }
  return (
    <Modal title={`Flag Project — ${project.title}`} onClose={onClose}>
      <div className="space-y-4">
        {project.flagged && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            Currently flagged: "{project.flagReason}"
          </div>
        )}
        <Textarea label="Reason for Flagging *" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Suspected plagiarism, violates rules…" rows={3} />
        <div className="flex gap-2">
          <Btn variant="danger" onClick={submit}><Icon d={IC.flag} size={13} />Flag Project</Btn>
          {project.flagged && <Btn variant="secondary" onClick={unflag}>Unflag Project</Btn>}
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  )
}

// ── Projects (assigned) ───────────────────────────────────────────────────────
function ProjectsSection({ user, projects, setProjects, pushNotif }) {
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [sortBy, setSort] = useState('date')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)

  const assigned = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'accepted'))
  const courses = [...new Set(assigned.map(p => p.course))]
  const displayed = assigned
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filterCourse || p.course === filterCourse)
    .sort((a, b) => sortBy === 'date' ? new Date(b.createdAt) - new Date(a.createdAt) : (b.rating || 0) - (a.rating || 0))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Projects</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Projects where you are an invited instructor.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects…" />
        <Sel value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c}>{c}</option>)}
        </Sel>
        <Sel value={sortBy} onChange={e => setSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
        </Sel>
      </div>

      {displayed.length === 0 ? <Card><EmptyState message="No assigned projects yet. Accept a project invitation to get started." /></Card> :
        <div className="space-y-3">
          {displayed.map(p => (
            <Card key={p.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                    <Badge color="blue">{p.course}</Badge>
                    {p.rating > 0 && <Badge color="yellow">★ {p.rating}/5</Badge>}
                    {p.flagged && <Badge color="red">⚑ Flagged</Badge>}
                  </div>
                  {p.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                  <div className="flex flex-wrap gap-1">{(p.languages || []).map(l => <Badge key={l} color="slate">{l}</Badge>)}</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Owner: {p.owner} · Created {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Btn size="sm" onClick={() => { setSelected(p); setModal('view') }}><Icon d={IC.eye} size={13} />View & Feedback</Btn>
                  <Btn size="sm" variant="warning" onClick={() => { setSelected(p); setModal('flag') }}><Icon d={IC.flag} size={13} />Flag</Btn>
                </div>
              </div>
              {(p.instructorComments || []).length > 0 && (
                <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 p-3">
                  <p className="mb-1 text-xs font-semibold text-blue-700 dark:text-blue-300">💬 Your Feedback</p>
                  {p.instructorComments.map((c, i) => <p key={i} className="text-xs text-blue-800 dark:text-blue-300">"{c.text}"</p>)}
                </div>
              )}
            </Card>
          ))}
        </div>
      }
      {modal === 'view' && selected && <ProjectFeedbackModal project={projects.find(p => p.id === selected.id) || selected} user={user} setProjects={setProjects} pushNotif={pushNotif} onClose={() => setModal(null)} />}
      {modal === 'flag' && selected && <FlagModal project={projects.find(p => p.id === selected.id) || selected} setProjects={setProjects} pushNotif={pushNotif} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Invitations ───────────────────────────────────────────────────────────────
function InvitationsSection({ user, projects, setProjects, pushNotif }) {
  const pending = projects.filter(p => (p.collaborators || []).some(c => c.email === user.email && c.status === 'pending'))
  const respond = (projectId, status) => {
    setProjects(p => p.map(x => x.id === projectId ? { ...x, collaborators: (x.collaborators || []).map(c => c.email === user.email ? { ...c, status } : c) } : x))
    const proj = projects.find(p => p.id === projectId)
    pushNotif(`You ${status} the invitation for "${proj?.title}".`)
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Invitations</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Students can invite you to their projects as an instructor.</p>
      </div>
      {pending.length === 0 ? <Card><EmptyState message="No pending invitations." /></Card> :
        <div className="space-y-3">
          {pending.map(p => {
            const collab = (p.collaborators || []).find(c => c.email === user.email)
            return (
              <Card key={p.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.title}</p>
                    <div className="flex flex-wrap gap-2"><Badge color="blue">{p.course}</Badge><Badge color="slate">Owner: {p.owner}</Badge></div>
                    {p.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                    <p className="text-xs text-slate-400 dark:text-slate-500">Invited {new Date(collab?.invitedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Btn size="sm" variant="success" onClick={() => respond(p.id, 'accepted')}><Icon d={IC.check} size={13} />Accept</Btn>
                    <Btn size="sm" variant="danger" onClick={() => respond(p.id, 'rejected')}><Icon d={IC.x} size={13} />Reject</Btn>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsSection({ notifications, setNotifications, profileEmail }) {
  const [notifsOn, setNotifsOn] = useLS('instructor_notifs_on_' + (profileEmail || 'default'), true)
  const unread = unreadCount(notifications)
  const markAll = read => setNotifications(p => p.map(n => ({ ...n, read })))

  const iconFor = n => {
    const msg = (n.message || '').toLowerCase()
    if (msg.includes('message') || msg.includes('chat')) return { d: IC.chat, bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' }
    if (msg.includes('invitation') || msg.includes('invited')) return { d: IC.users, bg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' }
    if (msg.includes('project') || msg.includes('feedback')) return { d: IC.folder, bg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' }
    if (msg.includes('flag')) return { d: IC.flag, bg: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' }
    return { d: IC.bell, bg: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          {unread > 0 && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{unread} unread</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" variant="secondary" onClick={() => markAll(true)}>Mark all read</Btn>
          <Btn size="sm" variant="secondary" onClick={() => markAll(false)}>Mark all unread</Btn>
          <Btn size="sm" variant={notifsOn ? 'danger' : 'success'} onClick={() => setNotifsOn(p => !p)}>
            <Icon d={IC.bell} size={13} />{notifsOn ? 'Turn Off' : 'Turn On'}
          </Btn>
        </div>
      </div>
      {!notifsOn && (
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
          🔕 Notifications are turned off.
        </div>
      )}
      {notifications.length === 0 ? <Card><EmptyState message="No notifications yet." /></Card> :
        <div className="space-y-1.5">
          {notifications.slice().reverse().map(n => {
            const { d, bg } = iconFor(n)
            return (
              <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-150 ${n.read ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20'}`}>
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}><Icon d={d} size={14} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  <button onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: !x.read } : x))}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {n.read ? 'Unread' : 'Read'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

// ── Messages ──────────────────────────────────────────────────────────────────
function MessagesSection({ user, pushNotif }) {
  const [threads, setThreads] = useLS('instructor_messages_' + user.email, [])
  const [active, setActive] = useState(null)
  const [newEmail, setNewEmail] = useState('')
  const [text, setText] = useState('')
  const [showNew, setShowNew] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [active, threads])
  useEffect(() => { if (active) inputRef.current?.focus() }, [active])

  const startThread = () => {
    const em = newEmail.trim().toLowerCase(); if (!em) return
    if (threads.some(t => t.with === em)) { setActive(em); setNewEmail(''); setShowNew(false); return }
    setThreads(p => [...p, { with: em, messages: [] }])
    setActive(em); setNewEmail(''); setShowNew(false)
  }

  const send = () => {
    if (!text.trim() || !active) return
    const msg = { id: Date.now().toString(), from: user.email, text: text.trim(), at: new Date().toISOString(), read: false }
    setThreads(p => p.map(t => t.with === active ? { ...t, messages: [...t.messages, msg] } : t))
    const recipKey = 'student_messages_' + active
    const recipThreads = LS.get(recipKey, [])
    const existing = recipThreads.find(t => t.with === user.email)
    if (existing) LS.set(recipKey, recipThreads.map(t => t.with === user.email ? { ...t, messages: [...t.messages, msg] } : t))
    else LS.set(recipKey, [...recipThreads, { with: user.email, messages: [msg] }])
    LS.set('student_notifs_' + active, [...LS.get('student_notifs_' + active, []), { id: Date.now().toString(), read: false, message: `New message from ${user.email}.`, createdAt: new Date().toISOString() }])
    pushNotif(`Message sent to ${active}.`)
    setText('')
  }

  const activeThread = threads.find(t => t.with === active)
  const formatTime = iso => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const formatDate = iso => { const d = new Date(iso), today = new Date(); if (d.toDateString() === today.toDateString()) return 'Today'; const y = new Date(today); y.setDate(today.getDate() - 1); if (d.toDateString() === y.toDateString()) return 'Yesterday'; return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
  const grouped = (msgs = []) => { const groups = []; let lastDate = ''; msgs.forEach(m => { const label = formatDate(m.at); if (label !== lastDate) { groups.push({ type: 'date', label }); lastDate = label } groups.push({ type: 'msg', ...m }) }); return groups }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      {/* Thread list */}
      <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Messages</p>
          <button onClick={() => setShowNew(p => !p)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"><Icon d={IC.plus} size={13} /></button>
        </div>
        {showNew && (
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 flex gap-1.5">
            <input autoFocus value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') startThread(); if (e.key === 'Escape') setShowNew(false) }} placeholder="Enter email address…"
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none" />
            <button onClick={startThread} className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-800 transition-colors">Go</button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50"><Icon d={IC.chat} size={18} /></div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click + to start chatting</p>
            </div>
          ) : threads.map(t => {
            const uc = t.messages.filter(m => m.from !== user.email && !m.read).length
            const isActive = active === t.with
            const lastMsg = t.messages.at(-1)
            return (
              <button key={t.with} onClick={() => setActive(t.with)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-slate-100 dark:border-slate-700/50 ${isActive ? 'bg-blue-700' : 'hover:bg-white dark:hover:bg-slate-800'}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>{t.with[0].toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`truncate text-xs font-semibold ${isActive ? 'text-white' : uc > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{t.with}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {lastMsg && <p className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>{formatTime(lastMsg.at)}</p>}
                      {uc > 0 && !isActive && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">{uc > 9 ? '9+' : uc}</span>}
                    </div>
                  </div>
                  <p className={`truncate text-[11px] mt-0.5 ${isActive ? 'text-blue-200' : uc > 0 ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{lastMsg ? lastMsg.text : 'No messages yet'}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {!activeThread ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30"><Icon d={IC.chat} size={28} /></div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Select a conversation</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Choose from the left or start a new chat.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">{activeThread.with[0].toUpperCase()}</div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeThread.with}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{activeThread.messages.length} message{activeThread.messages.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scroll-smooth bg-slate-50 dark:bg-slate-900/50">
              {activeThread.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center"><p className="text-sm text-slate-400 dark:text-slate-500">Say hello 👋</p></div>
              ) : grouped(activeThread.messages).map((item, idx) => {
                if (item.type === 'date') return (
                  <div key={'d' + idx} className="flex items-center gap-3 py-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-2">{item.label}</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>
                )
                const isMine = item.from === user.email
                return (
                  <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                    {!isMine && <div className="mr-2 flex h-6 w-6 shrink-0 self-end items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-[10px] font-bold text-blue-700 dark:text-blue-300">{item.from[0].toUpperCase()}</div>}
                    <div className="max-w-xs lg:max-w-sm xl:max-w-md">
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMine ? 'rounded-br-md bg-blue-700 text-white' : 'rounded-bl-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'}`}>
                        <p className="break-words">{item.text}</p>
                      </div>
                      <p className={`mt-0.5 text-[10px] ${isMine ? 'text-right text-slate-400 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>{formatTime(item.at)}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder={`Message ${activeThread.with.split('@')[0]}…`}
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" />
                <button onClick={send} disabled={!text.trim()} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white transition-all hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"><Icon d={IC.send} size={13} /></button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">Press Enter to send</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Recommended Projects ──────────────────────────────────────────────────────
function RecommendedSection({ user, projects, linkedCourses }) {
  const recommended = projects.filter(p =>
    p.visibility === 'public' &&
    linkedCourses.includes(p.course) &&
    !(p.collaborators || []).some(c => c.email === user.email)
  )
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Projects</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Public projects from your courses you haven't been assigned to yet.</p>
      </div>
      {recommended.length === 0 ? <Card><EmptyState message="No recommended projects at this time." /></Card> :
        <div className="space-y-3">
          {recommended.map(p => (
            <Card key={p.id}>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <Badge color="blue">{p.course}</Badge>
                  {p.rating > 0 && <Badge color="yellow">★ {p.rating}/5</Badge>}
                </div>
                {p.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                <div className="flex flex-wrap gap-1">{(p.languages || []).map(l => <Badge key={l} color="slate">{l}</Badge>)}</div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Owner: {p.owner} · {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

// ── Student Portfolios ────────────────────────────────────────────────────────
function StudentPortfoliosSection() {
  const [search, setSearch] = useState('')
  const [filterMajor, setFilterMajor] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [selected, setSelected] = useState(null)

  const allUsers = LS.get('guc_projecthub_users', []).filter(u => u.role === 'student')
  const allProjects = LS.get('student_projects', [])
  const profiles = allUsers.map(u => ({ ...u, ...LS.get('student_profile_' + u.email, {}) }))
  const withProjects = profiles.map(p => ({
    ...p,
    publicProjects: allProjects.filter(pr => pr.owner === p.email && pr.visibility === 'public'),
    projectCount: allProjects.filter(pr => pr.owner === p.email && pr.visibility === 'public').length,
  }))
  const majors = [...new Set(profiles.map(p => p.major).filter(Boolean))]
  const allSkills = [...new Set(profiles.flatMap(p => p.skills || []))]
  const displayed = withProjects
    .filter(p => { const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase(); return name.includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) })
    .filter(p => !filterMajor || p.major === filterMajor)
    .filter(p => !filterSkill || (p.skills || []).includes(filterSkill))
    .sort((a, b) => b.projectCount - a.projectCount)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Portfolios</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search and browse student portfolios from across the platform.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <Sel value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
          <option value="">All Majors</option>
          {majors.map(m => <option key={m}>{m}</option>)}
        </Sel>
        <Sel value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
          <option value="">All Skills</option>
          {allSkills.map(s => <option key={s}>{s}</option>)}
        </Sel>
      </div>

      {displayed.length === 0 ? <Card><EmptyState message="No student portfolios found." /></Card> :
        <div className="space-y-3">
          {displayed.map(p => (
            <Card key={p.email}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {p.photo
                    ? <img src={p.photo} alt="avatar" className="h-12 w-12 shrink-0 rounded-full object-cover border-2 border-blue-200" />
                    : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-lg font-bold text-blue-700 dark:text-blue-300">{(p.firstName?.[0] || p.email[0]).toUpperCase()}</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.firstName} {p.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {p.major && <Badge color="blue">{p.major}</Badge>}
                      <span className="text-xs text-slate-400 dark:text-slate-500">{p.projectCount} public project{p.projectCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">{(p.skills || []).slice(0, 4).map(s => <Badge key={s} color="slate">{s}</Badge>)}</div>
                  </div>
                </div>
                <Btn size="sm" variant="secondary" onClick={() => setSelected(p)}><Icon d={IC.eye} size={13} />View Portfolio</Btn>
              </div>
            </Card>
          ))}
        </div>
      }

      {selected && (
        <Modal title={`${selected.firstName} ${selected.lastName}'s Portfolio`} onClose={() => setSelected(null)} wide>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selected.photo
                ? <img src={selected.photo} alt="avatar" className="h-14 w-14 rounded-full object-cover border-2 border-blue-200" />
                : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-2xl font-bold text-blue-700 dark:text-blue-300">{(selected.firstName?.[0] || selected.email[0]).toUpperCase()}</div>
              }
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{selected.firstName} {selected.lastName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.email}</p>
                {selected.major && <Badge color="blue">{selected.major}</Badge>}
              </div>
            </div>
            {selected.linkedin && <a href={selected.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={13} />{selected.linkedin}</a>}
            {(selected.skills || []).length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Skills</p>
                <div className="flex flex-wrap gap-1.5">{selected.skills.map(s => <Badge key={s}>{s}</Badge>)}</div>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Public Projects ({selected.publicProjects.length})</p>
              {selected.publicProjects.length === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500">No public projects.</p> :
                <div className="space-y-2">
                  {selected.publicProjects.map(proj => (
                    <div key={proj.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{proj.title}</p>
                        <Badge color="blue">{proj.course}</Badge>
                        {proj.rating > 0 && <Badge color="yellow">★ {proj.rating}/5</Badge>}
                      </div>
                      {proj.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{proj.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">{(proj.languages || []).map(l => <Badge key={l} color="slate">{l}</Badge>)}</div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsSection({ rawUser, initialTab = 'appearance' }) {
  const { isDark, setTheme } = useTheme()
  const [profilePublic, setProfilePublic] = useLS('instructor_setting_profile_public_' + rawUser.email, true)
  const [msgNotifs, setMsgNotifs] = useLS('instructor_setting_msg_notifs_' + rawUser.email, true)
  const [cooldown, setCooldown] = useState(false)
  const [cooldownCount, setCooldownCount] = useState(5)
  const [tab, setTab] = useState(initialTab)

  useEffect(() => { setTab(initialTab) }, [initialTab])
  const startCooldown = () => {
    setCooldown(true); setCooldownCount(5)
    const t = setInterval(() => setCooldownCount(c => {
      if (c <= 1) { clearInterval(t); setTimeout(() => setCooldown(false), 400); return 0 }
      return c - 1
    }), 1000)
  }

  const settingsTabs = [
    { id: 'appearance', label: 'Appearance', icon: IC.moon },
    { id: 'notifications', label: 'Notifications', icon: IC.bell },
    { id: 'wellness', label: 'Wellness', icon: IC.zap },
    { id: 'account', label: 'Account', icon: IC.shield },
  ]

  const Toggle = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {desc && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {cooldown && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-blue-300/50" />
              <span className="text-4xl font-bold text-white">{cooldownCount}</span>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-light text-white tracking-wide">Take a breath</p>
              <p className="text-sm text-blue-200">Inhale slowly… exhale gently…</p>
            </div>
            <div className="h-1 w-48 rounded-full bg-slate-700">
              <div className="h-1 rounded-full bg-blue-400 transition-all duration-1000" style={{ width: `${(cooldownCount / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account preferences.</p>
      </div>
      <div className="flex gap-6">
        <div className="w-44 shrink-0 space-y-0.5">
          {settingsTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700'}`}>
              <Icon d={t.icon} size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          {tab === 'appearance' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Choose your preferred theme.</p></div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Theme</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setTheme(false)} className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${!isDark ? 'border-blue-600 shadow-md shadow-blue-100' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-200" /><div className="h-1.5 w-16 rounded bg-slate-200" /><div className="ml-auto h-1.5 w-8 rounded bg-blue-200" /></div>
                      <div className="flex gap-2 p-2"><div className="w-8 space-y-1"><div className="h-1.5 rounded bg-blue-100" /><div className="h-1.5 rounded bg-slate-100" /></div><div className="flex-1 space-y-1.5"><div className="h-6 rounded-lg bg-blue-100" /><div className="grid grid-cols-2 gap-1"><div className="h-4 rounded bg-slate-100" /><div className="h-4 rounded bg-slate-100" /></div></div></div>
                    </div>
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800">Light</p><p className="text-xs text-slate-400">Clean and bright</p></div>{!isDark && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11} /></div>}</div>
                  </button>
                  <button onClick={() => setTheme(true)} className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${isDark ? 'border-blue-600 shadow-md shadow-blue-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-700 bg-slate-800 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-600" /><div className="h-1.5 w-16 rounded bg-slate-600" /><div className="ml-auto h-1.5 w-8 rounded bg-blue-700" /></div>
                      <div className="flex gap-2 p-2"><div className="w-8 space-y-1"><div className="h-1.5 rounded bg-blue-900" /><div className="h-1.5 rounded bg-slate-700" /></div><div className="flex-1 space-y-1.5"><div className="h-6 rounded-lg bg-blue-900" /><div className="grid grid-cols-2 gap-1"><div className="h-4 rounded bg-slate-700" /><div className="h-4 rounded bg-slate-700" /></div></div></div>
                    </div>
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark</p><p className="text-xs text-slate-400 dark:text-slate-500">Easy on the eyes</p></div>{isDark && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11} /></div>}</div>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                <Icon d={isDark ? IC.moon : IC.sun} size={14} />
                <p className="text-xs text-slate-600 dark:text-slate-300">Currently using <span className="font-semibold">{isDark ? 'Dark' : 'Light'}</span> mode</p>
              </div>
            </div>
          )}
          {tab === 'notifications' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <h3 className="mb-0.5 font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
              <p className="mb-5 text-xs text-slate-400 dark:text-slate-500">Choose which notifications you want to receive.</p>
              <Toggle value={msgNotifs} onChange={setMsgNotifs} label="Message Notifications" desc="Get notified when someone sends you a message" />
            </div>
          )}
          {tab === 'wellness' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Wellness & Focus</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Tools to help you stay calm and focused.</p></div>
              <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 text-center space-y-3">
                <div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"><Icon d={IC.zap} size={24} /></div></div>
                <div><p className="font-semibold text-slate-900 dark:text-white">5-Second Cooldown</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Feeling overwhelmed? A calming overlay will guide you through a quick breathing reset.</p></div>
                <button onClick={startCooldown} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all"><Icon d={IC.zap} size={14} />Start Cooldown</button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">💡 Wellness Tips</p>
                <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>• Take short breaks every 25 minutes (Pomodoro method)</li>
                  <li>• Stay hydrated — keep water nearby while working</li>
                  <li>• Reach out to students early on projects</li>
                  <li>• Set clear feedback deadlines to reduce last-minute stress</li>
                </ul>
              </div>
            </div>
          )}
          {tab === 'account' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Account Settings</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Manage your account security and visibility.</p></div>
              <Toggle value={profilePublic} onChange={setProfilePublic} label="Public Profile" desc="Allow students to find and view your profile" />
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Account Info</p>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium text-slate-800 dark:text-slate-200">{rawUser.email}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Role</span><span className="font-medium text-slate-800 dark:text-slate-200">Instructor</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">University</span><span className="font-medium text-slate-800 dark:text-slate-200">GUC</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const navigate = useNavigate()
  const rawUser = getCurrentUser()
  const { isDark, setTheme, toggleTheme } = useTheme()

  if (!rawUser || rawUser.role !== 'instructor') { navigate('/login'); return null }
  seedAcademicPlatformDemoData({ instructorEmail: rawUser.email })

  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebar] = useState(false)
  const [settingsTab, setSettingsTab] = useState('appearance')
  const [showFeedbackCenter, setShowFeedbackCenter] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [meetings, setMeetings] = useLS('instructor_meetings_' + rawUser.email, [])
  const [announcements, setAnnouncementsLS] = useLS('instructor_announcements_' + rawUser.email, [])
  const setAnnouncements = (next) => {
    const resolved = typeof next === 'function' ? next(announcements) : next
    setAnnouncementsLS(resolved)
    // mirror to shared bridge key so students can read instructor announcements
    const BRIDGE_KEY = 'guc_instructor_announcements'
    const others = LS.get(BRIDGE_KEY, []).filter(a => a.instructorEmail !== rawUser.email)
    LS.set(BRIDGE_KEY, [...others, ...resolved.map(ann => ({
      id: ann.id,
      title: ann.title,
      message: ann.message,
      type: ann.type || 'info',
      date: ann.date || new Date().toISOString().slice(0, 10),
      instructorEmail: rawUser.email,
      instructorName: `${profile.firstName || rawUser.firstName || ''} ${profile.lastName || rawUser.lastName || ''}`.trim(),
      courseCode: ann.courseCode || '',
    }))])
  }
  const [meetingForm, setMeetingForm] = useState({ student:'', date:'', time:'', topic:'' })
  const [announcementForm, setAnnouncementForm] = useState({ title:'', message:'', type:'info', scheduled:false })

  const [profile, setProfileLS] = useLS('instructor_profile_' + rawUser.email, { firstName: rawUser.firstName || '', lastName: rawUser.lastName || '', bio: '', research: '', education: '' })
  const [linkedCourses, setLinkedCoursesLS] = useLS('instructor_courses_' + rawUser.email, ['Bachelor Project'])
  const [projects, setProjectsLS] = useState(() => getSharedProjects())
  const [notifications, setNotificationsLS] = useLS('instructor_notifs_' + rawUser.email, [])

  const setProfile = v => setProfileLS(v)
  const setLinkedCourses = v => setLinkedCoursesLS(v)
  const setProjects = fn => { const next = typeof fn === 'function' ? fn(projects) : fn; setSharedProjects(next); setProjectsLS(next) }

  // Refresh projects from localStorage when window regains focus
  // (catches student edits, new collaboration invitations accepted, etc.)
  useEffect(() => {
    const refreshProjects = () => {
      const fresh = getSharedProjects()
      setProjectsLS(fresh)
    }
    window.addEventListener('focus', refreshProjects)
    // Also listen for storage events (cross-tab)
    const handleStorage = (e) => {
      if (e.key === 'student_projects') {
        try { setProjectsLS(JSON.parse(e.newValue || '[]')) } catch {}
      }
      if (e.key === 'instructor_notifs_' + rawUser.email) {
        try { setNotificationsLS(JSON.parse(e.newValue || '[]')) } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('focus', refreshProjects)
      window.removeEventListener('storage', handleStorage)
    }
  }, [rawUser.email]) // eslint-disable-line
  const setNotifications = fn => setNotificationsLS(typeof fn === 'function' ? fn(notifications) : fn)
  const pushNotif = msg => setNotificationsLS(p => [...p, { id: Date.now().toString(), message: msg, read: false, createdAt: new Date().toISOString() }])

  const unread = unreadCount(notifications)
  const invites = projects.filter(p => (p.collaborators || []).some(c => c.email === rawUser.email && c.status === 'pending')).length

 const reviewQueueCount = (() => {
    const assigned = projects.filter(p => (p.collaborators||[]).some(c=>c.email===rawUser.email&&c.status==='accepted'))
    return assigned.filter(p =>
      (p.thesisDrafts||[]).some(d=>d.isFinal) ||
      (p.tasks||[]).some(t=>t.status==='completed'&&!t.instructorComment) ||
      !(p.instructorComments||[]).length
    ).length
  })()

  const navItems = [
    { id: 'overview',      label: 'Overview',              icon: IC.home },
    { id: 'profile',       label: 'My Profile',            icon: IC.user },
    { id: 'courses',       label: 'My Courses',            icon: IC.book },
    { id: 'projects',      label: 'Projects',              icon: IC.folder },
    { id: 'review-queue',  label: 'Review Queue',          icon: IC.inbox, badge: reviewQueueCount },
    { id: 'analytics',     label: 'Supervision Analytics', icon: IC.target },
    { id: 'course-analytics', label: 'Course Analytics',  icon: IC.chart },
    { id: 'resources',     label: 'Resources',             icon: IC.bookOpen },
    { id: 'invitations',   label: 'Invitations',           icon: IC.users, badge: invites },
    { id: 'notifications', label: 'Notifications',         icon: IC.bell, badge: unread },
    { id: 'messages',      label: 'Messages',              icon: IC.chat },
    { id: 'recommended',   label: 'Recommended',           icon: IC.star },
    { id: 'portfolios',    label: 'Student Portfolios',    icon: IC.heart },
    { id: 'settings',      label: 'Settings',              icon: IC.settings },
  ]

  const handleLogout = () => { setTheme(false); logoutUser(); navigate('/') }

  // Expose for export report
  useEffect(() => { window.__instructor_projects = projects.filter(p => (p.collaborators||[]).some(c=>c.email===rawUser.email&&c.status==='accepted')) }, [projects, rawUser.email])

  const [profileDropdown, setProfileDropdown] = useState(false)
  const [notifDropdown, setNotifDropdown] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const renderNav = () => (
    <>
      <div className="mb-4 mt-1 px-2">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Instructor Portal</p>
        <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-3 py-2.5 border border-blue-100 dark:border-blue-900">
          {profile.photo
            ? <img src={profile.photo} alt="avatar" className="h-8 w-8 shrink-0 rounded-full object-cover border-2 border-blue-200" />
            : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">{(profile.firstName || rawUser.firstName || 'I')[0].toUpperCase()}</div>
          }
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white leading-tight">{profile.firstName || rawUser.firstName} {profile.lastName || rawUser.lastName}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500 leading-tight">Instructor · GUC</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setSidebar(false) }}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${tab === item.id ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5'}`}>
            <Icon d={item.icon} size={16} />
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${tab === item.id ? 'bg-white text-blue-700' : 'bg-red-500 text-white'}`}>{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-4 space-y-0.5">
        <button onClick={() => { setTab('profile'); setSidebar(false) }}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${tab === 'profile' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5'}`}>
          <Icon d={IC.user} size={16} /><span>My Profile</span>
        </button>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400">
          <Icon d={IC.logout} size={16} /><span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-200 bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5 md:flex overflow-y-auto">
        {renderNav()}
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebar(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5" onClick={e => e.stopPropagation()}>
            {renderNav()}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="shrink-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebar(true)} className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
              <Icon d={IC.menu} size={18} />
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-150 hover:opacity-80 hover:bg-slate-50 dark:hover:bg-slate-800 group">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-sm">
                <Icon d={IC.book} size={14} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden sm:block">BI × ENG V2</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">ProjectHub</span>
              </div>
            </button>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-slate-600 text-sm select-none">/</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 select-none">Instructor</span>
              <span className="text-slate-300 dark:text-slate-600 text-sm select-none">/</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{navItems.find(n => n.id === tab)?.label || tab}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifDropdown(p => !p); setProfileDropdown(false) }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon d={IC.bell} size={18} />
                {unread > 0 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifDropdown && (
                <div className="absolute right-0 top-11 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                    {unread > 0 && <button onClick={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Mark all read</button>}
                  </div>
                  {notifications.length === 0
                    ? <p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">No notifications yet.</p>
                    : <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {notifications.slice().reverse().slice(0, 6).map(n => (
                        <li key={n.id}>
                          <button onClick={() => { setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x)); setNotifDropdown(false) }}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150 ${n.read ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs leading-snug ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>{n.message}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                            {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  }
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    <button onClick={() => { setTab('notifications'); setNotifDropdown(false) }} className="w-full rounded-lg py-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileDropdown(p => !p); setNotifDropdown(false) }}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {profile.photo
                  ? <img src={profile.photo} alt="avatar" className="h-8 w-8 rounded-full object-cover border-2 border-blue-200" />
                  : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">{(profile.firstName || rawUser.firstName || 'I')[0].toUpperCase()}</div>
                }
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{profile.firstName || rawUser.firstName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 leading-tight">Instructor</p>
                </div>
                <svg className="hidden sm:block h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {profileDropdown && (
                <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.firstName || rawUser.firstName} {profile.lastName || rawUser.lastName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{rawUser.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { label: 'My Profile', icon: IC.user, action: () => { setTab('profile'); setProfileDropdown(false) } },
                      { label: 'Appearance', icon: IC.moon, action: () => { setTab('settings'); setSettingsTab('appearance'); setProfileDropdown(false) } },
                      { label: 'Notifications', icon: IC.bell, action: () => { setTab('settings'); setSettingsTab('notifications'); setProfileDropdown(false) } },
                      { label: 'Wellness', icon: IC.zap, action: () => { setTab('settings'); setSettingsTab('wellness'); setProfileDropdown(false) } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <Icon d={item.icon} size={14} />{item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 p-1.5">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Icon d={IC.logout} size={14} />Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-5xl">
           {tab === 'overview'         && <Overview user={rawUser} profile={profile} linkedCourses={linkedCourses} notifications={notifications} projects={projects} setTab={setTab} openFeedbackCenter={() => setShowFeedbackCenter(true)} openMeetingModal={() => setShowMeetingModal(true)} openAnnouncementModal={() => setShowAnnouncementModal(true)}/>}
            {tab === 'analytics'        && <SupervisionAnalyticsSection user={rawUser} projects={projects}/>}
            {tab === 'review-queue'     && <ReviewQueueSection user={rawUser} projects={projects} setProjects={setProjects} pushNotif={pushNotif}/>}
            {tab === 'course-analytics' && <CourseAnalyticsSection user={rawUser} projects={projects} linkedCourses={linkedCourses}/>}
            {tab === 'resources'        && <ResourceManagementSection user={rawUser}/>}
            {tab === 'profile'       && <ProfileSection user={rawUser} profile={profile} setProfile={setProfile} />}
            {tab === 'courses'       && <CoursesSection linkedCourses={linkedCourses} setLinkedCourses={setLinkedCourses} pushNotif={pushNotif} />}
            {tab === 'projects'      && <ProjectsSection user={rawUser} projects={projects} setProjects={setProjects} pushNotif={pushNotif} />}
            {tab === 'invitations'   && <InvitationsSection user={rawUser} projects={projects} setProjects={setProjects} pushNotif={pushNotif} />}
            {tab === 'notifications' && <NotificationsSection notifications={notifications} setNotifications={setNotifications} profileEmail={rawUser.email} />}
            {tab === 'messages'      && <MessagesSection user={rawUser} pushNotif={pushNotif} />}
            {tab === 'recommended'   && <RecommendedSection user={rawUser} projects={projects} linkedCourses={linkedCourses} />}
            {tab === 'portfolios'    && <StudentPortfoliosSection />}
           {tab === 'settings'      && <SettingsSection rawUser={rawUser} initialTab={settingsTab} />}

            {/* Meetings & Announcements widgets always accessible from analytics / overview */}
            {tab === 'analytics' && (
              <div className="grid gap-4 lg:grid-cols-2 mt-6">
                <MeetingsWidget meetings={meetings} onAdd={() => setShowMeetingModal(true)} onRemove={id => setMeetings(p => p.filter(m => m.id !== id))}/>
                <AnnouncementsManagement announcements={announcements} onAdd={() => setShowAnnouncementModal(true)} onRemove={id => setAnnouncements(p => p.filter(a => a.id !== id))}/>
              </div>
            )}
            {tab === 'review-queue' && null /* rendered above */}
          </div>
        </main>
      </div>

      {/* ── Feedback Center Modal ── */}
      {showFeedbackCenter && (
        <QuickFeedbackCenter user={rawUser} projects={projects} setProjects={setProjects} pushNotif={pushNotif} onClose={() => setShowFeedbackCenter(false)}/>
      )}

      {/* ── Schedule Meeting Modal ── */}
      {showMeetingModal && (
        <Modal title="Schedule Meeting" onClose={() => setShowMeetingModal(false)}>
          <div className="space-y-4">
            <Input label="Student / Group" value={meetingForm.student} onChange={e => setMeetingForm(p => ({...p, student:e.target.value}))} placeholder="e.g. Ahmed Ali or Group 7"/>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Date" type="date" value={meetingForm.date} onChange={e => setMeetingForm(p => ({...p, date:e.target.value}))}/>
              <Input label="Time" type="time" value={meetingForm.time} onChange={e => setMeetingForm(p => ({...p, time:e.target.value}))}/>
            </div>
            <Input label="Topic" value={meetingForm.topic} onChange={e => setMeetingForm(p => ({...p, topic:e.target.value}))} placeholder="e.g. Thesis progress review"/>
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Btn onClick={() => {
                if (!meetingForm.student || !meetingForm.date) return alert('Student and date are required.')
                setMeetings(p => [...p, { ...meetingForm, id:Date.now().toString() }])
                pushNotif(`Meeting with ${meetingForm.student} scheduled for ${meetingForm.date}.`)
                setMeetingForm({ student:'', date:'', time:'', topic:'' })
                setShowMeetingModal(false)
              }}><Icon d={IC.check} size={13}/>Save Meeting</Btn>
              <Btn variant="secondary" onClick={() => setShowMeetingModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Post Announcement Modal ── */}
      {showAnnouncementModal && (
        <Modal title="Post Announcement" onClose={() => setShowAnnouncementModal(false)}>
          <div className="space-y-4">
            <Input label="Title *" value={announcementForm.title} onChange={e => setAnnouncementForm(p => ({...p, title:e.target.value}))} placeholder="e.g. Office hours updated"/>
            <Textarea label="Message *" value={announcementForm.message} onChange={e => setAnnouncementForm(p => ({...p, message:e.target.value}))} placeholder="Write your announcement…" rows={3}/>
            <Sel label="Type" value={announcementForm.type} onChange={e => setAnnouncementForm(p => ({...p, type:e.target.value}))}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </Sel>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sched" checked={announcementForm.scheduled} onChange={e => setAnnouncementForm(p => ({...p, scheduled:e.target.checked}))} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
              <label htmlFor="sched" className="text-sm text-slate-700 dark:text-slate-300">Mark as scheduled (future)</label>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <Btn onClick={() => {
                if (!announcementForm.title || !announcementForm.message) return alert('Title and message are required.')
                setAnnouncements(p => [...p, { ...announcementForm, id:Date.now().toString(), date:new Date().toISOString().slice(0,10) }])
                pushNotif(`Announcement "${announcementForm.title}" posted.`)
                setAnnouncementForm({ title:'', message:'', type:'info', scheduled:false })
                setShowAnnouncementModal(false)
              }}><Icon d={IC.megaphone} size={13}/>Post Announcement</Btn>
              <Btn variant="secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
