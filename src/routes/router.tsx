import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import HomePage from '../pages/HomePage'
import ProjectLandingPage from '../pages/ProjectLandingPage'
import NotFoundPage from '../pages/NotFoundPage'

// One React application serves every builder project. A project is reached
// either by its wildcard subdomain (signature-sarvam.grihamconnect.com,
// resolved client-side in HomePage) or directly by path — useful for local
// dev, previews, and QA before DNS/Cloudflare is wired up.
//
// Project landing pages sit outside the <App> layout: each one is a
// self-contained page with its own header, footer and brand system.
export const router = createBrowserRouter([
  {
    path: '/projects/:slug',
    element: <ProjectLandingPage />,
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
