import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Button from './Button'
import { getCurrentUser, logoutUser } from '../data/authStorage'

const navLinks = [
  { to: '/explore-projects', label: 'Explore Projects' },
  { to: '/explore-portfolios', label: 'Explore Portfolios' },
]

function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logoutUser()
    setMobileOpen(false)
    navigate('/login')
  }

  const dashboardPathByRole = {
    student: '/student',
    instructor: '/instructor',
    employer: '/employer',
    admin: '/admin',
  }

  const roleLabelByRole = {
    student: 'Student',
    instructor: 'Course Instructor',
    employer: 'Employer',
    admin: 'Administrator',
  }
const { isDark, toggleTheme } = useTheme()
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
          BI X ENG V2 <span className="text-blue-700">ProjectHub</span>
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-slate-700 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
        <nav className="hidden items-center gap-2 whitespace-nowrap md:flex lg:gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {!currentUser ? (
            <>
              <NavLink
                to="/register-student"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`
                }
              >
                Register Student
              </NavLink>
              <NavLink
                to="/register-instructor"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`
                }
              >
                Register Instructor
              </NavLink>
              <NavLink
                to="/register-employer"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`
                }
              >
                Register Employer
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`
                }
              >
                Login
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {roleLabelByRole[currentUser.role] ?? currentUser.role}
              </span>
              <NavLink
                to={dashboardPathByRole[currentUser.role] ?? '/'}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
              >
                Dashboard
              </NavLink>
              <Button variant="muted" className="px-3 py-2" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
      {mobileOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!currentUser ? (
              <>
                <NavLink
                  to="/register-student"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  Register Student
                </NavLink>
                <NavLink
                  to="/register-instructor"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  Register Instructor
                </NavLink>
                <NavLink
                  to="/register-employer"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  Register Employer
                </NavLink>
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Login
                </NavLink>
              </>
            ) : (
              <>
                <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                  {roleLabelByRole[currentUser.role] ?? currentUser.role}
                </span>
                <NavLink
                  to={dashboardPathByRole[currentUser.role] ?? '/'}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700"
                >
                  Dashboard
                </NavLink>
                <Button variant="muted" className="px-3 py-2" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
<button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="ml-1 rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>

          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
