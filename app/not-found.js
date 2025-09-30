export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mt-4 text-gray-600">The page you're looking for doesn't exist.</p>
          <a 
            href="/"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}