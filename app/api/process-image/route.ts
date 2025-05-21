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
          observation: "System configuration error",
          question: "Please try again later",
        },
        { status: 500 },
      )
    }

    const formData = await req.formData()
    const image = formData.get("image") as Blob | null
    const language = (formData.get("language") as string) || "en"
    const isFollowUp = formData.get("isFollowUp") === "true"

    if (!image) {
      return NextResponse.json(
        {
          error: "Missing image in form data",
          observation: language === "en" ? "No image provided" : "No se proporcionó ninguna imagen",
          question: language === "en" ? "Can you try again?" : "¿Puedes intentarlo de nuevo?",
        },
        { status: 400 },
      )
    }

    // Let's try the model that was working before
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Updated prompt to include language preference and handle follow-up images
    const prompt = isFollowUp
      ? language === "en"
        ? `
          This is a follow-up image the user has shared during our conversation.
          Analyze this new image and provide:
          1. A brief description of what you see in this new image
          2. How it relates to our previous conversation
          3. A helpful response or question based on this new information
          
          IMPORTANT: Your response must be valid JSON with the following structure:
          {
            "observation": "Your description of what you see in the image",
            "question": "Your follow-up question or helpful response"
          }
          
          Do not include any text outside of this JSON structure.
          Respond in English.
        `
        : `
          Esta es una imagen de seguimiento que el usuario ha compartido durante nuestra conversación.
          Analiza esta nueva imagen y proporciona:
          1. Una breve descripción de lo que ves en esta nueva imagen
          2. Cómo se relaciona con nuestra conversación anterior
          3. Una respuesta o pregunta útil basada en esta nueva información
          
          IMPORTANTE: Tu respuesta debe ser un JSON válido con la siguiente estructura:
          {
            "observation": "Tu descripción de lo que ves en la imagen",
            "question": "Tu pregunta de seguimiento o respuesta útil"
          }
          
          No incluyas ningún texto fuera de esta estructura JSON.
          Responde en español.
        `
      : language === "en"
        ? `
        Analyze this image and provide a brief description of what you see. 
        Then, ask how you can help based on the content of the image.
        
        IMPORTANT: Your response must be valid JSON with the following structure:
        {
          "observation": "Your description of what you see in the image",
          "question": "Your question about how you can help"
        }
        
        Do not include any text outside of this JSON structure.
        Respond in English.
      `
        : `
        Analiza esta imagen y proporciona una breve descripción de lo que ves.
        Luego, pregunta cómo puedes ayudar basándote en el contenido de la imagen.
        
        IMPORTANTE: Tu respuesta debe ser un JSON válido con la siguiente estructura:
        {
          "observation": "Tu descripción de lo que ves en la imagen",
          "question": "Tu pregunta sobre cómo puedes ayudar"
        }
        
        No incluyas ningún texto fuera de esta estructura JSON.
        Responde en español.
      `

    // Convert the blob to base64
    const buffer = Buffer.from(await image.arrayBuffer())
    const base64Image = buffer.toString("base64")

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type || "image/jpeg",
        },
      },
    ]

    console.log("Sending request to Gemini API with model: gemini-1.5-flash")
    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const responseText = response.text()
    console.log("Received response from Gemini API")

    try {
      // Extract JSON from the response text (in case there's any text before or after the JSON)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : responseText

      const parsedResponse = JSON.parse(jsonString)
      return NextResponse.json(parsedResponse)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw response:", responseText)

      // If parsing fails, create a structured response manually
      return NextResponse.json({
        observation: language === "en" ? "I can see the items in your image" : "Puedo ver los elementos en tu imagen",
        question:
          language === "en"
            ? "How can I help you with what I'm seeing?"
            : "¿Cómo puedo ayudarte con lo que estoy viendo?",
      })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Try to extract language from the request
    let language = "en"
    try {
      const formData = await req.formData()
      language = (formData.get("language") as string) || "en"
    } catch {
      // If we can't get the form data, default to English
    }

    return NextResponse.json({
      observation: language === "en" ? "I had trouble processing your image" : "Tuve problemas procesando tu imagen",
      question:
        language === "en"
          ? "Could you try again with a clearer image?"
          : "¿Podrías intentarlo de nuevo con una imagen más clara?",
    })
  }
}
