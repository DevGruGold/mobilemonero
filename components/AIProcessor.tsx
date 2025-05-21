"use client"

import { useState, useEffect } from "react"

interface AIProcessorProps {
  imageBlob: Blob | null
  setAiResult: (result: { observation: string; question: string } | null) => void
}

export default function AIProcessor({ imageBlob, setAiResult }: AIProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function processImage() {
      if (!imageBlob) return

      try {
        setIsProcessing(true)

        const formData = new FormData()
        formData.append("image", imageBlob, "image.jpg")

        const response = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.observation && result.question) {
          setAiResult(result)
        } else if (result.error) {
          console.error("API error:", result.error)
          setAiResult({
            observation: "I can see your image",
            question: "How can I help you with what I'm seeing?",
          })
        } else {
          console.error("Invalid response format")
          setAiResult({
            observation: "I can see your image",
            question: "How can I help you with what I'm seeing?",
          })
        }
      } catch (error) {
        console.error("Error processing image:", error)
        setAiResult({
          observation: "I can see your image",
          question: "How can I help you with what I'm seeing?",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    if (imageBlob) {
      processImage()
    }
  }, [imageBlob, setAiResult])

  return (
    <div className="mb-6">
      {isProcessing && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-600">Processing image...</p>
        </div>
      )}
    </div>
  )
}
