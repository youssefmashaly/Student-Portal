import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import students from '../../data/students'
import { getCurrentUser } from '../../data/authStorage'

function PortfolioDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const student = students.find((entry) => entry.id === id)

  if (!currentUser) return null;

  if (!student) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Not Found</h1>
        <Link to="/explore-portfolios" className="mt-4 inline-block text-blue-700">
          Back to portfolios
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
      {student.email && <p className="text-blue-600 font-medium text-sm">{student.email}</p>}
      
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {student.major} • Class of {student.graduationYear}
      </p>
      <p className="mt-4 text-slate-700 dark:text-slate-300">{student.headline}</p>

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Core Skills</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {student.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PortfolioDetails