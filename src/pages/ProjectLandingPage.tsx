import { useParams } from 'react-router-dom'
import { getProjectEntry } from '../lib/projectRegistry'
import Container from '../components/ui/Container'
import NotFoundPage from './NotFoundPage'

export default function ProjectLandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const entry = slug ? getProjectEntry(slug) : undefined

  if (!entry) return <NotFoundPage />

  // Projects with a bespoke landing page render it full-bleed, without the
  // shared site chrome.
  if (entry.Page) {
    const { Page } = entry
    return <Page />
  }

  const { project } = entry

  return (
    <Container className="py-16">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {project.builder} · {project.location}
      </p>
      <p className="mt-6 max-w-2xl">{project.description}</p>
      <p className="mt-8 text-xs uppercase tracking-[0.1em] text-gold">
        RERA: {project.reraId}
      </p>
    </Container>
  )
}
