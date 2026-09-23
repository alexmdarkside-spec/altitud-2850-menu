import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { occasion, preference } = body;

    if (!occasion || !preference) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: occasion y preference" },
        { status: 400 }
      );
    }

    // Simulamos una recomendación de Sommelier IA basada en los inputs
    const recommendations = {
      "Cita": {
        "Dulce": "Un Champagne Rosé bien frío, que complemente la dulzura con burbujas elegantes.",
        "Salado": "Un vino blanco Albariño, fresco y mineral, ideal para abrir el apetito.",
        "Picante": "Un Riesling semi-seco, cuya dulzura natural equilibra la intensidad del picante.",
        "Fuerte": "Un Cabernet Sauvignon con cuerpo, para una velada intensa y sofisticada."
      },
      "Negocios": {
        "Dulce": "Un Porto blanco, sofisticado y moderadamente dulce, para cerrar un acuerdo.",
        "Salado": "Un Chardonnay con paso por barrica, estructurado y profesional.",
        "Picante": "Un Pinot Noir joven, ligero pero con carácter, que no opaque la conversación.",
        "Fuerte": "Un Tempranillo de reserva, clásico, serio y con presencia."
      },
      "Celebración": {
        "Dulce": "Un Asti Spumante, vibrante y dulce, para brindar la alegría del momento.",
        "Salado": "Un Prosecco Superiore, ligero y festivo, perfecto para el brindis inicial.",
        "Picante": "Un Gewürztraminer, aromático y exótico, para una celebración diferente.",
        "Fuerte": "Un Malbec Argentino, robusto y generoso, para celebrar en grande."
      },
      "Familiar": {
        "Dulce": "Un Moscato d'Asti, suave y agradable para todas las edades.",
        "Salado": "Un Sauvignon Blanc cítrico, refrescante y versátil para platos variados.",
        "Picante": "Un Rosé de Provence, equilibrado y fácil de beber.",
        "Fuerte": "Un Merlot suave, con notas a frutas rojas, acogedor y familiar."
      }
    };

    const category = recommendations[occasion as keyof typeof recommendations];
    const recommendation = category ? category[preference as keyof typeof category] : "Una selección de la casa que se adapta a su paladar.";

    return NextResponse.json({
      recommendation: recommendation,
      sommelier: "IA Altitud 2850"
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el maridaje" },
      { status: 500 }
    );
  }
}
