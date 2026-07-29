import { useParams } from 'react-router-dom'
import { getProject } from '../lib/projectRegistry'
import Container from '../components/ui/Container'
import NotFoundPage from './NotFoundPage'

export default function ProjectLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProject(slug) : undefined

  if (!project) return <NotFoundPage />

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="mt-2 text-gray-600">
        {project.builder} · {project.location}
      </p>
      <p className="mt-6 max-w-2xl">{project.description}</p>
    </Container>
  )
}
