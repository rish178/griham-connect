import Container from '../ui/Container'

export default function Header() {
  return (
    <header className="border-b border-gray-100">
      <Container className="flex items-center justify-between py-4">
        <span className="text-lg font-semibold">Griham Connect</span>
      </Container>
    </header>
  )
}
