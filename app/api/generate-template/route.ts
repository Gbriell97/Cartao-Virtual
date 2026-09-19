import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { palette, profession, name, style, forceDark } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const prompt = `Você é um designer premiado especializado em identidade visual para cartões de visita digitais. Seu trabalho é ousado e memorável — NUNCA use gradientes genéricos pré-fabricados.

Cliente: "${name}" | Ramo: "${profession}"
${palette?.length ? `CORES EXTRAÍDAS DA LOGO (base obrigatória da identidade — o template deve conversar com essas cores): ${palette.join(", ")}.` : "Sem logo — invente uma paleta surpreendente e adequada ao ramo."}
${style ? `Pedido extra do cliente (opcional — aplique SOMENTE se fizer sentido com a logo e o ramo): "${style}".` : ""}

Diretrizes:
- gradiente: 3 cores com transição rica, nunca cinzas genéricos
- mood, layoutType, decoration: coerentes com o ramo e com a identidade da logo
- icon: UM ícone da lista que represente o ramo (vira marca d'água do cartão)
- customDetails: traduza o estilo em decisões concretas

Responda APENAS com JSON válido (sem markdown):
{
  "name": "nome criativo e curto",
  "layoutType": "modern | professional | classic | luxury | glass-pro | glass-frost | glass-dark | glass | minimal | tech | dark | bold | elegant | health | beauty | nature",
  "gradient": ["#hex1", "#hex2", "#hex3"],
  "gradientAngle": número 90-170,
  "primaryColor": "#hex",
  "accentColor": "#hex",
  "mood": "dark | light",
  "decoration": "pink | blue | gold | purple | green | cyan | yellow | executive | glass-pro | glass-frost | glass-dark | glass | minimal",
  "icon": "sparkles | scissors | camera | palette | dumbbell | heart-pulse | leaf | briefcase | music | code | coffee | flower | wrench | graduation | chef | car",
  "customDetails": {
    "borderRadius": "sharp | soft | round",
    "fontMood": "bold | elegant | minimal | playful",
    "uppercase": true | false
  },
  "primaryColorOpacity": número 10-95,
  "backgroundOverlay": número 0-60,
  "backgroundBlur": número 0-12
}`;

    /* Modelo principal + reserva, com retry em caso de 503. */
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    const MAX_ATTEMPTS = 4;

    let data: unknown = null;
    let lastError = "";

    for (let attempt = 0; attempt < MAX_ATTEMPTS && !data; attempt++) {
      const model = models[Math.min(attempt, models.length - 1)];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.95,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        data = await response.json();
        break;
      }

      lastError = await response.text();

      /* Só espera antes de tentar de novo se ainda há tentativas. */
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1500 * (attempt + 1))
        );
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: "IA sobrecarregada no momento. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }

    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ json: JSON.parse(text) });
  } catch (error) {
    console.error("Erro ao gerar template:", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o template." },
      { status: 500 }
    );
  }
}