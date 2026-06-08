import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import projects from '../../data/projects'
import { getCurrentUser } from '../../data/authStorage'

function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const project = projects.find((entry) => entry.id === id)

  if (!currentUser) return null;

  if (!project) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Not Found</h1>
        <Link to="/explore-projects" className="mt-4 inline-block text-blue-700">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {project.student} {project.email && `(${project.email})`} • {project.domain} • {project.year}
      </p>
      
      {project.rating && <p className="mt-1 text-sm font-bold text-amber-500">⭐ {project.rating} Rating</p>}
      {project.date && <p className="mt-1 text-sm text-slate-500">Created: {project.date}</p>}
      
      <p className="mt-4 text-slate-700 dark:text-slate-300">{project.summary}</p>

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tech Stack</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails