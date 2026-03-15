export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="text-2xl font-bold">Page not found</div>
        <div className="text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist.
        </div>
        <a href="/" className="inline-block text-sm font-medium underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

