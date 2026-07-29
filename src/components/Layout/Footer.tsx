import Container from '../ui/Container'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-6 text-sm text-gray-500">
      <Container>© {new Date().getFullYear()} Griham Connect. All rights reserved.</Container>
    </footer>
  )
}
