export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">The page you are looking for doesn’t exist.</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Go home
        </a>
      </div>
    </div>
  )
}

