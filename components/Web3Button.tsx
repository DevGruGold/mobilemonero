"use client"

import { useState } from "react"
import { ethers } from "ethers"

interface Web3ButtonProps {
  language: "en" | "es"
}

const translations = {
  en: {
    connect: "Connect Wallet",
    connected: "Connected",
    donate: "Donate with Crypto",
    donating: "Donating...",
    donationSuccess: "Thank you for your donation!",
    donationError: "Donation failed. Please try again.",
    notSupported: "Web3 not supported in your browser",
  },
  es: {
    connect: "Conectar Billetera",
    connected: "Conectado",
    donate: "Donar con Cripto",
    donating: "Donando...",
    donationSuccess: "¡Gracias por tu donación!",
    donationError: "La donación falló. Por favor, inténtalo de nuevo.",
    notSupported: "Web3 no es compatible con tu navegador",
  },
}

export default function Web3Button({ language }: Web3ButtonProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isDonating, setIsDonating] = useState(false)
  const [donationStatus, setDonationStatus] = useState<string | null>(null)
  const [isWeb3Supported, setIsWeb3Supported] = useState(true)

  const t = translations[language]

  // Donation recipient address
  const donationAddress = "0x7099F848b614d0d510BeAB53b3bE409cbd720dF5"

  async function connectWallet() {
    try {
      // Check if ethereum is available in the window object
      if (typeof window.ethereum === "undefined") {
        setIsWeb3Supported(false)
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        setAddress(accounts[0])

        // Listen for account changes
        window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAddress(newAccounts[0])
          } else {
            setAddress(null)
          }
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  async function donate() {
    if (!address) {
      await connectWallet()
      return
    }

    try {
      setIsDonating(true)
      setDonationStatus(null)

      // Create a provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      // Default donation amount (0.01 ETH)
      const donationAmount = ethers.utils.parseEther("0.01")

      // Send transaction
      const tx = await signer.sendTransaction({
        to: donationAddress,
        value: donationAmount,
      })

      // Wait for transaction to be mined
      await tx.wait()

      setDonationStatus(t.donationSuccess)
      console.log("Donation successful:", tx.hash)
    } catch (error) {
      console.error("Donation failed:", error)
      setDonationStatus(t.donationError)
    } finally {
      setIsDonating(false)
    }
  }

  if (!isWeb3Supported) {
    return (
      <div className="mt-6 space-y-2">
        <div className="text-center text-sm text-red-600 mb-2">{t.notSupported}</div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-2">
      {!address ? (
        <button
          onClick={connectWallet}
          className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.connect}
        </button>
      ) : (
        <>
          <div className="text-center text-sm text-gray-600 mb-2">
            {t.connected}: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={donate}
            disabled={isDonating}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isDonating ? t.donating : t.donate}
          </button>
          {donationStatus && (
            <div
              className={`text-center text-sm mt-2 ${donationStatus === t.donationSuccess ? "text-green-600" : "text-red-600"}`}
            >
              {donationStatus}
            </div>
          )}
        </>
      )}
    </div>
  )
}
