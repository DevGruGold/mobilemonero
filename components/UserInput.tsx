"use client"

import type React from "react"

import { useState } from "react"

interface UserInputProps {
  onSubmit: (userInput: string) => void
  isVisible: boolean
}

// Declare SpeechRecognition interface to avoid Typescript errors
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export default function UserInput({ onSubmit, isVisible }: UserInputProps) {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input)
      setInput("")
    }
  }

  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.lang = "en-US"

    recognitionInstance.onstart = () => {
      setIsRecording(true)
    }

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognitionInstance.onend = () => {
      setIsRecording(false)
    }

    recognitionInstance.start()
    setRecognition(recognitionInstance)
  }

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
            className={`px-4 py-2 rounded-md ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isRecording ? "Stop" : "🎤"}
          </button>
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md">
          Send
        </button>
      </form>
    </div>
  )
}
