import { Outlet } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
