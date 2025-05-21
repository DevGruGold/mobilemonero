interface ModelInfoProps {
  language: "en" | "es"
}

const translations = {
  en: {
    poweredBy: "Powered by Gemini 1.5 Flash",
  },
  es: {
    poweredBy: "Impulsado por Gemini 1.5 Flash",
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
