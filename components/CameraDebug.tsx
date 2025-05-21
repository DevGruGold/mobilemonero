"use client"

import { useState, useEffect } from "react"

export default function CameraDebug() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function getDevices() {
      try {
        // First request permission to ensure we get accurate device info
        await navigator.mediaDevices.getUserMedia({ video: true })

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setDevices(videoDevices)
      } catch (err) {
        console.error("Error getting devices:", err)
      }
    }

    if (showDebug) {
      getDevices()
    }
  }, [showDebug])

  if (!showDebug) {
    return (
      <button onClick={() => setShowDebug(true)} className="text-xs text-gray-500 underline mt-2">
        Camera not working? Click for debug info
      </button>
    )
  }

  return (
    <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
      <h4 className="font-bold mb-2">Camera Debug Info:</h4>
      {devices.length === 0 ? (
        <p>No video devices detected. Please check your camera permissions.</p>
      ) : (
        <>
          <p>Available cameras ({devices.length}):</p>
          <ul className="list-disc pl-5 mt-1">
            {devices.map((device, index) => (
              <li key={index}>{device.label || `Camera ${index + 1}`}</li>
            ))}
          </ul>
        </>
      )}
      <button onClick={() => setShowDebug(false)} className="text-indigo-600 underline mt-2">
        Hide debug info
      </button>
    </div>
  )
}
