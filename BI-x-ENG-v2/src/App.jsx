import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import Landing from './pages/public/Landing'
import ExploreProjects from './pages/public/ExploreProjects'
import ExplorePortfolios from './pages/public/ExplorePortfolios'
import ProjectDetails from './pages/public/ProjectDetails'
import PortfolioDetails from './pages/public/PortfolioDetails'
import Login from './pages/auth/Login'
import RegisterStudent from './pages/auth/RegisterStudent'
import RegisterInstructor from './pages/auth/RegisterInstructor'
import RegisterEmployer from './pages/auth/RegisterEmployer'
import ForgotPassword from './pages/auth/ForgotPassword'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import InstructorDashboard from './pages/dashboards/InstructorDashboard'
import EmployerDashboard from './pages/dashboards/EmployerDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'explore-projects', element: <ExploreProjects /> },
      { path: 'explore-portfolios', element: <ExplorePortfolios /> },
      { path: 'project/:id', element: <ProjectDetails /> },
      { path: 'portfolio/:id', element: <PortfolioDetails /> },
      { path: 'login', element: <Login /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'register-student', element: <RegisterStudent /> },
      { path: 'register-instructor', element: <RegisterInstructor /> },
      { path: 'register-employer', element: <RegisterEmployer /> },
    ],
  },
  { path: '/student', element: <StudentDashboard /> },
  { path: '/instructor', element: <InstructorDashboard /> },
  { path: '/employer', element: <EmployerDashboard /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '*', element: <NotFound /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App