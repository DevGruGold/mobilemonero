"use client"

import { useEffect, useRef, useState } from "react"

interface CameraProps {
  onCapture: (imageBlob: Blob) => void
  language: "en" | "es"
}

const translations = {
  en: {
    permissionNeeded: "Camera access is needed to analyze your problem",
    requestPermission: "Allow Camera Access",
    analyzeButton: "Analyze with AssisteMae",
    analyzing: "Analyzing...",
    permissionDenied:
      "Camera access was denied. Please enable camera access in your browser settings to use this feature.",
  },
  es: {
    permissionNeeded: "Se necesita acceso a la cámara para analizar tu problema",
    requestPermission: "Permitir Acceso a la Cámara",
    analyzeButton: "Analizar con AssisteMae",
    analyzing: "Analizando...",
    permissionDenied:
      "Se denegó el acceso a la cámara. Habilita el acceso a la cámara en la configuración de tu navegador para usar esta función.",
  },
}

export default function Camera({ onCapture, language }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt")
  const [isCapturing, setIsCapturing] = useState(false)

  const t = translations[language]

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setPermissionState("granted")
    } catch (error) {
      console.error("Error accessing camera:", error)
      setPermissionState("denied")
    }
  }

  useEffect(() => {
    // Check if permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state as "prompt" | "granted" | "denied")

          if (permissionStatus.state === "granted") {
            requestCameraAccess()
          }

          // Listen for permission changes
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state as "prompt" | "granted" | "denied")

            if (permissionStatus.state === "granted") {
              requestCameraAccess()
            }
          }
        })
        .catch((error) => {
          console.error("Error checking camera permission:", error)
          // If we can't check permissions, assume we need to request them
          setPermissionState("prompt")
        })
    } else {
      // If Permissions API is not available, try to access the camera directly
      requestCameraAccess()
    }

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const captureFrame = async () => {
    if (!videoRef.current || permissionState !== "granted") return

    try {
      setIsCapturing(true)

      const canvas = document.createElement("canvas")
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob)
        }
        setIsCapturing(false)
      }, "image/jpeg")
    } catch (error) {
      console.error("Error capturing frame:", error)
      setIsCapturing(false)
    }
  }

  // Render based on permission state
  if (permissionState === "prompt") {
    return (
      <div className="mb-6 text-center p-6 bg-indigo-50 rounded-lg">
        <p className="mb-4">{t.permissionNeeded}</p>
        <button
          onClick={requestCameraAccess}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.requestPermission}
        </button>
      </div>
    )
  }

  if (permissionState === "denied") {
    return (
      <div className="mb-6 text-center p-6 bg-indigo-50 rounded-lg">
        <p>{t.permissionDenied}</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg shadow-lg" />
      <button
        onClick={captureFrame}
        disabled={isCapturing}
        className="mt-4 w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isCapturing ? t.analyzing : t.analyzeButton}
      </button>
    </div>
  )
}
