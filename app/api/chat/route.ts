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
          error: "API key is not configured",
          response: "System configuration error. Please try again later.",
        },
        { status: 500 },
      )
    }

    const { messages, context, language = "en" } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Use the model that was working before
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Format the conversation history for the model
    const formattedMessages = messages
      .map((msg) => {
        return `${msg.role === "user" ? "User" : "AssisteMae"}: ${msg.content}`
      })
      .join("\n\n")

    // Create the prompt with context, conversation history, and language preference
    const prompt =
      language === "en"
        ? `
        You are AssisteMae, a helpful AI assistant that specializes in providing practical assistance.
        
        Context about what you observed in the user's image:
        ${context}
        
        Conversation history:
        ${formattedMessages}
        
        Respond as AssisteMae. Be helpful, friendly, and concise. Focus on solving the user's problem.
        Respond in English.
      `
        : `
        Eres AssisteMae, un asistente de IA útil que se especializa en proporcionar asistencia práctica.
        
        Contexto sobre lo que observaste en la imagen del usuario:
        ${context}
        
        Historial de conversación:
        ${formattedMessages}
        
        Responde como AssisteMae. Sé útil, amigable y conciso. Concéntrate en resolver el problema del usuario.
        Responde en español.
      `

    console.log("Sending request to Gemini API with model: gemini-1.5-flash")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()
    console.log("Received response from Gemini API")

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Error in chat API:", error)
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

    const errorMessage =
      language === "en"
        ? "I'm having trouble connecting. Could you try again?"
        : "Estoy teniendo problemas para conectarme. ¿Podrías intentarlo de nuevo?"

    return NextResponse.json({ error: "Failed to process request", response: errorMessage }, { status: 500 })
  }
}
