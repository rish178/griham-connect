import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import HomePage from '../pages/HomePage'
import ProjectLandingPage from '../pages/ProjectLandingPage'
import NotFoundPage from '../pages/NotFoundPage'

// One React application serves every builder project. A project is reached
// either by its wildcard subdomain (signature-sarvam.grihamconnect.com,
// resolved client-side in HomePage) or directly by path — useful for local
// dev, previews, and QA before DNS/Cloudflare is wired up.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects/:slug', element: <ProjectLandingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
