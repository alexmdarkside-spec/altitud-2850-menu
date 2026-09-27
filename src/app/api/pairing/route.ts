import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import menuData from "../../../data/menu.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Modelos activos
const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash"];

async function callGeminiWithRetry(prompt: string) {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response?.text) return response.text;
      } catch (err: any) {
        if (err?.status === 503 || String(err).includes("503")) {
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ocasion = body.ocasion || body.occasion || "Experiencia Local";
    const alergias = Array.isArray(body.alergias)
      ? body.alergias
      : Array.isArray(body.allergies)
      ? body.allergies
      : [];

    const paso = body.paso || 1;
    const seleccionActual = body.seleccionActual || { entrada: null, fuerte: null, postre: null };

    const menuFiltrado = menuData.filter((plato: any) => {
      if (!plato.alergias || !Array.isArray(plato.alergias)) return true;
      return !plato.alergias.some((alergia: string) =>
        alergias.includes(alergia)
      );
    });

    let prompt = "";
    let responseType = "";

    if (paso === 4) {
      // PASO 4: REVELACIÓN FINAL
      responseType = "final";
      prompt = `
        Eres el Sommelier Ejecutivo de Altitud 2850.
        Ocasión: ${ocasion}
        Alergias: ${JSON.stringify(alergias)}
        Selección Completa del Cliente:
        - Entrada: ${seleccionActual.entrada}
        - Plato Fuerte: ${seleccionActual.fuerte}
        - Postre: ${seleccionActual.postre}

        Crea el maridaje final. Devuelve ÚNICAMENTE un JSON:
        {
          "secuenciaIds": [${seleccionActual.entrada}, ${seleccionActual.fuerte}, ${seleccionActual.postre}],
          "maridajeSugerido": "Nombre de la bebida o vino",
          "notaCataSommelier": "Explicación breve de 2 oraciones sobre por qué este maridaje potencia los 3 platos elegidos"
        }
      `;
    } else {
      // PASOS 1, 2, 3: RECOMENDADOR PROGRESIVO
      responseType = "partial";

      let tiempoActual = "";
      if (paso === 1) tiempoActual = "Entrada";
      else if (paso === 2) tiempoActual = "Plato Fuerte";
      else if (paso === 3) tiempoActual = "Postre";

      const platosDisponibles = menuFiltrado.filter((p: any) => p.categoria === tiempoActual);

      prompt = `
        Eres el Sommelier Ejecutivo de Altitud 2850.
        Ocasión: ${ocasion}
        Alergias: ${JSON.stringify(alergias)}
        Selección Actual hasta ahora: ${JSON.stringify(seleccionActual)}

        El cliente está en el paso ${paso}. Debe elegir ahora el tiempo: ${tiempoActual}.
        De los siguientes platos disponibles: ${JSON.stringify(platosDisponibles)},
        selecciona exactamente las 2 mejores opciones que armonicen con la ocasión y los platos ya elegidos previamente.

        Devuelve ÚNICAMENTE un JSON:
        {
          "paso": ${paso},
          "tiempo": "${tiempoActual}",
          "opcionesSugeridas": [
            { "id": "id_plato_1", "razon": "Por qué es buena opción" },
            { "id": "id_plato_2", "razon": "Por qué es buena opción" }
          ]
        }
      `;
    }

    const rawText = await callGeminiWithRetry(prompt);

    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }

    // Fallbacks
    if (responseType === "final") {
      return NextResponse.json({
        secuenciaIds: [seleccionActual.entrada, seleccionActual.fuerte, seleccionActual.postre],
        maridajeSugerido: "Maridaje de la Casa con Vinos Andinos",
        notaCataSommelier: "Selección ejecutiva equilibrada para resaltar las notas Neotradicionales del menú.",
      });
    } else {
      return NextResponse.json({
        paso: paso,
        tiempo: "Entrada",
        opcionesSugeridas: []
      });
    }
  } catch (error: any) {
    console.error("Error en /api/pairing:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
