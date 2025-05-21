"use client"

import Web3Button from "./Web3Button"
import StripeDonation from "./StripeDonation"

interface DonationOptionsProps {
  language: "en" | "es"
}

const translations = {
  en: {
    title: "Support AssisteMae",
    subtitle: "Your donation helps us continue to improve and provide better assistance.",
  },
  es: {
    title: "Apoya a AssisteMae",
    subtitle: "Tu donación nos ayuda a seguir mejorando y brindando mejor asistencia.",
  },
}

export default function DonationOptions({ language }: DonationOptionsProps) {
  const t = translations[language]

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold text-center mb-2">{t.title}</h3>
      <p className="text-gray-600 text-center mb-4">{t.subtitle}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Web3Button language={language} />
        <StripeDonation language={language} />
      </div>
    </div>
  )
}
