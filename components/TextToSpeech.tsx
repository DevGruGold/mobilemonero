"use client"

import { useState, useEffect, useCallback } from "react"

interface TextToSpeechProps {
  text: string
  language: "en" | "es"
  autoPlay?: boolean
}

export default function TextToSpeech({ text, language, autoPlay = false }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  // Set up speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setSpeechSupported(false)
    }
  }, [])

  const speak = useCallback(() => {
    if (!speechSupported || !text) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Set language
    utterance.lang = language === "en" ? "en-US" : "es-ES"

    // Find an appropriate voice
    const voices = window.speechSynthesis.getVoices()
    const languageCode = language === "en" ? "en" : "es"

    // Try to find a voice for the selected language
    const voice =
      voices.find((v) => v.lang.startsWith(languageCode) && v.localService) ||
      voices.find((v) => v.lang.startsWith(languageCode)) ||
      null

    if (voice) {
      utterance.voice = voice
    }

    // Set event handlers
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    // Speak
    window.speechSynthesis.speak(utterance)
  }, [text, language, speechSupported])

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && text) {
      speak()
    }

    // Clean up any speech when component unmounts
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [autoPlay, text, speak])

  if (!speechSupported) return null

  return (
    <button
      onClick={speak}
      disabled={isSpeaking || !text}
      className={`p-2 rounded-full ${
        isSpeaking ? "bg-red-500 text-white" : "bg-indigo-100 text-indigo-800"
      } disabled:opacity-50`}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isSpeaking ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      )}
    </button>
  )
}
