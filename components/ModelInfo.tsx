interface ModelInfoProps {
  language: "en" | "es"
}

const translations = {
  en: {
    poweredBy: "Powered by Gemini 2.5 Pro",
  },
  es: {
    poweredBy: "Impulsado por Gemini 2.5 Pro",
  },
}

export default function ModelInfo({ language }: ModelInfoProps) {
  const t = translations[language]

  return (
    <div className="text-center text-xs text-gray-500 mt-2">
      <p>{t.poweredBy}</p>
    </div>
  )
}
