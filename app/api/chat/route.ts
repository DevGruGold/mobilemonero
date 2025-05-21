import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { messages, context, language = "en" } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Update to use Gemini 2.5 Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Error in chat API:", error)
    const { language = "en" } = req.json ? await req.json() : { language: "en" }

    const errorMessage =
      language === "en"
        ? "I'm having trouble connecting. Could you try again?"
        : "Estoy teniendo problemas para conectarme. ¿Podrías intentarlo de nuevo?"

    return NextResponse.json({ error: "Failed to process request", response: errorMessage }, { status: 500 })
  }
}
