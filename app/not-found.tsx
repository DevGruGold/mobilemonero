import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-700 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
