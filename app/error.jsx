"use client";

export default function Error({ reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="text-2xl font-bold">Something went wrong</div>
        <div className="text-sm text-muted-foreground">
          Please try again.
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

