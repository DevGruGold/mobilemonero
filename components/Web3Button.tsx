"use client"

import { useState } from "react"
import Web3Modal from "web3modal"
import { ethers } from "ethers"

interface Web3ButtonProps {
  language: "en" | "es"
}

const translations = {
  en: {
    connect: "Connect Wallet",
    connected: "Connected",
    donate: "Donate to AssisteMae",
    donating: "Donating...",
    donationSuccess: "Thank you for your donation!",
    donationError: "Donation failed. Please try again.",
  },
  es: {
    connect: "Conectar Billetera",
    connected: "Conectado",
    donate: "Donar a AssisteMae",
    donating: "Donando...",
    donationSuccess: "¡Gracias por tu donación!",
    donationError: "La donación falló. Por favor, inténtalo de nuevo.",
  },
}

export default function Web3Button({ language }: Web3ButtonProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [isDonating, setIsDonating] = useState(false)
  const [donationStatus, setDonationStatus] = useState<string | null>(null)

  const t = translations[language]

  // Donation recipient address
  const donationAddress = "0x7099F848b614d0d510BeAB53b3bE409cbd720dF5"

  async function connectWallet() {
    try {
      const providerOptions = {
        walletconnect: {
          package: require("@walletconnect/web3-provider").default,
          options: {
            infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Default Infura ID
          },
        },
      }

      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        providerOptions,
      })

      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      setAddress(address)
      setProvider(provider)

      // Subscribe to accounts change
      connection.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
        } else {
          setAddress(null)
          setProvider(null)
        }
      })

      // Subscribe to chainId change
      connection.on("chainChanged", () => {
        window.location.reload()
      })

      // Subscribe to provider disconnection
      connection.on("disconnect", () => {
        setAddress(null)
        setProvider(null)
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  async function donate() {
    if (!provider || !address) {
      await connectWallet()
      return
    }

    try {
      setIsDonating(true)
      setDonationStatus(null)

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
