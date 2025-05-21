"use client"

import { useState } from "react"

interface StripeDonationProps {
  language: "en" | "es"
}

const translations = {
  en: {
    donate: "Donate with Card",
    donating: "Processing...",
    donationSuccess: "Thank you for your donation!",
    donationError: "Payment failed. Please try again.",
    amount: "Amount",
    currency: "USD",
    submit: "Donate",
  },
  es: {
    donate: "Donar con Tarjeta",
    donating: "Procesando...",
    donationSuccess: "¡Gracias por tu donación!",
    donationError: "El pago falló. Por favor, inténtalo de nuevo.",
    amount: "Cantidad",
    currency: "USD",
    submit: "Donar",
  },
}

// Predefined donation amounts
const donationAmounts = [5, 10, 25, 50]

export default function StripeDonation({ language }: StripeDonationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(10)
  const [customAmount, setCustomAmount] = useState("")

  const t = translations[language]

  const handleDonation = async () => {
    try {
      setIsProcessing(true)
      setStatus(null)

      // Calculate the final amount to charge
      const amount = customAmount ? Number.parseFloat(customAmount) : selectedAmount

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount")
      }

      // Create a checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: t.currency,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionId, url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Donation error:", error)
      setStatus(t.donationError)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{t.donate}</h3>

      <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-4">
        {donationAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount)
              setCustomAmount("")
            }}
            className={`py-2 px-4 rounded-md ${
              selectedAmount === amount && !customAmount
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
          {t.amount}
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="custom-amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setSelectedAmount(0)
            }}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="Other amount"
            min="1"
            step="0.01"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{t.currency}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDonation}
        disabled={isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isProcessing ? t.donating : t.submit}
      </button>

      {status && <div className="mt-2 text-center text-sm text-red-600">{status}</div>}
    </div>
  )
}
