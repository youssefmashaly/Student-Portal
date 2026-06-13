import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getUsers, logoutUser, saveUser } from '../../data/authStorage'
import { useTheme } from '../../context/ThemeContext'

const ADMIN_STATE_KEY = 'guc_projecthub_admin_state'
const LS = { get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } } }

function isGucEmail(email) { return /^[^\s@]+@guc\.edu\.eg$/i.test(email.trim().toLowerCase()) }
function deriveNamePartsFromEmail(email) {
  const local = email.trim().split('@')[0].toLowerCase()
  const segs = local.split(/[._-]+/).filter(Boolean)
  if (!segs.length) return { firstName: 'Admin', lastName: 'User' }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1)
  return { firstName: cap(segs[0]), lastName: segs.slice(1).map(cap).join(' ') || 'Admin' }
}
function updateUserStatusInStorage(email, isActive) {
  localStorage.setItem('guc_projecthub_users', JSON.stringify(getUsers().map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, isActive } : u)))
}

const defaultAdminState = {
  courses: [
    { id: 'c1', code: 'CSEN701', name: 'Advanced Software Engineering' },
    { id: 'c2', code: 'DMET601', name: 'Data Mining and Analytics' },
    { id: 'c3', code: 'NETW402', name: 'Computer Networks' },
  ],
  notifications: [
    { id: 'n1', title: 'Link request', message: 'Dr. Nora Samir requested linking to CSEN701.', read: false, createdAt: '2026-04-26' },
    { id: 'n2', title: 'Unlink request', message: 'Dr. Karim Fathy requested unlinking from DMET601.', read: false, createdAt: '2026-04-28' },
    { id: 'n3', title: 'Appeal received', message: 'Student Mariam Adel appealed a project flag.', read: true, createdAt: '2026-05-01' },
  ],
  notificationsEnabled: true,
  linkRequests: [
    { id: 'lr1', instructorName: 'Dr. Nora Samir', instructorEmail: 'nora.samir@guc.edu.eg', courseCode: 'CSEN701', type: 'link', status: 'pending', createdAt: '2026-04-26' },
    { id: 'lr2', instructorName: 'Dr. Karim Fathy', instructorEmail: 'karim.fathy@guc.edu.eg', courseCode: 'DMET601', type: 'unlink', status: 'pending', createdAt: '2026-04-28' },
    { id: 'lr3', instructorName: 'Eng. Youssef', instructorEmail: 'youssef@guc.edu.eg', courseCode: 'CSEN701', type: 'link', status: 'pending', createdAt: '2026-05-05' },
  ],
  appeals: [
    { id: 'a1', studentName: 'Mariam Adel', studentEmail: 'mariam.adel@student.guc.edu.eg', projectId: '2', projectTitle: 'AI Chatbot', reason: 'Independent work evidence attached.', status: 'pending', createdAt: '2026-05-01' },
    { id: 'a2', studentName: 'Nour Hassan', studentEmail: 'nour.hassan@student.guc.edu.eg', projectId: '3', projectTitle: 'Network Simulator', reason: 'Similarity threshold is a false positive.', status: 'pending', createdAt: '2026-05-03' },
  ],
  internshipStats: [
    { period: '2024-Q1', interns: 4, offered: 6 }, { period: '2024-Q2', interns: 6, offered: 8 },
    { period: '2024-Q3', interns: 7, offered: 9 }, { period: '2024-Q4', interns: 8, offered: 10 },
    { period: '2025-Q1', interns: 10, offered: 12 },
  ],
  employerStatuses: {}, projectOverrides: {},
}

function readAdminState() {
  try {
    const raw = localStorage.getItem(ADMIN_STATE_KEY)
    if (!raw) { localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(defaultAdminState)); return defaultAdminState }
    const p = JSON.parse(raw)
    return { ...defaultAdminState, ...p, employerStatuses: p.employerStatuses || {}, projectOverrides: p.projectOverrides || {}, notificationsEnabled: p.notificationsEnabled ?? true, linkRequests: p.linkRequests?.length ? p.linkRequests : defaultAdminState.linkRequests }
  } catch { return defaultAdminState }
}
function saveAdminState(s) { localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(s)) }

function buildInstructors(platformUsers) {
  return platformUsers.filter(u => u.role === 'instructor').map(u => {
    const profile = LS.get('instructor_profile_' + u.email, {})
    const linkedCourses = LS.get('instructor_courses_' + u.email, [])
    return { id: u.email, fullName: `${profile.firstName||u.firstName||''} ${profile.lastName||u.lastName||''}`.trim() || u.email, email: u.email, department: profile.department||u.department||'', bio: profile.bio||'', research: profile.research||'', education: profile.education||'', linkedCourseCodes: Array.isArray(linkedCourses) ? linkedCourses : [], isActive: u.isActive ?? true }
  })
}

function buildEmployers(platformUsers, employerStatuses) {
  const built = platformUsers.filter(u => u.role === 'employer').map(u => {
    const empId = u.email.toLowerCase()
    const profile = LS.get(`guc_emp_profile_${empId}`, {})
    const internships = LS.get(`emp_interns_${empId}`, [])
    const documents = []
    if (profile.taxCertificate) documents.push({ id: `tax_${empId}`, name: profile.taxCertificateName||'Tax Certificate', content: profile.taxCertificate, isImage: profile.taxCertificate.startsWith('data:image') })
    if (profile.logo?.startsWith('data:')) documents.push({ id: `logo_${empId}`, name: 'Company Logo', content: profile.logo, isImage: true })
    return { id: empId, companyName: u.companyName||profile.companyName||u.email, industry: u.industry||profile.industry||'', companyEmail: u.email, phone: profile.phone||u.phone||'', address: profile.address||u.address||'', bio: profile.bio||'', website: profile.website||'', mapLocationAddress: profile.mapLocationAddress||'', isVerified: profile.isVerified||false, documents, internshipsOffered: internships.length, internshipsList: internships, studentsHired: internships.reduce((s,i) => s+(Array.isArray(i.applicants)?i.applicants.filter(a=>a.status==='Accepted').length:0),0), status: employerStatuses[empId]??'pending', isActive: u.isActive??true }
  })
  if (!built.some(e => e.id === 'demo_employer_hq')) {
    built.unshift({ id: 'demo_employer_hq', companyName: 'Maadihood Tech Solutions', industry: 'Software Engineering', companyEmail: 'contact@maadihoodtech.com', phone: '+20 123 456 7890', address: 'Building 7, Open Community Tech Park, Cairo', bio: 'Innovative tech hub building solutions for the future.', website: 'https://maadihoodtech.com', mapLocationAddress: 'Maadi, Cairo Governorate, Egypt', isVerified: true, documents: [{ id: 'logo_demo', name: 'Company Logo.png', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4wBBoMIwwAAAABJRU5ErkJggg==', isImage: true }, { id: 'tax_demo', name: 'Tax_Certificate_2026.txt', content: 'Official Tax Certificate\nCompany: Maadihood Tech Solutions\nStatus: Verified\nYear: 2026', isImage: false }], internshipsOffered: 12, internshipsList: [], studentsHired: 4, status: employerStatuses['demo_employer_hq']??'pending', isActive: true })
  }
  return built
}

function buildProjects(projectOverrides) {
  return LS.get('student_projects', []).map(p => {
    const ov = projectOverrides[p.id] || {}
    return { ...p, courseCode: p.courseCode||p.course||'', createdAt: p.createdAt||new Date().toISOString().slice(0,10), rating: typeof p.rating==='number'?p.rating:0, status: ov.status??(p.status||'active'), flagged: ov.flagged??(p.flagged||false), flagReason: ov.flagReason??(p.flagReason||'') }
  })
}

function buildPortfolios(platformUsers, projects) {
  return platformUsers.filter(u => u.role === 'student').map(u => {
    const profile = LS.get('student_profile_' + u.email, {})
    const fullName = `${profile.firstName||u.firstName||''} ${profile.lastName||u.lastName||''}`.trim() || u.email
    const sp = projects.filter(p => p.ownerEmail===u.email||p.owner===fullName||p.owner===u.email)
    return { id: u.email, name: fullName, email: u.email, major: profile.major||u.major||'', skills: Array.isArray(profile.skills)?profile.skills:[], projectsCount: sp.length, projects: sp, gpa: profile.gpa||u.gpa||null, isActive: u.isActive??true }
  })
}

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
)
const IC = {
  home:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', chart:'M18 20V10M12 20V4M6 20v-6',
  users:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  folder:'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  book:'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
  bell:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  briefcase:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z',
  logout:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  flag:'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  x:'M18 6L6 18M6 6l12 12', check:'M20 6L9 17l-5-5',
  download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6',
  refresh:'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  menu:'M3 12h18M3 6h18M3 18h18', moon:'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  sun:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  zap:'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  settings:'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  search:'M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z',
  user:        'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  activity:    'M22 12h-4l-3 9L9 3l-3 9H2',
  trendUp:     'M23 6l-9.5 9.5-5-5L1 18',
  alertCircle: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01',
  fileText:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  layers:      'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  target:      'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  filter:      'M22 3H2l8 9.46V19l4 2V12.46L22 3z',
  arrowRight:  'M5 12h14M12 5l7 7-7 7',
  server:      'M20 13a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 012-2h16zM20 5a2 2 0 012 2v1a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h16zM6 9h.01M6 17h.01',
  database:    'M12 2a9 3 0 019 3 9 3 0 010 6 9 3 0 010 6 9 3 0 01-18 0V5a9 3 0 019-3zM3 5v14M21 5v14',
  clock:       'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  plus:        'M12 5v14M5 12h14',
}

const Badge = ({ children, color = 'blue' }) => {
  const map = { blue:'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300', green:'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300', red:'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300', yellow:'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300', slate:'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', orange:'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[color]??map.slate}`}>{children}</span>
}
const Card = ({ children, className='' }) => <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm ${className}`}>{children}</div>
const EmptyState = ({ message }) => <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-12 text-center text-sm text-slate-400 dark:text-slate-500">{message}</div>
function StatusBadge({ status }) {
  const map = { pending:'yellow', accepted:'green', rejected:'red', active:'green', inactive:'slate' }
  return <Badge color={map[status]??'slate'}>{status}</Badge>
}
function InfoRow({ label, value }) {
  return <div className="flex gap-2 items-start"><span className="text-xs font-medium text-slate-400 dark:text-slate-500 w-20 shrink-0 pt-0.5 uppercase tracking-wide">{label}</span><span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{value}</span></div>
}

function UserTable({ users, onToggle, columns }) {
  if (!users.length) return <EmptyState message="No users found." />
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
          <tr>{columns.map(c => <th key={c.label} className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{c.label}</th>)}<th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status</th><th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Action</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
              {columns.map(c => <td key={c.label} className="p-4 text-slate-700 dark:text-slate-300">{c.render(user)}</td>)}
              <td className="p-4"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{user.isActive?'Active':'Inactive'}</span></td>
              <td className="p-4"><button onClick={() => onToggle(user)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{user.isActive?'Deactivate':'Activate'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SettingsTab({ isDark, setTheme, user }) {
  const [settTab, setSettTab] = useState('appearance')
  const [cooldown, setCooldown] = useState(false)
  const [cooldownCount, setCooldownCount] = useState(5)
  const startCooldown = () => { setCooldown(true); setCooldownCount(5); const t = setInterval(() => setCooldownCount(c => { if (c<=1) { clearInterval(t); setTimeout(()=>setCooldown(false),400); return 0 } return c-1 }), 1000) }
  const tabs = [{ id:'appearance', label:'Appearance', icon:IC.moon }, { id:'wellness', label:'Wellness', icon:IC.zap }, { id:'account', label:'Account', icon:IC.shield }]
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
            <div className="space-y-2"><p className="text-xl font-light text-white tracking-wide">Take a breath</p><p className="text-sm text-blue-200">Inhale slowly… exhale gently…</p></div>
            <div className="h-1 w-48 rounded-full bg-slate-700"><div className="h-1 rounded-full bg-blue-400 transition-all duration-1000" style={{width:`${(cooldownCount/5)*100}%`}} /></div>
          </div>
        </div>
      )}
      <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your preferences.</p></div>
      <div className="flex gap-6">
        <div className="w-44 shrink-0 space-y-0.5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setSettTab(t.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${settTab===t.id?'bg-blue-700 text-white shadow-sm':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700'}`}>
              <Icon d={t.icon} size={14}/>{t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          {settTab === 'appearance' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Choose your preferred theme.</p></div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setTheme(false)} className={`rounded-2xl border-2 p-4 text-left transition-all ${!isDark?'border-blue-600 shadow-md shadow-blue-100':'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                  <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-200"/><div className="h-1.5 w-16 rounded bg-slate-200"/></div>
                    <div className="flex gap-2 p-2"><div className="w-8"><div className="h-1.5 rounded bg-blue-100"/></div><div className="flex-1"><div className="h-6 rounded-lg bg-blue-100"/></div></div>
                  </div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800">Light</p><p className="text-xs text-slate-400">Clean and bright</p></div>{!isDark&&<div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11}/></div>}</div>
                </button>
                <button onClick={() => setTheme(true)} className={`rounded-2xl border-2 p-4 text-left transition-all ${isDark?'border-blue-600 shadow-md shadow-blue-900/30':'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                  <div className="mb-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                    <div className="flex items-center gap-1.5 border-b border-slate-700 bg-slate-800 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-600"/><div className="h-1.5 w-16 rounded bg-slate-600"/></div>
                    <div className="flex gap-2 p-2"><div className="w-8"><div className="h-1.5 rounded bg-blue-900"/></div><div className="flex-1"><div className="h-6 rounded-lg bg-blue-900"/></div></div>
                  </div>
                  <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark</p><p className="text-xs text-slate-400 dark:text-slate-500">Easy on the eyes</p></div>{isDark&&<div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11}/></div>}</div>
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                <Icon d={isDark?IC.moon:IC.sun} size={14}/>
                <p className="text-xs text-slate-600 dark:text-slate-300">Currently using <span className="font-semibold">{isDark?'Dark':'Light'}</span> mode</p>
              </div>
            </div>
          )}
          {settTab === 'wellness' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Wellness & Focus</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Tools to help you stay calm and focused.</p></div>
              <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 text-center space-y-3">
                <div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"><Icon d={IC.zap} size={24}/></div></div>
                <div><p className="font-semibold text-slate-900 dark:text-white">5-Second Cooldown</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Admin work can be intense. Take a quick guided breathing break.</p></div>
                <button onClick={startCooldown} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all"><Icon d={IC.zap} size={14}/>Start Cooldown</button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">💡 Admin Tips</p>
                <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>• Review employer documents carefully before approving</li>
                  <li>• Check student appeals within 48 hours of submission</li>
                  <li>• Keep course catalog up to date each semester</li>
                  <li>• Use the Refresh button after bulk changes</li>
                </ul>
              </div>
            </div>
          )}
          {settTab === 'account' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Account Settings</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Your admin account information.</p></div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium text-slate-800 dark:text-slate-200">{user?.email||'—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Role</span><span className="font-medium text-slate-800 dark:text-slate-200">Administrator</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">University</span><span className="font-medium text-slate-800 dark:text-slate-200">GUC</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isDark, setTheme, toggleTheme } = useTheme()
  const [adminState, setAdminState] = useState(() => readAdminState())
  const [platformUsers, setPlatformUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState('statistics')
  const [userMgmtTab, setUserMgmtTab] = useState('students')
  const [sidebarOpen, setSidebar] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [notifDropdown, setNotifDropdown] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [projectCourseFilter, setProjectCourseFilter] = useState('')
  const [projectFlagFilter, setProjectFlagFilter] = useState('all')
  const [projectSortBy, setProjectSortBy] = useState('createdAt')
  const [portfolioSearch, setPortfolioSearch] = useState('')
  const [portfolioMajorFilter, setPortfolioMajorFilter] = useState('')
  const [portfolioSkillFilter, setPortfolioSkillFilter] = useState('')
  const [portfolioSortBy, setPortfolioSortBy] = useState('projectsCount')
  const [userSearch, setUserSearch] = useState('')
  const [viewDocModal, setViewDocModal] = useState(null)
  const [flagModal, setFlagModal] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [courseForm, setCourseForm] = useState({ id: null, code: '', name: '' })
  const [adminAccountForm, setAdminAccountForm] = useState({ email: '', password: '' })
  const [adminAccountError, setAdminAccountError] = useState('')
  const [adminAccountSuccess, setAdminAccountSuccess] = useState('')

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const refreshUsers = useCallback(() => {
    setPlatformUsers(getUsers().map((u,i) => ({ ...u, id:`${u.email}-${u.role}-${i}`, isActive:u.isActive??true, fullName:u.companyName||`${u.firstName??''} ${u.lastName??''}`.trim()||u.username||'Unnamed User' })))
  }, [])
  const refreshProjects = useCallback((ov) => setProjects(buildProjects(ov??adminState.projectOverrides)), [adminState.projectOverrides])
  const syncExternalLinkRequests = useCallback(() => {
    const ext = LS.get('guc_link_requests', [])
    if (!ext.length) return
    setAdminState(prev => {
      if (!prev.notificationsEnabled) return prev
      const ids = new Set(prev.linkRequests.map(r=>r.id))
      const newR = ext.filter(r=>!ids.has(r.id))
      if (!newR.length) return prev
      const notifs = newR.map(r => ({ id:`n_lr_${r.id}`, title:`${r.type==='link'?'Link':'Unlink'} request`, message:`${r.instructorName||r.instructorEmail} requested to ${r.type} course ${r.courseCode}.`, read:false, createdAt:new Date().toISOString().slice(0,10) }))
      return { ...prev, linkRequests:[...prev.linkRequests,...newR], notifications:[...notifs,...prev.notifications] }
    })
  }, [])

  useEffect(() => {
    const cu = getCurrentUser()
    if (!cu||cu.role!=='admin') { navigate('/'); return }
    refreshUsers(); setProjects(buildProjects(adminState.projectOverrides)); syncExternalLinkRequests()
  }, [navigate, refreshUsers, syncExternalLinkRequests]) // eslint-disable-line

  // Poll localStorage every 8 seconds to pick up cross-dashboard writes
  // (appeals from students, link requests from instructors)
  useEffect(() => {
    const poll = () => {
      // Re-sync link requests from instructors
      syncExternalLinkRequests()
      // Re-read admin state to pick up new appeals written by students
      setAdminState(prev => {
        try {
          const raw = localStorage.getItem(ADMIN_STATE_KEY)
          if (!raw) return prev
          const fresh = JSON.parse(raw)
          // Only update appeals and linkRequests; preserve rest of in-memory state
          const mergedAppeals = fresh.appeals || prev.appeals
          const existingLRIds = new Set(prev.linkRequests.map(r => r.id))
          const newLRs = (fresh.linkRequests || []).filter(r => !existingLRIds.has(r.id))
          if (mergedAppeals.length === prev.appeals.length && newLRs.length === 0) return prev
          return {
            ...prev,
            appeals: mergedAppeals,
            linkRequests: [...prev.linkRequests, ...newLRs],
          }
        } catch { return prev }
      })
    }
    const interval = setInterval(poll, 8000)
    // Also poll when window regains focus
    window.addEventListener('focus', poll)
    return () => { clearInterval(interval); window.removeEventListener('focus', poll) }
  }, [syncExternalLinkRequests])
  useEffect(() => { saveAdminState(adminState) }, [adminState])

  const currentUser = getCurrentUser()
  const instructors = useMemo(() => buildInstructors(platformUsers), [platformUsers])
  const employers = useMemo(() => buildEmployers(platformUsers, adminState.employerStatuses), [platformUsers, adminState.employerStatuses])
  const portfolios = useMemo(() => buildPortfolios(platformUsers, projects), [platformUsers, projects])
  const coursesByCode = useMemo(() => Object.fromEntries(adminState.courses.map(c=>[c.code,c])), [adminState.courses])

  const projectResults = useMemo(() => [...projects].filter(p => {
    if (projectSearch.trim()&&!p.title?.toLowerCase().includes(projectSearch.toLowerCase())) return false
    if (projectCourseFilter&&p.courseCode!==projectCourseFilter) return false
    if (projectFlagFilter==='flagged'&&!p.flagged) return false
    if (projectFlagFilter==='inactive'&&p.status!=='inactive') return false
    return true
  }).sort((a,b) => projectSortBy==='rating'?b.rating-a.rating:new Date(b.createdAt)-new Date(a.createdAt)),
  [projects,projectSearch,projectCourseFilter,projectFlagFilter,projectSortBy])

  const portfolioResults = useMemo(() => [...portfolios].filter(p => {
    const q = portfolioSearch.trim().toLowerCase()
    return (!q||p.name.toLowerCase().includes(q)||p.email.toLowerCase().includes(q))&&(!portfolioMajorFilter||p.major===portfolioMajorFilter)&&(!portfolioSkillFilter||p.skills.some(s=>s.toLowerCase()===portfolioSkillFilter.toLowerCase()))
  }).sort((a,b) => portfolioSortBy==='projectsCount'?b.projectsCount-a.projectsCount:0),
  [portfolios,portfolioSearch,portfolioMajorFilter,portfolioSkillFilter,portfolioSortBy])

  const filteredUsersByRole = useMemo(() => {
    const q = userSearch.trim().toLowerCase()
    return platformUsers.filter(u => {
      if (userMgmtTab==='students'&&u.role!=='student') return false
      if (userMgmtTab==='instructors'&&u.role!=='instructor') return false
      if (userMgmtTab==='employers'&&u.role!=='employer') return false
      if (q&&!u.fullName.toLowerCase().includes(q)&&!u.email.toLowerCase().includes(q)) return false
      return true
    })
  }, [platformUsers,userMgmtTab,userSearch])

  const flaggedProjects = projects.filter(p=>p.flagged)
  const activeProjectCount = projects.filter(p=>p.status==='active').length
  const unreadCount = adminState.notifications.filter(n=>!n.read).length
  const allRead = unreadCount===0
  const pendingApprovals = employers.filter(e=>e.status==='pending').length
  const stats = { totalUsers:platformUsers.length, totalEmployers:platformUsers.filter(u=>u.role==='employer').length, totalStudents:platformUsers.filter(u=>u.role==='student').length, totalInstructors:platformUsers.filter(u=>u.role==='instructor').length, totalProjects:projects.length, totalCourses:adminState.courses.length }

  const handleLogout = () => { setTheme(false); logoutUser(); navigate('/') }
  const updateNotificationRead = (id,read) => setAdminState(prev => ({ ...prev, notifications:prev.notifications.map(n=>n.id===id?{...n,read}:n) }))
  const markAllNotifications = read => setAdminState(prev => ({ ...prev, notifications:prev.notifications.map(n=>({...n,read})) }))
  const toggleNotificationsEnabled = () => setAdminState(prev => ({ ...prev, notificationsEnabled:!prev.notificationsEnabled }))
  const handleCompanyStatus = (employerId, status) => {
    const emp = employers.find(e=>e.id===employerId)
    setAdminState(prev => {
      const notif = prev.notificationsEnabled?[{ id:`n${Date.now()}`, title:'Company application update', message:`${emp?.companyName||employerId} application was ${status}.`, read:false, createdAt:new Date().toISOString().slice(0,10) }]:[]
      return { ...prev, employerStatuses:{...prev.employerStatuses,[employerId]:status}, notifications:[...notif,...prev.notifications] }
    })
  }
  const handleDocumentDownload = doc => {
    const a = window.document.createElement('a')
    if (doc.isImage) { a.href=doc.content; a.download=doc.name }
    else { const blob=new Blob([doc.content],{type:'text/plain;charset=utf-8'}); a.href=URL.createObjectURL(blob); a.download=doc.name; a.addEventListener('click',()=>URL.revokeObjectURL(a.href),{once:true}) }
    a.click()
  }
  const handleCreateAdmin = e => {
    e.preventDefault(); setAdminAccountError(''); setAdminAccountSuccess('')
    const email = adminAccountForm.email.trim().toLowerCase()
    if (!email||!adminAccountForm.password) { setAdminAccountError('GUC email and password are required.'); return }
    if (!isGucEmail(email)) { setAdminAccountError('Use a GUC email (e.g. name@guc.edu.eg).'); return }
    if (getUsers().some(u=>u.email.toLowerCase()===email&&u.role==='admin')) { setAdminAccountError('An admin account already exists for this email.'); return }
    const { firstName, lastName } = deriveNamePartsFromEmail(email)
    saveUser({ firstName, lastName, email, password:adminAccountForm.password, role:'admin', isActive:true })
    refreshUsers(); setAdminAccountForm({ email:'', password:'' })
    setAdminAccountSuccess(`Admin account created for ${email}.`)
    window.setTimeout(()=>setAdminAccountSuccess(''),5000)
  }
  const toggleUserStatus = user => { const next=!(user.isActive??true); setPlatformUsers(prev=>prev.map(u=>u.id===user.id?{...u,isActive:next}:u)); updateUserStatusInStorage(user.email,next) }
  const handleCourseSubmit = e => {
    e.preventDefault(); if (!courseForm.code.trim()||!courseForm.name.trim()) return
    if (courseForm.id) setAdminState(prev=>({...prev,courses:prev.courses.map(c=>c.id===courseForm.id?{...c,code:courseForm.code.trim(),name:courseForm.name.trim()}:c)}))
    else setAdminState(prev=>({...prev,courses:[...prev.courses,{id:`c${Date.now()}`,code:courseForm.code.trim(),name:courseForm.name.trim()}]}))
    setCourseForm({id:null,code:'',name:''})
  }
  const deleteCourse = id => setAdminState(prev=>({...prev,courses:prev.courses.filter(c=>c.id!==id)}))
  const handleLinkRequest = (requestId, status) => {
    setAdminState(prev => {
      const req = prev.linkRequests.find(r=>r.id===requestId)
      const notif = prev.notificationsEnabled?[{ id:`n${Date.now()}`, title:'Linking request decision', message:`${req?.instructorName||req?.instructorEmail||'An instructor'}'s ${req?.type} request for ${req?.courseCode} was ${status}.`, read:false, createdAt:new Date().toISOString().slice(0,10) }]:[]
      return { ...prev, linkRequests:prev.linkRequests.map(r=>r.id===requestId?{...r,status}:r), notifications:[...notif,...prev.notifications] }
    })
  }
  const openFlagModal = project => { setFlagModal({projectId:project.id,title:project.title}); setFlagReason('') }
  const confirmFlag = () => {
    if (!flagReason.trim()) return
    const { projectId, title } = flagModal
    setProjects(prev=>prev.map(p=>p.id===projectId?{...p,flagged:true,flagReason:flagReason.trim()}:p))
    setAdminState(prev => {
      const curr = prev.projectOverrides[projectId]||{}
      const notif = prev.notificationsEnabled?[{ id:`n${Date.now()}`, title:'Project flagged', message:`"${title}" was flagged: ${flagReason.trim()}`, read:false, createdAt:new Date().toISOString().slice(0,10) }]:[]
      return { ...prev, projectOverrides:{...prev.projectOverrides,[projectId]:{...curr,flagged:true,flagReason:flagReason.trim()}}, notifications:[...notif,...prev.notifications] }
    })
    setFlagModal(null); setFlagReason('')
  }
  const unflagProject = projectId => {
    setProjects(prev=>prev.map(p=>p.id===projectId?{...p,flagged:false,flagReason:''}:p))
    setAdminState(prev => { const curr=prev.projectOverrides[projectId]||{}; return {...prev,projectOverrides:{...prev.projectOverrides,[projectId]:{...curr,flagged:false,flagReason:''}}} })
  }
  const toggleProjectStatus = projectId => {
    setProjects(prev=>prev.map(p=>p.id===projectId?{...p,status:p.status==='active'?'inactive':'active'}:p))
    setAdminState(prev => { const curr=prev.projectOverrides[projectId]||{}; const cur=curr.status??projects.find(p=>p.id===projectId)?.status??'active'; return {...prev,projectOverrides:{...prev.projectOverrides,[projectId]:{...curr,status:cur==='active'?'inactive':'active'}}} })
  }
  const handleAppealDecision = (appealId, status) => {
    setAdminState(prev => {
      const appeal = prev.appeals.find(a=>a.id===appealId)
      const notif = prev.notificationsEnabled?[{ id:`n${Date.now()}`, title:'Appeal decision', message:`Appeal from ${appeal?.studentName||'student'} for "${appeal?.projectTitle||'project'}" was ${status}.`, read:false, createdAt:new Date().toISOString().slice(0,10) }]:[]
      return { ...prev, appeals:prev.appeals.map(a=>a.id===appealId?{...a,status}:a), notifications:[...notif,...prev.notifications] }
    })
  }

  const navItems = [
    { id:'statistics',    label:'Statistics',           icon:IC.chart },
    { id:'overview',      label:'Platform Overview',    icon:IC.target },
    { id:'approvals',     label:'Employer Approvals',   icon:IC.briefcase, badge:pendingApprovals },
    { id:'users',         label:'User Management',      icon:IC.users },
    { id:'projects',      label:'Projects & Portfolios',icon:IC.folder, badge:flaggedProjects.length, badgeColor:'red' },
    { id:'moderation',    label:'Content Moderation',   icon:IC.flag, badge:flaggedProjects.length, badgeColor:'red' },
    { id:'courses',       label:'Courses',              icon:IC.book },
    { id:'notifications', label:'Notifications',        icon:IC.bell, badge:adminState.notificationsEnabled?unreadCount:0 },
    { id:'reports',       label:'Reports Center',       icon:IC.fileText },
    { id:'audit',         label:'Audit Logs',           icon:IC.activity },
    { id:'health',        label:'Platform Health',      icon:IC.server },
    { id:'adminAccounts', label:'Admin Accounts',       icon:IC.shield },
    { id:'settings',      label:'Settings',             icon:IC.settings },
  ]

  const renderNav = () => (
    <>
      <div className="mb-4 mt-1 px-2">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Admin Portal</p>
        <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-3 py-2.5 border border-blue-100 dark:border-blue-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">A</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white leading-tight">{currentUser?.email?.split('@')[0]||'Admin'}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500 leading-tight">Administrator · GUC</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebar(false) }}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${activeTab===item.id?'bg-blue-700 text-white shadow-sm':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5'}`}>
            <Icon d={item.icon} size={16} className="shrink-0"/>
            <span className="truncate flex-1 text-left whitespace-nowrap">{item.label}</span>
            {item.badge>0&&<span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${activeTab===item.id?'bg-white text-blue-700':'bg-red-500 text-white'}`}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-4 space-y-0.5">
        <button onClick={() => { refreshUsers(); refreshProjects(); syncExternalLinkRequests() }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5">
          <Icon d={IC.refresh} size={16}/><span className="whitespace-nowrap">Refresh Data</span>
        </button>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400">
          <Icon d={IC.logout} size={16}/><span className="whitespace-nowrap">Logout</span>
        </button>
      </div>
    </>
  )

  const SunIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-200 bg-slate-50 dark:bg-slate-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5 md:flex overflow-y-auto">{renderNav()}</aside>
      {sidebarOpen&&(
        <div className="fixed inset-0 z-40 md:hidden" onClick={()=>setSidebar(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-5 overflow-y-auto" onClick={e=>e.stopPropagation()}>{renderNav()}</aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebar(true)} className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"><Icon d={IC.menu} size={18}/></button>
            <button onClick={()=>navigate('/')} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:opacity-80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-sm"><Icon d={IC.shield} size={14}/></div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden sm:block">BI × ENG V2</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">ProjectHub</span>
              </div>
            </button>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Admin</span>
              <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{navItems.find(n=>n.id===activeTab)?.label||activeTab}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{isDark?<SunIcon/>:<MoonIcon/>}</button>
            <div className="relative" ref={notifRef}>
              <button onClick={()=>{setNotifDropdown(p=>!p);setProfileDropdown(false)}} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon d={IC.bell} size={18}/>
                {!allRead&&adminState.notificationsEnabled&&<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unreadCount>9?'9+':unreadCount}</span>}
              </button>
              {notifDropdown&&(
                <div className="absolute right-0 top-11 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                    {!allRead&&<button onClick={()=>{markAllNotifications(true);setNotifDropdown(false)}} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>}
                  </div>
                  {adminState.notifications.length===0?<p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">All caught up!</p>:(
                    <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {adminState.notifications.slice(0,6).map(n=>(
                        <li key={n.id}>
                          <button onClick={()=>{updateNotificationRead(n.id,true);setActiveTab('notifications');setNotifDropdown(false)}} className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${!n.read?'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30':'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read?'bg-slate-300 dark:bg-slate-600':'bg-blue-600'}`}/>
                            <div className="min-w-0 flex-1"><p className={`text-xs font-medium leading-snug ${!n.read?'text-slate-800 dark:text-slate-200':'text-slate-500 dark:text-slate-400'}`}>{n.title}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{n.createdAt}</p></div>
                            {!n.read&&<span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"/>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    <button onClick={()=>{setActiveTab('notifications');setNotifDropdown(false)}} className="w-full rounded-lg py-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">View all</button>
                  </div>
                </div>
              )}
            </div>
            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700"/>
            <div className="relative" ref={profileRef}>
              <button onClick={()=>{setProfileDropdown(p=>!p);setNotifDropdown(false)}} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">A</div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{currentUser?.email?.split('@')[0]||'Admin'}</p>
                  <p className="text-xs text-slate-400 leading-tight">Administrator</p>
                </div>
                <svg className="hidden sm:block h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {profileDropdown&&(
                <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser?.email?.split('@')[0]||'Admin'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{currentUser?.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {[{label:'Appearance',icon:IC.moon,action:()=>{setActiveTab('settings');setProfileDropdown(false)}},{label:'Notifications',icon:IC.bell,action:()=>{setActiveTab('notifications');setProfileDropdown(false)}},{label:'Admin Accounts',icon:IC.shield,action:()=>{setActiveTab('adminAccounts');setProfileDropdown(false)}}].map(item=>(
                      <button key={item.label} onClick={item.action} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Icon d={item.icon} size={14}/>{item.label}</button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 p-1.5">
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><Icon d={IC.logout} size={14}/>Sign out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-6xl space-y-6">

            {activeTab==='statistics'&&(
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"/>
                  <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"/>
                  <div className="relative"><h2 className="text-3xl font-bold text-white">Platform Statistics</h2><p className="text-blue-100 text-sm mt-1">Overview of all users, projects, and internship activity across GUC ProjectHub.</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[{label:'Total Users',value:stats.totalUsers,color:'text-blue-700 dark:text-blue-400',bg:'bg-blue-50 dark:bg-blue-950/40'},{label:'Students',value:stats.totalStudents,color:'text-emerald-700 dark:text-emerald-400',bg:'bg-emerald-50 dark:bg-emerald-950/40'},{label:'Instructors',value:stats.totalInstructors,color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40'},{label:'Employers',value:stats.totalEmployers,color:'text-orange-700 dark:text-orange-400',bg:'bg-orange-50 dark:bg-orange-950/40'},{label:'Projects',value:stats.totalProjects,color:'text-yellow-700 dark:text-yellow-400',bg:'bg-yellow-50 dark:bg-yellow-950/40'},{label:'Courses',value:stats.totalCourses,color:'text-slate-700 dark:text-slate-300',bg:'bg-slate-100 dark:bg-slate-700/40'}].map(s=>(
                    <div key={s.label} className={`rounded-xl border-0 p-4 shadow-sm ${s.bg}`}><p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p><p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                  ))}
                </div>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Platform Internship History</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Completed vs. offered — aggregated across all companies.</p>
                  <div className="space-y-2">
                    {adminState.internshipStats.map(entry=>{const pct=entry.offered>0?Math.round((entry.interns/entry.offered)*100):0;return(
                      <div key={entry.period} className="grid grid-cols-12 gap-4 items-center rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-2.5">
                        <span className="col-span-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{entry.period}</span>
                        <span className="col-span-4 text-sm text-slate-600 dark:text-slate-400">Completed: <strong className="text-slate-900 dark:text-slate-200">{entry.interns}</strong> · Offered: <strong className="text-slate-900 dark:text-slate-200">{entry.offered}</strong></span>
                        <div className="col-span-5 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{width:`${pct}%`}}/></div>
                        <span className="col-span-1 text-xs text-slate-400 dark:text-slate-500 text-right">{pct}%</span>
                      </div>
                    )})}
                  </div>
                </Card>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Internship Statistics by Company</h3>
                  {employers.length===0?<EmptyState message="No employer companies registered yet."/>:(
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 dark:border-slate-700"><tr>{['Company','Industry','Offered','Hired','Conversion','Status'].map(h=><th key={h} className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>)}</tr></thead>
                        <tbody>
                          {employers.map(emp=>{const conv=emp.internshipsOffered>0?Math.round((emp.studentsHired/emp.internshipsOffered)*100):0;return(
                            <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{emp.companyName}</td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">{emp.industry||'—'}</td>
                              <td className="p-3 text-center font-semibold text-blue-700 dark:text-blue-400">{emp.internshipsOffered}</td>
                              <td className="p-3 text-center font-semibold text-green-700 dark:text-green-400">{emp.studentsHired}</td>
                              <td className="p-3"><div className="flex items-center gap-2"><div className="w-20 bg-slate-100 dark:bg-slate-600 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width:`${conv}%`}}/></div><span className="text-xs text-slate-400 dark:text-slate-500">{conv}%</span></div></td>
                              <td className="p-3"><StatusBadge status={emp.status}/></td>
                            </tr>
                          )})}
                        </tbody>
                        <tfoot className="border-t border-slate-200 dark:border-slate-700"><tr><td className="p-3 font-semibold text-slate-800 dark:text-slate-200" colSpan={2}>Totals</td><td className="p-3 text-center font-bold text-blue-700 dark:text-blue-400">{employers.reduce((s,e)=>s+e.internshipsOffered,0)}</td><td className="p-3 text-center font-bold text-green-700 dark:text-green-400">{employers.reduce((s,e)=>s+e.studentsHired,0)}</td><td colSpan={2}/></tr></tfoot>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab==='approvals'&&(
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employer Approvals</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review all employer details and documents, then accept or reject.</p></div>
                {employers.length===0?<EmptyState message="No employers have registered yet."/>:(
                  <div className="space-y-5">
                    {employers.map(emp=>(
                      <Card key={emp.id} className="p-0 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                          <div className="flex items-center gap-3"><div><p className="font-semibold text-slate-800 dark:text-slate-200">{emp.companyName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{emp.industry||'Industry not specified'}</p></div><StatusBadge status={emp.status}/>{!emp.isActive&&<Badge color="slate">Account inactive</Badge>}</div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={()=>handleCompanyStatus(emp.id,'accepted')} disabled={emp.status==='accepted'} className="text-sm bg-green-600 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 font-medium transition-colors">✓ Accept</button>
                            <button onClick={()=>handleCompanyStatus(emp.id,'rejected')} disabled={emp.status==='rejected'} className="text-sm bg-red-600 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 font-medium transition-colors">✕ Reject</button>
                            {emp.status!=='pending'&&<button onClick={()=>handleCompanyStatus(emp.id,'pending')} className="text-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Reset</button>}
                          </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Contact & Profile</h4>
                            <InfoRow label="Email" value={emp.companyEmail}/><InfoRow label="Phone" value={emp.phone||'—'}/><InfoRow label="Address" value={emp.address||'—'}/>
                            <InfoRow label="Website" value={emp.website?<a href={emp.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{emp.website}</a>:'—'}/>
                            {emp.mapLocationAddress&&<InfoRow label="Location" value={emp.mapLocationAddress}/>}
                            {emp.bio&&<div><p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">Bio</p><p className="text-sm text-slate-700 dark:text-slate-300">{emp.bio}</p></div>}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Internship Activity</h4>
                              <div className="flex gap-3">
                                <div className="flex-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{emp.internshipsOffered}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Positions offered</p></div>
                                <div className="flex-1 bg-green-50 dark:bg-green-950/40 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-700 dark:text-green-400">{emp.studentsHired}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Students hired</p></div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Uploaded Documents</h4>
                              {emp.documents.length===0?<p className="text-xs text-slate-400 dark:text-slate-500 italic">No documents uploaded yet.</p>:(
                                <ul className="space-y-2">
                                  {emp.documents.map(doc=>(
                                    <li key={doc.id} className="flex items-center justify-between border border-slate-100 dark:border-slate-700 rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-700/30">
                                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{doc.name}</span>
                                      <div className="flex gap-3 shrink-0">
                                        <button onClick={()=>setViewDocModal(doc)} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"><Icon d={IC.eye} size={11}/> View</button>
                                        <button onClick={()=>handleDocumentDownload(doc)} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"><Icon d={IC.download} size={11}/> Download</button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab==='users'&&(
              <div className="space-y-5">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2><button onClick={refreshUsers} className="flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"><Icon d={IC.refresh} size={12}/> Refresh</button></div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                  {[{id:'students',label:`Students (${platformUsers.filter(u=>u.role==='student').length})`},{id:'instructors',label:`Instructors (${platformUsers.filter(u=>u.role==='instructor').length})`},{id:'employers',label:`Employers (${platformUsers.filter(u=>u.role==='employer').length})`}].map(tab=>(
                    <button key={tab.id} onClick={()=>{setUserMgmtTab(tab.id);setUserSearch('')}} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${userMgmtTab===tab.id?'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400':'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>{tab.label}</button>
                  ))}
                </div>
                <div className="relative max-w-md"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14}/></span><input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder={`Search ${userMgmtTab}…`} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"/></div>
                {userMgmtTab==='students'&&<UserTable users={filteredUsersByRole} onToggle={toggleUserStatus} columns={[{label:'Full name',render:u=><span className="font-medium text-slate-800 dark:text-slate-200">{u.fullName}</span>},{label:'Email',render:u=><span className="text-slate-500 dark:text-slate-400">{u.email}</span>},{label:'Major',render:u=>portfolios.find(p=>p.id===u.email)?.major||'—'},{label:'Projects',render:u=>portfolios.find(p=>p.id===u.email)?.projectsCount??0}]}/>}
                {userMgmtTab==='instructors'&&(
                  <div className="space-y-4">
                    <UserTable users={filteredUsersByRole} onToggle={toggleUserStatus} columns={[{label:'Full name',render:u=><span className="font-medium text-slate-800 dark:text-slate-200">{u.fullName}</span>},{label:'Email',render:u=><span className="text-slate-500 dark:text-slate-400">{u.email}</span>},{label:'Department',render:u=>instructors.find(i=>i.id===u.email)?.department||'—'},{label:'Linked courses',render:u=>{const inst=instructors.find(i=>i.id===u.email);return inst?.linkedCourseCodes.length?inst.linkedCourseCodes.join(', '):'—'}}]}/>
                    {instructors.length>0&&(
                      <Card>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Instructor Profiles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {instructors.filter(i=>!userSearch.trim()||i.fullName.toLowerCase().includes(userSearch.toLowerCase())||i.email.toLowerCase().includes(userSearch.toLowerCase())).map(inst=>(
                            <div key={inst.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 space-y-2 bg-slate-50 dark:bg-slate-700/30">
                              <div><p className="font-semibold text-slate-800 dark:text-slate-200">{inst.fullName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{inst.email}</p></div>
                              {inst.department&&<InfoRow label="Dept" value={inst.department}/>}{inst.bio&&<InfoRow label="Bio" value={inst.bio}/>}{inst.research&&<InfoRow label="Research" value={inst.research}/>}{inst.education&&<InfoRow label="Education" value={inst.education}/>}
                              <div><p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Linked courses</p>{inst.linkedCourseCodes.length?<div className="flex flex-wrap gap-1">{inst.linkedCourseCodes.map(code=><Badge key={code} color="blue">{code}{coursesByCode[code]?` – ${coursesByCode[code].name}`:''}</Badge>)}</div>:<p className="text-xs text-slate-400 dark:text-slate-500 italic">None linked.</p>}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}
                {userMgmtTab==='employers'&&<UserTable users={filteredUsersByRole} onToggle={toggleUserStatus} columns={[{label:'Company',render:u=><span className="font-medium text-slate-800 dark:text-slate-200">{u.companyName||u.fullName}</span>},{label:'Email',render:u=><span className="text-slate-500 dark:text-slate-400">{u.email}</span>},{label:'Industry',render:u=>u.industry||'—'},{label:'Approval',render:u=><StatusBadge status={adminState.employerStatuses[u.email.toLowerCase()]??'pending'}/>}]}/>}
              </div>
            )}

            {activeTab==='projects'&&(
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Projects & Portfolios</h2>
                <Card>
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-slate-800 dark:text-slate-200">All Projects</h3><button onClick={()=>refreshProjects()} className="text-xs text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"><Icon d={IC.refresh} size={11}/> Refresh</button></div>
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <div className="relative flex-1 min-w-48"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14}/></span><input value={projectSearch} onChange={e=>setProjectSearch(e.target.value)} placeholder="Search by title…" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    <select value={projectCourseFilter} onChange={e=>setProjectCourseFilter(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="">All courses</option>{[...new Set([...adminState.courses.map(c=>c.code),...projects.map(p=>p.courseCode).filter(Boolean)])].map(code=><option key={code} value={code}>{code}</option>)}</select>
                    <select value={projectSortBy} onChange={e=>setProjectSortBy(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="createdAt">Newest first</option><option value="rating">Highest rating</option></select>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                      {[{id:'all',label:'All'},{id:'flagged',label:'Flagged',count:flaggedProjects.length},{id:'inactive',label:'Inactive'}].map(f=>(
                        <button key={f.id} onClick={()=>setProjectFlagFilter(f.id)} className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${projectFlagFilter===f.id?'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                          {f.count>0&&<span className="w-1.5 h-1.5 bg-red-500 rounded-full"/>}{f.label}
                          {f.count>0&&<span className="bg-red-500 text-white text-xs rounded-full px-1.5 leading-4">{f.count}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  {projects.length===0?<EmptyState message="No student projects found."/>:projectResults.length===0?<p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">No projects match the current filters.</p>:(
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {projectResults.map(p=>(
                        <div key={p.id} className={`relative rounded-xl border p-4 space-y-2.5 transition-shadow hover:shadow-md ${p.flagged?'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20':'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                          {p.flagged&&<span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" title={`Flagged: ${p.flagReason}`}/>}
                          <div className="pr-5"><p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{p.title||'(untitled)'}</p>{p.summary&&<p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{p.summary}</p>}</div>
                          <div className="flex flex-wrap gap-1.5">{p.courseCode&&<Badge color="blue">{p.courseCode}</Badge>}{p.rating>0&&<Badge color="yellow">★ {p.rating.toFixed(1)}</Badge>}<Badge color={p.status==='active'?'green':'slate'}>{p.status}</Badge>{p.flagged&&<Badge color="red">Flagged</Badge>}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 space-y-0.5">{p.owner&&<p>Owner: {p.owner}</p>}{p.createdAt&&<p>Created: {p.createdAt}</p>}{p.flagged&&p.flagReason&&<p className="text-red-500 dark:text-red-400 font-medium">Reason: {p.flagReason}</p>}</div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={()=>toggleProjectStatus(p.id)} className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">{p.status==='active'?'Deactivate':'Activate'}</button>
                            {p.flagged?<button onClick={()=>unflagProject(p.id)} className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-lg py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">Unflag</button>:<button onClick={()=>openFlagModal(p)} className="flex-1 text-xs border border-red-200 dark:border-red-800 rounded-lg py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center gap-1 transition-colors"><Icon d={IC.flag} size={11}/> Flag</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Student Portfolios</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative flex-1 min-w-48"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14}/></span><input value={portfolioSearch} onChange={e=>setPortfolioSearch(e.target.value)} placeholder="Search…" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    <select value={portfolioMajorFilter} onChange={e=>setPortfolioMajorFilter(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="">All majors</option>{[...new Set(portfolios.map(p=>p.major).filter(Boolean))].map(m=><option key={m} value={m}>{m}</option>)}</select>
                    <select value={portfolioSkillFilter} onChange={e=>setPortfolioSkillFilter(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="">All skills</option>{[...new Set(portfolios.flatMap(p=>p.skills))].map(s=><option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  {portfolios.length===0?<EmptyState message="No student accounts found."/>:(
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {portfolioResults.map(p=>(
                        <div key={p.id} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-4 space-y-2 hover:shadow-md transition-shadow">
                          <div><p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{p.email}</p></div>
                          <div className="flex flex-wrap gap-1.5">{p.major&&<Badge color="blue">{p.major}</Badge>}<Badge color="slate">{p.projectsCount} project{p.projectsCount!==1?'s':''}</Badge>{p.gpa&&<Badge color="yellow">GPA {p.gpa}</Badge>}</div>
                          {p.skills.length>0&&<div className="flex flex-wrap gap-1">{p.skills.slice(0,5).map(s=><span key={s} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{s}</span>)}{p.skills.length>5&&<span className="text-xs text-slate-400 dark:text-slate-500">+{p.skills.length-5}</span>}</div>}
                          {p.projects.length>0&&<div><p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">Projects</p><ul className="space-y-0.5">{p.projects.slice(0,3).map(proj=><li key={proj.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">{proj.flagged&&<span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"/>}{proj.title}</li>)}{p.projects.length>3&&<li className="text-xs text-slate-400 dark:text-slate-500">+{p.projects.length-3} more</li>}</ul></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab==='courses'&&(
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h2>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{courseForm.id?'Edit Course':'New Course'}</h3>
                  <form className="flex flex-wrap gap-3 items-end" onSubmit={handleCourseSubmit}>
                    <div className="flex flex-col gap-1 flex-1 min-w-36"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Course code</label><input value={courseForm.code} onChange={e=>setCourseForm(p=>({...p,code:e.target.value}))} placeholder="e.g. CSEN701" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    <div className="flex flex-col gap-1 flex-1 min-w-48"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Course name</label><input value={courseForm.name} onChange={e=>setCourseForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Advanced Software Engineering" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    <div className="flex gap-2"><button type="submit" className="bg-blue-700 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-800 transition-colors">{courseForm.id?'Update':'Add Course'}</button>{courseForm.id&&<button type="button" onClick={()=>setCourseForm({id:null,code:'',name:''})} className="border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>}</div>
                  </form>
                </Card>
                <Card className="p-0 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"><h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">All Courses ({adminState.courses.length})</h3></div>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700"><tr>{['Code','Name','Linked instructors','Actions'].map(h=><th key={h} className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>)}</tr></thead>
                    <tbody>
                      {adminState.courses.map(c=>{const linked=instructors.filter(i=>i.linkedCourseCodes.includes(c.code));return(
                        <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">{c.code}</td>
                          <td className="p-4 text-slate-700 dark:text-slate-300">{c.name}</td>
                          <td className="p-4 text-xs text-slate-500 dark:text-slate-400">{linked.length?linked.map(i=>i.fullName).join(', '):<span className="italic">None</span>}</td>
                          <td className="p-4 flex gap-3"><button onClick={()=>setCourseForm(c)} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">Edit</button><button onClick={()=>deleteCourse(c.id)} className="text-red-600 dark:text-red-400 hover:underline text-xs">Delete</button></td>
                        </tr>
                      )})}
                      {adminState.courses.length===0&&<tr><td colSpan={4} className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">No courses yet. Add one above.</td></tr>}
                    </tbody>
                  </table>
                </Card>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Link / Unlink Requests <span className="ml-2 text-sm text-slate-400 dark:text-slate-500 font-normal">({adminState.linkRequests.filter(r=>r.status==='pending').length} pending)</span></h3>
                  {adminState.linkRequests.length===0?<p className="text-sm text-slate-400 dark:text-slate-500">No linking requests received.</p>:(
                    <ul className="space-y-2">
                      {adminState.linkRequests.map(req=>(
                        <li key={req.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-700/30">
                          <span className="text-sm text-slate-700 dark:text-slate-300"><strong>{req.instructorName||req.instructorEmail}</strong> · {req.type} <strong>{req.courseCode}</strong><span className="ml-2 text-slate-400 dark:text-slate-500 text-xs">({req.status})</span></span>
                          {req.status==='pending'&&<div className="flex gap-2"><button onClick={()=>handleLinkRequest(req.id,'accepted')} className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-3 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900 transition-colors">Accept</button><button onClick={()=>handleLinkRequest(req.id,'rejected')} className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors">Reject</button></div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            )}

            {activeTab==='notifications'&&(
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications & Appeals</h2>
                <Card>
                  <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
                    <div className="flex items-center gap-3"><h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>{!allRead&&adminState.notificationsEnabled&&<Badge color="red">{unreadCount} unread</Badge>}</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={toggleNotificationsEnabled} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${adminState.notificationsEnabled?'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 hover:bg-green-100':'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}><span className={`w-2 h-2 rounded-full ${adminState.notificationsEnabled?'bg-green-500':'bg-slate-400'}`}/>{adminState.notificationsEnabled?'Notifications ON':'Notifications OFF'}</button>
                      <button onClick={()=>markAllNotifications(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                      <button onClick={()=>markAllNotifications(false)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Mark all unread</button>
                    </div>
                  </div>
                  {adminState.notifications.length===0?<p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet.</p>:(
                    <ul className="space-y-1.5">
                      {adminState.notifications.map(n=>(
                        <li key={n.id} className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3.5 transition-all ${n.read?'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800':'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20'}`}>
                          <div className="flex items-start gap-3 min-w-0"><span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read?'bg-slate-300 dark:bg-slate-600':'bg-blue-500'}`}/><div className="min-w-0"><p className={`text-sm font-medium ${n.read?'text-slate-500 dark:text-slate-400':'text-slate-800 dark:text-slate-200'}`}>{n.title}</p><p className="text-sm text-slate-600 dark:text-slate-400">{n.message}</p></div></div>
                          <div className="flex items-center gap-3 shrink-0 text-right"><span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{n.createdAt}</span><button onClick={()=>updateNotificationRead(n.id,!n.read)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">{n.read?'Mark unread':'Mark read'}</button></div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Student Appeals</h3>
                  {adminState.appeals.length===0?<p className="text-sm text-slate-400 dark:text-slate-500">No appeals submitted.</p>:(
                    <ul className="space-y-4">
                      {adminState.appeals.map(appeal=>{const project=projects.find(p=>p.id===appeal.projectId);return(
                        <li key={appeal.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3 bg-white dark:bg-slate-800">
                          <div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-slate-800 dark:text-slate-200">{appeal.studentName}</p><p className="text-xs text-slate-500 dark:text-slate-400">{appeal.studentEmail}</p></div><StatusBadge status={appeal.status}/></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><InfoRow label="Project" value={appeal.projectTitle||project?.title||`ID ${appeal.projectId}`}/><InfoRow label="Submitted" value={appeal.createdAt||'—'}/>{project?.flagReason&&<InfoRow label="Flag reason" value={project.flagReason}/>}</div>
                          <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 rounded-lg px-4 py-3"><p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Appeal reason</p><p className="text-sm text-slate-700 dark:text-slate-300">{appeal.reason}</p></div>
                          {appeal.status==='pending'?(<div className="flex gap-2"><button onClick={()=>handleAppealDecision(appeal.id,'accepted')} className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"><Icon d={IC.check} size={13}/> Accept Appeal</button><button onClick={()=>handleAppealDecision(appeal.id,'rejected')} className="flex items-center gap-1.5 bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"><Icon d={IC.x} size={13}/> Reject Appeal</button></div>):(<div className="flex items-center gap-2"><p className="text-sm text-slate-500 dark:text-slate-400">Decision: <strong className="capitalize text-slate-700 dark:text-slate-300">{appeal.status}</strong></p><button onClick={()=>handleAppealDecision(appeal.id,'pending')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Reopen</button></div>)}
                        </li>
                      )})}
                    </ul>
                  )}
                </Card>
              </div>
            )}

            {activeTab==='adminAccounts'&&(
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Accounts</h2>
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">New Admin Account</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Only verified GUC email domains are accepted (e.g. @guc.edu.eg).</p>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleCreateAdmin}>
                    <div className="flex flex-col gap-1 md:col-span-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">GUC email</label><input required type="email" autoComplete="email" value={adminAccountForm.email} onChange={e=>{setAdminAccountError('');setAdminAccountForm(p=>({...p,email:e.target.value}))}} placeholder="name@guc.edu.eg" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    <div className="flex flex-col gap-1 md:col-span-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Password</label><input required type="password" autoComplete="new-password" value={adminAccountForm.password} onChange={e=>{setAdminAccountError('');setAdminAccountForm(p=>({...p,password:e.target.value}))}} placeholder="Password" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"/></div>
                    {adminAccountError&&<p className="md:col-span-2 text-sm text-red-600 dark:text-red-400 font-medium">{adminAccountError}</p>}
                    {adminAccountSuccess&&<p className="md:col-span-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{adminAccountSuccess}</p>}
                    <button type="submit" className="md:col-span-2 w-fit bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors">Create Admin</button>
                  </form>
                </Card>
                <Card className="p-0 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"><h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">All Admin Accounts ({platformUsers.filter(u=>u.role==='admin').length})</h3></div>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700"><tr>{['Name','Email','Status','Action'].map(h=><th key={h} className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>)}</tr></thead>
                    <tbody>
                      {platformUsers.filter(u=>u.role==='admin').map(user=>(
                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{user.fullName}</td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="p-4"><Badge color={user.isActive?'green':'slate'}>{user.isActive?'Active':'Inactive'}</Badge></td>
                          <td className="p-4"><button onClick={()=>toggleUserStatus(user)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{user.isActive?'Deactivate':'Activate'}</button></td>
                        </tr>
                      ))}
                      {platformUsers.filter(u=>u.role==='admin').length===0&&<tr><td colSpan={4} className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">No admin accounts found.</td></tr>}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {activeTab==='settings'&&<SettingsTab isDark={isDark} setTheme={setTheme} user={currentUser}/>}

            {/* ── Platform Overview ── */}
            {activeTab==='overview'&&(
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl"/>
                  <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"/>
                  <div className="relative"><h2 className="text-3xl font-bold text-white">Platform Overview</h2><p className="text-blue-100 text-sm mt-1">Live snapshot of users, activity, and platform health.</p></div>
                </div>

                {/* Quick Actions */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { label:'Manage Users',      icon:IC.users,     tab:'users',         color:'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
                      { label:'Review Approvals',  icon:IC.briefcase, tab:'approvals',     color:'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
                      { label:'View Reports',      icon:IC.fileText,  tab:'reports',       color:'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
                      { label:'Platform Settings', icon:IC.settings,  tab:'settings',      color:'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
                      { label:'Export Analytics',  icon:IC.download,  tab:null,            color:'bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900',
                        fn:() => { const data={users:stats,projects:projects.length,employers:employers.length,internships:employers.reduce((s,e)=>s+e.internshipsOffered,0)}; const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='platform-analytics.json'; a.click() }
                      },
                    ].map(a => (
                      <button key={a.label} onClick={a.fn||(()=>setActiveTab(a.tab))}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.color}`}>
                        <Icon d={a.icon} size={20}/>
                        <span className="text-xs font-semibold leading-tight">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Analytics KPIs */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label:'Total Users',         value:stats.totalUsers,                                                    color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40' },
                    { label:'Active Students',     value:platformUsers.filter(u=>u.role==='student'&&u.isActive).length,      color:'text-emerald-700 dark:text-emerald-400',bg:'bg-emerald-50 dark:bg-emerald-950/40' },
                    { label:'Active Instructors',  value:platformUsers.filter(u=>u.role==='instructor'&&u.isActive).length,   color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40' },
                    { label:'Active Employers',    value:platformUsers.filter(u=>u.role==='employer'&&u.isActive).length,     color:'text-orange-700 dark:text-orange-400',bg:'bg-orange-50 dark:bg-orange-950/40' },
                    { label:'Total Internships',   value:employers.reduce((s,e)=>s+e.internshipsOffered,0),                   color:'text-rose-700 dark:text-rose-400',   bg:'bg-rose-50 dark:bg-rose-950/40' },
                    { label:'Total Projects',      value:stats.totalProjects,                                                 color:'text-yellow-700 dark:text-yellow-400',bg:'bg-yellow-50 dark:bg-yellow-950/40' },
                  ].map(s=>(
                    <div key={s.label} className={`rounded-xl border-0 p-4 shadow-sm ${s.bg}`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Insights — growth bars */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.trendUp} size={15}/>Admin Insights</h3>
                    <div className="space-y-4">
                      {[
                        { label:'Student Engagement',  pct:stats.totalStudents>0?Math.min(Math.round((projects.filter(p=>p.status==='active').length/Math.max(stats.totalStudents,1))*100),100):0, color:'bg-blue-600' },
                        { label:'Employer Activity',   pct:stats.totalEmployers>0?Math.min(Math.round((employers.filter(e=>e.internshipsOffered>0).length/Math.max(stats.totalEmployers,1))*100),100):0, color:'bg-orange-500' },
                        { label:'Approval Rate',       pct:employers.length>0?Math.round((employers.filter(e=>e.status==='accepted').length/employers.length)*100):0, color:'bg-green-500' },
                        { label:'Flagged Content Rate',pct:projects.length>0?Math.round((flaggedProjects.length/projects.length)*100):0, color:'bg-red-500' },
                      ].map(m=>(
                        <div key={m.label}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.label}</span>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{m.pct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div className={`h-2 rounded-full transition-all duration-700 ${m.color}`} style={{width:`${m.pct}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* User Management Center widget */}
                  <Card>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.users} size={15}/>User Management Center</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label:'Pending Approvals',  value:pendingApprovals,                                                          color:'text-amber-700 dark:text-amber-400',   bg:'bg-amber-50 dark:bg-amber-950/40' },
                        { label:'Suspended Accounts', value:platformUsers.filter(u=>!u.isActive).length,                               color:'text-red-700 dark:text-red-400',       bg:'bg-red-50 dark:bg-red-950/40' },
                        { label:'Verified Employers', value:employers.filter(e=>e.isVerified||e.status==='accepted').length,           color:'text-green-700 dark:text-green-400',   bg:'bg-green-50 dark:bg-green-950/40' },
                        { label:'Total Admins',       value:platformUsers.filter(u=>u.role==='admin').length,                          color:'text-purple-700 dark:text-purple-400', bg:'bg-purple-50 dark:bg-purple-950/40' },
                      ].map(s=>(
                        <div key={s.label} className={`rounded-xl p-3 ${s.bg}`}>
                          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={()=>setActiveTab('users')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"><Icon d={IC.arrowRight} size={12}/>Manage Users</button>
                      <button onClick={()=>setActiveTab('approvals')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"><Icon d={IC.briefcase} size={12}/>Review Approvals</button>
                    </div>
                  </Card>
                </div>

                {/* Recent Platform Activity feed */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.activity} size={15}/>Recent Platform Activity</h3>
                  {(()=>{
                    const feed=[]
                    platformUsers.slice(-5).reverse().forEach(u=>feed.push({ id:'user_'+u.id, label:`New ${u.role} registered`, sub:u.email, icon:IC.user, color:'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' }))
                    employers.filter(e=>e.status==='accepted').slice(0,3).forEach(e=>feed.push({ id:'emp_'+e.id, label:`Employer approved: ${e.companyName}`, sub:e.companyEmail, icon:IC.check, color:'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' }))
                    employers.filter(e=>e.status==='rejected').slice(0,2).forEach(e=>feed.push({ id:'rej_'+e.id, label:`Employer rejected: ${e.companyName}`, sub:e.companyEmail, icon:IC.x, color:'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' }))
                    flaggedProjects.slice(0,3).forEach(p=>feed.push({ id:'flag_'+p.id, label:`Project flagged: "${p.title}"`, sub:p.owner||'', icon:IC.flag, color:'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' }))
                    projects.filter(p=>p.status==='active').slice(0,3).forEach(p=>feed.push({ id:'proj_'+p.id, label:`New project: "${p.title}"`, sub:p.courseCode||'', icon:IC.folder, color:'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' }))
                    if(feed.length===0) return <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No recent activity.</p>
                    return (
                      <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-5 space-y-4">
                        {feed.slice(0,8).map(ev=>(
                          <li key={ev.id} className="relative">
                            <span className={`absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-800 ${ev.color}`}><Icon d={ev.icon} size={9}/></span>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{ev.label}</p>
                            {ev.sub&&<p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ev.sub}</p>}
                          </li>
                        ))}
                      </ol>
                    )
                  })()}
                </Card>

                {/* Role Management */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.layers} size={15}/>Role Management</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { role:'Students',    count:stats.totalStudents,    active:platformUsers.filter(u=>u.role==='student'&&u.isActive).length,    tab:'users', color:'blue' },
                      { role:'Instructors', count:stats.totalInstructors, active:platformUsers.filter(u=>u.role==='instructor'&&u.isActive).length, tab:'users', color:'purple' },
                      { role:'Employers',   count:stats.totalEmployers,   active:platformUsers.filter(u=>u.role==='employer'&&u.isActive).length,   tab:'users', color:'orange' },
                      { role:'Admins',      count:platformUsers.filter(u=>u.role==='admin').length, active:platformUsers.filter(u=>u.role==='admin'&&u.isActive).length, tab:'adminAccounts', color:'green' },
                    ].map(r=>{
                      const colorMap={blue:'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300',purple:'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900 text-purple-700 dark:text-purple-300',orange:'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900 text-orange-700 dark:text-orange-300',green:'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900 text-green-700 dark:text-green-300'}
                      return (
                        <button key={r.role} onClick={()=>setActiveTab(r.tab)} className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${colorMap[r.color]}`}>
                          <p className="text-2xl font-bold">{r.count}</p>
                          <p className="text-sm font-semibold mt-0.5">{r.role}</p>
                          <p className="text-xs opacity-70 mt-1">{r.active} active</p>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Reports Center ── */}
            {activeTab==='reports'&&(
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports Center</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Platform-wide reporting and export tools.</p></div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label:'User Reports',        icon:IC.users,     desc:`${stats.totalUsers} total users across all roles`,                  color:'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
                    { label:'Internship Reports',  icon:IC.briefcase, desc:`${employers.reduce((s,e)=>s+e.internshipsOffered,0)} positions offered total`, color:'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
                    { label:'Project Reports',     icon:IC.folder,    desc:`${stats.totalProjects} projects, ${flaggedProjects.length} flagged`, color:'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
                    { label:'System Reports',      icon:IC.server,    desc:'Platform health and performance summary',                            color:'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900' },
                  ].map(r=>(
                    <div key={r.label} className={`rounded-xl border p-5 shadow-sm ${r.color}`}>
                      <div className="flex items-center gap-2 mb-2"><Icon d={r.icon} size={16}/><p className="font-semibold">{r.label}</p></div>
                      <p className="text-xs opacity-80 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>

                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Export Reports</h3>
                  <div className="space-y-2">
                    {[
                      { label:'Export All Users (JSON)',        fn:()=>{ const d=platformUsers.map(u=>({email:u.email,role:u.role,active:u.isActive})); const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='users-report.json'; a.click() } },
                      { label:'Export All Projects (JSON)',     fn:()=>{ const d=projects.map(p=>({title:p.title,course:p.courseCode,owner:p.owner,flagged:p.flagged,rating:p.rating,status:p.status})); const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='projects-report.json'; a.click() } },
                      { label:'Export Employer Approvals (JSON)', fn:()=>{ const d=employers.map(e=>({company:e.companyName,email:e.companyEmail,status:e.status,internships:e.internshipsOffered,hired:e.studentsHired})); const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='approvals-report.json'; a.click() } },
                      { label:'Export Platform Analytics (JSON)', fn:()=>{ const d={users:stats,projects:projects.length,flagged:flaggedProjects.length,internships:employers.reduce((s,e)=>s+e.internshipsOffered,0),studentsHired:employers.reduce((s,e)=>s+e.studentsHired,0)}; const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='platform-analytics.json'; a.click() } },
                    ].map(r=>(
                      <button key={r.label} onClick={r.fn}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-3 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"><Icon d={IC.download} size={14}/></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.label}</span>
                        </div>
                        <Icon d={IC.arrowRight} size={14}/>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Recent report activity */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Report Activity</h3>
                  <div className="space-y-2">
                    {adminState.notifications.slice(0,6).map(n=>(
                      <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${n.read?'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800':'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20'}`}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"><Icon d={IC.bell} size={12}/></div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${n.read?'text-slate-500 dark:text-slate-400':'text-slate-800 dark:text-slate-200'}`}>{n.title}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.createdAt}</p>
                        </div>
                        {!n.read&&<span className="h-2 w-2 shrink-0 mt-1.5 rounded-full bg-blue-600"/>}
                      </div>
                    ))}
                    {adminState.notifications.length===0&&<p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No report activity yet.</p>}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Audit Logs ── */}
            {activeTab==='audit'&&(
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete history of admin and platform actions.</p></div>
                <Card className="p-0 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Action Log</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{(()=>{
                      let count=0
                      count+=platformUsers.length
                      count+=employers.filter(e=>e.status!=='pending').length
                      count+=flaggedProjects.length
                      count+=adminState.appeals.filter(a=>a.status!=='pending').length
                      return count
                    })()} entries</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/20">
                        <tr>{['Action','User / Entity','Role','Details','Timestamp'].map(h=><th key={h} className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {(()=>{
                          const logs=[]
                          platformUsers.forEach(u=>logs.push({ action:'User Created', entity:u.email, role:u.role, detail:u.isActive?'Active account':'Inactive account', ts:'On registration' }))
                          employers.filter(e=>e.status==='accepted').forEach(e=>logs.push({ action:'Employer Approved', entity:e.companyName, role:'employer', detail:'Application accepted', ts:new Date().toLocaleDateString() }))
                          employers.filter(e=>e.status==='rejected').forEach(e=>logs.push({ action:'Employer Rejected', entity:e.companyName, role:'employer', detail:'Application rejected', ts:new Date().toLocaleDateString() }))
                          flaggedProjects.forEach(p=>logs.push({ action:'Project Flagged', entity:p.title||'Untitled', role:'admin', detail:p.flagReason||'Policy violation', ts:p.createdAt||'—' }))
                          platformUsers.filter(u=>!u.isActive).forEach(u=>logs.push({ action:'Account Suspended', entity:u.email, role:u.role, detail:'Account deactivated', ts:'—' }))
                          adminState.appeals.filter(a=>a.status!=='pending').forEach(a=>logs.push({ action:`Appeal ${a.status}`, entity:a.studentName, role:'student', detail:`"${a.projectTitle}"`, ts:a.createdAt||'—' }))
                          return logs.length===0?(
                            <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">No audit entries yet.</td></tr>
                          ):logs.map((log,i)=>{
                            const actionColor = log.action.includes('Created')||log.action.includes('Approved')||log.action.includes('accepted')?'text-green-700 dark:text-green-400':log.action.includes('Rejected')||log.action.includes('Suspended')||log.action.includes('Flagged')?'text-red-700 dark:text-red-400':'text-slate-700 dark:text-slate-300'
                            return (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className={`p-4 font-medium ${actionColor}`}>{log.action}</td>
                                <td className="p-4 text-slate-700 dark:text-slate-300 max-w-[160px] truncate">{log.entity}</td>
                                <td className="p-4"><Badge color={log.role==='admin'?'red':log.role==='employer'?'orange':log.role==='instructor'?'purple':'blue'}>{log.role}</Badge></td>
                                <td className="p-4 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{log.detail}</td>
                                <td className="p-4 text-slate-400 dark:text-slate-500 text-xs">{log.ts}</td>
                              </tr>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Platform Health ── */}
            {activeTab==='health'&&(
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Health</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">System status and performance indicators.</p></div>

                {/* Status indicators */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label:'System Status',   status:'Operational', icon:IC.server,   ok:true },
                    { label:'Database',        status:'Healthy',     icon:IC.database, ok:true },
                    { label:'API Status',      status:'All Systems Go',icon:IC.activity,ok:true },
                    { label:'Storage',         status:localStorage.length>200?'Warning':'Normal', icon:IC.layers, ok:localStorage.length<=200 },
                  ].map(s=>(
                    <div key={s.label} className={`rounded-xl border p-5 shadow-sm ${s.ok?'border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/30':'border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.ok?'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400':'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}><Icon d={s.icon} size={16}/></div>
                        <span className={`flex h-3 w-3 rounded-full ${s.ok?'bg-green-500':'bg-amber-500'}`}/>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{s.label}</p>
                      <p className={`text-xs mt-0.5 font-medium ${s.ok?'text-green-600 dark:text-green-400':'text-amber-600 dark:text-amber-400'}`}>{s.status}</p>
                    </div>
                  ))}
                </div>

                {/* Storage usage */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">LocalStorage Usage</h3>
                  <div className="space-y-3">
                    {(()=>{
                      const total = Object.keys(localStorage).length
                      const items = [
                        { label:'User Profiles',   count:Object.keys(localStorage).filter(k=>k.includes('profile')).length },
                        { label:'Project Data',    count:Object.keys(localStorage).filter(k=>k.includes('project')||k.includes('student_p')).length },
                        { label:'Employer Data',   count:Object.keys(localStorage).filter(k=>k.includes('emp_')).length },
                        { label:'Admin Data',      count:Object.keys(localStorage).filter(k=>k.includes('admin')||k.includes('guc_')).length },
                        { label:'Other',           count:Math.max(0,total-Object.keys(localStorage).filter(k=>k.includes('profile')||k.includes('project')||k.includes('student_p')||k.includes('emp_')||k.includes('admin')||k.includes('guc_')).length) },
                      ]
                      return items.map(item=>{
                        const pct=total>0?Math.round((item.count/total)*100):0
                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1"><span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.count} keys ({pct}%)</span></div>
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div className="h-2 rounded-full bg-blue-600 transition-all duration-700" style={{width:`${pct}%`}}/></div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Total keys in localStorage: <strong className="text-slate-600 dark:text-slate-300">{Object.keys(localStorage).length}</strong></p>
                </Card>

                {/* Platform metrics summary */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Platform Metrics</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label:'Total Registered Users',      value:stats.totalUsers },
                      { label:'Active User Accounts',        value:platformUsers.filter(u=>u.isActive).length },
                      { label:'Suspended Accounts',          value:platformUsers.filter(u=>!u.isActive).length },
                      { label:'Total Projects Submitted',    value:stats.totalProjects },
                      { label:'Active Projects',             value:activeProjectCount },
                      { label:'Flagged Projects',            value:flaggedProjects.length },
                      { label:'Pending Employer Approvals',  value:pendingApprovals },
                      { label:'Open Appeals',                value:adminState.appeals.filter(a=>a.status==='pending').length },
                      { label:'Unread Notifications',        value:unreadCount },
                      { label:'Courses in Catalog',          value:stats.totalCourses },
                    ].map(m=>(
                      <div key={m.label} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-2.5">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{m.label}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Content Moderation ── */}
            {activeTab==='moderation'&&(
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Moderation</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review and act on flagged content across the platform.</p></div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label:'Flagged Projects',    value:flaggedProjects.length,                              color:'text-red-700 dark:text-red-400',   bg:'bg-red-50 dark:bg-red-950/40' },
                    { label:'Flagged Internships', value:employers.reduce((s,e)=>s+e.internshipsList.filter(i=>i.status==='Position Filled').length,0), color:'text-amber-700 dark:text-amber-400',bg:'bg-amber-50 dark:bg-amber-950/40' },
                    { label:'Pending Appeals',     value:adminState.appeals.filter(a=>a.status==='pending').length, color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40' },
                  ].map(s=>(
                    <div key={s.label} className={`rounded-xl p-4 shadow-sm ${s.bg}`}><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p></div>
                  ))}
                </div>

                {/* Flagged projects */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.flag} size={15}/>Flagged Projects <Badge color="red">{flaggedProjects.length}</Badge></h3>
                  {flaggedProjects.length===0?(
                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40 text-green-500"><Icon d={IC.check} size={22}/></div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No flagged projects</p>
                    </div>
                  ):(
                    <div className="space-y-2">
                      {flaggedProjects.map(p=>(
                        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"><Icon d={IC.flag} size={14}/></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Owner: {p.owner||'—'} · {p.flagReason||'No reason'}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={()=>unflagProject(p.id)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Unflag</button>
                            <button onClick={()=>toggleProjectStatus(p.id)} className={`rounded-lg px-2.5 py-1 text-xs font-medium text-white transition-colors ${p.status==='active'?'bg-red-600 hover:bg-red-700':'bg-green-600 hover:bg-green-700'}`}>{p.status==='active'?'Deactivate':'Activate'}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Appeals quick view */}
                <Card>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Icon d={IC.alertCircle} size={15}/>Pending Appeals <Badge color="yellow">{adminState.appeals.filter(a=>a.status==='pending').length}</Badge></h3>
                  {adminState.appeals.filter(a=>a.status==='pending').length===0?(
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No pending appeals.</p>
                  ):(
                    <div className="space-y-2">
                      {adminState.appeals.filter(a=>a.status==='pending').map(appeal=>(
                        <div key={appeal.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-sm font-bold">{appeal.studentName?.[0]||'?'}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{appeal.studentName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">"{appeal.projectTitle}" · {appeal.createdAt}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button onClick={()=>handleAppealDecision(appeal.id,'accepted')} className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors">Accept</button>
                            <button onClick={()=>handleAppealDecision(appeal.id,'rejected')} className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>

      {viewDocModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={()=>setViewDocModal(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-4 shrink-0">
              <h3 className="font-semibold text-slate-800 dark:text-white">{viewDocModal.name}</h3>
              <div className="flex items-center gap-3"><button onClick={()=>handleDocumentDownload(viewDocModal)} className="flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"><Icon d={IC.download} size={13}/> Download</button><button onClick={()=>setViewDocModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none">×</button></div>
            </div>
            <div className="overflow-auto p-5 flex-1">{viewDocModal.isImage?<img src={viewDocModal.content} alt={viewDocModal.name} className="max-w-full rounded-lg mx-auto"/>:<pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 leading-relaxed">{viewDocModal.content}</pre>}</div>
          </div>
        </div>
      )}

      {flagModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={()=>setFlagModal(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Icon d={IC.flag} size={16}/> Flag Project</h3><button onClick={()=>setFlagModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl">×</button></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">You are flagging: <strong className="text-slate-800 dark:text-slate-200">"{flagModal.title}"</strong></p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for flagging <span className="text-red-500">*</span></label>
              <textarea value={flagReason} onChange={e=>setFlagReason(e.target.value)} rows={4} placeholder="Describe the violation…" className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none resize-none"/>
              {!flagReason.trim()&&<p className="text-xs text-red-500 mt-1">A reason is required before flagging.</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={confirmFlag} disabled={!flagReason.trim()} className="flex-1 bg-red-600 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors">Confirm Flag</button>
              <button onClick={()=>setFlagModal(null)} className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}