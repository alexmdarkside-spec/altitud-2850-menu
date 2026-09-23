import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import menuData from "@/data/menu.json";

// Verifica que exista la API Key
const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      console.error("CRÍTICO: No se encontró GEMINI_API_KEY en .env.local");
      return NextResponse.json(
        { error: "Falta la clave API de Gemini." },
        { status: 500 }
      );
    }

    const { ocasion, preferencia } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      Eres el Sommelier y Chef Ejecutivo de 'Altitud 2850', un restaurante de Alta Cocina Neotradicional Quiteña.
      Tu objetivo es sugerir el mejor plato del menú y su maridaje perfecto basado en las preferencias del cliente.
      
      Menú disponible:
      ${JSON.stringify(menuData, null, 2)}

      Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto:
      {
        "platoRecomendadoId": "plate-01",
        "nombrePlato": "Nombre del plato",
        "explicacion": "Breve explicación gourmet (máximo 3 oraciones) de por qué este plato y su maridaje encajan con la ocasión y preferencia.",
        "bebidaSugerida": "Nombre de la bebida ideal para maridar"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Ocasión: ${ocasion || "Cualquiera"}. Preferencias de sabor: ${preferencia || "Sin preferencia"}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Respuesta vacía de Gemini");
    }

    const data = JSON.parse(resultText);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error detallado en API pairing:", error?.message || error);
    return NextResponse.json(
      { error: "No se pudo obtener la recomendación de maridaje." },
      { status: 500 }
    );
  }
}