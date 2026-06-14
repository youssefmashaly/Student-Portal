import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import projects from '../../data/projects'
import students from '../../data/students'
import { getCurrentUser } from '../../data/authStorage'

function Landing() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-slate-200/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            ProjectHub
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Showcase high-impact GUC projects with a premium portfolio experience.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
            Built for students, instructors, and employers to discover project excellence,
            validate skills, and create meaningful academic-industry connections.
          </p>
        </div>
        
        <div className="mt-8 flex flex-wrap gap-3">
          {!currentUser ? (
            <>
              <Link to="/register-student">
                <Button>Get Started as Student</Button>
              </Link>
              <Link to="/register-instructor">
                <Button variant="secondary">Register as Instructor</Button>
              </Link>
              <Link to="/register-employer">
                <Button variant="secondary">Join as Employer</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/explore-projects">
                <Button variant="muted">Explore Projects</Button>
              </Link>
              <Link to="/explore-portfolios">
                <Button variant="muted">Explore Portfolios</Button>
              </Link>
              <Link to={`/${currentUser.role}`}>
                <Button variant="secondary">Go to My Dashboard</Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Portfolio Visibility</p>
            <p className="mt-1 text-sm text-blue-100">Present final projects in a professional format.</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Verified Roles</p>
            <p className="mt-1 text-sm text-blue-100">Student, instructor, and employer pathways.</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Recruitment Ready</p>
            <p className="mt-1 text-sm text-blue-100">Help companies discover GUC talent faster.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Featured Projects
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              title={project.title}
              subtitle={`${project.domain} • ${project.year}`}
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">{project.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
          Top Student Profiles
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card
              key={student.id}
              title={student.name}
              subtitle={`${student.major} • Class of ${student.graduationYear}`}
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">{student.headline}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Landing