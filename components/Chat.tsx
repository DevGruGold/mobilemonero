"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ImageUploader from "./ImageUploader"
import Camera from "./Camera"
import TextToSpeech from "./TextToSpeech"
import DonationOptions from "./DonationOptions"

interface ChatProps {
  initialObservation: string
  initialQuestion: string
  chatTitle: string
  onReset: () => void
  language: "en" | "es"
}

interface Message {
  role: "user" | "assistant"
  content: string
  imageUrl?: string
}

const translations = {
  en: {
    newAnalysis: "New Analysis",
    placeholder: "Type your message...",
    sending: "...",
    send: "Send",
    errorMessage: "Sorry, I had trouble responding. Could you try again?",
    showCamera: "Take a Photo",
    hideCamera: "Hide Camera",
    showUploader: "Upload Image",
    hideUploader: "Hide Uploader",
    processingImage: "Processing your image...",
    voiceOn: "Voice On",
    voiceOff: "Voice Off",
    appIntro:
      "Welcome to AssisteMae! I can help you with various tasks by analyzing images and providing guidance. You can take photos, upload images, or just chat with me. What can I assist you with today?",
    donationPrompt:
      "I hope I was able to help! If you found this service useful, please consider making a small donation to support AssisteMae's development. Thank you!",
  },
  es: {
    newAnalysis: "Nuevo Análisis",
    placeholder: "Escribe tu mensaje...",
    sending: "...",
    send: "Enviar",
    errorMessage: "Lo siento, tuve problemas para responder. ¿Podrías intentarlo de nuevo?",
    showCamera: "Tomar una Foto",
    hideCamera: "Ocultar Cámara",
    showUploader: "Subir Imagen",
    hideUploader: "Ocultar Subida",
    processingImage: "Procesando tu imagen...",
    voiceOn: "Voz Activada",
    voiceOff: "Voz Desactivada",
    appIntro:
      "¡Bienvenido a AssisteMae! Puedo ayudarte con varias tareas analizando imágenes y proporcionando orientación. Puedes tomar fotos, subir imágenes o simplemente chatear conmigo. ¿En qué puedo ayudarte hoy?",
    donationPrompt:
      "¡Espero haber podido ayudar! Si encontraste útil este servicio, por favor considera hacer una pequeña donación para apoyar el desarrollo de AssisteMae. ¡Gracias!",
  },
}

// Keywords that might indicate a conversation is ending
const endingKeywords = {
  en: ["thank", "thanks", "bye", "goodbye", "see you", "later", "done", "finished", "complete", "helped"],
  es: ["gracias", "adios", "nos vemos", "hasta luego", "terminado", "completo", "ayudado", "listo"],
}

export default function Chat({ initialObservation, initialQuestion, chatTitle, onReset, language }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: translations[language].appIntro },
    { role: "assistant", content: initialObservation },
    { role: "assistant", content: initialQuestion },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [autoRead, setAutoRead] = useState(true)
  const [donationPrompted, setDonationPrompted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Check if the message might indicate the conversation is ending
  const isEndingConversation = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    const keywords = endingKeywords[language]

    return keywords.some((keyword) => lowerMessage.includes(keyword)) && lowerMessage.length < 100 // Only consider short messages
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsProcessing(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          context: initialObservation,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])

      // Check if we should prompt for donation
      if (!donationPrompted && isEndingConversation(userMessage)) {
        // Wait a moment before sending the donation prompt
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: "assistant", content: t.donationPrompt }])
          setDonationPrompted(true)
        }, 2000)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [...prev, { role: "assistant", content: t.errorMessage }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageCaptured = async (imageBlob: Blob) => {
    setIsProcessing(true)
    setShowCamera(false)
    setShowUploader(false)

    // Add a temporary message to show we're processing
    setMessages((prev) => [...prev, { role: "user", content: t.processingImage }])

    try {
      const formData = new FormData()
      formData.append("image", imageBlob, "image.jpg")
      formData.append("language", language)
      formData.append("isFollowUp", "true")

      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const result = await response.json()

      // Remove the temporary message
      setMessages((prev) => prev.slice(0, -1))

      // Create a URL for the image blob to display in the chat
      const imageUrl = URL.createObjectURL(imageBlob)

      // Add the image message
      setMessages((prev) => [...prev, { role: "user", content: "", imageUrl }])

      // Add the AI response
      if (result.observation && result.question) {
        setMessages((prev) => [...prev, { role: "assistant", content: `${result.observation}\n\n${result.question}` }])
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error processing image:", error)

      // Remove the temporary message
      setMessages((prev) => prev.slice(0, -1))

      setMessages((prev) => [...prev, { role: "assistant", content: t.errorMessage }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">AssisteMae: {chatTitle}</h2>
          <button onClick={onReset} className="bg-white text-indigo-600 px-3 py-1 rounded text-sm">
            {t.newAnalysis}
          </button>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
            {message.imageUrl && (
              <div className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
                <img
                  src={message.imageUrl || "/placeholder.svg"}
                  alt="User uploaded"
                  className="inline-block max-w-[200px] max-h-[200px] rounded-lg border-2 border-indigo-200"
                />
              </div>
            )}
            {message.content && (
              <div className="flex items-start gap-2">
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === "user" ? "bg-indigo-500 text-white ml-auto" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <TextToSpeech
                    text={message.content}
                    language={language}
                    autoPlay={autoRead && index === messages.length - 1}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showCamera && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Camera onCapture={handleImageCaptured} language={language} />
          <button
            onClick={() => setShowCamera(false)}
            className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t.hideCamera}
          </button>
        </div>
      )}

      {showUploader && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <ImageUploader onImageCaptured={handleImageCaptured} language={language} />
          <button
            onClick={() => setShowUploader(false)}
            className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t.hideUploader}
          </button>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCamera(!showCamera)
                if (showCamera) setShowUploader(false)
              }}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isProcessing}
            >
              {showCamera ? t.hideCamera : t.showCamera}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploader(!showUploader)
                if (showUploader) setShowCamera(false)
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isProcessing}
            >
              {showUploader ? t.hideUploader : t.showUploader}
            </button>
          </div>
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              autoRead ? "bg-indigo-100 text-indigo-800" : "bg-gray-200 text-gray-600"
            }`}
            title={autoRead ? t.voiceOff : t.voiceOn}
          >
            {autoRead ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                <span className="hidden sm:inline">{t.voiceOn}</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <span className="hidden sm:inline">{t.voiceOff}</span>
              </>
            )}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 p-2 border rounded"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isProcessing ? t.sending : t.send}
            </button>
          </div>
        </form>

        {donationPrompted && (
          <div className="mt-4">
            <DonationOptions language={language} />
          </div>
        )}
      </div>
    </div>
  )
}
