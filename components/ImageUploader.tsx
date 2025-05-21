"use client"

import type React from "react"

import { useState, useRef } from "react"

interface ImageUploaderProps {
  onImageCaptured: (imageBlob: Blob) => void
  language: "en" | "es"
}

const translations = {
  en: {
    uploadImage: "Upload Image",
    takePicture: "Take Picture",
    orDivider: "or",
    uploadingImage: "Uploading...",
    processingImage: "Processing...",
  },
  es: {
    uploadImage: "Subir Imagen",
    takePicture: "Tomar Foto",
    orDivider: "o",
    uploadingImage: "Subiendo...",
    processingImage: "Procesando...",
  },
}

export default function ImageUploader({ onImageCaptured, language }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = translations[language]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    // Create a blob from the file
    const reader = new FileReader()
    reader.onloadend = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type })
      onImageCaptured(blob)
      setIsProcessing(false)

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col space-y-2">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <button
        onClick={triggerFileInput}
        disabled={isProcessing}
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isProcessing ? t.uploadingImage : t.uploadImage}
      </button>
    </div>
  )
}
