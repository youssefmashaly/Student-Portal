import { useTheme } from '../../context/ThemeContext'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../data/authStorage'
import { seedAcademicPlatformDemoData } from '../../data/academicPlatformSeed'

const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
}

// Theme is now managed globally by ThemeProvider in main.jsx
const THEME_KEY = 'projecthub_dark_mode'

function useLS(key, initial) {
  const [val, setVal] = useState(() => LS.get(key, initial))
  const save = (v) => { const next = typeof v === 'function' ? v(val) : v; LS.set(key, next); setVal(next) }
  return [val, save]
}

const COURSES    = ['CSEN 401','CSEN 402','CSEN 501','CSEN 502','DMET 502','DMET 305','CSEN 603','CSEN 701','Bachelor Project']
const LANGS      = ['JavaScript','Python','Java','C++','TypeScript','Go','Rust','Swift','Kotlin','PHP']
const SKILLS_ALL = ['React','Node.js','Python','Machine Learning','UI/UX','Docker','SQL','Git','Flutter','AWS']
const TASK_STATUSES = ['pending','postponed','completed']

const getSeedInstructors = () => {
  const users = LS.get('guc_projecthub_users', [])
  const instructors = users.filter(u => u.role === 'instructor')
  if (instructors.length === 0) {
    return [{ firstName:'Demo', lastName:'Instructor', email:'instructor@guc.edu.eg', role:'instructor', linkedCourses:['CSEN 401','CSEN 402','Bachelor Project'], bio:'Expert in software engineering.', research:'Distributed systems, AI', education:'PhD Computer Science, GUC' }]
  }return instructors.map(u => {
    const prof = LS.get('instructor_profile_'+u.email, {})
    return {
      ...u,
      linkedCourses: LS.get('instructor_courses_'+u.email, ['Bachelor Project']),
      ...prof,
      firstName: (prof.firstName && prof.firstName.trim()) ? prof.firstName : (u.firstName || ''),
      lastName:  (prof.lastName  && prof.lastName.trim())  ? prof.lastName  : (u.lastName  || ''),
    }
  })
}

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)
const IC = {
  home:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', folder:'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  task:'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7', bell:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  chat:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', briefcase:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z',
  chart:'M18 20V10M12 20V4M6 20v-6', user:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  heart:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  logout:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9', plus:'M12 5v14M5 12h14',
  edit:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:'M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 6V4h4v2', x:'M18 6L6 18M6 6l12 12',
  search:'M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z', check:'M20 6L9 17l-5-5',
  link:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  upload:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12', send:'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  menu:'M3 12h18M3 6h18M3 18h18', eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6',
  eyeOff:'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22',
  users:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  fileText:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  book:'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
 star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  calendar:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  settings:'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  moon:'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  sun:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  help:'M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01',
  clock:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
zap:'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  award:'M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  trendUp:'M23 6l-9.5 9.5-5-5L1 18',
  trendDown:'M23 18l-9.5-9.5-5 5L1 6',
  activity:'M22 12h-4l-3 9L9 3l-3 9H2',
  gitCommit:'M12 9a3 3 0 100 6 3 3 0 000-6zM1 12h8M15 12h8',
  target:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  layers:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  barChart2:'M18 20V10M12 20V4M6 20v-6',
  arrowUp:'M12 19V5M5 12l7-7 7 7',
  arrowDown:'M12 5v14M19 12l-7 7-7-7',
  userCheck:'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M16 11l2 2 4-4',
  coffee:'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3',
  message:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  teamwork:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  sparkle:'M12 3v1m0 16v1M4.22 4.22l.71.71m12.02 12.02l.71.71M3 12h1m16 0h1M4.22 19.78l.71-.71M18.93 5.93l.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z',
  graduationCap:'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5',
  playCircle:'M12 22a10 10 0 100-20 10 10 0 000 20zM10 8l6 4-6 4V8z',
  video:'M23 7l-7 5 7 5V7zM1 5h15a2 2 0 012 2v10a2 2 0 01-2 2H1V5z',
  paperclip:'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
  externalLink:'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
  filePdf:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6M9 9h1',
  fileSpreadsheet:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2',
  archive:'M21 8v13H3V8M23 3H1v5h22V3zM10 12h4',
  trophy:'M8.21 13.89L7 23l5-3 5 3-1.21-9.12M12 2a7 7 0 100 14A7 7 0 0012 2z',
  bookOpen:'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  alertCircle:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01',
  megaphone:'M3 11l19-9-9 19-2-8-8-2zM11 13l3-3',
  history:'M12 8v4l3 3M3.05 11a9 9 0 109-8.77',
  bookmark:'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
  bookmarkFilled:'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
  info:'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  folder2:'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  chevronsDown:'M7 6l5 5 5-5M7 13l5 5 5-5',
  chevronsRight:'M6 7l5 5-5 5M13 7l5 5-5 5',
}

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue:'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    green:'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    red:'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    yellow:'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    slate:'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    purple:'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    orange:'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[color]??map.slate}`}>{children}</span>
}
const Btn = ({ children, onClick, variant='primary', size='md', className='', disabled=false }) => {
  const base='inline-flex items-center gap-1.5 rounded-lg font-medium transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes={sm:'px-3 py-1.5 text-xs',md:'px-4 py-2 text-sm',lg:'px-5 py-2.5 text-sm'}
  const variants={
    primary:'bg-blue-700 text-white hover:bg-blue-800',
    secondary:'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600',
    danger:'bg-red-600 text-white hover:bg-red-700',
    ghost:'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    success:'bg-green-600 text-white hover:bg-green-700',
  }
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>
}
const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input className={`rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${error?'border-red-400 focus:ring-red-400':'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500'}`} {...props} />
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
const Card = ({ children, className='' }) => <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm ${className}`}>{children}</div>

const Modal = ({ title, onClose, children, wide=false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className={`w-full ${wide?'max-w-2xl':'max-w-lg'} rounded-xl bg-white dark:bg-slate-800 shadow-xl flex flex-col max-h-[90vh]`}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><Icon d={IC.x}/></button>
      </div>
      <div className="overflow-y-auto px-6 py-4">{children}</div>
    </div>
  </div>
)

const EmptyState = ({ message }) => <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">{message}</p>
const TagPicker = ({ options, selected, onToggle, label }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <div className="flex flex-wrap gap-2">
      {options.map(o=>(
        <button key={o} type="button" onClick={()=>onToggle(o)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${selected.includes(o)?'border-blue-700 bg-blue-700 text-white':'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'}`}>{o}</button>
      ))}
    </div>
  </div>
)
const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 min-w-48">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon d={IC.search} size={14}/></span>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
  </div>
)

// ── Premium Overview Helpers ────────────────────────────────────────────────

function ProfileCompletionCard({ user, projects, setTab }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const resume = LS.get('student_resume_' + user.email, null)
  const checks = [
    { key: 'photo',     label: 'Profile photo',    done: !!user.photo },
    { key: 'bio',       label: 'Bio / major',       done: !!user.major },
    { key: 'skills',    label: 'Skills added',      done: (user.skills||[]).length > 0 },
    { key: 'portfolio', label: 'Project uploaded',  done: myProjects.length > 0 },
    { key: 'resume',    label: 'LinkedIn / CV link',done: !!user.linkedin || !!resume },
  ]
  const pct = Math.round((checks.filter(c => c.done).length / checks.length) * 100)
  const ringColor = pct === 100 ? 'text-emerald-500' : pct >= 60 ? 'text-blue-600' : 'text-amber-500'
  const barColor  = pct === 100 ? 'bg-emerald-500'   : pct >= 60 ? 'bg-blue-600'   : 'bg-amber-500'
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Profile Completion</h3>
        <span className={`text-2xl font-bold ${ringColor}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1.5">
        {checks.map(c => (
          <li key={c.key} className="flex items-center gap-2.5">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200 ${c.done ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
              {c.done ? '✓' : '○'}
            </span>
            <span className={`text-sm transition-colors duration-200 ${c.done ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{c.label}</span>
            {!c.done && <button onClick={() => setTab('profile')} className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0">Add</button>}
          </li>
        ))}
      </ul>
      {pct === 100 && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-3 py-2">
          <Icon d={IC.award} size={14} /><span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Profile complete — you're discoverable!</span>
        </div>
      )}
    </Card>
  )
}

function QuickActionsPanel({ setTab }) {
  const actions = [
    { label: 'Upload Project',     icon: IC.upload,   tab: 'create-project', color: 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
    { label: 'Find Instructors',   icon: IC.book,     tab: 'instructors',    color: 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
    { label: 'Message',            icon: IC.message,  tab: 'messages',       color: 'bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900' },
    { label: 'Explore Projects',   icon: IC.eye,      tab: 'explore',        color: 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
    { label: 'View Portfolio',     icon: IC.user,     tab: 'profile',        color: 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900' },
    { label: 'Join Team',          icon: IC.teamwork, tab: 'invitations',    color: 'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
  ]
  return (
    <Card>
      <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(a => (
          <button key={a.label} onClick={() => setTab(a.tab)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.color}`}>
            <Icon d={a.icon} size={18} />
            <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function UpcomingDeadlinesWidget({ user, projects, setTab }) {
  const now = new Date()
  const myProjects = projects.filter(p => p.owner === user.email)
  const scheduleDeadlines = LS.get('student_schedule_' + user.email, [])
    .filter(e => e.type === 'deadline' && e.date)
    .map(e => ({ id: 'sch_' + e.id, title: e.title, dueDate: e.date, source: 'schedule' }))
  const projectDeadlines = myProjects
    .filter(p => p.deadline)
    .map(p => ({ id: 'proj_' + p.id, title: p.title + ' deadline', dueDate: p.deadline, source: 'project' }))
  const allDeadlines = [...scheduleDeadlines, ...projectDeadlines]
    .map(d => {
      const due = new Date(d.dueDate)
      const diffMs = due - now
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return { ...d, due, diffDays }
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5)

  const getUrgency = (days) => {
    if (days < 0)  return { label: 'Overdue',     cls: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',       bar: 'bg-red-500',    dot: 'bg-red-500' }
    if (days <= 2) return { label: `${days}d left`, cls: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',        bar: 'bg-red-400',    dot: 'bg-red-400' }
    if (days <= 7) return { label: `${days}d left`, cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', bar: 'bg-amber-400',  dot: 'bg-amber-400' }
    return         { label: `${days}d left`,         cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',    bar: 'bg-blue-400',   dot: 'bg-blue-400' }
  }

  const emptyContent = (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <Icon d={IC.calendar} size={22} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No upcoming deadlines</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add events in your schedule</p>
      </div>
      <button onClick={() => setTab('schedule')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors">
        <Icon d={IC.plus} size={12} />Open Schedule
      </button>
    </div>
  )

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
        <button onClick={() => setTab('schedule')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
      </div>
      {allDeadlines.length === 0 ? emptyContent : (
        <ul className="space-y-2.5">
          {allDeadlines.map(d => {
            const u = getUrgency(d.diffDays)
            return (
              <li key={d.id} className="flex items-center gap-3 group">
                <span className={`h-2 w-2 shrink-0 rounded-full ${u.dot}`} />
                <span className="flex-1 min-w-0 text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.cls}`}>{u.label}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function RecentActivityTimeline({ user, projects, notifications, setTab }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const events = []

  myProjects.slice(0, 3).forEach(p => {
    if (p.createdAt) events.push({ id: 'p_' + p.id, type: 'project', label: `Submitted project "${p.title}"`, date: p.createdAt, tab: 'projects' })
    if (p.flagged)   events.push({ id: 'f_' + p.id, type: 'flag',    label: `Project "${p.title}" was flagged`, date: p.createdAt || new Date().toISOString(), tab: 'projects' })
    ;(p.collaborators || []).filter(c => c.status === 'accepted').forEach(c => {
      events.push({ id: 'co_' + p.id + c.email, type: 'team', label: `${c.email} joined "${p.title}"`, date: p.createdAt || new Date().toISOString(), tab: 'invitations' })
    })
  })
  notifications.slice().reverse().slice(0, 3).forEach(n => {
    const m = n.message?.toLowerCase() || ''
    const type = m.includes('message') || m.includes('chat') ? 'message' : m.includes('internship') || m.includes('job') ? 'internship' : 'notification'
    events.push({ id: 'n_' + n.id, type, label: n.message, date: n.createdAt, tab: type === 'message' ? 'messages' : type === 'internship' ? 'internships' : 'notifications' })
  })

  events.sort((a, b) => new Date(b.date) - new Date(a.date))
  const shown = events.slice(0, 6)

  const typeConfig = {
    project:      { icon: IC.folder,   dot: 'bg-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' },
    flag:         { icon: IC.flag,     dot: 'bg-red-500',    bg: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' },
    team:         { icon: IC.teamwork, dot: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' },
    message:      { icon: IC.message,  dot: 'bg-green-500',  bg: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' },
    internship:   { icon: IC.briefcase,dot: 'bg-emerald-500',bg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' },
    notification: { icon: IC.bell,     dot: 'bg-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' },
  }

  const emptyContent = (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <Icon d={IC.activity} size={22} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No activity yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Start by uploading a project</p>
      </div>
      <button onClick={() => setTab('create-project')}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors">
        <Icon d={IC.plus} size={12} />New Project
      </button>
    </div>
  )

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Activity</h3>
        <Icon d={IC.activity} size={14} />
      </div>
      {shown.length === 0 ? emptyContent : (
        <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-5 space-y-4">
          {shown.map(ev => {
            const cfg = typeConfig[ev.type] || typeConfig.notification
            return (
              <li key={ev.id} className="relative">
                <span className={`absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full ${cfg.bg} ring-2 ring-white dark:ring-slate-800`}>
                  <Icon d={cfg.icon} size={9} />
                </span>
                <button onClick={() => setTab(ev.tab)} className="group text-left">
                  <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">{ev.label}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}

function AchievementsSection({ user, projects, notifications }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const apps = LS.get('student_applications_' + user.email, [])
  const publicProjects = myProjects.filter(p => p.visibility === 'public')
  const hasSkills = (user.skills || []).length >= 3
  const hasCollabs = myProjects.some(p => (p.collaborators || []).some(c => c.status === 'accepted'))
  const hasPhoto = !!user.photo
  const badgeDefs = [
    { id: 'first_project', icon: IC.folder,     label: 'First Upload',       desc: 'Submitted your first project',   color: 'blue',    earned: myProjects.length >= 1 },
    { id: 'public_star',   icon: IC.eye,         label: 'Going Public',       desc: 'Made a project visible publicly', color: 'purple',  earned: publicProjects.length >= 1 },
    { id: 'team_player',   icon: IC.teamwork,    label: 'Team Player',        desc: 'Collaborated on a project',       color: 'green',   earned: hasCollabs },
    { id: 'job_seeker',    icon: IC.briefcase,   label: 'Job Seeker',         desc: 'Applied to an internship',        color: 'amber',   earned: apps.length >= 1 },
    { id: 'skilled',       icon: IC.sparkle,     label: 'Skilled Up',         desc: 'Added 3+ skills to profile',      color: 'rose',    earned: hasSkills },
    { id: 'selfie',        icon: IC.user,        label: 'Faces First',        desc: 'Uploaded a profile photo',        color: 'slate',   earned: hasPhoto },
    { id: 'prolific',      icon: IC.layers,      label: 'Prolific Builder',   desc: 'Submitted 3+ projects',           color: 'blue',    earned: myProjects.length >= 3 },
    { id: 'networker',     icon: IC.users,       label: 'Networker',          desc: 'Applied to 3+ internships',       color: 'green',   earned: apps.length >= 3 },
  ]
  const colorMap = {
    blue:   { ring: 'ring-blue-200 dark:ring-blue-800',   bg: 'bg-blue-100 dark:bg-blue-900/60',   text: 'text-blue-700 dark:text-blue-300',   label: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
    purple: { ring: 'ring-purple-200 dark:ring-purple-800', bg: 'bg-purple-100 dark:bg-purple-900/60', text: 'text-purple-700 dark:text-purple-300', label: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' },
    green:  { ring: 'ring-green-200 dark:ring-green-800',  bg: 'bg-green-100 dark:bg-green-900/60',  text: 'text-green-700 dark:text-green-300',  label: 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300' },
    amber:  { ring: 'ring-amber-200 dark:ring-amber-800',  bg: 'bg-amber-100 dark:bg-amber-900/60',  text: 'text-amber-700 dark:text-amber-300',  label: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
    rose:   { ring: 'ring-rose-200 dark:ring-rose-800',    bg: 'bg-rose-100 dark:bg-rose-900/60',    text: 'text-rose-700 dark:text-rose-300',    label: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' },
    slate:  { ring: 'ring-slate-200 dark:ring-slate-600',  bg: 'bg-slate-100 dark:bg-slate-700',     text: 'text-slate-500 dark:text-slate-400',  label: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  }
  const earned = badgeDefs.filter(b => b.earned)
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Achievements</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{earned.length} of {badgeDefs.length} earned</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <Icon d={IC.award} size={16} />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {badgeDefs.map(b => {
          const c = colorMap[b.color] || colorMap.slate
          return (
            <div key={b.id} title={b.desc}
              className={`group flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all duration-200 ${b.earned ? `ring-1 ${c.ring} ${c.bg} hover:-translate-y-0.5 hover:shadow-sm` : 'bg-slate-50 dark:bg-slate-800/50 opacity-40 grayscale'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${b.earned ? c.bg : 'bg-slate-100 dark:bg-slate-700'} ring-2 ${b.earned ? c.ring : 'ring-transparent'}`}>
                <Icon d={b.icon} size={18} />
              </div>
              <p className={`text-[11px] font-semibold leading-tight ${b.earned ? c.text : 'text-slate-400 dark:text-slate-500'}`}>{b.label}</p>
              {b.earned && <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${c.label}`}>✓</span>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function ActivityHeatmap({ user, projects }) {
  const WEEKS = 15
  const DAYS_PER_WEEK = 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (WEEKS * DAYS_PER_WEEK - 1))

  const activityMap = {}
  const myProjects = projects.filter(p => p.owner === user.email)
  myProjects.forEach(p => {
    if (p.createdAt) {
      const d = p.createdAt.slice(0, 10)
      activityMap[d] = (activityMap[d] || 0) + 3
    }
    ;(p.tasks || []).forEach(t => {
      if (t.deadline) {
        const d = t.deadline.slice(0, 10)
        activityMap[d] = (activityMap[d] || 0) + 1
      }
    })
  })
  const msgs = LS.get('student_messages_' + user.email, [])
  msgs.forEach(thread => {
    ;(thread.messages || []).forEach(m => {
      const ts = m.at || m.sentAt
      if (ts) {
        const d = ts.slice(0, 10)
        activityMap[d] = (activityMap[d] || 0) + 1
      }
    })
  })

  const cells = []
  for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ date: key, count: activityMap[key] || 0 })
  }

  const getLevel = (count) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3)  return 2
    if (count <= 6)  return 3
    return 4
  }
  const levelClass = [
    'bg-slate-100 dark:bg-slate-700',
    'bg-blue-200 dark:bg-blue-900',
    'bg-blue-400 dark:bg-blue-700',
    'bg-blue-600 dark:bg-blue-500',
    'bg-blue-800 dark:bg-blue-400',
  ]

  const totalActive = cells.filter(c => c.count > 0).length
  const months = []
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + w * 7)
    const label = d.toLocaleDateString(undefined, { month: 'short' })
    if (w === 0 || months[months.length - 1] !== label) months.push(label)
    else months.push('')
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Activity Heatmap</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{totalActive} active days in the last {WEEKS} weeks</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <span>Less</span>
          {levelClass.map((cls, i) => <span key={i} className={`h-3 w-3 rounded-sm ${cls}`} />)}
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-1 pl-6 mb-0.5">
            {months.map((m, i) => <div key={i} className="w-[13px] text-[9px] text-slate-400 dark:text-slate-500 font-medium">{m}</div>)}
          </div>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-1">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="h-[13px] w-5 text-[9px] text-slate-400 dark:text-slate-500 flex items-center">{d}</div>
              ))}
            </div>
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {cells.slice(w * 7, w * 7 + 7).map((cell, d) => (
                  <div key={d} title={`${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}`}
                    className={`h-[13px] w-[13px] rounded-sm transition-opacity duration-150 hover:opacity-70 cursor-default ${levelClass[getLevel(cell.count)]}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function PortfolioAnalyticsCard({ user, projects }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const pub = myProjects.filter(p => p.visibility === 'public')
  const totalViews = LS.get('student_portfolio_views_' + user.email, pub.length * 12 + Math.floor(Math.random() * 40))
  const projectViews = pub.reduce((sum, p) => sum + (p.views || Math.floor(Math.random() * 30) + 5), 0)
  const favCount = LS.get('student_fav_portfolios_count_' + user.email, Math.floor(pub.length * 1.5))
  const weekDelta = pub.length > 0 ? Math.floor(Math.random() * 15) + 2 : 0
  const trending = weekDelta > 0

  const stats = [
    { label: 'Profile Views',   value: totalViews,   icon: IC.eye,      color: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/40',   delta: `+${weekDelta}` },
    { label: 'Project Views',   value: projectViews, icon: IC.barChart2, color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', delta: `+${Math.ceil(weekDelta * 0.6)}` },
    { label: 'Saved by Others', value: favCount,     icon: IC.heart,    color: 'text-rose-700 dark:text-rose-400',   bg: 'bg-rose-50 dark:bg-rose-950/40',   delta: favCount > 0 ? `+${Math.ceil(favCount * 0.2)}` : '0' },
  ]

  if (pub.length === 0) return (
    <Card>
      <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Portfolio Analytics</h3>
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          <Icon d={IC.barChart2} size={22} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Make a project public to see analytics</p>
      </div>
    </Card>
  )

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Portfolio Analytics</h3>
        {trending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Icon d={IC.trendUp} size={11} />Trending
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.bg} transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm`}>
            <div className="flex justify-center mb-1"><Icon d={s.icon} size={16} /></div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{s.delta} this week</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">{pub.length} public project{pub.length !== 1 ? 's' : ''}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{myProjects.length} total uploaded</span>
      </div>
    </Card>
  )
}

// ── Dashboard Search ──────────────────────────────────────────────────────────

function DashboardSearch({ user, projects, setTab }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const results = q.trim().length < 2 ? [] : (() => {
    const hits = []
    const lq = q.toLowerCase()

    // Projects
    projects.filter(p => p.title.toLowerCase().includes(lq) || (p.description||'').toLowerCase().includes(lq))
      .slice(0,3).forEach(p => hits.push({ type:'project', label:p.title, sub:p.course, tab:'projects', icon:IC.folder, color:'text-blue-600 dark:text-blue-400', bg:'bg-blue-50 dark:bg-blue-950/40' }))

    // Internships
    ;((() => {
      const all = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith('employer_internships_')) {
          LS.get(k,[]).forEach(x => all.push(x))
        }
      }
      return all
    })()).filter(i => i.title?.toLowerCase().includes(lq) || (i.companyName||'').toLowerCase().includes(lq))
      .slice(0,2).forEach(i => hits.push({ type:'internship', label:i.title, sub:i.companyName||'Company', tab:'internships', icon:IC.briefcase, color:'text-green-600 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40' }))

    // LH materials
    LH_COURSES.filter(c => c.name.toLowerCase().includes(lq) || c.code.toLowerCase().includes(lq))
      .slice(0,2).forEach(c => hits.push({ type:'course', label:c.code, sub:c.name, tab:'learning', icon:IC.bookOpen, color:'text-purple-600 dark:text-purple-400', bg:'bg-purple-50 dark:bg-purple-950/40' }))

    // Messages
    const threads = LS.get('student_messages_' + user.email, [])
    threads.filter(t => t.with.toLowerCase().includes(lq))
      .slice(0,2).forEach(t => hits.push({ type:'message', label:t.with, sub:'Open conversation', tab:'messages', icon:IC.message, color:'text-amber-600 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40', msgTarget:t.with }))

    return hits.slice(0,8)
  })()

  const go = hit => {
    if (hit.msgTarget) LS.set('student_pending_message_target', hit.msgTarget)
    setTab(hit.tab)
    setQ(''); setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={15}/></span>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          placeholder="Search projects, courses, internships, messages…"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-10 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"/>
        {q && <button onClick={() => { setQ(''); setOpen(false) }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          <Icon d={IC.x} size={14}/>
        </button>}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full z-30 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          {results.length === 0
            ? <p className="px-4 py-5 text-center text-sm text-slate-400 dark:text-slate-500">No results for "{q}"</p>
            : <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {results.map((r, i) => (
                <li key={i}>
                  <button onClick={() => go(r)} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${r.bg}`}>
                      <Icon d={r.icon} size={13}/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{r.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{r.sub}</p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${r.color} shrink-0`}>{r.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          }
        </div>
      )}
    </div>
  )
}

// ── Continue Learning Card ────────────────────────────────────────────────────

function ContinueLearningCard({ user, setTab }) {
  const recent = LS.get('lh_recent_' + user.email, [])
  const lastItem = recent[0] || null
  const course = lastItem ? LH_COURSES.find(c => c.id === lastItem.courseId) : null
  const fallbackCourse = LH_COURSES[0]
  const displayCourse = course || fallbackCourse
  const cm = LH_COLOR_MAP[displayCourse.color] || LH_COLOR_MAP.blue

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.bookOpen} size={16}/>
          <h3 className="font-semibold">Continue Learning</h3>
        </div>
        <button onClick={() => setTab('learning')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Open Hub</button>
      </div>

      <div className={`rounded-xl border ${cm.border} ${cm.bg} p-4`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cm.icon}`}>
            <Icon d={IC.bookOpen} size={18}/>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold ${cm.text}`}>{displayCourse.code}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight mt-0.5 truncate">{displayCourse.name}</p>
            {lastItem
              ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Last: {lastItem.title}</p>
              : <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Not started yet</p>
            }
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-xl font-bold ${cm.text}`}>{displayCourse.progress}%</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">done</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
          <div className={`h-1.5 rounded-full transition-all duration-700 ${cm.bar}`} style={{width:`${displayCourse.progress}%`}}/>
        </div>
      </div>

      <button onClick={() => setTab('learning')}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all">
        <Icon d={IC.bookOpen} size={14}/>Resume Learning
      </button>
    </Card>
  )
}

// ── Academic Progress Snapshot ────────────────────────────────────────────────

function AcademicProgressSnapshot({ user, setTab }) {
  const allData = {}
  LH_COURSES.forEach(c => { allData[c.id] = buildCourseData(c.id) })
  const submissions = LS.get('lh_submissions_' + user.email, {})

  let totalSubmitted = 0, totalPending = 0
  LH_COURSES.forEach(c => {
    const d = allData[c.id]
    d.assignments.forEach(a => {
      const eff = submissions[a.id] === 'submitted' ? 'submitted' : a.status
      if (eff === 'submitted') totalSubmitted++
      else totalPending++
    })
  })

  const activeCourses = LH_COURSES.filter(c => c.progress > 0 && c.progress < 100).length
  const completedCourses = LH_COURSES.filter(c => c.progress === 100).length
  const overallProgress = Math.round(LH_COURSES.reduce((s, c) => s + c.progress, 0) / LH_COURSES.length)

  const stats = [
    { label:'Active Courses',   value:activeCourses,    color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40' },
    { label:'Completed',        value:completedCourses, color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40' },
    { label:'Submitted',        value:totalSubmitted,   color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40' },
    { label:'Pending',          value:totalPending,     color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40' },
  ]

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.target} size={16}/>
          <h3 className="font-semibold">Academic Progress</h3>
        </div>
        <button onClick={() => setTab('learning')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View Hub</button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Overall Progress</span>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{overallProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div className="h-2 rounded-full bg-blue-600 transition-all duration-700" style={{width:`${overallProgress}%`}}/>
        </div>
        <div className="mt-3 space-y-2">
          {LH_COURSES.map(c => {
            const cm = LH_COLOR_MAP[c.color] || LH_COLOR_MAP.blue
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cm.dot}`}/>
                <span className="text-xs text-slate-600 dark:text-slate-400 w-20 shrink-0 truncate">{c.code}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${cm.bar}`} style={{width:`${c.progress}%`}}/>
                </div>
                <span className={`text-xs font-semibold ${cm.text} w-8 text-right shrink-0`}>{c.progress}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ── Today's Agenda Card ───────────────────────────────────────────────────────

function TodaysAgendaCard({ user, setTab }) {
  const scheduleKey = 'student_schedule_' + user.email
  const allEvents = LS.get(scheduleKey, [])
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = DAYS[new Date().getDay()]
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  const todayEvents = allEvents
    .filter(e => e.day === todayName)
    .map(e => {
      const [h, m] = (e.time || '8:00').split(':').map(Number)
      const mins = h * 60 + (m || 0)
      const isPast = mins + (e.duration || 1) * 60 < nowMins
      const isCurrent = mins <= nowMins && nowMins < mins + (e.duration || 1) * 60
      return { ...e, mins, isPast, isCurrent }
    })
    .sort((a, b) => a.mins - b.mins)

  const priorityDot = { class:'bg-blue-500', deadline:'bg-red-500', interview:'bg-purple-500', meeting:'bg-green-500', reminder:'bg-amber-500' }
  const priorityBg  = {
    class:    'border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30',
    deadline: 'border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30',
    interview:'border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30',
    meeting:  'border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/30',
    reminder: 'border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30',
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.calendar} size={16}/>
          <h3 className="font-semibold">Today's Agenda</h3>
          <Badge color="blue">{todayName}</Badge>
        </div>
        <button onClick={() => setTab('schedule')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Full schedule</button>
      </div>

      {todayEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <Icon d={IC.calendar} size={22}/>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nothing scheduled today</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add events in your schedule</p>
          </div>
          <button onClick={() => setTab('schedule')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors">
            <Icon d={IC.plus} size={12}/>Add Event
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {todayEvents.slice(0, 5).map(e => (
            <div key={e.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${e.isCurrent ? priorityBg[e.type] || priorityBg.reminder : e.isPast ? 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/20 opacity-60' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
              <div className="flex flex-col items-center shrink-0 w-10">
                <span className={`text-xs font-mono font-semibold ${e.isCurrent ? 'text-blue-600 dark:text-blue-400' : e.isPast ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>{e.time}</span>
                {e.isCurrent && <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">NOW</span>}
              </div>
              <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot[e.type] || 'bg-slate-400'}`}/>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${e.isPast ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{e.title}</p>
                {e.location && <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{e.location}</p>}
              </div>
              <Badge color={e.type==='class'?'blue':e.type==='deadline'?'red':e.type==='interview'?'purple':e.type==='meeting'?'green':'yellow'}>{e.type}</Badge>
            </div>
          ))}
          {todayEvents.length > 5 && <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1">+{todayEvents.length - 5} more events</p>}
        </div>
      )}
    </Card>
  )
}

// ── Announcements Widget ──────────────────────────────────────────────────────

function AnnouncementsWidget({ setTab }) {
  const allAnnouncements = []
  LH_COURSES.forEach(c => {
    const d = buildCourseData(c.id)
    d.announcements.forEach(a => {
      allAnnouncements.push({ ...a, courseCode:c.code, courseColor:c.color })
    })
  })
  // Merge real instructor announcements from bridge key
  const instructorAnnouncements = LS.get('guc_instructor_announcements', [])
  instructorAnnouncements.forEach(a => {
    const matchedCourse = LH_COURSES.find(c => c.code === a.courseCode)
    allAnnouncements.push({
      ...a,
      courseCode: a.courseCode || 'General',
      courseColor: matchedCourse ? matchedCourse.color : 'blue',
    })
  })
  allAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date))
  const shown = allAnnouncements.slice(0, 4)

  const typeStyle = {
    info:    { bg:'bg-blue-50 dark:bg-blue-950/40',   border:'border-blue-200 dark:border-blue-800',   text:'text-blue-700 dark:text-blue-300',   icon:IC.info },
    warning: { bg:'bg-amber-50 dark:bg-amber-950/40', border:'border-amber-200 dark:border-amber-800', text:'text-amber-700 dark:text-amber-300', icon:IC.alertCircle },
    success: { bg:'bg-green-50 dark:bg-green-950/40', border:'border-green-200 dark:border-green-800', text:'text-green-700 dark:text-green-300', icon:IC.check },
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Icon d={IC.megaphone} size={16}/>
          <h3 className="font-semibold">Announcements</h3>
        </div>
        <button onClick={() => setTab('learning')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
      </div>
      <div className="space-y-2">
        {shown.map(a => {
          const s = typeStyle[a.type] || typeStyle.info
          const cm = LH_COLOR_MAP[a.courseColor || 'blue']
          return (
            <div key={a.id} className={`rounded-lg border px-3 py-2.5 ${s.bg} ${s.border}`}>
              <div className="flex items-start gap-2">
                <Icon d={s.icon} size={13}/>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-xs font-semibold ${s.text}`}>{a.title}</p>
                    <span className={`text-[10px] font-semibold ${cm.text}`}>{a.courseCode}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">{a.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{a.date}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Personal Insights ─────────────────────────────────────────────────────────

function PersonalInsightsCard({ user, projects }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const submissions = LS.get('lh_submissions_' + user.email, {})
  const recent = LS.get('lh_recent_' + user.email, [])
  const bookmarks = LS.get('lh_bookmarks_' + user.email, {})

  // Busiest course by views
  const courseCounts = {}
  recent.forEach(r => { if (r.courseId) courseCounts[r.courseId] = (courseCounts[r.courseId] || 0) + 1 })
  const busiestId = Object.entries(courseCounts).sort((a,b) => b[1]-a[1])[0]?.[0]
  const busiestCourse = busiestId ? LH_COURSES.find(c => c.id === busiestId) : null

  // Assignments submitted this week
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const submittedThisWeek = Object.keys(submissions).filter(k => submissions[k] === 'submitted').length

  // Overall completion rate
  let totalAssignments = 0, submittedTotal = 0
  LH_COURSES.forEach(c => {
    const d = buildCourseData(c.id)
    totalAssignments += d.assignments.length
    d.assignments.forEach(a => { if (submissions[a.id] === 'submitted' || a.status === 'submitted') submittedTotal++ })
  })
  const completionRate = totalAssignments > 0 ? Math.round((submittedTotal / totalAssignments) * 100) : 0

  // Learning streak (days with recent views)
  const viewDays = new Set(recent.map(r => r.viewedAt?.split(' ')[0]).filter(Boolean))
  const streak = viewDays.size

  const bmCount = Object.values(bookmarks).filter(Boolean).length

  const insights = [
    { label:'Completion Rate', value:`${completionRate}%`, icon:IC.target,   color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40' },
    { label:'Submitted',       value:submittedTotal,       icon:IC.check,    color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40' },
    { label:'Materials Saved', value:bmCount,              icon:IC.bookmark, color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40' },
    { label:'Active Days',     value:streak,               icon:IC.activity, color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40' },
  ]

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <Icon d={IC.sparkle} size={16}/>
        <h3 className="font-semibold">Personal Insights</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {insights.map(s => (
          <div key={s.label} className={`rounded-xl p-3 ${s.bg} transition-all hover:-translate-y-0.5 hover:shadow-sm`}>
            <div className="flex items-center gap-1.5 mb-1"><Icon d={s.icon} size={12}/></div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>
      {busiestCourse && (
        <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Most active course</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full shrink-0 ${(LH_COLOR_MAP[busiestCourse.color]||LH_COLOR_MAP.blue).dot}`}/>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{busiestCourse.code}</p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{busiestCourse.name}</span>
          </div>
        </div>
      )}
      {myProjects.length > 0 && (
        <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Projects uploaded</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''} · {myProjects.filter(p=>p.visibility==='public').length} public</p>
        </div>
      )}
    </Card>
  )
}

// ── Enhanced Quick Actions (LH-aware) ────────────────────────────────────────

function LHQuickActionsPanel({ user, setTab }) {
  const recent = LS.get('lh_recent_' + user.email, [])
  const lastCourse = recent[0] ? LH_COURSES.find(c => c.id === recent[0].courseId) : LH_COURSES[0]

  const actions = [
    { label:'Learning Hub',      icon:IC.bookOpen,  tab:'learning',    color:'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
    { label:'Assignments',       icon:IC.task,      tab:'learning',    color:'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
    { label:lastCourse ? `Resume ${lastCourse.code}` : 'Start Course', icon:IC.playCircle, tab:'learning', color:'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
    { label:'Internships',       icon:IC.briefcase, tab:'internships', color:'bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900' },
    { label:'Messages',          icon:IC.message,   tab:'messages',    color:'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900' },
    { label:'Upload Project',    icon:IC.upload,    tab:'create-project', color:'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
  ]
  return (
    <Card>
      <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(a => (
          <button key={a.label} onClick={() => setTab(a.tab)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.color}`}>
            <Icon d={a.icon} size={18}/>
            <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}


// ── Main Overview ────────────────────────────────────────────────────────────

function Overview({ user, projects, notifications, setTab }) {
  const myProjects = projects.filter(p => p.owner === user.email)
  const unread = notifications.filter(n => !n.read).length
  const apps = LS.get('student_applications_' + user.email, [])
  const langs = {}
  myProjects.forEach(p => (p.languages || []).forEach(l => { langs[l] = (langs[l] || 0) + 1 }))
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1
  const colMap = {}
  myProjects.forEach(p => (p.collaborators || []).filter(c => c.status === 'accepted').forEach(c => { colMap[c.email] = (colMap[c.email] || 0) + 1 }))
  const topCollabs = Object.entries(colMap).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const statCards = [
    {
      label: 'My Projects', value: myProjects.length,
      color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40',
      tab: 'projects', icon: IC.folder,
      trend: myProjects.length > 0 ? `+${Math.min(myProjects.length, 2)} this month` : 'Start uploading',
      trendUp: myProjects.length > 0,
    },
    {
      label: 'Unread Alerts', value: unread,
      color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40',
      tab: 'notifications', icon: IC.bell,
      trend: unread > 0 ? `${unread} need attention` : 'All caught up',
      trendUp: false,
    },
    {
      label: 'Applied Jobs', value: apps.length,
      color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40',
      tab: 'internships', icon: IC.briefcase,
      trend: apps.length > 0 ? 'Applications active' : 'Browse openings',
      trendUp: apps.length > 0,
    },
    {
      label: 'Public Projects', value: myProjects.filter(p => p.visibility === 'public').length,
      color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40',
      tab: 'projects', icon: IC.eye,
      trend: 'Visible to employers',
      trendUp: myProjects.filter(p => p.visibility === 'public').length > 0,
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Dashboard Search ── */}
      <DashboardSearch user={user} projects={projects} setTab={setTab} />

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 sm:px-12 sm:py-14 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"/>
        <div className="pointer-events-none absolute right-32 top-6 h-20 w-20 rounded-full bg-blue-400/20 blur-2xl"/>
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
              Welcome back,<br className="hidden sm:block"/> {user.firstName || 'Student'} 👋
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Track your projects, collaborate with peers, and discover internship opportunities — all in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button onClick={() => setTab('create-project')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50 hover:shadow-lg active:scale-95 transition-all duration-150 w-full sm:w-auto justify-center">
              <Icon d={IC.plus} size={15}/>New Project
            </button>
            <button onClick={() => setTab('explore')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/50 active:scale-95 transition-all duration-150 w-full sm:w-auto justify-center">
              <Icon d={IC.eye} size={15}/>Explore Projects
            </button>
          </div>
        </div>
      </div>

      {/* ── Enhanced Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(s => (
          <button key={s.label} onClick={() => setTab(s.tab)}
            className={`group rounded-xl border-0 p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 ${s.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <Icon d={s.icon} size={14} />
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${s.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {s.trendUp && <Icon d={IC.trendUp} size={10} />}
              {s.trend}
            </p>
          </button>
        ))}
      </div>

      {/* ── Profile Completion + Quick Actions ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCompletionCard user={user} projects={projects} setTab={setTab} />
        <LHQuickActionsPanel user={user} setTab={setTab} />
      </div>

      {/* ── Continue Learning + Today's Agenda ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ContinueLearningCard user={user} setTab={setTab} />
        <TodaysAgendaCard user={user} setTab={setTab} />
      </div>

      {/* ── Deadlines + Activity ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingDeadlinesWidget user={user} projects={projects} setTab={setTab} />
        <RecentActivityTimeline user={user} projects={projects} notifications={notifications} setTab={setTab} />
      </div>

      {/* ── Portfolio Analytics + Heatmap ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PortfolioAnalyticsCard user={user} projects={projects} />
        <ActivityHeatmap user={user} projects={projects} />
      </div>

      {/* ── Achievements ── */}
      <AchievementsSection user={user} projects={projects} notifications={notifications} />

      {/* ── Academic Progress + Personal Insights ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AcademicProgressSnapshot user={user} setTab={setTab} />
        <PersonalInsightsCard user={user} projects={projects} />
      </div>

      {/* ── Announcements ── */}
      <AnnouncementsWidget setTab={setTab} />

      {/* ── Languages Used ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Languages Used</h3>
          {Object.keys(langs).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Icon d={IC.layers} size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No languages tracked yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add languages when creating projects</p>
              </div>
              <button onClick={() => setTab('create-project')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors">
                <Icon d={IC.plus} size={12} />Upload Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(langs).sort((a, b) => b[1] - a[1]).map(([lang, count]) => (
                <div key={lang} className="group">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lang}</span>
                    <span className="text-slate-400 dark:text-slate-500">{Math.round(count / total * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-2 rounded-full bg-blue-600 transition-all duration-700 hover:bg-blue-500" style={{ width: `${Math.round(count / total * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Notifications</h3>
            <button onClick={() => setTab('notifications')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Icon d={IC.bell} size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Activity will appear here</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.slice().reverse().slice(0, 5).map(n => (
                <li key={n.id} className="flex items-start gap-2.5 text-sm group cursor-pointer" onClick={() => setTab('notifications')}>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'}`} />
                  <div className="min-w-0">
                    <p className={`leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${n.read ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ── Top Collaborators ── */}
      {topCollabs.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Top Collaborators</h3>
          <div className="flex flex-wrap gap-3">
            {topCollabs.map(([email, count]) => (
              <div key={email} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:border-blue-200 dark:hover:border-blue-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-bold text-blue-700 dark:text-blue-300">{email[0].toUpperCase()}</div>
                <div><p className="text-xs font-medium text-slate-700 dark:text-slate-300">{email}</p><p className="text-xs text-slate-400 dark:text-slate-500">{count} project{count > 1 ? 's' : ''}</p></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Upcoming Today Widget ── */}
      {(() => {
        const scheduleKey = 'student_schedule_' + user.email
        const allEvents = LS.get(scheduleKey, [])
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const todayName = DAYS[new Date().getDay()]
        const todayEvents = allEvents.filter(e => e.day === todayName).sort((a, b) => a.time.localeCompare(b.time))
        const typeColor = { class: 'blue', deadline: 'red', interview: 'purple', meeting: 'green', reminder: 'yellow' }
        const typeDot = { class: 'bg-blue-500', deadline: 'bg-red-500', interview: 'bg-purple-500', meeting: 'bg-green-500', reminder: 'bg-amber-500' }
        if (allEvents.length === 0) return null
        return (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">📅 Upcoming Today</h3>
              <button onClick={() => setTab('schedule')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View schedule</button>
            </div>
            {todayEvents.length === 0
              ? <p className="text-sm text-slate-400 dark:text-slate-500">Nothing scheduled for today.</p>
              : <div className="space-y-2">
                {todayEvents.slice(0, 4).map(e => (
                  <div key={e.id} className="flex items-center gap-3 group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1 transition-colors">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${typeDot[e.type]}`} />
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-10 shrink-0">{e.time}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{e.title}</span>
                    <Badge color={typeColor[e.type]}>{e.type}</Badge>
                  </div>
                ))}
                {todayEvents.length > 4 && <p className="text-xs text-slate-400 pl-5">+{todayEvents.length - 4} more events today</p>}
              </div>
            }
          </Card>
        )
      })()}

    </div>
  )
}

function ProfileSection({ profile, setProfile }) {
  const [editing, setEditing]=useState(false)


  const [form, setForm]=useState(profile)
  const [photoKey, setPhotoKey]=useState(0)
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}))
  const save=()=>{setProfile(form);setEditing(false)}
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        {!editing&&<Btn onClick={()=>{setForm(profile);setEditing(true)}}><Icon d={IC.edit}/>Edit Profile</Btn>}
      </div>
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 shrink-0">
            {profile.photo
  ? <img src={profile.photo} alt="avatar" className="h-24 w-24 rounded-full object-cover border-2 border-blue-200"/>
  : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">{(profile.firstName?.[0]||'S').toUpperCase()}</div>
}
<label className="cursor-pointer rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
              <Icon d={IC.upload} size={12}/> {profile.photo ? 'Change Photo' : 'Upload Photo'}
              <input type="file" className="hidden" accept="image/*" key={photoKey} onChange={e=>{
                const file=e.target.files?.[0]
                if(!file)return
                const reader=new FileReader()
                reader.onload=ev=>{
                  setProfile(prev=>({...prev,photo:ev.target.result}))
                  setForm(prev=>({...prev,photo:ev.target.result}))
                  setPhotoKey(k=>k+1)
                }
                reader.readAsDataURL(file)
              }}/>
            </label>
          </div>
          <div className="flex-1 space-y-4">
            {editing?(
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="First Name" value={form.firstName||''} onChange={f('firstName')}/>
                  <Input label="Last Name" value={form.lastName||''} onChange={f('lastName')}/>
                </div>
                <Input label="GUC Email (read-only)" value={form.email||''} disabled/>
                <Input label="Major" value={form.major||''} onChange={f('major')} placeholder="e.g. Computer Science"/>
                <Input label="LinkedIn / CV Link" value={form.linkedin||''} onChange={f('linkedin')} placeholder="https://linkedin.com/in/yourname"/>
                <TagPicker label="Skills" options={SKILLS_ALL} selected={form.skills||[]}
                  onToggle={s=>setForm(p=>({...p,skills:(p.skills||[]).includes(s)?(p.skills||[]).filter(x=>x!==s):[...(p.skills||[]),s]}))}/>
                <div className="flex gap-2 pt-1"><Btn onClick={save}><Icon d={IC.check}/>Save</Btn><Btn variant="secondary" onClick={()=>setEditing(false)}>Cancel</Btn></div>
              </>
            ):(
              <div className="space-y-2.5">
                <p className="text-xl font-semibold text-slate-900 dark:text-white">{profile.firstName} {profile.lastName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
                {profile.major&&<p className="text-sm dark:text-slate-300"><span className="font-medium text-slate-700 dark:text-slate-300">Major:</span> {profile.major}</p>}
                {profile.linkedin&&<a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={13}/>{profile.linkedin}</a>}
                {(profile.skills||[]).length>0&&<div className="flex flex-wrap gap-1.5 pt-1">{profile.skills.map(s=><Badge key={s}>{s}</Badge>)}</div>}
                {!profile.major&&!profile.linkedin&&!(profile.skills||[]).length&&<p className="text-sm text-slate-400 dark:text-slate-500">No profile info yet. Click Edit Profile to add details.</p>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function InstructorsSection() {
  const [search, setSearch]=useState('')
  const [selected, setSelected]=useState(null)
  const instructors=getSeedInstructors()
  const displayed=instructors.filter(i=>{
    const name=`${i.firstName||''} ${i.lastName||''}`.toLowerCase()
    const q=search.toLowerCase()
    return name.includes(q)||i.email.toLowerCase().includes(q)||(i.linkedCourses||[]).join(' ').toLowerCase().includes(q)
  })
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Find Instructors</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search by name or course.</p></div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or course…"/>
      {displayed.length===0?<Card><EmptyState message="No instructors found."/></Card>:
        <div className="space-y-3">
          {displayed.map(i=>(
            <Card key={i.email}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-base font-bold text-blue-700 dark:text-blue-300">{(i.firstName?.[0]||'I').toUpperCase()}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{i.firstName} {i.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{i.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">{(i.linkedCourses||[]).map(c=><Badge key={c} color="blue">{c}</Badge>)}</div>
                  </div>
                </div>
                <Btn size="sm" onClick={()=>setSelected(i)}><Icon d={IC.eye} size={13}/>View Profile</Btn>
              </div>
            </Card>
          ))}
        </div>
      }
      {selected&&(
        <Modal title="Instructor Profile" onClose={()=>setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-2xl font-bold text-blue-700 dark:text-blue-300">{(selected.firstName?.[0]||'I').toUpperCase()}</div>
              <div><p className="text-lg font-semibold text-slate-900 dark:text-white">{selected.firstName} {selected.lastName}</p><p className="text-sm text-slate-500 dark:text-slate-400">{selected.email}</p><Badge color="blue">Course Instructor</Badge></div>
            </div>
            {selected.bio&&<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Biography</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.bio}</p></div>}
            {selected.research&&<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Research Interests</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.research}</p></div>}
            {selected.education&&<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Education</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selected.education}</p></div>}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Linked Courses</p>
              <div className="flex flex-wrap gap-2">{(selected.linkedCourses||[]).map(c=><Badge key={c} color="blue">{c}</Badge>)}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AppealSection({ project, setProjects, pushNotif, studentProfile }) {
  const [msg, setMsg]=useState(project.appealMessage||'')
  const [sent, setSent]=useState(!!project.appealSent)
  const send=()=>{
    if (!msg.trim()) return alert('Please write your explanation.')
    // persist to project
    setProjects(p=>p.map(x=>x.id===project.id?{...x,appealMessage:msg,appealSent:true}:x))
    pushNotif(`Your appeal for "${project.title}" was submitted.`)
    // bridge → admin state so Appeals tab shows it
    try {
      const ADMIN_KEY='guc_projecthub_admin_state'
      const raw=localStorage.getItem(ADMIN_KEY)
      const adminState=raw?JSON.parse(raw):{}
      const existing=adminState.appeals||[]
      if(!existing.some(a=>a.projectId===project.id&&a.studentEmail===(studentProfile?.email||''))) {
        adminState.appeals=[...existing,{
          id:'a_'+Date.now(),
          studentName:`${studentProfile?.firstName||''} ${studentProfile?.lastName||''}`.trim()||studentProfile?.email||'Student',
          studentEmail:studentProfile?.email||'',
          projectId:project.id,
          projectTitle:project.title,
          reason:msg.trim(),
          status:'pending',
          createdAt:new Date().toISOString().slice(0,10),
        }]
        localStorage.setItem(ADMIN_KEY,JSON.stringify(adminState))
      }
    } catch(e){ console.warn('Appeal bridge failed',e) }
    setSent(true)
  }
  return (
    <div className="mt-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3">
      <p className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">⚑ Flagged{project.flagReason?`: ${project.flagReason}`:''}</p>
      {sent?<p className="text-xs text-green-700 dark:text-green-400">✓ Appeal submitted.</p>:
        <><Textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Explain your point of view…"/>
        <div className="mt-2"><Btn size="sm" variant="danger" onClick={send}><Icon d={IC.send} size={13}/>Send Appeal</Btn></div></>
      }
    </div>
  )
}

function TasksModal({ project, setProjects, profile, onClose }) {
  const isOwner=project.owner===profile.email
  const [tasks, setTasks]=useState(project.tasks||[])
  const [form, setForm]=useState({title:'',description:'',assignee:'',deadline:'',status:'pending'})
  const [dragIdx, setDragIdx]=useState(null)
  const sync=t=>{setTasks(t);setProjects(p=>p.map(x=>x.id===project.id?{...x,tasks:t}:x))}
  const add=()=>{if(!form.title.trim())return alert('Task title required.');sync([...tasks,{...form,id:Date.now().toString(),createdBy:profile.email}]);setForm({title:'',description:'',assignee:'',deadline:'',status:'pending'})}
  const del=id=>sync(tasks.filter(t=>t.id!==id))
  const update=(id,k,v)=>sync(tasks.map(t=>t.id===id?{...t,[k]:v}:t))
  const onDrop=i=>{if(dragIdx===null||dragIdx===i)return;const t=[...tasks];const[item]=t.splice(dragIdx,1);t.splice(i,0,item);sync(t);setDragIdx(null)}
  const stColor={pending:'yellow',postponed:'slate',completed:'green'}
  return (
    <Modal title={`Tasks — ${project.title}`} onClose={onClose} wide>
      <div className="space-y-4">
        {isOwner&&(
          <div className="space-y-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Add New Task</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Task title *" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
              <Input placeholder="Assignee email" value={form.assignee} onChange={e=>setForm(p=>({...p,assignee:e.target.value}))}/>
            </div>
            <Input placeholder="Short description (1 line)" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" label="Deadline" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))}/>
              <Sel label="Status" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{TASK_STATUSES.map(s=><option key={s}>{s}</option>)}</Sel>
            </div>
            <Btn size="sm" onClick={add}><Icon d={IC.plus} size={13}/>Add Task</Btn>
          </div>
        )}
        {tasks.length===0?<EmptyState message="No tasks yet."/>:
          <div className="space-y-2">
            {isOwner&&<p className="text-xs text-slate-400 dark:text-slate-500">Drag to reorder by importance.</p>}
            {tasks.map((t,i)=>(
              <div key={t.id} draggable={isOwner} onDragStart={()=>setDragIdx(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(i)}
               className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 ${isOwner?'cursor-grab active:cursor-grabbing':''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{t.title}</p>
                    {t.description&&<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>}
                    {t.assignee&&<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">👤 {t.assignee}</p>}
                    {t.deadline&&<p className="text-xs text-slate-400 dark:text-slate-500">📅 Due {t.deadline}</p>}
                    {t.instructorComment&&<div className="mt-1 rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-1 text-xs text-blue-800 dark:text-blue-300">💬 <strong>Instructor:</strong> {t.instructorComment}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={stColor[t.status]}>{t.status}</Badge>
                    <select value={t.status} onChange={e=>update(t.id,'status',e.target.value)} className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {TASK_STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                    {isOwner&&<button onClick={()=>del(t.id)} className="text-slate-300 hover:text-red-500"><Icon d={IC.trash} size={13}/></button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </Modal>
  )
}

function CollabsModal({ project, setProjects, profile, pushNotif, onClose }) {
  const [search, setSearch]=useState('')
  const collabs=project.collaborators||[]
  const allUsers=LS.get('guc_projecthub_users',[])
  const instructors=getSeedInstructors()
  const allPeople=[...allUsers.filter(u=>u.role==='student'&&u.email!==profile.email),...instructors]
  const searchResults=search.length>1?allPeople.filter(u=>{
    const name=`${u.firstName||''} ${u.lastName||''}`.toLowerCase()
    return name.includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase())
  }).slice(0,6):[]
  const invite=email=>{
    const trimmed=email.trim().toLowerCase()
    if (!trimmed) return
    if (collabs.some(c=>c.email===trimmed)) return alert('Already invited.')
    const updated=[...collabs,{email:trimmed,status:'pending',invitedAt:new Date().toISOString()}]
    setProjects(p=>p.map(x=>x.id===project.id?{...x,collaborators:updated}:x))
    pushNotif(`Invitation sent to ${trimmed} for "${project.title}".`)
    const key='student_notifs_'+trimmed
    const existing=LS.get(key,[])
    LS.set(key,[...existing,{id:Date.now().toString(),read:false,message:`You were invited to join "${project.title}" by ${profile.email}.`,createdAt:new Date().toISOString()}])
    setSearch('')
  }
  const remove=email=>setProjects(p=>p.map(x=>x.id===project.id?{...x,collaborators:(x.collaborators||[]).filter(c=>c.email!==email)}:x))
  const stColor={pending:'yellow',accepted:'green',rejected:'red'}
  return (
    <Modal title={`Collaborators — ${project.title}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Search & Invite</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"/>
          </div>
          {searchResults.length>0&&(
<div className="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              {searchResults.map(u=>(
                <div key={u.email} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <div><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</p><p className="text-xs text-slate-400 dark:text-slate-500">{u.email} · {u.role}</p></div>
                  <Btn size="sm" onClick={()=>invite(u.email)}><Icon d={IC.plus} size={12}/>Invite</Btn>
                </div>
              ))}
            </div>
          )}
          {search.includes('@')&&(
            <div className="mt-2"><Btn size="sm" variant="secondary" onClick={()=>invite(search)}><Icon d={IC.send} size={12}/>Invite {search}</Btn></div>
          )}
        </div>
<div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Collaborators List({collabs.length})</p>
          {collabs.length===0?<EmptyState message="No collaborators yet."/>:
            <ul className="space-y-2">
              {collabs.map(c=>(
<li key={c.email} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5">
                  <div><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.email}</p><p className="text-xs text-slate-400 dark:text-slate-500">Invited {new Date(c.invitedAt).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-2">
                    <Badge color={stColor[c.status]||'slate'}>{c.status}</Badge>
                    {c.status==='pending'&&<button onClick={()=>remove(c.email)} className="text-xs text-red-500 dark:text-red-400 hover:underline">Cancel</button>}
                    {c.status==='accepted'&&<button onClick={()=>remove(c.email)} className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400">Remove</button>}
                  </div>
                </li>
              ))}
            </ul>
          }
        </div>
      </div>
    </Modal>
  )
}

function ThesisModal({ project, setProjects, onClose }) {
  const drafts=project.thesisDrafts||[]
const [draftName, setDraftName]=useState('')
  const [draftFile, setDraftFile]=useState(null)
  const [draftFileKey, setDraftFileKey]=useState(0)
  const addDraft=()=>{
    if(!draftName.trim())return alert('Please enter a draft name.')
    if(!draftFile)return alert('Please select a file to upload.')
    const reader=new FileReader()
    reader.onload=ev=>{
      const updated=[...drafts,{id:Date.now().toString(),name:draftName.trim(),isFinal:false,uploadedAt:new Date().toISOString(),fileData:ev.target.result,fileName:draftFile.name}]
      setProjects(p=>p.map(x=>x.id===project.id?{...x,thesisDrafts:updated}:x))
      setDraftName('')
      setDraftFile(null)
      setDraftFileKey(k=>k+1)
    }
    reader.readAsDataURL(draftFile)
  }
  const setFinal=id=>{const updated=drafts.map(d=>({...d,isFinal:d.id===id}));setProjects(p=>p.map(x=>x.id===project.id?{...x,thesisDrafts:updated}:x))}
  const del=id=>setProjects(p=>p.map(x=>x.id===project.id?{...x,thesisDrafts:(x.thesisDrafts||[]).filter(d=>d.id!==id)}:x))
  const hasFinal=drafts.some(d=>d.isFinal)
  return (
    <Modal title={`Thesis Drafts — ${project.title}`} onClose={onClose}>
      <div className="space-y-3">
       <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Add New Draft</p>
       <Input placeholder="Draft name (e.g. Draft v1) *" value={draftName} onChange={e=>setDraftName(e.target.value)}/>
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
            <Icon d={IC.upload} size={12}/>
            {draftFile?draftFile.name:'Choose file (PDF, DOCX, etc.)'}
            <input type="file" className="hidden" key={draftFileKey} accept=".pdf,.doc,.docx,.txt" onChange={e=>setDraftFile(e.target.files?.[0]||null)}/>
          </label>
          <Btn size="sm" onClick={addDraft} disabled={!draftName.trim()||!draftFile}><Icon d={IC.upload} size={13}/>Upload Draft</Btn>
        </div>
        {drafts.length===0?<EmptyState message="No thesis drafts uploaded yet."/>:
          <ul className="space-y-2">
            {drafts.map(d=>(
              <li key={d.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${d.isFinal?'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30':'border-slate-200 dark:border-slate-700'}`}>
                <div>
                  <div className="flex items-center gap-2"><Icon d={IC.fileText} size={14}/><span className="text-sm font-medium text-slate-800 dark:text-slate-200">{d.name}</span>{d.isFinal&&<Badge color="blue">Final Draft</Badge>}{hasFinal&&!d.isFinal&&<Badge color="slate">Private</Badge>}</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(d.uploadedAt).toLocaleDateString()}</p>
                </div>
<div className="flex items-center gap-2">
                  {d.fileData&&(
                    <a href={d.fileData} download={d.fileName||d.name}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                      <Icon d={IC.download} size={12}/>Download
                    </a>
                  )}
                  {!d.isFinal&&<Btn size="sm" variant="secondary" onClick={()=>setFinal(d.id)}>Set as Final</Btn>}
                  {!d.isFinal&&<button onClick={()=>del(d.id)} className="text-slate-300 hover:text-red-500"><Icon d={IC.trash} size={13}/></button>}
                </div>
              </li>
            ))}
          </ul>
        }
        {hasFinal&&<p className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">ℹ️ All non-final drafts are automatically private and invisible to everyone including instructors.</p>}
      </div>
    </Modal>
  )
}

function ProjectsSection({ projects, setProjects, profile, pushNotif, openCreateOnMount, setTab }) {
  const blank=()=>({id:Date.now().toString(),title:'',course:COURSES[0],github:'',demoVideo:'',description:'',languages:[],visibility:'public',owner:profile.email,collaborators:[],tasks:[],thesisDrafts:[],createdAt:new Date().toISOString(),rating:0})
  const [modal, setModal]=useState(openCreateOnMount?'create':null)
  const [form, setForm]=useState(blank)
  const [selected, setSelected]=useState(null)
  const [search, setSearch]=useState('')
  const [filterCourse, setFilterCourse]=useState('')
const [sortDate, setSortDate]=useState('newest')
  const [sortRating, setSortRating]=useState('none')
  const myProjects=projects.filter(p=>p.owner===profile.email||(p.collaborators||[]).some(c=>c.email===profile.email&&c.status==='accepted'))
  const hasRatings=myProjects.some(p=>(p.rating||0)>0)
  const displayed=myProjects
    .filter(p=>p.title.toLowerCase().includes(search.toLowerCase()))
    .filter(p=>!filterCourse||p.course===filterCourse)
    .sort((a,b)=>{
      // rating sort takes priority if selected
      if(sortRating==='highest')return (b.rating||0)-(a.rating||0)
      if(sortRating==='lowest')return (a.rating||0)-(b.rating||0)
      // fallback to date sort
      if(sortDate==='newest')return new Date(b.createdAt)-new Date(a.createdAt)
      if(sortDate==='oldest')return new Date(a.createdAt)-new Date(b.createdAt)
      return new Date(b.createdAt)-new Date(a.createdAt)
    })

  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}))
  const openCreate=()=>{setForm(blank());setModal('create')}
  const openEdit=p=>{setSelected(p);setForm({...p});setModal('edit')}
  const saveProject=()=>{if(!form.title.trim())return alert('Project title is required.');if(modal==='create')setProjects(p=>[...p,form]);else setProjects(p=>p.map(x=>x.id===form.id?form:x));setModal(null)}
  const delProject=id=>{if(!confirm('Delete this project?'))return;setProjects(p=>p.filter(x=>x.id!==id))}
  const toggleVisibility=id=>setProjects(p=>p.map(x=>x.id===id?{...x,visibility:x.visibility==='public'?'private':'public'}:x))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Projects</h2><Btn onClick={openCreate}><Icon d={IC.plus}/>New Project</Btn></div>
<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by title…"/>
        </div>

        {/* Course filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Course</label>
          <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Courses</option>
            {COURSES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Sort by Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Sort by Date</label>
          <select value={sortDate} onChange={e=>{setSortDate(e.target.value);setSortRating('none')}}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Sort by Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Sort by Rating</label>
          <select
            value={sortRating}
            disabled={!hasRatings}
            onChange={e=>setSortRating(e.target.value)}
            title={!hasRatings?'No ratings yet — rate a project to enable this filter':''}
            className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors
              ${hasRatings
                ?'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 cursor-pointer'
                :'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}>
            <option value="none">{hasRatings?'No Rating Sort':'No ratings yet'}</option>
            {hasRatings&&<>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </>}
          </select>
        </div>
      </div>
      {displayed.length===0?<Card><EmptyState message="No projects found. Create your first project!"/></Card>:
        <div className="space-y-3">
          {displayed.map(p=>{
            const isOwner=p.owner===profile.email
            return (
              <Card key={p.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                      <Badge color={p.visibility==='public'?'green':'slate'}>{p.visibility}</Badge>
                      <Badge color="blue">{p.course}</Badge>
                      {p.rating>0&&<Badge color="yellow">★ {p.rating}/5</Badge>}
                      {p.flagged&&<Badge color="red">⚑ Flagged</Badge>}
                    </div>
                    {p.description&&<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                    <div className="flex flex-wrap gap-1">{(p.languages||[]).map(l=><Badge key={l} color="slate">{l}</Badge>)}</div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Created {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Btn size="sm" variant="ghost" onClick={()=>{setSelected(p);setModal('view')}}><Icon d={IC.eye} size={13}/>View</Btn>
                    {isOwner&&<>
                      <Btn size="sm" variant="ghost" onClick={()=>toggleVisibility(p.id)}><Icon d={p.visibility==='public'?IC.eyeOff:IC.eye} size={13}/>{p.visibility==='public'?'Make Private':'Make Public'}</Btn>
                      <Btn size="sm" variant="secondary" onClick={()=>{setSelected(p);setModal('tasks')}}><Icon d={IC.task} size={13}/>Tasks</Btn>
                      <Btn size="sm" variant="secondary" onClick={()=>{setSelected(p);setModal('collabs')}}><Icon d={IC.users} size={13}/>Collabs</Btn>
                      {p.course==='Bachelor Project'&&<Btn size="sm" variant="secondary" onClick={()=>{setSelected(p);setModal('thesis')}}><Icon d={IC.fileText} size={13}/>Thesis</Btn>}
                      <Btn size="sm" onClick={()=>openEdit(p)}><Icon d={IC.edit} size={13}/>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={()=>delProject(p.id)}><Icon d={IC.trash} size={13}/>Delete</Btn>
                    </>}
                  </div>
                </div>
                {(p.instructorComments||[]).length>0&&(
                  <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-3">
                    <p className="mb-1 text-xs font-semibold text-blue-700 dark:text-blue-400">💬 Instructor Feedback </p>
                    {p.instructorComments.map((c,i)=><p key={i} className="text-xs text-blue-800 dark:text-blue-300">"{c.text}" — <span className="text-blue-600 dark:text-blue-400">{c.author}</span></p>)}
                  </div>
                )}
                {p.flagged&&isOwner&&<AppealSection project={p} setProjects={setProjects} pushNotif={pushNotif} studentProfile={profile}/>}
              </Card>
            )
          })}
        </div>
      }
      {modal==='view'&&selected&&(
        <Modal title={selected.title} onClose={()=>setModal(null)} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2"><Badge color={selected.visibility==='public'?'green':'slate'}>{selected.visibility}</Badge><Badge color="blue">{selected.course}</Badge>{selected.rating>0&&<Badge color="yellow">★ {selected.rating}/5</Badge>}</div>
            {selected.description&&<p className="text-sm text-slate-700">{selected.description}</p>}
            {selected.github&&<a href={selected.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={13}/>GitHub</a>}
            {selected.demoVideo&&<a href={selected.demoVideo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.eye} size={13}/>Demo Video</a>}
            <div className="flex flex-wrap gap-1">{(selected.languages||[]).map(l=><Badge key={l} color="slate">{l}</Badge>)}</div>
            <p className="text-xs text-slate-400">Owner: {selected.owner} · Created {new Date(selected.createdAt).toLocaleDateString()}</p>
            {(selected.instructorComments||[]).length>0&&<div className="rounded-lg bg-blue-50 p-3"><p className="mb-1 text-xs font-semibold text-blue-700">Instructor Feedback</p>{selected.instructorComments.map((c,i)=><p key={i} className="text-xs text-blue-800">"{c.text}" — {c.author}</p>)}</div>}
            {(selected.tasks||[]).length>0&&<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Tasks</p>{selected.tasks.map(t=><div key={t.id} className="mb-1.5 rounded border border-slate-200 px-3 py-2 text-sm"><div className="flex justify-between"><span className="font-medium text-slate-800">{t.title}</span><Badge color={t.status==='completed'?'green':t.status==='postponed'?'slate':'yellow'}>{t.status}</Badge></div>{t.instructorComment&&<p className="text-xs text-blue-700 mt-1">💬 {t.instructorComment}</p>}</div>)}</div>}
          </div>
        </Modal>
      )}
      {(modal==='create'||modal==='edit')&&(
        <Modal title={modal==='create'?'New Project':'Edit Project'} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <Input label="Project Title *" value={form.title} onChange={f('title')} placeholder="My Awesome Project"/>
            <Sel label="Course *" value={form.course} onChange={f('course')}>{COURSES.map(c=><option key={c}>{c}</option>)}</Sel>
            <Textarea label="Short Description" value={form.description} onChange={f('description')} placeholder="Describe your project briefly…"/>
            <Input label="GitHub Link" value={form.github} onChange={f('github')} placeholder="https://github.com/username/repo"/>
            <Input label="Demo Video Link" value={form.demoVideo} onChange={f('demoVideo')} placeholder="https://youtube.com/watch?v=…"/>
            <TagPicker label="Programming Languages" options={LANGS} selected={form.languages||[]}
              onToggle={l=>setForm(p=>({...p,languages:(p.languages||[]).includes(l)?(p.languages||[]).filter(x=>x!==l):[...(p.languages||[]),l]}))}/>
            <Sel label="Visibility" value={form.visibility} onChange={f('visibility')}><option value="public">Public</option><option value="private">Private</option></Sel>
          </div>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><Btn onClick={saveProject}><Icon d={IC.check}/>Save Project</Btn><Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
      {modal==='tasks'&&selected&&<TasksModal project={projects.find(p=>p.id===selected.id)||selected} setProjects={setProjects} profile={profile} onClose={()=>setModal(null)}/>}
      {modal==='collabs'&&selected&&<CollabsModal project={projects.find(p=>p.id===selected.id)||selected} setProjects={setProjects} profile={profile} pushNotif={pushNotif} onClose={()=>setModal(null)}/>}
      {modal==='thesis'&&selected&&<ThesisModal project={projects.find(p=>p.id===selected.id)||selected} setProjects={setProjects} onClose={()=>setModal(null)}/>}
    </div>
  )
}

function InvitationsSection({ profile, projects, setProjects, pushNotif }) {
  const myInvites=projects.flatMap(p=>(p.collaborators||[]).filter(c=>c.email===profile.email&&c.status==='pending').map(c=>({project:p,collab:c})))
  const respond=(projectId,status)=>{
    setProjects(p=>p.map(x=>x.id===projectId?{...x,collaborators:(x.collaborators||[]).map(c=>c.email===profile.email?{...c,status}:c)}:x))
    const proj=projects.find(p=>p.id===projectId)
    pushNotif(`You ${status} the invitation for "${proj?.title}".`)
  }
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Invitations</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Accept or reject project invitations.</p></div>
      {myInvites.length===0?<Card><EmptyState message="No pending invitations."/></Card>:
        <div className="space-y-3">
          {myInvites.map(({project,collab})=>(
            <Card key={project.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{project.title}</p>
                  <div className="flex flex-wrap gap-2"><Badge color="blue">{project.course}</Badge><Badge color="slate">From: {project.owner}</Badge></div>
                  {project.description&&<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{project.description}</p>}
                  <p className="text-xs text-slate-400 dark:text-slate-500">Invited {new Date(collab.invitedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Btn size="sm" variant="success" onClick={()=>respond(project.id,'accepted')}><Icon d={IC.check} size={13}/>Accept</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>respond(project.id,'rejected')}><Icon d={IC.x} size={13}/>Reject</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}

function ExploreProjectsSection({ profile, projects, favProjects, setFavProjects }) {
  const [search, setSearch]=useState('')
  const [filterCourse, setFilterCourse]=useState('')
  const [filterInstructor, setFilterInstructor]=useState('')
  const [filterDateFrom, setFilterDateFrom]=useState('')
  const [filterDateTo, setFilterDateTo]=useState('')
const [sortDate, setSortDate]=useState('newest')
  const [sortRating, setSortRating]=useState('none')
  const [selected, setSelected]=useState(null)
  const publicProjects=projects.filter(p=>p.visibility==='public')
  const instructors=getSeedInstructors()
  const courses=[...new Set(publicProjects.map(p=>p.course))]
  const hasRatings=publicProjects.some(p=>(p.rating||0)>0)
  const displayed=publicProjects
    .filter(p=>p.title.toLowerCase().includes(search.toLowerCase()))
    .filter(p=>!filterCourse||p.course===filterCourse)
    .filter(p=>!filterInstructor||(p.collaborators||[]).some(c=>c.email===filterInstructor&&c.status==='accepted'))
    .filter(p=>!filterDateFrom||new Date(p.createdAt)>=new Date(filterDateFrom))
    .filter(p=>!filterDateTo||new Date(p.createdAt)<=new Date(filterDateTo))
    .sort((a,b)=>{
      if(sortRating==='highest')return (b.rating||0)-(a.rating||0)
      if(sortRating==='lowest')return (a.rating||0)-(b.rating||0)
      if(sortDate==='newest')return new Date(b.createdAt)-new Date(a.createdAt)
      if(sortDate==='oldest')return new Date(a.createdAt)-new Date(b.createdAt)
      return new Date(b.createdAt)-new Date(a.createdAt)
    })
  const toggleFav=id=>setFavProjects(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Explore All Projects</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter by course/instructor/date, sort, view details.</p></div>
<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">

        {/* Search */}
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by project title…"/>
        </div>

        {/* Course */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Course</label>
          <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Courses</option>
            {courses.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Instructor */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Instructor</label>
          <select value={filterInstructor} onChange={e=>setFilterInstructor(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="">All Instructors</option>
            {instructors.map(i=>{
              const name=`${i.firstName||''} ${i.lastName||''}`.trim()||i.email
              return <option key={i.email} value={i.email}>{name}</option>
            })}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">From Date</label>
          <input type="date" value={filterDateFrom} onChange={e=>setFilterDateFrom(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"/>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">To Date</label>
          <input type="date" value={filterDateTo} onChange={e=>setFilterDateTo(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"/>
        </div>

        {/* Sort by Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Sort by Date</label>
          <select value={sortDate} onChange={e=>{setSortDate(e.target.value);setSortRating('none')}}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Sort by Rating */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 px-0.5">Sort by Rating</label>
          <select
            value={sortRating}
            disabled={!hasRatings}
            onChange={e=>setSortRating(e.target.value)}
            title={!hasRatings?'No ratings yet':''}
            className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors
              ${hasRatings
                ?'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 cursor-pointer'
                :'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}>
            <option value="none">{hasRatings?'No Rating Sort':'No ratings yet'}</option>
            {hasRatings&&<>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </>}
          </select>
        </div>

      </div>
      {displayed.length===0?<Card><EmptyState message="No public projects match your search."/></Card>:
        <div className="space-y-3">
          {displayed.map(p=>(
            <Card key={p.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>{p.featured && <Badge color="purple">Featured</Badge>}<Badge color="blue">{p.course}</Badge>{p.rating>0&&<Badge color="yellow">★ {p.rating}/5</Badge>}</div>
                  {p.description&&<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                  <div className="flex flex-wrap gap-1">{(p.languages||[]).map(l=><Badge key={l} color="slate">{l}</Badge>)}</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">By {p.owner} · {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Btn size="sm" variant="secondary" onClick={()=>setSelected(p)}><Icon d={IC.eye} size={13}/>View</Btn>
                  <button onClick={()=>toggleFav(p.id)} className={`rounded-lg p-1.5 transition ${favProjects.includes(p.id)?'text-red-500':'text-slate-300 hover:text-red-400'}`}><Icon d={IC.heart} size={16}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
      {selected&&(
        <Modal title={selected.title} onClose={()=>setSelected(null)} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2"><Badge color="blue">{selected.course}</Badge>{selected.rating>0&&<Badge color="yellow">★ {selected.rating}/5</Badge>}</div>
            {selected.description&&<p className="text-sm text-slate-700">{selected.description}</p>}
            {selected.github&&<a href={selected.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={13}/>GitHub</a>}
            {selected.demoVideo&&<a href={selected.demoVideo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.eye} size={13}/>Demo Video</a>}
            <div className="flex flex-wrap gap-1">{(selected.languages||[]).map(l=><Badge key={l} color="slate">{l}</Badge>)}</div>
            <p className="text-xs text-slate-400">Owner: {selected.owner} · {new Date(selected.createdAt).toLocaleDateString()}</p>
            {(selected.collaborators||[]).filter(c=>c.status==='accepted').length>0&&<div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Collaborators</p><div className="flex flex-wrap gap-1">{selected.collaborators.filter(c=>c.status==='accepted').map(c=><Badge key={c.email} color="slate">{c.email}</Badge>)}</div></div>}
          </div>
        </Modal>
      )}
    </div>
  )
}

function ExplorePortfoliosSection({ projects, favPortfolios, setFavPortfolios, setTab }) {
  const [search, setSearch]=useState('')
  const [filterMajor, setFilterMajor]=useState('')
  const [filterSkill, setFilterSkill]=useState('')
  const [sortByPortfolio, setSortByPortfolio]=useState('most')
  const [selected, setSelected]=useState(null)
  const currentUser=getCurrentUser()
  const allUsers=LS.get('guc_projecthub_users',[]).filter(u=>u.role==='student'&&u.email!==currentUser?.email)
  const profiles=allUsers.map(u=>({...u,...LS.get('student_profile_'+u.email,{})}))
  const withProjects=profiles.map(p=>({...p,publicProjects:projects.filter(pr=>pr.owner===p.email&&pr.visibility==='public'),projectCount:projects.filter(pr=>pr.owner===p.email&&pr.visibility==='public').length}))
  const majors=[...new Set(profiles.map(p=>p.major).filter(Boolean))]
  const allSkills=[...new Set(profiles.flatMap(p=>p.skills||[]))]
  const displayed=withProjects
    .filter(p=>{const name=`${p.firstName||''} ${p.lastName||''}`.toLowerCase();return name.includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase())})
    .filter(p=>!filterMajor||p.major===filterMajor)
    .filter(p=>!filterSkill||(p.skills||[]).includes(filterSkill))
    .sort((a,b)=>sortByPortfolio==='most'?b.projectCount-a.projectCount:a.projectCount-b.projectCount)
  const toggleFav=email=>setFavPortfolios(p=>p.includes(email)?p.filter(x=>x!==email):[...p,email])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Explore All Portfolios</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search by name/email, filter by major/skills, sort by project count.</p></div>
<div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…"/>
        <select value={filterMajor} onChange={e=>setFilterMajor(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">All Majors</option>{majors.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={filterSkill} onChange={e=>setFilterSkill(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">All Skills</option>{allSkills.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={sortByPortfolio} onChange={e=>setSortByPortfolio(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="most">Most Projects</option>
          <option value="least">Least Projects</option>
        </select>
      </div>
      {displayed.length===0?<Card><EmptyState message="No student portfolios found."/></Card>:
        <div className="space-y-3">
          {displayed.map(p=>(
            <Card key={p.email}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {p.photo
  ? <img src={p.photo} alt="avatar" className="h-12 w-12 shrink-0 rounded-full object-cover border-2 border-blue-200"/>
  : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{(p.firstName?.[0]||p.email[0]).toUpperCase()}</div>
}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{p.firstName} {p.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">{p.major&&<Badge color="blue">{p.major}</Badge>}<span className="text-xs text-slate-400">{p.projectCount} public project{p.projectCount!==1?'s':''}</span></div>
                    <div className="flex flex-wrap gap-1 mt-1">{(p.skills||[]).slice(0,4).map(s=><Badge key={s} color="slate">{s}</Badge>)}</div>
                  </div>
                </div>
<div className="flex gap-2 shrink-0">
                  <Btn size="sm" variant="secondary" onClick={()=>setSelected(p)}><Icon d={IC.eye} size={13}/>View Portfolio</Btn>
                  <Btn size="sm" variant="secondary" onClick={()=>{
                    setTab('messages')
                    // store target email so MessagesSection can auto-open it
                    LS.set('student_pending_message_target', p.email)
                  }}><Icon d={IC.chat} size={13}/>Message</Btn>
                  <button onClick={()=>toggleFav(p.email)} className={`rounded-lg p-1.5 transition ${favPortfolios.includes(p.email)?'text-red-500':'text-slate-300 hover:text-red-400'}`}><Icon d={IC.heart} size={16}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
      {selected&&(
        <Modal title={`${selected.firstName} ${selected.lastName}'s Portfolio`} onClose={()=>setSelected(null)} wide>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selected.photo
  ? <img src={selected.photo} alt="avatar" className="h-14 w-14 rounded-full object-cover border-2 border-blue-200"/>
  : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">{(selected.firstName?.[0]||selected.email[0]).toUpperCase()}</div>
}
              <div><p className="font-semibold text-slate-900 text-lg">{selected.firstName} {selected.lastName}</p><p className="text-sm text-slate-500">{selected.email}</p>{selected.major&&<Badge color="blue">{selected.major}</Badge>}</div>
            </div>
            {selected.linkedin&&<a href={selected.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"><Icon d={IC.link} size={13}/>{selected.linkedin}</a>}
            {(selected.skills||[]).length>0&&<div><p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Skills</p><div className="flex flex-wrap gap-1.5">{selected.skills.map(s=><Badge key={s}>{s}</Badge>)}</div></div>}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Public Projects ({selected.publicProjects.length})</p>
              {selected.publicProjects.length===0?<p className="text-sm text-slate-400">No public projects.</p>:
                <div className="space-y-2">{selected.publicProjects.map(proj=>(
                  <div key={proj.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-800">{proj.title}</p><Badge color="blue">{proj.course}</Badge>{proj.rating>0&&<Badge color="yellow">★ {proj.rating}/5</Badge>}</div>
                    {proj.description&&<p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{proj.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">{(proj.languages||[]).map(l=><Badge key={l} color="slate">{l}</Badge>)}</div>
                  </div>
                ))}</div>
              }
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FavoritesSection({ projects, favProjects, setFavProjects, favPortfolios, setFavPortfolios }) {
 const currentUser=getCurrentUser()
  const allUsers=LS.get('guc_projecthub_users',[]).filter(u=>u.role==='student'&&u.email!==currentUser?.email)
  const allProfiles=allUsers.map(u=>({...u,...LS.get('student_profile_'+u.email,{})}))
 const savedProjects=favProjects.map(id=>projects.find(p=>p.id===id)).filter(p=>p&&p.owner!==currentUser?.email)
  const savedPortfolios=favPortfolios.map(email=>{const p=allProfiles.find(x=>x.email===email);return p?{...p,projectCount:projects.filter(pr=>pr.owner===email&&pr.visibility==='public').length}:null}).filter(Boolean)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Favorites</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Saved Projects ({savedProjects.length})</h3>
          {savedProjects.length===0?<Card><EmptyState message="No saved projects. Heart a project in Explore All Projects."/></Card>:
            <div className="space-y-2">{savedProjects.map(p=>(
              <Card key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0"><p className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.title}</p><div className="flex gap-1.5 mt-0.5"><Badge color="blue">{p.course}</Badge>{p.rating>0&&<Badge color="yellow">★ {p.rating}/5</Badge>}</div></div>
                <button onClick={()=>setFavProjects(prev=>prev.filter(id=>id!==p.id))} className="shrink-0 text-red-400 hover:text-red-600"><Icon d={IC.x} size={14}/></button>
              </Card>
            ))}</div>
          }
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Saved Portfolios ({savedPortfolios.length})</h3>
          {savedPortfolios.length===0?<Card><EmptyState message="No saved portfolios. Heart a portfolio in Explore All Portfolios."/></Card>:
            <div className="space-y-2">{savedPortfolios.map(p=>(
              <Card key={p.email} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{(p.firstName?.[0]||p.email[0]).toUpperCase()}</div>
                  <div className="min-w-0"><p className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.firstName} {p.lastName}</p><p className="text-xs text-slate-400 dark:text-slate-500 truncate">{p.email} · {p.projectCount} projects</p></div>
                </div>
                <button onClick={()=>setFavPortfolios(prev=>prev.filter(e=>e!==p.email))} className="shrink-0 text-red-400 hover:text-red-600"><Icon d={IC.x} size={14}/></button>
              </Card>
            ))}</div>
          }
        </div>
      </div>
    </div>
  )
}

function RecommendedSection({ profile, projects, favProjects, setFavProjects }) {
  const myLangs=new Set(projects.filter(p=>p.owner===profile.email).flatMap(p=>p.languages||[]))
  const scored=projects.filter(p=>p.visibility==='public'&&p.owner!==profile.email).map(p=>{let score=0;(p.languages||[]).forEach(l=>{if(myLangs.has(l))score+=2});score+=(p.rating||0);return{...p,score}}).sort((a,b)=>b.score-a.score)
  const toggleFav=id=>setFavProjects(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recommended Projects</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Projects matching your programming languages.</p></div>
      {scored.length===0?<Card><EmptyState message="No recommendations yet. Add projects with languages to get personalized recommendations."/></Card>:
        <div className="space-y-3">{scored.slice(0,10).map(p=>(
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3><Badge color="blue">{p.course}</Badge>{p.rating>0&&<Badge color="yellow">★ {p.rating}/5</Badge>}</div>
                {p.description&&<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>}
                <div className="flex flex-wrap gap-1">{(p.languages||[]).map(l=><Badge key={l} color={myLangs.has(l)?'green':'slate'}>{l}</Badge>)}</div>
                <p className="text-xs text-slate-400 dark:text-slate-500">By {p.owner}</p>
              </div>
              <button onClick={()=>toggleFav(p.id)} className={`shrink-0 rounded-lg p-1.5 transition ${favProjects.includes(p.id)?'text-red-500':'text-slate-300 hover:text-red-400'}`}><Icon d={IC.heart} size={16}/></button>
            </div>
          </Card>
        ))}</div>
      }
    </div>
  )
}

function MessagesSection({ profile, pushNotif }) {
  const [threads, setThreads]=useLS('student_messages_'+profile.email,[])
  const [active, setActive]=useState(null)
  const [newEmail, setNewEmail]=useState('')
  const [text, setText]=useState('')
  const [showNewThread, setShowNewThread]=useState(false)
  const bottomRef=useRef(null)
  const inputRef=useRef(null)

  const markThreadRead=(email)=>{
    // mark messages as read in state
    setThreads(p=>p.map(t=>t.with===email
      ?{...t,messages:t.messages.map(m=>m.from!==profile.email?{...m,read:true}:m)}
      :t
    ))
    // persist to localStorage
    const msgKey='student_messages_'+profile.email
    LS.set(msgKey,LS.get(msgKey,[]).map(t=>t.with===email
      ?{...t,messages:t.messages.map(m=>m.from!==profile.email?{...m,read:true}:m)}
      :t
    ))
    // mark related message notifications as read
    const notifKey='student_notifs_'+profile.email
    const notifs=LS.get(notifKey,[])
    const updated=notifs.map(n=>{
      const txt=(n.message||'').toLowerCase()
      const isMsg=txt.includes('message')||txt.includes('chat')
      const fromMatch=n.message?.includes(email)
      return (isMsg&&fromMatch)?{...n,read:true}:n
    })
    LS.set(notifKey,updated)
    // mark sender's outgoing messages as read (turns their checks blue)
    const senderKey='student_messages_'+email
    LS.set(senderKey,LS.get(senderKey,[]).map(t=>
      t.with===profile.email
        ?{...t,messages:t.messages.map(m=>m.from===email?{...m,read:true}:m)}
        :t
    ))
    // force a re-render of threads from localStorage so receipts update
    setThreads(LS.get('student_messages_'+profile.email,[]))
  }

  useEffect(()=>{
    const target=LS.get('student_pending_message_target',null)
    if(target){
      LS.set('student_pending_message_target',null)
      setThreads(p=>{
        if(!p.some(t=>t.with===target)) return[...p,{with:target,messages:[]}]
        return p
      })
      setActive(target)
      markThreadRead(target)
    }
  },[])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[active,threads])

  useEffect(()=>{
    if(active) inputRef.current?.focus()
  },[active])

  const startThread=()=>{
    const em=newEmail.trim().toLowerCase()
    if(!em)return
    if(threads.some(t=>t.with===em)){
      setActive(em);markThreadRead(em)
    } else {
      setThreads(p=>[...p,{with:em,messages:[]}])
      setActive(em)
    }
    setNewEmail('');setShowNewThread(false)
  }

  const send=()=>{
    if(!text.trim()||!active)return
    const msg={id:Date.now().toString(),from:profile.email,text:text.trim(),at:new Date().toISOString(),read:false}
    setThreads(p=>p.map(t=>t.with===active?{...t,messages:[...t.messages,msg]}:t))
    const recipientKey='student_messages_'+active
    const recipientThreads=LS.get(recipientKey,[])
    const existingThread=recipientThreads.find(t=>t.with===profile.email)
    if(existingThread){
      LS.set(recipientKey,recipientThreads.map(t=>t.with===profile.email?{...t,messages:[...t.messages,msg]}:t))
    } else {
      LS.set(recipientKey,[...recipientThreads,{with:profile.email,messages:[msg]}])
    }
    LS.set('student_notifs_'+active,[...LS.get('student_notifs_'+active,[]),
      {id:Date.now().toString(),read:false,message:`New message from ${profile.email}.`,createdAt:new Date().toISOString()}
    ])
    pushNotif(`Message sent to ${active}.`)
    setText('')
  }

  const activeThread=threads.find(t=>t.with===active)
  const unreadCount=(email)=>threads.find(t=>t.with===email)?.messages.filter(m=>m.from!==profile.email&&!m.read).length||0
  const formatTime=(iso)=>new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  const formatDate=(iso)=>{
    const d=new Date(iso),today=new Date()
    if(d.toDateString()===today.toDateString())return 'Today'
    const y=new Date(today);y.setDate(today.getDate()-1)
    if(d.toDateString()===y.toDateString())return 'Yesterday'
    return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})
  }
  const grouped=(msgs=[])=>{
    const groups=[];let lastDate=''
    msgs.forEach(m=>{
      const label=formatDate(m.at)
      if(label!==lastDate){groups.push({type:'date',label});lastDate=label}
      groups.push({type:'msg',...m})
    })
    return groups
  }

  return (
<div className="flex h-[calc(100vh-8rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">

      {/* LEFT: Thread list */}
      <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Messages</p>
          <button onClick={()=>setShowNewThread(p=>!p)} title="New conversation"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
            <Icon d={IC.plus} size={13}/>
          </button>
        </div>

       {showNewThread&&(
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 flex gap-1.5">
            <input autoFocus value={newEmail} onChange={e=>setNewEmail(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter')startThread();if(e.key==='Escape')setShowNewThread(false)}}
              placeholder="Enter email address…"
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
            <button onClick={startThread}
              className="rounded-lg bg-blue-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-800 transition-colors">
              Go
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {threads.length===0
?<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Icon d={IC.chat} size={18}/>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click + to start chatting</p>
            </div>
            :threads.map(t=>{
              const uc=unreadCount(t.with)
              const isActive=active===t.with
              const lastMsg=t.messages.at(-1)
              return (
<button key={t.with} onClick={()=>{setActive(t.with);markThreadRead(t.with)}}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-slate-100 dark:border-slate-700/50
                    ${isActive?'bg-blue-700':'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-150
                    ${isActive?'bg-blue-500 text-white':'bg-blue-100 text-blue-700'}`}>
                    {t.with[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`truncate text-xs font-semibold ${isActive?'text-white':uc>0?'text-slate-900 dark:text-white':'text-slate-700 dark:text-slate-300'}`}>
                        {t.with}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {lastMsg&&(
                          <p className={`text-[10px] ${isActive?'text-blue-200':'text-slate-400'}`}>
                            {formatTime(lastMsg.at)}
                          </p>
                        )}
                        {/* unread badge — right side, disappears when read */}
                        {uc>0&&!isActive&&(
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white transition-all duration-200">
                            {uc>9?'9+':uc}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`truncate text-[11px] mt-0.5
                      ${isActive?'text-blue-200':uc>0?'font-semibold text-slate-800 dark:text-slate-200':'text-slate-400 dark:text-slate-500'}`}>
                      {lastMsg
                        ?(lastMsg.from===profile.email
                          ?<span className="text-slate-400">You: </span>
                          :'')
                        :''}
                      {lastMsg?lastMsg.text:'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })
          }
        </div>
      </div>

      {/* RIGHT: Chat window */}
      <div className="flex flex-1 flex-col min-w-0">
        {!activeThread
?<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Icon d={IC.chat} size={28}/>
            </div>
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Select a conversation</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Choose from the left or start a new chat with the + button.</p>
            </div>
          </div>
          :<>
            {/* Chat header */}
<div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">
                {activeThread.with[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeThread.with}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{activeThread.messages.length} message{activeThread.messages.length!==1?'s':''}</p>
              </div>
            </div>

            {/* Scrollable messages */}
<div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scroll-smooth bg-slate-50 dark:bg-slate-900/50">
              {activeThread.messages.length===0
                ?<div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">Say hello 👋</p>
                </div>
                :grouped(activeThread.messages).map((item,idx)=>{
                  if(item.type==='date') return (
                    <div key={'d'+idx} className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-slate-200"/>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-2">{item.label}</span>
                      <div className="flex-1 h-px bg-slate-200"/>
                    </div>
                  )
                  const isMine=item.from===profile.email
                  const isRead=item.read===true
                  return (
                    <div key={item.id} className={`flex ${isMine?'justify-end':'justify-start'} mb-1`}>
                      {!isMine&&(
                        <div className="mr-2 flex h-6 w-6 shrink-0 self-end items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                          {item.from[0].toUpperCase()}
                        </div>
                      )}
                      <div className="max-w-xs lg:max-w-sm xl:max-w-md">
<div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                          ${isMine?'rounded-br-md bg-blue-700 text-white':'rounded-bl-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'}`}>
                          <p className="break-words">{item.text}</p>
                        </div>
                        {/* timestamp + read receipt — only on outgoing */}
                        <div className={`mt-0.5 flex items-center gap-1 ${isMine?'justify-end':'justify-start'}`}>
                          <p className="text-[10px] text-slate-400">{formatTime(item.at)}</p>
                          {isMine&&(
                            <span title={isRead?'Seen':'Sent'} className="flex items-center transition-all duration-300">
                              {isRead
                                /* blue double check = seen */
                                ?<svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                                  <path d="M1 5l3 3 5-6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 5l3 3 5-6" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                /* grey double check = delivered */
                                :<svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                                  <path d="M1 5l3 3 5-6" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 5l3 3 5-6" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              <div ref={bottomRef}/>
            </div>

            {/* Fixed input bar */}
          <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                  placeholder={`Message ${activeThread.with.split('@')[0]}…`}
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"/>
                <button onClick={send} disabled={!text.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white transition-all hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                  <Icon d={IC.send} size={13}/>
                </button>
              </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">Press Enter to send</p>
            </div>
          </>
        }
      </div>
    </div>
  )
}

function InternshipsSection({ profile, pushNotif }) {
  const [applications, setApplications]=useLS('student_applications_'+profile.email,[])
  const [search, setSearch]=useState('')
  const [filterComp, setFilterComp]=useState('')
  const [filterDur, setFilterDur]=useState('')
  const [modal, setModal]=useState(null)
  const [selected, setSelected]=useState(null)
  const [coverLetter, setCoverLetter]=useState('')
  const [sortIntern, setSortIntern]=useState('newest')
  const getInternships = () => {
    const all = []
    const seen = new Set()
    const push = (item) => {
      if (!item || !item.id) return
      if (seen.has(item.id)) return
      seen.add(item.id)
      all.push(item)
    }
    // Read employer approval statuses from admin state
    const adminState = LS.get('guc_projecthub_admin_state', {})
    const employerStatuses = adminState.employerStatuses || {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('employer_internships_')) {
        const companyEmail = key.replace('employer_internships_', '')
        // Only show internships from approved employers (or pending — show with badge)
        const approvalStatus = employerStatuses[companyEmail.toLowerCase()] ?? 'pending'
        if (approvalStatus === 'rejected') continue
        const list = LS.get(key, [])
        list.forEach((item) =>
          push({ ...item, companyEmail, approvalStatus }),
        )
      }
    }
    const catalog = LS.get('student_internships', [])
    if (Array.isArray(catalog)) {
      catalog.forEach((item) =>
        push({
          ...item,
          companyEmail: item.companyEmail || 'company@example.com',
          companyName: item.companyName || item.company || 'Company',
        }),
      )
    }
    if (all.length === 0) {
      return [
        {
          id: 'i1',
          title: 'Frontend Developer Intern',
          companyName: 'TechCorp',
          companyEmail: 'company@example.com',
          duration: '3 months',
          deadline: '2026-08-01',
          skills: ['React', 'JavaScript'],
          languages: ['JavaScript'],
          details: 'Work on our web apps.',
          postedAt: '2026-04-01',
          status: 'hiring',
          archived: false,
        },
        {
          id: 'i2',
          title: 'Data Science Intern',
          companyName: 'DataViz Co',
          companyEmail: 'dataviz@example.com',
          duration: '6 months',
          deadline: '2026-07-15',
          skills: ['Python', 'SQL'],
          languages: ['Python'],
          details: 'Build ML pipelines.',
          postedAt: '2026-03-20',
          status: 'hiring',
          archived: false,
        },
        {
          id: 'i3',
          title: 'Mobile Developer Intern',
          companyName: 'AppWorks',
          companyEmail: 'appworks@example.com',
          duration: '4 months',
          deadline: '2026-06-30',
          skills: ['Flutter'],
          languages: ['Dart'],
          details: 'Build mobile features.',
          postedAt: '2026-04-10',
          status: 'hiring',
          archived: false,
        },
      ]
    }
    return all.filter((i) => !i.archived)
  }
  const internships=getInternships()
  const companies=[...new Set(internships.map(i=>i.companyName||i.companyEmail))]
  const durations=[...new Set(internships.map(i=>i.duration))]
  const displayed=internships.filter(i=>{const comp=(i.companyName||i.companyEmail||'').toLowerCase();return i.title.toLowerCase().includes(search.toLowerCase())||comp.includes(search.toLowerCase())}).filter(i=>!filterComp||(i.companyName||i.companyEmail)===filterComp).filter(i=>!filterDur||i.duration===filterDur).sort((a,b)=>sortIntern==='oldest'?new Date(a.postedAt)-new Date(b.postedAt):new Date(b.postedAt)-new Date(a.postedAt))
  const getApp=id=>applications.find(a=>a.internshipId===id)
  const apply=()=>{
    if(!coverLetter.trim())return alert('Please write a cover letter.')
    const newApp={id:Date.now().toString(),internshipId:selected.id,studentEmail:profile.email,coverLetter,appliedAt:new Date().toISOString(),status:'pending'}
    setApplications(p=>[...p,newApp])
    const empKey='employer_applications_'+(selected.companyEmail||'company@example.com')
    LS.set(empKey,[...LS.get(empKey,[]),newApp])
    pushNotif(`Application submitted for "${selected.title}".`)
    setModal(null);setCoverLetter('')
  }
  const appStatuses=applications.map(a=>{const intern=internships.find(i=>i.id===a.internshipId);const empKey='employer_applications_'+(intern?.companyEmail||'');const empApps=LS.get(empKey,[]);const updated=empApps.find(e=>e.id===a.id);return updated?{...a,...updated}:a})
  const completedInternships=appStatuses.filter(a=>a.status==='accepted').map(a=>({...a,internship:internships.find(i=>i.id===a.internshipId)||{title:'Internship',companyName:'Company'}}))
  const stColor={pending:'yellow',nominated:'purple',accepted:'green',rejected:'red'}
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Internships</h2>
      {completedInternships.length>0&&(
        <Card className="border-green-200 bg-green-50">
          <p className="font-semibold text-green-800 mb-2">✓ Completed Internships on Portfolio</p>
          <div className="flex flex-wrap gap-2">{completedInternships.map(a=><Badge key={a.id} color="green">{a.internship.title} @ {a.internship.companyName||a.internship.companyEmail}</Badge>)}</div>
        </Card>
      )}
<div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or company…"/>
        <select value={filterComp} onChange={e=>setFilterComp(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">All Companies</option>{companies.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filterDur} onChange={e=>setFilterDur(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">All Durations</option>{durations.map(d=><option key={d}>{d}</option>)}
        </select>
        <select value={sortIntern} onChange={e=>setSortIntern(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      {displayed.length===0?<Card><EmptyState message="No internships found."/></Card>:
        <div className="space-y-3">{displayed.map(intern=>{
          const app=getApp(intern.id)
          const updatedApp=appStatuses.find(a=>a.internshipId===intern.id)
          return (
            <Card key={intern.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{intern.title}</h3><Badge color="blue">{intern.companyName||intern.companyEmail}</Badge><Badge color="slate">{intern.duration}</Badge><Badge color={intern.status==='hiring'?'green':'slate'}>{intern.status==='hiring'?'Currently Hiring':'Position Filled'}</Badge></div>
                  {intern.details&&<p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{intern.details}</p>}
                  <div className="flex flex-wrap gap-1">{(intern.skills||[]).map(s=><Badge key={s} color="slate">{s}</Badge>)}{(intern.languages||[]).map(l=><Badge key={l} color="blue">{l}</Badge>)}</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Posted {new Date(intern.postedAt).toLocaleDateString()} · Deadline {intern.deadline?new Date(intern.deadline).toLocaleDateString():'N/A'}</p>
                  {updatedApp&&<div className="flex items-center gap-2 pt-1"><span className="text-xs text-slate-500">Your application:</span><Badge color={stColor[updatedApp.status]||'slate'}>{updatedApp.status}</Badge></div>}
                </div>
                {!app?<Btn size="sm" onClick={()=>{setSelected(intern);setModal('apply')}}><Icon d={IC.briefcase} size={13}/>Apply</Btn>:<span className="text-xs text-slate-400 shrink-0">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>}
              </div>
            </Card>
          )
        })}</div>
      }
      {modal==='apply'&&selected&&(
        <Modal title={`Apply — ${selected.title}`} onClose={()=>setModal(null)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><p><strong>{selected.companyName||selected.companyEmail}</strong> · {selected.duration}</p>{selected.details&&<p className="text-slate-500 mt-1">{selected.details}</p>}</div>
            <Textarea label="Cover Letter *" value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} placeholder="Why do you think you're a good fit for this role?" rows={5}/>
          </div>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><Btn onClick={apply}><Icon d={IC.send} size={13}/>Submit Application</Btn><Btn variant="secondary" onClick={()=>setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  )
}

function NotificationsSection({ notifications, setNotifications, profileEmail, setTab }) {
  const [notifsOn, setNotifsOn]=useLS('student_notifs_on_'+(profileEmail||'default'),true)
  const unread=notifications.filter(n=>!n.read).length
  const markAll=read=>setNotifications(p=>p.map(n=>({...n,read})))

  const resolveRoute=(n)=>{
    const msg=(n.message||'').toLowerCase()
    if(msg.includes('message')||msg.includes('chat')){
      const match=n.message?.match(/from\s+([\w.@+-]+@[\w.+-]+)/i)
        ||n.message?.match(/([\w.@+-]+@[\w.+-]+)/)
      if(match?.[1]){
        LS.set('student_pending_message_target',match[1])
        const key='student_messages_'+profileEmail
        LS.set(key,LS.get(key,[]).map(t=>
          t.with===match[1]
            ?{...t,messages:t.messages.map(m=>m.from!==profileEmail?{...m,read:true}:m)}
            :t
        ))
      }
      return 'messages'
    }
    if(msg.includes('invitation')||msg.includes('invited')||msg.includes('collab'))return 'invitations'
    if(msg.includes('internship')||msg.includes('application')||msg.includes('job')||msg.includes('hiring'))return 'internships'
    if(msg.includes('appeal')||msg.includes('project'))return 'projects'
    return null
  }

  const handleClick=(n)=>{
    setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))
    const dest=resolveRoute(n)
    if(dest)setTab(dest)
  }

  const iconFor=(n)=>{
    const msg=(n.message||'').toLowerCase()
    if(msg.includes('message')||msg.includes('chat'))return{d:IC.chat,bg:'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}
    if(msg.includes('invitation')||msg.includes('invited'))return{d:IC.users,bg:'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'}
    if(msg.includes('internship')||msg.includes('application')||msg.includes('job'))return{d:IC.briefcase,bg:'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'}
    if(msg.includes('appeal')||msg.includes('project'))return{d:IC.folder,bg:'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'}
    return{d:IC.bell,bg:'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          {unread>0&&<p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{unread} unread</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" variant="secondary" onClick={()=>markAll(true)}>Mark all read</Btn>
          <Btn size="sm" variant="secondary" onClick={()=>markAll(false)}>Mark all unread</Btn>
          <Btn size="sm" variant={notifsOn?'danger':'success'} onClick={()=>setNotifsOn(p=>!p)}>
            <Icon d={IC.bell} size={13}/>{notifsOn?'Turn Off':'Turn On'}
          </Btn>
        </div>
      </div>

      {!notifsOn&&(
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          🔕 Notifications are turned off. New notifications will not be received.
        </div>
      )}

      {notifications.length===0
        ?<Card><EmptyState message="No notifications yet."/></Card>
        :<div className="space-y-1.5">
          {notifications.slice().reverse().map(n=>{
            const {d,bg}=iconFor(n)
            const dest=resolveRoute(n)
            const isClickable=!!dest
            return (
              <div
                key={n.id}
                onClick={()=>handleClick(n)}
                className={`group flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-150
                  ${n.read?'border-slate-200 bg-white':'border-blue-200 bg-blue-50/60'}
                  ${isClickable?'cursor-pointer hover:border-blue-300 hover:shadow-sm hover:bg-blue-50 active:scale-[0.995]':'cursor-default'}`}>
                {/* category icon */}
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} transition-transform duration-150 ${isClickable?'group-hover:scale-105':''}`}>
                  <Icon d={d} size={14}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.read?'text-slate-500 dark:text-slate-400':'text-slate-800 dark:text-slate-200 font-medium'}`}>
                    {n.message}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </p>
                    {isClickable&&(
                      <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        Click to open →
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!n.read&&<span className="h-2 w-2 rounded-full bg-blue-600"/>}
                  <button
                    onClick={e=>{e.stopPropagation();setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:!x.read}:x))}}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    {n.read?'Unread':'Read'}
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

function StatsSection({ projects, profile }) {
  const myProjects=projects.filter(p=>p.owner===profile.email)
  const langs={}
  myProjects.forEach(p=>(p.languages||[]).forEach(l=>{langs[l]=(langs[l]||0)+1}))
  const total=Object.values(langs).reduce((a,b)=>a+b,0)||1
  const colMap={}
  myProjects.forEach(p=>(p.collaborators||[]).filter(c=>c.status==='accepted').forEach(c=>{colMap[c.email]=(colMap[c.email]||0)+1}))
  const topCollabs=Object.entries(colMap).sort((a,b)=>b[1]-a[1]).slice(0,5)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Statistics</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{label:'Total Projects',value:myProjects.length},{label:'Public Projects',value:myProjects.filter(p=>p.visibility==='public').length},{label:'Collaborators',value:Object.keys(colMap).length}].map(s=>(
          <Card key={s.label} className="text-center"><p className="text-4xl font-bold text-blue-700 dark:text-blue-400">{s.value}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Languages Used (%)</h3>
          {Object.keys(langs).length===0?<EmptyState message="No language data yet."/>:
            <div className="space-y-3">{Object.entries(langs).sort((a,b)=>b[1]-a[1]).map(([lang,count])=>(
             <div key={lang}><div className="flex justify-between mb-1 text-sm"><span className="font-medium text-slate-700 dark:text-slate-300">{lang}</span><span className="text-slate-400 dark:text-slate-500">{Math.round(count/total*100)}%</span></div>
              <div className="h-2.5 w-full rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-blue-600" style={{width:`${Math.round(count/total*100)}%`}}/></div></div>
            ))}</div>
          }
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-200">Top Collaborators per Project</h3>
          {topCollabs.length===0?<EmptyState message="No accepted collaborators yet."/>:
            <ul className="space-y-2">{topCollabs.map(([email,count])=>(
              <li key={email} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">{email[0].toUpperCase()}</div><span className="text-sm text-slate-700 dark:text-slate-300">{email}</span></div>
                <Badge color="blue">{count} project{count>1?'s':''}</Badge>
              </li>
            ))}</ul>
          }
        </Card>
      </div>
    </div>
  )
}

function SettingsSection({ profile, rawUser, initialTab='appearance' }) {
  const { isDark: darkMode, setTheme } = useTheme()
  const handleThemeChange = (val) => {
    setTheme(val)
  }
  const [msgNotifs, setMsgNotifs]=useLS('student_setting_msg_notifs_'+rawUser.email, true)
  const [internNotifs, setInternNotifs]=useLS('student_setting_intern_notifs_'+rawUser.email, true)
  const [collabNotifs, setCollabNotifs]=useLS('student_setting_collab_notifs_'+rawUser.email, true)
  const [profilePublic, setProfilePublic]=useLS('student_setting_profile_public_'+rawUser.email, true)
  const [cooldown, setCooldown]=useState(false)
  const [cooldownCount, setCooldownCount]=useState(5)
  const [tab, setTab]=useState(initialTab)

  // sync if initialTab changes (from dropdown navigation)
  useEffect(()=>{ setTab(initialTab) },[initialTab])

  const startCooldown=()=>{
    setCooldown(true);setCooldownCount(5)
    const t=setInterval(()=>setCooldownCount(c=>{
      if(c<=1){clearInterval(t);setTimeout(()=>setCooldown(false),400);return 0}
      return c-1
    }),1000)
  }

  

  const settingsTabs=[
    {id:'appearance',label:'Appearance',icon:IC.moon},
    {id:'notifications',label:'Notifications',icon:IC.bell},
    {id:'wellness',label:'Wellness',icon:IC.zap},
    {id:'account',label:'Account',icon:IC.shield},
  ]

  const Toggle=({value,onChange,label,desc})=>(
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {desc&&<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button onClick={()=>onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none
          ${value?'bg-blue-600':'bg-slate-200 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
          ${value?'translate-x-5':'translate-x-0'}`}/>
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Cooldown overlay */}
      {cooldown&&(
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-blue-300/50"/>
              <span className="text-4xl font-bold text-white">{cooldownCount}</span>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-light text-white tracking-wide">Take a breath</p>
              <p className="text-sm text-blue-200">Inhale slowly… exhale gently…</p>
            </div>
            <div className="h-1 w-48 rounded-full bg-slate-700">
              <div className="h-1 rounded-full bg-blue-400 transition-all duration-1000"
                style={{width:`${(cooldownCount/5)*100}%`}}/>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account preferences and platform experience.</p>
      </div>

      <div className="flex gap-6">
        {/* Settings sub-nav */}
        <div className="w-44 shrink-0 space-y-0.5">
          {settingsTabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                ${tab===t.id
                  ?'bg-blue-700 text-white shadow-sm'
                  :'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700'}`}>
              <Icon d={t.icon} size={14}/>{t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">

          {/* ── Appearance ── */}
          {tab==='appearance'&&(
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Choose your preferred theme for ProjectHub.</p>
              </div>

              {/* Visual theme selector — ONLY control */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Theme</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Light theme card */}
                  <button onClick={()=>handleThemeChange(false)}
                    className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200
                      ${!darkMode
                        ?'border-blue-600 shadow-md shadow-blue-100'
                        :'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>
                    {/* Preview mockup */}
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-slate-200"/>
                        <div className="h-1.5 w-16 rounded bg-slate-200"/>
                        <div className="ml-auto h-1.5 w-8 rounded bg-blue-200"/>
                      </div>
                      <div className="flex gap-2 p-2">
                        <div className="w-8 space-y-1">
                          <div className="h-1.5 rounded bg-blue-100"/>
                          <div className="h-1.5 rounded bg-slate-100"/>
                          <div className="h-1.5 rounded bg-slate-100"/>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-6 rounded-lg bg-blue-100"/>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-4 rounded bg-slate-100"/>
                            <div className="h-4 rounded bg-slate-100"/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Light</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Clean and bright</p>
                      </div>
                      {!darkMode&&(
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                          <Icon d={IC.check} size={11}/>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dark theme card */}
                  <button onClick={()=>handleThemeChange(true)}
                    className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200
                      ${darkMode
                        ?'border-blue-600 shadow-md shadow-blue-900/30'
                        :'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>
                    {/* Preview mockup */}
                    <div className="mb-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-700 bg-slate-800 px-3 py-2">
                        <div className="h-2 w-2 rounded-full bg-slate-600"/>
                        <div className="h-1.5 w-16 rounded bg-slate-600"/>
                        <div className="ml-auto h-1.5 w-8 rounded bg-blue-700"/>
                      </div>
                      <div className="flex gap-2 p-2">
                        <div className="w-8 space-y-1">
                          <div className="h-1.5 rounded bg-blue-900"/>
                          <div className="h-1.5 rounded bg-slate-700"/>
                          <div className="h-1.5 rounded bg-slate-700"/>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-6 rounded-lg bg-blue-900"/>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="h-4 rounded bg-slate-700"/>
                            <div className="h-4 rounded bg-slate-700"/>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Easy on the eyes</p>
                      </div>
                      {darkMode&&(
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                          <Icon d={IC.check} size={11}/>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Current theme indicator */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                <Icon d={darkMode?IC.moon:IC.sun} size={14}/>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Currently using <span className="font-semibold">{darkMode?'Dark':'Light'}</span> mode
                </p>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab==='notifications'&&(
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <h3 className="mb-0.5 font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
              <p className="mb-5 text-xs text-slate-400 dark:text-slate-500">Choose which notifications you want to receive.</p>
              <Toggle value={msgNotifs} onChange={setMsgNotifs} label="Message Notifications" desc="Get notified when someone sends you a message"/>
              <Toggle value={internNotifs} onChange={setInternNotifs} label="Internship Alerts" desc="Updates on applications and new listings"/>
              <Toggle value={collabNotifs} onChange={setCollabNotifs} label="Collaboration Invites" desc="Project invitations and team requests"/>
            </div>
          )}

          {/* ── Wellness ── */}
          {tab==='wellness'&&(
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Wellness & Focus</h3>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Tools to help you stay calm and focused.</p>
              </div>
              <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Icon d={IC.zap} size={24}/>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">5-Second Cooldown</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Feeling overwhelmed? A calming overlay will guide you through a quick breathing reset.
                  </p>
                </div>
                <button onClick={startCooldown}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all">
                  <Icon d={IC.zap} size={14}/>Start Cooldown
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">💡 Wellness Tips</p>
                <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>• Take short breaks every 25 minutes (Pomodoro method)</li>
                  <li>• Stay hydrated — keep water nearby while studying</li>
                  <li>• Use the schedule to avoid last-minute deadline stress</li>
                  <li>• Reach out to collaborators early on projects</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Account ── */}
          {tab==='account'&&(
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Account Settings</h3>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Manage your account security and visibility.</p>
              </div>
              <Toggle value={profilePublic} onChange={setProfilePublic} label="Public Profile" desc="Allow other students to view your portfolio"/>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Account Info</p>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Email</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{rawUser.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Role</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">Student</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">University</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">GUC</span>
                  </div>
                </div>
                <div className="rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</p>
                  <p className="text-xs text-red-500 dark:text-red-500">To reset your account data, clear browser localStorage for this site.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════════════════
// LEARNING HUB — seed data helpers
// ═══════════════════════════════════════════════════════════════════════════
const LH_COLOR_MAP = {
  blue:   { bg:'bg-blue-50 dark:bg-blue-950/40',     text:'text-blue-700 dark:text-blue-300',     bar:'bg-blue-600',   dot:'bg-blue-500',   border:'border-blue-200 dark:border-blue-800',     icon:'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' },
  purple: { bg:'bg-purple-50 dark:bg-purple-950/40', text:'text-purple-700 dark:text-purple-300', bar:'bg-purple-600', dot:'bg-purple-500', border:'border-purple-200 dark:border-purple-800', icon:'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300' },
  green:  { bg:'bg-green-50 dark:bg-green-950/40',   text:'text-green-700 dark:text-green-300',   bar:'bg-green-600',  dot:'bg-green-500',  border:'border-green-200 dark:border-green-800',   icon:'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300' },
  amber:  { bg:'bg-amber-50 dark:bg-amber-950/40',   text:'text-amber-700 dark:text-amber-300',   bar:'bg-amber-500',  dot:'bg-amber-500',  border:'border-amber-200 dark:border-amber-800',   icon:'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' },
  rose:   { bg:'bg-rose-50 dark:bg-rose-950/40',     text:'text-rose-700 dark:text-rose-300',     bar:'bg-rose-600',   dot:'bg-rose-500',   border:'border-rose-200 dark:border-rose-800',     icon:'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300' },
}

const LH_COURSES = [
  {
    id: 'csen401', code: 'CSEN 401', name: 'Computer Programming Lab',
    instructor: 'Dr. Sherif Aly', description: 'Advanced programming techniques using modern languages and tools. Topics include data structures, algorithms, and software design patterns.',
    color: 'blue', progress: 72, totalMaterials: 38,
  },
  {
    id: 'csen501', code: 'CSEN 501', name: 'Software Engineering',
    instructor: 'Dr. Mervat Abuelkheir', description: 'Software development lifecycle, requirements engineering, design patterns, testing methodologies, and project management.',
    color: 'purple', progress: 55, totalMaterials: 44,
  },
  {
    id: 'csen603', code: 'CSEN 603', name: 'Computer Networks',
    instructor: 'Dr. Nora Samir', description: 'Network architectures, protocols, TCP/IP stack, routing algorithms, network security fundamentals, and wireless communications.',
    color: 'green', progress: 40, totalMaterials: 31,
  },
  {
    id: 'dmet501', code: 'DMET 501', name: 'Database Systems',
    instructor: 'Dr. Karim Fathy', description: 'Relational and non-relational databases, SQL, normalization theory, query optimization, and modern NoSQL approaches.',
    color: 'amber', progress: 88, totalMaterials: 27,
  },
  {
    id: 'csen701', code: 'CSEN 701', name: 'Artificial Intelligence',
    instructor: 'Dr. Ahmed Hassan', description: 'Foundations of AI including search algorithms, machine learning, neural networks, natural language processing, and computer vision.',
    color: 'rose', progress: 30, totalMaterials: 52,
  },
]

function buildCourseData(courseId) {
  const seed = courseId.charCodeAt(0) + courseId.charCodeAt(courseId.length - 1)
  const rng = (n, offset = 0) => ((seed * (n + 1) * 31) % 89) + offset

  const weeks = ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6','Week 7','Week 8']
  const instructors = {
    csen401: 'Dr. Sherif Aly', csen501: 'Dr. Mervat Abuelkheir',
    csen603: 'Dr. Nora Samir', dmet501: 'Dr. Karim Fathy', csen701: 'Dr. Ahmed Hassan',
  }
  const inst = instructors[courseId] || 'Dr. GUC Instructor'

  const lectures = weeks.slice(0, 6).map((w, i) => ({
    id: `lec_${courseId}_${i}`, type: 'lecture', title: [
      'Introduction & Course Overview','Core Concepts & Fundamentals','Deep Dive: Part I',
      'Deep Dive: Part II','Advanced Topics','Case Studies & Applications',
    ][i],
    week: w, uploadDate: `2026-0${Math.min(i + 2, 9)}-${String(10 + i * 3).padStart(2,'0')}`,
    instructor: inst, courseId,
  }))

  const tutorials = weeks.slice(0, 4).map((w, i) => ({
    id: `tut_${courseId}_${i}`, type: 'tutorial', title: ['Tutorial 1: Basics','Tutorial 2: Problem Solving','Tutorial 3: Practice Problems','Tutorial 4: Exam Prep'][i],
    week: w, uploadDate: `2026-0${Math.min(i + 2, 9)}-${String(14 + i * 4).padStart(2,'0')}`,
    instructor: inst, courseId,
  }))

  const now = new Date()
  const assignmentDefs = [
    { title: 'Assignment 1: Foundations', daysOffset: -20, status: 'submitted', grade: 88 + (seed % 8), max: 100 },
    { title: 'Assignment 2: Core Implementation', daysOffset: -7, status: 'submitted', grade: 79 + (seed % 12), max: 100 },
    { title: 'Assignment 3: Advanced Challenge', daysOffset: 5, status: 'in-progress', grade: null, max: 100 },
    { title: 'Assignment 4: Final Project', daysOffset: 18, status: 'not-started', grade: null, max: 100 },
  ]
  const assignments = assignmentDefs.map((a, i) => {
    const due = new Date(now); due.setDate(now.getDate() + a.daysOffset)
    const diffDays = Math.ceil((due - now) / 86400000)
    const isLate = diffDays < 0 && a.status !== 'submitted'
    return {
      id: `asgn_${courseId}_${i}`, title: a.title,
      dueDate: due.toISOString().slice(0, 10),
      status: isLate ? 'late' : a.status,
      grade: a.grade, max: a.max,
    }
  })

 const resources = [
    { id: `res_${courseId}_0`, title: 'Course Textbook (PDF)', type: 'pdf',   subtype: 'pdf',   size: '12.4 MB', uploadDate: '2026-02-01', courseId },
    { id: `res_${courseId}_1`, title: 'Lab Manual',            type: 'pdf',   subtype: 'pdf',   size: '3.2 MB',  uploadDate: '2026-02-05', courseId },
    { id: `res_${courseId}_2`, title: 'Lecture Slides Pack',   type: 'zip',   subtype: 'zip',   size: '28.7 MB', uploadDate: '2026-03-10', courseId },
    { id: `res_${courseId}_3`, title: 'Grade Sheet Template',  type: 'excel', subtype: 'excel', size: '0.4 MB',  uploadDate: '2026-02-08', courseId },
    { id: `res_${courseId}_4`, title: 'Project Specification', type: 'word',  subtype: 'word',  size: '1.1 MB',  uploadDate: '2026-04-01', courseId },
    { id: `res_${courseId}_5`, title: 'Reference Documentation', type: 'link', subtype: 'link', url: 'https://docs.example.com', uploadDate: '2026-02-15', courseId },
  ]

  const recordings = lectures.slice(0, 5).map((l, i) => ({
    id: `rec_${courseId}_${i}`, type: 'recording', title: l.title + ' (Recording)',
    duration: `${40 + rng(i, 10)}:${String(rng(i + 7, 5)).padStart(2,'0')}`,
    uploadDate: l.uploadDate, url: 'https://youtu.be/dQw4w9WgXcQ', courseId,
  }))

  const quizGrades = [
    { id: `q_${courseId}_0`, title: 'Quiz 1', grade: 14 + (seed % 6), max: 20, date: '2026-03-05' },
    { id: `q_${courseId}_1`, title: 'Quiz 2', grade: 17 + (seed % 3), max: 20, date: '2026-04-10' },
    { id: `q_${courseId}_2`, title: 'Midterm Exam', grade: 68 + (seed % 15), max: 100, date: '2026-04-20' },
  ]
  const projectGrade = { id: `pg_${courseId}_0`, title: 'Course Project', grade: 82 + (seed % 10), max: 100, date: '2026-05-15' }

  const announcements = [
    { id: `ann_${courseId}_0`, title: 'Office Hours Updated', message: 'Office hours for this week have been moved to Thursday 3–5 PM.', date: '2026-05-28', type: 'info' },
    { id: `ann_${courseId}_1`, title: 'Assignment 3 Extended', message: 'Due to the midterm, Assignment 3 deadline has been extended by 3 days.', date: '2026-05-25', type: 'warning' },
    { id: `ann_${courseId}_2`, title: 'New Tutorial Uploaded', message: 'Tutorial 4 covering exam preparation topics is now available.', date: '2026-05-22', type: 'success' },
  ]

  return { lectures, tutorials, assignments, resources, recordings, quizGrades, projectGrade, announcements }
}

// ── Phase 4–7 Side Widgets ────────────────────────────────────────────────────

function LHRecentMaterials({ recentlyViewed }) {
  const typeIcon = { lecture:IC.bookOpen, tutorial:IC.book, resource:IC.paperclip, recording:IC.video, assignment:IC.task }
  const typeBg   = {
    lecture:   'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    tutorial:  'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    resource:  'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
    recording: 'bg-slate-800 dark:bg-slate-700 text-white',
    assignment:'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  }
  const recent = (recentlyViewed || []).slice(0, 6)
  if (recent.length === 0) return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col items-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"><Icon d={IC.history} size={20}/></div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No recently viewed items</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">View lectures or resources to track them here</p>
    </div>
  )
  const course = id => LH_COURSES.find(c => c.id === id)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <Icon d={IC.history} size={14}/><h3 className="text-sm font-semibold">Recently Viewed</h3>
      </div>
      <ul className="space-y-2">
        {recent.map((entry, i) => {
          const c = course(entry.courseId)
          const cm = LH_COLOR_MAP[c?.color || 'blue']
          return (
            <li key={entry.id + '_' + i} className="flex items-center gap-2.5 group">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeBg[entry.type] || typeBg.lecture}`}>
                <Icon d={typeIcon[entry.type] || IC.bookOpen} size={12}/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{entry.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {c && <span className={`text-[10px] font-semibold ${cm.text}`}>{c.code}</span>}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{entry.viewedAt}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LHBookmarksPanel({ bookmarks, allCoursesData }) {
  const allItems = []
  LH_COURSES.forEach(c => {
    const d = allCoursesData[c.id]
    if (!d) return
    ;[...d.lectures, ...d.tutorials, ...d.resources, ...d.recordings].forEach(item => {
      if (bookmarks[item.id]) allItems.push({ ...item, courseCode:c.code, courseColor:c.color })
    })
  })
  const typeIcon = { lecture:IC.bookOpen, tutorial:IC.book, resource:IC.paperclip, recording:IC.video }
  const typeBg   = {
    lecture:  'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    tutorial: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    resource: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
    recording:'bg-slate-800 dark:bg-slate-700 text-white',
  }
  if (allItems.length === 0) return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col items-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500"><Icon d={IC.bookmark} size={20}/></div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No bookmarks yet</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">Star any lecture, tutorial, or resource</p>
    </div>
  )
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200"><Icon d={IC.bookmark} size={14}/><h3 className="text-sm font-semibold">Bookmarks</h3></div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{allItems.length} saved</span>
      </div>
      <div className="space-y-2">
        {allItems.map(item => {
          const cm = LH_COLOR_MAP[item.courseColor || 'blue']
          return (
            <div key={item.id} className="flex items-center gap-2.5 group">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeBg[item.type] || typeBg.lecture}`}>
                <Icon d={typeIcon[item.type] || IC.bookOpen} size={12}/>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold ${cm.text}`}>{item.courseCode}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{item.type}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LHAllDeadlines({ allCoursesData, submissions }) {
  const now = new Date()
  const items = []
  LH_COURSES.forEach(c => {
    const d = allCoursesData[c.id]
    if (!d) return
    d.assignments.forEach(a => {
      const eff = submissions[a.id] === 'submitted' ? 'submitted' : a.status
      if (eff === 'submitted') return
      const diff = Math.ceil((new Date(a.dueDate) - now) / 86400000)
      items.push({ ...a, courseCode:c.code, courseColor:c.color, diff })
    })
  })
  items.sort((a, b) => a.diff - b.diff)
  if (items.length === 0) return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col items-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40 text-green-500"><Icon d={IC.check} size={20}/></div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">All caught up!</p>
    </div>
  )
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200"><Icon d={IC.alertCircle} size={14}/><h3 className="text-sm font-semibold">All Deadlines</h3></div>
      <div className="space-y-2">
        {items.slice(0, 8).map(a => {
          const cm = LH_COLOR_MAP[a.courseColor || 'blue']
          const urg = a.diff < 0 ? 'red' : a.diff <= 3 ? 'red' : a.diff <= 7 ? 'yellow' : 'slate'
          return (
            <div key={a.id} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${a.diff<=3?'bg-red-50 dark:bg-red-950/30':a.diff<=7?'bg-amber-50 dark:bg-amber-950/30':'bg-slate-50 dark:bg-slate-700/30'}`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${urg==='red'?'bg-red-500':urg==='yellow'?'bg-amber-400':'bg-slate-300 dark:bg-slate-600'}`}/>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{a.title}</p>
                <span className={`text-[10px] font-semibold ${cm.text}`}>{a.courseCode}</span>
              </div>
              <Badge color={urg==='red'?'red':urg==='yellow'?'yellow':'slate'}>{a.diff<0?'Late':`${a.diff}d`}</Badge>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LHCourseProgress({ allCoursesData }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200"><Icon d={IC.layers} size={14}/><h3 className="text-sm font-semibold">Course Progress</h3></div>
      <div className="space-y-3">
        {LH_COURSES.map(c => {
          const cm = LH_COLOR_MAP[c.color || 'blue']
          const d = allCoursesData[c.id]
          const total = d ? (d.lectures.length + d.tutorials.length + d.assignments.length + d.resources.length + d.recordings.length) : c.totalMaterials
          const done  = Math.round(total * (c.progress / 100))
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cm.dot}`}/>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{c.code}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{done}/{total}</span>
                  <span className={`text-xs font-bold ${cm.text}`}>{c.progress}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${cm.bar}`} style={{width:`${c.progress}%`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Phase 5: Global Search ─────────────────────────────────────────────────────

function LHGlobalSearch({ allCoursesData, onSelectCourse, onSelectTab }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const typeIcon = { lecture:IC.bookOpen, tutorial:IC.book, resource:IC.paperclip, recording:IC.video, assignment:IC.task }
  const typeTab  = { lecture:'lectures', tutorial:'tutorials', resource:'resources', recording:'recordings', assignment:'assignments' }

  const results = q.trim().length < 2 ? [] : (() => {
    const hits = []
    LH_COURSES.forEach(c => {
      const d = allCoursesData[c.id]
      if (!d) return
      const push = arr => arr.forEach(item => {
        if (item.title.toLowerCase().includes(q.toLowerCase()))
          hits.push({ ...item, courseCode:c.code, courseColor:c.color, courseId:c.id })
      })
      push(d.lectures); push(d.tutorials); push(d.resources); push(d.recordings); push(d.assignments)
    })
    return hits.slice(0, 8)
  })()

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14}/></span>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          placeholder="Search across all courses…"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"/>
        {q && (
          <button onClick={() => { setQ(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <Icon d={IC.x} size={14}/>
          </button>
        )}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full z-30 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          {results.length === 0
            ? <div className="px-4 py-5 text-center text-sm text-slate-400 dark:text-slate-500">No results for "{q}"</div>
            : <ul>
              {results.map((item, i) => {
                const cm = LH_COLOR_MAP[item.courseColor || 'blue']
                const itemType = item.type || 'lecture'
                return (
                  <li key={item.id + '_s_' + i}>
                    <button onClick={() => { onSelectCourse(item.courseId); onSelectTab(typeTab[itemType] || 'lectures'); setOpen(false); setQ('') }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        <Icon d={typeIcon[itemType] || IC.bookOpen} size={13}/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold ${cm.text}`}>{item.courseCode}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{itemType}</span>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          }
        </div>
      )}
    </div>
  )
}

// ── Phase 6: LMS Folder View ──────────────────────────────────────────────────

function LHFolderView({ data, bookmarks, onBookmark, submissions, onSubmit, onView }) {
  const [openFolders, setOpenFolders] = useState({ lectures:true, tutorials:false, assignments:false, resources:false, recordings:false })
  const toggle = key => setOpenFolders(prev => ({ ...prev, [key]: !prev[key] }))

  const folders = [
    {
      key: 'lectures', label: 'Lectures', icon: IC.bookOpen,
      color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      count: data.lectures.length, items: data.lectures,
    },
    {
      key: 'tutorials', label: 'Tutorials', icon: IC.book,
      color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
      count: data.tutorials.length, items: data.tutorials,
    },
    {
      key: 'assignments', label: 'Assignments', icon: IC.task,
      color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
      count: data.assignments.length, items: data.assignments,
    },
    {
      key: 'resources', label: 'Resources', icon: IC.paperclip,
      color: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      count: data.resources.length, items: data.resources,
    },
    {
      key: 'recordings', label: 'Recordings', icon: IC.video,
      color: 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300',
      count: data.recordings.length, items: data.recordings,
    },
  ]

  const statusCfg = { submitted:{color:'green',icon:IC.check}, 'in-progress':{color:'blue',icon:IC.edit}, 'not-started':{color:'slate',icon:IC.clock}, late:{color:'red',icon:IC.alertCircle} }
  const resCfg = { pdf:{icon:IC.filePdf,bg:'text-red-600 dark:text-red-400'}, word:{icon:IC.fileText,bg:'text-blue-600 dark:text-blue-400'}, excel:{icon:IC.fileSpreadsheet,bg:'text-green-600 dark:text-green-400'}, zip:{icon:IC.archive,bg:'text-amber-600 dark:text-amber-400'}, link:{icon:IC.externalLink,bg:'text-purple-600 dark:text-purple-400'} }

  return (
    <div className="space-y-2">
      {folders.map(f => (
        <div key={f.key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <button onClick={() => toggle(f.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${f.color}`}>
              <Icon d={f.icon} size={15}/>
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{f.label}</span>
            <Badge color="slate">{f.count}</Badge>
            <Icon d={openFolders[f.key] ? IC.chevronsDown : IC.chevronsRight} size={14}/>
          </button>

          {openFolders[f.key] && (
            <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700/50">
              {f.items.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No {f.label.toLowerCase()} yet.</p>
              )}

              {/* Lectures & Tutorials */}
              {(f.key === 'lectures' || f.key === 'tutorials') && f.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                  <Icon d={f.icon} size={14}/>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge color="blue">{item.week}</Badge>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{item.uploadDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onBookmark(item.id)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${bookmarks[item.id]?'bg-amber-50 dark:bg-amber-950/40 text-amber-500':'text-slate-400 dark:text-slate-500 hover:text-amber-500'}`}>
                      <Icon d={bookmarks[item.id]?IC.bookmarkFilled:IC.bookmark} size={13}/>
                    </button>
                    <Btn size="sm" onClick={() => onView && onView(item)}><Icon d={IC.eye} size={12}/>View</Btn>
                  </div>
                </div>
              ))}

              {/* Assignments */}
              {f.key === 'assignments' && f.items.map(a => {
                const eff = submissions[a.id] === 'submitted' ? 'submitted' : a.status
                const sc = statusCfg[eff] || statusCfg['not-started']
                const diff = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000)
                return (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <Icon d={sc.icon} size={14}/>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color={sc.color}>{eff === 'submitted' ? 'Submitted' : eff === 'in-progress' ? 'In Progress' : eff === 'late' ? 'Late' : 'Not Started'}</Badge>
                        <span className={`text-xs ${diff<0?'text-red-500 dark:text-red-400':diff<=3?'text-amber-600 dark:text-amber-400':'text-slate-400 dark:text-slate-500'}`}>
                          Due {a.dueDate}
                        </span>
                      </div>
                    </div>
                    {eff !== 'submitted' && <Btn size="sm" variant="success" onClick={() => onSubmit(a.id)}><Icon d={IC.upload} size={12}/>Submit</Btn>}
                    {eff === 'submitted' && <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><Icon d={IC.check} size={11}/>Done</span>}
                  </div>
                )
              })}

              {/* Resources */}
              {f.key === 'resources' && f.items.map(r => {
                const t = r.subtype || r.type || 'link'
                const rc = resCfg[t] || resCfg.link
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                    <span className={rc.bg}><Icon d={rc.icon} size={14}/></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge color={t==='pdf'?'red':t==='link'?'purple':t==='zip'?'yellow':t==='excel'?'green':'blue'}>{t.toUpperCase()}</Badge>
                        {r.size && <span className="text-xs text-slate-400 dark:text-slate-500">{r.size}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => onBookmark(r.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${bookmarks[r.id]?'bg-amber-50 dark:bg-amber-950/40 text-amber-500':'text-slate-400 dark:text-slate-500 hover:text-amber-500'}`}>
                        <Icon d={bookmarks[r.id]?IC.bookmarkFilled:IC.bookmark} size={13}/>
                      </button>
                      {t === 'link'
                        ? <a href={r.url||'#'} target="_blank" rel="noreferrer"><Btn size="sm"><Icon d={IC.externalLink} size={12}/>Open</Btn></a>
                        : <Btn size="sm" variant="secondary"><Icon d={IC.download} size={12}/>Get</Btn>
                      }
                    </div>
                  </div>
                )
              })}

              {/* Recordings */}
              {f.key === 'recordings' && f.items.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-700 text-white">
                    <Icon d={IC.playCircle} size={13}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{r.title}</p>
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"><Icon d={IC.clock} size={10}/>{r.duration}</span>
                  </div>
                  <a href={r.url} target="_blank" rel="noreferrer"><Btn size="sm"><Icon d={IC.playCircle} size={12}/>Watch</Btn></a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Learning Hub ─────────────────────────────────────────────────────────

function LearningHubSection({ profile }) {
  const [selectedCourseId, setSelectedCourseId] = useState(LH_COURSES[0].id)
  const [activeTab, setActiveTab]   = useState('overview')
  const [sidePanel, setSidePanel]   = useState('progress')
  const [bookmarks, setBookmarks]   = useLS('lh_bookmarks_' + profile.email, {})
  const [submissions, setSubmissions] = useLS('lh_submissions_' + profile.email, {})
  const [recentlyViewed, setRecentlyViewed] = useLS('lh_recent_' + profile.email, [])

  const allCoursesData = {}
  LH_COURSES.forEach(c => { allCoursesData[c.id] = buildCourseData(c.id) })

  const course = LH_COURSES.find(c => c.id === selectedCourseId) || LH_COURSES[0]
  const data   = allCoursesData[selectedCourseId]
  const cc     = LH_COLOR_MAP[course.color] || LH_COLOR_MAP.blue

  const toggleBookmark   = itemId => setBookmarks(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  const submitAssignment = aId    => setSubmissions(prev => ({ ...prev, [aId]: 'submitted' }))

  const trackView = item => {
    const now = new Date()
    const timeStr = `${now.toLocaleDateString(undefined,{month:'short',day:'numeric'})} ${now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}`
    setRecentlyViewed(prev => {
      const filtered = (prev||[]).filter(e => e.id !== item.id)
      return [{ ...item, viewedAt:timeStr, courseId:item.courseId||selectedCourseId }, ...filtered].slice(0, 20)
    })
  }

  const TABS = [
    { id:'overview',    label:'Overview',    icon:IC.home },
    { id:'lectures',    label:'Lectures',    icon:IC.bookOpen },
    { id:'tutorials',   label:'Tutorials',   icon:IC.book },
    { id:'assignments', label:'Assignments', icon:IC.task },
    { id:'resources',   label:'Resources',   icon:IC.paperclip },
    { id:'recordings',  label:'Recordings',  icon:IC.video },
    { id:'grades',      label:'Grades',      icon:IC.trophy },
    { id:'folders',     label:'Folders',     icon:IC.folder2 },
  ]

  const SIDE_TABS = [
    { id:'progress',  label:'Progress',  icon:IC.layers },
    { id:'deadlines', label:'Deadlines', icon:IC.alertCircle },
    { id:'bookmarks', label:'Saved',     icon:IC.bookmark },
    { id:'recent',    label:'Recent',    icon:IC.history },
  ]

  const bmCount = Object.values(bookmarks).filter(Boolean).length
  const pendingCount = LH_COURSES.reduce((sum, c) => {
    const d = allCoursesData[c.id]
    if (!d) return sum
    return sum + d.assignments.filter(a => {
      const eff = submissions[a.id] === 'submitted' ? 'submitted' : a.status
      return eff !== 'submitted'
    }).length
  }, 0)

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon d={IC.bookOpen} size={20}/>Learning Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All your courses, materials, and grades in one place</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && <Badge color="red">{pendingCount} pending</Badge>}
          {bmCount > 0 && <Badge color="yellow">{bmCount} saved</Badge>}
        </div>
      </div>

      {/* Global search — Phase 5 */}
      <LHGlobalSearch
        allCoursesData={allCoursesData}
        onSelectCourse={id => { setSelectedCourseId(id); setActiveTab('overview') }}
        onSelectTab={setActiveTab}
      />

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">

        {/* ── Left: Course Selector ── */}
        <aside className="w-full xl:w-52 shrink-0">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-700/30">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">My Courses</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {LH_COURSES.map(c => {
                const cm = LH_COLOR_MAP[c.color] || LH_COLOR_MAP.blue
                const isActive = c.id === selectedCourseId
                return (
                  <button key={c.id} onClick={() => { setSelectedCourseId(c.id); setActiveTab('overview') }}
                    className={`group w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${isActive ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:translate-x-0.5'}`}>
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-white' : cm.dot}`}/>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{c.code}</p>
                      <p className={`text-[11px] leading-snug mt-0.5 truncate ${isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{c.name}</p>
                      <div className={`mt-1.5 h-1 w-full rounded-full overflow-hidden ${isActive ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-600'}`}>
                        <div className={`h-1 rounded-full transition-all duration-500 ${isActive ? 'bg-white' : cm.bar}`} style={{width:`${c.progress}%`}}/>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* ── Center: Course Workspace ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Course header */}
          <div className={`rounded-xl border ${cc.border} ${cc.bg} p-5`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cc.icon}`}>{course.code}</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">{course.description}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2 min-w-[110px]">
                <p className={`text-3xl font-bold ${cc.text}`}>{course.progress}%</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">complete</p>
                <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-700 ${cc.bar}`} style={{width:`${course.progress}%`}}/>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{course.totalMaterials} materials</p>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} title={t.label} aria-label={t.label}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${activeTab===t.id?'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <Icon d={t.icon} size={13}/><span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview'    && <LHOverviewTab course={course} data={data} cc={cc}/>}
          {activeTab === 'lectures'    && <LHMaterialsTab items={data.lectures}  kind="Lecture"  bookmarks={bookmarks} onBookmark={toggleBookmark} onView={trackView}/>}
          {activeTab === 'tutorials'   && <LHMaterialsTab items={data.tutorials} kind="Tutorial" bookmarks={bookmarks} onBookmark={toggleBookmark} onView={trackView}/>}
          {activeTab === 'assignments' && <LHAssignmentsTab assignments={data.assignments} submissions={submissions} onSubmit={submitAssignment}/>}
          {activeTab === 'resources'   && <LHResourcesTab resources={data.resources} bookmarks={bookmarks} onBookmark={toggleBookmark}/>}
          {activeTab === 'recordings'  && <LHRecordingsTab recordings={data.recordings}/>}
          {activeTab === 'grades'      && <LHGradesTab assignments={data.assignments} quizzes={data.quizGrades} project={data.projectGrade} submissions={submissions} course={course} cc={cc}/>}
          {activeTab === 'folders'     && <LHFolderView data={data} bookmarks={bookmarks} onBookmark={toggleBookmark} submissions={submissions} onSubmit={submitAssignment} onView={trackView}/>}
        </div>

        {/* ── Right: Side Widgets ── Phase 4 */}
        <aside className="w-full xl:w-60 shrink-0 space-y-3">
          {/* Side panel tab strip */}
          <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {SIDE_TABS.map(t => (
              <button key={t.id} onClick={() => setSidePanel(t.id)} title={t.label} aria-label={t.label}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${sidePanel===t.id?'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm':'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                <Icon d={t.icon} size={12}/>
              </button>
            ))}
          </div>
          {sidePanel === 'progress'  && <LHCourseProgress allCoursesData={allCoursesData}/>}
          {sidePanel === 'deadlines' && <LHAllDeadlines allCoursesData={allCoursesData} submissions={submissions}/>}
          {sidePanel === 'bookmarks' && <LHBookmarksPanel bookmarks={bookmarks} allCoursesData={allCoursesData}/>}
          {sidePanel === 'recent'    && <LHRecentMaterials recentlyViewed={recentlyViewed}/>}
        </aside>
      </div>
    </div>
  )
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function LHOverviewTab({ course, data, cc }) {
  const instructorAnnouncements = LS.get('guc_instructor_announcements', [])
    .filter(a => !a.courseCode || a.courseCode === course.code)
    .map(a => ({ ...a, type: a.type || 'info' }))
  const mergedAnnouncements = [
    ...instructorAnnouncements,
    ...(data.announcements || []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))
  const { lectures, tutorials, assignments, resources } = data
  const announcements = mergedAnnouncements
  const pending = assignments.filter(a => a.status === 'not-started' || a.status === 'in-progress')
  const annTypeStyle = {
    info:    { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',   text: 'text-blue-700 dark:text-blue-300',   icon: IC.bell },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: IC.alertCircle },
    success: { bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', icon: IC.check },
  }
  const statCards = [
    { label: 'Lectures',    value: lectures.length,   icon: IC.bookOpen,  color: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Tutorials',   value: tutorials.length,  icon: IC.book,      color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Assignments', value: assignments.length,icon: IC.task,      color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Resources',   value: resources.length,  icon: IC.paperclip, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
  ]
  return (
    <div className="space-y-5">
      {/* Stat mini cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg} transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm`}>
            <div className="flex items-center justify-between mb-1"><Icon d={s.icon} size={14} /></div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Icon d={IC.megaphone} size={15} />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Announcements</h3>
        </div>
        <div className="space-y-2.5">
          {announcements.map(a => {
            const s = annTypeStyle[a.type] || annTypeStyle.info
            return (
              <div key={a.id} className={`rounded-lg border px-4 py-3 ${s.bg}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon d={s.icon} size={13} />
                    <p className={`text-sm font-semibold ${s.text}`}>{a.title}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{a.date}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{a.message}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent uploads + Upcoming deadlines */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Recent Uploads</h3>
          <ul className="space-y-2.5">
            {[...data.lectures.slice(-2), ...data.tutorials.slice(-1)].map(item => (
              <li key={item.id} className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Icon d={IC.bookOpen} size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.week} · {item.uploadDate}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
          {pending.length === 0
            ? <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No pending assignments 🎉</p>
            : <ul className="space-y-2.5">
              {pending.map(a => {
                const due = new Date(a.dueDate)
                const diff = Math.ceil((due - new Date()) / 86400000)
                const urgency = diff < 0 ? 'red' : diff <= 3 ? 'red' : diff <= 7 ? 'yellow' : 'slate'
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${urgency === 'red' ? 'bg-red-500' : urgency === 'yellow' ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Due {a.dueDate}</p>
                    </div>
                    <Badge color={urgency === 'red' ? 'red' : urgency === 'yellow' ? 'yellow' : 'slate'}>
                      {diff < 0 ? 'Overdue' : `${diff}d left`}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          }
        </Card>
      </div>
    </div>
  )
}

// ── Materials Tab (Lectures & Tutorials) ─────────────────────────────────────

function LHMaterialsTab({ items, kind, bookmarks, onBookmark, onView }) {
  const [search, setSearch] = useState('')
  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || (i.week||'').toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder={`Search ${kind.toLowerCase()}s…`} />
      {filtered.length === 0
        ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Icon d={kind === 'Lecture' ? IC.bookOpen : IC.book} size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No {kind.toLowerCase()}s found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{search ? 'Try a different search term' : `${kind}s will appear here when uploaded`}</p>
              </div>
            </div>
          </Card>
        )
        : (
          <div className="space-y-3">
            {filtered.map(item => (
              <Card key={item.id} className="group hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                      <Icon d={kind === 'Lecture' ? IC.bookOpen : IC.book} size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge color="blue">{item.week}</Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{item.uploadDate}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">· {item.instructor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onBookmark(item.id)} title={bookmarks[item.id] ? 'Remove bookmark' : 'Bookmark'}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${bookmarks[item.id] ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500'}`}>
                      <Icon d={bookmarks[item.id] ? IC.bookmarkFilled : IC.bookmark} size={14} />
                    </button>
                    <Btn size="sm" variant="secondary"><Icon d={IC.download} size={13} />Download</Btn>
                    <Btn size="sm" onClick={() => onView && onView(item)}><Icon d={IC.eye} size={13} />View</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ── Assignments Tab ───────────────────────────────────────────────────────────

function LHAssignmentsTab({ assignments, submissions, onSubmit }) {
  const statusConfig = {
    'submitted':   { label: 'Submitted',   color: 'green',  icon: IC.check },
    'in-progress': { label: 'In Progress', color: 'blue',   icon: IC.edit },
    'not-started': { label: 'Not Started', color: 'slate',  icon: IC.clock },
    'late':        { label: 'Late',        color: 'red',    icon: IC.alertCircle },
  }
  return (
    <div className="space-y-3">
      {assignments.length === 0
        ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Icon d={IC.task} size={24} />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No assignments yet</p>
            </div>
          </Card>
        )
        : assignments.map(a => {
          const effectiveStatus = submissions[a.id] === 'submitted' ? 'submitted' : a.status
          const sc = statusConfig[effectiveStatus] || statusConfig['not-started']
          const due = new Date(a.dueDate)
          const diff = Math.ceil((due - new Date()) / 86400000)
          const isSubmitted = effectiveStatus === 'submitted'
          return (
            <Card key={a.id} className={`group transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${effectiveStatus === 'late' ? 'border-red-200 dark:border-red-900' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSubmitted ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' : effectiveStatus === 'late' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Icon d={sc.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge color={sc.color}>{sc.label}</Badge>
                      <span className="text-xs text-slate-400 dark:text-slate-500">Due {a.dueDate}</span>
                      {!isSubmitted && (
                        <span className={`text-xs font-medium ${diff < 0 ? 'text-red-500 dark:text-red-400' : diff <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {diff < 0 ? `${Math.abs(diff)}d overdue` : `${diff}d remaining`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Btn size="sm" variant="secondary"><Icon d={IC.eye} size={13} />View</Btn>
                  {!isSubmitted && (
                    <Btn size="sm" variant="success" onClick={() => onSubmit(a.id)}>
                      <Icon d={IC.upload} size={13} />Submit
                    </Btn>
                  )}
                  {isSubmitted && <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-950/40 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300"><Icon d={IC.check} size={11} />Submitted</span>}
                </div>
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}

// ── Resources Tab ─────────────────────────────────────────────────────────────

function LHResourcesTab({ resources, bookmarks, onBookmark }) {
  const typeConfig = {
    pdf:   { icon: IC.filePdf,         label: 'PDF',   bg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
    word:  { icon: IC.fileText,        label: 'Word',  bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
    excel: { icon: IC.fileSpreadsheet, label: 'Excel', bg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' },
    zip:   { icon: IC.archive,         label: 'ZIP',   bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
    link:  { icon: IC.externalLink,    label: 'Link',  bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  }
  const getType = r => r.subtype || r.type || 'link'
  return (
    <div className="space-y-3">
      {resources.length === 0
        ? <Card><div className="flex flex-col items-center gap-3 py-8"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700"><Icon d={IC.paperclip} size={24}/></div><p className="text-sm font-medium text-slate-600 dark:text-slate-400">No resources uploaded yet</p></div></Card>
        : resources.map(r => {
          const t = getType(r)
          const tc = typeConfig[t] || typeConfig.link
          return (
            <Card key={r.id} className="group hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tc.bg}`}>
                    <Icon d={tc.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge color={t === 'pdf' ? 'red' : t === 'link' ? 'purple' : t === 'zip' ? 'yellow' : t === 'excel' ? 'green' : 'blue'}>{tc.label}</Badge>
                      {r.size && <span className="text-xs text-slate-400 dark:text-slate-500">{r.size}</span>}
                      <span className="text-xs text-slate-400 dark:text-slate-500">{r.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onBookmark(r.id)} title={bookmarks[r.id] ? 'Remove bookmark' : 'Bookmark'}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${bookmarks[r.id] ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500'}`}>
                    <Icon d={bookmarks[r.id] ? IC.bookmarkFilled : IC.bookmark} size={14} />
                  </button>
                  {t === 'link'
                    ? <a href={r.url || '#'} target="_blank" rel="noreferrer"><Btn size="sm"><Icon d={IC.externalLink} size={13} />Open</Btn></a>
                    : <><Btn size="sm" variant="secondary"><Icon d={IC.eye} size={13} />View</Btn><Btn size="sm"><Icon d={IC.download} size={13} />Download</Btn></>
                  }
                </div>
              </div>
            </Card>
          )
        })
      }
    </div>
  )
}

// ── Recordings Tab ────────────────────────────────────────────────────────────

function LHRecordingsTab({ recordings, bookmarks, onBookmark }) {
  return (
    <div className="space-y-3">
      {recordings.length === 0
        ? <Card><div className="flex flex-col items-center gap-3 py-8"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700"><Icon d={IC.video} size={24}/></div><p className="text-sm font-medium text-slate-600 dark:text-slate-400">No recordings available yet</p></div></Card>
        : recordings.map(r => (
          <Card key={r.id} className="group hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
                  <Icon d={IC.playCircle} size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{r.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                      <Icon d={IC.clock} size={11} />{r.duration}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{r.uploadDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onBookmark && (
                  <button onClick={() => onBookmark(r.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${bookmarks&&bookmarks[r.id]?'bg-amber-50 dark:bg-amber-950/40 text-amber-500':'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500'}`}>
                    <Icon d={bookmarks&&bookmarks[r.id]?IC.bookmarkFilled:IC.bookmark} size={14}/>
                  </button>
                )}
                <a href={r.url} target="_blank" rel="noreferrer">
                  <Btn size="sm"><Icon d={IC.playCircle} size={13} />Watch</Btn>
                </a>
                <a href={r.url} target="_blank" rel="noreferrer">
                  <Btn size="sm" variant="secondary"><Icon d={IC.externalLink} size={13} />Open Link</Btn>
                </a>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  )
}

// ── Grades Tab ────────────────────────────────────────────────────────────────

function LHGradesTab({ assignments, quizzes, project, submissions, course, cc }) {
  const submittedAssignments = assignments.filter(a => (submissions[a.id] === 'submitted' || a.status === 'submitted') && a.grade != null)
  const allGradedItems = [
    ...submittedAssignments.map(a => ({ ...a, category: 'assignment', pct: Math.round((a.grade / a.max) * 100) })),
    ...quizzes.map(q => ({ ...q, category: 'quiz', pct: Math.round((q.grade / q.max) * 100) })),
    { ...project, category: 'project', pct: Math.round((project.grade / project.max) * 100) },
  ]
  const courseAvg = allGradedItems.length > 0 ? Math.round(allGradedItems.reduce((s, i) => s + i.pct, 0) / allGradedItems.length) : 0
  const studentAvg = courseAvg - 3 + Math.floor(Math.random() * 6)

  const gradeColor = (pct) => pct >= 85 ? 'text-green-700 dark:text-green-400' : pct >= 70 ? 'text-blue-700 dark:text-blue-400' : pct >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
  const gradeBg    = (pct) => pct >= 85 ? 'bg-green-50 dark:bg-green-950/40' : pct >= 70 ? 'bg-blue-50 dark:bg-blue-950/40' : pct >= 50 ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-red-50 dark:bg-red-950/40'
  const gradeLetter = (pct) => pct >= 90 ? 'A+' : pct >= 85 ? 'A' : pct >= 80 ? 'A-' : pct >= 75 ? 'B+' : pct >= 70 ? 'B' : pct >= 65 ? 'B-' : pct >= 60 ? 'C+' : pct >= 55 ? 'C' : 'F'

  return (
    <div className="space-y-5">
      {/* Summary analytics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className={`rounded-xl p-4 ${gradeBg(courseAvg)} transition-all hover:-translate-y-0.5 hover:shadow-sm`}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Course Average</p>
          <p className={`text-3xl font-bold ${gradeColor(courseAvg)}`}>{courseAvg}%</p>
          <p className={`text-sm font-semibold mt-1 ${gradeColor(courseAvg)}`}>{gradeLetter(courseAvg)}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-700/40 transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Class Average</p>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{studentAvg}%</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{gradeLetter(studentAvg)}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/40 transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Graded Items</p>
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{allGradedItems.length}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">of {assignments.length + quizzes.length + 1} total</p>
        </div>
      </div>

      {/* Assignment Grades */}
      {submittedAssignments.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Assignment Grades</h3>
          <div className="space-y-3">
            {submittedAssignments.map(a => (
              <div key={a.id} className="flex items-center gap-3 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{a.title}</p>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-sm font-bold ${gradeColor(Math.round((a.grade / a.max) * 100))}`}>{a.grade}/{a.max}</span>
                      <span className={`text-xs font-semibold ${gradeColor(Math.round((a.grade / a.max) * 100))}`}>{Math.round((a.grade / a.max) * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${Math.round((a.grade / a.max) * 100) >= 85 ? 'bg-green-500' : Math.round((a.grade / a.max) * 100) >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${(a.grade / a.max) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quiz / Exam Grades */}
      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Quiz & Exam Grades</h3>
        <div className="space-y-3">
          {quizzes.map(q => (
            <div key={q.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{q.title}</p>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-sm font-bold ${gradeColor(Math.round((q.grade / q.max) * 100))}`}>{q.grade}/{q.max}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeBg(Math.round((q.grade / q.max) * 100))} ${gradeColor(Math.round((q.grade / q.max) * 100))}`}>{gradeLetter(Math.round((q.grade / q.max) * 100))}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${Math.round((q.grade / q.max) * 100) >= 85 ? 'bg-green-500' : Math.round((q.grade / q.max) * 100) >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${(q.grade / q.max) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{q.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Grade */}
      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Project Grade</h3>
        <div className={`rounded-xl p-4 ${gradeBg(project.pct || Math.round((project.grade / project.max) * 100))}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{project.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{project.date}</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${gradeColor(Math.round((project.grade / project.max) * 100))}`}>{project.grade}/{project.max}</p>
              <p className={`text-sm font-semibold ${gradeColor(Math.round((project.grade / project.max) * 100))}`}>{gradeLetter(Math.round((project.grade / project.max) * 100))} · {Math.round((project.grade / project.max) * 100)}%</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/50 dark:bg-slate-600/50 overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-700 ${Math.round((project.grade / project.max) * 100) >= 85 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${(project.grade / project.max) * 100}%` }} />
          </div>
        </div>
      </Card>
    </div>
  )
}

function ScheduleSection({ profile }) {
  const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday']
  const HOURS=['8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']
  const [events, setEvents]=useLS('student_schedule_'+profile.email,[])
  const [modal, setModal]=useState(false)
  const [form, setForm]=useState({title:'',day:'Sunday',time:'8:00',duration:1,type:'class',location:'',notes:''})
  const TYPES=['class','deadline','interview','meeting','reminder']
  const typeColor={
    class:'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    deadline:'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    interview:'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    meeting:'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    reminder:'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }
  const typeDot={
    class:'bg-blue-500',deadline:'bg-red-500',interview:'bg-purple-500',meeting:'bg-green-500',reminder:'bg-amber-500'
  }
  const save=()=>{
    if(!form.title.trim())return alert('Event title required.')
    setEvents(p=>[...p,{...form,id:Date.now().toString(),createdAt:new Date().toISOString()}])
    setForm({title:'',day:'Sunday',time:'8:00',duration:1,type:'class',location:'',notes:''})
    setModal(false)
  }
  const del=id=>setEvents(p=>p.filter(e=>e.id!==id))

  const todayName=DAYS[new Date().getDay()]||'Sunday'
  const todayEvents=events.filter(e=>e.day===todayName).sort((a,b)=>a.time.localeCompare(b.time))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Schedule</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Weekly timetable, deadlines, and upcoming events.</p>
        </div>
        <Btn onClick={()=>setModal(true)}><Icon d={IC.plus}/>Add Event</Btn>
      </div>

      {/* Today's agenda strip */}
      <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Today — {todayName}</p>
        {todayEvents.length===0
          ?<p className="text-sm text-slate-400 dark:text-slate-500">Nothing scheduled for today. Enjoy your free time! 🎉</p>
          :<div className="flex flex-wrap gap-2">
            {todayEvents.map(e=>(
              <div key={e.id} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${typeColor[e.type]}`}>
                <span>{e.time}</span>
                <span className="font-semibold">{e.title}</span>
                {e.location&&<span className="opacity-60">· {e.location}</span>}
              </div>
            ))}
          </div>
        }
      </div>

      {/* Weekly grid */}
     <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="w-16 py-3 px-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500">Time</th>
              {DAYS.map(d=>(
                <th key={d} className={`py-3 px-2 text-center text-xs font-semibold ${d===todayName?'text-blue-700 dark:text-blue-400':'text-slate-600 dark:text-slate-300'}`}>
                  {d.slice(0,3)}
                  {d===todayName&&<span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] text-white">Today</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
{HOURS.map(h=>(
              <tr key={h} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                <td className="py-2 px-3 text-xs text-slate-400 dark:text-slate-500 font-mono">{h}</td>
                {DAYS.map(d=>{
                  const ev=events.filter(e=>e.day===d&&e.time===h)
                  return (
                    <td key={d} className="py-1.5 px-2 text-center align-top">
                      {ev.map(e=>(
                        <div key={e.id}
                          className={`mb-1 rounded-lg border px-2 py-1 text-xs text-left cursor-default group relative ${typeColor[e.type]}`}>
                          <p className="font-semibold truncate">{e.title}</p>
                          {e.location&&<p className="opacity-60 truncate">{e.location}</p>}
                          <button onClick={()=>del(e.id)}
                            className="absolute right-1 top-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">
                            <Icon d={IC.x} size={10}/>
                          </button>
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upcoming list */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">All Upcoming Events</p>
        {events.length===0
          ?<Card><EmptyState message="No events yet. Add your classes, deadlines, and meetings."/></Card>
          :<div className="space-y-2">
            {[...events].sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day)||a.time.localeCompare(b.time)).map(e=>(
<div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 transition-colors hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${typeDot[e.type]}`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{e.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{e.day} · {e.time}{e.location&&` · ${e.location}`}</p>
                </div>
                <Badge color={e.type==='class'?'blue':e.type==='deadline'?'red':e.type==='interview'?'purple':e.type==='meeting'?'green':'yellow'}>
                  {e.type}
                </Badge>
                <button onClick={()=>del(e.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-colors">
                  <Icon d={IC.trash} size={13}/>
                </button>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Add event modal */}
      {modal&&(
        <Modal title="Add Schedule Event" onClose={()=>setModal(false)}>
          <div className="space-y-4">
            <Input label="Event Title *" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. CSEN 401 Lecture"/>
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Day" value={form.day} onChange={e=>setForm(p=>({...p,day:e.target.value}))}>
                {DAYS.map(d=><option key={d}>{d}</option>)}
              </Sel>
              <Sel label="Time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))}>
                {HOURS.map(h=><option key={h}>{h}</option>)}
              </Sel>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </Sel>
              <Input label="Duration (hours)" type="number" min={1} max={4} value={form.duration}
                onChange={e=>setForm(p=>({...p,duration:+e.target.value}))}/>
            </div>
            <Input label="Location (optional)" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} placeholder="e.g. Hall C3, Online"/>
            <Textarea label="Notes (optional)" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any extra details…"/>
          </div>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
            <Btn onClick={save}><Icon d={IC.check}/>Save Event</Btn>
            <Btn variant="secondary" onClick={()=>setModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function StudentDashboard() {
  const navigate=useNavigate()
  const rawUser=getCurrentUser()||{}
  useEffect(()=>{
    const cu=getCurrentUser()
    if(!cu||cu.role!=='student'){navigate('/login');return}
    if(cu.isActive===false){logoutUser();navigate('/login')}
  },[navigate])
  seedAcademicPlatformDemoData()
  const [tab, setTab]=useState('overview')
  const [sidebarOpen, setSidebar]=useState(false)
  const [profile, setProfileLS]=useLS('student_profile_'+rawUser.email,{firstName:rawUser.firstName||'',lastName:rawUser.lastName||'',email:rawUser.email,major:rawUser.major||'',linkedin:'',skills:[]})
  const [projects, setProjectsLS]=useLS('student_projects',[])
  const [notifications, setNotificationsLS]=useLS('student_notifs_'+rawUser.email,[])
  const [favProjects, setFavProjectsLS]=useLS('student_fav_projects_'+rawUser.email,[])
  const [favPortfolios, setFavPortfoliosLS]=useLS('student_fav_portfolios_'+rawUser.email,[])
  const setProfile=v=>setProfileLS(v)
  const setProjects=fn=>setProjectsLS(typeof fn==='function'?fn(projects):fn)
  const setNotifications=fn=>setNotificationsLS(typeof fn==='function'?fn(notifications):fn)

  // Listen for localStorage changes from other dashboards (instructor feedback, messages)
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e.key) return
      // Instructor wrote feedback or rated a project
      if (e.key === 'student_projects') {
        try {
          const fresh = JSON.parse(e.newValue || '[]')
          setProjectsLS(fresh)
        } catch {}
      }
      // New notification pushed by instructor/admin
      if (e.key === 'student_notifs_' + rawUser.email) {
        try {
          const fresh = JSON.parse(e.newValue || '[]')
          setNotificationsLS(fresh)
        } catch {}
      }
      // New message from instructor/employer — bump a counter to force MessagesSection remount/refresh
      if (e.key === 'student_messages_' + rawUser.email) {
        setMessagesSyncTick(t => t + 1)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [rawUser.email]) // eslint-disable-line
  const setFavProjects=fn=>setFavProjectsLS(typeof fn==='function'?fn(favProjects):fn)
  const setFavPortfolios=fn=>setFavPortfoliosLS(typeof fn==='function'?fn(favPortfolios):fn)
  const [messagesSyncTick, setMessagesSyncTick]=useState(0)
  const notifsEnabled=LS.get('student_notifs_on_'+rawUser.email,true)
const pushNotif=msg=>{if(!notifsEnabled)return;setNotificationsLS(p=>[...p,{id:Date.now().toString(),message:msg,read:false,createdAt:new Date().toISOString()}])}
  const unread=notifications.filter(n=>!n.read).length
  const invites=projects.filter(p=>(p.collaborators||[]).some(c=>c.email===rawUser.email&&c.status==='pending')).length
const navItems=[
    {id:'overview',label:'Overview',icon:IC.home},
    {id:'notifications',label:'Notifications',icon:IC.bell,badge:unread},
    {id:'projects',label:'My Projects',icon:IC.folder},
    {id:'learning',label:'Learning Hub',icon:IC.bookOpen},
    {id:'schedule',label:'Schedule',icon:IC.calendar},
    {id:'invitations',label:'Invitations',icon:IC.users,badge:invites},
    {id:'instructors',label:'Find Instructors',icon:IC.book},
    {id:'portfolios',label:'Explore All Portfolios',icon:IC.users},
    {id:'favorites',label:'Favorites',icon:IC.heart},
    {id:'recommended',label:'Recommended',icon:IC.star},
    {id:'internships',label:'Internships',icon:IC.briefcase},
    // explore accessible via hero CTA; stats moved to profile dropdown
  ]
  const handleLogout=()=>{
    setTheme(false)
    logoutUser()
    navigate('/')
  }
 const [profileDropdown, setProfileDropdown]=useState(false)
  const [settingsTab, setSettingsTab]=useState('appearance')
  const [msgDropdown, setMsgDropdown]=useState(false)
  const [notifDropdown, setNotifDropdown]=useState(false)
  const profileRef=useRef(null)
  const msgRef=useRef(null)
  const notifRef=useRef(null)

  useEffect(()=>{
    const handler=(e)=>{
      if(profileRef.current&&!profileRef.current.contains(e.target))setProfileDropdown(false)
      if(msgRef.current&&!msgRef.current.contains(e.target))setMsgDropdown(false)
      if(notifRef.current&&!notifRef.current.contains(e.target))setNotifDropdown(false)
    }
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
  },[])

  const recentThreads=(()=>{
    const threads=LS.get('student_messages_'+rawUser.email,[])
    return threads.filter(t=>t.messages.length>0).slice(0,4)
  })()

  const renderNav=()=>(
    <>
{/* Sidebar top spacer to align with header height */}
      <div className="mb-4 mt-1 px-2">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Workspace
        </p>
        <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 px-3 py-2.5 border border-blue-100 dark:border-blue-900">
          {profile.photo
            ?<img src={profile.photo} alt="avatar" className="h-8 w-8 shrink-0 rounded-full object-cover border-2 border-blue-200"/>
            :<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              {(profile.firstName||rawUser.firstName||'S')[0].toUpperCase()}
            </div>
          }
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {profile.firstName||rawUser.firstName} {profile.lastName||rawUser.lastName}
            </p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500 leading-tight">Student · GUC</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>{setTab(item.id);setSidebar(false)}}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
              ${tab===item.id
                ?'bg-blue-700 text-white shadow-sm'
                :'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5'}`}>
            <Icon d={item.icon} size={16}/>
            <span>{item.label}</span>
            {item.badge>0&&(
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold
                ${tab===item.id?'bg-white text-blue-700':'bg-red-500 text-white'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-0.5">
        <button onClick={()=>{setTab('profile');setSidebar(false)}}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
            ${tab==='profile'?'bg-blue-700 text-white':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 hover:translate-x-0.5'}`}>
          <Icon d={IC.user} size={16}/><span>My Profile</span>
        </button>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400">
          <Icon d={IC.logout} size={16}/><span>Logout</span>
        </button>
      </div>
    </>
  )

  const p={...profile,email:rawUser.email}
  const { isDark: darkMode, setTheme } = useTheme()


  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-200 bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5 md:flex overflow-y-auto">
        {renderNav()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen&&(
        <div className="fixed inset-0 z-40 md:hidden" onClick={()=>setSidebar(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
<aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5"
            onClick={e=>e.stopPropagation()}>
            {renderNav()}
          </aside>
        </div>
      )}

    {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header — fixed, never scrolls */}
<header className="shrink-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-sm px-4 py-3">
{/* Left: Logo + Hamburger (mobile) + Page title */}
          <div className="flex items-center gap-3">

            {/* Hamburger — mobile only */}
            <button onClick={()=>setSidebar(true)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 md:hidden">
              <Icon d={IC.menu} size={18}/>
            </button>

            {/* Brand logo — always visible, navigates to home */}
            <button
              onClick={()=>navigate('/')}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-150 hover:opacity-80 hover:bg-slate-50 group">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-sm group-hover:shadow-md transition-shadow duration-150">
                <Icon d={IC.folder} size={14}/>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden sm:block">
                  ProjectHub
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  ProjectHub
                </span>
              </div>
            </button>

{/* Breadcrumb — desktop only */}
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-slate-300 text-sm select-none">/</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 select-none">Dashboard</span>
              <span className="text-slate-300 dark:text-slate-600 text-sm select-none">/</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                {navItems.find(n=>n.id===tab)?.label
                  || (tab==='profile'?'My Profile'
                  : tab==='explore'?'Explore Projects'
                  : tab==='create-project'?'New Project'
                  : tab)}
              </span>
            </div>

          </div>

          {/* Right: Messages, Notifications, Avatar */}
          <div className="flex items-center gap-1">

{/* Messages */}
            <div className="relative" ref={msgRef}>
              <button onClick={()=>{setMsgDropdown(p=>!p);setNotifDropdown(false);setProfileDropdown(false)}}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                <Icon d={IC.chat} size={18}/>
{(()=>{
                  const allThreads=LS.get('student_messages_'+rawUser.email,[])
                  const unreadMsgs=allThreads.reduce((acc,t)=>acc+t.messages.filter(m=>m.from!==rawUser.email&&!m.read).length,0)
                  return unreadMsgs>0?(
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm transition-all duration-200">
                      {unreadMsgs>9?'9+':unreadMsgs}
                    </span>
                  ):null
                })()}
              </button>
              {msgDropdown&&(
                <div className="absolute right-0 top-11 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Messages</p>
                    <button onClick={()=>{setTab('messages');setMsgDropdown(false)}}
                      className="text-xs text-blue-500 hover:underline">Open</button>
                  </div>
                  {recentThreads.length===0
                    ?<p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">No messages yet.</p>
                    :<ul className="divide-y divide-slate-100 dark:divide-slate-700">
                      {recentThreads.map(t=>(
                        <li key={t.with}>
                          <button onClick={()=>{
                            LS.set('student_pending_message_target',t.with)
                            const key='student_messages_'+rawUser.email
                            LS.set(key,LS.get(key,[]).map(th=>th.with===t.with?{...th,messages:th.messages.map(m=>m.from!==rawUser.email?{...m,read:true}:m)}:th))
                            setTab('messages')
                            setMsgDropdown(false)
                          }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-bold text-blue-700 dark:text-blue-300">
                              {t.with[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">{t.with}</p>
                              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{t.messages.at(-1)?.text||'No messages'}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  }
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    <button onClick={()=>{setTab('messages');setMsgDropdown(false)}}
                      className="w-full rounded-lg py-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      View all messages
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={()=>{setNotifDropdown(p=>!p);setMsgDropdown(false);setProfileDropdown(false)}}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                <Icon d={IC.bell} size={18}/>
                {unread>0&&(
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unread>9?'9+':unread}
                  </span>
                )}
              </button>
              {notifDropdown&&(
                <div className="absolute right-0 top-11 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                    <div className="flex items-center gap-2">
                      {unread>0&&(
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          {unread} new
                        </span>
                      )}
                      {unread>0&&(
                        <button
                          onClick={()=>setNotifications(p=>p.map(n=>({...n,read:true})))}
                          className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

{notifications.length===0
                    ?<p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">No notifications yet.</p>
                    :<ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {notifications.slice().reverse().slice(0,6).map(n=>{
                        // ── route resolver ──────────────────────────────
                        const msg=n.message?.toLowerCase()||''
                        const goTo=()=>{
                          // mark as read
                          setNotifications(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))
                          setNotifDropdown(false)
                          // route by keyword
                          if(msg.includes('message')||msg.includes('chat')){
                            const match=n.message?.match(/from\s+([\w.@+-]+@[\w.+-]+)/i)
                              ||n.message?.match(/([\w.@+-]+@[\w.+-]+)/)
                            if(match?.[1]){
                              LS.set('student_pending_message_target',match[1])
                              // mark that thread as read in localStorage immediately
                              const key='student_messages_'+rawUser.email
                              LS.set(key,LS.get(key,[]).map(th=>
                                th.with===match[1]
                                  ?{...th,messages:th.messages.map(m=>m.from!==rawUser.email?{...m,read:true}:m)}
                                  :th
                              ))
                            }
                            setTab('messages')
                          } else if(msg.includes('invitation')||msg.includes('invited')||msg.includes('collab')){
                            setTab('invitations')
                          } else if(msg.includes('internship')||msg.includes('application')||msg.includes('job')||msg.includes('hiring')){
                            setTab('internships')
                          } else if(msg.includes('appeal')){
                            setTab('projects')
                          } else if(msg.includes('project')){
                            setTab('projects')
                          } else if(msg.includes('notification')){
                            setTab('notifications')
                          } else {
                            setTab('notifications')
                          }
                        }
                        // ── icon resolver ────────────────────────────────
                        const iconD=
                          msg.includes('message')||msg.includes('chat')?IC.chat:
                          msg.includes('invitation')||msg.includes('invited')?IC.users:
                          msg.includes('internship')||msg.includes('application')||msg.includes('job')?IC.briefcase:
                          msg.includes('project')||msg.includes('appeal')?IC.folder:
                          IC.bell
                        const iconBg=
                          msg.includes('message')||msg.includes('chat')?'bg-blue-100 text-blue-600':
                          msg.includes('invitation')||msg.includes('invited')?'bg-purple-100 text-purple-600':
                          msg.includes('internship')||msg.includes('application')||msg.includes('job')?'bg-green-100 text-green-600':
                          msg.includes('project')||msg.includes('appeal')?'bg-amber-100 text-amber-600':
                          'bg-slate-100 text-slate-500'
                        return (
                          <li key={n.id}>
                           <button
                              onClick={goTo}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150
                                ${n.read
                                  ?'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                                  :'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
                              {/* category icon */}
                              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                                <Icon d={iconD} size={12}/>
                              </div>
<div className="min-w-0 flex-1">
                                <p className={`text-xs leading-snug ${n.read?'text-slate-500 dark:text-slate-400':'text-slate-800 dark:text-slate-200 font-medium'}`}>
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                                </p>
                              </div>
                              {/* unread dot */}
                              {!n.read&&(
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600 transition-all duration-200"/>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  }

                  <div className="border-t border-slate-100 dark:border-slate-700 p-2 flex gap-1">
                    <button
                      onClick={()=>{setTab('notifications');setNotifDropdown(false)}}
                      className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mx-1 h-6 w-px bg-slate-200"/>

            {/* Avatar / Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={()=>{setProfileDropdown(p=>!p);setMsgDropdown(false);setNotifDropdown(false)}}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 transition-colors">
                {profile.photo
                  ?<img src={profile.photo} alt="avatar" className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"/>
                  :<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                    {(profile.firstName||rawUser.firstName||'S')[0].toUpperCase()}
                  </div>
                }
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{profile.firstName||rawUser.firstName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 leading-tight">Student</p>
                </div>
                <svg className="hidden sm:block h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {profileDropdown&&(
                <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 z-50">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.firstName||rawUser.firstName} {profile.lastName||rawUser.lastName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{rawUser.email}</p>
                  </div>
                 <div className="p-1.5 space-y-0.5">
                    <button onClick={()=>{setTab('profile');setProfileDropdown(false)}}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Icon d={IC.user} size={14}/>My Profile
                    </button>
                    <button onClick={()=>{setTab('settings');setSettingsTab('appearance');setProfileDropdown(false)}}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Icon d={IC.moon} size={14}/>Appearance
                    </button>
                    <button onClick={()=>{setTab('settings');setSettingsTab('notifications');setProfileDropdown(false)}}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Icon d={IC.bell} size={14}/>Notifications
                    </button>
                    <button onClick={()=>{setTab('settings');setSettingsTab('wellness');setProfileDropdown(false)}}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Icon d={IC.zap} size={14}/>Wellness
                    </button>
                    <button onClick={()=>{setTab('stats');setProfileDropdown(false)}}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Icon d={IC.chart} size={14}/>Statistics
                    </button>
                  </div>
                  <div className="border-t border-slate-100 p-1.5">
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Icon d={IC.logout} size={14}/>Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content — ONLY this scrolls */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-5xl">
            {tab==='overview'&&<Overview user={{...rawUser,...profile}} projects={projects} notifications={notifications} setTab={setTab}/>}
            {tab==='profile'&&<ProfileSection profile={p} setProfile={setProfile}/>}
           {(tab==='projects'||tab==='create-project')&&<ProjectsSection projects={projects} setProjects={setProjects} profile={p} pushNotif={pushNotif} openCreateOnMount={tab==='create-project'} setTab={setTab}/>}
            {tab==='invitations'&&<InvitationsSection profile={p} projects={projects} setProjects={setProjects} pushNotif={pushNotif}/>}
            {tab==='instructors'&&<InstructorsSection/>}
            {tab==='explore'&&<ExploreProjectsSection profile={p} projects={projects} favProjects={favProjects} setFavProjects={setFavProjects}/>}
            {tab==='portfolios'&&<ExplorePortfoliosSection projects={projects} favPortfolios={favPortfolios} setFavPortfolios={setFavPortfolios} setTab={setTab}/>}
            {tab==='favorites'&&<FavoritesSection projects={projects} favProjects={favProjects} setFavProjects={setFavProjects} favPortfolios={favPortfolios} setFavPortfolios={setFavPortfolios}/>}
            {tab==='recommended'&&<RecommendedSection profile={p} projects={projects} favProjects={favProjects} setFavProjects={setFavProjects}/>}
            {tab==='messages'&&<MessagesSection key={messagesSyncTick} profile={p} pushNotif={pushNotif}/>}
            {tab==='internships'&&<InternshipsSection profile={p} pushNotif={pushNotif}/>}
            {tab==='stats'&&<StatsSection projects={projects} profile={p}/>}
            {tab==='settings'&&<SettingsSection profile={p} rawUser={rawUser} initialTab={settingsTab}/>}
            {tab==='schedule'&&<ScheduleSection profile={p}/>}
{tab==='notifications'&&<NotificationsSection notifications={notifications} setNotifications={setNotifications} profileEmail={rawUser.email} setTab={setTab}/>}
            {tab==='learning'&&<LearningHubSection profile={p}/>}
          </div>
        </main>
      </div>
    </div>
  )
}

