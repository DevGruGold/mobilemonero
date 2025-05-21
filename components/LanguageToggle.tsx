"use client"

interface LanguageToggleProps {
  language: "en" | "es"
  onToggle: (language: "en" | "es") => void
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      <span className={`mr-2 ${language === "en" ? "font-bold" : "text-gray-500"}`}>English</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={language === "es"}
          onChange={() => onToggle(language === "en" ? "es" : "en")}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
      <span className={`ml-2 ${language === "es" ? "font-bold" : "text-gray-500"}`}>Español</span>
    </div>
  )
}
