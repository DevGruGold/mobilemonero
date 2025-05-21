import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { observation, language = "en" } = await req.json()

    if (!observation) {
      return NextResponse.json({
        title: language === "en" ? "Assistance Session" : "Sesión de Asistencia",
      })
    }

    // Update to use Gemini 2.5 Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const title = response.text().trim()

    // Limit title length and remove quotes if present
    const cleanTitle = title.replace(/^["']|["']$/g, "").substring(0, 50)

    return NextResponse.json({
      title: cleanTitle || (language === "en" ? "Assistance Session" : "Sesión de Asistencia"),
    })
  } catch (error) {
    console.error("Error generating title:", error)
    const { language = "en" } = req.json ? await req.json() : { language: "en" }

    return NextResponse.json({
      title: language === "en" ? "Assistance Session" : "Sesión de Asistencia",
    })
  }
}
