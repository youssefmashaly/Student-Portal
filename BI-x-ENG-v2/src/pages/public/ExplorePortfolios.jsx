import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import studentsData from '../../data/students'
import { getCurrentUser, getUsers } from '../../data/authStorage'

function ExplorePortfolios() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  // 1. Security Check: Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  // 2. Dynamic Portfolios State
  const [allStudents, setAllStudents] = useState(() => {
    // A: Get saved extended profiles if available
    const savedProfiles = localStorage.getItem('guc_projecthub_students')
    const parsedProfiles = savedProfiles ? JSON.parse(savedProfiles) : studentsData

    // B: Merge newly registered users from authStorage that might not have a full profile yet
    const registeredStudents = getUsers().filter(u => u.role === 'student')
    
    const mergedStudents = [...parsedProfiles]
    
    registeredStudents.forEach(registeredUser => {
      // If the registered user isn't in our portfolio display list yet, add them dynamically!
      if (!mergedStudents.find(s => s.email?.toLowerCase() === registeredUser.email?.toLowerCase())) {
        mergedStudents.push({
          id: registeredUser.email, // Fallback ID
          name: `${registeredUser.firstName || ''} ${registeredUser.lastName || ''}`.trim() || registeredUser.email,
          email: registeredUser.email,
          major: registeredUser.major || 'Major Not Specified',
          graduationYear: registeredUser.graduationYear || 'N/A',
          headline: registeredUser.headline || 'Newly Registered Student',
          skills: registeredUser.skills || [],
          projects: registeredUser.projects || [],
          projectCount: registeredUser.projects?.length || 0
        })
      }
    })

    return mergedStudents
  })

  // 3. Listen for changes (Instant sync if a new user registers or updates their profile in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'guc_projecthub_students' || e.key === 'guc_projecthub_users') {
        // Trigger a reload of the state by reloading the window, 
        // or re-running the merge logic. For simplicity, force refresh the list:
        const updatedUsers = getUsers().filter(u => u.role === 'student');
        setAllStudents(prev => {
          const merged = [...prev];
          updatedUsers.forEach(u => {
            if (!merged.find(s => s.email?.toLowerCase() === u.email?.toLowerCase())) {
              merged.push({ id: u.email, name: `${u.firstName} ${u.lastName}`.trim(), email: u.email, major: 'Not Specified', skills: [], headline: 'New Student' });
            }
          })
          return [...merged];
        })
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [majorFilter, setMajorFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default') 

  // Dynamically extract unique majors and skills
  const majors = ['all', ...new Set(allStudents.map((student) => student.major))]
  const allSkills = new Set()
  allStudents.forEach((student) => student.skills?.forEach((skill) => allSkills.add(skill)))
  const availableSkills = ['all', ...Array.from(allSkills)]

  const filteredStudents = useMemo(() => {
    let result = allStudents.filter((student) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.headline?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesMajor = majorFilter === 'all' || student.major === majorFilter
      const matchesSkill = skillFilter === 'all' || (student.skills && student.skills.includes(skillFilter))

      return matchesSearch && matchesMajor && matchesSkill
    })

    if (sortBy === 'projectsDesc') {
      result.sort((a, b) => (b.projects?.length || b.projectCount || 0) - (a.projects?.length || a.projectCount || 0))
    } else if (sortBy === 'projectsAsc') {
      result.sort((a, b) => (a.projects?.length || a.projectCount || 0) - (b.projects?.length || b.projectCount || 0))
    }

    return result
  }, [allStudents, searchTerm, majorFilter, skillFilter, sortBy])

  // Prevent rendering the page while redirecting
  if (!currentUser) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Portfolios</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Discover talented GUC students and their technical strengths.
      </p>

      {/* Filter Section */}
      <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by student name, email, or headline..."
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
        />
        
        <select value={majorFilter} onChange={(e) => setMajorFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700">
          {majors.map((major) => <option key={major} value={major}>{major === 'all' ? 'All Majors' : major}</option>)}
        </select>

        <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700">
          {availableSkills.map((skill) => <option key={skill} value={skill}>{skill === 'all' ? 'All Skills' : skill}</option>)}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700 font-semibold">
          <option value="default">Sort by...</option>
          <option value="projectsDesc">Most Projects</option>
          <option value="projectsAsc">Fewest Projects</option>
        </select>
      </div>

      {/* Portfolios Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card
            key={student.id || student.email}
            title={student.name}
            subtitle={`${student.major} • Class of ${student.graduationYear || 'N/A'}`}
          >
           <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{student.headline}</p>
            
            <div className="mt-3 flex items-center gap-2">
               <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                 {student.projects?.length || student.projectCount || 0} Projects
               </span>
            </div>

            <Link to={`/portfolio/${student.id || student.email}`} className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
              View portfolio →
            </Link>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="mt-10 text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No portfolios match your search and filter criteria.</p>
        </div>
      )}
    </div>
  )
}

export default ExplorePortfolios