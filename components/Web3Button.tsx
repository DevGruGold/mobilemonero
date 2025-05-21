'use client'

import { useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

export default function Web3Button() {
  const [address, setAddress] = useState<string | null>(null)

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      setAddress(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={connectWallet}
        className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  )
}
