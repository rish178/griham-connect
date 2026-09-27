export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-6 text-sm text-gray-500">
      <div className="mx-auto w-full max-w-6xl px-4">
        © {new Date().getFullYear()} Griham Connect. All rights reserved.
      </div>
    </footer>
  )
}
