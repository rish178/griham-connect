import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubdomainSlug } from '../lib/subdomain'
import { getProject } from '../lib/projectRegistry'
import Container from '../components/ui/Container'

export default function HomePage() {
  const navigate = useNavigate()
  const [checkedSubdomain, setCheckedSubdomain] = useState(false)

  useEffect(() => {
    const slug = getSubdomainSlug()
    if (slug && getProject(slug)) {
      navigate(`/projects/${slug}`, { replace: true })
    } else {
      setCheckedSubdomain(true)
    }
  }, [navigate])

  if (!checkedSubdomain) return null

  return (
    <Container className="py-24 text-center">
      <h1 className="text-4xl font-bold">Griham Connect</h1>
      <p className="mt-4 text-lg text-gray-600">
        Real estate landing pages, built and deployed per project.
      </p>
    </Container>
  )
}
