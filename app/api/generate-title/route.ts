import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Check if API key exists
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in environment variables")
}

const genAI = new GoogleGenerativeAI(apiKey || "")

export async function POST(req: NextRequest) {
  try {
    // Check if API key is available
    if (!apiKey) {
      return NextResponse.json(
        {
          title: "Assistance Session",
        },
        { status: 500 },
      )
    }

    const { observation, language = "en" } = await req.json()

    if (!observation) {
      return NextResponse.json({
        title: language === "en" ? "Assistance Session" : "Sesión de Asistencia",
      })
    }

    // Use the model that was working before
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt =
      language === "en"
        ? `
        Based on this observation of an image: "${observation}"
        
        Generate a very short, concise title (3-5 words maximum) that summarizes the main subject or problem shown.
        Return only the title text, nothing else.
        Respond in English.
      `
        : `
        Basado en esta observación de una imagen: "${observation}"
        
        Genera un título muy corto y conciso (máximo 3-5 palabras) que resuma el tema principal o problema mostrado.
        Devuelve solo el texto del título, nada más.
        Responde en español.
      `

    console.log("Sending request to Gemini API with model: gemini-1.5-flash")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const title = response.text().trim()
    console.log("Received response from Gemini API")

    // Limit title length and remove quotes if present
    const cleanTitle = title.replace(/^["']|["']$/g, "").substring(0, 50)

    return NextResponse.json({
      title: cleanTitle || (language === "en" ? "Assistance Session" : "Sesión de Asistencia"),
    })
  } catch (error) {
    console.error("Error generating title:", error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    let language = "en"
    try {
      const { language: reqLanguage = "en" } = await req.json()
      language = reqLanguage
    } catch {
      // If we can't get the language, default to English
    }

    return NextResponse.json({
      title: language === "en" ? "Assistance Session" : "Sesión de Asistencia",
    })
  }
}
