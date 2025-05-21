"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-700 mb-4">We apologize for the inconvenience. An error has occurred.</p>
        <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
          <code className="text-sm text-gray-800">{error.message}</code>
        </div>
        <button
          onClick={reset}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
