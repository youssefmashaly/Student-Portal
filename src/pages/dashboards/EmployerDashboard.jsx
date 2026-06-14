import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser, getEmployerProfile, saveEmployerProfile } from '../../data/authStorage'
import projectsData from '../../data/projects'
import studentsData from '../../data/students'
import { useTheme } from '../../context/ThemeContext'


// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)
const IC = {
  home:     'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  chat:     'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  briefcase:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z',
  chart:    'M18 20V10M12 20V4M6 20v-6',
  logout:   'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  plus:     'M12 5v14M5 12h14',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:    'M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 6V4h4v2',
  x:        'M18 6L6 18M6 6l12 12',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z',
  check:    'M20 6L9 17l-5-5',
  link:     'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  upload:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  menu:     'M3 12h18M3 6h18M3 18h18',
  eye:      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6',
  heart:    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  moon:     'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  sun:      'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  flag:     'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  download:   'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  activity:   'M22 12h-4l-3 9L9 3l-3 9H2',
  trendUp:    'M23 6l-9.5 9.5-5-5L1 18',
  layers:     'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  userCheck:  'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M16 11l2 2 4-4',
  bookmark:   'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
  history:    'M12 8v4l3 3M3.05 11a9 9 0 109-8.77',
  target:     'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  filter:     'M22 3H2l8 9.46V19l4 2V12.46L22 3z',
  gitMerge:   'M18 21a3 3 0 100-6 3 3 0 000 6zM6 3a3 3 0 100 6 3 3 0 000-6zM6 9v12M18 15V9a9 9 0 00-9-9',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  info:       'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
}

function Button({ children, onClick, type = 'button', className = '', variant = 'primary', disabled = false }) {
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800',
    secondary: 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  )
}

function Link({ to, children, className = '' }) {
  const navigate = useNavigate()
  return (
    <span onClick={() => navigate(to)} className={`cursor-pointer ${className}`}>{children}</span>
  )
}

function EmployerDashboard() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const { isDark, setTheme, toggleTheme } = useTheme()
  const empId = user?.email?.toLowerCase() || 'default'

  const storageKeys = {
    internships: `emp_interns_${empId}`,
    favorites: `emp_favs_${empId}`,
    messages: `emp_msgs_${empId}`,
    notifications: `emp_notifs_${empId}`
  }

  const defaultLogo = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="20" fill="%231d4ed8"/><text x="60" y="70" text-anchor="middle" font-size="34" font-family="Arial" font-weight="700" fill="white">DC</text></svg>'
  const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="%23dbeafe"/><circle cx="60" cy="45" r="22" fill="%231e40af"/><path d="M24 108c7-28 65-28 72 0" fill="%231e40af"/></svg>'

  const [activeTab, setActiveTab] = useState('profile')
  const [notification, setNotification] = useState({ show: false, message: '' })
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [sidebarOpen, setSidebar] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [notifDropdown, setNotifDropdown] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  const [userNotifications, setUserNotifications] = useState(() => {
    const saved = localStorage.getItem(storageKeys.notifications)
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'New application received for Business Analyst role', read: false, time: '2 mins ago' },
      { id: 2, text: 'Reminder: review nominated applicants this week', read: false, time: '1 hour ago' },
      { id: 3, text: 'New private message from Ahmed Ali', read: false, time: 'Today' },
      { id: 4, text: 'Your public profile location was updated', read: true, time: 'Yesterday' }
    ]
  })

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    bio: 'Technology employer offering students real internship experience in software engineering, data analysis, business operations, and product development. Our internships focus on mentorship, practical delivery, teamwork, and preparing students for real workplace expectations.',
    address: 'New Cairo, Cairo, Egypt',
    phone: '01012345678',
    website: 'https://demo-company.example.com',
    logo: defaultLogo,
    profilePicture: defaultAvatar,
    taxCertificate: '',
    taxCertificateName: '',
    mapLocation: 'German University in Cairo',
    isVerified: false,
    researchInterests: 'Student mentoring, software delivery, data-driven products, workplace readiness.',
    education: 'Registered GUC employer partner with internship mentoring and technical supervision experience.'
  })

  const [mapAddress, setMapAddress] = useState('')
  const [mapSrc, setMapSrc] = useState('')

  const [instructors] = useState([
    {
      id: 1,
      name: 'Demo Instructor',
      email: 'instructor@guc.edu.eg',
      bio: 'Associate professor focusing on software engineering education and applied machine learning. Advises undergraduate capstone teams and graduate seminars.',
      researchInterests: 'Human-computer interaction for collaboration tools, educational data mining, and trustworthy ML in production systems.',
      education: 'Ph.D. Computer Science - Technical University; M.Sc. Software Engineering - GUC.',
      courses: ['Bachelor Project'],
      photo: defaultAvatar
    },
    {
      id: 2,
      name: 'Lojaina Elsalamouny',
      email: 'loji@guc.edu.eg',
      bio: 'Instructor and project mentor supporting software engineering students across project planning, architecture, implementation, and evaluation.',
      researchInterests: 'Software Engineering, HCI, Education Technology',
      education: 'M.Sc. Computer Science - GUC.',
      courses: ['Bachelor Project', 'CSEN 603', 'CSEN 701'],
      photo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="%23dbeafe"/><text x="60" y="72" text-anchor="middle" font-size="38" font-family="Arial" font-weight="700" fill="%232563eb">L</text></svg>'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [internSearch, setInternSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')

  const [internships, setInternships] = useState(() => {
    const saved = localStorage.getItem(storageKeys.internships)
    return saved ? JSON.parse(saved) : [
      {
        id: 1, title: 'Industrial IoT Engineering Intern', company: 'Siemens', location: 'Cairo, Egypt',
        details: 'Work on edge telemetry pipelines for manufacturing dashboards. Requirements: Strong C++ or Python, basic networking, GPA 3.2+.',
        skills: 'C++, Python, MQTT', duration: '6 months', programmingLanguages: 'C++, Python',
        status: 'Currently Hiring', deadline: '2026-09-15', posted: '2026-04-01', isArchived: false,
        applicants: [
          { id: 101, name: 'Laila Hassan', email: 'laila@guc.edu.eg', status: 'Nominated', contributionScore: 92 },
          { id: 102, name: 'Ahmed Ali', email: 'ahmed@guc.edu.eg', status: 'Accepted', contributionScore: 88 },
          { id: 103, name: 'Carim Mansour', email: 'carim@guc.edu.eg', status: 'Rejected', contributionScore: 74 }
        ]
      },
      {
        id: 2, title: 'Cloud Software Engineer Intern', company: 'Microsoft', location: 'Remote (MENA)',
        details: 'Azure microservices, observability, and reliability for education-sector workloads. Requirements: Algorithms, distributed systems coursework, Git.',
        skills: 'Azure, Kubernetes, TypeScript, C#', duration: '3 months', programmingLanguages: 'TypeScript, C#',
        status: 'Currently Hiring', deadline: '2026-08-30', posted: '2026-04-01', isArchived: false,
        applicants: [
          { id: 104, name: 'Nour Adel', email: 'nour@guc.edu.eg', status: 'Accepted', contributionScore: 96 },
          { id: 105, name: 'Youssef Samir', email: 'youssef@guc.edu.eg', status: 'Nominated', contributionScore: 81 }
        ]
      },
      {
        id: 3, title: 'ADAS Perception Intern', company: 'Valeo', location: 'Cairo / Smart Village',
        details: 'Sensor fusion experiments and evaluation tooling for ADAS stacks. Requirements: Computer vision basics, MATLAB or Python.',
        skills: 'Computer Vision, Python', duration: '4 months', programmingLanguages: 'Python',
        status: 'Currently Hiring', deadline: '2026-07-20', posted: '2026-04-01', isArchived: false,
        applicants: []
      }
    ]
  })

  const initialInternState = { title: '', company: '', location: '', details: '', skills: '', duration: '', programmingLanguages: '', deadline: '', status: 'Currently Hiring' }
  const [showInternForm, setShowInternForm] = useState(false)
  const [isEditingIntern, setIsEditingIntern] = useState(null)
  const [internForm, setInternForm] = useState(initialInternState)
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [applicantSort, setApplicantSort] = useState('default')

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(storageKeys.favorites)
    return saved ? JSON.parse(saved) : { projects: [projectsData[0]?.id].filter(Boolean), portfolios: [] }
  })

 const [selectedProject, setSelectedProject] = useState(null)
  const [savedCandidates, setSavedCandidates] = useState(() => {
    const s = localStorage.getItem(`emp_saved_candidates_${empId}`)
    return s ? JSON.parse(s) : []
  })
  const [recentCandidates, setRecentCandidates] = useState(() => {
    const s = localStorage.getItem(`emp_recent_candidates_${empId}`)
    return s ? JSON.parse(s) : []
  })
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [pipelineFilter, setPipelineFilter] = useState('all')

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKeys.messages)
    return saved ? JSON.parse(saved) : [
      { id: 1, sender: 'Ahmed Ali', receiver: user?.companyName || 'Employer', role: 'Student', text: 'it works now', date: '2026-05-11', time: '03:25 PM', read: true, mine: false },
      { id: 2, sender: 'Ahmed Ali', receiver: user?.companyName || 'Employer', role: 'Student', text: 'I am happy it works', date: '2026-05-11', time: '03:29 PM', read: true, mine: false },
      { id: 3, sender: 'Ahmed Ali', receiver: user?.companyName || 'Employer', role: 'Student', text: 'I hope to get a good grade in this project', date: '2026-05-11', time: '03:30 PM', read: false, mine: false },
      { id: 4, sender: user?.companyName || 'Employer', receiver: 'Ahmed Ali', role: 'Employer', text: 'same man', date: '2026-05-11', time: '01:54 AM', read: true, mine: true },
      { id: 5, sender: user?.companyName || 'Employer', receiver: 'Ahmed Ali', role: 'Employer', text: 'i have high hopes', date: '2026-05-11', time: '01:54 AM', read: true, mine: true },
      { id: 6, sender: user?.companyName || 'Employer', receiver: 'Ahmed Ali', role: 'Employer', text: 'I sent this message with the new feature', date: '2026-05-11', time: '01:55 AM', read: true, mine: true }
    ]
  })

  const [selectedConversation, setSelectedConversation] = useState('Ahmed Ali')
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageForm, setMessageForm] = useState({ receiver: 'Ahmed Ali', text: '' })
  const [quickMessage, setQuickMessage] = useState('')

  useEffect(() => localStorage.setItem(storageKeys.internships, JSON.stringify(internships)), [internships, storageKeys.internships])
  useEffect(() => localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)), [favorites, storageKeys.favorites])
  useEffect(() => localStorage.setItem(storageKeys.messages, JSON.stringify(messages)), [messages, storageKeys.messages])
  useEffect(() => localStorage.setItem(storageKeys.notifications, JSON.stringify(userNotifications)), [userNotifications, storageKeys.notifications])
  useEffect(() => localStorage.setItem(`emp_saved_candidates_${empId}`, JSON.stringify(savedCandidates)), [savedCandidates, empId])
  useEffect(() => localStorage.setItem(`emp_recent_candidates_${empId}`, JSON.stringify(recentCandidates)), [recentCandidates, empId])
  useEffect(() => {
    if (!user) return
    const profile = getEmployerProfile(user.email)
    if (profile) {
      const mergedProfile = { ...profileForm, ...profile }
      setProfileForm(mergedProfile)
      if (mergedProfile.mapLocation) setMapSrc(`https://maps.google.com/maps?q=${encodeURIComponent(mergedProfile.mapLocation)}&output=embed`)
    } else if (profileForm.mapLocation) {
      setMapSrc(`https://maps.google.com/maps?q=${encodeURIComponent(profileForm.mapLocation)}&output=embed`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  const pageTitleClass = 'text-2xl font-bold text-slate-900 dark:text-white'
  const pageSubClass = 'text-sm text-slate-500 dark:text-slate-400 mt-1'
  const cardClass = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm'

  const showSuccess = (msg) => {
    setNotification({ show: true, message: msg })
    setTimeout(() => setNotification({ show: false, message: '' }), 5000)
  }

  const toggleAllNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
    showSuccess(notificationsEnabled ? 'All notifications turned off.' : 'Notifications enabled.')
  }

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const trackCandidateView = (app, internTitle) => {
    const entry = { ...app, internTitle, viewedAt: new Date().toLocaleString() }
    setRecentCandidates(prev => {
      const filtered = prev.filter(c => !(c.id === app.id && c.internTitle === internTitle))
      return [entry, ...filtered].slice(0, 20)
    })
  }

  const toggleSaveCandidate = (app, internTitle) => {
    const key = `${app.id}_${internTitle}`
    setSavedCandidates(prev => {
      const exists = prev.find(c => `${c.id}_${c.internTitle}` === key)
      if (exists) return prev.filter(c => `${c.id}_${c.internTitle}` !== key)
      return [{ ...app, internTitle, savedAt: new Date().toLocaleString() }, ...prev]
    })
    showSuccess(savedCandidates.find(c => `${c.id}_${c.internTitle}` === key) ? 'Candidate removed from saved.' : 'Candidate saved!')
  }

  const toggleCompare = (app) => {
    setCompareList(prev => {
      if (prev.find(c => c.id === app.id)) return prev.filter(c => c.id !== app.id)
      if (prev.length >= 3) { showSuccess('Max 3 candidates for comparison.'); return prev }
      return [...prev, app]
    })
  }

  const handleLogout = () => { setTheme(false); logoutUser(); navigate('/') }

  const markAsRead = (id) => setUserNotifications(userNotifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => { setUserNotifications(userNotifications.map(n => ({ ...n, read: true }))); showSuccess('All notifications marked as read.') }
  const markAllUnread = () => { setUserNotifications(userNotifications.map(n => ({ ...n, read: false }))); showSuccess('All notifications marked as unread.') }

  const handleNotificationClick = (n) => {
    markAsRead(n.id)
    const text = n.text.toLowerCase()
    if (text.includes('message')) setActiveTab('messages')
    else if (text.includes('application') || text.includes('intern')) setActiveTab('internships')
    setShowNotifPanel(false)
  }

  const stats = useMemo(() => ({
    totalInternships: internships.length,
    totalAcceptedStudents: internships.reduce((sum, intern) => sum + intern.applicants.filter(a => a.status === 'Accepted').length, 0),
    totalApplications: internships.reduce((sum, intern) => sum + intern.applicants.length, 0),
    unreadMsgs: messages.filter(m => !m.read && !m.mine).length,
  }), [internships, messages])

  const internshipHistory = useMemo(() => [
    { label: '2024-Q1', completed: 4, offered: 6 }, { label: '2024-Q2', completed: 6, offered: 8 },
    { label: '2024-Q3', completed: 7, offered: 9 }, { label: '2024-Q4', completed: 8, offered: 10 },
    { label: '2025-Q1', completed: 10, offered: 12 }, { label: '2026-Q1', completed: stats.totalAcceptedStudents, offered: stats.totalInternships + 6 }
  ], [stats])

  const toggleMessageRead = (id) => setMessages(messages.map(msg => msg.id === id ? { ...msg, read: !msg.read } : msg))
  const getNowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageForm.receiver.trim() || !messageForm.text.trim()) { alert('Please choose a receiver and write a message.'); return }
    const newMsg = { id: Date.now(), sender: user?.companyName || 'Employer', receiver: messageForm.receiver.trim(), role: 'Employer', text: messageForm.text.trim(), date: new Date().toISOString().split('T')[0], time: getNowTime(), read: true, mine: true }
    setMessages([...messages, newMsg])
    setSelectedConversation(messageForm.receiver.trim())
    setMessageForm({ receiver: messageForm.receiver.trim(), text: '' })
    setShowMessageModal(false)
    showSuccess('Message sent successfully.')
  }

  const sendQuickMessage = (e) => {
    e.preventDefault()
    if (!quickMessage.trim()) return
    const newMsg = { id: Date.now(), sender: user?.companyName || 'Employer', receiver: selectedConversation, role: 'Employer', text: quickMessage.trim(), date: new Date().toISOString().split('T')[0], time: getNowTime(), read: true, mine: true }
    setMessages([...messages, newMsg])
    setQuickMessage('')
  }

  const toggleFavProject = (id) => {
    setFavorites(prev => ({ ...prev, projects: prev.projects.includes(id) ? prev.projects.filter(pId => pId !== id) : [...prev.projects, id] }))
    showSuccess('Favorites updated.')
  }

  const toggleFavPortfolio = (id) => {
    setFavorites(prev => ({ ...prev, portfolios: prev.portfolios.includes(id) ? prev.portfolios.filter(pId => pId !== id) : [...prev.portfolios, id] }))
    showSuccess('Favorites updated.')
  }

  const openProjectDetails = (project) => { setSelectedProject(project); setActiveTab('project-details'); setSelectedInternship(null); setSelectedInstructor(null) }

  const handleMapUpdate = (e) => {
    e.preventDefault()
    const trimmedLocation = mapAddress.trim()
    if (!trimmedLocation) { alert('Please enter a building or city.'); return }
    const updatedForm = { ...profileForm, mapLocation: trimmedLocation, address: trimmedLocation }
    setProfileForm(updatedForm)
    saveEmployerProfile(user.email, updatedForm)
    setMapSrc(`https://maps.google.com/maps?q=${encodeURIComponent(trimmedLocation)}&output=embed`)
    setMapAddress('')
    showSuccess('Location saved.')
  }

  const recommendedProjects = useMemo(() => {
    const fallback = [
      { id: 'rec-1', title: 'Smart Campus Navigator', domain: 'CSEN 603', summary: 'Cross-platform indoor/outdoor navigation for GUC campuses with live occupancy, accessible routes, and offline maps.', techStack: ['TypeScript', 'JavaScript'], owner: 'student@student.guc.edu.eg', rating: 5 },
      { id: 'rec-2', title: 'Graduation Thesis Portfolio Platform', domain: 'Bachelor Project', summary: 'A portfolio hub for thesis teams: milestones, reviews, versioning, and defense scheduling integrated with Git.', techStack: ['TypeScript', 'Go'], owner: 'student2@guc.edu.eg', rating: 5 },
      { id: 'rec-3', title: 'Collaborative Notes Hub', domain: 'CSEN 603', summary: 'Real-time collaborative markdown notes with CRDT sync shared publicly for the course community.', techStack: ['Rust', 'WebSockets', 'React'], owner: 'student.dana@guc.edu.eg', rating: 5 },
      { id: 'rec-4', title: 'GUC Events Social Graph', domain: 'CSEN 603', summary: 'Featured public project: graph analytics over campus events, club memberships, and collaborative filtering.', techStack: ['Python', 'Cypher'], owner: 'student2@guc.edu.eg', rating: 5 }
    ]
    return projectsData.length >= 3 ? projectsData.slice(0, 4) : fallback
  }, [])

  const todayDateString = new Date().toISOString().split('T')[0]

  const filteredInternships = useMemo(() => {
    const lowerSearch = internSearch.toLowerCase()
    return internships.filter(i => {
      const matchesSearch = !internSearch || i.title?.toLowerCase().includes(lowerSearch) || i.company?.toLowerCase().includes(lowerSearch) || i.skills?.toLowerCase().includes(lowerSearch)
      return matchesSearch && (companyFilter === 'all' || i.company === companyFilter) && (durationFilter === 'all' || i.duration === durationFilter)
    })
  }, [internships, internSearch, companyFilter, durationFilter])

  const handleSaveInternship = (e) => {
    e.preventDefault()
    if (internForm.deadline < todayDateString) { alert('The application deadline cannot be in the past.'); return }
    if (isEditingIntern) {
      setInternships(internships.map(i => i.id === isEditingIntern ? { ...i, ...internForm } : i))
      showSuccess('Internship updated successfully!')
    } else {
      setInternships([{ ...internForm, id: Date.now(), isArchived: false, applicants: [], posted: todayDateString }, ...internships])
      showSuccess(`Internship '${internForm.title}' posted!`)
    }
    setShowInternForm(false); setIsEditingIntern(null); setInternForm(initialInternState)
  }

  const toggleHiringStatus = (id) => {
    setInternships(internships.map(i => {
      if (i.id === id) {
        const newStatus = i.status === 'Currently Hiring' || i.status === 'Hiring' ? 'Position Filled' : 'Currently Hiring'
        if (selectedInternship?.id === id) setSelectedInternship({ ...i, status: newStatus })
        return { ...i, status: newStatus }
      }
      return i
    }))
    showSuccess('Internship status updated.')
  }

  const archiveInternship = (id) => {
    setInternships(internships.map(i => {
      if (i.id === id) {
        const archivedState = !i.isArchived
        if (selectedInternship?.id === id) setSelectedInternship({ ...i, isArchived: archivedState })
        return { ...i, isArchived: archivedState }
      }
      return i
    }))
    showSuccess('Archive status updated.')
  }

  const handleDeleteInternship = (id) => {
    if (window.confirm('Delete this internship?')) {
      setInternships(internships.filter(i => i.id !== id))
      if (selectedInternship?.id === id) setSelectedInternship(null)
      showSuccess('Internship deleted.')
    }
  }

  const updateAppStatus = (internId, appId, newStatus) => {
    setInternships(internships.map(i => {
      if (i.id === internId) {
        const updatedApplicants = i.applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a)
        const updatedInternship = { ...i, applicants: updatedApplicants }
        if (selectedInternship?.id === internId) setSelectedInternship(updatedInternship)
        return updatedInternship
      }
      return i
    }))
    showSuccess(`Applicant status changed to ${newStatus}.`)
  }

  const getContributionScore = (applicant) => {
    const student = studentsData.find(s => s.email === applicant.email || s.name === applicant.name)
    return applicant.contributionScore || student?.projects?.length || 0
  }

  const getSortedApplicants = (internship) => {
    let sorted = [...internship.applicants]
    if (applicantSort === 'topContributors') sorted.sort((a, b) => getContributionScore(b) - getContributionScore(a))
    return sorted
  }

  const isApplicantSuggested = (applicant) => favorites.portfolios.some(favId => {
    const student = studentsData.find(s => s.id === favId)
    return student && (student.email === applicant.email || student.name === applicant.name)
  })

  const getProjectTags = (project) => {
    if (Array.isArray(project.techStack)) return project.techStack
    if (Array.isArray(project.tags)) return project.tags
    if (project.skills) return String(project.skills).split(',').map(s => s.trim()).filter(Boolean)
    return ['TypeScript', 'React']
  }

  const getProjectRating = (project) => project.rating || project.score || 5

  const conversationNames = useMemo(() => {
    const names = new Set(['Ahmed Ali'])
    messages.forEach(msg => { if (msg.mine && msg.receiver) names.add(msg.receiver); if (!msg.mine && msg.sender) names.add(msg.sender) })
    studentsData.slice(0, 3).forEach(student => names.add(student.name))
    instructors.slice(0, 2).forEach(inst => names.add(inst.name))
    return [...names]
  }, [messages, instructors])

  const selectedMessages = messages.filter(msg => msg.sender === selectedConversation || msg.receiver === selectedConversation)

  if (!user) return null

  const unreadNotifs = userNotifications.filter(n => !n.read).length

  const navItems = [
    { id: 'profile',              label: 'Overview',           icon: IC.home },
    { id: 'profile-details',      label: 'My Profile',         icon: IC.user },
    { id: 'notifications',        label: 'Notifications',      icon: IC.bell,      badge: unreadNotifs },
    { id: 'internships',          label: 'Internships',        icon: IC.briefcase },
    { id: 'pipeline',             label: 'Candidate Pipeline', icon: IC.gitMerge },
    { id: 'saved-candidates',     label: 'Saved Candidates',   icon: IC.bookmark },
    { id: 'recommended-students', label: 'Recommended Students', icon: IC.userCheck },
    { id: 'analytics',            label: 'Internship Analytics', icon: IC.target },
    { id: 'instructors',          label: 'Find Instructors',   icon: IC.users },
    { id: 'favorite-projects',    label: 'Favorites',          icon: IC.heart },
    { id: 'recommended-projects', label: 'Recommended',        icon: IC.star },
    { id: 'messages',             label: 'Messages',           icon: IC.chat,      badge: stats.unreadMsgs },
    { id: 'statistics',           label: 'Statistics',         icon: IC.chart },
    { id: 'settings',             label: 'Settings',           icon: IC.settings },
  ]

  const renderNav = () => (
    <>
      <div className="mb-4 mt-1 px-2">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Employer Portal</p>
        <div className="flex items-center gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-3 py-2.5 border border-blue-100 dark:border-blue-900">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">{(user.companyName || 'E')[0].toUpperCase()}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white leading-tight">{user.companyName || 'Employer'}</p>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500 leading-tight">Employer · GUC</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedInternship(null); setSelectedInstructor(null); setSidebar(false) }}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${activeTab === item.id ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 hover:translate-x-0.5'}`}>
            <Icon d={item.icon} size={16} />
            <span>{item.label}</span>
            {item.badge > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${activeTab === item.id ? 'bg-white text-blue-700' : 'bg-red-500 text-white'}`}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-0.5">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400">
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
        <header className="shrink-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebar(true)} className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
              <Icon d={IC.menu} size={18} />
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:opacity-80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-sm"><Icon d={IC.briefcase} size={14} /></div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden sm:block">ProjectHub</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">ProjectHub</span>
              </div>
            </button>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Employer</span>
              <span className="text-slate-300 dark:text-slate-600 text-sm">/</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{navItems.find(n => n.id === activeTab)?.label || activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            {/* Notifications dropdown */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifDropdown(p => !p); setProfileDropdown(false) }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon d={IC.bell} size={18} />
                {unreadNotifs > 0 && notificationsEnabled && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>}
              </button>
              {notifDropdown && (
                <div className="absolute right-0 top-11 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                    <button onClick={() => { markAllRead(); setNotifDropdown(false) }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                  </div>
                  {userNotifications.length === 0
                    ? <p className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">All caught up!</p>
                    : <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {userNotifications.slice(0, 6).map(n => (
                        <li key={n.id}>
                          <button onClick={() => { markAsRead(n.id); const t = n.text.toLowerCase(); if (t.includes('message')) setActiveTab('messages'); else if (t.includes('application') || t.includes('intern')) setActiveTab('internships'); setNotifDropdown(false) }}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs leading-snug ${!n.read ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{n.text}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  }
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    <button onClick={() => { setActiveTab('notifications'); setNotifDropdown(false) }} className="w-full rounded-lg py-2 text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">View all</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileDropdown(p => !p); setNotifDropdown(false) }} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">{(user.companyName || 'E')[0].toUpperCase()}</div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user.companyName || 'Employer'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 leading-tight">Employer</p>
                </div>
                <svg className="hidden sm:block h-3 w-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {profileDropdown && (
                <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/60 z-50">
                  <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.companyName || 'Employer'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {[
                      { label: 'My Profile', icon: IC.user, action: () => { setActiveTab('profile-details'); setProfileDropdown(false) } },
                      { label: 'Appearance', icon: IC.moon, action: () => { setActiveTab('settings'); setProfileDropdown(false) } },
                      { label: 'Statistics', icon: IC.chart, action: () => { setActiveTab('statistics'); setProfileDropdown(false) } },
                    ].map(item => (
                      <button key={item.label} onClick={item.action} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
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

        {/* Toast */}
        {notification.show && (
          <div className="fixed top-6 right-6 z-[120]">
            <div className="bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400">
              <Icon d={IC.check} size={15} />
              <p className="font-semibold text-sm">{notification.message}</p>
            </div>
          </div>
        )}

        {/* New Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={e => e.target === e.currentTarget && setShowMessageModal(false)}>
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Message</h2>
                <button onClick={() => setShowMessageModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><Icon d={IC.x} /></button>
              </div>
              <form onSubmit={handleSendMessage} className="px-6 py-4 space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Receiver</label>
                  <select value={messageForm.receiver} onChange={e => setMessageForm({ ...messageForm, receiver: e.target.value })}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none">
                    <option value="">Select receiver</option>
                    {conversationNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea value={messageForm.text} onChange={e => setMessageForm({ ...messageForm, text: e.target.value })} placeholder="Write your message..." rows={4}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition">
                    <Icon d={IC.send} size={13} />Send Message
                  </button>
                  <button type="button" onClick={() => setShowMessageModal(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto w-full max-w-5xl space-y-6">

            {/* ── Overview ── */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-10 sm:px-12 sm:py-14 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2 max-w-lg">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">Welcome back, {user.companyName || 'Employer'} 👋</h2>
                      <p className="text-blue-100 text-sm sm:text-base leading-relaxed">Manage internships, discover student talent, and build your employer brand — all in one place.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <button onClick={() => setActiveTab('internships')} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50 active:scale-95 transition-all w-full sm:w-auto justify-center">
                        <Icon d={IC.briefcase} size={15} />Manage Internships
                      </button>
                      <button onClick={() => setActiveTab('recommended-projects')} className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 active:scale-95 transition-all w-full sm:w-auto justify-center">
                        <Icon d={IC.star} size={15} />Browse Projects
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Internships Offered', value: stats.totalInternships, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', tab: 'internships' },
                    { label: 'Students Accepted', value: stats.totalAcceptedStudents, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', tab: 'internships' },
                    { label: 'Applications', value: stats.totalApplications, color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', tab: 'internships' },
                    { label: 'Unread Messages', value: stats.unreadMsgs, color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', tab: 'messages' },
                  ].map(s => (
                    <button key={s.label} onClick={() => setActiveTab(s.tab)} className={`group rounded-xl border-0 p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${s.bg}`}>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                      <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </button>
                  ))}
                </div>

                <div className={`${cardClass} p-6`}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Company</span><span className="text-slate-900 dark:text-slate-200 font-medium">{user.companyName || 'Employer'}</span></div>
                    <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Email</span><span className="text-slate-900 dark:text-slate-200 font-medium">{user.email}</span></div>
                    <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Status</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${profileForm.isVerified ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'}`}>
                        {profileForm.isVerified ? 'VERIFIED PARTNER' : 'VERIFICATION PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className={`${cardClass} p-6`}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label:'Post Internship',     icon:IC.plus,      tab:'internships',          color:'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' },
                      { label:'View Applications',   icon:IC.users,     tab:'pipeline',             color:'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900' },
                      { label:'Browse Students',     icon:IC.userCheck, tab:'recommended-students', color:'bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900' },
                      { label:'Company Profile',     icon:IC.user,      tab:'profile-details',      color:'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900' },
                    ].map(a => (
                      <button key={a.label} onClick={() => setActiveTab(a.tab)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${a.color}`}>
                        <Icon d={a.icon} size={20}/>
                        <span className="text-xs font-semibold leading-tight">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Company Activity Feed ── */}
                <div className={`${cardClass} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Icon d={IC.activity} size={16}/>Company Activity</h3>
                  </div>
                  {(() => {
                    const feed = []
                    internships.forEach(i => {
                      feed.push({ type:'internship', label:`Posted internship: "${i.title}"`, sub:i.company, date:i.posted||'2026-04-01', color:'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400', icon:IC.briefcase })
                      i.applicants.forEach(a => {
                        if (a.status === 'Accepted') feed.push({ type:'accept', label:`Accepted ${a.name}`, sub:i.title, date:i.posted||'2026-04-01', color:'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400', icon:IC.userCheck })
                        if (a.status === 'Nominated') feed.push({ type:'nominate', label:`Nominated ${a.name}`, sub:i.title, date:i.posted||'2026-04-01', color:'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400', icon:IC.star })
                      })
                    })
                    messages.slice(-3).forEach(m => {
                      if (m.mine) feed.push({ type:'message', label:`Sent message to ${m.receiver}`, sub:m.text.slice(0,40)+'…', date:m.date, color:'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400', icon:IC.chat })
                    })
                    feed.sort((a,b) => new Date(b.date)-new Date(a.date))
                    if (feed.length === 0) return <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No activity yet.</p>
                    return (
                      <ol className="relative border-l border-slate-200 dark:border-slate-700 pl-5 space-y-4">
                        {feed.slice(0,8).map((ev,i) => (
                          <li key={i} className="relative">
                            <span className={`absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-800 ${ev.color}`}>
                              <Icon d={ev.icon} size={9}/>
                            </span>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{ev.label}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ev.sub} · {ev.date}</p>
                          </li>
                        ))}
                      </ol>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* ── My Profile ── */}
            {activeTab === 'profile-details' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={pageTitleClass}>My Profile</h2>
                  <Button onClick={() => setEditingProfile(!editingProfile)}>{editingProfile ? 'Cancel' : 'Edit Profile'}</Button>
                </div>

                <div className={`${cardClass} p-6`}>
                  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-8">
                    {/* Avatars */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/50 overflow-hidden flex items-center justify-center border-2 border-blue-200 dark:border-blue-800">
                        {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-blue-700 dark:text-blue-300">{(user.companyName || 'E').charAt(0)}</span>}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-colors">
                        <Icon d={IC.upload} size={12} />Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => { const u = { ...profileForm, profilePicture: r.result }; setProfileForm(u); saveEmployerProfile(user.email, u); showSuccess('Photo uploaded.') }; r.readAsDataURL(f) }} />
                      </label>
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center">
                        {profileForm.logo ? <img src={profileForm.logo} alt="Logo" className="object-contain p-1 w-full h-full" /> : <span className="text-xs text-slate-300 dark:text-slate-500 font-bold">LOGO</span>}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-colors">
                        <Icon d={IC.upload} size={12} />Upload Logo
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => { const u = { ...profileForm, logo: r.result }; setProfileForm(u); saveEmployerProfile(user.email, u); showSuccess('Logo uploaded.') }; r.readAsDataURL(f) }} />
                      </label>
                    </div>

                    <div>
                      {editingProfile ? (
                        <form onSubmit={e => { e.preventDefault(); if (profileForm.phone && profileForm.phone.length !== 11) { alert('Phone must be 11 digits.'); return } saveEmployerProfile(user.email, profileForm); setEditingProfile(false); showSuccess('Profile updated!') }} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                              <input value={profileForm.website} onChange={e => setProfileForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone (11 digits)</label>
                              <input type="tel" value={profileForm.phone} maxLength={11} onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Address</label>
                            <input value={profileForm.address} onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Biography</label>
                            <textarea value={profileForm.bio} onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Research Interests</label>
                            <textarea value={profileForm.researchInterests} onChange={e => setProfileForm(prev => ({ ...prev, researchInterests: e.target.value }))} rows={2} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Background</label>
                            <textarea value={profileForm.education} onChange={e => setProfileForm(prev => ({ ...prev, education: e.target.value }))} rows={2} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                          </div>
                          <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors">
                            <Icon d={IC.upload} size={14} />Upload Tax Certificate (PDF)
                            <input type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onloadend = () => setProfileForm({ ...profileForm, taxCertificate: r.result, taxCertificateName: f.name }); r.readAsDataURL(f) }} />
                          </label>
                          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition">Save Profile</button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.companyName || 'Employer'}</h3>
                            <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mt-1">Employer Account</span>
                          </div>
                          <div className="space-y-3">
                            {profileForm.bio && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Biography</p><p className="text-sm text-slate-700 dark:text-slate-300">{profileForm.bio}</p></div>}
                            {profileForm.researchInterests && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Research Interests</p><p className="text-sm text-slate-700 dark:text-slate-300">{profileForm.researchInterests}</p></div>}
                            {profileForm.education && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Company Background</p><p className="text-sm text-slate-700 dark:text-slate-300">{profileForm.education}</p></div>}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                              <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Website</span><a href={profileForm.website} className="text-blue-600 dark:text-blue-400 text-sm font-medium">{profileForm.website || 'Not set'}</a></div>
                              <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Phone</span><span className="text-slate-900 dark:text-slate-200 text-sm">{profileForm.phone || 'Not set'}</span></div>
                              <div><span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase block mb-1">Address</span><span className="text-slate-900 dark:text-slate-200 text-sm">{profileForm.address || 'Not set'}</span></div>
                            </div>
                            {profileForm.taxCertificate && <a href={profileForm.taxCertificate} download={profileForm.taxCertificateName || 'Tax_Certificate.pdf'} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium text-xs rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"><Icon d={IC.download} size={13} />Download Tax Certificate</a>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className={`${cardClass} p-6`}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Public Location</h3>
                  <form onSubmit={handleMapUpdate} className="flex gap-3 mb-4">
                    <input value={mapAddress} onChange={e => setMapAddress(e.target.value)} placeholder="Enter building or city"
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    <Button type="submit">Update Map</Button>
                  </form>
                  {profileForm.mapLocation && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
                      <div><p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Saved Location</p><p className="font-medium text-slate-900 dark:text-white text-sm">{profileForm.mapLocation}</p></div>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profileForm.mapLocation)}`} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-sm font-medium">Open in Maps ↗</a>
                    </div>
                  )}
                  {mapSrc ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"><iframe src={mapSrc} width="100%" height="220" title="Map" /></div>
                  ) : (
                    <div className="h-[220px] bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">Add your location above</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Candidate Pipeline ── */}
            {activeTab === 'pipeline' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className={pageTitleClass}>Candidate Pipeline</h2><p className={pageSubClass}>Track all applicants across internships.</p></div>
                  <div className="flex gap-2 flex-wrap">
                    {['all','Nominated','Accepted','Rejected'].map(s => (
                      <button key={s} onClick={() => setPipelineFilter(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${pipelineFilter===s ? 'bg-blue-700 text-white shadow-sm' : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700'}`}>
                        {s === 'all' ? 'All' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pipeline summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:'Total Applied',  value: internships.reduce((s,i)=>s+i.applicants.length,0),                            color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40' },
                    { label:'Nominated',      value: internships.reduce((s,i)=>s+i.applicants.filter(a=>a.status==='Nominated').length,0), color:'text-yellow-700 dark:text-yellow-400',bg:'bg-yellow-50 dark:bg-yellow-950/40' },
                    { label:'Accepted',       value: internships.reduce((s,i)=>s+i.applicants.filter(a=>a.status==='Accepted').length,0),  color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40' },
                    { label:'Rejected',       value: internships.reduce((s,i)=>s+i.applicants.filter(a=>a.status==='Rejected').length,0),  color:'text-red-700 dark:text-red-400',    bg:'bg-red-50 dark:bg-red-950/40' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Compare bar */}
                {compareList.length > 0 && (
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Comparing ({compareList.length}/3):</span>
                    {compareList.map(c => <span key={c.id} className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">{c.name}</span>)}
                    <button onClick={() => setShowCompare(true)} className="ml-auto rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors">Compare Now</button>
                    <button onClick={() => setCompareList([])} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400">Clear</button>
                  </div>
                )}

                {/* Candidate comparison modal */}
                {showCompare && compareList.length >= 2 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4" onClick={e => e.target === e.currentTarget && setShowCompare(false)}>
                    <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-800 shadow-xl flex flex-col max-h-[90vh]">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 shrink-0">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Candidate Comparison</h2>
                        <button onClick={() => setShowCompare(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><Icon d={IC.x}/></button>
                      </div>
                      <div className="overflow-y-auto px-6 py-4">
                        <div className={`grid gap-4 ${compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          {compareList.map(c => (
                            <div key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-4 space-y-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-lg font-bold text-blue-700 dark:text-blue-300">{c.name[0]}</div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Contribution Score</span>
                                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{c.contributionScore || 0}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                                  <div className="h-1.5 rounded-full bg-blue-600 transition-all duration-700" style={{width:`${Math.min(c.contributionScore||0, 100)}%`}}/>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status==='Accepted'?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':c.status==='Rejected'?'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300':'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{c.status}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Winner highlight */}
                        {(() => {
                          const top = [...compareList].sort((a,b) => (b.contributionScore||0)-(a.contributionScore||0))[0]
                          return (
                            <div className="mt-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 px-4 py-3 flex items-center gap-3">
                              <Icon d={IC.userCheck} size={16}/>
                              <p className="text-sm font-semibold text-green-700 dark:text-green-300">Top candidate: <span className="font-bold">{top.name}</span> with score {top.contributionScore||0}</p>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidates list */}
                <div className="space-y-3">
                  {internships.map(i => {
                    const filtered = pipelineFilter === 'all' ? i.applicants : i.applicants.filter(a => a.status === pipelineFilter)
                    if (filtered.length === 0) return null
                    return (
                      <div key={i.id} className={`${cardClass} p-5`}>
                        <div className="flex items-center gap-2 mb-4">
                          <Icon d={IC.briefcase} size={14}/>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">{i.title}</h3>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{i.company}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-2">
                          {filtered.map(app => {
                            const isSaved = savedCandidates.find(c => c.id === app.id && c.internTitle === i.title)
                            const inCompare = compareList.find(c => c.id === app.id)
                            return (
                              <div key={app.id} onClick={() => trackCandidateView(app, i.title)}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-3 hover:border-blue-200 dark:hover:border-blue-700 transition-all">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">{app.name[0]}</div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{app.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{app.email} · Score: <span className="font-semibold text-blue-600 dark:text-blue-400">{app.contributionScore||0}</span></p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${app.status==='Accepted'?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':app.status==='Rejected'?'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300':'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{app.status}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button onClick={e => { e.stopPropagation(); toggleSaveCandidate(app, i.title) }}
                                    title={isSaved ? 'Remove from saved' : 'Save candidate'}
                                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${isSaved ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500'}`}>
                                    <Icon d={IC.bookmark} size={13}/>
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); toggleCompare(app) }}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${inCompare ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                                    {inCompare ? 'Comparing' : 'Compare'}
                                  </button>
                                  <select value={app.status} onChange={e => { e.stopPropagation(); updateAppStatus(i.id, app.id, e.target.value) }}
                                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none">
                                    <option value="Nominated">Nominate</option>
                                    <option value="Accepted">Accept</option>
                                    <option value="Rejected">Reject</option>
                                  </select>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  {internships.every(i => (pipelineFilter === 'all' ? i.applicants.length === 0 : i.applicants.filter(a => a.status === pipelineFilter).length === 0)) && (
                    <div className={`${cardClass} py-10 text-center text-sm text-slate-400 dark:text-slate-500`}>No candidates match the selected filter.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Saved Candidates ── */}
            {activeTab === 'saved-candidates' && (
              <div className="space-y-6">
                <div><h2 className={pageTitleClass}>Saved Candidates</h2><p className={pageSubClass}>Candidates you've bookmarked for later review.</p></div>
                {savedCandidates.length === 0 ? (
                  <div className={`${cardClass} py-16 text-center`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mx-auto mb-3"><Icon d={IC.bookmark} size={24}/></div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No saved candidates yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Bookmark candidates from the Pipeline tab</p>
                    <button onClick={() => setActiveTab('pipeline')} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors">
                      <Icon d={IC.arrowRight} size={13}/>Go to Pipeline
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedCandidates.map((c, i) => (
                      <div key={i} className={`${cardClass} p-4 flex items-center gap-4`}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">{c.name[0]}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{c.email} · {c.internTitle}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Saved {c.savedAt}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c.status==='Accepted'?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':c.status==='Rejected'?'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300':'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{c.status}</span>
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Score: {c.contributionScore||0}</span>
                          <button onClick={() => setSavedCandidates(prev => prev.filter((_,idx) => idx !== i))}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Icon d={IC.x} size={14}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recently Viewed */}
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2"><Icon d={IC.history} size={15}/>Recently Viewed Candidates</h3>
                  {recentCandidates.length === 0 ? (
                    <div className={`${cardClass} py-8 text-center text-sm text-slate-400 dark:text-slate-500`}>No recently viewed candidates.</div>
                  ) : (
                    <div className="space-y-2">
                      {recentCandidates.slice(0,6).map((c,i) => (
                        <div key={i} className={`${cardClass} p-3 flex items-center gap-3`}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300">{c.name[0]}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{c.internTitle} · Viewed {c.viewedAt}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status==='Accepted'?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':c.status==='Rejected'?'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300':'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Recommended Students ── */}
            {activeTab === 'recommended-students' && (
              <div className="space-y-6">
                <div><h2 className={pageTitleClass}>Recommended Students</h2><p className={pageSubClass}>High-scoring students matching your internship requirements.</p></div>
                {(() => {
                  const allApplicants = []
                  const seen = new Set()
                  internships.forEach(i => {
                    i.applicants.forEach(a => {
                      if (!seen.has(a.id)) {
                        seen.add(a.id)
                        allApplicants.push({ ...a, fromInternship: i.title, company: i.company })
                      }
                    })
                  })
                  const topStudents = allApplicants
                    .filter(a => a.status !== 'Rejected')
                    .sort((a,b) => (b.contributionScore||0)-(a.contributionScore||0))

                  if (topStudents.length === 0) return (
                    <div className={`${cardClass} py-16 text-center`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 mx-auto mb-3"><Icon d={IC.userCheck} size={24}/></div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No applicants yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Post internships to start receiving applications</p>
                    </div>
                  )

                  return (
                    <div className="space-y-3">
                      {topStudents.map((s,i) => {
                        const isSaved = savedCandidates.find(c => c.id === s.id)
                        const pct = Math.min(s.contributionScore||0, 100)
                        return (
                          <div key={s.id} className={`${cardClass} p-5`}>
                            <div className="flex items-start gap-4">
                              <div className="relative shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-lg font-bold text-blue-700 dark:text-blue-300">{s.name[0]}</div>
                                {i === 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">★</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                                  {i === 0 && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">Top Candidate</span>}
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status==='Accepted'?'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300':'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{s.status}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.email} · Applied to: {s.fromInternship}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">Contribution Score</span>
                                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div className={`h-1.5 rounded-full transition-all duration-700 ${pct >= 85 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{width:`${pct}%`}}/>
                                  </div>
                                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{s.contributionScore||0}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => toggleSaveCandidate(s, s.fromInternship)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isSaved ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500' : 'text-slate-400 dark:text-slate-500 hover:text-amber-500 border border-slate-200 dark:border-slate-700'}`}>
                                  <Icon d={IC.bookmark} size={14}/>
                                </button>
                                <button onClick={() => toggleCompare(s)}
                                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${compareList.find(c=>c.id===s.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                                  {compareList.find(c=>c.id===s.id) ? 'Comparing' : 'Compare'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ── Internship Analytics ── */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div><h2 className={pageTitleClass}>Internship Analytics</h2><p className={pageSubClass}>Performance metrics and placement data.</p></div>

                {(() => {
                  const totalApps = internships.reduce((s,i) => s+i.applicants.length, 0)
                  const totalAccepted = internships.reduce((s,i) => s+i.applicants.filter(a=>a.status==='Accepted').length, 0)
                  const totalNominated = internships.reduce((s,i) => s+i.applicants.filter(a=>a.status==='Nominated').length, 0)
                  const totalRejected = internships.reduce((s,i) => s+i.applicants.filter(a=>a.status==='Rejected').length, 0)
                  const activeInterns = internships.filter(i => i.status === 'Currently Hiring' && !i.isArchived).length
                  const acceptRate = totalApps > 0 ? Math.round((totalAccepted / totalApps) * 100) : 0
                  const responseRate = totalApps > 0 ? Math.round(((totalAccepted + totalRejected + totalNominated) / totalApps) * 100) : 0

                  return (
                    <>
                      {/* KPI cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label:'Applications Received', value:totalApps,     color:'text-blue-700 dark:text-blue-400',   bg:'bg-blue-50 dark:bg-blue-950/40',   icon:IC.users },
                          { label:'Active Internships',    value:activeInterns,  color:'text-green-700 dark:text-green-400', bg:'bg-green-50 dark:bg-green-950/40', icon:IC.briefcase },
                          { label:'Acceptance Rate',       value:`${acceptRate}%`,  color:'text-purple-700 dark:text-purple-400',bg:'bg-purple-50 dark:bg-purple-950/40',icon:IC.userCheck },
                          { label:'Response Rate',         value:`${responseRate}%`,color:'text-amber-700 dark:text-amber-400', bg:'bg-amber-50 dark:bg-amber-950/40', icon:IC.activity },
                        ].map(s => (
                          <div key={s.label} className={`rounded-xl p-5 shadow-sm ${s.bg} hover:-translate-y-0.5 hover:shadow-md transition-all`}>
                            <div className="flex items-center justify-between mb-2"><Icon d={s.icon} size={14}/></div>
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Per-internship breakdown */}
                      <div className={`${cardClass} p-6`}>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Per-Internship Breakdown</h3>
                        {internships.length === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No internships yet.</p> : (
                          <div className="space-y-4">
                            {internships.map(i => {
                              const total = i.applicants.length || 1
                              const acc = i.applicants.filter(a=>a.status==='Accepted').length
                              const nom = i.applicants.filter(a=>a.status==='Nominated').length
                              const rej = i.applicants.filter(a=>a.status==='Rejected').length
                              const pct = Math.round((acc/total)*100)
                              return (
                                <div key={i.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                    <div>
                                      <p className="font-semibold text-slate-800 dark:text-slate-200">{i.title}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{i.company} · {i.applicants.length} applicant{i.applicants.length!==1?'s':''}</p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">{nom} Nominated</span>
                                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">{acc} Accepted</span>
                                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">{rej} Rejected</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-500 dark:text-slate-400">Acceptance rate</span>
                                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{i.applicants.length > 0 ? pct : 0}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                                      <div className="h-2 rounded-full bg-blue-600 transition-all duration-700" style={{width:`${i.applicants.length > 0 ? pct : 0}%`}}/>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Status distribution */}
                      <div className={`${cardClass} p-6`}>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Overall Status Distribution</h3>
                        {totalApps === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No applications received yet.</p> : (
                          <div className="space-y-3">
                            {[
                              { label:'Nominated', value:totalNominated, color:'bg-yellow-500', pct:Math.round((totalNominated/totalApps)*100) },
                              { label:'Accepted',  value:totalAccepted,  color:'bg-green-500',  pct:Math.round((totalAccepted/totalApps)*100) },
                              { label:'Rejected',  value:totalRejected,  color:'bg-red-500',    pct:Math.round((totalRejected/totalApps)*100) },
                            ].map(s => (
                              <div key={s.label}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                                  <span className="text-sm text-slate-500 dark:text-slate-400">{s.value} ({s.pct}%)</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                  <div className={`h-2.5 rounded-full transition-all duration-700 ${s.color}`} style={{width:`${s.pct}%`}}/>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* ── Statistics ── */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <div><h2 className={pageTitleClass}>Employer Statistics</h2><p className={pageSubClass}>Internship history and placement metrics.</p></div>
                <div className={`${cardClass} p-6`}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Internship History</h3>
                  <div className="space-y-3">
                    {internshipHistory.map(row => {
                      const pct = Math.round((row.completed / row.offered) * 100)
                      return (
                        <div key={row.label} className="grid grid-cols-12 gap-4 items-center rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 px-4 py-3">
                          <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">{row.label}</span>
                          <span className="col-span-4 text-slate-600 dark:text-slate-400 text-sm">Completed: <strong className="text-slate-900 dark:text-slate-200">{row.completed}</strong> · Offered: <strong className="text-slate-900 dark:text-slate-200">{row.offered}</strong></span>
                          <div className="col-span-5 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} /></div>
                          <span className="col-span-1 text-sm text-slate-500 dark:text-slate-400 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Internships ── */}
            {activeTab === 'internships' && (
              <div className="space-y-6">
                {!selectedInternship && <div><h2 className={pageTitleClass}>Internships</h2></div>}

                {!showInternForm && !selectedInternship && (
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14} /></span>
                      <input value={internSearch} onChange={e => setInternSearch(e.target.value)} placeholder="Search by title or company…"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                      <option value="all">All Companies</option>
                      {[...new Set(internships.map(i => i.company).filter(Boolean))].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                      <option value="all">All Durations</option>
                      {[...new Set(internships.map(i => i.duration).filter(Boolean))].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                {!showInternForm && !selectedInternship && (
                  <div className="flex justify-end">
                    <Button onClick={() => { setInternForm(initialInternState); setIsEditingIntern(null); setShowInternForm(true) }}>
                      <Icon d={IC.plus} size={13} />Post New Role
                    </Button>
                  </div>
                )}

                {showInternForm && !selectedInternship && (
                  <div className={`${cardClass} p-6`}>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{isEditingIntern ? 'Edit Internship' : 'Post a New Opportunity'}</h3>
                    <form onSubmit={handleSaveInternship} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position Title *</label>
                        <input required value={internForm.title} onChange={e => setInternForm({ ...internForm, title: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      {[['Company *', 'company'], ['Location *', 'location'], ['Required Skills', 'skills'], ['Programming Languages', 'programmingLanguages'], ['Duration', 'duration']].map(([lbl, key]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{lbl}</label>
                          <input required={lbl.includes('*')} value={internForm[key]} onChange={e => setInternForm({ ...internForm, [key]: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                        </div>
                      ))}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Application Deadline *</label>
                        <input type="date" required min={todayDateString} value={internForm.deadline} onChange={e => setInternForm({ ...internForm, deadline: e.target.value })} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Responsibilities & Details</label>
                        <textarea value={internForm.details} onChange={e => setInternForm({ ...internForm, details: e.target.value })} rows={3} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="sm:col-span-2 flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition">{isEditingIntern ? 'Save Changes' : 'Publish Internship'}</button>
                        <Button variant="secondary" onClick={() => setShowInternForm(false)}>Cancel</Button>
                      </div>
                    </form>
                  </div>
                )}

                {selectedInternship ? (
                  <div className="space-y-6">
                    <button onClick={() => setSelectedInternship(null)} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Icon d={IC.x} size={13} />← Back to List
                    </button>
                    <div className={`${cardClass} p-6`}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedInternship.status === 'Currently Hiring' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{selectedInternship.status}</span>
                            {selectedInternship.isArchived && <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">Archived</span>}
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedInternship.title}</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deadline: {selectedInternship.deadline} · Duration: {selectedInternship.duration || 'N/A'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Button variant="secondary" onClick={() => toggleHiringStatus(selectedInternship.id)}>Mark as {selectedInternship.status === 'Currently Hiring' ? 'Filled' : 'Hiring'}</Button>
                          <Button variant="secondary" onClick={() => archiveInternship(selectedInternship.id)}>{selectedInternship.isArchived ? 'Unarchive' : 'Archive'}</Button>
                          <Button onClick={() => { setInternForm(selectedInternship); setIsEditingIntern(selectedInternship.id); setShowInternForm(true); setSelectedInternship(null) }}>Edit</Button>
                          <Button variant="danger" onClick={() => handleDeleteInternship(selectedInternship.id)}>Delete</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Responsibilities</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedInternship.details || 'No details provided.'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Required Skills</p>
                              <div className="flex flex-wrap gap-1.5">{selectedInternship.skills ? selectedInternship.skills.split(',').map(s => <span key={s} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{s.trim()}</span>) : <span className="text-sm text-slate-400 dark:text-slate-500 italic">None</span>}</div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Programming Languages</p>
                              <div className="flex flex-wrap gap-1.5">{selectedInternship.programmingLanguages ? selectedInternship.programmingLanguages.split(',').map(l => <span key={l} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{l.trim()}</span>) : <span className="text-sm text-slate-400 dark:text-slate-500 italic">None</span>}</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Applicants ({selectedInternship.applicants.length})</p>
                            <select value={applicantSort} onChange={e => setApplicantSort(e.target.value)}
                              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none">
                              <option value="default">Default</option>
                              <option value="topContributors">Top Contributors</option>
                            </select>
                          </div>
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {selectedInternship.applicants.length > 0 ? getSortedApplicants(selectedInternship).map(app => (
                              <div key={app.id} className={`rounded-xl border p-3 ${isApplicantSuggested(app) ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{app.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{app.email}</p>
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">Score: {getContributionScore(app)}</p>
                                  </div>
                                  {isApplicantSuggested(app) && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">★ Suggested</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${app.status === 'Accepted' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : app.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}`}>{app.status}</span>
                                  <select value={app.status} onChange={e => updateAppStatus(selectedInternship.id, app.id, e.target.value)}
                                    className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none">
                                    <option value="Nominated">Nominate</option>
                                    <option value="Accepted">Accept</option>
                                    <option value="Rejected">Reject</option>
                                  </select>
                                </div>
                              </div>
                            )) : <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">No applicants yet.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!showInternForm && filteredInternships.length === 0 && (
                      <div className="text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No internships match your search.</p>
                      </div>
                    )}
                    {!showInternForm && filteredInternships.map(intern => (
                      <div key={intern.id} className={`${cardClass} p-5 transition-all hover:border-blue-200 dark:hover:border-blue-700 ${intern.isArchived ? 'opacity-60' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0 space-y-1.5 cursor-pointer" onClick={() => setSelectedInternship(intern)}>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors">{intern.title}</h3>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{intern.company}</span>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{intern.duration}</span>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${intern.status === 'Currently Hiring' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{intern.status}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{intern.location} — {intern.details}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {intern.skills.split(',').map(s => <span key={s} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{s.trim()}</span>)}
                              {intern.programmingLanguages.split(',').map(l => <span key={l} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{l.trim()}</span>)}
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Posted {intern.posted || '2026-04-01'} · Deadline {intern.deadline} · {intern.applicants.length} applicant{intern.applicants.length !== 1 ? 's' : ''}</p>
                          </div>
                          <Button onClick={() => setSelectedInternship(intern)}>
                            <Icon d={IC.eye} size={13} />View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Find Instructors ── */}
            {activeTab === 'instructors' && (
              <div className="space-y-6">
                {!selectedInstructor ? (
                  <>
                    <div><h2 className={pageTitleClass}>Find Instructors</h2><p className={pageSubClass}>Search by name or course.</p></div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"><Icon d={IC.search} size={14} /></span>
                      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or course…"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-3">
                      {instructors.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.courses.join().toLowerCase().includes(searchTerm.toLowerCase())).map(inst => (
                        <div key={inst.id} className={`${cardClass} p-5`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-lg font-bold text-blue-700 dark:text-blue-300">{inst.name[0]}</div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{inst.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{inst.email}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">{inst.courses.map(c => <span key={c} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{c}</span>)}</div>
                              </div>
                            </div>
                            <Button onClick={() => setSelectedInstructor(inst)}><Icon d={IC.eye} size={13} />View Profile</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <button onClick={() => setSelectedInstructor(null)} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Icon d={IC.x} size={13} />← Back</button>
                    <div className={`${cardClass} p-6`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-2xl font-bold text-blue-700 dark:text-blue-300">{selectedInstructor.name[0]}</div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedInstructor.name}</h2>
                          <p className="text-slate-500 dark:text-slate-400">{selectedInstructor.email}</p>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">Course Instructor</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {selectedInstructor.bio && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Biography</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedInstructor.bio}</p></div>}
                          {selectedInstructor.researchInterests && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Research Interests</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedInstructor.researchInterests}</p></div>}
                          {selectedInstructor.education && <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Education</p><p className="text-sm text-slate-700 dark:text-slate-300">{selectedInstructor.education}</p></div>}
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-3">Teaching</p>
                          <ul className="space-y-2">{selectedInstructor.courses.map(c => <li key={c} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium"><span className="h-2 w-2 bg-blue-600 rounded-full" />{c}</li>)}</ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Favorites ── */}
            {activeTab === 'favorite-projects' && (
              <div className="space-y-6">
                <h2 className={pageTitleClass}>My Favorites</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Saved Projects ({favorites.projects.length})</h3>
                    {favorites.projects.length === 0 ? <div className={`${cardClass} py-10 text-center text-sm text-slate-400 dark:text-slate-500`}>No saved projects.</div> :
                      <div className="space-y-3">
                        {favorites.projects.map(id => {
                          const p = projectsData.find(x => x.id === id) || recommendedProjects.find(x => x.id === id)
                          if (!p) return null
                          return (
                            <div key={p.id} className={`${cardClass} p-4 cursor-pointer hover:border-blue-200 dark:hover:border-blue-700 transition-colors`} onClick={() => openProjectDetails(p)}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{p.title}</p>
                                  <div className="flex gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{p.domain || 'CSEN 603'}</span>
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">★ {getProjectRating(p)}/5</span>
                                  </div>
                                </div>
                                <button onClick={e => { e.stopPropagation(); toggleFavProject(p.id) }} className="shrink-0 text-red-400 hover:text-red-600 transition-colors"><Icon d={IC.x} size={14} /></button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    }
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Saved Portfolios ({favorites.portfolios.length})</h3>
                    {favorites.portfolios.length === 0 ? <div className={`${cardClass} py-10 text-center text-sm text-slate-400 dark:text-slate-500`}>No saved portfolios.</div> :
                      <div className="space-y-3">
                        {favorites.portfolios.map(id => {
                          const s = studentsData.find(x => x.id === id)
                          if (!s) return null
                          return (
                            <div key={s.id} className={`${cardClass} p-4 flex items-center justify-between gap-3`}>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.major}</p>
                              </div>
                              <button onClick={() => toggleFavPortfolio(s.id)} className="text-red-400 hover:text-red-600 transition-colors"><Icon d={IC.x} size={14} /></button>
                            </div>
                          )
                        })}
                      </div>
                    }
                  </div>
                </div>
              </div>
            )}

            {/* ── Recommended Projects ── */}
            {activeTab === 'recommended-projects' && (
              <div className="space-y-6">
                <div><h2 className={pageTitleClass}>Recommended Projects</h2><p className={pageSubClass}>Projects matching your company interests.</p></div>
                <div className="space-y-3">
                  {recommendedProjects.map(project => (
                    <div key={project.id} className={`${cardClass} p-5 cursor-pointer hover:border-blue-200 dark:hover:border-blue-700 transition-all group`} onClick={() => openProjectDetails(project)}>
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{project.title}</h3>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{project.domain || 'CSEN 603'}</span>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">★ {getProjectRating(project)}/5</span>
                          </div>
                          {project.summary && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{project.summary}</p>}
                          <div className="flex flex-wrap gap-1.5 mt-2">{getProjectTags(project).map(t => <span key={t} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t}</span>)}</div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">By {project.owner || 'student@student.guc.edu.eg'}</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleFavProject(project.id) }} className={`shrink-0 text-xl transition-transform hover:scale-125 ${favorites.projects.includes(project.id) ? 'text-red-500' : 'text-slate-300 dark:text-slate-600 hover:text-red-400'}`}>♡</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Project Details ── */}
            {activeTab === 'project-details' && selectedProject && (
              <div className="space-y-6">
                <button onClick={() => setActiveTab(favorites.projects.includes(selectedProject.id) ? 'favorite-projects' : 'recommended-projects')} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Icon d={IC.x} size={13} />← Back</button>
                <div className={`${cardClass} p-6`}>
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">{selectedProject.domain || 'Project'}</p>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedProject.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{selectedProject.summary || selectedProject.description || 'No summary available.'}</p>
                    </div>
                    <button onClick={() => toggleFavProject(selectedProject.id)} className={`shrink-0 text-2xl transition-transform hover:scale-110 ${favorites.projects.includes(selectedProject.id) ? 'text-red-500' : 'text-slate-300 dark:text-slate-600 hover:text-red-400'}`}>{favorites.projects.includes(selectedProject.id) ? '♥' : '♡'}</button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Tech Stack</p><div className="flex flex-wrap gap-1.5">{getProjectTags(selectedProject).map(t => <span key={t} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{t}</span>)}</div></div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Project Info</p>
                      <div><p className="text-xs text-slate-400 dark:text-slate-500">Owner</p><p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{selectedProject.owner || 'Student project'}</p></div>
                      <div><p className="text-xs text-slate-400 dark:text-slate-500">Domain</p><p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{selectedProject.domain || 'Not specified'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={pageTitleClass}>Messages</h2>
                  <Button onClick={() => setShowMessageModal(true)}><Icon d={IC.plus} size={13} />New Message</Button>
                </div>
                <div className="flex h-[calc(100vh-16rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
                  {/* Thread list */}
                  <div className="w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3.5">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Conversations</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Private messages</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                      {conversationNames.map(name => {
                        const last = [...messages].reverse().find(msg => msg.sender === name || msg.receiver === name)
                        const uc = messages.filter(msg => !msg.mine && !msg.read && msg.sender === name).length
                        const isActive = selectedConversation === name
                        return (
                          <button key={name} onClick={() => setSelectedConversation(name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isActive ? 'bg-blue-700' : 'hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'}`}>{name[0]}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`truncate text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{name}</p>
                                {uc > 0 && !isActive && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{uc}</span>}
                              </div>
                              <p className={`truncate text-[11px] mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{last?.text || 'No messages yet'}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-300">{selectedConversation[0]}</div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedConversation}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Private chat</p>
                        </div>
                      </div>
                      <button onClick={() => { setMessages(messages.map(msg => msg.sender === selectedConversation ? { ...msg, read: true } : msg)); showSuccess('Marked as read.') }} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">Mark read</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                      {selectedMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center"><p className="text-sm text-slate-400 dark:text-slate-500">Say hello 👋</p></div>
                      ) : selectedMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.mine ? 'rounded-br-md bg-blue-700 text-white' : 'rounded-bl-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'}`}>
                            <p>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.mine ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{msg.time || msg.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={sendQuickMessage} className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 flex gap-3">
                      <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                        <input value={quickMessage} onChange={e => setQuickMessage(e.target.value)} placeholder={`Message ${selectedConversation}…`} className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" />
                      </div>
                      <Button type="submit" disabled={!quickMessage.trim()}><Icon d={IC.send} size={13} />Send</Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className={pageTitleClass}>Notifications</h2>
                    <p className={pageSubClass}>Updates, alerts, and internship activity.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={markAllUnread}>Mark All Unread</Button>
                    <Button variant="secondary" onClick={markAllRead}>Mark All Read</Button>
                    <Button variant={notificationsEnabled ? 'danger' : 'primary'} onClick={toggleAllNotifications}>
                      <Icon d={IC.bell} size={13} />{notificationsEnabled ? 'Turn Off Alerts' : 'Turn On Alerts'}
                    </Button>
                  </div>
                </div>

                {!notificationsEnabled && (
                  <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
                    🔕 Alerts are currently paused.
                  </div>
                )}

                <div className="space-y-1.5">
                  {userNotifications.length > 0 ? userNotifications.map(n => (
                    <div key={n.id} onClick={() => handleNotificationClick(n)}
                      className={`group flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-150 ${n.read ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700' : 'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.text}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 uppercase font-medium tracking-wide">{n.time} · {n.read ? 'Read' : 'Unread'}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setUserNotifications(userNotifications.map(item => item.id === n.id ? { ...item, read: !item.read } : item)) }}
                        className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${!n.read ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        {n.read ? 'Unread' : 'Read'}
                      </button>
                    </div>
                  )) : (
                    <div className={`${cardClass} py-10 text-center text-sm text-slate-400 dark:text-slate-500`}>You're all caught up!</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Settings ── */}
            {activeTab === 'settings' && (
              <SettingsTab isDark={isDark} setTheme={setTheme} user={user} pageTitleClass={pageTitleClass} pageSubClass={pageSubClass} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function SettingsTab({ isDark, setTheme, user, pageTitleClass, pageSubClass }) {
  const [settTab, setSettTab] = useState('appearance')
  const [cooldown, setCooldown] = useState(false)
  const [cooldownCount, setCooldownCount] = useState(5)
  const startCooldown = () => { setCooldown(true); setCooldownCount(5); const t = setInterval(() => setCooldownCount(c => { if (c <= 1) { clearInterval(t); setTimeout(() => setCooldown(false), 400); return 0 } return c - 1 }), 1000) }
  return (
                <div className="space-y-6">
                  {cooldown && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
                      <div className="flex flex-col items-center gap-6 text-center">
                        <div className="relative flex h-32 w-32 items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-4 border-blue-400/30 animate-ping" />
                          <span className="text-4xl font-bold text-white">{cooldownCount}</span>
                        </div>
                        <div className="space-y-2"><p className="text-xl font-light text-white">Take a breath</p><p className="text-sm text-blue-200">Inhale slowly… exhale gently…</p></div>
                        <div className="h-1 w-48 rounded-full bg-slate-700"><div className="h-1 rounded-full bg-blue-400 transition-all duration-1000" style={{ width: `${(cooldownCount / 5) * 100}%` }} /></div>
                      </div>
                    </div>
                  )}
                  <div><h2 className={pageTitleClass}>Settings</h2><p className={pageSubClass}>Manage your account preferences.</p></div>
                  <div className="flex gap-6">
                    <div className="w-44 shrink-0 space-y-0.5">
                      {[{ id: 'appearance', label: 'Appearance', icon: IC.moon }, { id: 'wellness', label: 'Wellness', icon: IC.zap }, { id: 'account', label: 'Account', icon: IC.shield }].map(t => (
                        <button key={t.id} onClick={() => setSettTab(t.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${settTab === t.id ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-700'}`}>
                          <Icon d={t.icon} size={14} />{t.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      {settTab === 'appearance' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
                          <div><h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Choose your preferred theme.</p></div>
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setTheme(false)} className={`rounded-2xl border-2 p-4 text-left transition-all ${!isDark ? 'border-blue-600 shadow-md shadow-blue-100' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                              <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-200" /><div className="h-1.5 w-16 rounded bg-slate-200" /></div>
                                <div className="flex gap-2 p-2"><div className="w-8"><div className="h-1.5 rounded bg-blue-100" /></div><div className="flex-1"><div className="h-6 rounded-lg bg-blue-100" /></div></div>
                              </div>
                              <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800">Light</p><p className="text-xs text-slate-400">Clean and bright</p></div>{!isDark && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11} /></div>}</div>
                            </button>
                            <button onClick={() => setTheme(true)} className={`rounded-2xl border-2 p-4 text-left transition-all ${isDark ? 'border-blue-600 shadow-md shadow-blue-900/30' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                              <div className="mb-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                                <div className="flex items-center gap-1.5 border-b border-slate-700 bg-slate-800 px-3 py-2"><div className="h-2 w-2 rounded-full bg-slate-600" /><div className="h-1.5 w-16 rounded bg-slate-600" /></div>
                                <div className="flex gap-2 p-2"><div className="w-8"><div className="h-1.5 rounded bg-blue-900" /></div><div className="flex-1"><div className="h-6 rounded-lg bg-blue-900" /></div></div>
                              </div>
                              <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark</p><p className="text-xs text-slate-400 dark:text-slate-500">Easy on the eyes</p></div>{isDark && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600"><Icon d={IC.check} size={11} /></div>}</div>
                            </button>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                            <Icon d={isDark ? IC.moon : IC.sun} size={14} />
                            <p className="text-xs text-slate-600 dark:text-slate-300">Currently using <span className="font-semibold">{isDark ? 'Dark' : 'Light'}</span> mode</p>
                          </div>
                        </div>
                      )}
                      {settTab === 'wellness' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
                          <div><h3 className="font-semibold text-slate-900 dark:text-white">Wellness & Focus</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Tools to help you stay calm and focused.</p></div>
                          <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 text-center space-y-3">
                            <div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"><Icon d={IC.zap} size={24} /></div></div>
                            <div><p className="font-semibold text-slate-900 dark:text-white">5-Second Cooldown</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A calming overlay to guide you through a breathing reset.</p></div>
                            <button onClick={startCooldown} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 active:scale-95 transition-all"><Icon d={IC.zap} size={14} />Start Cooldown</button>
                          </div>
                        </div>
                      )}
                      {settTab === 'account' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
                          <div><h3 className="font-semibold text-slate-900 dark:text-white">Account Settings</h3><p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Your account information.</p></div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Role</span><span className="font-medium text-slate-800 dark:text-slate-200">Employer</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Company</span><span className="font-medium text-slate-800 dark:text-slate-200">{user.companyName || '—'}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
}

export default EmployerDashboard