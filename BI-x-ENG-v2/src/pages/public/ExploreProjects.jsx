import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import projectsData from '../../data/projects'
import { getCurrentUser } from '../../data/authStorage'

function ExploreProjects() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const [allProjects, setAllProjects] = useState(() => {
    const saved = localStorage.getItem('guc_projecthub_projects')
    if (saved) return JSON.parse(saved)
    localStorage.setItem('guc_projecthub_projects', JSON.stringify(projectsData))
    return projectsData
  })

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'guc_projecthub_projects' && e.newValue) {
        setAllProjects(JSON.parse(e.newValue))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [instructorFilter, setInstructorFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy] = useState('default') 

  const domains = ['all', ...new Set(allProjects.map((project) => project.domain).filter(Boolean))]
  const courses = ['all', ...new Set(allProjects.map((project) => project.course).filter(Boolean))]
  const instructors = ['all', ...new Set(allProjects.map((project) => project.instructor).filter(Boolean))]

  const filteredProjects = useMemo(() => {
    let result = allProjects.filter((project) => {
      const matchesSearch =
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDomain = domainFilter === 'all' || project.domain === domainFilter
      const matchesCourse = courseFilter === 'all' || project.course === courseFilter
      const matchesInstructor = instructorFilter === 'all' || project.instructor === instructorFilter
      const matchesDate = dateFilter === '' || project.date === dateFilter

      return matchesSearch && matchesDomain && matchesCourse && matchesInstructor && matchesDate
    })

    if (sortBy === 'dateDesc') {
      result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)) 
    } else if (sortBy === 'dateAsc') {
      result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)) 
    } else if (sortBy === 'ratingDesc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0)) 
    } else if (sortBy === 'ratingAsc') {
      result.sort((a, b) => (a.rating || 0) - (b.rating || 0)) 
    }

    return result
  }, [allProjects, searchTerm, domainFilter, courseFilter, instructorFilter, dateFilter, sortBy])

  if (!currentUser) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Projects</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Browse graduation and course projects submitted by GUC students.
      </p>

      <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by title, student, email..."
          className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none lg:col-span-2"
        />
        
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700">
          {domains.map((domain) => <option key={domain} value={domain}>{domain === 'all' ? 'All Domains' : domain}</option>)}
        </select>

        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700">
          {courses.map((course) => <option key={course} value={course}>{course === 'all' ? 'All Courses' : course}</option>)}
        </select>

        <select value={instructorFilter} onChange={(e) => setInstructorFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700">
          {instructors.map((instructor) => <option key={instructor} value={instructor}>{instructor === 'all' ? 'All Instructors' : instructor}</option>)}
        </select>

        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 text-sm focus:border-blue-700" title="Filter by Creation Date" />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-blue-700 font-semibold">
          <option value="default">Sort by...</option>
          <option value="dateDesc">Newest First</option>
          <option value="dateAsc">Oldest First</option>
          <option value="ratingDesc">Highest Rated</option>
          <option value="ratingAsc">Lowest Rated</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} title={project.title} subtitle={`${project.student} • ${project.domain}`}>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{project.summary}</p>
            
            {/* Instructor Rating visible to all */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              {project.date && <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded">📅 {project.date}</span>}
              {project.rating && (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded shadow-sm">
                  ⭐ Instructor Rating: {project.rating}/5
                </span>
              )}
            </div>
            
            <Link to={`/project/${project.id}`} className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900">
              View details →
            </Link>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="mt-10 text-center p-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400 font-medium">No projects match your search and filter criteria.</p>
        </div>
      )}
    </div>
  )
}

export default ExploreProjects