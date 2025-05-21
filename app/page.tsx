"use client"

import { useState } from "react"
import Camera from "@/components/Camera"
import Chat from "@/components/Chat"
import Web3Button from "@/components/Web3Button"
import LanguageToggle from "@/components/LanguageToggle"
import ModelInfo from "@/components/ModelInfo"

interface AnalysisResult {
  observation: string
  question: string
}

type Language = "en" | "es"

// Translations for static UI text
const translations = {
  en: {
    title: "AssisteMae",
    subtitle: "Show your problem to the camera, and AssisteMae will try to help!",
    analyzing: "AssisteMae is analyzing your image...",
    defaultTitle: "Assistance Session",
  },
  es: {
    title: "AssisteMae",
    subtitle: "Muestra tu problema a la cámara, ¡y AssisteMae intentará ayudarte!",
    analyzing: "AssisteMae está analizando tu imagen...",
    defaultTitle: "Sesión de Asistencia",
  },
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [chatTitle, setChatTitle] = useState("")
  const [language, setLanguage] = useState<Language>("en")

  const t = translations[language]

  const handleCapture = async (imageBlob: Blob) => {
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", imageBlob, "image.jpg")
      formData.append("language", language)

      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const result = await response.json()

      if (result.observation && result.question) {
        setAnalysisResult(result)

        // Generate a title based on the observation
        const titleResponse = await fetch("/api/generate-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            observation: result.observation,
            language,
          }),
        })

        if (titleResponse.ok) {
          const { title } = await titleResponse.json()
          setChatTitle(title)
        } else {
          setChatTitle(t.defaultTitle)
        }
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error analyzing image:", error)
      setAnalysisResult({
        observation: language === "en" ? "I can see your image" : "Puedo ver tu imagen",
        question:
          language === "en"
            ? "How can I help you with what I'm seeing?"
            : "¿Cómo puedo ayudarte con lo que estoy viendo?",
      })
      setChatTitle(t.defaultTitle)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setChatTitle("")
  }

  const handleLanguageToggle = (newLanguage: Language) => {
    setLanguage(newLanguage)

    // If we're in the middle of a chat, we need to reset to avoid mixed languages
    if (analysisResult) {
      resetAnalysis()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-center text-indigo-600">{t.title}</h1>
            <ModelInfo language={language} />

            <LanguageToggle language={language} onToggle={handleLanguageToggle} />

            {!analysisResult ? (
              <>
                <p className="text-center text-gray-600 mb-6">{t.subtitle}</p>
                <Camera onCapture={handleCapture} language={language} />
                {isAnalyzing && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg mt-4">
                    <p className="text-blue-600">{t.analyzing}</p>
                  </div>
                )}
              </>
            ) : (
              <Chat
                initialObservation={analysisResult.observation}
                initialQuestion={analysisResult.question}
                chatTitle={chatTitle}
                onReset={resetAnalysis}
                language={language}
              />
            )}

            <div className="mt-6">
              <Web3Button />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
