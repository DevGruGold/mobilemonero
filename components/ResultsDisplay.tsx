interface ResultsDisplayProps {
  aiResult: { observation: string; question: string } | null
}

export default function ResultsDisplay({ aiResult }: ResultsDisplayProps) {
  if (!aiResult) return null

  return (
    <div className="mb-6 p-4 bg-indigo-100 rounded-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 text-indigo-800">I see:</h2>
        <p className="text-gray-800">{aiResult.observation}</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2 text-indigo-800">How can I help?</h2>
        <p className="text-gray-800">{aiResult.question}</p>
      </div>
    </div>
  )
}
